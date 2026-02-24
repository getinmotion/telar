import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AgentTask, TaskSubtask, TaskResource } from './types/agentTaskTypes';
import { convertToAgentTask } from './utils/agentTaskUtils';
import { getTaskCompletionData } from './utils/taskCompletionHelpers';
import { ACTIVE_TASKS_LIMIT } from './useTaskLimits';
import { useGamificationRewards } from './useGamificationRewards';
import { calculateTaskXP } from '@/constants/gamification';
import { EventBus } from '@/utils/eventBus';

export function useAgentTasksSpecialOperations(
  user: any,
  tasks: AgentTask[],
  setTasks: React.Dispatch<React.SetStateAction<AgentTask[]>>,
  updateTask: (taskId: string, updates: Partial<AgentTask>) => Promise<AgentTask | null>
) {
  const { toast } = useToast();
  const { awardXP } = useGamificationRewards();

  const startTaskDevelopment = async (taskId: string) => {
    if (!user) return null;

    try {
      // Check active tasks limit before attempting to start
      const activeTasks = tasks.filter(task => 
        task.status === 'pending' || task.status === 'in_progress'
      );

      if (activeTasks.length >= ACTIVE_TASKS_LIMIT) {
        toast({
          title: 'Límite de tareas alcanzado',
          description: `Tienes ${activeTasks.length}/${ACTIVE_TASKS_LIMIT} tareas activas. Completa algunas tareas pendientes para poder iniciar nuevas.`,
          variant: 'destructive',
        });
        return null;
      }

      // Get the task to find its agent_id
      const task = tasks.find(t => t.id === taskId);
      if (!task) return null;

      // First pause any other task in_progress from the same agent
      const otherActiveTasks = tasks.filter(t => 
        t.agent_id === task.agent_id && 
        t.status === 'in_progress' && 
        t.id !== taskId
      );

      console.log('Pausing other active tasks for agent:', task.agent_id, otherActiveTasks);

      // Pause other tasks active from the same agent
      for (const otherTask of otherActiveTasks) {
        await supabase
          .from('agent_tasks')
          .update({ status: 'pending' })
          .eq('id', otherTask.id);
      }

      // Activate the selected task
      const { data, error } = await supabase
        .from('agent_tasks')
        .update({ 
          status: 'in_progress',
          progress_percentage: Math.max(10, task.progress_percentage || 0)
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        // Handle specific task limit error from database trigger
        if (error.message.includes('No puedes tener más de 15 tareas activas')) {
          toast({
            title: 'Límite de tareas alcanzado',
            description: `Has alcanzado el límite de ${ACTIVE_TASKS_LIMIT} tareas activas. Completa algunas tareas pendientes para desbloquear nuevas.`,
            variant: 'destructive',
          });
          return null;
        }
        throw error;
      }

      const updatedTask = convertToAgentTask(data);
      
      // Update local state
      setTasks(prev => prev.map(t => {
        if (t.agent_id === task.agent_id && t.status === 'in_progress' && t.id !== taskId) {
          return { ...t, status: 'pending' };
        }
        if (t.id === taskId) {
          return updatedTask;
        }
        return t;
      }));

      // Show success message with current active count
      const newActiveCount = activeTasks.length + 1;
      toast({
        title: 'Tarea iniciada',
        description: `Desarrollo iniciado. Tienes ${newActiveCount}/${ACTIVE_TASKS_LIMIT} tareas activas.`,
      });

      // Trigger progress recalculation
      EventBus.publish('task.updated', { taskId, status: 'in_progress' });
      EventBus.publish('master.full.sync', { source: 'task_started' });

      return updatedTask;
    } catch (error) {
      console.error('Error starting task development:', error);
      toast({
        title: 'Error al iniciar tarea',
        description: 'No se pudo iniciar el desarrollo de la tarea. Inténtalo de nuevo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const completeTaskQuickly = async (taskId: string) => {
    // Obtener la tarea para calcular XP
    const task = tasks.find(t => t.id === taskId);
    
    // Usar datos de completitud consistentes
    const completionData = getTaskCompletionData();
    console.log('🎯 [completeTaskQuickly] Marking task as completed:', taskId, completionData);
    
    const result = await updateTask(taskId, completionData);

    // 🎯 GAMIFICACIÓN: Otorgar XP por completar tarea
    if (result && task) {
      const xpAmount = calculateTaskXP(String(task.priority || 'medium'));
      console.log(`🎯 Awarding ${xpAmount} XP for completing task: ${task.title}`);
      
      await awardXP(
        xpAmount,
        `Tarea Completada: ${task.title}`,
        true, // missionCompleted
        0
      );

      // Trigger progress recalculation
      EventBus.publish('task.updated', { taskId, status: 'completed' });
      EventBus.publish('master.full.sync', { source: 'task_completed' });
      
      // 🔥 NUEVO: Disparar verificación de auto-generación
      EventBus.publish('task.completed.check.generation', { 
        taskId, 
        completedTasksCount: tasks.filter(t => t.status === 'completed').length 
      });
    }

    return result;
  };

  const updateSubtasks = async (taskId: string, subtasks: TaskSubtask[]) => {
    const completedSubtasks = subtasks.filter(st => st.completed).length;
    const progressPercentage = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
    
    // Si está 100% completada, usar datos de completitud consistentes
    if (progressPercentage === 100) {
      const completionData = getTaskCompletionData();
      return updateTask(taskId, {
        subtasks,
        ...completionData
      });
    }
    
    return updateTask(taskId, {
      subtasks,
      progress_percentage: progressPercentage,
      status: progressPercentage > 0 ? 'in_progress' : 'pending',
      completed_at: null
    });
  };

  const updateNotes = async (taskId: string, notes: string) => {
    return updateTask(taskId, { notes });
  };

  const updateResources = async (taskId: string, resources: TaskResource[]) => {
    return updateTask(taskId, { resources });
  };

  const updateTimeSpent = async (taskId: string, timeSpent: number) => {
    return updateTask(taskId, { time_spent: timeSpent });
  };

  return {
    startTaskDevelopment,
    completeTaskQuickly,
    updateSubtasks,
    updateNotes,
    updateResources,
    updateTimeSpent
  };
}
