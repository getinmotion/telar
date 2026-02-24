import { supabase } from '@/integrations/supabase/client';
import { createUserLocalStorage } from './userLocalStorageUtils';
import { getLatestMaturityScore } from '@/services/userMaturityScores.actions';

// Enhanced user progress detection utility with Supabase verification
export const getUserProgressStatus = async (userId?: string) => {
  try {
    console.log('🔍 Checking user progress status for userId:', userId);
    
    if (!userId) {
      console.warn('⚠️ No userId provided to getUserProgressStatus');
      return {
        hasProgress: false,
        shouldGoToDashboard: false,
        reason: 'no_user_id',
        source: 'none'
      };
    }

    const userLocalStorage = createUserLocalStorage(userId);
    
    // 🔄 MIGRACIÓN GLOBAL: Antes de consultar Supabase, migrar progreso global si existe
    const fusedGlobal = window.localStorage.getItem('fused_maturity_calculator_progress');
    if (fusedGlobal) {
      try {
        const raw = JSON.parse(fusedGlobal);
        if (raw?.answeredQuestionIds?.length > 0) {
          userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify({ 
            ...raw, 
            lastUpdated: new Date().toISOString() 
          }));
          window.localStorage.removeItem('fused_maturity_calculator_progress');
          console.log('[MIGRATION Async] Global fused progress migrated → user namespaced:', raw.answeredQuestionIds.length);
        }
      } catch (e) {
        console.warn('[MIGRATION Async] Error parsing global fused progress:', e);
      }
    }
    
    // 🔄 LEGACY MIGRATION: Migrar maturityCalculatorProgress si existe
    const legacyNamespaced = userLocalStorage.getItem('maturityCalculatorProgress');
    const legacyGlobal = window.localStorage.getItem('maturityCalculatorProgress');
    const legacyRaw = legacyNamespaced || legacyGlobal;
    
    if (legacyRaw) {
      try {
        const legacy = JSON.parse(legacyRaw);
        const ids = legacy.answers ? Object.keys(legacy.answers) : [];
        
        if (ids.length > 0) {
          const migrated = {
            currentBlockIndex: 0,
            answeredQuestionIds: ids,
            profileData: legacy.profileData || {},
            showCheckpoint: false,
            isCompleted: false,
            businessType: legacy.businessType || 'creative',
            lastUpdated: new Date(legacy.timestamp || Date.now()).toISOString()
          };
          
          userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(migrated));
          
          if (!legacyNamespaced) {
            window.localStorage.removeItem('maturityCalculatorProgress');
          }
          
          console.log('[MIGRATION Async] Legacy maturityCalculatorProgress → fused:', ids.length);
        }
      } catch (e) {
        console.warn('[MIGRATION Async] Error parsing legacy maturityCalculatorProgress:', e);
      }
    }
    
    // 🔄 EXTRA LEGACY MIGRATION: fusedMaturityProgress (otra variante legacy)
    const legacyFusedNamespaced = userLocalStorage.getItem('fusedMaturityProgress');
    const legacyFusedGlobal = window.localStorage.getItem('fusedMaturityProgress');
    const legacyFusedRaw = legacyFusedNamespaced || legacyFusedGlobal;
    
    if (legacyFusedRaw) {
      try {
        const legacyFused = JSON.parse(legacyFusedRaw);
        const ids = legacyFused.answeredQuestions 
          ? (Array.isArray(legacyFused.answeredQuestions) 
              ? legacyFused.answeredQuestions 
              : Object.keys(legacyFused.answeredQuestions))
          : [];
        
        if (ids.length > 0) {
          const migrated = {
            currentBlockIndex: 0,
            answeredQuestionIds: ids,
            profileData: legacyFused.profileData || {},
            showCheckpoint: false,
            isCompleted: false,
            businessType: 'creative',
            lastUpdated: new Date(legacyFused.lastSaved || Date.now()).toISOString()
          };
          
          userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(migrated));
          
          if (!legacyFusedNamespaced) {
            window.localStorage.removeItem('fusedMaturityProgress');
          }
          
          console.log('[MIGRATION Async] Legacy fusedMaturityProgress → fused:', ids.length);
        }
      } catch (e) {
        console.warn('[MIGRATION Async] Error parsing legacy fusedMaturityProgress:', e);
      }
    }
    
    // Check multiple indicators of user progress from user-namespaced localStorage
    const onboardingCompleted = userLocalStorage.getItem('onboardingCompleted');
    const maturityScores = userLocalStorage.getItem('maturityScores');
    const recommendedAgents = userLocalStorage.getItem('recommendedAgents');
    const userProfileData = userLocalStorage.getItem('userProfileData');
    
    console.log('📊 LocalStorage progress indicators:', {
      onboardingCompleted,
      hasMaturityScores: !!maturityScores,
      hasRecommendedAgents: !!recommendedAgents,
      hasUserProfileData: !!userProfileData
    });

    // Primary check: explicit onboarding flag with validation
    if (onboardingCompleted === 'true') {
      console.log('✅ User has explicit onboarding completed flag');
      return {
        hasProgress: true,
        shouldGoToDashboard: true,
        reason: 'onboarding_completed',
        source: 'localStorage'
      };
    }

    // Secondary check: has valid maturity scores
    let hasValidMaturityScores = false;
    if (maturityScores) {
      try {
        const scores = JSON.parse(maturityScores);
        if (scores && typeof scores === 'object' && Object.keys(scores).length > 0) {
          hasValidMaturityScores = true;
          console.log('✅ Found valid maturity scores in user-namespaced localStorage');
          // Auto-mark onboarding as complete
          userLocalStorage.setItem('onboardingCompleted', 'true');
          return {
            hasProgress: true,
            shouldGoToDashboard: true,
            reason: 'has_maturity_scores',
            source: 'localStorage'
          };
        }
      } catch (e) {
        console.warn('⚠️ Error parsing maturity scores from localStorage:', e);
      }
    }

    // Tertiary check: has recommended agents
    let hasValidAgents = false;
    if (recommendedAgents) {
      try {
        const agents = JSON.parse(recommendedAgents);
        if (agents && (Array.isArray(agents) || typeof agents === 'object')) {
          hasValidAgents = true;
          console.log('✅ Found valid recommended agents in localStorage');
          return {
            hasProgress: true,
            shouldGoToDashboard: true,
            reason: 'has_recommended_agents',
            source: 'localStorage'
          };
        }
      } catch (e) {
        console.warn('⚠️ Error parsing recommended agents from localStorage:', e);
      }
    }

    // Profile data check
    if (userProfileData) {
      try {
        const profileData = JSON.parse(userProfileData);
        if (profileData && typeof profileData === 'object' && Object.keys(profileData).length > 0) {
          console.log('✅ Found valid user profile data in localStorage');
          return {
            hasProgress: true,
            shouldGoToDashboard: true,
            reason: 'has_profile_data',
            source: 'localStorage'
          };
        }
      } catch (e) {
        console.warn('⚠️ Error parsing user profile data from localStorage:', e);
      }
    }

    // If userId provided, verify with Supabase as fallback
    if (userId) {
      console.log('🔄 LocalStorage incomplete, checking Supabase for user progress...');
      
      // 🆕 CHECK: Verificar progreso parcial en user_master_context ANTES de otros checks
      try {
        const { data: masterContext } = await supabase
          .from('user_master_context')
          .select('task_generation_context')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (masterContext?.task_generation_context) {
          const maturityTestProgress = (masterContext.task_generation_context as any)?.maturity_test_progress;
          if (maturityTestProgress?.total_answered > 0) {
            console.log('✅ [DB] Found partial maturity test progress in user_master_context:', maturityTestProgress.total_answered);
            
            // Opcional: sincronizar a localStorage para futuras detecciones rápidas
            const syncedProgress = {
              currentBlockIndex: 0,
              answeredQuestionIds: Array(maturityTestProgress.total_answered).fill(0).map((_, i) => `q${i}`),
              profileData: {},
              showCheckpoint: false,
              isCompleted: false,
              businessType: 'creative',
              lastUpdated: new Date().toISOString()
            };
            userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(syncedProgress));
            
            return {
              hasProgress: true,
              shouldGoToDashboard: true,
              reason: 'db_partial_progress',
              source: 'user_master_context',
              partialProgress: maturityTestProgress.total_answered
            };
          }
        }
      } catch (err) {
        console.warn('⚠️ [DB] Error checking user_master_context for partial progress:', err);
      }
      
      const supabaseProgress = await checkSupabaseUserProgress(userId);
      
      if (supabaseProgress.hasProgress) {
        console.log('✅ Found user progress in Supabase, recovering user-namespaced localStorage...');
        // Recover user-namespaced localStorage from Supabase data
        if (supabaseProgress.maturityScores) {
          userLocalStorage.setItem('maturityScores', JSON.stringify(supabaseProgress.maturityScores));
        }
        if (supabaseProgress.agents && supabaseProgress.agents.length > 0) {
          // Convert agents array to recommended agents format
          const agentRecommendations = {
            primary: supabaseProgress.agents.map(agent => agent.agent_id),
            secondary: []
          };
          userLocalStorage.setItem('recommendedAgents', JSON.stringify(agentRecommendations));
        }
        userLocalStorage.setItem('onboardingCompleted', 'true');
        
        return {
          hasProgress: true,
          shouldGoToDashboard: true,
          reason: 'recovered_from_supabase',
          source: 'supabase'
        };
      }
    }

    // No progress indicators found - new user
    console.log('❌ No progress indicators found - treating as new user');
    return {
      hasProgress: false,
      shouldGoToDashboard: false,
      reason: 'new_user',
      source: 'none'
    };

  } catch (error) {
    console.error('💥 Error checking user progress status:', error);
    return {
      hasProgress: false,
      shouldGoToDashboard: false,
      reason: 'error',
      source: 'error'
    };
  }
};

