import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateMasterCoordinatorContext() {
  const logger = new MigrationLogger('master-coordinator-context');

  try {
    logger.log('📊 Contando contextos en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM public.master_coordinator_context
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de contextos a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay contextos para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo contextos de producción...');
    const contexts = await productionConnection.query(`
      SELECT * FROM public.master_coordinator_context ORDER BY created_at ASC
    `);

    logger.log(`✅ Contextos leídos: ${contexts.length}\n`);
    logger.log('💾 Migrando contextos a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, context] of contexts.entries()) {
      try {
        const columns = Object.keys(context);
        const values = Object.values(context);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO public.master_coordinator_context (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando contexto ${context.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de contextos', error);
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
      await migrateMasterCoordinatorContext();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
