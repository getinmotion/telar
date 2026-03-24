import { productionConnection, localConnection, initConnections, closeConnections } from '../config';
import { MigrationLogger, ProgressBar, serializeRow } from '../utils';

export async function migrateAgentTasks() {
  const logger = new MigrationLogger('agent-tasks');

  try {
    logger.log('📊 Contando tareas de agentes en producción...');

    const countResult = await productionConnection.query(`
      SELECT COUNT(*) as count FROM public.agent_tasks
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de tareas a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay tareas para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    logger.log('📖 Leyendo tareas de producción...');
    const tasks = await productionConnection.query(`
      SELECT * FROM public.agent_tasks ORDER BY created_at ASC
    `);

    logger.log(`✅ Tareas leídas: ${tasks.length}\n`);
    logger.log('💾 Migrando tareas a local...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, task] of tasks.entries()) {
      try {
        const columns = Object.keys(task);
        const values = serializeRow(task);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        await localConnection.query(
          `INSERT INTO public.agent_tasks (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO NOTHING`,
          values
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(`Error migrando tarea ${task.id}`, error);
      }

      progress.update(index + 1);
    }


    const summary = { success, failed, total };
    logger.success(`✅ Migración completada: ${success} exitosos, ${failed} fallidos de ${total} totales`);
    logger.finish(summary);

    return summary;
  } catch (error) {
    logger.error('❌ Error general en migración de tareas', error);
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
      await migrateAgentTasks();
      await closeConnections();
      process.exit(0);
    } catch (error) {
      console.error('Error fatal:', error);
      await closeConnections();
      process.exit(1);
    }
  })();
}
