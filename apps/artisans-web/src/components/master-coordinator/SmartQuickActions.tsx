import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  MessageCircle, 
  Target, 
  TrendingUp,
  Clock,
  Brain,
  Play,
  BarChart3,
  Lightbulb,
  Calendar,
  Users,
  FileText,
  Building2
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

interface SmartQuickActionsProps {
  language: 'en' | 'es';
  nextTask?: CoordinatorTask | null;
  onTaskStart: (taskId: string) => void;
  onOpenChat: () => void;
}

export const SmartQuickActions: React.FC<SmartQuickActionsProps> = ({
  language,
  nextTask,
  onTaskStart,
  onOpenChat
}) => {
  const [isBusinessDialogOpen, setIsBusinessDialogOpen] = useState(false);
  const translations = {
    en: {
      title: 'Smart Quick Actions',
      subtitle: 'AI-recommended actions based on your current progress',
      startNextTask: 'Start Priority Task',
      discussStrategy: 'Discuss Strategy',
      reviewProgress: 'Review Progress',
      getInsights: 'Get AI Insights',
      planWeek: 'Plan My Week',
      tellBusiness: 'Tell me about your business',
      nextTaskTitle: 'Next Priority Task',
      highPriority: 'High Priority',
      estimatedTime: 'Est. time',
      aiRecommended: 'AI Recommended'
    },
    es: {
      title: 'Acciones Rápidas Inteligentes',
      subtitle: 'Acciones recomendadas por IA basadas en tu progreso actual',
      startNextTask: 'Iniciar Tarea Prioritaria',
      discussStrategy: 'Discutir Estrategia',
      reviewProgress: 'Revisar Progreso',
      getInsights: 'Obtener Insights de IA',
      planWeek: 'Planificar Mi Semana',
      tellBusiness: 'Cuéntame sobre tu negocio',
      nextTaskTitle: 'Próxima Tarea Prioritaria',
      highPriority: 'Alta Prioridad',
      estimatedTime: 'Tiempo est.',
      aiRecommended: 'Recomendado por IA'
    }
  };

  const t = translations[language];

  const quickActions = [
    {
      id: 'discuss',
      title: t.discussStrategy,
      description: language === 'en' ? 'Get personalized guidance from your Master Coordinator' : 'Obtén orientación personalizada de tu Coordinador Maestro',
      icon: MessageCircle,
      color: 'bg-primary/10 text-primary border-primary/20',
      action: onOpenChat
    },
    {
      id: 'business',
      title: t.tellBusiness,
      description: language === 'en' ? 'Share details about your business for personalized recommendations' : 'Comparte detalles sobre tu negocio para recomendaciones personalizadas',
      icon: Building2,
      color: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
      action: () => setIsBusinessDialogOpen(true)
    },
    {
      id: 'insights',
      title: t.getInsights,
      description: language === 'en' ? 'Discover AI-powered business insights and opportunities' : 'Descubre insights empresariales impulsados por IA y oportunidades',
      icon: Brain,
      color: 'bg-accent/10 text-accent-foreground border-accent/20',
      action: onOpenChat
    },
    {
      id: 'plan',
      title: t.planWeek,
      description: language === 'en' ? 'Create a strategic weekly plan with task prioritization' : 'Crea un plan semanal estratégico con priorización de tareas',
      icon: Calendar,
      color: 'bg-muted/50 text-muted-foreground border-muted',
      action: onOpenChat
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          {t.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Priority Task Highlight */}
        {nextTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{t.nextTaskTitle}</span>
                  <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200 dark:text-red-300 dark:border-red-800">
                    {t.highPriority}
                  </Badge>
                </div>
                <h4 className="font-semibold text-primary mb-1">{nextTask.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{nextTask.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{nextTask.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    <span>{t.aiRecommended}</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => onTaskStart(nextTask.id)}
                className="ml-4 flex-shrink-0"
              >
                <Play className="w-4 h-4 mr-1" />
                {t.startNextTask}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${action.color} border`}
                onClick={action.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                      <p className="text-xs opacity-80">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-3 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg border border-secondary/20"
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-secondary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary mb-1">AI Insight</p>
              <p className="text-xs text-muted-foreground">
                Based on your current progress, focusing on your next priority task will unlock 2 additional opportunities and accelerate your business development by an estimated 30%.
              </p>
            </div>
          </div>
        </motion.div>

      </CardContent>

    </Card>
  );
};