
import React from 'react';
import { CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { MaturityScoreDisplay } from './MaturityScoreDisplay';
import { QuickStatsCards } from './QuickStatsCards';
import { TaskManagementInterface } from './TaskManagementInterface';
import { useIsMobile } from '@/hooks/use-mobile';

interface OptimizedTaskBasedDashboardProps {
  maturityScores: CategoryScore | null;
  recommendedAgents: RecommendedAgents;
  enabledAgents: string[];
  language: 'en' | 'es';
  onSelectAgent: (id: string) => void;
  onMaturityCalculatorClick: () => void;
}

export const OptimizedTaskBasedDashboard: React.FC<OptimizedTaskBasedDashboardProps> = ({
  maturityScores,
  recommendedAgents,
  enabledAgents,
  language,
  onSelectAgent,
  onMaturityCalculatorClick
}) => {
  const isMobile = useIsMobile();

  const translations = {
    en: {
      welcome: 'Welcome to your Creative Workspace',
      subtitle: 'Your personalized AI-powered creative assistance platform',
      insights: 'Your Creative Insights',
      quickStats: 'Quick Stats'
    },
    es: {
      welcome: 'Bienvenido a tu Espacio Creativo',
      subtitle: 'Tu plataforma personalizada de asistencia creativa impulsada por IA',
      insights: 'Tus Insights Creativos',
      quickStats: 'Estadísticas Rápidas'
    }
  };

  const t = translations[language];

  return (
    <div className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
          {t.welcome}
        </h1>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
          {t.subtitle}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-4`}>
          {t.quickStats}
        </h2>
        <QuickStatsCards 
          maturityScores={maturityScores}
          enabledAgentsCount={enabledAgents.length}
          tasksCount={0} // Will be calculated from TaskManagementInterface
          language={language}
        />
      </div>

      {/* Layout: Mobile Stack, Desktop Grid */}
      <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>
        {/* Main Task Management Section */}
        <div className={`${isMobile ? '' : 'lg:col-span-2'}`}>
          <TaskManagementInterface
            maturityScores={maturityScores}
            profileData={null}
            enabledAgents={enabledAgents}
            language={language}
            onSelectAgent={onSelectAgent}
          />
        </div>

        {/* Insights Sidebar */}
        <div className={`${isMobile ? '' : 'lg:col-span-1'}`}>
          <div className="flex items-center mb-4">
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mr-2`}>
              {t.insights}
            </h2>
          </div>
          
          <div className="space-y-4">
            {maturityScores && (
              <MaturityScoreDisplay 
                scores={maturityScores}
                language={language}
                compact={isMobile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
