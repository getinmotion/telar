import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateProductCategories() {
  const logger = new MigrationLogger('product-categories');

  try {
    logger.log('📊 Contando categorías de productos en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_categories
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de categorías a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay categorías para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo categorías de producción...');
    const categories = await productionConnection.query(`
      SELECT * FROM shop.product_categories ORDER BY created_at ASC
    `);

    logger.log(`✅ Categorías leídas: ${categories.length}\n`);
    logger.log('💾 Migrando categorías a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, category] of categories.entries()) {
      try {
        const columns = Object.keys(category);
        const values = serializeRow(category);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_categories (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando categoría ${category.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de categorías', error);
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
      await migrateProductCategories();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
