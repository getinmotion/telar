import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateProductProduction() {
  const logger = new MigrationLogger('product-production');

  try {
    logger.log('📊 Contando información de producción en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_production
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de registros a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay información de producción para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo información de producción...');
    const productions = await productionConnection.query(`
      SELECT * FROM shop.product_production ORDER BY created_at ASC
    `);

    logger.log(`✅ Registros leídos: ${productions.length}\n`);
    logger.log('💾 Migrando información a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, production] of productions.entries()) {
      try {
        const columns = Object.keys(production);
        const values = serializeRow(production);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_production (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando producción ${production.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de información de producción', error);
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
      await migrateProductProduction();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
