import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Target, BarChart3, Calendar } from 'lucide-react';
import { CategoryScore } from '@/types/dashboard';
import { MaturityProgressIndicator } from './MaturityProgressIndicator';
import { useLanguage } from '@/context/LanguageContext';
import { useMaturityScores } from '@/hooks/useMaturityScores';
import { useUserData } from '@/hooks/useUserData';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

export const UserProgressDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);
  const { currentScores, scoreHistory } = useMaturityScores();
  const { agents } = useUserData();

  const translations = {
    en: {
      title: 'Progress Dashboard',
      subtitle: 'Track your business maturity evolution',
      backToDashboard: 'Back to Digital Workshop',
      overallProgress: 'Overall Progress',
      maturityEvolution: 'Maturity Evolution',
      taskProgress: 'Task Progress',
      recentMilestones: 'Recent Milestones',
      noData: 'No progress data available yet. Complete your first maturity assessment to see your progress.',
      takeAssessment: 'Take Maturity Assessment',
      activeAgents: 'Active Agents',
      completedTasks: 'Completed Tasks',
      lastAssessment: 'Last Assessment'
    },
    es: {
      title: 'Dashboard de Progreso',
      subtitle: 'Sigue la evolución de la madurez de tu negocio',
      backToDashboard: 'Volver al Taller Digital',
      overallProgress: 'Progreso General',
      maturityEvolution: 'Evolución de Madurez',
      taskProgress: 'Progreso de Tareas',
      recentMilestones: 'Hitos Recientes',
      noData: 'No hay datos de progreso disponibles aún. Completa tu primera evaluación de madurez para ver tu progreso.',
      takeAssessment: 'Hacer Evaluación de Madurez',
      activeAgents: 'Agentes Activos',
      completedTasks: 'Tareas Completadas',
      lastAssessment: 'Última Evaluación'
    }
  };

  const t = translations[compatibleLanguage];

  const handleBackToDashboard = () => {
    navigate('/dashboard/home');
  };

  const handleTakeAssessment = () => {
    navigate('/maturity-calculator');
  };

  // Calculate task statistics
  const activeAgentsCount = agents.filter(agent => agent.is_enabled).length;
  const totalUsageCount = agents.reduce((sum, agent) => sum + (agent.usage_count || 0), 0);
  
  // Get last assessment date
  const lastAssessmentDate = scoreHistory.length > 0 
    ? new Date(scoreHistory[0].created_at).toLocaleDateString('en-US')
    : null;

  // Calculate progress metrics
  const getProgressComparison = () => {
    if (scoreHistory.length < 2) return null;
    
    const latest = scoreHistory[0];
    const previous = scoreHistory[1];
    
    const latestScores = {
      ideaValidation: latest.idea_validation,
      userExperience: latest.user_experience,
      marketFit: latest.market_fit,
      monetization: latest.monetization
    };
    
    const previousScores = {
      ideaValidation: previous.idea_validation,
      userExperience: previous.user_experience,
      marketFit: previous.market_fit,
      monetization: previous.monetization
    };
    
    const latestAvg = Object.values(latestScores).reduce((a, b) => a + b, 0) / 4;
    const previousAvg = Object.values(previousScores).reduce((a, b) => a + b, 0) / 4;
    
    return {
      improvement: latestAvg - previousAvg,
      latest: latestAvg,
      previous: previousAvg
    };
  };

  const progressComparison = getProgressComparison();

  if (!currentScores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToDashboard}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToDashboard}
            </Button>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">{t.title}</h2>
              <p className="text-muted-foreground mb-8">{t.noData}</p>
              <Button onClick={handleTakeAssessment} size="lg">
                <Target className="w-5 h-5 mr-2" />
                {t.takeAssessment}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToDashboard}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToDashboard}
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Progress Card */}
          <div className="lg:col-span-2">
            <MaturityProgressIndicator
              maturityScores={currentScores}
              completedTasksCount={totalUsageCount}
              totalTasksCount={Math.max(totalUsageCount + 5, 20)} // Estimated total
              language={compatibleLanguage}
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Active Agents Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t.activeAgents}</h3>
              </div>
              <div className="text-3xl font-bold text-primary">
                {activeAgentsCount}
              </div>
            </Card>

            {/* Completed Tasks Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t.completedTasks}</h3>
              </div>
              <div className="text-3xl font-bold text-primary">
                {totalUsageCount}
              </div>
            </Card>

            {/* Last Assessment Card */}
            {lastAssessmentDate && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{t.lastAssessment}</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  {lastAssessmentDate}
                </div>
              </Card>
            )}

            {/* Progress Comparison */}
            {progressComparison && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{t.maturityEvolution}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso:</span>
                    <span className={`font-semibold ${
                      progressComparison.improvement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {progressComparison.improvement > 0 ? '+' : ''}
                      {progressComparison.improvement.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Actual:</span>
                    <span className="font-semibold">{progressComparison.latest.toFixed(1)}%</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};