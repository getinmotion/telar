import { supabaseConnection, productionConnection } from '../config';
import { MigrationLogger, ProgressBar } from '../utils';

export async function migrateAgentTasks() {
  const logger = new MigrationLogger('agent-tasks');

  try {
    logger.log('📊 Contando tareas de agentes en Supabase...');

    // 1. Contar registros
    const countResult = await supabaseConnection.query(`
      SELECT COUNT(*) as count FROM public.agent_tasks
    `);
    const total = parseInt(countResult[0].count);

    logger.log(`📊 Total de tareas de agentes a migrar: ${total}\n`);

    if (total === 0) {
      logger.log('⚠️  No hay tareas de agentes para migrar');
      return { success: 0, failed: 0, total: 0 };
    }

    // 2. Leer tareas de Supabase
    logger.log('📖 Leyendo tareas de agentes de Supabase...');
    const tasks = await supabaseConnection.query(`
      SELECT
        id,
        user_id,
        agent_id,
        conversation_id,
        title,
        description,
        relevance,
        progress_percentage,
        status,
        priority,
        due_date,
        completed_at,
        created_at,
        updated_at,
        subtasks,
        notes,
        steps_completed,
        resources,
        time_spent,
        is_archived,
        environment,
        deliverable_type,
        milestone_category
      FROM public.agent_tasks
      ORDER BY created_at ASC
    `);

    logger.log(`✅ Tareas leídas: ${tasks.length}\n`);

    // 3. Migrar tareas
    logger.log('💾 Migrando tareas de agentes a producción...\n');
    const progress = new ProgressBar(total);

    let success = 0;
    let failed = 0;

    for (const [index, task] of tasks.entries()) {
      try {
        // Insertar en producción
        await productionConnection.query(
          `
          INSERT INTO public.agent_tasks (
            id,
            user_id,
            agent_id,
            conversation_id,
            title,
            description,
            relevance,
            progress_percentage,
            status,
            priority,
            due_date,
            completed_at,
            created_at,
            updated_at,
            subtasks,
            notes,
            steps_completed,
            resources,
            time_spent,
            is_archived,
            environment,
            deliverable_type,
            milestone_category
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23
          )
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            agent_id = EXCLUDED.agent_id,
            conversation_id = EXCLUDED.conversation_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            relevance = EXCLUDED.relevance,
            progress_percentage = EXCLUDED.progress_percentage,
            status = EXCLUDED.status,
            priority = EXCLUDED.priority,
            due_date = EXCLUDED.due_date,
            completed_at = EXCLUDED.completed_at,
            updated_at = EXCLUDED.updated_at,
            subtasks = EXCLUDED.subtasks,
            notes = EXCLUDED.notes,
            steps_completed = EXCLUDED.steps_completed,
            resources = EXCLUDED.resources,
            time_spent = EXCLUDED.time_spent,
            is_archived = EXCLUDED.is_archived,
            environment = EXCLUDED.environment,
            deliverable_type = EXCLUDED.deliverable_type,
            milestone_category = EXCLUDED.milestone_category
        `,
          [
            task.id,
            task.user_id,
            task.agent_id,
            task.conversation_id,
            task.title,
            task.description,
            task.relevance,
            task.progress_percentage,
            task.status,
            task.priority,
            task.due_date,
            task.completed_at,
            task.created_at,
            task.updated_at,
            task.subtasks,
            task.notes,
            task.steps_completed,
            task.resources,
            task.time_spent,
            task.is_archived,
            task.environment,
            task.deliverable_type,
            task.milestone_category,
          ],
        );

        success++;
      } catch (error) {
        failed++;
        logger.error(
          `Error migrando tarea ${task.title || task.id}`,
          error,
        );
      }

      progress.update(index + 1);
    }

    // 4. Resumen
    logger.finish({ success, failed, total });

    return { success, failed, total };
  } catch (error) {
    logger.error('Error fatal en migración de tareas de agentes', error);
    throw error;
  }
}

// Permitir ejecución directa del script
if (require.main === module) {
  const { initConnections, closeConnections } = require('../config');

  (async () => {
    try {
      await initConnections();
      await migrateAgentTasks();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await closeConnections();
    }
  })();
}
