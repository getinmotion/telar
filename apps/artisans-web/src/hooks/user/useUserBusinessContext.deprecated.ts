/**
 * @deprecated This hook is deprecated. Use useUnifiedUserData instead.
 * 
 * This file provides backward compatibility by proxying to the new unified system.
 * Migration guide:
 * 
 * OLD:
 * ```typescript
 * const { context, updateBusinessProfile } = useUserBusinessContext();
 * ```
 * 
 * NEW:
 * ```typescript
 * const { context, updateContext, updateProfile } = useUnifiedUserData();
 * ```
 */

import { useMemo, useCallback } from 'react';
import { useUnifiedUserData } from './useUnifiedUserData';
import type { UserMasterContext, BusinessProfile, TaskGenerationContext } from './useUserBusinessContext';

export const useUserBusinessContextDeprecated = () => {
  const { 
    userData, 
    profile, 
    context, 
    loading, 
    updateProfile, 
    updateContext,
    refreshData 
  } = useUnifiedUserData();

  // Log deprecation warning
  useMemo(() => {
    if (!sessionStorage.getItem('useUserBusinessContext_deprecation_warning')) {
      console.warn(
        '⚠️ DEPRECATION WARNING: useUserBusinessContext is deprecated.\n' +
        'Please migrate to useUnifiedUserData for better performance and consistency.\n' +
        'See: src/hooks/user/useUserBusinessContext.deprecated.ts for migration guide.'
      );
      sessionStorage.setItem('useUserBusinessContext_deprecation_warning', 'shown');
    }
  }, []);

  // Convert to old format
  const masterContext: UserMasterContext | null = useMemo(() => {
    if (!profile.userId) return null;

    return {
      user_id: profile.userId,
      business_context: context.businessProfile,
      preferences: {},
      conversation_insights: context.conversationInsights,
      technical_details: context.technicalDetails,
      goals_and_objectives: context.goalsAndObjectives,
      business_profile: context.businessProfile,
      task_generation_context: context.taskGenerationContext,
      language_preference: profile.languagePreference,
      context_version: context.contextVersion,
      last_updated: context.lastUpdated,
      last_assessment_date: context.lastAssessmentDate,
      created_at: profile.createdAt
    };
  }, [profile, context]);

  // Adapter for old updateBusinessProfile
  const updateBusinessProfile = useCallback(async (newProfile: Partial<BusinessProfile>) => {
    console.warn('⚠️ updateBusinessProfile is deprecated. Use updateContext from useUnifiedUserData');
    
    return updateContext({
      businessProfile: {
        ...context.businessProfile,
        ...newProfile
      }
    });
  }, [context, updateContext]);

  // Adapter for old updateTaskGenerationContext
  const updateTaskGenerationContext = useCallback(async (newContext: Partial<TaskGenerationContext>) => {
    console.warn('⚠️ updateTaskGenerationContext is deprecated. Use updateContext from useUnifiedUserData');
    
    return updateContext({
      taskGenerationContext: {
        ...context.taskGenerationContext,
        ...newContext
      }
    });
  }, [context, updateContext]);

  // Adapter for old setLanguagePreference
  const setLanguagePreference = useCallback(async (language: 'en' | 'es') => {
    console.warn('⚠️ setLanguagePreference is deprecated. Use updateProfile from useUnifiedUserData');
    
    return updateProfile({ languagePreference: language });
  }, [updateProfile]);

  // Adapter for updateFromMaturityCalculator
  const updateFromMaturityCalculator = useCallback(async (
    profileData: any,
    maturityScores: any,
    language: 'en' | 'es'
  ) => {
    console.warn('⚠️ updateFromMaturityCalculator is deprecated. Use updateContext from useUnifiedUserData');
    
    // Update both profile and context
    await updateProfile({
      businessType: profileData.industry,
      languagePreference: language
    });

    return updateContext({
      businessProfile: profileData,
      taskGenerationContext: {
        maturityScores,
        language,
        lastGeneration: new Date().toISOString(),
        lastAssessmentSource: 'maturity_calculator'
      }
    });
  }, [updateProfile, updateContext]);

  // Get business summary (for task generation)
  const getBusinessSummary = useCallback(() => {
    return {
      businessType: profile.businessType || 'No especificado',
      specificActivities: context.businessProfile?.activities || 'No especificadas',
      experienceLevel: context.businessProfile?.experience || 'No especificado',
      financialMaturity: context.businessProfile?.financialControl || 'No especificado',
      teamStructure: profile.teamSize || 'No especificado',
      paymentCapabilities: context.businessProfile?.paymentMethods || 'No especificados',
      detailedAnswers: context.businessProfile?.extendedAnswers || {},
      customAnswers: context.businessProfile?.dynamicQuestionAnswers || {},
      lastAssessment: context.lastAssessmentDate,
      language: profile.languagePreference || 'es',
      businessName: profile.brandName,
      products: context.businessProfile?.productDescriptions || [],
      portfolioLinks: context.businessProfile?.portfolioLinks || [],
      socialLinks: profile.socialMediaPresence || {}
    };
  }, [profile, context]);

  // Check if needs assessment
  const needsAssessment = useCallback(() => {
    if (!masterContext) return true;
    
    const hasBasicProfile = context.businessProfile && 
                           context.businessProfile.industry &&
                           context.businessProfile.activities;
    
    if (!hasBasicProfile) return true;
    
    // Check if assessment is older than 30 days
    if (context.lastAssessmentDate) {
      const lastAssessment = new Date(context.lastAssessmentDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (lastAssessment < thirtyDaysAgo) return true;
    }
    
    return false;
  }, [masterContext, context]);

  return {
    context: masterContext,
    loading,
    businessProfile: context.businessProfile,
    taskGenerationContext: context.taskGenerationContext,
    languagePreference: profile.languagePreference,
    
    // Actions (all deprecated, proxying to new system)
    updateBusinessProfile,
    updateTaskGenerationContext,
    setLanguagePreference,
    updateFromMaturityCalculator,
    refreshContext: refreshData,
    
    // Computed values
    getBusinessSummary,
    needsAssessment: needsAssessment(),
    
    // Status checks
    hasCompleteProfile: !!(context.businessProfile?.industry && context.businessProfile?.activities),
    lastAssessmentDate: context.lastAssessmentDate
  };
};
