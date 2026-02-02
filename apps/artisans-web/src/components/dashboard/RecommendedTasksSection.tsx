import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Lightbulb, User, Clock, Tag, EyeOff } from 'lucide-react';
import { useUnifiedTaskRecommendations } from '@/hooks/useUnifiedTaskRecommendations';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { motion, AnimatePresence } from 'framer-motion';

interface RecommendedTasksSectionProps {
  language: 'en' | 'es';
  maturityScores?: any;
}

const RecommendedTasksSection: React.FC<RecommendedTasksSectionProps> = ({
  language,
  maturityScores = {}
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const [convertingTasks, setConvertingTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { createTask } = useAgentTasks();

  const { 
    recommendations: recommendedTasks, 
    loading, 
    needsMoreInfo, 
    markAsConverted, 
    refreshRecommendations 
  } = useUnifiedTaskRecommendations({
    maturityScores,
    language
  });

  const { t } = useTranslations();

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'alta':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
      case 'media':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
      case 'baja':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleConvertToTask = async (recommendation: any) => {
    setConvertingTasks(prev => new Set(prev).add(recommendation.id));

    try {
      await createTask({
        title: recommendation.title,
        description: recommendation.description,
        agent_id: recommendation.agentId,
        relevance: recommendation.priority.toLowerCase() as 'high' | 'medium' | 'low',
        priority: recommendation.priority === 'high' ? 3 : recommendation.priority === 'medium' ? 2 : 1,
        status: 'pending' as const,
        progress_percentage: 0,
        notes: recommendation.prompt || '',
        subtasks: [],
        steps_completed: {},
        resources: [],
        time_spent: 0
      });

      toast({
        title: t.missionsDashboard.convertedSuccessfully,
        description: recommendation.title,
      });

      // Mark as converted and generate new recommendation
      markAsConverted(recommendation.id);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: t.missionsDashboard.errorConverting,
        description: recommendation.title,
        variant: "destructive"
      });
    } finally {
      setConvertingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(recommendation.id);
        return newSet;
      });
    }
  };

  // Limit to 3 for dashboard
  const activeRecommendations = recommendedTasks.slice(0, 3);

  if (isHidden) {
    return (
      <Card>
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => setIsHidden(false)}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <Target className="w-4 h-4 mr-2" />
            {t.missionsDashboard.showRecommendations}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              {t.missionsDashboard.recommendedTasks}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t.missionsDashboard.recommendedSubtitle}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHidden(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <EyeOff className="w-4 h-4 mr-1" />
            {t.missionsDashboard.hideRecommendations}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <AnimatePresence>
          {activeRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="border border-border/50 hover:border-purple-200 transition-all duration-200 hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-foreground leading-tight">
                          {recommendation.title}
                        </h4>
                        <Badge 
                          variant="outline"
                          className={`shrink-0 text-xs ${getPriorityColor(recommendation.priority)}`}
                        >
                          {recommendation.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {recommendation.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{recommendation.agentName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{recommendation.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{recommendation.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleConvertToTask(recommendation)}
                          disabled={convertingTasks.has(recommendation.id)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm px-4 py-2"
                          size="sm"
                        >
                          {convertingTasks.has(recommendation.id) ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                              {t.missionsDashboard.converting}
                            </div>
                          ) : (
                            t.missionsDashboard.convertToTask
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-8 h-8 border border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p>{t.missionsDashboard.generatingRecommendations}</p>
          </div>
        )}
        
        {!loading && needsMoreInfo && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="mb-4">{t.missionsDashboard.needMoreInfo}</p>
            <Button 
              variant="outline" 
              onClick={refreshRecommendations}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              {t.missionsDashboard.tryAgain}
            </Button>
          </div>
        )}
        
        {!loading && !needsMoreInfo && activeRecommendations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="mb-4">{t.missionsDashboard.noRecommendations}</p>
            <Button 
              variant="outline" 
              onClick={refreshRecommendations}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              {t.missionsDashboard.refreshRecommendations}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedTasksSection;