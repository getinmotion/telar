import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { OptimizedRecommendedTask } from '@/hooks/useOptimizedRecommendedTasks';
import { useAgentPrompts } from '@/hooks/useAgentPrompts';
import { getPriorityColors } from '@/utils/colorTokens';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: OptimizedRecommendedTask;
  language: 'en' | 'es';
  onAction: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  language,
  onAction
}) => {
  const { generatePrompt } = useAgentPrompts();

  const translations = {
    en: {
      startTask: 'Start Task',
      completed: 'Completed',
      with: 'with'
    },
    es: {
      startTask: 'Comenzar Tarea',
      completed: 'Completada',
      with: 'con'
    }
  };

  const t = translations[language];

  const priorityColors = getPriorityColors(task.priority || 'medium');

  const handleStartTask = () => {
    console.log('Starting task:', task.title, 'with agent:', task.agentId);
    
    // Generate and store the prompt
    generatePrompt(
      task.agentId,
      task.title,
      task.description,
      task.agentName
    );
    
    // Call the parent action (navigation to agent)
    onAction();
  };

  return (
    <div className={cn("neumorphic rounded-lg p-4 transition-all hover:shadow-neumorphic-hover", priorityColors.bg)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
            {task.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        </div>
        <span className={cn("text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0 shadow-neumorphic-inset", priorityColors.bg, priorityColors.text)}>
          {task.category}
        </span>
      </div>

      <div className="flex items-center text-xs text-muted-foreground mb-3">
        <Clock className="w-3 h-3 mr-1" />
        <span>{task.estimatedTime}</span>
        <span className="mx-2">•</span>
        <span>{t.with} {task.agentName}</span>
      </div>

      <div className="flex items-center justify-between">
        {task.completed ? (
          <div className="flex items-center text-success text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            {t.completed}
          </div>
        ) : (
          <Button
            size="sm"
            onClick={handleStartTask}
            className="btn-capsule text-xs px-3 py-1 h-8"
          >
            {t.startTask}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};
