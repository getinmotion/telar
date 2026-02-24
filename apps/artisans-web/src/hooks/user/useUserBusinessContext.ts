import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { performCompleteMigration } from '@/utils/dataMigration';
import { useToast } from '@/hooks/use-toast';

export interface BusinessProfile {
  industry?: string;
  experience?: string;
  activities?: string[] | string;
  financialControl?: string;
  teamStructure?: string;
  paymentMethods?: string[] | string;
  extendedAnswers?: Record<string, any>;
  dynamicQuestionAnswers?: Record<string, any>;
  businessName?: string;
  productDescriptions?: string[];
  portfolioLinks?: string[];
  socialMediaLinks?: string[];
  lastUpdated?: string;
}

export interface TaskGenerationContext {
  maturityScores?: any;
  language?: 'en' | 'es';
  generatedTasks?: number;
  lastGeneration?: string;
  lastAssessmentSource?: string;
}

export interface UserMasterContext {
  id?: string;
  user_id: string;
  business_context?: any;
  preferences?: any;
  conversation_insights?: any;
  technical_details?: any;
  goals_and_objectives?: any;
  business_profile?: any;
  task_generation_context?: any;
  language_preference?: string;
  context_version?: number;
  last_updated?: string;
  last_assessment_date?: string;
  created_at?: string;
}

