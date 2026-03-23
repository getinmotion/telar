import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateUserProgress() {
  const logger = new MigrationLogger('user-progress');

  try {
    logger.log('📊 Contando progreso de usuarios en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM artesanos.user_progress
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de registros a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay registros de progreso para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo progreso de usuarios de producción...');
    const progressRecords = await productionConnection.query(`
      SELECT * FROM artesanos.user_progress ORDER BY created_at ASC
    `);

    logger.log(`✅ Registros leídos: ${progressRecords.length}\n`);
    logger.log('💾 Migrando registros a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, record] of progressRecords.entries()) {
      try {
        const columns = Object.keys(record);
        const values = Object.values(record);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO artesanos.user_progress (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando progreso ${record.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de progreso', error);
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
      await migrateUserProgress();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
