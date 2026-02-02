
import { useState, useCallback } from 'react';
import { useUserData } from './useUserData';
import { useMaturityScores } from './useMaturityScores';
import { useAgentRecommendations } from './useAgentRecommendations';
import { Agent, CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { culturalAgentsDatabase } from '@/data/agentsDatabase';

type ActiveSection = 'dashboard' | 'agent-details';

export const useDashboardState = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Use hooks with error handling
  const { 
    profile, 
    agents: userAgents, 
    enableAgent,
    disableAgent,
    loading: userDataLoading,
    error: userDataError
  } = useUserData();
  
  const { 
    currentScores,
    loading: scoresLoading,
    error: scoresError
  } = useMaturityScores();
  
  const recommendedAgents = useAgentRecommendations({ 
    maturityScores: currentScores,
    userProfile: profile 
  });

  // Debug logging
  console.log('useDashboardState:', {
    userAgents: userAgents.length,
    currentScores,
    recommendedAgents,
    profile,
    userDataLoading,
    scoresLoading,
    userDataError,
    scoresError
  });

  // Convert user agents to Agent format with fallbacks
  const agents: Agent[] = culturalAgentsDatabase.map(agentInfo => {
    const userAgent = userAgents.find(ua => ua.agent_id === agentInfo.id);
    
    return {
      id: agentInfo.id,
      name: agentInfo.name,
      status: userAgent?.is_enabled ? 'active' : 'inactive',
      category: agentInfo.category,
      activeTasks: userAgent?.usage_count || 0,
      lastUsed: userAgent?.last_used_at ? new Date(userAgent.last_used_at).toLocaleDateString() : undefined,
      color: agentInfo.color,
      icon: agentInfo.icon
    };
  });

  // Provide fallback maturity scores if none exist
  const fallbackScores: CategoryScore = {
    ideaValidation: 20,
    userExperience: 15,
    marketFit: 10,
    monetization: 5
  };

  const finalScores = currentScores || fallbackScores;

  const handleSelectAgent = useCallback((agentId: string) => {
    console.log('Selecting agent:', agentId);
    setSelectedAgent(agentId);
    setActiveSection('agent-details');
  }, []);

  const handleBackFromAgentDetails = useCallback(() => {
    console.log('Returning from agent details');
    setSelectedAgent(null);
    setActiveSection('dashboard');
  }, []);

  const handleMaturityCalculatorClick = useCallback(() => {
    console.log('Maturity calculator clicked');
    // This will be handled by the component using this hook
  }, []);

  const handleAgentToggle = useCallback(async (agentId: string, enabled: boolean) => {
    console.log('Toggling agent:', agentId, enabled);
    try {
      if (enabled) {
        await enableAgent(agentId);
      } else {
        await disableAgent(agentId);
      }
    } catch (error) {
      console.error('Error toggling agent:', error);
    }
  }, [enableAgent, disableAgent]);

  return {
    activeSection,
    selectedAgent,
    agents,
    maturityScores: finalScores,
    recommendedAgents,
    profileData: profile,
    handleSelectAgent,
    handleBackFromAgentDetails,
    handleMaturityCalculatorClick,
    handleAgentToggle
  };
};
