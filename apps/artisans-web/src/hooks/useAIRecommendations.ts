
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CategoryScore } from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';
import { AIRecommendation, OptimizedRecommendedTask } from './types/recommendedTasksTypes';
import { getAvailableAgents } from './utils/taskGenerationUtils';

export const useAIRecommendations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchAIRecommendations = async (maturityScores: CategoryScore): Promise<AIRecommendation[]> => {
    if (!maturityScores || !user) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { 
          scores: maturityScores, 
          profileData: {}, 
          language: 'es' 
        }
      });

      if (error) {
        console.error('Error fetching AI recommendations:', error);
        return [];
      }

      return data?.recommendations || [];
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const convertAIRecommendationsToTasks = (recommendations: AIRecommendation[], enabledAgents: string[]): OptimizedRecommendedTask[] => {
    const availableAgents = getAvailableAgents(enabledAgents);
    
    return recommendations.map((rec, index) => {
      // Map AI recommendations to appropriate available agents
      let selectedAgent = availableAgents.find(agent => 
        agent.expertise.some(exp => 
          rec.title.toLowerCase().includes(exp.toLowerCase()) ||
          rec.description.toLowerCase().includes(exp.toLowerCase())
        )
      );
      
      // Fallback to first available agent if no match found
      if (!selectedAgent && availableAgents.length > 0) {
        selectedAgent = availableAgents[0];
      }

      if (!selectedAgent) {
        return null; // Skip if no agents available
      }

      const priority = (rec.priority === 'Alta' || rec.priority === 'High') ? 'high' : 
                      (rec.priority === 'Media' || rec.priority === 'Medium') ? 'medium' : 'low';

      return {
        id: `ai-rec-${index}`,
        title: rec.title,
        description: rec.description,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        priority,
        category: 'IA Recomendado',
        estimatedTime: rec.timeframe || '1-2 horas',
        prompt: `Basado en mi evaluación de madurez, me recomendaste: "${rec.title}". ${rec.description}. ¿Puedes ayudarme a desarrollar un plan específico para implementar esta recomendación?`,
        completed: false,
        isRealAgent: true
      };
    }).filter(Boolean) as OptimizedRecommendedTask[];
  };

  return {
    fetchAIRecommendations,
    convertAIRecommendationsToTasks,
    loading
  };
};
