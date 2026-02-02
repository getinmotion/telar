import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompactTaskRecommendation {
  id: string;
  title: string;
  description: string;
  priority: number;
  relevance?: 'high' | 'medium' | 'low';
  estimatedTime: string;
  category?: string;
  isUnlocked?: boolean;
}

interface CompactPriorityRecommendationsProps {
  recommendations: CompactTaskRecommendation[];
  onTaskStart: (taskId: string) => void;
  onGenerateMore?: () => void;
  language: 'en' | 'es';
  loading?: boolean;
  startingTask?: string | null;
}

export const CompactPriorityRecommendations: React.FC<CompactPriorityRecommendationsProps> = ({
  recommendations,
  onTaskStart,
  onGenerateMore,
  language,
  loading = false,
  startingTask = null
}) => {
  const translations = {
    en: {
      title: 'Priority Tasks',
      subtitle: 'Next steps to accelerate your business',
      startNow: 'Start',
      starting: 'Starting...',
      generateMore: 'Generate More',
      noTasks: 'Ready to generate your next steps',
      generateDescription: 'Let me analyze your business and create personalized tasks'
    },
    es: {
      title: 'Tareas Prioritarias',
      subtitle: 'Próximos pasos para acelerar tu negocio',
      startNow: 'Empezar',
      starting: 'Iniciando...',
      generateMore: 'Generar Más',
      noTasks: 'Listo para generar tus próximos pasos',
      generateDescription: 'Déjame analizar tu negocio y crear tareas personalizadas'
    }
  };

  const t = translations[language];

  const getPriorityColor = (priority: number) => {
    if (priority <= 1) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (priority <= 2) return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 1) return language === 'es' ? 'Crítica' : 'Critical';
    if (priority <= 2) return language === 'es' ? 'Alta' : 'High';
    return language === 'es' ? 'Media' : 'Medium';
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-4 h-4 text-primary" />
          <span>{t.title}</span>
          <Badge variant="secondary" className="text-xs">
            {recommendations.length}
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.slice(0, 4).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-200 group"
              >
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {task.title}
                    </h4>
                    <Badge 
                      className={`text-xs px-1.5 py-0.5 ${getPriorityColor(task.priority)}`}
                    >
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimatedTime}</span>
                    </div>
                    {task.category && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {task.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  size="sm"
                  onClick={() => onTaskStart(task.id)}
                  disabled={startingTask === task.id || !task.isUnlocked}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 h-8 px-3 text-xs shrink-0"
                >
                  {startingTask === task.id ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">{t.starting}</span>
                    </div>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span className="hidden sm:inline ml-1">{t.startNow}</span>
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
            
            {recommendations.length > 4 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {/* Navigate to full tasks view */}}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver {recommendations.length - 4} tareas más...
                </Button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              {t.noTasks}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t.generateDescription}
            </p>
            {onGenerateMore && (
              <Button 
                onClick={onGenerateMore}
                disabled={loading}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {loading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'es' ? 'Generando...' : 'Generating...'}</span>
                  </div>
                ) : (
                  t.generateMore
                )}
              </Button>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};