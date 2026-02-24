import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  TrendingUp, 
  Target,
  Calendar,
  Award,
  Zap
} from 'lucide-react';

interface CoordinatorTask {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: string;
  estimatedTime: string;
  isUnlocked: boolean;
  steps: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
  }>;
}

interface ProgressJourneyVisualizationProps {
  tasks: CoordinatorTask[];
  completedTasks: number;
  totalTasks: number;
  progressPercentage: number;
  showDetailedView?: boolean;
}

export const ProgressJourneyVisualization: React.FC<ProgressJourneyVisualizationProps> = ({
  tasks,
  completedTasks,
  totalTasks,
  progressPercentage,
  showDetailedView = false
}) => {
  const getTaskStatus = (task: CoordinatorTask) => {
    const completedSteps = task.steps.filter(step => step.isCompleted).length;
    const totalSteps = task.steps.length;
    
    if (completedSteps === totalSteps && totalSteps > 0) return 'completed';
    if (completedSteps > 0) return 'in_progress';
    if (task.isUnlocked) return 'available';
    return 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'available': return <Circle className="w-5 h-5 text-purple-600" />;
      case 'locked': return <Lock className="w-5 h-5 text-gray-400" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'in_progress': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'available': return 'border-purple-500 bg-purple-50 dark:bg-purple-950/20';
      case 'locked': return 'border-gray-300 bg-gray-50 dark:bg-gray-950/20 opacity-60';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const categorizedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, CoordinatorTask[]>);

  if (showDetailedView) {
    return (
      <div className="space-y-6">
        {/* Overall Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Journey Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{completedTasks}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => getTaskStatus(t) === 'in_progress').length}
                </div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {tasks.filter(t => getTaskStatus(t) === 'available').length}
                </div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorized Task Progress */}
        <div className="space-y-4">
          {Object.entries(categorizedTasks).map(([category, categoryTasks]) => {
            const categoryCompleted = categoryTasks.filter(t => getTaskStatus(t) === 'completed').length;
            const categoryProgress = (categoryCompleted / categoryTasks.length) * 100;
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      {category}
                    </div>
                    <Badge variant="outline">
                      {categoryCompleted}/{categoryTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={categoryProgress} className="h-2" />
                    <div className="space-y-2">
                      {categoryTasks.map((task, index) => {
                        const status = getTaskStatus(task);
                        const taskProgress = task.steps.length > 0 
                          ? (task.steps.filter(s => s.isCompleted).length / task.steps.length) * 100 
                          : 0;
                        
                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-3 rounded-lg border ${getStatusColor(status)} transition-all`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(status)}
                                <div>
                                  <div className="font-medium text-sm">{task.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {task.estimatedTime} • Priority {task.priority}
                                  </div>
                                </div>
                              </div>
                              {status === 'in_progress' && (
                                <div className="text-xs text-muted-foreground">
                                  {Math.round(taskProgress)}%
                                </div>
                              )}
                            </div>
                            {status === 'in_progress' && task.steps.length > 0 && (
                              <div className="mt-2">
                                <Progress value={taskProgress} className="h-1" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact view
  return (
    <div className="space-y-4">
      {/* Progress circle */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="relative w-24 h-24 mx-auto"
        >
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200 dark:text-gray-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-primary"
              strokeDasharray={`${progressPercentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">{progressPercentage}%</span>
          </div>
        </motion.div>
        <p className="text-sm text-muted-foreground mt-2">Journey Progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
          <div className="text-lg font-bold text-green-600">{completedTasks}</div>
          <div className="text-xs text-green-700 dark:text-green-300">Completed</div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
          <div className="text-lg font-bold text-blue-600">
            {tasks.filter(t => t.isUnlocked && getTaskStatus(t) !== 'completed').length}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Available</div>
        </div>
      </div>

      {/* Next milestone */}
      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Next Milestone</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Complete {Math.ceil((totalTasks - completedTasks) / 2)} more tasks to reach the next level
        </p>
      </div>
    </div>
  );
};