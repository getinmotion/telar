import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateProductVariants() {
  const logger = new MigrationLogger('product-variants');

  try {
    logger.log('📊 Contando variantes de productos en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM public.product_variants
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de variantes a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay variantes para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo variantes de producción...');
    const variants = await productionConnection.query(`
      SELECT * FROM public.product_variants ORDER BY created_at ASC
    `);

    logger.log(`✅ Variantes leídas: ${variants.length}\n`);
    logger.log('💾 Migrando variantes a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, variant] of variants.entries()) {
      try {
        const columns = Object.keys(variant);
        const values = Object.values(variant);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO public.product_variants (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando variante ${variant.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de variantes', error);
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
      await migrateProductVariants();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
