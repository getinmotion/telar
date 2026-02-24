import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { isAssessmentComplete, MATURITY_TEST_CONFIG } from '@/config/maturityTest';
import { getScoresForAnalytics } from '@/services/userMaturityScores.actions';

interface MaturityTestStatus {
  hasCompleted: boolean; // ¿Tiene scores completados?
  hasInProgress: boolean; // ¿Tiene progreso guardado en localStorage?
  isLoading: boolean;
  totalAnswered: number; // Total de preguntas respondidas (now exposed for consumers)
}

export const useMaturityTestStatus = (): MaturityTestStatus => {
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();
  const { context, loading: unifiedLoading } = useUnifiedUserData();
  const [status, setStatus] = useState<MaturityTestStatus>({
    hasCompleted: false,
    hasInProgress: false,
    isLoading: true,
    totalAnswered: 0
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setStatus({ hasCompleted: false, hasInProgress: false, isLoading: false, totalAnswered: 0 });
        return;
      }

      // Wait for unified data to load
      if (unifiedLoading) {
        return;
      }

      // 1. Check user_maturity_scores table and get actual scores
      // ✅ Migrado a endpoint NestJS (GET /telar/server/user-maturity-scores/user/{user_id})
      const scoresData = await getScoresForAnalytics(user.id);

      // ✅ Use cached context data instead of querying
      const maturityProgress = context?.taskGenerationContext?.maturity_test_progress;
      const totalAnswered = maturityProgress?.total_answered || 0;
      const hasBusinessProfile = !!context?.businessProfile?.business_description;
      
      // ✅ Calculate average score - only consider test "completed" if scores are meaningful
      let hasCompletedScores = false;
      if (scoresData) {
        const avgScore = (
          (scoresData.ideaValidation || 0) +
          (scoresData.userExperience || 0) +
          (scoresData.marketFit || 0) +
          (scoresData.monetization || 0)
        ) / 4;
        
        // Consider test incomplete if average score is very low (< 30%)
        // This ensures the banner shows until the user has made real progress
        hasCompletedScores = avgScore >= 30;
        console.log('📊 [STATUS] Score check:', { avgScore, hasCompletedScores, scores: scoresData });
      }
      
      // ✅ FIXED: Clear priority logic
      let hasCompleted = false;
      let hasInProgress = false;

      if (hasCompletedScores) {
        // User has finished and saved scores - test is COMPLETE
        hasCompleted = true;
        hasInProgress = false; // Cannot be in progress if completed
        console.log('✅ [STATUS] Test completed - scores found in DB');
      } else {
        // No scores in DB - check if in progress
        if (totalAnswered > 0 && totalAnswered < MATURITY_TEST_CONFIG.TOTAL_QUESTIONS) {
          hasInProgress = true;
          hasCompleted = false;
          console.log('✅ [STATUS] Test in progress:', { totalAnswered, total: MATURITY_TEST_CONFIG.TOTAL_QUESTIONS });
        } else if (totalAnswered >= MATURITY_TEST_CONFIG.TOTAL_QUESTIONS) {
          // All questions answered but not saved yet
          hasInProgress = true; // Still need to save
          hasCompleted = false;
          console.log('✅ [STATUS] All questions answered - awaiting save');
        } else {
          // No progress at all
          hasInProgress = false;
          hasCompleted = false;
          console.log('✅ [STATUS] No progress detected');
        }
      }

      console.log('✅ [BANNER] Profile check:', { 
        hasCompletedScores, 
        hasBusinessProfile,
        totalAnswered,
        hasCompleted,
        hasInProgress,
        source: hasCompletedScores ? 'user_maturity_scores' : totalAnswered >= MATURITY_TEST_CONFIG.TOTAL_QUESTIONS ? 'progress_complete' : 'incomplete'
      });
      
      // ✅ FALLBACK: Also check localStorage as backup
      try {
        const saved = userLocalStorage.getItem('maturityCalculatorProgress');
        if (saved && !hasInProgress) {
          const progress = JSON.parse(saved);
          const hoursSinceLastSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
          // Valid progress if less than 24 hours old
          hasInProgress = hoursSinceLastSave < 24;
          console.log('📦 [BANNER] hasInProgress from localStorage:', { hoursSinceLastSave });
        }
      } catch (error) {
        console.error('Error checking maturity progress:', error);
      }

      setStatus({ hasCompleted, hasInProgress, isLoading: false, totalAnswered });
    };

    checkStatus();
  }, [user, context, unifiedLoading, userLocalStorage]);

  return status;
};
