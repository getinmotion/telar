import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserAchievements() {
  const logger = new MigrationLogger('user-achievements');

  try {
    logger.log('📊 Contando logros de usuarios en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM public.user_achievements
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de logros a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay logros para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo logros de producción...');
    const achievements = await productionConnection.query(`
      SELECT * FROM public.user_achievements ORDER BY created_at ASC
    `);

    logger.log(`✅ Logros leídos: ${achievements.length}\n`);
    logger.log('💾 Migrando logros a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, achievement] of achievements.entries()) {
      try {
        const columns = Object.keys(achievement);
        const values = Object.values(achievement);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO public.user_achievements (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando logro ${achievement.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de logros', error);
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
      await migrateUserAchievements();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
