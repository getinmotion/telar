/**
 * Hook to track and fetch milestone progress history
 * Used for historical progress charts
 */

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedProgress } from '@/types/unifiedProgress';

export const useMilestoneProgressHistory = (unifiedProgress: UnifiedProgress | null) => {
  const { user } = useAuth();

  // Record current milestone progress
  const recordMilestoneProgress = useCallback(async () => {
    if (!user || !unifiedProgress) return;

    try {
      const progressRecords = Object.entries(unifiedProgress.milestones).map(([key, milestone]) => ({
        user_id: user.id,
        milestone_id: key,
        progress: milestone.progress,
        tasks_completed: milestone.tasksCompleted,
        total_tasks: milestone.totalTasks,
        recorded_at: new Date().toISOString()
      }));

      // Insert progress history (will skip if already exists due to unique constraint)
      const { error } = await supabase
        .from('milestone_progress_history')
        .insert(progressRecords);

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error recording milestone progress:', error);
      }
    } catch (error) {
      console.error('Error in recordMilestoneProgress:', error);
    }
  }, [user, unifiedProgress]);

  // Fetch historical progress for a specific milestone
  const fetchMilestoneHistory = useCallback(async (milestoneId: string, days: number = 30) => {
    if (!user) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('milestone_progress_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('milestone_id', milestoneId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching milestone history:', error);
      return [];
    }
  }, [user]);

  // Record progress periodically (daily)
  useEffect(() => {
    if (!user || !unifiedProgress) return;

    // Record immediately on load
    recordMilestoneProgress();

    // Set up daily recording (every 24 hours)
    const interval = setInterval(() => {
      recordMilestoneProgress();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, unifiedProgress, recordMilestoneProgress]);

  return {
    recordMilestoneProgress,
    fetchMilestoneHistory
  };
};
