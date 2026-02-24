
import { useMemo } from 'react';
import { CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { generateMaturityBasedRecommendations } from '@/utils/maturityRecommendations';

interface UseAgentRecommendationsProps {
  maturityScores: CategoryScore | null;
  userProfile?: any; // Could be extended with user profile data
}

export const useAgentRecommendations = ({ 
  maturityScores, 
  userProfile 
}: UseAgentRecommendationsProps): RecommendedAgents => {
  
  return useMemo(() => {
    if (!maturityScores) {
      // Default recommendations for new users
      return {
        primary: ['cultural-consultant', 'project-manager', 'cost-calculator'],
        secondary: ['content-creator', 'marketing-advisor', 'legal-advisor'],
        admin: true,
        cultural: true,
        accounting: false,
        legal: false,
        operations: true
      };
    }

    // Generate recommendations based on maturity scores
    return generateMaturityBasedRecommendations(maturityScores);
  }, [maturityScores, userProfile]);
};
