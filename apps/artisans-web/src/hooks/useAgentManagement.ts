
import React, { useState, useEffect, useCallback } from 'react';
import { Agent, CategoryScore, RecommendedAgents, ProfileType } from '@/types/dashboard';
import { culturalAgentsDatabase } from '@/data/agentsDatabase';
import { useUserData } from './useUserData';
import { useMaturityScores } from './useMaturityScores';
import { useAgentRecommendations } from './useAgentRecommendations';

type ActiveSection = 'dashboard' | 'agent-details';

export const useAgentManagement = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileType, setProfileType] = useState<ProfileType>('idea');
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use real data hooks
  const { 
    profile, 
    projects, 
    agents: userAgents, 
    loading: userDataLoading,
    error: userDataError 
  } = useUserData();
  
  const { 
    currentScores, 
    loading: scoresLoading,
    error: scoresError,
    saveMaturityScores 
  } = useMaturityScores();

  // Use the new recommendations hook
  const recommendedAgents = useAgentRecommendations({ 
    maturityScores: currentScores,
    userProfile: profile 
  });

  // Convert user agents to Agent format
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

  // Combined loading state
  useEffect(() => {
    setIsLoading(userDataLoading || scoresLoading);
  }, [userDataLoading, scoresLoading]);

  // Combined error state
  useEffect(() => {
    setError(userDataError || scoresError || null);
  }, [userDataError, scoresError]);

  // Check if user needs onboarding
  useEffect(() => {
    if (!isLoading && !error) {
      const hasScores = !!currentScores;
      const hasEnabledAgents = userAgents.some(agent => agent.is_enabled);
      
      console.log('Onboarding check:', { hasScores, hasEnabledAgents });
      
      if (!hasScores && !hasEnabledAgents) {
        setShowOnboarding(true);
      }
    }
  }, [currentScores, userAgents, isLoading, error]);

  const handleOnboardingComplete = useCallback(async (scores: CategoryScore, recommendedAgents: RecommendedAgents) => {
    console.log('Onboarding completed with scores and recommendations:', { scores, recommendedAgents });
    
    try {
      await saveMaturityScores(scores, {
        profileType: profileType,
        industry: 'musica',
        experience: scores.ideaValidation < 50 ? 'beginner' : 
                   scores.ideaValidation < 80 ? 'intermediate' : 'advanced'
      });
      
      setShowOnboarding(false);
      console.log('Onboarding data saved successfully');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setError('Error al guardar los datos del onboarding');
    }
  }, [saveMaturityScores, profileType]);

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

  const checkLocationStateForOnboarding = useCallback((locationState: any) => {
    if (locationState?.showOnboarding) {
      console.log('Location state indicates onboarding should be shown');
      setShowOnboarding(true);
      return true;
    }
    return false;
  }, []);

  return {
    agents,
    showOnboarding,
    profileType,
    activeSection,
    setActiveSection,
    selectedAgent,
    maturityScores: currentScores,
    recommendedAgents,
    isLoading,
    error,
    handleOnboardingComplete,
    handleSelectAgent,
    handleBackFromAgentDetails,
    checkLocationStateForOnboarding
  };
};
