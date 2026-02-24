import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertCircle, Lightbulb, Star, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserInsights {
  total_tasks: number;
  completed_tasks: number;
  active_conversations: number;
  total_deliverables: number;
  agent_insights: Array<{
    agent_id: string;
    agent_name: string;
    task_count: number;
    completed_tasks: number;
    progress_percentage: number;
  }>;
}

interface IntelligentInsightsProps {
  insights: UserInsights;
  language: 'en' | 'es';
  onActionClick?: (action: string) => void;
}

export const IntelligentInsights: React.FC<IntelligentInsightsProps> = ({ 
  insights, 
  language,
  onActionClick 
}) => {
  const t = {
    en: {
      title: "Intelligent Insights",
      overallProgress: "Overall Progress",
      keyMetrics: "Key Metrics",
      recommendations: "Smart Recommendations",
      opportunities: "Growth Opportunities",
      totalTasks: "Total Tasks",
      activeSessions: "Active Sessions", 
      deliverables: "Deliverables",
      completionRate: "Completion Rate",
      topPerforming: "Top Performing Agent",
      needsAttention: "Needs Attention",
      excellentProgress: "Excellent progress!",
      goodMomentum: "Good momentum",
      roomForImprovement: "Room for improvement",
      takeAction: "Take Action"
    },
    es: {
      title: "Insights Inteligentes",
      overallProgress: "Progreso General",
      keyMetrics: "Métricas Clave",
      recommendations: "Recomendaciones Inteligentes", 
      opportunities: "Oportunidades de Crecimiento",
      totalTasks: "Total de Tareas",
      activeSessions: "Sesiones Activas",
      deliverables: "Entregables",
      completionRate: "Tasa de Finalización",
      topPerforming: "Agente Destacado",
      needsAttention: "Necesita Atención",
      excellentProgress: "¡Excelente progreso!",
      goodMomentum: "Buen impulso",
      roomForImprovement: "Margen de mejora",
      takeAction: "Tomar Acción"
    }
  };

  const overallCompletionRate = insights.total_tasks > 0 
    ? Math.round((insights.completed_tasks / insights.total_tasks) * 100)
    : 0;

  const topAgent = insights.agent_insights.reduce((top, agent) => 
    agent.progress_percentage > (top?.progress_percentage || 0) ? agent : top
  , insights.agent_insights[0]);

  const strugglingAgent = insights.agent_insights.reduce((struggling, agent) => 
    agent.progress_percentage < (struggling?.progress_percentage || 100) ? agent : struggling
  , insights.agent_insights[0]);

  const getProgressStatus = (rate: number) => {
    if (rate >= 80) return { text: t[language].excellentProgress, color: 'text-green-600' };
    if (rate >= 50) return { text: t[language].goodMomentum, color: 'text-yellow-600' };
    return { text: t[language].roomForImprovement, color: 'text-red-600' };
  };

  const generateRecommendations = () => {
    const recommendations = [];

    if (overallCompletionRate < 50) {
      recommendations.push({
        icon: Target,
        text: language === 'es' 
          ? 'Enfócate en completar las tareas pendientes para impulsar tu progreso'
          : 'Focus on completing pending tasks to boost your progress',
        action: 'view-tasks',
        priority: 'high'
      });
    }

    if (insights.active_conversations < 2) {
      recommendations.push({
        icon: TrendingUp,
        text: language === 'es'
          ? 'Inicia más conversaciones con agentes especializados para obtener mejores insights'
          : 'Start more conversations with specialized agents for better insights',
        action: 'explore-agents',
        priority: 'medium'
      });
    }

    if (strugglingAgent && strugglingAgent.progress_percentage < 30) {
      recommendations.push({
        icon: AlertCircle,
        text: language === 'es'
          ? `El ${strugglingAgent.agent_name} necesita más atención para mejorar resultados`
          : `${strugglingAgent.agent_name} needs more attention to improve results`,
        action: `focus-agent-${strugglingAgent.agent_id}`,
        priority: 'medium'
      });
    }

    if (insights.total_deliverables > 5) {
      recommendations.push({
        icon: Star,
        text: language === 'es'
          ? 'Excelente trabajo generando entregables. Considera implementar las recomendaciones'
          : 'Great job generating deliverables. Consider implementing the recommendations',
        action: 'review-deliverables',
        priority: 'low'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();
  const progressStatus = getProgressStatus(overallCompletionRate);

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t[language].overallProgress}
          </h3>
          <span className={`text-sm font-medium ${progressStatus.color}`}>
            {progressStatus.text}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{t[language].completionRate}</span>
              <span className="text-lg font-bold text-gray-900">{overallCompletionRate}%</span>
            </div>
            <Progress value={overallCompletionRate} className="h-3" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{insights.total_tasks}</div>
              <div className="text-xs text-gray-500">{t[language].totalTasks}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{insights.active_conversations}</div>
              <div className="text-xs text-gray-500">{t[language].activeSessions}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{insights.total_deliverables}</div>
              <div className="text-xs text-gray-500">{t[language].deliverables}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Agent Performance Highlights */}
      {topAgent && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t[language].keyMetrics}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {t[language].topPerforming}
                </span>
              </div>
              <div className="text-lg font-semibold text-green-900">
                {topAgent.agent_name}
              </div>
              <div className="text-sm text-green-700">
                {topAgent.progress_percentage}% {language === 'es' ? 'completado' : 'completed'}
              </div>
            </div>
            
            {strugglingAgent && strugglingAgent.progress_percentage < 50 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {t[language].needsAttention}
                  </span>
                </div>
                <div className="text-lg font-semibold text-amber-900">
                  {strugglingAgent.agent_name}
                </div>
                <div className="text-sm text-amber-700">
                  {strugglingAgent.progress_percentage}% {language === 'es' ? 'completado' : 'completed'}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t[language].recommendations}
          </h3>
          
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const IconComponent = rec.icon;
              const priorityColor = {
                high: 'border-red-200 bg-red-50',
                medium: 'border-yellow-200 bg-yellow-50', 
                low: 'border-green-200 bg-green-50'
              }[rec.priority];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${priorityColor} hover:shadow-sm transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 text-gray-600 mt-0.5" />
                      <p className="text-sm text-gray-700 flex-1">{rec.text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActionClick?.(rec.action)}
                      className="ml-4 shrink-0"
                    >
                      {t[language].takeAction}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};