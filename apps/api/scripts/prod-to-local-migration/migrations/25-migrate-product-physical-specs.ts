import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProductPhysicalSpecs() {
  const logger = new MigrationLogger('product-physical-specs');

  try {
    logger.log('📊 Contando especificaciones físicas en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_physical_specs
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de especificaciones a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay especificaciones físicas para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo especificaciones de producción...');
    const specs = await productionConnection.query(`
      SELECT * FROM shop.product_physical_specs ORDER BY created_at ASC
    `);

    logger.log(`✅ Especificaciones leídas: ${specs.length}\n`);
    logger.log('💾 Migrando especificaciones a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, spec] of specs.entries()) {
      try {
        const columns = Object.keys(spec);
        const values = Object.values(spec);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_physical_specs (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando especificación ${spec.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de especificaciones físicas', error);
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
      await migrateProductPhysicalSpecs();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
