import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateProductModerationHistory() {
  const logger = new MigrationLogger('product-moderation-history');

  try {
    logger.log('📊 Contando historial de moderación en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM public.product_moderation_history
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de registros a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay registros de moderación para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo historial de producción...');
    const records = await productionConnection.query(`
      SELECT * FROM public.product_moderation_history ORDER BY created_at ASC
    `);

    logger.log(`✅ Registros leídos: ${records.length}\n`);
    logger.log('💾 Migrando registros a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, record] of records.entries()) {
      try {
        const columns = Object.keys(record);
        const values = serializeRow(record);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO public.product_moderation_history (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando registro ${record.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de historial de moderación', error);
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
      await migrateProductModerationHistory();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