// Check Supabase for user progress indicators
const checkSupabaseUserProgress = async (userId: string) => {
  try {
    console.log('🔍 Checking Supabase for user progress:', userId);
    
    // Check for maturity scores
    // ✅ Migrado a endpoint NestJS (GET /telar/server/user-maturity-scores/user/{user_id})
    const maturityData = await getLatestMaturityScore(userId);

    // Check for user agents
    const { data: agentsData } = await supabase
      .from('user_agents')
      .select('agent_id, is_enabled')
      .eq('user_id', userId)
      .eq('is_enabled', true);

    // Check for any tasks (indicates system usage)
    const { data: tasksData } = await supabase
      .from('agent_tasks')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    console.log('📊 Supabase progress check results:', {
      hasMaturityScores: !!maturityData,
      agentsCount: agentsData?.length || 0,
      hasTasks: !!tasksData
    });

    const hasProgress = !!maturityData || (agentsData && agentsData.length > 0) || !!tasksData;
    
    return {
      hasProgress,
      maturityScores: maturityData ? {
        ideaValidation: maturityData.ideaValidation,
        userExperience: maturityData.userExperience,
        marketFit: maturityData.marketFit,
        monetization: maturityData.monetization
      } : null,
      agents: agentsData || [],
      hasTasks: !!tasksData
    };
  } catch (error) {
    console.error('💥 Error checking Supabase user progress:', error);
    return { hasProgress: false };
  }
};

