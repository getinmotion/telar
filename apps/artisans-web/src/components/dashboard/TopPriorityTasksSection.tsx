import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Star, 
  ArrowRight,
  Target
} from 'lucide-react';
import { AgentTask } from '@/hooks/types/agentTaskTypes';

interface TopPriorityTasksSectionProps {
  tasks: AgentTask[];
  language: 'en' | 'es';
  onStartDevelopment: (task: AgentTask) => Promise<void>;
  onChatWithAgent: (task: AgentTask) => void;
  onCompleteTask: (task: AgentTask) => Promise<void>;
  startingTask: string | null;
}

export const TopPriorityTasksSection: React.FC<TopPriorityTasksSectionProps> = ({
  tasks,
  language,
  onStartDevelopment,
  onChatWithAgent,
  onCompleteTask,
  startingTask
}) => {
  const translations = {
    en: {
      title: 'Top Priority Tasks',
      subtitle: 'Focus on these important tasks first',
      noTasks: 'All caught up! No priority tasks pending.',
      start: 'Start',
      chat: 'Chat',
      complete: 'Complete',
      highPriority: 'High',
      mediumPriority: 'Medium',
      lowPriority: 'Low',
      pending: 'Pending',
      inProgress: 'In Progress',
      estimatedTime: 'Est.',
      viewAll: 'View All Tasks'
    },
    es: {
      title: 'Tareas de Alta Prioridad',
      subtitle: 'Enfócate primero en estas tareas importantes',
      noTasks: '¡Todo al día! No hay tareas prioritarias pendientes.',
      start: 'Iniciar',
      chat: 'Chatear',
      complete: 'Completar',
      highPriority: 'Alta',
      mediumPriority: 'Media',
      lowPriority: 'Baja',
      pending: 'Pendiente',
      inProgress: 'En Progreso',
      estimatedTime: 'Est.',
      viewAll: 'Ver Todas las Tareas'
    }
  };

  const t = translations[language];

  // Get top 3 priority tasks - filter by status and sort by relevance + priority
  const priorityTasks = tasks
    .filter(task => task.status === 'pending' || task.status === 'in_progress')
    .sort((a, b) => {
      const relevanceOrder = { high: 3, medium: 2, low: 1 };
      const aRelevance = relevanceOrder[a.relevance as keyof typeof relevanceOrder] || 2;
      const bRelevance = relevanceOrder[b.relevance as keyof typeof relevanceOrder] || 2;
      
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance;
      }
      return a.priority - b.priority;
    })
    .slice(0, 3);

  // Debug info for development
  console.log('🔍 TopPriorityTasksSection - Priority tasks:', priorityTasks.length);

  const getPriorityColor = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/30';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800/30';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/30';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800/30';
    }
  };

  const getMainAction = (task: AgentTask) => {
    if (task.status === 'pending') {
      return {
        label: t.start,
        icon: Play,
        action: () => onStartDevelopment(task),
        variant: 'default' as const
      };
    }
    if (task.status === 'in_progress') {
      return {
        label: t.complete,
        icon: CheckCircle2,
        action: () => onCompleteTask(task),
        variant: 'outline' as const
      };
    }
    return null;
  };

  if (priorityTasks.length === 0) {
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800/30">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                {t.noTasks}
              </h3>
            </div>
            <p className="text-green-600 dark:text-green-400 text-sm">
              {t.subtitle}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {priorityTasks.length} {priorityTasks.length === 1 ? 'task' : 'tasks'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priorityTasks.map((task, index) => {
          const mainAction = getMainAction(task);
          const isStarting = startingTask === task.id;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between space-x-2">
                    <CardTitle className="text-sm font-medium line-clamp-2 flex-1">
                      {task.title}
                    </CardTitle>
                    <div className="flex flex-col space-y-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(task.relevance)}`}
                      >
                        {task.relevance === 'high' ? t.highPriority : 
                         task.relevance === 'medium' ? t.mediumPriority : t.lowPriority}
                      </Badge>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-muted-foreground">
                        {t.estimatedTime} {Math.round(task.time_spent / 60) || 30}m
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(task.status)}`}
                    >
                      {task.status === 'pending' ? t.pending : t.inProgress}
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    {mainAction && (
                      <Button
                        size="sm"
                        variant={mainAction.variant}
                        onClick={mainAction.action}
                        disabled={isStarting}
                        className="flex-1 text-xs h-8"
                      >
                        {isStarting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-3 h-3 mr-1"
                          >
                            <Star className="w-3 h-3" />
                          </motion.div>
                        ) : (
                          <mainAction.icon className="w-3 h-3 mr-1" />
                        )}
                        {mainAction.label}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onChatWithAgent(task)}
                      className="text-xs h-8 px-2"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};