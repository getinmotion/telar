import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserMasterContext() {
  const logger = new MigrationLogger('user-master-context');

  try {
    logger.log('📊 Contando contextos maestros de usuario en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.user_master_context
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de contextos maestros de usuario a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay contextos maestros de usuario para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer contextos de Supabase
    logger.log('📖 Leyendo contextos maestros de usuario de Supabase...');
    const contexts = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        business_context,
        preferences,
        conversation_insights,
        technical_details,
        goals_and_objectives,
        context_version,
        last_updated,
        created_at,
        business_profile,
        task_generation_context,
        language_preference,
        last_assessment_date
      FROM public.user_master_context
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Contextos leídos: ${contexts.length}\n`);

    // 3. Migrar contextos
    logger.log('💾 Migrando contextos maestros de usuario a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, context] of contexts.entries()) {
      try {
        // Insertar en producción
        await productionConnection.query(
          `
          INSERT INTO public.user_master_context (
            id,
            user_id,
            business_context,
            preferences,
            conversation_insights,
            technical_details,
            goals_and_objectives,
            context_version,
            last_updated,
            created_at,
            business_profile,
            task_generation_context,
            language_preference,
            last_assessment_date
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            business_context = EXCLUDED.business_context,
            preferences = EXCLUDED.preferences,
            conversation_insights = EXCLUDED.conversation_insights,
            technical_details = EXCLUDED.technical_details,
            goals_and_objectives = EXCLUDED.goals_and_objectives,
            context_version = EXCLUDED.context_version,
            last_updated = EXCLUDED.last_updated,
            business_profile = EXCLUDED.business_profile,
            task_generation_context = EXCLUDED.task_generation_context,
            language_preference = EXCLUDED.language_preference,
            last_assessment_date = EXCLUDED.last_assessment_date
        `,
          [
            context.id,
            context.user_id,
            context.business_context,
            context.preferences,
            context.conversation_insights,
            context.technical_details,
            context.goals_and_objectives,
            context.context_version,
            context.last_updated,
            context.created_at,
            context.business_profile,
            context.task_generation_context,
            context.language_preference,
            context.last_assessment_date,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando contexto maestro de usuario ${context.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de contextos maestros de usuario', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateUserMasterContext();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
