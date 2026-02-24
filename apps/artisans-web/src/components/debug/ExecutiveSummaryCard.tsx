import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  Sparkles
} from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: {
    businessReadiness: number;
    profileCompleteness: number;
    activeTasksCount: number;
    completedTasksCount: number;
    topPriorities: string[];
    businessInsights: string[];
    nextRecommendedActions: string[];
    masterCoordinatorContext: any;
  };
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryProps> = ({ summary }) => {
  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };
  
  const getReadinessStatus = (score: number) => {
    if (score >= 80) return '🚀 Excelente';
    if (score >= 60) return '📈 En Progreso';
    return '🌱 Iniciando';
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Resumen Ejecutivo del Negocio
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Analizado por IA
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Business Readiness Score */}
        <div className={`p-6 rounded-xl border-2 ${getReadinessColor(summary.businessReadiness)}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium opacity-80">Business Readiness Score</p>
              <p className="text-4xl font-bold mt-1">{summary.businessReadiness}%</p>
            </div>
            <div className="text-right">
              <div className="text-5xl mb-1">
                {summary.businessReadiness >= 80 ? '🎯' : 
                 summary.businessReadiness >= 60 ? '📊' : '🌱'}
              </div>
              <p className="text-sm font-semibold">{getReadinessStatus(summary.businessReadiness)}</p>
            </div>
          </div>
          <Progress value={summary.businessReadiness} className="h-3" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-900">Perfil</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.profileCompleteness}%</p>
          </div>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs font-medium text-green-900">Completadas</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{summary.completedTasksCount}</p>
          </div>
          
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-medium text-orange-900">En Progreso</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{summary.activeTasksCount}</p>
          </div>
          
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-900">Prioridades</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{summary.topPriorities.length}</p>
          </div>
        </div>

        {/* Business Insights */}
        {summary.businessInsights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Insights del Negocio</h3>
            </div>
            {summary.businessInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <span className="text-base">{insight}</span>
              </div>
            ))}
          </div>
        )}

        {/* Top Priorities */}
        {summary.topPriorities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Prioridades Principales</h3>
            </div>
            <div className="space-y-2">
              {summary.topPriorities.slice(0, 3).map((priority, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <Badge variant="default" className="shrink-0">#{index + 1}</Badge>
                  <p className="text-sm font-medium">{priority}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Recommended Actions */}
        {summary.nextRecommendedActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Próximos Pasos Recomendados</h3>
            </div>
            <div className="space-y-2">
              {summary.nextRecommendedActions.map((action, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-r-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Master Coordinator Context Info */}
        {summary.masterCoordinatorContext && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Estado del Master Coordinator</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <p className="text-xs text-muted-foreground">Versión del Contexto</p>
                <p className="text-sm font-bold">v{summary.masterCoordinatorContext.context_version || 1}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Última Interacción</p>
                <p className="text-sm font-bold">
                  {summary.masterCoordinatorContext.last_interaction 
                    ? new Date(summary.masterCoordinatorContext.last_interaction).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
