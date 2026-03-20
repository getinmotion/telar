/**
 * useUserProgress Hook
 *
 * Hook para manejar el progreso del usuario: niveles, XP, rachas, logros
 * ✅ OPTIMIZED: Refs para prevenir recreaciones innecesarias
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  getUserProgressByUserId,
  createUserProgress,
  updateUserProgressWithRewards,
} from '@/services/userProgress.actions';
import { getUserAchievementsByUserId } from '@/services/userAchievements.actions';
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

  // ✅ FIX: Usar ref para evitar recreaciones del callback
  const userIdRef = useRef<string | undefined>(user?.id);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // Fetch user progress
  const fetchProgress = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      let data = await getUserProgressByUserId(userId);

      if (!data) {
        // No progress found, create initial progress
        data = await createUserProgress({
          userId: userId,
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
  }, []); // ✅ FIX: Sin dependencias - usa ref

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return;

    try {
      // ✅ MIGRATED: Fetch unlocked achievements from NestJS
      // Endpoint: GET /user-achievements/user/:userId
      const unlockedData = await getUserAchievementsByUserId(userId);

      setAchievements(
        unlockedData.map((a: any) => ({
          id: a.id,
          userId: a.userId,
          achievementId: a.achievementId,
          title: a.title,
          description: a.description,
          icon: a.icon,
          unlockedAt: new Date(a.unlockedAt)
        }))
      );

      // ⚠️ TODO: Migrate achievements catalog to NestJS
      // Currently using Supabase direct query
      // Endpoint needed: GET /achievements-catalog
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
  }, []); // ✅ FIX: Sin dependencias - usa ref

  // Update progress (add XP, complete missions)
  const updateProgress = useCallback(async (
    xpGained: number,
    missionCompleted: boolean = false,
    timeSpent: number = 0
  ) => {
    const userId = userIdRef.current;
    if (!userId || updating) return;

    setUpdating(true);

    try {
      // ✅ Migrado a endpoint NestJS - POST /user-progress/update
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
  }, [updating, toast, fetchAchievements]); // ✅ FIX: Dependencias mínimas

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

  // ✅ FIX: Initial fetch solo cuando cambia el userId
  useEffect(() => {
    if (!user?.id) return;

    fetchProgress();
    fetchAchievements();
  }, [user?.id]); // ✅ Solo cuando cambia el ID del usuario

  // ✅ MIGRATION: Realtime subscription eliminada - migrando a NestJS sin Supabase
  // La actualización de progreso se hace manualmente después de cada mutación
  // vía updateProgress() que ya refetch achievements cuando se desbloquean (línea 197)

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
