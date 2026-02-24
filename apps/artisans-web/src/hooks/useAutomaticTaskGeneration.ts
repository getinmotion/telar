/**
 * useAutomaticTaskGeneration
 * 
 * Hook inteligente que monitorea el progreso del usuario y automáticamente
 * dispara la generación de nuevas tareas cuando se cumplen condiciones:
 * 
 * - Menos de 3 tareas pendientes
 * - 3+ tareas completadas recientemente
 * - Tiempo desde última generación > 2 horas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { EventBus } from '@/utils/eventBus';
import { AgentTask } from './types/agentTaskTypes';
import { CategoryScore } from '@/types/dashboard';

interface UseAutomaticTaskGenerationProps {
  tasks: AgentTask[];
  maturityScores: CategoryScore | null;
  userProfile: any;
  onTasksGenerated?: (newTasks: any[]) => void;
  evolveTasks: () => Promise<void>;
}

interface GenerationState {
  isGenerating: boolean;
  lastGenerationTime: Date | null;
  generationCount: number;
}

const PENDING_THRESHOLD = 3; // Generate when less than 3 pending tasks
const COMPLETED_THRESHOLD = 3; // Generate after completing 3 tasks
const COOLDOWN_HOURS = 2; // Minimum 2 hours between auto-generations
const DEBOUNCE_MS = 5000; // 5 second debounce

export const useAutomaticTaskGeneration = ({
  tasks,
  maturityScores,
  userProfile,
  onTasksGenerated,
  evolveTasks
}: UseAutomaticTaskGenerationProps) => {
  const { user } = useAuth();
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    lastGenerationTime: null,
    generationCount: 0
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completedCountRef = useRef(0);

  // Calculate pending and recently completed tasks
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  const recentlyCompleted = completedTasks.filter(t => {
    if (!t.completed_at) return false;
    const completedAt = new Date(t.completed_at);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return completedAt > dayAgo;
  });

  // Check if we should generate tasks
  const shouldGenerate = useCallback((): boolean => {
    // Don't generate if already generating
    if (state.isGenerating) {
      console.log('[AutoGen] ⏸️ Already generating, skipping');
      return false;
    }

    // Check cooldown period
    if (state.lastGenerationTime) {
      const hoursSinceLastGen = (Date.now() - state.lastGenerationTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastGen < COOLDOWN_HOURS) {
        console.log(`[AutoGen] ⏰ Cooldown active (${hoursSinceLastGen.toFixed(1)}h/${COOLDOWN_HOURS}h)`);
        return false;
      }
    }

    // Condition 1: Low pending tasks
    if (pendingTasks.length < PENDING_THRESHOLD) {
      console.log(`[AutoGen] ✅ Low pending tasks: ${pendingTasks.length} < ${PENDING_THRESHOLD}`);
      return true;
    }

    // Condition 2: Many recently completed tasks
    if (recentlyCompleted.length >= COMPLETED_THRESHOLD) {
      console.log(`[AutoGen] ✅ Many recent completions: ${recentlyCompleted.length} >= ${COMPLETED_THRESHOLD}`);
      return true;
    }

    return false;
  }, [state, pendingTasks.length, recentlyCompleted.length]);

  // Trigger task generation
  const triggerGeneration = useCallback(async () => {
    if (!user?.id || !shouldGenerate()) {
      return;
    }

    console.log('[AutoGen] 🚀 Triggering automatic task generation...');
    
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      await evolveTasks();
      
      setState(prev => ({
        isGenerating: false,
        lastGenerationTime: new Date(),
        generationCount: prev.generationCount + 1
      }));

      console.log('[AutoGen] ✅ Tasks generated successfully');
      
      if (onTasksGenerated) {
        onTasksGenerated([]);
      }
    } catch (error) {
      console.error('[AutoGen] ❌ Error generating tasks:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [user?.id, shouldGenerate, evolveTasks, onTasksGenerated]);

  // Debounced generation check
  const checkAndGenerate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (shouldGenerate()) {
        triggerGeneration();
      }
    }, DEBOUNCE_MS);
  }, [shouldGenerate, triggerGeneration]);

  // Monitor task changes
  useEffect(() => {
    checkAndGenerate();
  }, [pendingTasks.length, completedTasks.length]);

  // Listen to task completion events
  useEffect(() => {
    const unsubscribe = EventBus.subscribe('task.completed.check.generation', (data) => {
      console.log('[AutoGen] 📢 Task completion event received:', data);
      const newCompletedCount = completedTasks.length;
      
      // Check if we crossed the threshold
      if (newCompletedCount > completedCountRef.current) {
        completedCountRef.current = newCompletedCount;
        checkAndGenerate();
      }
    });

    return () => unsubscribe();
  }, [completedTasks.length, checkAndGenerate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isGenerating: state.isGenerating,
    lastGenerationTime: state.lastGenerationTime,
    generationCount: state.generationCount,
    pendingCount: pendingTasks.length,
    completedCount: recentlyCompleted.length,
    shouldGenerateNext: shouldGenerate(),
    manualTrigger: triggerGeneration
  };
};
