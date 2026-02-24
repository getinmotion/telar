import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  MessageCircle, 
  Clock, 
  Target, 
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Brain
} from 'lucide-react';

interface CoordinatorTask {
  id: string;
  title: string;
  description: string;
  agentId: string;
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

interface IntelligentRecommendationCardProps {
  task: CoordinatorTask;
  onStart: () => void;
  onDiscuss: () => void;
  delay?: number;
  showFullDetails?: boolean;
}

export const IntelligentRecommendationCard: React.FC<IntelligentRecommendationCardProps> = ({
  task,
  onStart,
  onDiscuss,
  delay = 0,
  showFullDetails = false
}) => {
  const completedSteps = task.steps.filter(step => step.isCompleted).length;
  const totalSteps = task.steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isCompleted = progress === 100;
  const isInProgress = progress > 0 && progress < 100;

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500/20 text-red-700 border-red-200 dark:text-red-300 dark:border-red-800';
      case 2: return 'bg-orange-500/20 text-orange-700 border-orange-200 dark:text-orange-300 dark:border-orange-800';
      case 3: return 'bg-blue-500/20 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      default: return 'Low';
    }
  };

  const getCardGradient = () => {
    if (isCompleted) return 'from-green-50 to-emerald-50 border-green-200/50 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800/30';
    if (isInProgress) return 'from-blue-50 to-indigo-50 border-blue-200/50 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800/30';
    if (!task.isUnlocked) return 'from-gray-50 to-slate-50 border-gray-200/50 dark:from-gray-950/20 dark:to-slate-950/20 dark:border-gray-800/30';
    return 'from-purple-50 to-indigo-50 border-purple-200/50 dark:from-purple-950/20 dark:to-indigo-950/20 dark:border-purple-800/30';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className={`bg-gradient-to-br ${getCardGradient()} transition-all duration-200 hover:shadow-lg`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {isInProgress && <TrendingUp className="w-5 h-5 text-blue-600" />}
                {!task.isUnlocked && <Lock className="w-5 h-5 text-gray-500" />}
                {task.isUnlocked && !isInProgress && !isCompleted && <Sparkles className="w-5 h-5 text-purple-600" />}
                <span className={!task.isUnlocked ? 'text-gray-500' : ''}>{task.title}</span>
              </CardTitle>
              <p className={`text-sm mt-1 ${!task.isUnlocked ? 'text-gray-400' : 'text-muted-foreground'}`}>
                {task.description}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={`${getPriorityColor(task.priority)} ml-2 flex-shrink-0`}
            >
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress bar for started tasks */}
          {totalSteps > 0 && (isInProgress || isCompleted) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {completedSteps}/{totalSteps} steps
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Task metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{task.estimatedTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{task.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              <span className="text-xs">{task.agentId}</span>
            </div>
          </div>

          {/* Steps preview for full details view */}
          {showFullDetails && totalSteps > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Task Steps</h4>
              <div className="space-y-1">
                {task.steps.slice(0, 3).map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      step.isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <span className={step.isCompleted ? 'line-through text-muted-foreground' : ''}>
                      {step.title}
                    </span>
                  </div>
                ))}
                {totalSteps > 3 && (
                  <div className="text-xs text-muted-foreground ml-4">
                    +{totalSteps - 3} more steps...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {task.isUnlocked && !isCompleted && (
              <Button 
                onClick={onStart}
                size="sm" 
                className="flex-1"
                variant={isInProgress ? "outline" : "default"}
              >
                <Play className="w-4 h-4 mr-1" />
                {isInProgress ? 'Continue' : 'Start Task'}
              </Button>
            )}
            
            {isCompleted && (
              <Button 
                size="sm" 
                className="flex-1"
                variant="outline"
                disabled
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Completed
              </Button>
            )}

            {!task.isUnlocked && (
              <Button 
                size="sm" 
                className="flex-1"
                variant="outline"
                disabled
              >
                <Lock className="w-4 h-4 mr-1" />
                Locked
              </Button>
            )}

            <Button 
              onClick={onDiscuss}
              size="sm" 
              variant="outline"
              className="flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Discuss
            </Button>
          </div>

          {/* AI reasoning (show why this is recommended) */}
          {task.isUnlocked && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: delay + 0.2 }}
              className="bg-primary/5 rounded-lg p-3 border border-primary/10"
            >
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-primary">
                  <span className="font-medium">AI Insight:</span> This task is recommended based on your current maturity level and business goals. It will help you advance in {task.category.toLowerCase()}.
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};