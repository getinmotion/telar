import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProductArtisanalIdentity() {
  const logger = new MigrationLogger('product-artisanal-identity');

  try {
    logger.log('📊 Contando identidades artesanales en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM shop.product_artisanal_identity
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de identidades a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay identidades artesanales para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo identidades de producción...');
    const identities = await productionConnection.query(`
      SELECT * FROM shop.product_artisanal_identity ORDER BY created_at ASC
    `);

    logger.log(`✅ Identidades leídas: ${identities.length}\n`);
    logger.log('💾 Migrando identidades a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, identity] of identities.entries()) {
      try {
        const columns = Object.keys(identity);
        const values = Object.values(identity);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO shop.product_artisanal_identity (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando identidad ${identity.id}`, error);
      }

      progress.update(index + 1);
    }

    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de identidades artesanales', error);
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
      await migrateProductArtisanalIdentity();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
