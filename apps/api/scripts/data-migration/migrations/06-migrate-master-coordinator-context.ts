import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateMasterCoordinatorContext() {
  const logger = new MigrationLogger('master-coordinator-context');

  try {
    logger.log('📊 Contando contextos de coordinador maestro en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.master_coordinator_context
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de contextos de coordinador maestro a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay contextos de coordinador maestro para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer contextos de Supabase
    logger.log('📖 Leyendo contextos de coordinador maestro de Supabase...');
    const contexts = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        context_snapshot,
        last_interaction,
        ai_memory,
        context_version,
        created_at,
        updated_at
      FROM public.master_coordinator_context
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Contextos leídos: ${contexts.length}\n`);

    // 3. Migrar contextos
    logger.log('💾 Migrando contextos de coordinador maestro a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, context] of contexts.entries()) {
      try {
        // Insertar en producción
        await productionConnection.query(
          `
          INSERT INTO public.master_coordinator_context (
            id,
            user_id,
            context_snapshot,
            last_interaction,
            ai_memory,
            context_version,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            context_snapshot = EXCLUDED.context_snapshot,
            last_interaction = EXCLUDED.last_interaction,
            ai_memory = EXCLUDED.ai_memory,
            context_version = EXCLUDED.context_version,
            updated_at = EXCLUDED.updated_at
        `,
          [
            context.id,
            context.user_id,
            context.context_snapshot,
            context.last_interaction,
            context.ai_memory,
            context.context_version,
            context.created_at,
            context.updated_at,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando contexto de coordinador maestro ${context.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de contextos de coordinador maestro', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateMasterCoordinatorContext();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
