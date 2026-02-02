
import React from 'react';
import { Agent, CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { PremiumDashboardMain } from './PremiumDashboardMain';
import { MobileTaskBasedDashboard } from './mobile/MobileTaskBasedDashboard';
import { SimpleDashboardFallback } from './SimpleDashboardFallback';

interface ModernDashboardMainProps {
  onSelectAgent: (id: string) => void;
  onMaturityCalculatorClick: () => void;
  agents: Agent[];
  maturityScores: CategoryScore | null;
  recommendedAgents: RecommendedAgents;
  profileData: any | null;
}

export const ModernDashboardMain: React.FC<ModernDashboardMainProps> = (props) => {
  const isMobile = useIsMobile();

  console.log('ModernDashboardMain: Rendering', {
    agentsCount: props.agents.length,
    hasMaturityScores: !!props.maturityScores,
    hasProfileData: !!props.profileData,
    isMobile
  });

  // Show fallback if no basic data
  if (!props.maturityScores && (!props.agents || props.agents.length === 0)) {
    console.log('ModernDashboardMain: Showing fallback');
    return (
      <SimpleDashboardFallback 
        onMaturityCalculatorClick={props.onMaturityCalculatorClick}
      />
    );
  }

  // Render appropriate version
  if (isMobile) {
    console.log('ModernDashboardMain: Rendering mobile version');
    return (
      <MobileTaskBasedDashboard
        agents={props.agents}
        maturityScores={props.maturityScores}
        profileData={props.profileData}
        onSelectAgent={props.onSelectAgent}
        onMaturityCalculatorClick={props.onMaturityCalculatorClick}
      />
    );
  }

  console.log('ModernDashboardMain: Rendering desktop version');
  return <PremiumDashboardMain {...props} />;
};
