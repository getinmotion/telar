/**
 * @deprecated This hook is deprecated. Use useUnifiedUserData instead.
 * 
 * This file provides backward compatibility by proxying to the new unified system.
 * Migration guide:
 * 
 * OLD:
 * ```typescript
 * const { businessProfile, loading } = useUserBusinessProfile();
 * ```
 * 
 * NEW:
 * ```typescript
 * const { profile, loading } = useUnifiedUserData();
 * // Access profile.brandName, profile.businessType, etc.
 * ```
 */

import { useMemo } from 'react';
import { useUnifiedUserData } from './useUnifiedUserData';
import type { UserBusinessProfile, BusinessModel, BusinessStage } from '@/types/profile';

export const useUserBusinessProfileDeprecated = () => {
  const { profile, context, loading, error } = useUnifiedUserData();

  // Log deprecation warning (only once per session)
  useMemo(() => {
    if (!sessionStorage.getItem('useUserBusinessProfile_deprecation_warning')) {
      console.warn(
        '⚠️ DEPRECATION WARNING: useUserBusinessProfile is deprecated.\n' +
        'Please migrate to useUnifiedUserData for better performance and consistency.\n' +
        'See: src/hooks/user/useUserBusinessProfile.deprecated.ts for migration guide.'
      );
      sessionStorage.setItem('useUserBusinessProfile_deprecation_warning', 'shown');
    }
  }, []);

  // Convert unified profile to old format
  const businessProfile: UserBusinessProfile | null = useMemo(() => {
    if (!profile.userId) return null;

    // Map to old interface (using any[] for array types to maintain compatibility)
    return {
      userId: profile.userId,
      fullName: profile.fullName || profile.email?.split('@')[0] || 'Usuario',
      businessModel: detectBusinessModel(profile, context),
      businessStage: detectBusinessStage(profile, context),
      currentChannels: (profile.salesChannels || []) as any[],
      desiredChannels: (profile.salesChannels || []) as any[],
      timeAvailability: profile.timeAvailability as any,
      financialResources: context.businessProfile?.financialResources || 'minimal',
      teamSize: profile.teamSize as any,
      primaryGoals: (profile.businessGoals || []) as any[],
      urgentNeeds: (profile.currentChallenges || []) as any[],
      monthlyRevenueGoal: profile.monthlyRevenueGoal,
      specificAnswers: context.businessProfile || {},
      skillsAndExpertise: (profile.primarySkills || []) as any[],
      currentChallenges: (profile.currentChallenges || []) as any[],
      maturityLevel: context.taskGenerationContext?.maturityScores?.overall || 0,
      lastAssessmentDate: context.lastAssessmentDate || new Date().toISOString(),
      language: (profile.languagePreference || 'es') as 'en' | 'es',
      businessDescription: profile.businessDescription || '',
      brandName: profile.brandName || '',
      businessLocation: profile.businessLocation || '',
      yearsInBusiness: profile.yearsInBusiness || null,
      socialMediaPresence: profile.socialMediaPresence || {},
      initialInvestmentRange: profile.initialInvestmentRange || ''
    };
  }, [profile, context]);

  return {
    businessProfile,
    loading,
    error,
    refreshProfile: () => {
      console.warn('⚠️ refreshProfile is deprecated. Use refreshData from useUnifiedUserData');
    }
  };
};

// Helper functions to maintain compatibility
function detectBusinessModel(profile: any, context: any): BusinessModel {
  const businessType = (profile.businessType || '').toLowerCase();
  const description = (profile.businessDescription || '').toLowerCase();
  
  if (businessType.includes('artisan') || description.includes('artisan')) return 'artisan';
  if (businessType.includes('service') || description.includes('service')) return 'services';
  if (businessType.includes('ecommerce') || description.includes('ecommerce')) return 'ecommerce';
  if (businessType.includes('content') || description.includes('content')) return 'content';
  if (businessType.includes('consulting') || description.includes('consulting')) return 'consulting';
  if (businessType.includes('saas') || description.includes('saas')) return 'saas';
  if (businessType.includes('retail') || description.includes('retail')) return 'retail';
  
  return 'other';
}

function detectBusinessStage(profile: any, context: any): BusinessStage {
  const stage = (profile.currentStage || '').toLowerCase();
  const maturityScores = context.taskGenerationContext?.maturityScores;
  
  if (stage.includes('established') || (maturityScores?.overall && maturityScores.overall >= 80)) return 'established';
  if (stage.includes('growth') || (maturityScores?.overall && maturityScores.overall >= 60)) return 'growth';
  if (stage.includes('early') || (maturityScores?.overall && maturityScores.overall >= 40)) return 'early';
  if (stage.includes('mvp') || (maturityScores?.overall && maturityScores.overall >= 20)) return 'mvp';
  
  return 'idea';
}
