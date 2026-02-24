import { supabase } from '@/integrations/supabase/client';
import { RecommendedAgents } from '@/types/dashboard';
import { getAllAgentIds } from '@/data/agentsDatabase';
import { createUserLocalStorage } from './userLocalStorageUtils';

export const createUserAgentsFromRecommendations = async (
  userId: string, 
  recommendations: RecommendedAgents
): Promise<boolean> => {
  if (!userId || !recommendations) {
    console.error('createUserAgentsFromRecommendations: Missing userId or recommendations');
    return false;
  }

  try {
    console.log('Creating user agents from recommendations:', recommendations);
    
    const agentsToCreate = [];
    const validAgentIds = getAllAgentIds();
    console.log('Valid agent IDs from database:', validAgentIds);
    
    // Validar y procesar agentes primarios
    if (recommendations.primary && Array.isArray(recommendations.primary)) {
      recommendations.primary.forEach(agentId => {
        if (agentId && typeof agentId === 'string' && validAgentIds.includes(agentId)) {
          agentsToCreate.push({ user_id: userId, agent_id: agentId, is_enabled: true });
        } else {
          console.warn(`Primary agent ID ${agentId} not found in valid agents list`);
        }
      });
    }
    
    // Validar y procesar agentes secundarios
    if (recommendations.secondary && Array.isArray(recommendations.secondary)) {
      recommendations.secondary.forEach(agentId => {
        if (agentId && typeof agentId === 'string' && validAgentIds.includes(agentId)) {
          // Evitar duplicados
          const isDuplicate = agentsToCreate.some(agent => agent.agent_id === agentId);
          if (!isDuplicate) {
            agentsToCreate.push({ user_id: userId, agent_id: agentId, is_enabled: true });
          }
        } else {
          console.warn(`Secondary agent ID ${agentId} not found in valid agents list`);
        }
      });
    }
    
    // Compatibilidad con formato legacy
    const legacyMappings = {
      cultural: 'cultural-consultant',
      admin: 'project-manager',
      accounting: 'cost-calculator',
      legal: 'collaboration-agreement',
      operations: 'maturity-evaluator'
    };

    Object.entries(legacyMappings).forEach(([key, agentId]) => {
      if (recommendations[key as keyof RecommendedAgents] && validAgentIds.includes(agentId)) {
        const isDuplicate = agentsToCreate.some(agent => agent.agent_id === agentId);
        if (!isDuplicate) {
          agentsToCreate.push({ user_id: userId, agent_id: agentId, is_enabled: true });
        }
      }
    });

    // Si no hay agentes recomendados, crear al menos el consultor cultural
    if (agentsToCreate.length === 0) {
      console.log('No agents recommended, adding default cultural consultant');
      agentsToCreate.push({ user_id: userId, agent_id: 'cultural-consultant', is_enabled: true });
    }

    console.log('Inserting agents:', agentsToCreate);

    // Usar UPSERT con ON CONFLICT para evitar errores de duplicados
    const { error } = await supabase
      .from('user_agents')
      .upsert(agentsToCreate, {
        onConflict: 'user_id,agent_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error creating user agents:', error);
      return false;
    }

    console.log('Successfully created/updated user agents:', agentsToCreate.length);
    return true;
  } catch (err) {
    console.error('Error in createUserAgentsFromRecommendations:', err);
    return false;
  }
};

export const markOnboardingComplete = (
  userId: string,
  maturityScores: any, 
  recommendedAgents: RecommendedAgents
): void => {
  try {
    const userLocalStorage = createUserLocalStorage(userId);
    if (maturityScores && typeof maturityScores === 'object') {
      userLocalStorage.setItem('maturityScores', JSON.stringify(maturityScores));
    }
    if (recommendedAgents && typeof recommendedAgents === 'object') {
      userLocalStorage.setItem('recommendedAgents', JSON.stringify(recommendedAgents));
    }
    userLocalStorage.setItem('onboardingCompleted', 'true');
    console.log('Onboarding marked as complete in user-namespaced localStorage');
  } catch (err) {
    console.error('Error marking onboarding complete:', err);
  }
};

export const resetOnboarding = (userId: string): void => {
  try {
    const userLocalStorage = createUserLocalStorage(userId);
    userLocalStorage.removeItem('maturityScores');
    userLocalStorage.removeItem('recommendedAgents');
    userLocalStorage.removeItem('onboardingCompleted');
    console.log('Onboarding data reset from user-namespaced localStorage');
  } catch (err) {
    console.error('Error resetting onboarding:', err);
  }
};

export const createFallbackData = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error('createFallbackData: No userId provided');
    return false;
  }

  try {
    console.log('Creating fallback data for user:', userId);
    
    const fallbackScores = {
      ideaValidation: 30,
      userExperience: 25,
      marketFit: 20,
      monetization: 15
    };
    
    const fallbackAgents: RecommendedAgents = {
      primary: ['cultural-consultant', 'cost-calculator'],
      secondary: ['marketing-advisor'],
      cultural: true,
      admin: false,
      accounting: true,
      legal: false,
      operations: false
    };
    
    // Guardar en user-namespaced localStorage
    markOnboardingComplete(userId, fallbackScores, fallbackAgents);
    
    // Crear agentes en BD
    const success = await createUserAgentsFromRecommendations(userId, fallbackAgents);
    
    if (success) {
      console.log('Fallback data created successfully');
      return true;
    } else {
      console.error('Failed to create user agents for fallback data');
      return false;
    }
    
  } catch (err) {
    console.error('Error creating fallback data:', err);
    return false;
  }
};
