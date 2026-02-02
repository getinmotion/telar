
import React, { useState } from 'react';
import { useAgentTasks, AgentTask } from '@/hooks/useAgentTasks';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { formatTaskTitleForDisplay } from '@/hooks/utils/agentTaskUtils';
import { getTaskCompletionData } from '@/hooks/utils/taskCompletionHelpers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Plus, Loader2 } from 'lucide-react';
import { DetailedTaskCard } from './DetailedTaskCard';
import { useContinuousLearning } from '@/hooks/useContinuousLearning';

interface AgentTasksManagerProps {
  agentId: string;
  language: 'en' | 'es';
  onChatWithAgent?: (taskId: string, taskTitle: string) => void;
}

export const AgentTasksManager: React.FC<AgentTasksManagerProps> = ({
  agentId,
  language,
  onChatWithAgent
}) => {
  const {
    tasks,
    loading,
    updateTask,
    deleteTask,
    startTaskDevelopment,
    archiveTask,
    unarchiveTask
  } = useAgentTasks(agentId);
  const { context } = useUnifiedUserData();
  const { trackTaskCompletion } = useContinuousLearning();
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

  const t = {
    en: {
      tasks: "Tasks",
      noTasks: "No tasks yet",
      createFirst: "Tasks will appear here when created by the agent",
      chatWithAgent: "Chat with Agent",
    },
    es: {
      tasks: "Tareas",
      noTasks: "No hay tareas aún",
      createFirst: "Las tareas aparecerán aquí cuando las cree el agente",
      chatWithAgent: "Iniciar Misión",
    }
  };

  const handleStartDevelopment = async (task: AgentTask) => {
    setUpdatingTasks(prev => new Set(prev).add(task.id));

    try {
      const updatedTask = await startTaskDevelopment(task.id);

      if (updatedTask && onChatWithAgent) {
        const formattedTitle = formatTaskTitleForDisplay(task.title, context?.businessProfile?.brandName);
        onChatWithAgent(task.id, formattedTitle);
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

  const handleCompleteTask = async (task: AgentTask) => {
    setUpdatingTasks(prev => new Set(prev).add(task.id));

    const startTime = Date.now();

    // Usar datos de completitud consistentes
    const completionData = getTaskCompletionData();
    console.log('🎯 [AgentTasksManager] Completing task:', task.id, completionData);

    await updateTask(task.id, completionData);

    // Track task completion for learning system
    await trackTaskCompletion(task.id, task.agent_id || 'unknown');

    // Track task completion for analytics
    const duration = (Date.now() - startTime) / 1000;

    setUpdatingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(task.id);
      return newSet;
    });
  };

  const handleDelete = async (taskId: string) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    await deleteTask(taskId);
    // No need to remove from setUpdatingTasks as the component will disappear
  };

  const handleChatWithAgent = (task: AgentTask) => {
    if (onChatWithAgent) {
      const formattedTitle = formatTaskTitleForDisplay(task.title, context?.businessProfile?.brandName);
      onChatWithAgent(task.id, formattedTitle);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          {t[language].tasks}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}
        </Badge>
      </div>

      {tasks.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">{t[language].noTasks}</p>
            <p className="text-sm text-muted-foreground text-center">
              {t[language].createFirst}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <DetailedTaskCard
              key={task.id}
              task={task}
              language={language}
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
    </div>
  );
};
