import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserProfileData } from '@/components/cultural/types/wizardTypes';
import { EventBus } from '@/utils/eventBus';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useUnifiedUserData } from './user';
import { MATURITY_TEST_CONFIG, getProgressPercentage } from '@/config/maturityTest';
import { artisanAgentsDatabase } from '@/data/artisanAgentsDatabase';
import { getUserProfileByUserId, hasUserProfile, createUserProfile, updateUserProfile } from '@/services/userProfiles.actions';
import { upsertUserMasterContext } from '@/services/userMasterContext.actions';
import { upsertUserProgress } from '@/services/userProgress.actions';
import { getLatestMaturityScore, deleteUserMaturityScores } from '@/services/userMaturityScores.actions';

export interface DebugArtisanData {
  // Process status
  currentBlock: number;
  totalBlocks: number;
  answeredQuestions: number;
  totalQuestions: number;
  checkpointActive: boolean;
  currentCheckpoint: number;
  isProcessing: boolean;

  // Profile data
  profileData: UserProfileData | null;

  // Technical data
  localStorage: {
    fusedMaturityProgress?: any;
    onboardingCompleted?: string;
    maturityScores?: any;
  };

  // Database data
  databaseContext: {
    business_profile?: any;
    task_generation_context?: any;
    last_updated?: string;
    context_version?: number;
    language_preference?: string;
  } | null;

  // Resumen Ejecutivo del Master Coordinator
  executiveSummary: {
    businessReadiness: number;
    profileCompleteness: number;
    activeTasksCount: number;
    completedTasksCount: number;
    topPriorities: string[];
    businessInsights: string[];
    nextRecommendedActions: string[];
    masterCoordinatorContext: any;
  } | null;

  // Métricas consolidadas
  metrics: {
    totalQuestions: number;
    answeredQuestions: number;
    progressPercentage: number;
    checkpointsReached: number;
    agentsUnlocked: number;
  };

  // Events timeline
  events: Array<{
    timestamp: string;
    type: 'question_answered' | 'checkpoint' | 'craft_detected' | 'db_save' | 'error';
    message: string;
    data?: any;
  }>;

  loading: boolean;
  error: string | null;
}

