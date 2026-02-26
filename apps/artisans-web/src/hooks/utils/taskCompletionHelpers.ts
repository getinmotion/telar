/**
 * Helpers centralizados para completar tareas
 * Garantizan que todas las actualizaciones de tareas completadas sean consistentes
 */

import { updateAgentTask } from '@/services/agentTasks.actions';

/**
 * Datos completos y consistentes para marcar una tarea como completada
 */
export const getTaskCompletionData = () => ({
  status: 'completed' as const,
  progress_percentage: 100,
  completed_at: new Date().toISOString()
});

/**
 * Actualiza una tarea a estado completado en la base de datos
 * Garantiza que todos los campos necesarios se actualicen correctamente
 */
export const markTaskAsCompleted = async (taskId: string, userId?: string) => {
  const completionData = getTaskCompletionData();
  
  console.log(`🎯 Marking task ${taskId} as completed with data:`, completionData);
  
  try {
    // ✅ Migrado a endpoint NestJS - PATCH /agent-tasks/{id}
    const data = await updateAgentTask(taskId, {
      status: completionData.status,
      progressPercentage: completionData.progress_percentage,
      completedAt: completionData.completed_at
    });
    
    console.log('✅ Task marked as completed successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error marking task as completed:', error);
    throw error;
  }
};

/**
 * Verifica si una tarea está realmente completada según sus datos
 */
export const isTaskCompleted = (task: any): boolean => {
  return (
    task.status === 'completed' &&
    task.progress_percentage === 100 &&
    task.completed_at !== null
  );
};

/**
 * Verifica si una tarea necesita corrección de estado
 */
export const needsCompletionFix = (task: any): boolean => {
  // Tarea marcada como completada pero sin progress_percentage o completed_at
  if (task.status === 'completed') {
    return task.progress_percentage !== 100 || !task.completed_at;
  }
  
  // Tarea con 100% de progreso pero no marcada como completada
  if (task.progress_percentage === 100) {
    return task.status !== 'completed' || !task.completed_at;
  }
  
  return false;
};

/**
 * Corrige el estado de una tarea si es necesario
 */
export const fixTaskCompletionIfNeeded = async (task: any) => {
  if (!needsCompletionFix(task)) {
    return task;
  }
  
  console.log(`🔧 Fixing task completion state for task ${task.id}`);
  return await markTaskAsCompleted(task.id, task.user_id);
};
