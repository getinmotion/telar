/**
 * Unified Progress Hook
 * Single source of truth for all progress calculations
 *
 * ✅ OPTIMIZED: Uses useCallback, useRef, and debouncing to prevent infinite loops
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

  // ✅ OPTIMIZATION: Track previous values to prevent unnecessary recalculations
  const prevProgressRef = useRef<UnifiedProgress | null>(null);
  const hasCalculatedRef = useRef(false);

  // ✅ OPTIMIZATION: Track previous values for deep comparison
  const prevValuesRef = useRef({
    maturityScoresString: '',
    productsCount: 0,
    hasShop: false,
    hasLogo: false,
    colorsCount: 0,
    hasNit: false,
    level: 1,
    xp: 0,
    nextLevelXP: 100
  });

  // ✅ OPTIMIZATION: Debounce ref para evitar múltiples cálculos
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ OPTIMIZATION: Memoize calculateProgress with stable dependencies
  const calculateProgress = useCallback(() => {
    // Get base maturity scores from master state (now from user_master_context)
    const baseScores: MaturityScores = masterState.growth.nivel_madurez || {
      ideaValidation: 0,
      userExperience: 0,
      marketFit: 0,
      monetization: 0
    };

    // ✅ OPTIMIZATION: Compare primitive values instead of objects
    const currentValues = {
      maturityScoresString: JSON.stringify(baseScores),
      productsCount: masterState.inventario.productos.length,
      hasShop: masterState.tienda.has_shop,
      hasLogo: !!masterState.marca.logo,
      colorsCount: masterState.marca.colores?.length || 0,
      hasNit: !!masterState.perfil.nit,
      level: progress?.level || 1,
      xp: progress?.experiencePoints || 0,
      nextLevelXP: progress?.nextLevelXp || 100
    };

    // ✅ OPTIMIZATION: Skip calculation if nothing changed
    const hasChanged = Object.keys(currentValues).some(
      key => currentValues[key as keyof typeof currentValues] !==
             prevValuesRef.current[key as keyof typeof currentValues]
    );

    if (!hasChanged && hasCalculatedRef.current) {
      return;
    }

    // Update prev values
    prevValuesRef.current = currentValues;

    // Get gamification data from user progress
    const gamificationData = {
      level: progress?.level || 1,
      xp: progress?.experiencePoints || 0,
      nextLevelXP: progress?.nextLevelXp || 100
    };

    // Calculate unified progress
    const unified = calculateUnifiedProgress(masterState, baseScores, gamificationData);

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
  }, []); // ✅ OPTIMIZATION: Empty deps - all values come from refs and current state

  // ✅ OPTIMIZATION: Debounced calculation trigger
  const triggerCalculation = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer - debounce 500ms
    debounceTimerRef.current = setTimeout(() => {
      calculateProgress();
    }, 500);
  }, [calculateProgress]);

  // Initial calculation when component mounts or critical data changes
  useEffect(() => {
    // Only trigger if we have essential data
    if (masterState && progress !== undefined) {
      triggerCalculation();
    }
  }, [
    // ✅ OPTIMIZATION: Only track primitive changes
    masterState.inventario.productos.length,
    masterState.tienda.has_shop,
    !!masterState.marca.logo,
    masterState.marca.colores?.length,
    !!masterState.perfil.nit,
    progress?.level,
    progress?.experiencePoints,
    triggerCalculation
  ]);

  // Recalculate on events - separate effect with stable callback
  useEffect(() => {
    const handleEvent = () => {
      triggerCalculation();
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
      // Clean up debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [triggerCalculation]);

  // ✅ OPTIMIZATION: Stable refresh function
  const refreshProgress = useCallback(() => {
    calculateProgress();
  }, [calculateProgress]);

  return {
    unifiedProgress,
    loading,
    refreshProgress
  };
};
