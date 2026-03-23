import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserMaturityScores() {
  const logger = new MigrationLogger('user-maturity-scores');

  try {
    logger.log('📊 Contando puntuaciones de madurez en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM public.user_maturity_scores
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de puntuaciones a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay puntuaciones para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo puntuaciones de producción...');
    const scores = await productionConnection.query(`
      SELECT * FROM public.user_maturity_scores ORDER BY created_at ASC
    `);

    logger.log(`✅ Puntuaciones leídas: ${scores.length}\n`);
    logger.log('💾 Migrando puntuaciones a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, score] of scores.entries()) {
      try {
        const columns = Object.keys(score);
        const values = Object.values(score);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO public.user_maturity_scores (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando puntuación ${score.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de puntuaciones', error);
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
      await migrateUserMaturityScores();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
