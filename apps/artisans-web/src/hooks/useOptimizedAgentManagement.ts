
import { useMemo } from 'react';
import { Agent } from '@/types/dashboard';
import { culturalAgentsDatabase } from '@/data/agentsDatabase';
import { useUnifiedUserData } from './user/useUnifiedUserData';
import { useAgentRecommendations } from './useAgentRecommendations';

export const useOptimizedAgentManagement = () => {
  const {
    profile,
    context,
    loading: userDataLoading,
    error: userDataError,
  } = useUnifiedUserData();

  const maturityScores = context?.taskGenerationContext?.maturityScores;
  const scoresLoading = false; // No separate loading since it's part of unified data
  const scoresError = null; // Error is in userDataError

  const recommendedAgents = useAgentRecommendations({
    maturityScores,
    userProfile: profile ? {
      id: profile.userId,
      user_id: profile.userId,
      full_name: profile.fullName || null,
      avatar_url: profile.avatarUrl || null,
      created_at: profile.createdAt || new Date().toISOString(),
      updated_at: profile.updatedAt || new Date().toISOString()
    } : null
  });

  console.log('useOptimizedAgentManagement: Processing data');

  // Transform agents with error handling
  const agents: Agent[] = useMemo(() => {
    if (!culturalAgentsDatabase || !Array.isArray(culturalAgentsDatabase)) {
      console.warn('useOptimizedAgentManagement: agentsDatabase not available');
      return [];
    }

    try {
      return culturalAgentsDatabase.map(agentInfo => {
        // For now, return all agents as inactive since we don't have user agents in unified data
        return {
          id: agentInfo.id,
          name: agentInfo.name,
          status: 'inactive' as 'active' | 'inactive',
          category: agentInfo.category,
          activeTasks: 0,
          lastUsed: undefined,
          color: agentInfo.color,
          icon: agentInfo.icon
        };
      });
    } catch (error) {
      console.error('useOptimizedAgentManagement: Error transforming agents:', error);
      return [];
    }
  }, []);

  const isLoading = userDataLoading || scoresLoading;
  const error = userDataError || scoresError;
  const hasOnboarding = false; // Deprecated field

  console.log('useOptimizedAgentManagement: Final state', {
    agentsCount: agents.length,
    isLoading,
    hasOnboarding
  });

  return {
    agents,
    profile: profile ? {
      id: profile.userId,
      user_id: profile.userId,
      full_name: profile.fullName || null,
      avatar_url: profile.avatarUrl || null,
      created_at: profile.createdAt || new Date().toISOString(),
      updated_at: profile.updatedAt || new Date().toISOString()
    } : null,
    projects: [], // No longer fetching projects
    maturityScores,
    recommendedAgents,
    isLoading,
    error,
    hasOnboarding
  };
};
