import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateProductsCore() {
  const logger = new MigrationLogger('products-core');

  try {
    logger.log('📊 Contando productos core en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.products_core
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de productos core a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay productos core para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo productos core de producción...');
    const productsCore = await productionConnection.query(`
      SELECT * FROM shop.products_core ORDER BY created_at ASC
    `);

    logger.log(`✅ Productos core leídos: ${productsCore.length}\n`);
    logger.log('💾 Migrando productos core a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, productCore] of productsCore.entries()) {
      try {
        const columns = Object.keys(productCore);
        const values = serializeRow(productCore);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.products_core (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando producto core ${productCore.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de productos core', error);
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
      await migrateProductsCore();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
