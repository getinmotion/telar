/**
 * useUserProgress Hook
 * 
 * Hook para manejar el progreso del usuario: niveles, XP, rachas, logros
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  getUserProgressByUserId,
  createUserProgress,
  updateUserProgress,
  updateUserProgressWithRewards,
} from '@/services/userProgress.actions';
import { UserProgress } from '@/types/userProgress.types';

interface Achievement {
  id: string;
  userId: string;
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

interface AchievementCatalog {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockCriteria: any;
  category: string;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsCatalog, setAchievementsCatalog] = useState<AchievementCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch user progress
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let data = await getUserProgressByUserId(user.id);

      if (!data) {
        // No progress found, create initial progress
        data = await createUserProgress({
          userId: user.id,
          level: 1,
          experiencePoints: 0,
          nextLevelXp: 100
        });
      }

      setProgress({
        id: data.id,
        userId: data.userId,
        level: data.level,
        experiencePoints: data.experiencePoints,
        nextLevelXp: data.nextLevelXp,
        completedMissions: data.completedMissions,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        lastActivityDate: data.lastActivityDate || '',
        totalTimeSpent: data.totalTimeSpent,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // OPTIMIZATION: Use user?.id instead of user

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch unlocked achievements
      const { data: unlockedData, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (unlockedError) throw unlockedError;

      setAchievements(
        (unlockedData || []).map((a: any) => ({
          id: a.id,
          userId: a.user_id,
          achievementId: a.achievement_id,
          title: a.title,
          description: a.description,
          icon: a.icon,
          unlockedAt: new Date(a.unlocked_at)
        }))
      );

      // Fetch catalog
      const { data: catalogData, error: catalogError } = await supabase
        .from('achievements_catalog')
        .select('*')
        .order('display_order', { ascending: true });

      if (catalogError) throw catalogError;

      setAchievementsCatalog(
        (catalogData || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          icon: c.icon,
          unlockCriteria: c.unlock_criteria,
          category: c.category
        }))
      );
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [user?.id]); // OPTIMIZATION: Use user?.id instead of user

  // Update progress (add XP, complete missions)
  const updateProgress = useCallback(async (
    xpGained: number,
    missionCompleted: boolean = false,
    timeSpent: number = 0
  ) => {
    if (!user || updating) return;

    setUpdating(true);

    try {
      // ✅ Migrado a endpoint NestJS - POST /telar/server/user-progress/update
      const response = await updateUserProgressWithRewards({
        xpGained,
        missionCompleted,
        timeSpent
      });

      if (response.success) {
        const result = response.data;

        // Update local state
        setProgress(prev => prev ? {
          ...prev,
          level: result.level,
          experiencePoints: result.experiencePoints,
          nextLevelXp: result.nextLevelXP,
          completedMissions: result.completedMissions,
          currentStreak: result.currentStreak,
          longestStreak: result.longestStreak
        } : null);

        // Show level up notification
        if (result.leveledUp) {
          toast({
            title: '🎉 ¡Subiste de nivel!',
            description: `Ahora eres nivel ${result.level}`,
          });
        }

        // Show new achievements
        if (result.unlockedAchievements?.length > 0) {
          result.unlockedAchievements.forEach((achievement) => {
            toast({
              title: '🏆 ¡Nuevo logro desbloqueado!',
              description: achievement.title,
            });
          });

          // Refresh achievements
          await fetchAchievements();
        }

        return result;
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el progreso',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  }, [user?.id, updating, toast, fetchAchievements]); // OPTIMIZATION: Use user?.id instead of user

  // Calculate progress percentage
  const progressPercentage = progress
    ? Math.min((progress.experiencePoints / progress.nextLevelXp) * 100, 100)
    : 0;

  // Get achievements with locked status
  const achievementsWithStatus = achievementsCatalog.map(catalogItem => {
    const unlocked = achievements.find(a => a.achievementId === catalogItem.id);
    return {
      ...catalogItem,
      isUnlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt
    };
  });

  useEffect(() => {
    fetchProgress();
    fetchAchievements();
  }, [fetchProgress, fetchAchievements]);

  // Realtime subscription for progress updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-progress-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchProgress();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAchievements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchProgress, fetchAchievements]);

  return {
    progress,
    achievements: achievementsWithStatus,
    loading,
    updating,
    progressPercentage,
    updateProgress,
    refreshProgress: fetchProgress,
    refreshAchievements: fetchAchievements
  };
};
