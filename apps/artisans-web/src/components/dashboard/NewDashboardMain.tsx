
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Agent, CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { ModernDashboardMain } from './ModernDashboardMain';

interface NewDashboardMainProps {
  onSelectAgent: (id: string) => void;
  onMaturityCalculatorClick: () => void;
  agents: Agent[];
  maturityScores: CategoryScore | null;
  recommendedAgents: RecommendedAgents;
  profileData: any | null;
}

export const NewDashboardMain: React.FC<NewDashboardMainProps> = ({ 
  onSelectAgent,
  onMaturityCalculatorClick,
  agents,
  maturityScores,
  recommendedAgents,
  profileData
}) => {
  return (
    <ModernDashboardMain
      onSelectAgent={onSelectAgent}
      onMaturityCalculatorClick={onMaturityCalculatorClick}
      agents={agents}
      maturityScores={maturityScores}
      recommendedAgents={recommendedAgents}
      profileData={profileData}
    />
  );
};
