import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LearningPattern {
  id: string;
  interactions_count: number;
  tasks_completed_count: number;
  tasks_abandoned_count: number;
  completion_rate: number;
  preferred_task_types: any;
  struggling_areas: any;
  strength_areas: any;
  maturity_trend: any;
  active_hours?: any;
  avg_task_completion_time_seconds?: number;
  last_maturity_check?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  recommended_adjustments?: any;
}

interface PersonalizedRecommendations {
  task_complexity: 'simple' | 'intermediate' | 'advanced';
  task_types: any;
  struggling_areas: any;
  strength_areas: any;
  completion_rate: number;
  recommended_focus: string;
  learning_stage: 'beginner' | 'intermediate' | 'advanced';
}

export const useContinuousLearning = () => {
  const { user } = useAuth();
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's learning pattern
  const fetchLearningPattern = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_learning_patterns')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching learning pattern:', error);
      } else if (data) {
        setLearningPattern(data as LearningPattern);
      }
    } catch (err) {
      console.error('Error fetching learning pattern:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch personalized recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_personalized_recommendations', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
      } else if (data) {
        setRecommendations(data as any as PersonalizedRecommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  }, [user]);

  // Track task completion
  const trackTaskCompletion = useCallback(async (taskId: string, taskType: string) => {
    if (!user) return;

    try {
      // Update or insert learning pattern
      const { data: existing } = await supabase
        .from('user_learning_patterns')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing pattern
        const currentTypes = Array.isArray(existing.preferred_task_types) 
          ? existing.preferred_task_types 
          : [];
        const updatedPreferredTypes = [...currentTypes];
        if (!updatedPreferredTypes.includes(taskType)) {
          updatedPreferredTypes.push(taskType);
        }

        await supabase
          .from('user_learning_patterns')
          .update({
            interactions_count: (existing.interactions_count || 0) + 1,
            tasks_completed_count: (existing.tasks_completed_count || 0) + 1,
            preferred_task_types: updatedPreferredTypes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Create new pattern
        await supabase
          .from('user_learning_patterns')
          .insert({
            user_id: user.id,
            interactions_count: 1,
            tasks_completed_count: 1,
            preferred_task_types: [taskType]
          });
      }

      // Refresh data
      await fetchLearningPattern();
      await fetchRecommendations();
    } catch (err) {
      console.error('Error tracking task completion:', err);
    }
  }, [user, fetchLearningPattern, fetchRecommendations]);

  // Track task abandonment
  const trackTaskAbandonment = useCallback(async (taskId: string, reason?: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('user_learning_patterns')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('user_learning_patterns')
          .update({
            interactions_count: (existing.interactions_count || 0) + 1,
            tasks_abandoned_count: (existing.tasks_abandoned_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_learning_patterns')
          .insert({
            user_id: user.id,
            interactions_count: 1,
            tasks_abandoned_count: 1
          });
      }

      // Refresh data
      await fetchLearningPattern();
      await fetchRecommendations();
    } catch (err) {
      console.error('Error tracking task abandonment:', err);
    }
  }, [user, fetchLearningPattern, fetchRecommendations]);

  // Update maturity trend
  const updateMaturityTrend = useCallback(async (newScore: number) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('user_learning_patterns')
        .select('maturity_trend')
        .eq('user_id', user.id)
        .single();

      const trend = existing?.maturity_trend;
      const trendArray = Array.isArray(trend) ? trend : [];
      const newTrendEntry = {
        date: new Date().toISOString(),
        score: newScore
      };

      // Keep only last 10 entries
      const updatedTrend = [...trendArray, newTrendEntry].slice(-10);

      await supabase
        .from('user_learning_patterns')
        .upsert({
          user_id: user.id,
          maturity_trend: updatedTrend,
          last_maturity_check: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      await fetchLearningPattern();
    } catch (err) {
      console.error('Error updating maturity trend:', err);
    }
  }, [user, fetchLearningPattern]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchLearningPattern();
      fetchRecommendations();
    }
  }, [user, fetchLearningPattern, fetchRecommendations]);

  return {
    learningPattern,
    recommendations,
    loading,
    trackTaskCompletion,
    trackTaskAbandonment,
    updateMaturityTrend,
    refresh: useCallback(() => {
      fetchLearningPattern();
      fetchRecommendations();
    }, [fetchLearningPattern, fetchRecommendations])
  };
};
