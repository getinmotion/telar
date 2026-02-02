
import { useState, useEffect } from 'react';
import { CategoryScore } from '@/types/dashboard';
import { OptimizedRecommendedTask } from './types/recommendedTasksTypes';
import { generateRobustTasksFromScores } from './utils/taskGenerationUtils';
import { supabase } from '@/integrations/supabase/client';


export type { OptimizedRecommendedTask } from './types/recommendedTasksTypes';

export const useOptimizedRecommendedTasks = (maturityScores: CategoryScore | null, profileData: any | null, agentPool: string[] = []) => {
  const [tasks, setTasks] = useState<OptimizedRecommendedTask[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false by default
  const language = 'en'; // Fixed to English only

  useEffect(() => {
    // Only generate suggestions if we have the necessary data
    if (!maturityScores || agentPool.length === 0) {
      console.log('useOptimizedRecommendedTasks: Missing required data', {
        maturityScores: !!maturityScores,
        agentPoolLength: agentPool.length
      });
      setTasks([]);
      setLoading(false);
      return;
    }

    const loadSuggestions = async () => {
      setLoading(true);
      try {
        console.log('useOptimizedRecommendedTasks: Generating task suggestions', {
          maturityScores,
          agentPoolCount: agentPool.length
        });

        // Generate ONLY suggestions (never persist automatically)
        const scoreTasks = generateRobustTasksFromScores(maturityScores, agentPool);
        console.log('Score-based suggestions generated:', scoreTasks.length);
        
        let combinedSuggestions = [...scoreTasks];

        // Try to get AI recommendations if profile data exists
        if (profileData) {
          try {
            const { data, error } = await supabase.functions.invoke('maturity-analysis', {
              body: { scores: maturityScores, profileData, language }
            });

            if (error) {
              console.warn('AI recommendations failed:', error);
            } else if (data?.recommendations?.length > 0) {
              console.log('AI recommendations obtained:', data.recommendations.length);
              const aiSuggestions = convertAIRecommendationsToSuggestions(data.recommendations.slice(0, 2), agentPool);
              combinedSuggestions = [...aiSuggestions, ...scoreTasks];
            }
          } catch (e) {
            console.warn("AI recommendations fetch failed, using score-based suggestions.", e);
          }
        }
        
        // Limit suggestions to maximum 3
        const uniqueSuggestions = removeDuplicateSuggestions(combinedSuggestions);
        const finalSuggestions = prioritizeAndLimitSuggestions(uniqueSuggestions, 3);

        console.log('Final suggestions ready:', {
          totalCombined: combinedSuggestions.length,
          uniqueSuggestions: uniqueSuggestions.length,
          finalCount: finalSuggestions.length
        });
        
        setTasks(finalSuggestions);
      } catch (error) {
        console.error('Error loading task suggestions:', error);
        // Fallback to simple score-based suggestions
        if (maturityScores) {
          const emergencySuggestions = generateRobustTasksFromScores(maturityScores, agentPool);
          setTasks(prioritizeAndLimitSuggestions(emergencySuggestions, 2));
        } else {
          setTasks([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [maturityScores, profileData, agentPool.join(','), language]);

  const convertAIRecommendationsToSuggestions = (recommendations: any[], agentPool: string[]): OptimizedRecommendedTask[] => {
    if (!recommendations.length || !agentPool.length) return [];

    return recommendations.slice(0, 2).map((rec, index) => {
      const agentIndex = index % agentPool.length;
      const agentId = agentPool[agentIndex];
      
      const priority = (rec.priority === 'Alta' || rec.priority === 'High') ? 'high' : 
                      (rec.priority === 'Media' || rec.priority === 'Medium') ? 'medium' : 'low';

      return {
        id: `ai-suggestion-${index}-${Date.now()}`,
        title: rec.title,
        description: rec.description,
        agentId,
        agentName: `Agente IA ${index + 1}`,
        priority,
        category: 'Sugerida',
        estimatedTime: rec.timeframe || '1-2 horas',
        prompt: `Basado en mi evaluación: "${rec.title}". ${rec.description}. ¿Puedes ayudarme a desarrollar un plan específico?`,
        completed: false,
        isRealAgent: true
      };
    });
  };

  const removeDuplicateSuggestions = (suggestions: OptimizedRecommendedTask[]): OptimizedRecommendedTask[] => {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = suggestion.title.toLowerCase().substring(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const prioritizeAndLimitSuggestions = (suggestions: OptimizedRecommendedTask[], limit: number): OptimizedRecommendedTask[] => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return suggestions
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, limit);
  };

  const markTaskCompleted = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  // Nueva función para remover una sugerencia específica
  const removeSuggestion = (taskId: string) => {
    console.log('Removing suggestion:', taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Function to convert suggested task to real task (will be handled by createTask in TaskManagementInterface)
  const convertToRealTask = async (task: OptimizedRecommendedTask) => {
    console.log('Converting suggested task to real task:', task);
    // La lógica real de conversión se maneja en TaskManagementInterface
    // Esta función ahora solo se usa para logging
    return null;
  };

  return {
    tasks,
    loading,
    markTaskCompleted,
    convertToRealTask,
    removeSuggestion // Nueva función exportada
  };
};
