import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserAchievements() {
  const logger = new MigrationLogger('user-achievements');

  try {
    logger.log('📊 Contando logros de usuario en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.user_achievements
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de logros de usuario a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay logros de usuario para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer logros de Supabase
    logger.log('📖 Leyendo logros de usuario de Supabase...');
    const achievements = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        achievement_id,
        title,
        description,
        icon,
        unlocked_at,
        created_at
      FROM public.user_achievements
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Logros leídos: ${achievements.length}\n`);

    // 3. Migrar logros
    logger.log('💾 Migrando logros de usuario a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, achievement] of achievements.entries()) {
      try {
        // Insertar en producción
        await productionConnection.query(
          `
          INSERT INTO public.user_achievements (
            id,
            user_id,
            achievement_id,
            title,
            description,
            icon,
            unlocked_at,
            created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            achievement_id = EXCLUDED.achievement_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            unlocked_at = EXCLUDED.unlocked_at
        `,
          [
            achievement.id,
            achievement.user_id,
            achievement.achievement_id,
            achievement.title,
            achievement.description,
            achievement.icon,
            achievement.unlocked_at,
            achievement.created_at,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando logro ${achievement.title || achievement.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de logros de usuario', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateUserAchievements();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
