import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus, ArrowRight, MessageSquare, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { formatTaskTitleForDisplay } from '@/hooks/utils/agentTaskUtils';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { useAuth } from '@/context/AuthContext';
import { DetailedTaskCard } from './DetailedTaskCard';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

interface TaskManagerProps {
  agentId?: string;
  onChatWithAgent?: (taskId: string, taskTitle: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  agentId,
  onChatWithAgent
}) => {
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);
  const { user } = useAuth();
  const { toast } = useToast();
  const { context } = useUnifiedUserData();
  const { 
    tasks, 
    loading, 
    updateTask, 
    deleteTask, 
    startTaskDevelopment,
    archiveTask,
    unarchiveTask
  } = useAgentTasks(agentId);
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

  const translations = {
    en: {
      yourTasks: "Your Tasks",
      addTask: "Add Task",
      viewAllTasks: "View All Tasks",
      taskComplete: "Task Complete",
      workWithAgent: "Work with Agent",
      noTasks: "No tasks yet",
      loadingTasks: "Loading tasks..."
    },
    es: {
      yourTasks: "Tus Tareas",
      addTask: "Añadir Tarea",
      viewAllTasks: "Ver Todas las Tareas",
      taskComplete: "Tarea Completada",
      workWithAgent: "Trabajar con Agente",
      noTasks: "No hay tareas aún",
      loadingTasks: "Cargando tareas..."
    }
  };
  
  const t = translations[compatibleLanguage];

  const handleStartDevelopment = async (task: any) => {
    setUpdatingTasks(prev => new Set(prev).add(task.id));
    
    try {
      const updatedTask = await startTaskDevelopment(task.id);
      
      if (updatedTask && onChatWithAgent) {
        onChatWithAgent(task.id, formatTaskTitleForDisplay(task.title, context?.businessProfile?.brandName));
      }
    } catch (error) {
      console.error('Error starting task development:', error);
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  const handleCompleteTask = async (task: any) => {
    setUpdatingTasks(prev => new Set(prev).add(task.id));
    
    await updateTask(task.id, { 
      status: 'completed',
      progress_percentage: 100,
      completed_at: new Date().toISOString()
    });
    
    setUpdatingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(task.id);
      return newSet;
    });
    
    toast({
      title: t.taskComplete,
      description: formatTaskTitleForDisplay(task.title, context?.businessProfile?.brandName),
    });
  };

  const handleChatWithAgent = (task: any) => {
    if (onChatWithAgent) {
      onChatWithAgent(task.id, formatTaskTitleForDisplay(task.title, context?.businessProfile?.brandName));
    }
  };

  const handleDelete = async (taskId: string) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    await deleteTask(taskId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">{t.loadingTasks}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          {t.yourTasks}
        </CardTitle>
        <Button variant="ghost" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          {t.addTask}
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t.noTasks}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 4).map(task => (
              <DetailedTaskCard
                key={task.id}
                task={task}
                language={compatibleLanguage}
                onStartDevelopment={handleStartDevelopment}
                onCompleteTask={handleCompleteTask}
                onChatWithAgent={handleChatWithAgent}
                onDelete={handleDelete}
                onArchive={archiveTask}
                onUnarchive={unarchiveTask}
                isUpdating={updatingTasks.has(task.id)}
                allTasks={tasks}
              />
            ))}
          </div>
        )}
        
        {tasks.length > 4 && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" className="w-full">
              {t.viewAllTasks}
              <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};