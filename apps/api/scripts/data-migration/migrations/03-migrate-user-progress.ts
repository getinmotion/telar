import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserProgress() {
  const logger = new MigrationLogger('user-progress');

  try {
    logger.log('📊 Contando registros de progreso de usuario en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.user_progress
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de registros de progreso a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay registros de progreso de usuario para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer registros de Supabase
    logger.log('📖 Leyendo registros de progreso de Supabase...');
    const progressRecords = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        level,
        experience_points,
        next_level_xp,
        completed_missions,
        current_streak,
        longest_streak,
        last_activity_date,
        total_time_spent,
        created_at,
        updated_at
      FROM public.user_progress
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Registros leídos: ${progressRecords.length}\n`);

    // 3. Migrar registros
    logger.log('💾 Migrando registros de progreso a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, record] of progressRecords.entries()) {
      try {
        // Insertar en producción (schema artesanos)
        await productionConnection.query(
          `
          INSERT INTO artesanos.user_progress (
            id,
            user_id,
            level,
            experience_points,
            next_level_xp,
            completed_missions,
            current_streak,
            longest_streak,
            last_activity_date,
            total_time_spent,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            level = EXCLUDED.level,
            experience_points = EXCLUDED.experience_points,
            next_level_xp = EXCLUDED.next_level_xp,
            completed_missions = EXCLUDED.completed_missions,
            current_streak = EXCLUDED.current_streak,
            longest_streak = EXCLUDED.longest_streak,
            last_activity_date = EXCLUDED.last_activity_date,
            total_time_spent = EXCLUDED.total_time_spent,
            updated_at = EXCLUDED.updated_at
        `,
          [
            record.id,
            record.user_id,
            record.level,
            record.experience_points,
            record.next_level_xp,
            record.completed_missions,
            record.current_streak,
            record.longest_streak,
            record.last_activity_date,
            record.total_time_spent,
            record.created_at,
            record.updated_at,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando progreso de usuario ${record.user_id || record.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de progreso de usuario', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateUserProgress();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
