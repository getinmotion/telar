/**
 * Unified Progress Hook
 * Single source of truth for all progress calculations
 * 
 * OPTIMIZATION: Uses useCallback and useRef to prevent infinite loops
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { useUserProgress } from '@/hooks/useUserProgress';
import { UnifiedProgress, MaturityScores } from '@/types/unifiedProgress';
import { calculateUnifiedProgress } from '@/utils/progressCalculator';
import { EventBus } from '@/utils/eventBus';

export const useUnifiedProgress = () => {
  const { masterState } = useMasterAgent();
  const { progress } = useUserProgress();
  const [unifiedProgress, setUnifiedProgress] = useState<UnifiedProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ OPTIMIZATION: Track previous progress for milestone change detection
  const prevProgressRef = useRef<UnifiedProgress | null>(null);
  const hasCalculatedRef = useRef(false);

  // ✅ OPTIMIZATION: Memoize calculateProgress with useCallback
  const calculateProgress = useCallback(() => {
    console.log('🔄 [UnifiedProgress] Calculating progress...', {
      hasGrowthData: !!masterState.growth.nivel_madurez,
      hasProgress: !!progress,
      productsCount: masterState.inventario.productos.length
    });

    // Get base maturity scores from master state (now from user_master_context)
    const baseScores: MaturityScores = masterState.growth.nivel_madurez || {
      ideaValidation: 0,
      userExperience: 0,
      marketFit: 0,
      monetization: 0
    };

    console.log('📊 [UnifiedProgress] Using real maturity scores from user_master_context:', {
      scores: baseScores,
      source: 'user_master_context.task_generation_context.maturityScores'
    });

    // Get gamification data from user progress
    const gamificationData = {
      level: progress?.level || 1,
      xp: progress?.experiencePoints || 0,
      nextLevelXP: progress?.nextLevelXp || 100
    };

    // Calculate unified progress
    const unified = calculateUnifiedProgress(masterState, baseScores, gamificationData);

    console.log('✅ [UnifiedProgress] Progress calculated:', {
      totalProgress: unified.totalProgress,
      milestones: Object.keys(unified.milestones).map(key => ({
        id: key,
        progress: unified.milestones[key as keyof typeof unified.milestones].progress,
        status: unified.milestones[key as keyof typeof unified.milestones].status
      })),
      maturityScores: unified.maturityScores,
      level: unified.gamification.level
    });

    // Detect milestone state changes and publish events using ref
    const prevProgress = prevProgressRef.current;
    if (prevProgress?.milestones) {
      Object.entries(unified.milestones).forEach(([key, milestone]) => {
        const prevMilestone = prevProgress.milestones[key as keyof typeof prevProgress.milestones];

        // Milestone completed
        if (prevMilestone?.status === 'active' && milestone.status === 'completed') {
          EventBus.publish('milestone.completed', {
            milestoneId: key,
            milestoneName: milestone.label,
            progress: milestone.progress
          });
        }

        // Milestone unlocked
        if (prevMilestone?.status === 'locked' && milestone.status === 'active') {
          EventBus.publish('milestone.unlocked', {
            milestoneId: key,
            milestoneName: milestone.label
          });
        }

        // Milestone almost complete
        if (milestone.status === 'active' && milestone.progress >= 80 && milestone.progress < 100) {
          if (!prevMilestone || prevMilestone.progress < 80) {
            const tasksLeft = milestone.totalTasks - milestone.tasksCompleted;
            EventBus.publish('milestone.almost.complete', {
              milestoneId: key,
              milestoneName: milestone.label,
              tasksLeft
            });
          }
        }
      });
    }

    // Update ref for next comparison
    prevProgressRef.current = unified;
    setUnifiedProgress(unified);
    setLoading(false);
    hasCalculatedRef.current = true;
  }, [
    // ✅ OPTIMIZATION: Use specific primitive/stable dependencies
    masterState.growth.nivel_madurez,
    masterState.inventario.productos.length,
    masterState.tienda.has_shop,
    masterState.marca.logo,
    masterState.marca.colores?.length,
    masterState.perfil.nit,
    progress?.level,
    progress?.experiencePoints,
    progress?.nextLevelXp
  ]);

  // Initial calculation - run only once when dependencies are stable
  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  // Recalculate on events - separate effect with stable callback
  useEffect(() => {
    const handleEvent = () => {
      console.log('📢 [UnifiedProgress] Event received, recalculating...');
      calculateProgress();
    };

    const unsubscribers = [
      EventBus.subscribe('brand.wizard.completed', handleEvent),
      EventBus.subscribe('product.wizard.completed', handleEvent),
      EventBus.subscribe('inventory.updated', handleEvent),
      EventBus.subscribe('master.context.updated', handleEvent),
      EventBus.subscribe('task.updated', handleEvent),
      EventBus.subscribe('legal.nit.completed', handleEvent)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [calculateProgress]);

  // ✅ OPTIMIZATION: Stable refresh function
  const refreshProgress = useCallback(() => {
    console.log('🔄 [UnifiedProgress] Manual refresh requested');
    calculateProgress();
  }, [calculateProgress]);

  return {
    unifiedProgress,
    loading,
    refreshProgress
  };
};
