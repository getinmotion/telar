
import { useMemo } from 'react';
import { AgentTask } from './useAgentTasks';

export const ACTIVE_TASKS_LIMIT = 15; // Reducido de 30 a 15

export const useTaskLimits = (tasks: AgentTask[]) => {
  const activeTasks = useMemo(() => 
    tasks.filter(task => task.status === 'pending' || task.status === 'in_progress'),
    [tasks]
  );

  const completedTasks = useMemo(() => 
    tasks.filter(task => task.status === 'completed'),
    [tasks]
  );

  const activeTasksCount = activeTasks.length;
  const completedTasksCount = completedTasks.length;
  const isAtLimit = activeTasksCount >= ACTIVE_TASKS_LIMIT;
  const isNearLimit = activeTasksCount >= ACTIVE_TASKS_LIMIT - 3; // Cambié de 5 a 3 por el límite más bajo
  const remainingSlots = ACTIVE_TASKS_LIMIT - activeTasksCount;
  
  const getProgressColor = () => {
    if (activeTasksCount >= ACTIVE_TASKS_LIMIT) return 'bg-red-500';
    if (activeTasksCount >= ACTIVE_TASKS_LIMIT - 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressPercentage = () => {
    return Math.min((activeTasksCount / ACTIVE_TASKS_LIMIT) * 100, 100);
  };

  const getLimitMessage = (language: 'en' | 'es') => {
    if (isAtLimit) {
      return language === 'es' 
        ? 'Has alcanzado el límite de tareas activas. Completa algunas para desbloquear nuevas.'
        : 'You have reached the active tasks limit. Complete some to unlock new ones.';
    }
    if (isNearLimit) {
      return language === 'es'
        ? `Te quedan ${remainingSlots} espacios para nuevas tareas.`
        : `You have ${remainingSlots} slots left for new tasks.`;
    }
    return '';
  };

  return {
    activeTasks,
    completedTasks,
    activeTasksCount,
    completedTasksCount,
    isAtLimit,
    isNearLimit,
    remainingSlots,
    getProgressColor,
    getProgressPercentage,
    getLimitMessage,
    limit: ACTIVE_TASKS_LIMIT
  };
};
