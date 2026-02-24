import { ChatAction } from '@/hooks/useAgentConversations';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { useToast } from '@/hooks/use-toast';

export const useTaskChatActions = (agentId: string) => {
  const { 
    updateTask, 
    completeTaskQuickly, 
    updateSubtasks, 
    updateResources, 
    updateNotes 
  } = useAgentTasks(agentId);
  const { toast } = useToast();

  const handleTaskAction = async (action: ChatAction) => {
    if (!action.context?.taskId) {
      toast({
        title: 'Error',
        description: 'No se encontró el ID de la tarea',
        variant: 'destructive',
      });
      return;
    }

    const { taskId } = action.context;

    try {
      switch (action.context.action) {
        case 'complete':
          await completeTaskQuickly(taskId);
          toast({
            title: 'Tarea completada',
            description: 'La tarea ha sido marcada como completada',
          });
          break;

        case 'next_step':
          await updateTask(taskId, { 
            progress_percentage: Math.min(100, 50 + 20), // Default progress + 20%
            notes: 'Avanzando al siguiente paso'
          });
          toast({
            title: 'Progreso actualizado',
            description: 'Se ha avanzado al siguiente paso',
          });
          break;

        case 'add_subtask':
          const newSubtask = {
            id: Date.now().toString(),
            title: 'Nueva subtarea',
            completed: false,
            created_at: new Date().toISOString()
          };
          await updateSubtasks(taskId, [newSubtask]);
          toast({
            title: 'Subtarea añadida',
            description: 'Se ha añadido una nueva subtarea',
          });
          break;

        case 'add_resource':
          const newResource = {
            id: Date.now().toString(),
            title: 'Nuevo recurso',
            type: 'note' as const,
            description: 'Recurso añadido desde el chat'
          };
          await updateResources(taskId, [newResource]);
          toast({
            title: 'Recurso añadido',
            description: 'Se ha añadido un nuevo recurso',
          });
          break;

        case 'create_checklist':
          toast({
            title: 'Función en desarrollo',
            description: 'La creación de checklist estará disponible pronto',
          });
          break;

        case 'ask_questions':
          toast({
            title: 'Función en desarrollo',
            description: 'La generación de preguntas estará disponible pronto',
          });
          break;

        default:
          toast({
            title: 'Acción no reconocida',
            description: 'Esta acción no está implementada',
            variant: 'destructive',
          });
      }
    } catch (error) {
      console.error('Error executing task action:', error);
      toast({
        title: 'Error',
        description: 'No se pudo ejecutar la acción',
        variant: 'destructive',
      });
    }
  };

  return { handleTaskAction };
};