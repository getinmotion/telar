import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProductMedia() {
  const logger = new MigrationLogger('product-media');

  try {
    logger.log('📊 Contando medios de productos en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_media
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de medios a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay medios de productos para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo medios de producción...');
    const media = await productionConnection.query(`
      SELECT * FROM shop.product_media ORDER BY created_at ASC
    `);

    logger.log(`✅ Medios leídos: ${media.length}\n`);
    logger.log('💾 Migrando medios a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, item] of media.entries()) {
      try {
        const columns = Object.keys(item);
        const values = Object.values(item);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_media (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando medio ${item.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de medios', error);
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
      await migrateProductMedia();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
