import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProductCareTags() {
  const logger = new MigrationLogger('product-care-tags');

  try {
    logger.log('📊 Contando etiquetas de cuidado en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_care_tags
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de etiquetas a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay etiquetas de cuidado para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo etiquetas de producción...');
    const tags = await productionConnection.query(`
      SELECT * FROM shop.product_care_tags ORDER BY created_at ASC
    `);

    logger.log(`✅ Etiquetas leídas: ${tags.length}\n`);
    logger.log('💾 Migrando etiquetas a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, tag] of tags.entries()) {
      try {
        const columns = Object.keys(tag);
        const values = Object.values(tag);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_care_tags (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando etiqueta ${tag.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de etiquetas de cuidado', error);
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
      await migrateProductCareTags();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
