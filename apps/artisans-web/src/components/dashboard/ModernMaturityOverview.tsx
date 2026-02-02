
import React from 'react';
import { Button } from '@/components/ui/button';
import { CategoryScore } from '@/types/dashboard';
import { TrendingUp, Target, Users, DollarSign, RefreshCw } from 'lucide-react';
import { useMaturityScores } from '@/hooks/useMaturityScores';

interface ModernMaturityOverviewProps {
  currentScores: CategoryScore | null;
  language: 'en' | 'es';
  onRetakeAssessment: () => void;
}

export const ModernMaturityOverview: React.FC<ModernMaturityOverviewProps> = ({
  language,
  onRetakeAssessment
}) => {
  const { currentScores, loading, getScoreComparison } = useMaturityScores();

  const translations = {
    en: {
      title: "Business Maturity",
      retakeAssessment: "Retake",
      ideaValidation: "Idea Validation",
      userExperience: "User Experience", 
      marketFit: "Market Fit",
      monetization: "Monetization",
      noScores: "Complete your business maturity assessment",
      takeAssessment: "Take Assessment",
      overallProgress: "Overall"
    },
    es: {
      title: "Madurez de Negocio",
      retakeAssessment: "Repetir",
      ideaValidation: "Validación de Idea",
      userExperience: "Experiencia de Usuario",
      marketFit: "Ajuste de Mercado", 
      monetization: "Monetización",
      noScores: "Completa tu evaluación de madurez de negocio",
      takeAssessment: "Realizar Evaluación",
      overallProgress: "General"
    }
  };

  const t = translations[language];

  const scoreCategories = [
    {
      key: 'ideaValidation' as keyof CategoryScore,
      label: t.ideaValidation,
      icon: Target,
      color: 'from-primary to-primary',
      bgColor: 'from-primary/10 to-primary/10'
    },
    {
      key: 'userExperience' as keyof CategoryScore,
      label: t.userExperience,
      icon: Users,
      color: 'from-accent to-accent',
      bgColor: 'from-accent/10 to-accent/10'
    },
    {
      key: 'marketFit' as keyof CategoryScore,
      label: t.marketFit,
      icon: TrendingUp,
      color: 'from-secondary to-secondary',
      bgColor: 'from-secondary/10 to-secondary/10'
    },
    {
      key: 'monetization' as keyof CategoryScore,
      label: t.monetization,
      icon: DollarSign,
      color: 'from-primary to-accent',
      bgColor: 'from-primary/10 to-accent/10'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-secondary';
    if (score >= 60) return 'text-accent';
    return 'text-destructive';
  };

  const getScoreChange = (key: keyof CategoryScore) => {
    const comparison = getScoreComparison();
    if (!comparison) return null;
    
    const change = comparison[key];
    if (change === 0) return null;
    
    return {
      value: change,
      positive: change > 0
    };
  };

  const getOverallScore = () => {
    if (!currentScores) return 0;
    return Math.round(
      (currentScores.ideaValidation + 
       currentScores.userExperience + 
       currentScores.marketFit + 
       currentScores.monetization) / 4
    );
  };

  if (loading) {
    return (
      <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl animate-pulse">
        <div className="h-6 bg-muted rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-muted/50 rounded-lg p-3">
              <div className="h-16 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentScores) {
    return (
      <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl">
        <div className="text-center py-6">
          <Target className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t.noScores}</h3>
          <Button
            onClick={() => {
              window.location.href = '/maturity-calculator';
            }}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 border-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.takeAssessment}
          </Button>
        </div>
      </div>
    );
  }

  const overallScore = getOverallScore();

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">{t.title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{t.overallProgress}:</span>
            <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
          </div>
        </div>
        <Button
          onClick={() => {
            window.location.href = '/maturity-calculator?mode=review';
          }}
          size="sm"
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 border-0 rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 hover:scale-105"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          {t.retakeAssessment}
        </Button>
      </div>

      {/* Compact 2x2 grid for scores */}
      <div className="grid grid-cols-2 gap-3">
        {scoreCategories.map((category) => {
          const score = currentScores[category.key];
          const IconComponent = category.icon;
          const scoreChange = getScoreChange(category.key);
          
          return (
            <div
              key={category.key}
              className={`bg-gradient-to-br ${category.bgColor} backdrop-blur-sm rounded-lg p-3 border border-border hover:border-border/80 transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-6 h-6 bg-gradient-to-br ${category.color} rounded-md flex items-center justify-center`}>
                  <IconComponent className="w-3 h-3 text-primary-foreground" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                      {score}%
                    </span>
                    {scoreChange && (
                      <span className={`text-xs font-medium ${scoreChange.positive ? 'text-secondary' : 'text-destructive'}`}>
                        {scoreChange.positive ? '+' : ''}{scoreChange.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-foreground font-medium text-xs mb-2">{category.label}</p>
              
              {/* Compact progress bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
