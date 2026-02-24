
import React from 'react';
import { CategoryScore } from '@/types/dashboard';
import { TrendingUp, Users, Target, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickStatsCardsProps {
  maturityScores: CategoryScore | null;
  enabledAgentsCount: number;
  tasksCount: number;
  language: 'en' | 'es';
}

export const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({
  maturityScores,
  enabledAgentsCount,
  tasksCount,
  language
}) => {
  const isMobile = useIsMobile();

  const translations = {
    en: {
      maturityLevel: 'Maturity Level',
      activeAgents: 'Active Agents',
      pendingTasks: 'Pending Tasks',
      overallScore: 'Overall Score'
    },
    es: {
      maturityLevel: 'Nivel de Madurez',
      activeAgents: 'Agentes Activos',
      pendingTasks: 'Tareas Pendientes',
      overallScore: 'Puntuación General'
    }
  };

  const t = translations[language];

  const getMaturityLevel = () => {
    if (!maturityScores) return { level: 'N/A', percentage: 0 };
    
    const average = Object.values(maturityScores).reduce((a, b) => a + b, 0) / 4;
    
    if (average >= 70) return { level: language === 'en' ? 'Advanced' : 'Avanzado', percentage: Math.round(average) };
    if (average >= 40) return { level: language === 'en' ? 'Intermediate' : 'Intermedio', percentage: Math.round(average) };
    return { level: language === 'en' ? 'Beginner' : 'Principiante', percentage: Math.round(average) };
  };

  const maturityLevel = getMaturityLevel();

  const stats = [
    {
      label: t.maturityLevel,
      value: maturityLevel.level,
      subValue: `${maturityLevel.percentage}%`,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      label: t.activeAgents,
      value: enabledAgentsCount.toString(),
      icon: Users,
      color: 'blue'
    },
    {
      label: t.pendingTasks,
      value: tasksCount.toString(),
      icon: Target,
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'bg-accent/10 text-accent-foreground',
      blue: 'bg-primary/10 text-primary',
      green: 'bg-success/10 text-success'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'} text-gray-900`}>
              {stat.value}
              {stat.subValue && (
                <span className="text-sm text-gray-500 ml-1">{stat.subValue}</span>
              )}
            </p>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
