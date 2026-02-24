
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { useTaskLimits } from '@/hooks/useTaskLimits';
import { AgentTask } from '@/hooks/useAgentTasks';

interface TaskLimitIndicatorProps {
  tasks: AgentTask[];
  language: 'en' | 'es';
  compact?: boolean;
  onCompleteTask?: (taskId: string) => void;
}

export const TaskLimitIndicator: React.FC<TaskLimitIndicatorProps> = ({
  tasks,
  language,
  compact = false,
  onCompleteTask
}) => {
  const { 
    activeTasksCount, 
    isAtLimit, 
    isNearLimit, 
    remainingSlots, 
    getProgressColor, 
    getProgressPercentage,
    getLimitMessage,
    limit,
    activeTasks
  } = useTaskLimits(tasks);

  const t = {
    en: {
      activeTasks: 'Active Tasks',
      remaining: 'remaining slots',
      limit: 'Task Limit',
      atLimit: 'At Limit',
      nearLimit: 'Near Limit',
      completeFirst: 'Complete pending tasks to create new ones',
      quickActions: 'Quick Actions',
      completeOldest: 'Complete Oldest',
      manageActiveTasks: 'Manage Active Tasks'
    },
    es: {
      activeTasks: 'Tareas Activas',
      remaining: 'espacios restantes',
      limit: 'Límite de Tareas',
      atLimit: 'En el Límite',
      nearLimit: 'Cerca del Límite',
      completeFirst: 'Completa tareas pendientes para crear nuevas',
      quickActions: 'Acciones Rápidas',
      completeOldest: 'Completar Más Antigua',
      manageActiveTasks: 'Gestionar Tareas Activas'
    }
  };

  // Only show if user has active tasks
  if (activeTasksCount === 0) {
    return null;
  }

  const handleCompleteOldest = () => {
    if (activeTasks.length > 0 && onCompleteTask) {
      // Find the oldest pending task
      const oldestTask = activeTasks
        .filter(task => task.status === 'pending')
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
      
      if (oldestTask) {
        onCompleteTask(oldestTask.id);
      }
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'default'}
          className="text-xs"
        >
          {activeTasksCount}/{limit}
        </Badge>
        {isAtLimit && <AlertTriangle className="w-4 h-4 text-red-500" />}
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border ${isAtLimit ? 'bg-red-50 border-red-200' : isNearLimit ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {t[language].activeTasks}
          </span>
        </div>
        <Badge 
          variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'default'}
          className="text-xs"
        >
          {activeTasksCount}/{limit}
        </Badge>
      </div>
      
      <Progress 
        value={getProgressPercentage()} 
        className="h-2 mb-3"
      />
      
      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <span>
          {remainingSlots} {t[language].remaining}
        </span>
        {isAtLimit && (
          <div className="flex items-center gap-1 text-red-600 font-medium">
            <AlertTriangle className="w-3 h-3" />
            <span>{t[language].completeFirst}</span>
          </div>
        )}
      </div>

      {/* Quick Actions when at or near limit */}
      {(isAtLimit || isNearLimit) && onCompleteTask && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">
              {t[language].quickActions}:
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCompleteOldest}
              className="text-xs h-6 px-2"
              disabled={activeTasks.filter(t => t.status === 'pending').length === 0}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {t[language].completeOldest}
            </Button>
          </div>
          
          {/* Show message about the limit */}
          <div className="mt-2 text-xs text-gray-500">
            {getLimitMessage(language)}
          </div>
        </div>
      )}
    </div>
  );
};
