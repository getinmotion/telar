import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProducts() {
  const logger = new MigrationLogger('products');

  try {
    logger.log('📊 Contando productos en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.products
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de productos a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay productos para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo productos de producción...');
    const products = await productionConnection.query(`
      SELECT * FROM shop.products ORDER BY created_at ASC
    `);

    logger.log(`✅ Productos leídos: ${products.length}\n`);
    logger.log('💾 Migrando productos a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, product] of products.entries()) {
      try {
        const columns = Object.keys(product);
        const values = Object.values(product);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.products (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando producto ${product.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de productos', error);
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
      await migrateProducts();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