export const useDebugArtisanData = (autoRefresh = false) => {
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();
  const { context } = useUnifiedUserData();
  const [data, setData] = useState<DebugArtisanData>({
    currentBlock: 0,
    totalBlocks: MATURITY_TEST_CONFIG.TOTAL_BLOCKS,
    answeredQuestions: 0,
    totalQuestions: MATURITY_TEST_CONFIG.TOTAL_QUESTIONS,
    checkpointActive: false,
    currentCheckpoint: 0,
    isProcessing: false,
    profileData: null,
    localStorage: {},
    databaseContext: null,
    executiveSummary: null,
    metrics: {
      totalQuestions: MATURITY_TEST_CONFIG.TOTAL_QUESTIONS,
      answeredQuestions: 0,
      progressPercentage: 0,
      checkpointsReached: 0,
      agentsUnlocked: 0
    },
    events: [],
    loading: true,
    error: null
  });

  const loadData = async () => {
    try {
      // Load user-namespaced localStorage data
      const localStorageData = {
        fusedMaturityProgress: JSON.parse(userLocalStorage.getItem('fusedMaturityProgress') || 'null'),
        onboardingCompleted: userLocalStorage.getItem('onboardingCompleted') || undefined,
        maturityScores: JSON.parse(userLocalStorage.getItem('maturityScores') || 'null')
      };

      // Load database data from unified context (already cached)
      let dbContext = null;
      if (user && context) {
        dbContext = {
          business_profile: context.businessProfile,
          task_generation_context: context.taskGenerationContext,
          last_updated: context.lastUpdated,
          context_version: context.contextVersion,
          language_preference: context.taskGenerationContext?.language
        };
      }

      // Parse profile data from localStorage
      const progress = localStorageData.fusedMaturityProgress;
      const profileData = progress?.profileData || null;
      const answeredQuestions = progress?.answeredQuestions || [];
      const checkpointData = progress?.checkpointData || {};

      // Build events timeline from localStorage history
      const events: DebugArtisanData['events'] = [];

      if (progress?.lastSaved) {
        events.push({
          timestamp: progress.lastSaved,
          type: 'db_save',
          message: 'Data saved to localStorage',
          data: { questionsCount: answeredQuestions.length }
        });
      }

      if (checkpointData.lastActivated) {
        events.push({
          timestamp: checkpointData.lastActivated,
          type: 'checkpoint',
          message: `Checkpoint ${checkpointData.number} activated`,
          data: checkpointData
        });
      }

      if (profileData?.craftType) {
        events.push({
          timestamp: new Date().toISOString(),
          type: 'craft_detected',
          message: `Craft type detected: ${profileData.craftType}`,
          data: { craftType: profileData.craftType }
        });
      }

      // Sort events by timestamp (most recent first)
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Cargar resumen ejecutivo
      const executiveSummary = await fetchExecutiveSummary();

      // Calcular métricas consolidadas
      const checkpointsReached = Math.floor(answeredQuestions.length / MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY);
      const agentsUnlocked = answeredQuestions.length >= MATURITY_TEST_CONFIG.TOTAL_QUESTIONS ?
        artisanAgentsDatabase.length :
        Math.floor(answeredQuestions.length / 3);

      const metrics = {
        totalQuestions: MATURITY_TEST_CONFIG.TOTAL_QUESTIONS,
        answeredQuestions: answeredQuestions.length,
        progressPercentage: getProgressPercentage(answeredQuestions.length, MATURITY_TEST_CONFIG.TOTAL_QUESTIONS),
        checkpointsReached,
        agentsUnlocked
      };

      setData({
        currentBlock: checkpointData.number || 0,
        totalBlocks: MATURITY_TEST_CONFIG.TOTAL_BLOCKS,
        answeredQuestions: answeredQuestions.length,
        totalQuestions: MATURITY_TEST_CONFIG.TOTAL_QUESTIONS,
        checkpointActive: checkpointData.isActive || false,
        currentCheckpoint: checkpointData.number || 0,
        isProcessing: progress?.isProcessing || false,
        profileData,
        localStorage: localStorageData,
        databaseContext: dbContext,
        executiveSummary,
        metrics,
        events: events.slice(0, 20), // Keep last 20 events
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error loading debug data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const fetchExecutiveSummary = async () => {
    if (!user) return null;

    console.log('fetchExecutiveSummary', user.id)

    try {
      // 1. Obtener contexto del Master Coordinator
      const { data: masterContext } = await supabase
        .from('master_coordinator_context')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // 2. Obtener tareas activas y completadas
      const { data: tasks } = await supabase
        .from('agent_tasks')
        .select('*')
        .eq('user_id', user.id);

      const activeTasks = tasks?.filter(t => t.status === 'in_progress') || [];
      const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

      // 3. Calcular métricas de negocio
      // ✅ Obtener perfil desde NestJS backend
      const userProfile = await getUserProfileByUserId(user.id).catch(() => null);

      // ✅ Migrado a endpoint NestJS (GET /telar/server/user-maturity-scores/user/{user_id})
      const maturityScores = await getLatestMaturityScore(user.id);

      // 4. Calcular Business Readiness Score
      const profileFields = [
        userProfile?.brandName,
        userProfile?.businessDescription,
        userProfile?.business_type,
        userProfile?.target_market,
        userProfile?.business_location
      ];
      const profileCompleteness = (profileFields.filter(Boolean).length / profileFields.length) * 100;

      // Calcular total de respuestas desde profileData si existe
      const profileDataObj = maturityScores?.profileData as any;
      const totalAnswered = profileDataObj?.answeredQuestions?.length || 0;
      const assessmentProgress = (totalAnswered / MATURITY_TEST_CONFIG.TOTAL_QUESTIONS) * 100;

      const businessReadiness = Math.round((profileCompleteness + assessmentProgress) / 2);

      // 5. Generar insights del negocio
      const businessInsights: string[] = [];

      if (maturityScores) {
        const scores = [
          maturityScores.ideaValidation,
          maturityScores.userExperience,
          maturityScores.marketFit,
          maturityScores.monetization
        ];
        const avgScore = scores.reduce((a, b) => a + (b || 0), 0) / scores.length;

        if (avgScore >= 7) {
          businessInsights.push('🎯 Tu negocio muestra alta madurez en la mayoría de áreas');
        } else if (avgScore >= 5) {
          businessInsights.push('📈 Hay áreas de oportunidad significativas para mejorar');
        } else {
          businessInsights.push('🚀 Estás en fase temprana - enfócate en fundamentos');
        }
      }

      if (completedTasks.length > 5) {
        businessInsights.push(`✅ Has completado ${completedTasks.length} tareas - excelente progreso`);
      }

      if (!userProfile?.brand_name) {
        businessInsights.push('⚠️ Falta definir tu marca personal');
      }

      // 6. Determinar próximas acciones recomendadas
      const nextRecommendedActions: string[] = [];

      if (totalAnswered < MATURITY_TEST_CONFIG.TOTAL_QUESTIONS) {
        nextRecommendedActions.push(`Completar el test de madurez (${totalAnswered}/${MATURITY_TEST_CONFIG.TOTAL_QUESTIONS})`);
      }

      if (activeTasks.length === 0 && completedTasks.length === 0) {
        nextRecommendedActions.push('Generar tareas personalizadas con el Master Coordinator');
      } else if (activeTasks.length > 0) {
        nextRecommendedActions.push(`Continuar con ${activeTasks.length} tarea(s) en progreso`);
      }

      if (!userProfile?.business_description) {
        nextRecommendedActions.push('Describir tu negocio en el perfil');
      }

      // 7. Top priorities desde Master Coordinator
      const topPriorities: string[] = [];
      if (masterContext?.context_snapshot) {
        const snapshot = masterContext.context_snapshot as any;
        if (snapshot.last_generated_tasks) {
          const highPriorityTasks = snapshot.last_generated_tasks
            .filter((t: any) => t.relevance === 'high')
            .slice(0, 3);
          topPriorities.push(...highPriorityTasks.map((t: any) => t.title));
        }
      }

      return {
        businessReadiness,
        profileCompleteness: Math.round(profileCompleteness),
        activeTasksCount: activeTasks.length,
        completedTasksCount: completedTasks.length,
        topPriorities,
        businessInsights,
        nextRecommendedActions,
        masterCoordinatorContext: masterContext
      };

    } catch (error) {
      console.error('Error fetching executive summary:', error);
      return null;
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadData, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, user]);

  const clearAllProgress = async () => {
    try {
      // 1. Clear all localStorage items
      const keysToRemove = [
        // Maturity & Onboarding
        'fusedMaturityProgress',
        'onboardingCompleted',
        'maturityScores',
        'recommendedAgents',
        'maturityTestStarted',
        'currentMaturityBlock',
        'maturityCalculatorProgress',
        'fused_maturity_calculator_progress',
        'profileData',

        // Business Profile
        'businessDeepDiveAnswers',
        'business_profile_captured',

        // Conversational Agents
        'conversational-agent-progress',
        'enhanced_conversational_agent_progress',

        // Dashboard & Tasks
        'master-agent-onboarding-seen',
        'userProfile',

        // Shop & Products
        'artisan-shop-creation-progress',
        'shop-theme-preferences',
        'product-draft',

        // Calculators
        'pricing-calculator-data',
        'cost-calculator-results'
      ];

      // Remove known keys
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Remove all keys starting with 'agent-' or 'step-data-'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('agent-') || key.startsWith('step-data-')) {
          localStorage.removeItem(key);
        }
      });

      if (!user) {
        throw new Error('No user logged in');
      }

      // 2. Clear database tables in correct order (respecting foreign keys)

      // Delete agent_chat_conversations (has foreign key to user_id)
      const { error: chatConvError } = await supabase
        .from('agent_chat_conversations')
        .delete()
        .eq('user_id', user.id);
      if (chatConvError) console.error('Error deleting chat conversations:', chatConvError);

      // Delete agent_conversations
      const { error: convError } = await supabase
        .from('agent_conversations')
        .delete()
        .eq('user_id', user.id);
      if (convError) console.error('Error deleting conversations:', convError);

      // Delete agent_tasks
      const { error: tasksError } = await supabase
        .from('agent_tasks')
        .delete()
        .eq('user_id', user.id);
      if (tasksError) console.error('Error deleting tasks:', tasksError);

      // ============= SHOP & PRODUCTS CLEANUP =============
      // Get shop_id if exists
      const { data: shopData } = await supabase
        .from('artisan_shops')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const shopId = shopData?.id;

      if (shopId) {
        // Delete wishlists
        await supabase.from('wishlists').delete().eq('user_id', user.id);

        // Get product IDs
        const { data: productIds } = await supabase
          .from('products')
          .select('id')
          .eq('shop_id', shopId);

        const prodIdList = productIds?.map(p => p.id) || [];

        if (prodIdList.length > 0) {
          // Delete BOM entries
          await supabase.from('bom').delete().in('product_id', prodIdList);

          // Get variant IDs
          const { data: variantIds } = await supabase
            .from('product_variants')
            .select('id')
            .in('product_id', prodIdList);

          const variantIdList = variantIds?.map(v => v.id) || [];

          if (variantIdList.length > 0) {
            // Delete inventory movements
            await supabase.from('inventory_movements').delete().in('product_variant_id', variantIdList);
          }

          // Delete product variants
          await supabase.from('product_variants').delete().in('product_id', prodIdList);
        }

        // Delete products
        await supabase.from('products').delete().eq('shop_id', shopId);

        // Delete artisan shop
        await supabase.from('artisan_shops').delete().eq('user_id', user.id);

        // Delete artisan_analytics (shop analytics data)
        await supabase.from('artisan_analytics').delete().eq('shop_id', shopId);
      }

      // Delete artisan_global_profiles (profile snapshots with maturity data)
      await supabase.from('artisan_global_profiles').delete().eq('artisan_id', user.id);

      // Delete independent tables
      await supabase.from('materials').delete().eq('user_id', user.id);
      // ============= END SHOP & PRODUCTS CLEANUP =============

      // Delete user_agents
      const { error: agentsError } = await supabase
        .from('user_agents')
        .delete()
        .eq('user_id', user.id);
      if (agentsError) console.error('Error deleting agents:', agentsError);

      // Delete user_maturity_scores
      // ✅ Migrado a endpoint NestJS (DELETE /telar/server/user-maturity-scores/user/{user_id})
      // TODO: Este endpoint podría no existir aún. Si falla, se logea pero no se lanza error.
      await deleteUserMaturityScores(user.id);

      // Delete user_onboarding_profiles
      const { error: onboardingError } = await supabase
        .from('user_onboarding_profiles')
        .delete()
        .eq('user_id', user.id);
      if (onboardingError) console.error('Error deleting onboarding profiles:', onboardingError);

      // ✅ Reset user_master_context (migrado a NestJS - UPSERT)
      try {
        await upsertUserMasterContext(user.id, {
          businessContext: {},
          taskGenerationContext: {},
          contextVersion: 1
        });
      } catch (contextError) {
        console.error('[useDebugArtisanData] Error resetting master context:', contextError);
        throw contextError;
      }

      // Delete master_coordinator_context
      const { error: coordinatorError } = await supabase
        .from('master_coordinator_context')
        .delete()
        .eq('user_id', user.id);
      if (coordinatorError) console.error('Error deleting coordinator context:', coordinatorError);

      // Recreate empty master_coordinator_context
      const { error: coordinatorCreateError } = await supabase
        .from('master_coordinator_context')
        .insert({
          user_id: user.id,
          context_snapshot: {},
          context_version: 1
        });
      if (coordinatorCreateError) console.warn('Could not recreate master coordinator context:', coordinatorCreateError);

      // Recreate user_progress with initial values
      try {
        // TODO: Si necesitas DELETE primero, requiere endpoint DELETE /telar/server/user-progress/:id
        // Por ahora usamos UPSERT que resetea los valores
        await upsertUserProgress(user.id, {
          level: 1,
          experiencePoints: 0,
          nextLevelXp: 100,
          completedMissions: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalTimeSpent: 0
        });
      } catch (progressError: any) {
        console.error('Error resetting progress:', progressError);
      }

      // 3. Reset business fields in user_profiles
      // ✅ Migrado a endpoint NestJS (POST o PATCH según existencia)
      const profileExists = await hasUserProfile(user.id);

      if (!profileExists) {
        // Create profile if it doesn't exist
        try {
          await createUserProfile({
            userId: user.id,
            languagePreference: 'es',
            rutPendiente: true,
            newsletterOptIn: false,
            socialMediaPresence: {}
          });
        } catch (createProfileError) {
          console.error('[useDebugArtisanData] Error creating profile:', createProfileError);
          throw createProfileError;
        }
      } else {
        // Update existing profile (reset to null/empty)
        try {
          await updateUserProfile(user.id, {
            avatarUrl: null,
            businessDescription: null,
            brandName: null,
            businessType: null,
            targetMarket: null,
            currentStage: null,
            businessGoals: null,
            monthlyRevenueGoal: null,
            timeAvailability: null,
            teamSize: null,
            currentChallenges: null,
            salesChannels: null,
            socialMediaPresence: {},
            businessLocation: null,
            yearsInBusiness: null,
            initialInvestmentRange: null,
            primarySkills: null,
            rut: null,
            rutPendiente: true,
            department: null,
            city: null,
            whatsappE164: null,
            firstName: null,
            lastName: null,
            newsletterOptIn: false
          });
        } catch (profileError) {
          console.error('[useDebugArtisanData] Error resetting profile:', profileError);
          throw profileError;
        }
      }

      // 4. Clear in-memory state FIRST
      console.log('[Debug] 🧹 Clearing in-memory state...');
      window.dispatchEvent(new CustomEvent('clear-master-agent-state'));

      // 5. Wait for state to clear
      await new Promise(resolve => setTimeout(resolve, 300));

      // 6. Force full sync of MasterAgentContext
      console.log('[Debug] 🔄 Triggering full sync...');
      EventBus.publish('master.full.sync', { timestamp: Date.now() });

      // 7. Wait for sync to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // 8. Reload debug data
      console.log('[Debug] 📊 Reloading debug data...');
      await loadData();

      // 9. Emit event to force dashboard refresh
      EventBus.publish('debug.data.cleared', {
        timestamp: Date.now(),
        user_id: user.id
      });
      console.log('✅ [DEBUG] Published event: debug.data.cleared');

      return { success: true };
    } catch (error) {
      console.error('Error clearing all progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const exportData = () => {
    const exportObj = {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      ...data
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artisan-debug-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    data,
    loading: data.loading,
    error: data.error,
    refresh: loadData,
    clearAllProgress,
    exportData
  };
};
