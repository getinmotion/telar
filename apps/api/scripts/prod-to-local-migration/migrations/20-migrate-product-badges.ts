import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProductBadges() {
  const logger = new MigrationLogger('product-badges');

  try {
    logger.log('📊 Contando insignias de productos en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_badges
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de insignias a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay insignias para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo insignias de producción...');
    const badges = await productionConnection.query(`
      SELECT * FROM shop.product_badges ORDER BY created_at ASC
    `);

    logger.log(`✅ Insignias leídas: ${badges.length}\n`);
    logger.log('💾 Migrando insignias a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, badge] of badges.entries()) {
      try {
        const columns = Object.keys(badge);
        const values = Object.values(badge);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_badges (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando insignia ${badge.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de insignias', error);
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
      await migrateProductBadges();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
