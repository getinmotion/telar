import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { formatTaskTitleForDisplayEnhanced } from '../utils/agentTaskUtils';
import { getAgentTasksByUserId, updateAgentTask } from '@/services/agentTasks.actions';

/**
 * Hook to automatically clean up task titles with JSON arrays
 * This runs automatically when the user logs in and has a valid brand name
 */
export const useTaskTitleCleanup = () => {
  const { user } = useAuth();
  const { profile, loading: unifiedLoading } = useUnifiedUserData();

  useEffect(() => {
    if (!user) return;

    const cleanupTaskTitles = async () => {
      // Wait for unified data to load
      if (unifiedLoading) {
        return;
      }

      try {
        // ✅ Use cached profile data instead of querying
        if (!profile?.brandName) return; // Skip if no brand name

        // Get all tasks that might need cleaning
        const tasks = await getAgentTasksByUserId(user.id);

        if (!tasks || tasks.length === 0) return;

        // Filter tasks that need cleaning (contain arrays or are too long)
        const tasksToClean = tasks.filter(task => 
          task.title && (
            task.title.includes('[') || 
            task.title.includes('"') ||
            task.title.includes('goal') ||
            task.title.length > 100
          )
        );

        if (tasksToClean.length === 0) return;

        console.log(`🧹 Cleaning up ${tasksToClean.length} task titles`);

        // Clean each task title
        for (const task of tasksToClean) {
          const cleanedTitle = await formatTaskTitleForDisplayEnhanced(task.title, profile.brandName);

          if (cleanedTitle !== task.title) {
            await updateAgentTask(task.id, {
              title: cleanedTitle,
            });

            console.log('✅ Cleaned task title:', task.title, '→', cleanedTitle);
          }
        }
      } catch (error) {
        console.error('❌ Error cleaning task titles:', error);
      }
    };

    // Run cleanup after a short delay to ensure profile is synced
    const timer = setTimeout(cleanupTaskTitles, 2000);
    
    return () => clearTimeout(timer);
  }, [user, profile, unifiedLoading]);
};