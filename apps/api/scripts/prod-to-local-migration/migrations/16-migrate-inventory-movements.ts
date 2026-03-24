import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateInventoryMovements() {
  const logger = new MigrationLogger('inventory-movements');

  try {
    logger.log('📊 Contando movimientos de inventario en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM public.inventory_movements
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de movimientos a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay movimientos de inventario para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo movimientos de producción...');
    const movements = await productionConnection.query(`
      SELECT * FROM public.inventory_movements ORDER BY created_at ASC
    `);

    logger.log(`✅ Movimientos leídos: ${movements.length}\n`);
    logger.log('💾 Migrando movimientos a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, movement] of movements.entries()) {
      try {
        const columns = Object.keys(movement);
        const values = serializeRow(movement);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO public.inventory_movements (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando movimiento ${movement.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de movimientos', error);
    const summary = { success: 0, failed: 0, total: 0 };
    logger.finish(summary);
    throw error;
  }
}

// Ejecutar standalone
if (require.main === module) {
  (async () => {
    try {
      await initConnections();
      await migrateInventoryMovements();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
