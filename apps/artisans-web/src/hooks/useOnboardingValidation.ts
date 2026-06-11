import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

/**
 * Hook to validate onboarding status based on profile completion
 * Checks if user has completed basic business profile information
 *
 * OPTIMIZATION: Uses useRef guard to prevent infinite validation loops
 */

interface OnboardingStatus {
  hasCompletedOnboarding: boolean; // Has business description = can access dashboard
  hasCompletedMaturityTest: boolean; // Deprecated - always false (maturity test removed)
  totalAnswered: number; // Deprecated - always 0
  isInProgress: boolean; // Deprecated - always false
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
        // Verificar si tiene business_description (completó onboarding básico)
        const hasBusinessDescription =
          !!context?.businessProfile?.businessDescription ||
          !!context?.businessProfile?.business_description ||
          !!(context as any)?.business_profile?.businessDescription ||
          !!(context as any)?.business_profile?.business_description;

        // Determinar estado de onboarding basado solo en business profile
        // Maturity test fue removido, estos campos quedan para compatibilidad
        const hasCompletedOnboarding = hasBusinessDescription;

        console.log('✅ [OnboardingValidation] Status calculated:', {
          hasBusinessDescription,
          hasCompletedOnboarding,
          userId: user?.id
        });

        // ✅ Mark as validated
        hasValidatedRef.current = true;

        setStatus({
          hasCompletedOnboarding,
          hasCompletedMaturityTest: false, // Deprecated - maturity test removed
          totalAnswered: 0, // Deprecated
          isInProgress: false, // Deprecated
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
