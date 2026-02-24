import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryScore } from '@/types/dashboard';
import { AgentTask } from '@/hooks/useAgentTasks';

export interface TaskEvolutionSuggestion {
  id: string;
  title: string;
  description: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  agentId: string;
  priority: number;
  unlockReason?: string;
}

export const useTaskEvolution = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<TaskEvolutionSuggestion[]>([]);

  const analyzeTaskEvolution = useCallback(async (
    completedTasks: AgentTask[],
    maturityScores: CategoryScore | null,
    userProfile: any
  ): Promise<TaskEvolutionSuggestion[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      // Call edge function for intelligent task evolution
      const { data, error } = await supabase.functions.invoke('master-agent-coordinator', {
        body: {
          action: 'evolve_tasks',
          completedTasks,
          maturityScores,
          userProfile,
          userId: user.id
        }
      });

      if (error) {
        console.error('Error analyzing task evolution:', error);
        // Fallback to local logic
        return generateFallbackSuggestions(completedTasks, maturityScores);
      }

      const newSuggestions = data?.suggestions || [];
      setSuggestions(newSuggestions);
      return newSuggestions;

    } catch (error) {
      console.error('Error in task evolution analysis:', error);
      return generateFallbackSuggestions(completedTasks, maturityScores);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const generateFallbackSuggestions = (
    completedTasks: AgentTask[],
    maturityScores: CategoryScore | null
  ): TaskEvolutionSuggestion[] => {
    const suggestions: TaskEvolutionSuggestion[] = [];
    
    // Analyze completed tasks to suggest next steps
    const completedCategories = new Set(
      completedTasks.map(task => task.agent_id || 'general')
    );

    // Financial progression
    if (completedCategories.has('financial-management')) {
      suggestions.push({
        id: 'advanced-financial-analytics',
        title: 'Implement Advanced Financial Analytics',
        description: 'Set up dashboards and KPIs to track your business performance',
        reason: 'You\'ve completed basic financial setup, time to get insights',
        impact: 'high',
        agentId: 'business-intelligence',
        priority: 90,
        unlockReason: 'Unlocked by completing financial management tasks'
      });
    }

    // Legal progression
    if (completedCategories.has('legal-advisor')) {
      suggestions.push({
        id: 'advanced-contracts',
        title: 'Create Service Agreement Templates',
        description: 'Develop standardized contracts for recurring services',
        reason: 'With basic legal structure in place, streamline your client contracts',
        impact: 'medium',
        agentId: 'legal-advisor',
        priority: 75
      });
    }

    // Marketing progression
    if (completedCategories.has('marketing-specialist')) {
      suggestions.push({
        id: 'automated-marketing-funnels',
        title: 'Build Automated Marketing Funnels',
        description: 'Create email sequences and lead nurturing campaigns',
        reason: 'Scale your marketing efforts with automation',
        impact: 'high',
        agentId: 'marketing-specialist',
        priority: 85
      });
    }

    // Based on maturity scores
    if (maturityScores) {
      const lowestScore = Math.min(...Object.values(maturityScores));
      const highestScore = Math.max(...Object.values(maturityScores));

      if (highestScore > 70 && lowestScore < 40) {
        // High variation - suggest balancing
        suggestions.push({
          id: 'balance-weak-areas',
          title: 'Strengthen Weak Business Areas',
          description: 'Focus on improving your lowest-performing business aspects',
          reason: 'Balance your business development across all areas',
          impact: 'high',
          agentId: 'cultural-consultant',
          priority: 95
        });
      }
    }

    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 3);
  };

  const acceptSuggestion = useCallback(async (
    suggestion: TaskEvolutionSuggestion
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Create the suggested task
      const { error } = await supabase.from('agent_tasks').insert({
        user_id: user.id,
        agent_id: suggestion.agentId,
        title: suggestion.title,
        description: suggestion.description,
        status: 'pending',
        priority: suggestion.priority,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

      toast({
        title: suggestion.unlockReason ? '¡Nueva tarea desbloqueada!' : 'Tarea añadida',
        description: suggestion.unlockReason || 'La tarea ha sido añadida a tu lista',
      });

      return true;
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      toast({
        title: 'Error',
        description: 'No se pudo añadir la tarea. Inténtalo de nuevo.',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast]);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  return {
    suggestions,
    loading,
    analyzeTaskEvolution,
    acceptSuggestion,
    dismissSuggestion
  };
};