// Synchronous version for backward compatibility
// NOTE: This function requires userId parameter for user-namespaced localStorage
export const getUserProgressStatusSync = (userId?: string) => {
  try {
    if (!userId) {
      console.warn('⚠️ No userId provided to getUserProgressStatusSync');
      return { hasProgress: false, shouldGoToDashboard: false, reason: 'no_user_id' };
    }

    const userLocalStorage = createUserLocalStorage(userId);
    const onboardingCompleted = userLocalStorage.getItem('onboardingCompleted');
    const maturityScores = userLocalStorage.getItem('maturityScores');
    const recommendedAgents = userLocalStorage.getItem('recommendedAgents');
    
    // ✅ CHECK: Verificar progreso parcial del test de madurez (user-namespaced)
    let fusedProgress = userLocalStorage.getItem('fused_maturity_calculator_progress');
    
    // 🔄 MIGRATION: Si no hay namespaced, buscar en global localStorage
    if (!fusedProgress) {
      const fusedGlobal = window.localStorage.getItem('fused_maturity_calculator_progress');
      if (fusedGlobal) {
        try {
          const raw = JSON.parse(fusedGlobal);
          if (raw?.answeredQuestionIds?.length > 0) {
            console.log('🔄 [MIGRATION SYNC] Found global fused progress, migrating:', raw.answeredQuestionIds.length);
            userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify({ 
              ...raw, 
              lastUpdated: new Date().toISOString() 
            }));
            window.localStorage.removeItem('fused_maturity_calculator_progress');
            console.log('✅ [MIGRATION SYNC] Migration completed');
            return { 
              hasProgress: true, 
              shouldGoToDashboard: true,
              reason: 'migrated_global_progress',
              partialProgress: raw.answeredQuestionIds.length
            };
          }
        } catch (e) {
          console.warn('⚠️ [MIGRATION SYNC] Error parsing global fused progress:', e);
        }
      }
    }
    
    // 🔄 LEGACY MIGRATION: Si no hay fused_..., buscar maturityCalculatorProgress
    if (!fusedProgress) {
      const legacyNamespaced = userLocalStorage.getItem('maturityCalculatorProgress');
      const legacyGlobal = window.localStorage.getItem('maturityCalculatorProgress');
      const legacyRaw = legacyNamespaced || legacyGlobal;
      
      if (legacyRaw) {
        try {
          const legacy = JSON.parse(legacyRaw);
          const ids = legacy.answers ? Object.keys(legacy.answers) : [];
          
          if (ids.length > 0) {
            const migrated = {
              currentBlockIndex: 0,
              answeredQuestionIds: ids,
              profileData: legacy.profileData || {},
              showCheckpoint: false,
              isCompleted: false,
              businessType: legacy.businessType || 'creative',
              lastUpdated: new Date(legacy.timestamp || Date.now()).toISOString()
            };
            
            userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(migrated));
            fusedProgress = JSON.stringify(migrated); // Actualizar para procesamiento posterior
            
            if (!legacyNamespaced) {
              window.localStorage.removeItem('maturityCalculatorProgress');
            }
            
            console.log('[MIGRATION SYNC] Legacy maturityCalculatorProgress → fused:', ids.length);
          }
        } catch (e) {
          console.warn('[MIGRATION SYNC] Error parsing legacy maturityCalculatorProgress:', e);
        }
      }
    }
    
    // 🔄 EXTRA LEGACY MIGRATION: fusedMaturityProgress (otra variante legacy)
    if (!fusedProgress) {
      const legacyFusedNamespaced = userLocalStorage.getItem('fusedMaturityProgress');
      const legacyFusedGlobal = window.localStorage.getItem('fusedMaturityProgress');
      const legacyFusedRaw = legacyFusedNamespaced || legacyFusedGlobal;
      
      if (legacyFusedRaw) {
        try {
          const legacyFused = JSON.parse(legacyFusedRaw);
          const ids = legacyFused.answeredQuestions 
            ? (Array.isArray(legacyFused.answeredQuestions) 
                ? legacyFused.answeredQuestions 
                : Object.keys(legacyFused.answeredQuestions))
            : [];
          
          if (ids.length > 0) {
            const migrated = {
              currentBlockIndex: 0,
              answeredQuestionIds: ids,
              profileData: legacyFused.profileData || {},
              showCheckpoint: false,
              isCompleted: false,
              businessType: 'creative',
              lastUpdated: new Date(legacyFused.lastSaved || Date.now()).toISOString()
            };
            
            userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(migrated));
            fusedProgress = JSON.stringify(migrated);
            
            if (!legacyFusedNamespaced) {
              window.localStorage.removeItem('fusedMaturityProgress');
            }
            
            console.log('[MIGRATION SYNC] Legacy fusedMaturityProgress → fused:', ids.length);
          }
        } catch (e) {
          console.warn('[MIGRATION SYNC] Error parsing legacy fusedMaturityProgress:', e);
        }
      }
    }
    
    // Procesar progreso user-namespaced si existe
    if (fusedProgress) {
      try {
        const progress = JSON.parse(fusedProgress);
        if (progress.answeredQuestionIds && progress.answeredQuestionIds.length > 0) {
          console.log('✅ Found partial maturity test progress:', progress.answeredQuestionIds.length, 'questions answered');
          return { 
            hasProgress: true, 
            shouldGoToDashboard: true,
            reason: 'has_partial_test_progress',
            partialProgress: progress.answeredQuestionIds.length
          };
        }
      } catch (e) {
        console.warn('⚠️ Error parsing fused progress:', e);
      }
    }
    
    console.log('🔍 Sync progress check:', { onboardingCompleted, hasMaturityScores: !!maturityScores });
    
    if (onboardingCompleted === 'true') {
      return { hasProgress: true, shouldGoToDashboard: true, reason: 'onboarding_completed' };
    }
    
    if (maturityScores) {
      try {
        const scores = JSON.parse(maturityScores);
        if (scores && typeof scores === 'object' && Object.keys(scores).length > 0) {
          userLocalStorage.setItem('onboardingCompleted', 'true');
          return { hasProgress: true, shouldGoToDashboard: true, reason: 'has_maturity_scores' };
        }
      } catch (e) {
        console.warn('Error parsing maturity scores:', e);
      }
    }
    
    return { hasProgress: false, shouldGoToDashboard: false, reason: 'new_user' };
  } catch (error) {
    console.error('Error in sync progress check:', error);
    return { hasProgress: false, shouldGoToDashboard: false, reason: 'error' };
  }
};