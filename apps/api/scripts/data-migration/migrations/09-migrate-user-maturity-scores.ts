import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserMaturityScores() {
  const logger = new MigrationLogger('user-maturity-scores');

  try {
    logger.log('📊 Contando puntuaciones de madurez de usuario en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.user_maturity_scores
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de puntuaciones de madurez a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay puntuaciones de madurez de usuario para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer puntuaciones de Supabase
    logger.log('📖 Leyendo puntuaciones de madurez de Supabase...');
    const scores = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        idea_validation,
        user_experience,
        market_fit,
        monetization,
        profile_data,
        created_at
      FROM public.user_maturity_scores
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Puntuaciones leídas: ${scores.length}\n`);

    // 3. Migrar puntuaciones
    logger.log('💾 Migrando puntuaciones de madurez a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, score] of scores.entries()) {
      try {
        // Insertar en producción
        await productionConnection.query(
          `
          INSERT INTO public.user_maturity_scores (
            id,
            user_id,
            idea_validation,
            user_experience,
            market_fit,
            monetization,
            profile_data,
            created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            idea_validation = EXCLUDED.idea_validation,
            user_experience = EXCLUDED.user_experience,
            market_fit = EXCLUDED.market_fit,
            monetization = EXCLUDED.monetization,
            profile_data = EXCLUDED.profile_data
        `,
          [
            score.id,
            score.user_id,
            score.idea_validation,
            score.user_experience,
            score.market_fit,
            score.monetization,
            score.profile_data,
            score.created_at,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando puntuación de madurez ${score.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de puntuaciones de madurez', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateUserMaturityScores();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
