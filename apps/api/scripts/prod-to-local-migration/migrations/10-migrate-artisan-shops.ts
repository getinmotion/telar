import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateArtisanShops() {
  const logger = new MigrationLogger('artisan-shops');

  try {
    logger.log('📊 Contando tiendas artesanales en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.artisan_shops
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de tiendas a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay tiendas para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo tiendas de producción...');
    const shops = await productionConnection.query(`
      SELECT * FROM shop.artisan_shops ORDER BY created_at ASC
    `);

    logger.log(`✅ Tiendas leídas: ${shops.length}\n`);
    logger.log('💾 Migrando tiendas a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, shop] of shops.entries()) {
      try {
        // Copiar datos tal cual sin transformaciones
        const columns = Object.keys(shop);
        const values = serializeRow(shop);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.artisan_shops (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando tienda ${shop.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de tiendas', error);
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
      await migrateArtisanShops();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
