import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { MATURITY_TEST_CONFIG } from '@/config/maturityTest';

/**
 * Hook to validate Maturity Test status with THREE distinct states:
 * 1. hasCompletedOnboarding (3+ questions) - Can access dashboard
 * 2. isInProgress (3-35 questions) - Show banner to continue
 * 3. hasCompletedMaturityTest (36 questions) - Fully completed
 * 
 * OPTIMIZATION: Uses useRef guard to prevent infinite validation loops
 */

interface OnboardingStatus {
  hasCompletedOnboarding: boolean; // 3+ preguntas = puede acceder dashboard
  hasCompletedMaturityTest: boolean; // 36 preguntas = test completo
  totalAnswered: number;
  isInProgress: boolean; // 3-35 preguntas = en progreso
  isValidating: boolean;
}

export const useOnboardingValidation = (): OnboardingStatus => {
  const { user } = useAuth();
  const { context, loading: unifiedLoading } = useUnifiedUserData();
  
  // ✅ OPTIMIZATION: Guard to prevent multiple validations
  const hasValidatedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  
  const [status, setStatus] = useState<OnboardingStatus>({
    hasCompletedOnboarding: false,
    hasCompletedMaturityTest: false,
    totalAnswered: 0,
    isInProgress: false,
    isValidating: true
  });

  useEffect(() => {
    // Reset validation guard when user changes
    if (user?.id !== lastUserIdRef.current) {
      hasValidatedRef.current = false;
      lastUserIdRef.current = user?.id || null;
    }

    const validateStatus = () => {
      // ✅ OPTIMIZATION: Skip if already validated for this user/context combination
      if (hasValidatedRef.current && !unifiedLoading) {
        return;
      }
      
      console.log('🔍 [OnboardingValidation] Starting validation...');
      

      try {
        // 1️⃣ Verificar progreso en base de datos (fuente primaria)
        const dbTotalAnswered = context?.taskGenerationContext?.maturity_test_progress?.total_answered || 0;
        
        // 2️⃣ Cargar progreso de localStorage (fuente secundaria) - acceso directo sin hook
        let localStorageAnswered = 0;
        const storageKey = user?.id ? `user_${user.id}_fused_maturity_calculator_progress` : 'fused_maturity_calculator_progress';
        const progressData = localStorage.getItem(storageKey);
        
        if (progressData) {
          try {
            const parsed = JSON.parse(progressData);
            localStorageAnswered = parsed.answeredQuestionIds?.length || 0;
            console.log('📊 [OnboardingValidation] LocalStorage progress:', { parsed, localStorageAnswered });
          } catch (e) {
            console.warn('⚠️ [OnboardingValidation] Error parsing progress:', e);
          }
        } else {
          console.log('📭 [OnboardingValidation] No progress data found in localStorage');
        }
        
        // 3️⃣ Usar el máximo entre ambas fuentes (priorizar DB)
        const totalAnswered = Math.max(dbTotalAnswered, localStorageAnswered);
        
        console.log('🔍 [OnboardingValidation] Total answered:', {
          dbTotalAnswered,
          localStorageAnswered,
          totalAnswered
        });
        
        // 4️⃣ Verificar si tiene business_description (completó al menos Q1)
        const hasBusinessDescription = 
          !!context?.businessProfile?.businessDescription || 
          !!context?.businessProfile?.business_description || 
          !!(context as any)?.business_profile?.businessDescription || 
          !!(context as any)?.business_profile?.business_description;
        
        // 5️⃣ Determinar estados
        const hasCompletedOnboarding = totalAnswered >= 3 || hasBusinessDescription;
        const hasCompletedMaturityTest = totalAnswered >= MATURITY_TEST_CONFIG.TOTAL_QUESTIONS;
        const isInProgress = totalAnswered >= 3 && totalAnswered < MATURITY_TEST_CONFIG.TOTAL_QUESTIONS;
        
        console.log('✅ [OnboardingValidation] Status calculated:', {
          totalAnswered,
          hasBusinessDescription,
          hasCompletedOnboarding,
          hasCompletedMaturityTest,
          isInProgress,
          userId: user?.id
        });
        
        // ✅ Mark as validated
        hasValidatedRef.current = true;
        
        setStatus({
          hasCompletedOnboarding,
          hasCompletedMaturityTest,
          totalAnswered,
          isInProgress,
          isValidating: false
        });
        
      } catch (error) {
        console.error('❌ [OnboardingValidation] Error:', error);
        hasValidatedRef.current = true;
        setStatus({
          hasCompletedOnboarding: false,
          hasCompletedMaturityTest: false,
          totalAnswered: 0,
          isInProgress: false,
          isValidating: false
        });
      }
    };

    if (user) {
      // validateStatus();
    } else {
      hasValidatedRef.current = false;
      setStatus({
        hasCompletedOnboarding: false,
        hasCompletedMaturityTest: false,
        totalAnswered: 0,
        isInProgress: false,
        isValidating: false
      });
    }
  }, [user?.id, context, unifiedLoading]); // ✅ FIXED: Removed userLocalStorage dependency

  return status;
};
