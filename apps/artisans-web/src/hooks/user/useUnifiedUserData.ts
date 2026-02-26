/**
 * useUnifiedUserData - Single Source of Truth for User Data
 * 
 * This hook provides a unified interface to access and manage all user data,
 * combining data from user_profiles, user_master_context, and localStorage cache.
 * 
 * Features:
 * - Smart caching with user-namespaced localStorage
 * - Automatic background sync to database
 * - Optimistic updates for instant UI feedback
 * - Single source of truth for all user data
 * 
 * Usage:
 * ```typescript
 * const { userData, loading, updateProfile, refreshData } = useUnifiedUserData();
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useToast } from '@/hooks/use-toast';
import '@/utils/clearUserDataCache'; // Auto-clear cache on import
import { clearCorruptedUserCache } from '@/utils/clearCorruptedCache';
import { getUserProfileByUserId, hasUserProfile, updateUserProfile, createUserProfile } from '@/services/userProfiles.actions';
import { getUserMasterContextByUserId, upsertUserMasterContext, createUserMasterContext, updateUserMasterContext } from '@/services/userMasterContext.actions';
import { useDataCache } from '@/context/DataCacheContext';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

// ============= Types =============

export interface UnifiedUserProfile {
  // Identity
  userId: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;

  // Business Identity
  brandName?: string;
  businessDescription?: string;
  businessType?: string;

  // Business Details
  targetMarket?: string;
  currentStage?: string;
  businessGoals?: string[];
  monthlyRevenueGoal?: number;

  // Location & Contact
  businessLocation?: string;
  city?: string;
  department?: string;
  whatsappE164?: string;

  // Business Metadata
  yearsInBusiness?: number;
  teamSize?: string;
  timeAvailability?: string;
  currentChallenges?: string[];
  salesChannels?: string[];
  socialMediaPresence?: Record<string, any>;
  initialInvestmentRange?: string;
  primarySkills?: string[];

  // User Preferences
  languagePreference?: 'en' | 'es';
  userType?: string;

  // RUT & Legal
  rut?: string;
  rutPendiente?: boolean;

  // Preferences
  newsletterOptIn?: boolean;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface UnifiedUserContext {
  // Rich business profile data (from JSONB)
  businessProfile?: any;

  // Task generation context
  taskGenerationContext?: {
    maturityScores?: any;
    language?: 'en' | 'es';
    generatedTasks?: number;
    lastGeneration?: string;
    lastAssessmentSource?: string;
    maturity_test_progress?: {
      current_block?: number;
      total_answered?: number;
      total_questions?: number;
      answered_question_ids?: string[];
      is_complete?: boolean;
      last_updated?: string;
      completed_at?: string;
    };
  };

  // Conversation insights
  conversationInsights?: any;

  // Technical details
  technicalDetails?: any;

  // Goals and objectives
  goalsAndObjectives?: any;

  // Metadata
  contextVersion?: number;
  lastUpdated?: string;
  lastAssessmentDate?: string;
}

export interface UnifiedUserData {
  profile: UnifiedUserProfile;
  context: UnifiedUserContext;
  isLoading: boolean;
  error: string | null;
  isCached: boolean;
  lastSync?: Date;
}

interface UpdateProfileOptions {
  optimistic?: boolean; // Default: true
  skipCache?: boolean;  // Default: false
}

// ============= Hook =============

export const useUnifiedUserData = () => {
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();
  const { toast } = useToast();
  const { getUserProfileCached } = useDataCache();
  const { trackEvent } = useAnalyticsTracking();

  const [data, setData] = useState<UnifiedUserData>({
    profile: { userId: '' },
    context: {},
    isLoading: true,
    error: null,
    isCached: false
  });

  const [syncInProgress, setSyncInProgress] = useState(false);

  // ============= Cache Key =============
  const CACHE_KEY = 'unified_user_data';
  const CACHE_TIMESTAMP_KEY = 'unified_user_data_timestamp';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // ✅ OPTIMIZATION: Get userId once for stable reference
  const userId = user?.id;

  // ============= Load from Cache =============
  // ✅ OPTIMIZATION: Use userId instead of userLocalStorage object in deps
  const loadFromCache = useCallback((): UnifiedUserData | null => {
    if (!userId) return null;

    try {
      const cached = localStorage.getItem(`user_${userId}_${CACHE_KEY}`);
      const timestamp = localStorage.getItem(`user_${userId}_${CACHE_TIMESTAMP_KEY}`);

      if (!cached || !timestamp) return null;

      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge > CACHE_TTL) {
        return null;
      }

      const parsedData = JSON.parse(cached);

      return {
        ...parsedData,
        isCached: true,
        lastSync: new Date(parseInt(timestamp))
      };
    } catch (error) {
      console.error('❌ Error loading from cache:', error);
      return null;
    }
  }, [userId]);

  // ============= Save to Cache =============
  // ✅ OPTIMIZATION: Use userId instead of userLocalStorage object in deps
  const saveToCache = useCallback((userData: Omit<UnifiedUserData, 'isCached' | 'lastSync'>) => {
    if (!userId) return;

    try {
      localStorage.setItem(`user_${userId}_${CACHE_KEY}`, JSON.stringify(userData));
      localStorage.setItem(`user_${userId}_${CACHE_TIMESTAMP_KEY}`, Date.now().toString());
    } catch (error) {
      console.error('[useUnifiedUserData] Error saving to cache:', error);
    }
  }, [userId]);

  // ============= Fetch from Database =============
  const fetchFromDatabase = useCallback(async (): Promise<UnifiedUserData> => {
    if (!user) {
      return {
        profile: { userId: '' },
        context: {},
        isLoading: false,
        error: 'No user authenticated',
        isCached: false
      };
    }

    try {
      // ✅ Fetch from NestJS backend in parallel
      const [profileData, contextData] = await Promise.all([
        getUserProfileCached(user.id),
        getUserMasterContextByUserId(user.id)
      ]);

      // Handle context data (can be null if doesn't exist, now in camelCase from NestJS)
      const contextObj: any = contextData || {};
      const profile: UnifiedUserProfile = {
        userId: user.id,
        email: user.email,
        fullName: profileData.fullName,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatarUrl: profileData.avatarUrl,
        brandName: profileData.brandName ||
          contextObj.businessProfile?.brandName,
        businessDescription: profileData.businessDescription,
        businessType: profileData.businessType,
        targetMarket: profileData.targetMarket,
        currentStage: profileData.currentStage,
        businessGoals: profileData.businessGoals,
        monthlyRevenueGoal: profileData.monthlyRevenueGoal,
        businessLocation: profileData.businessLocation,
        city: profileData.city,
        department: profileData.department,
        whatsappE164: profileData.whatsappE164,
        yearsInBusiness: profileData.yearsInBusiness,
        teamSize: profileData.teamSize,
        timeAvailability: profileData.timeAvailability,
        currentChallenges: profileData.currentChallenges,
        salesChannels: profileData.salesChannels,
        socialMediaPresence: profileData.socialMediaPresence,
        initialInvestmentRange: profileData.initialInvestmentRange,
        primarySkills: profileData.primarySkills,
        languagePreference: profileData.languagePreference,
        userType: profileData.userType,
        rut: profileData.rut,
        rutPendiente: profileData.rutPendiente,
        newsletterOptIn: profileData.newsletterOptIn,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt
      };

      // Handle context data (now in camelCase from NestJS backend)
      const context: UnifiedUserContext = {
        businessProfile: contextObj.businessProfile,
        taskGenerationContext: contextObj.taskGenerationContext,
        conversationInsights: contextObj.conversationInsights,
        technicalDetails: contextObj.technicalDetails,
        goalsAndObjectives: contextObj.goalsAndObjectives,
        contextVersion: contextObj.contextVersion,
        lastUpdated: contextObj.lastUpdated,
        lastAssessmentDate: contextObj.lastAssessmentDate
      };

      // ✅ PRIORIZAR datos de business_profile si son más completos
      const bp = contextObj.businessProfile || {};
      if (bp.brandName) {
        profile.brandName = bp.brandName;
      }
      if (bp.businessDescription) {
        profile.businessDescription = bp.businessDescription;
      }
      if (bp.craftType || bp.businessType) {
        profile.businessType = bp.craftType || bp.businessType;
      }
      if (bp.businessLocation) {
        profile.businessLocation = bp.businessLocation;
      }

      const result: UnifiedUserData = {
        profile,
        context,
        isLoading: false,
        error: null,
        isCached: false,
        lastSync: new Date()
      };

      // Save to cache
      saveToCache(result);

      return result;

    } catch (error: any) {
      console.error('❌ Error fetching user data:', error);
      return {
        profile: { userId: user.id, email: user.email },
        context: {},
        isLoading: false,
        error: error.message,
        isCached: false
      };
    }
  }, [user?.id, user?.email, saveToCache, getUserProfileCached]);

  // ============= Validate Profile Integrity (Tolerant) =============
  // ✅ OPTIMIZATION: Use userId instead of full user object
  const validateProfileIntegrity = useCallback(async () => {
    if (!userId) return true;

    let retries = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 segundo

    while (retries < maxRetries) {
      try {
        // ✅ Verificar que el perfil existe usando NestJS backend
        const profileExists = await hasUserProfile(user.id);

        // ✅ Perfil encontrado - todo OK
        if (profileExists) {
          return true;
        }

        // ❌ Perfil no existe
        console.warn('[useUnifiedUserData] Perfil no encontrado en el backend');

        // Limpiar cache corrupto
        const cleanedCount = clearCorruptedUserCache(user.id);
        if (cleanedCount > 0) {
          console.warn(`[useUnifiedUserData] Cache limpiado: ${cleanedCount} entradas`);
        }

        // ✅ Migrado a endpoint NestJS (POST /user-profiles)
        try {
          await createUserProfile({
            userId: user.id,
            fullName: user.email || 'Usuario',
            avatarUrl: '',
            languagePreference: 'es',
            rutPendiente: true,
            newsletterOptIn: false
          });

          toast({
            title: "Perfil sincronizado",
            description: "Tu perfil ha sido actualizado correctamente.",
            variant: "default"
          });
          return true;
        } catch (insertError) {
          console.error('[useUnifiedUserData] Error al crear perfil:', insertError);
          return false;
        }

      } catch (error) {
        console.error(`❌ Error validando integridad del perfil (intento ${retries + 1}/${maxRetries}):`, error);
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
        }
      }
    }

    // Después de todos los intentos, continuar de forma tolerante
    console.warn('⚠️ Validación de perfil omitida después de múltiples intentos');
    return true;
  }, [userId, user?.email, toast]);

  // ============= Initial Load =============
  useEffect(() => {
    if (!userId) {
      setData({
        profile: { userId: '' },
        context: {},
        isLoading: false,
        error: null,
        isCached: false
      });
      return;
    }

    let mounted = true;

    const loadData = async () => {
      // ✅ Primero validar integridad del perfil
      const isValid = await validateProfileIntegrity();

      if (!isValid) {
        console.warn('⚠️ Perfil inválido detectado, reparación en progreso...');
        // La función de validación ya maneja la reparación y recarga
        return;
      }

      // ✅ Cargar datos frescos de la base de datos
      const freshData = await fetchFromDatabase();


      if (mounted) {
        setData(freshData);

        // Verificar si hay cache corrupto y limpiarlo
        if (freshData.error && userId) {
          clearCorruptedUserCache(userId);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [userId, validateProfileIntegrity, fetchFromDatabase]); // ✅ OPTIMIZATION: Stable dependencies

  // ============= Update Profile =============
  const updateProfile = useCallback(async (
    updates: Partial<UnifiedUserProfile>,
    options: UpdateProfileOptions = {}
  ) => {
    if (!user) throw new Error('No user authenticated');

    const { optimistic = true, skipCache = false } = options;

    // Optimistic update
    if (optimistic) {
      setData(prev => ({
        ...prev,
        profile: { ...prev.profile, ...updates },
        lastSync: new Date()
      }));
    }

    try {
      // ✅ Migrado a endpoint NestJS (PATCH /user-profiles/:userId)
      await updateUserProfile(user.id, {
        fullName: updates.fullName,
        firstName: updates.firstName,
        lastName: updates.lastName,
        brandName: updates.brandName,
        businessDescription: updates.businessDescription,
        businessType: updates.businessType,
        targetMarket: updates.targetMarket,
        currentStage: updates.currentStage,
        businessGoals: updates.businessGoals,
        monthlyRevenueGoal: updates.monthlyRevenueGoal,
        businessLocation: updates.businessLocation,
        city: updates.city,
        department: updates.department,
        yearsInBusiness: updates.yearsInBusiness,
        teamSize: updates.teamSize,
        languagePreference: updates.languagePreference,
        rut: updates.rut,
        rutPendiente: updates.rutPendiente
      });

      // Refresh from DB to get updated_at timestamp
      const freshData = await fetchFromDatabase();
      setData(freshData);

      // Track successful profile update
      trackEvent({
        eventType: 'profile_updated',
        eventData: {
          updatedFields: Object.keys(updates),
          hasBusinessInfo: !!(updates.brandName || updates.businessDescription)
        },
        success: true
      });

      return { success: true };

    } catch (error: any) {
      console.error('❌ Error updating profile:', error);

      // Rollback optimistic update
      if (optimistic) {
        const cached = loadFromCache();
        if (cached) setData(cached);
      }

      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive'
      });

      return { success: false, error: error.message };
    }
  }, [user, fetchFromDatabase, loadFromCache, toast]);

  // ============= Update Context =============
  const updateContext = useCallback(async (
    updates: Partial<UnifiedUserContext>
  ) => {
    if (!user) throw new Error('No user authenticated');

    try {
      // ✅ Fetch existing context first to merge (from NestJS backend)
      const existingContext = await getUserMasterContextByUserId(user.id);

      // Merge with existing data to prevent data loss
      const mergedUpdate = {
        businessProfile: updates.businessProfile !== undefined
          ? { ...(existingContext?.businessProfile as any || {}), ...updates.businessProfile }
          : existingContext?.businessProfile,
        taskGenerationContext: updates.taskGenerationContext !== undefined
          ? { ...(existingContext?.taskGenerationContext as any || {}), ...updates.taskGenerationContext }
          : existingContext?.taskGenerationContext,
        conversationInsights: updates.conversationInsights !== undefined
          ? { ...(existingContext?.conversationInsights as any || {}), ...updates.conversationInsights }
          : existingContext?.conversationInsights,
        technicalDetails: updates.technicalDetails !== undefined
          ? { ...(existingContext?.technicalDetails as any || {}), ...updates.technicalDetails }
          : existingContext?.technicalDetails,
        goalsAndObjectives: updates.goalsAndObjectives !== undefined
          ? { ...(existingContext?.goalsAndObjectives as any || {}), ...updates.goalsAndObjectives }
          : existingContext?.goalsAndObjectives,
        languagePreference: updates.taskGenerationContext?.language || existingContext?.languagePreference
      };


      if (existingContext === null || existingContext === undefined) {
        // No existe contexto - crear uno nuevo
        await createUserMasterContext({
          userId: user.id,
          ...mergedUpdate
        });
      } else {
        // Ya existe contexto - actualizar
        await updateUserMasterContext(user.id, mergedUpdate);
      }

      // Refresh from DB
      const freshData = await fetchFromDatabase();
      setData(freshData);

      return { success: true };

    } catch (error: any) {
      console.error('❌ Error updating context:', error);
      return { success: false, error: error.message };
    }
  }, [user, fetchFromDatabase]);

  // ============= Force Refresh =============
  const refreshData = useCallback(async () => {
    setSyncInProgress(true);
    const freshData = await fetchFromDatabase();
    setData(freshData);

    // Track dashboard refresh
    trackEvent({
      eventType: 'dashboard_refresh',
      eventData: {
        hasProfile: !!freshData.profile?.userId,
        hasContext: !!(freshData.context?.businessProfile || freshData.context?.taskGenerationContext)
      }
    });

    setSyncInProgress(false);
  }, [fetchFromDatabase, trackEvent]);

  // ============= Clear Cache =============
  const clearCache = useCallback(() => {
    userLocalStorage.removeItem(CACHE_KEY);
    userLocalStorage.removeItem(CACHE_TIMESTAMP_KEY);
  }, [userLocalStorage]);

  // ============= Return =============
  return {
    // Data
    userData: data,
    profile: data.profile,
    context: data.context,

    // State
    loading: data.isLoading,
    error: data.error,
    isCached: data.isCached,
    lastSync: data.lastSync,
    syncInProgress,

    // Actions
    updateProfile,
    updateContext,
    refreshData,
    clearCache
  };
};
