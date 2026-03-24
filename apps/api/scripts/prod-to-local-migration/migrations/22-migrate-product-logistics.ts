import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateProductLogistics() {
  const logger = new MigrationLogger('product-logistics');

  try {
    logger.log('📊 Contando logística de productos en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_logistics
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de registros de logística a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay registros de logística para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo logística de producción...');
    const logistics = await productionConnection.query(`
      SELECT * FROM shop.product_logistics ORDER BY created_at ASC
    `);

    logger.log(`✅ Registros leídos: ${logistics.length}\n`);
    logger.log('💾 Migrando logística a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, logistic] of logistics.entries()) {
      try {
        const columns = Object.keys(logistic);
        const values = serializeRow(logistic);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_logistics (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando logística ${logistic.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de logística', error);
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
      await migrateProductLogistics();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