export const useUserBusinessContext = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [context, setContext] = useState<UserMasterContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user context from database
  const fetchUserContext = useCallback(async () => {
    if (!user) {
      setContext(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_master_context')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user context:', error);
        throw error;
      }

      if (!data) {
        // No context found - perform automatic migration
        console.log('No master context found for user - performing automatic migration');
        try {
          const migrationSuccess = await performCompleteMigration(user.id);
          if (migrationSuccess) {
            console.log('Migration completed successfully - refetching context');
            // Refetch after migration
            const { data: newData, error: refetchError } = await supabase
              .from('user_master_context')
              .select('*')
              .eq('user_id', user.id)
              .single();
            
            if (refetchError) {
              console.error('Error refetching context after migration:', refetchError);
              setContext(null);
            } else {
              setContext(newData);
            }
          } else {
            console.error('Migration failed');
            setContext(null);
          }
        } catch (migrationError) {
          console.error('Migration process failed:', migrationError);
          setContext(null);
        }
      } else {
        setContext(data);
      }
    } catch (error) {
      console.error('Error fetching user business context:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el contexto del usuario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Update or create user context
  const upsertContext = useCallback(async (updates: any) => {
    if (!user) return null;

    try {
      // First try to update existing record
      const { data: existing } = await supabase
        .from('user_master_context')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let data, error;

      if (existing) {
        // Update existing record
        ({ data, error } = await supabase
          .from('user_master_context')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single());
      } else {
        // Insert new record
        ({ data, error } = await supabase
          .from('user_master_context')
          .insert({ user_id: user.id, ...updates })
          .select()
          .single());
      }

      if (error) throw error;
      setContext(data);
      return data;
    } catch (error) {
      console.error('Error upserting user context:', error);
      throw error;
    }
  }, [user]);

  // Update business profile
  const updateBusinessProfile = useCallback(async (newProfile: Partial<BusinessProfile>) => {
    if (!user) return null;

    try {
      const updatedProfile = {
        ...context?.business_profile,
        ...newProfile,
        lastUpdated: new Date().toISOString()
      };

      return await upsertContext({
        business_profile: updatedProfile,
        last_assessment_date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil de negocio',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, context, toast, upsertContext]);

  // Update task generation context
  const updateTaskGenerationContext = useCallback(async (newContext: Partial<TaskGenerationContext>) => {
    if (!user) return null;

    try {
      const updatedContext = {
        ...context?.task_generation_context,
        ...newContext,
        lastGeneration: new Date().toISOString()
      };

      return await upsertContext({
        task_generation_context: updatedContext
      });
    } catch (error) {
      console.error('Error updating task generation context:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el contexto de generación de tareas',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, context, toast, upsertContext]);

  // Set language preference
  const setLanguagePreference = useCallback(async (language: 'en' | 'es') => {
    if (!user) return null;

    try {
      return await upsertContext({
        language_preference: language
      });
    } catch (error) {
      console.error('Error setting language preference:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la preferencia de idioma',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast, upsertContext]);

  // Complete context update from maturity calculator
  const updateFromMaturityCalculator = useCallback(async (
    profileData: any,
    maturityScores: any,
    language: 'en' | 'es'
  ) => {
    if (!user) return null;

    try {
      const businessProfile: BusinessProfile = {
        industry: profileData.industry,
        experience: profileData.experience,
        activities: profileData.activities,
        financialControl: profileData.financialControl,
        teamStructure: profileData.teamStructure,
        paymentMethods: profileData.paymentMethods,
        extendedAnswers: profileData.extendedAnswers,
        dynamicQuestionAnswers: profileData.dynamicQuestionAnswers,
        lastUpdated: new Date().toISOString()
      };

      const taskGenerationContext: TaskGenerationContext = {
        maturityScores,
        language,
        lastGeneration: new Date().toISOString(),
        lastAssessmentSource: 'maturity_calculator'
      };

      return await upsertContext({
        business_profile: businessProfile,
        task_generation_context: taskGenerationContext,
        language_preference: language,
        last_assessment_date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating context from maturity calculator:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el contexto desde el calculador de madurez',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast, upsertContext]);

  // Get intelligent business summary for task generation
  const getBusinessSummary = useCallback(() => {
    if (!context?.business_profile) return null;

    const profile = context.business_profile;
    
    return {
      // Core business information
      businessType: profile.industry || 'No especificado',
      specificActivities: Array.isArray(profile.activities) 
        ? profile.activities.join(', ') 
        : profile.activities || 'No especificadas',
      experienceLevel: profile.experience || 'No especificado',
      
      // Business structure
      financialMaturity: profile.financialControl || 'No especificado',
      teamStructure: profile.teamStructure || 'No especificado',
      paymentCapabilities: Array.isArray(profile.paymentMethods)
        ? profile.paymentMethods.join(', ')
        : profile.paymentMethods || 'No especificados',
      
      // Detailed insights
      detailedAnswers: profile.extendedAnswers || {},
      customAnswers: profile.dynamicQuestionAnswers || {},
      
      // Context for AI
      lastAssessment: context.last_assessment_date,
      language: context.language_preference || 'es',
      
      // Future product catalog info
      businessName: profile.businessName,
      products: profile.productDescriptions || [],
      portfolioLinks: profile.portfolioLinks || [],
      socialLinks: profile.socialMediaLinks || []
    };
  }, [context]);

  // Check if user needs assessment
  const needsAssessment = useCallback(() => {
    if (!context) return true;
    
    const hasBasicProfile = context.business_profile && 
                           context.business_profile.industry &&
                           context.business_profile.activities;
    
    if (!hasBasicProfile) return true;
    
    // Check if assessment is older than 30 days
    if (context.last_assessment_date) {
      const lastAssessment = new Date(context.last_assessment_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (lastAssessment < thirtyDaysAgo) return true;
    }
    
    return false;
  }, [context]);

  useEffect(() => {
    fetchUserContext();
  }, [fetchUserContext]);

  return {
    context,
    loading,
    businessProfile: context?.business_profile,
    taskGenerationContext: context?.task_generation_context,
    languagePreference: context?.language_preference,
    
    // Actions
    updateBusinessProfile,
    updateTaskGenerationContext,
    setLanguagePreference,
    updateFromMaturityCalculator,
    refreshContext: fetchUserContext,
    
    // Computed values
    getBusinessSummary,
    needsAssessment: needsAssessment(),
    
    // Status checks
    hasCompleteProfile: !!(context?.business_profile?.industry && context?.business_profile?.activities),
    lastAssessmentDate: context?.last_assessment_date
  };
};