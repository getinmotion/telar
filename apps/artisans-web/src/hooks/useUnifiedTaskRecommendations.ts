import { useState, useEffect, useCallback } from 'react';
import { CategoryScore } from '@/types/dashboard';
import { OptimizedRecommendedTask } from './types/recommendedTasksTypes';
import { supabase } from '@/integrations/supabase/client';

interface UseUnifiedTaskRecommendationsProps {
  maturityScores: CategoryScore | null;
  language?: 'en' | 'es';
}

export const useUnifiedTaskRecommendations = ({ 
  maturityScores, 
  language = 'en' 
}: UseUnifiedTaskRecommendationsProps) => {
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<OptimizedRecommendedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set());
  const [needsMoreInfo, setNeedsMoreInfo] = useState(false);

  const generateIntelligentRecommendations = useCallback(async () => {
    if (!user || !maturityScores) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('master-agent-coordinator', {
        body: {
          action: 'generate_intelligent_recommendations',
          userId: user.id,
          maturityScores,
          language
        }
      });

      if (error) throw error;

      if (data?.needsMoreInfo) {
        setNeedsMoreInfo(true);
        return;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        setNeedsMoreInfo(false);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to static recommendations
      generateFallbackRecommendations();

    } finally {
      setLoading(false);
    }
  }, [user, maturityScores, language]);

  const generateFallbackRecommendations = useCallback(() => {
    if (!maturityScores) return;

    const average = Object.values(maturityScores).reduce((a, b) => a + b, 0) / 4;
    let maturityLevel: 'explorador' | 'constructor' | 'estratega' | 'visionario' = 'explorador';
    if (average >= 80) maturityLevel = 'visionario';
    else if (average >= 60) maturityLevel = 'estratega';
    else if (average >= 40) maturityLevel = 'constructor';

    const tasksByLevel = {
      'explorador': [
        { 
          title: "Validate Business Concept",
          description: "Get expert validation on your business idea and market potential",
          agent: 'cultural-consultant',
          agentName: "Cultural Consultant",
          priority: 'high' as const,
          category: "Validation",
          estimatedTime: "2-3 hours",
          prompt: "Help me validate my business concept"
        },
        { 
          title: "Calculate Startup Costs",
          description: "Analyze costs and create financial projections for your business",
          agent: 'cost-calculator',
          agentName: "Cost Calculator",
          priority: 'high' as const,
          category: "Finance",
          estimatedTime: "1-2 hours",
          prompt: "Help me calculate my startup costs"
        }
      ],
      'constructor': [
        { 
          title: "Digital Marketing Strategy",
          description: "Create a comprehensive digital marketing plan",
          agent: 'marketing-advisor',
          agentName: "Marketing Advisor",
          priority: 'high' as const,
          category: "Marketing",
          estimatedTime: "30-60 min",
          prompt: "Help me create a marketing strategy"
        }
      ],
      'estratega': [
        { 
          title: "International Market Analysis",
          description: "Explore international expansion opportunities",
          agent: 'export-advisor',
          agentName: "Export Advisor",
          priority: 'high' as const,
          category: "Expansion",
          estimatedTime: "1-2 hours",
          prompt: "Help me analyze international markets"
        }
      ],
      'visionario': [
        { 
          title: "Scalability Strategy",
          description: "Develop advanced scaling strategies",
          agent: 'business-scaling',
          agentName: "Scaling Specialist",
          priority: 'high' as const,
          category: "Growth",
          estimatedTime: "1-2 hours",
          prompt: "Help me create a scalability strategy"
        }
      ]
    };

    const selectedTasks = tasksByLevel[maturityLevel] || tasksByLevel['explorador'];
    
    const fallbackTasks = selectedTasks.map(task => ({
      id: `rec_${Date.now()}_${Math.random()}`,
      title: task.title,
      description: task.description,
      agentId: task.agent,
      agentName: task.agentName,
      priority: task.priority,
      category: task.category,
      estimatedTime: task.estimatedTime,
      prompt: task.prompt,
      completed: false,
      isRealAgent: true
    }));

    setRecommendations(fallbackTasks);
  }, [maturityScores]);

  const markAsConverted = useCallback((taskId: string) => {
    setConvertedIds(prev => new Set(prev).add(taskId));
    // Generate new recommendation to replace the converted one
    generateIntelligentRecommendations();
  }, [generateIntelligentRecommendations]);

  const refreshRecommendations = useCallback(() => {
    generateIntelligentRecommendations();
  }, [generateIntelligentRecommendations]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (maturityScores && user) {
      generateIntelligentRecommendations();
    }
  }, [maturityScores, user, generateIntelligentRecommendations]);

  // Filter out converted tasks
  const activeRecommendations = recommendations.filter(task => !convertedIds.has(task.id));

  return {
    recommendations: activeRecommendations,
    loading,
    needsMoreInfo,
    markAsConverted,
    refreshRecommendations
  };
};