import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Pause, Play, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/hooks/useTranslations';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'paused';
  agent_name?: string;
  impact: 'low' | 'medium' | 'high';
}

interface TaskLimitManagerProps {
  activeTasks: Task[];
  maxTasks?: number;
  language: 'en' | 'es';
  onPauseTask: (taskId: string) => void;
  onResumeTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks?: (tasks: Task[]) => void;
}

export const TaskLimitManager: React.FC<TaskLimitManagerProps> = ({
  activeTasks,
  maxTasks = 15,
  language,
  onPauseTask,
  onResumeTask,
  onDeleteTask,
  onReorderTasks
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslations();
  const activeCount = activeTasks.filter(t => t.status !== 'paused').length;
  const progressPercentage = (activeCount / maxTasks) * 100;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendations = () => {
    const lowPriorityTasks = activeTasks.filter(t => t.priority === 'low' && t.status !== 'paused');
    const highImpactTasks = activeTasks.filter(t => t.impact === 'high' && t.status !== 'paused');
    
    if (activeCount >= 12) {
      return {
        type: 'warning',
        message: activeCount >= maxTasks ? t.taskManagement.limitReached : t.taskManagement.limitWarning,
        suggestion: t.taskManagement.smartSuggestion,
        suggestedActions: lowPriorityTasks.slice(0, 3)
      };
    }
    
    return null;
  };

  const recommendations = getRecommendations();

  const shouldShowTrigger = activeCount >= 10;

  return (
    <div className="space-y-2">
      {/* Progress Indicator */}
      <div className="flex items-center gap-3">
        <Progress 
          value={progressPercentage} 
          className="flex-1 h-2"
        />
        <Badge 
          variant={activeCount >= maxTasks ? "destructive" : activeCount >= 12 ? "secondary" : "default"}
          className="min-w-fit"
        >
          {activeCount}/{maxTasks}
        </Badge>
        
        {shouldShowTrigger && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={activeCount >= maxTasks ? "border-red-500 text-red-500" : ""}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                {t.taskManagement.manage}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t.taskManagement.taskLimit}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Recommendations */}
                {recommendations && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        {recommendations.type === 'warning' ? t.taskManagement.limitWarning : t.taskManagement.recommendation}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-amber-700 mb-4">{recommendations.message}</p>
                      <p className="text-sm text-amber-600">{recommendations.suggestion}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Current Tasks */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {t.taskManagement.currentTasks} ({activeCount})
                  </h3>
                  
                  <div className="space-y-3">
                    {activeTasks.map((task) => (
                      <Card key={task.id} className={`${task.status === 'paused' ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-sm">{task.title}</h4>
                                {task.status === 'paused' && (
                                  <Badge variant="secondary" className="text-xs">{t.taskManagement.paused}</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                  {t.missionsDashboard[task.priority as keyof typeof t.missionsDashboard]}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getImpactColor(task.impact)}`}
                                >
                                  {t.impact[task.impact as keyof typeof t.impact]}
                                </Badge>
                                {task.agent_name && (
                                  <span>{task.agent_name}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-4">
                              {task.status === 'paused' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onResumeTask(task.id)}
                                  className="h-8 px-2"
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onPauseTask(task.id)}
                                  className="h-8 px-2"
                                >
                                  <Pause className="h-3 w-3" />
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteTask(task.id)}
                                className="h-8 px-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};