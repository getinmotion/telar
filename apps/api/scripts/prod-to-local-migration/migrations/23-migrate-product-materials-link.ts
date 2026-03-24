import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateProductMaterialsLink() {
  const logger = new MigrationLogger('product-materials-link');

  try {
    logger.log('📊 Contando vínculos de materiales en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_materials_link
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de vínculos a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay vínculos de materiales para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo vínculos de producción...');
    const links = await productionConnection.query(`
      SELECT * FROM shop.product_materials_link ORDER BY product_id ASC
    `);

    logger.log(`✅ Vínculos leídos: ${links.length}\n`);
    logger.log('💾 Migrando vínculos a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, link] of links.entries()) {
      try {
        const columns = Object.keys(link);
        const values = serializeRow(link);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_materials_link (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (product_id, material_id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando vínculo ${link.product_id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de vínculos de materiales', error);
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
      await migrateProductMaterialsLink();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
