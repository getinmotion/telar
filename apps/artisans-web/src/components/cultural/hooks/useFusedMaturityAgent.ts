/**
 * 🔒 MÓDULO ESTABLE - NO MODIFICAR SIN AUTORIZACIÓN EXPLÍCITA
 * Este archivo es parte del Growth Agent y está certificado como estable.
 * Cualquier cambio debe ser solicitado explícitamente por el usuario.
 * Ver: docs/GROWTH_MODULE_LOCKED.md
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ConversationBlock, MaturityLevel, PersonalizedTask } from '../conversational/types/conversationalTypes';
import { UserProfileData } from '../types/wizardTypes';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { useMaturityScoresSaver } from '@/hooks/useMaturityScoresSaver';
import { useUnifiedUserData } from '@/hooks/user';
import { createUserAgentsFromRecommendations, markOnboardingComplete } from '@/utils/onboardingUtils';
import { generateMaturityBasedRecommendations } from '@/utils/maturityRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getFusedConversationBlocks, ONBOARDING_BLOCKS } from '../data/fusedConversationBlocks';
import { EventBus } from '@/utils/eventBus';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { MATURITY_TEST_CONFIG, isAssessmentComplete } from '@/config/maturityTest';
import { hasUserProfile, createUserProfile, updateUserProfile } from '@/services/userProfiles.actions';
import { upsertUserMasterContext } from '@/services/userMasterContext.actions';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { getLatestMaturityScore } from '@/services/userMaturityScores.actions';
import { getAgentTasksByUserId } from '@/services/agentTasks.actions';
import { getMasterCoordinatorContextByUserId, createMasterCoordinatorContext, upsertMasterCoordinatorContext } from '@/services/masterCoordinatorContext.actions';

/**
 * 💾 Guarda progreso a BD con retry automático
 * Usado para garantizar que el progreso NUNCA se pierda
 */
const saveProgressToDBWithRetry = async (
  userId: string,
  progressData: any,
  maxRetries = 3
): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // ✅ Migrado a endpoint NestJS (UPSERT)
      await upsertUserMasterContext(userId, {
        taskGenerationContext: {
          maturity_test_progress: progressData
        }
      });

      return true;
    } catch (error) {
      console.error(`[SAVE-DB] Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        console.error('[SAVE-DB] All retries failed');
        return false;
      }

      // Esperar antes de reintentar (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return false;
};

export const useFusedMaturityAgent = (
  language: 'en' | 'es',
  onComplete: (scores: CategoryScore, recommendedAgents: RecommendedAgents, profileData: UserProfileData) => void
) => {
  const { user } = useAuth();
  const { saveMaturityScores } = useMaturityScoresSaver();
  const { context, updateContext, updateProfile } = useUnifiedUserData();
  const userLocalStorage = useUserLocalStorage();
  const { trackEvent } = useAnalyticsTracking();

  // 🎯 Cargar bloques desde fusedConversationBlocks
  const allBlocks = useMemo(() => getFusedConversationBlocks(language), [language]);

  // 🔄 Detectar modo desde URL: onboarding (solo 3 preguntas) o full (36 preguntas)
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const mode = searchParams.get('mode'); // 'onboarding' | 'continue' | null
  const isOnboardingMode = mode === 'onboarding';
  const isReviewMode = mode === 'review';

  // 🎯 Si es modo onboarding, usar bloque especial con las 3 preguntas MÁS IMPORTANTES
  const visibleBlocks = useMemo(() => {
    if (isOnboardingMode) {
      const onboardingBlock = ONBOARDING_BLOCKS[language];
      return [onboardingBlock];
    }
    return allBlocks;
  }, [allBlocks, isOnboardingMode, language]);

  // 🎯 Bloques a usar en el wizard
  const blocks = useMemo(() => visibleBlocks, [visibleBlocks]);

  // 🔄 Estados para carga híbrida BD + localStorage
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [profileData, setProfileData] = useState<UserProfileData>({} as UserProfileData);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [businessType, setBusinessType] = useState<'creative' | 'service' | 'product' | 'tech' | 'other'>('creative');
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [lastCheckpointAt, setLastCheckpointAt] = useState(0);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());

  const lastInitUserIdRef = useRef<string | null>(null);


  // 🧹 Función de limpieza y validación de IDs
  const validateAndCleanQuestionIds = useCallback((
    answeredIds: string[],
    allBlocks: ConversationBlock[]
  ): { validIds: string[], invalidIds: string[], needsReset: boolean } => {
    const validQuestionIds = new Set<string>();

    allBlocks.forEach(block => {
      block.questions.forEach(q => {
        validQuestionIds.add(q.id);
      });
    });

    const validIds: string[] = [];
    const invalidIds: string[] = [];

    answeredIds.forEach(id => {
      if (validQuestionIds.has(id)) {
        validIds.push(id);
      } else {
        invalidIds.push(id);
      }
    });

    const needsReset = invalidIds.length > 0;

    if (needsReset) {
      console.warn('[CLEAN] Found invalid question IDs:', invalidIds);
    }

    return { validIds, invalidIds, needsReset };
  }, []);

  // 🔄 Cargar progreso híbrido: BD (fuente de verdad) → localStorage (fallback)
  useEffect(() => {
    const loadHybridProgress = async () => {
      const currentUserId = user?.id || 'anonymous';

      // Solo ejecutar si no hemos inicializado para este userId específico
      if (lastInitUserIdRef.current === currentUserId) {
        return;
      }

      lastInitUserIdRef.current = currentUserId;
      setIsLoadingProgress(true);

      try {
        // 📦 Paso 1: Cargar desde user-namespaced localStorage (rápido, mientras cargamos BD)
        let localProgress = userLocalStorage.getItem('fused_maturity_calculator_progress');
        let localData = null;

        // 🔄 MIGRATION: Si no hay namespaced, buscar en global localStorage
        if (!localProgress) {
          const fusedGlobal = window.localStorage.getItem('fused_maturity_calculator_progress');
          if (fusedGlobal) {
            try {
              const parsed = JSON.parse(fusedGlobal);
              if (parsed?.answeredQuestionIds?.length > 0) {
                localData = parsed;
                // Migrar inmediatamente a user-namespaced
                userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify({
                  ...parsed,
                  lastUpdated: new Date().toISOString()
                }));
                window.localStorage.removeItem('fused_maturity_calculator_progress');
              }
            } catch (e) {
              console.error('[MIGRATION] Error parsing global fused progress:', e);
            }
          }
        }

        // 🔄 LEGACY MIGRATION: Si no hay fused_..., buscar maturityCalculatorProgress
        if (!localProgress && !localData) {
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

                localData = migrated;
                userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(migrated));

                // Eliminar clave legacy global si existe
                if (!legacyNamespaced) {
                  window.localStorage.removeItem('maturityCalculatorProgress');
                }

              }
            } catch (e) {
              console.warn('[MIGRATION] Error migrating legacy maturityCalculatorProgress:', e);
            }
          }
        }

        if (localProgress && !localData) {
          try {
            localData = JSON.parse(localProgress);
          } catch (e) {
            console.error('❌ [LOCAL] Error parsing localStorage:', e);
            // ⚠️ NO borrar automáticamente - podría ser temporal
            console.warn('⚠️ [SAFE] Corrupted progress detected but NOT deleting - user may recover');
          }
        }

        // 🎓 VALIDACIÓN MODO ONBOARDING: Resetear progreso corrupto
        if (localData && isOnboardingMode) {

          // IDs válidos del bloque de onboarding (solo 3 preguntas)
          const onboardingQuestionIds = new Set([
            'business_description',
            'sales_status',
            'target_customer'
          ]);

          // Verificar si hay IDs del test completo (no-onboarding)
          const hasFullTestIds = localData.answeredQuestionIds?.some(
            (id: string) => !onboardingQuestionIds.has(id)
          );

          if (hasFullTestIds) {
            console.warn('⚠️ [ONBOARDING] Progreso guardado contiene IDs del test completo. RESETEANDO para modo onboarding...');

            // Resetear solo los IDs que no son del onboarding
            localData.answeredQuestionIds = localData.answeredQuestionIds.filter(
              (id: string) => onboardingQuestionIds.has(id)
            );
            localData.currentBlockIndex = 0;
            localData.showCheckpoint = false;

            // Limpiar profileData de campos que no son de las 3 primeras preguntas
            const onboardingFields = ['businessDescription', 'salesStatus', 'targetCustomer', 'craftType', 'location'];
            const cleanedProfileData: any = {};
            onboardingFields.forEach(field => {
              if (localData.profileData?.[field]) {
                cleanedProfileData[field] = localData.profileData[field];
              }
            });
            localData.profileData = cleanedProfileData;

            // Actualizar localStorage con progreso limpio
            userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify({
              ...localData,
              lastUpdated: new Date().toISOString()
            }));
          }
        }

        // 🗄️ Paso 2: Si hay usuario, cargar desde BD usando context unificado (fuente de verdad)
        let dbProgress = null;
        if (user && context) {
          const taskGenContext = context.taskGenerationContext as any;
          dbProgress = taskGenContext?.maturity_test_progress;
        }

        // 🎯 Paso 3: Decidir qué progreso usar (comparar timestamps - usar el más reciente)
        let progressToUse = null;
        let source = 'none';

        const dbTimestamp = dbProgress?.last_updated ? new Date(dbProgress.last_updated).getTime() : 0;
        const localTimestamp = localData?.lastUpdated ? new Date(localData.lastUpdated).getTime() : 0;

        if (dbProgress && localData) {
          // Ambos existen - usar el más reciente
          if (dbTimestamp > localTimestamp) {
            progressToUse = {
              currentBlockIndex: dbProgress.current_block || 0,
              answeredQuestionIds: dbProgress.answered_question_ids || [],
              profileData: context.businessProfile || {},
              showCheckpoint: false,
              isCompleted: false,
              businessType: 'creative'
            };
            source = 'database (newer)';
          } else {
            progressToUse = localData;
            source = 'localStorage (newer)';
          }

          // Sincronizar al localStorage
          try {
            userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify({
              ...progressToUse,
              lastUpdated: new Date().toISOString()
            }));
          } catch (e) {
            console.error('❌ [SYNC] Error syncing to localStorage:', e);
          }
        } else if (dbProgress && dbProgress.total_answered > 0) {
          // Solo DB
          progressToUse = {
            currentBlockIndex: dbProgress.current_block || 0,
            answeredQuestionIds: dbProgress.answered_question_ids || [],
            profileData: context.businessProfile || {},
            showCheckpoint: false,
            isCompleted: false,
            businessType: 'creative'
          };
          source = 'database (only)';

          // Sincronizar BD → localStorage
          try {
            userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify({
              ...progressToUse,
              lastUpdated: new Date().toISOString()
            }));
          } catch (e) {
            console.error('[SYNC] Error syncing to localStorage:', e);
          }
        } else if (localData) {
          // Solo localStorage
          progressToUse = localData;
          source = 'localStorage (only)';
        }

        // 📊 Paso 4: VALIDAR Y LIMPIAR IDs ANTES de calcular bloque
        // 🧹 Limpiar y validar IDs si venimos de BD
        if (progressToUse && source === 'db' && progressToUse.answered_question_ids) {
          const { validIds, invalidIds, needsReset } = validateAndCleanQuestionIds(
            progressToUse.answered_question_ids,
            blocks
          );

          if (needsReset) {
            progressToUse.answered_question_ids = validIds;
            progressToUse.total_answered = validIds.length;

            // Actualizar BD con IDs limpios
            if (user) {
              try {
                await updateContext({
                  taskGenerationContext: {
                    ...context?.taskGenerationContext,
                    maturity_test_progress: progressToUse
                  }
                });
              } catch (e) {
                console.error('❌ [MIGRATION] Error cleaning database:', e);
              }
            }

            toast.info(
              language === 'es'
                ? 'Hemos optimizado el test a 12 preguntas más relevantes.'
                : 'We\'ve optimized the test to 12 more relevant questions.'
            );
          }
        }

        if (progressToUse) {
          // 🔧 Función de validación: filtrar IDs que no existen en la estructura actual
          const validateAndCleanQuestionIds = (
            savedIds: string[],
            blocks: ConversationBlock[]
          ): { validIds: string[]; removedIds: string[]; needsMigration: boolean } => {
            const allValidIds = blocks.flatMap(b => b.questions.map(q => q.id));
            const validIds = savedIds.filter(id => allValidIds.includes(id));
            const removedIds = savedIds.filter(id => !allValidIds.includes(id));

            return {
              validIds,
              removedIds,
              needsMigration: removedIds.length > 0
            };
          };

          // 🔍 Validar y limpiar IDs guardados
          const { validIds, removedIds, needsMigration } = validateAndCleanQuestionIds(
            progressToUse.answeredQuestionIds || [],
            blocks
          );

          if (needsMigration) {
            console.warn('🔧 [MIGRATION] Found invalid question IDs:', removedIds);

            // Actualizar progreso con IDs limpios
            progressToUse.answeredQuestionIds = validIds;

            // 💾 Sincronizar con BD si el usuario está autenticado
            if (user && context) {
              const syncMigration = async () => {
                try {
                  // ✅ Migrado a endpoint NestJS (UPDATE)
                  await upsertUserMasterContext(user.id, {
                    taskGenerationContext: {
                      ...context.taskGenerationContext,
                      maturity_test_progress: {
                        current_block: 0, // Será recalculado
                        total_answered: validIds.length,
                        answered_question_ids: validIds,
                        last_updated: new Date().toISOString()
                      }
                    }
                  });
                } catch (error) {
                  console.error('[useFusedMaturityAgent] Failed to sync to DB:', error);
                }
              };

              // No bloquear - ejecutar en background
              syncMigration();
            }

            // Sincronizar con localStorage
            try {
              userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify({
                ...progressToUse,
                answeredQuestionIds: validIds,
                lastUpdated: new Date().toISOString()
              }));
            } catch (e) {
              console.error('❌ [MIGRATION] Failed to sync to localStorage:', e);
            }
          }

          const answeredSet = new Set<string>(validIds);

          // 🔄 Sincronizar answeredQuestionIds con profileData real
          // Si hay valores en profileData que no están en answeredSet, agregarlos
          const profileToRestore = progressToUse.profileData || {};
          blocks.forEach(block => {
            block.questions.forEach(q => {
              const fieldName = q.fieldName || q.id;
              const value = profileToRestore[fieldName];

              // Si hay un valor válido en profileData pero no está en el Set, agregarlo

            });
          });



          let calculatedBlockIndex = 0;

          // 🔧 FIXED: Calcular en qué bloque debemos estar basado en respuestas CON VALIDACIÓN ROBUSTA
          for (let i = 0; i < blocks.length; i++) {
            const blockQuestions = blocks[i].questions;
            const allAnsweredInBlock = blockQuestions.every(q => answeredSet.has(q.id));

            if (allAnsweredInBlock) {
              // 🛡️ PROTECCIÓN: Asegurarse de que el índice nunca exceda el límite
              const nextBlock = i + 1;
              if (nextBlock >= blocks.length) {
                calculatedBlockIndex = blocks.length - 1;
                break;
              } else {
                calculatedBlockIndex = nextBlock;
              }
            } else {
              calculatedBlockIndex = i; // Este es el bloque actual
              break;
            }
          }

          // 🛡️ VALIDACIÓN FINAL: Asegurar que el índice SIEMPRE sea válido
          if (calculatedBlockIndex < 0 || calculatedBlockIndex >= blocks.length) {
            console.error(`❌ [BLOCK-CALC] INVALID INDEX DETECTED: ${calculatedBlockIndex}, resetting to 0`);
            calculatedBlockIndex = 0;
          }



          // ✅ Aplicar TODO de golpe de forma ATÓMICA
          // IMPORTANT: If no answers, ALWAYS start at block 0 (question 1)
          const finalBlockIndex = answeredSet.size === 0 ? 0 : calculatedBlockIndex;
          setCurrentBlockIndex(finalBlockIndex);
          setProfileData(progressToUse.profileData || {});
          setAnsweredQuestionIds(answeredSet);
          setBusinessType(progressToUse.businessType || 'creative');
          setShowCheckpoint(false); // Nunca restaurar checkpoint
          setIsCompleted(false);


        }

      } catch (error) {
        console.error('❌ [INIT] Error during hybrid loading:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadHybridProgress();
  }, [user?.id, blocks.length]);

  // 🔍 Filtrar preguntas ya respondidas en modo continue
  const currentBlock = useMemo(() => {
    // ✅ FIX: Validación robusta del bloque con auto-recovery
    if (currentBlockIndex < 0 || currentBlockIndex >= blocks.length) {
      console.error('🚨 [BLOCK-VALIDATION] Invalid block index:', currentBlockIndex, 'of', blocks.length);
      console.error('🚨 [BLOCK-VALIDATION] State snapshot:', {
        currentBlockIndex,
        blocksLength: blocks.length,
        answeredCount: answeredQuestionIds.size,
        answeredIds: Array.from(answeredQuestionIds).slice(0, 15)
      });

      // 🛡️ AUTO-RECOVERY: Intentar recuperar calculando el bloque correcto
      let recoveredIndex = 0;
      for (let i = 0; i < blocks.length; i++) {
        const allAnswered = blocks[i].questions.every(q => answeredQuestionIds.has(q.id));
        if (allAnswered && i + 1 < blocks.length) {
          recoveredIndex = i + 1;
        } else if (!allAnswered) {
          recoveredIndex = i;
          break;
        }
      }

      // Corregir el índice en el próximo render
      setTimeout(() => {
        setCurrentBlockIndex(recoveredIndex);
      }, 0);

      // Devolver el bloque recuperado temporalmente
      const recoveredBlock = blocks[recoveredIndex];
      if (!recoveredBlock) return null;

      const unansweredQuestions = recoveredBlock.questions.filter(
        q => !answeredQuestionIds.has(q.id)
      );

      return {
        ...recoveredBlock,
        questions: unansweredQuestions.length > 0 ? unansweredQuestions : recoveredBlock.questions
      };
    }

    const block = blocks[currentBlockIndex];
    if (!block || !block.questions || block.questions.length === 0) {
      console.error('🚨 [BLOCK-VALIDATION] Invalid block structure:', {
        blockIndex: currentBlockIndex,
        hasBlock: !!block,
        hasQuestions: !!block?.questions,
        questionCount: block?.questions?.length
      });
      return null;
    }

    // Filtrar solo preguntas NO respondidas
    const unansweredQuestions = block.questions.filter(
      q => !answeredQuestionIds.has(q.id)
    );

    // Si todas las preguntas del bloque ya fueron respondidas, buscar siguiente bloque con preguntas sin responder
    if (unansweredQuestions.length === 0 && !isOnboardingMode) {
      for (let i = currentBlockIndex + 1; i < blocks.length; i++) {
        const hasUnanswered = blocks[i].questions.some(q => !answeredQuestionIds.has(q.id));
        if (hasUnanswered) {
          // Avanzar al siguiente bloque con preguntas sin responder
          setTimeout(() => setCurrentBlockIndex(i), 0);
          return {
            ...blocks[i],
            questions: blocks[i].questions.filter(q => !answeredQuestionIds.has(q.id))
          };
        }
      }
    }

    // Retornar bloque con preguntas filtradas (o todas si no hay filtrado necesario)
    return {
      ...block,
      questions: unansweredQuestions.length > 0 ? unansweredQuestions : block.questions
    };
  }, [blocks, currentBlockIndex, answeredQuestionIds, isOnboardingMode]);

  // 🔄 CRÍTICO: Sincronización ROBUSTA de answeredQuestionIds con profileData
  // Helper function para normalizar nombres de campos
  const normalizeFieldName = useCallback((name: string) => {
    return {
      snake: name.replace(/([A-Z])/g, '_$1').toLowerCase(),
      camel: name.replace(/_([a-z])/g, (g) => g[1].toUpperCase()),
      original: name
    };
  }, []);

  useEffect(() => {
    if (showCheckpoint && profileData && Object.keys(profileData).length > 0) {
      const normalizedProfileData = { ...profileData };
      let syncCount = 0;

      blocks.forEach(block => {
        block.questions.forEach(q => {
          const fieldName = q.fieldName || q.id;
          const { snake, camel, original } = normalizeFieldName(fieldName);

          // Buscar valor en CUALQUIERA de las variaciones
          const value = profileData[snake] || profileData[camel] || profileData[original] ||
            profileData[q.id];

          // Si encontramos un valor, asegurar que existe en TODAS las variaciones
          if (value !== undefined && value !== null && value !== '') {
            // Normalizar el valor en profileData para todas las variaciones
            normalizedProfileData[snake] = value;
            normalizedProfileData[camel] = value;
            normalizedProfileData[original] = value;

            // Agregar a answeredQuestionIds si no existe
            if (!answeredQuestionIds.has(q.id)) {
              answeredQuestionIds.add(q.id);
              syncCount++;
            }
          }
        });
      });

      if (syncCount > 0) {
        // Update both states
        setProfileData(normalizedProfileData);
        setAnsweredQuestionIds(new Set(answeredQuestionIds));
      }
    }
  }, [showCheckpoint, profileData, blocks, answeredQuestionIds, normalizeFieldName]);

  // 🚪 Guardar progreso al cerrar ventana/pestaña
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {

      // Forzar guardado síncrono en localStorage
      try {
        const progressData = {
          currentBlockIndex,
          profileData,
          businessType,
          showCheckpoint: false, // No restaurar checkpoint
          answeredQuestionIds: Array.from(answeredQuestionIds),
          isCompleted,
          lastUpdated: new Date().toISOString()
        };

        userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(progressData));
      } catch (error) {
        console.error('❌ [UNLOAD] Emergency save failed:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentBlockIndex, profileData, businessType, answeredQuestionIds, isCompleted, userLocalStorage]);

  // 📊 Calculate total questions dynamically based on profileData and showIf conditions
  const calculateTotalQuestions = useCallback(() => {
    // ✅ FIX: Return correct total based on mode
    if (isOnboardingMode) {
      return MATURITY_TEST_CONFIG.ONBOARDING_QUESTIONS; // 3
    }

    // Full test: count all visible questions (should be 30)
    let total = 0;
    blocks.forEach(block => {
      block.questions.forEach(question => {
        // If the question has no condition, always count it
        if (!question.showIf) {
          total++;
        } else {
          // If has condition, check if it's met
          const { field, operator, value } = question.showIf;
          const fieldValue = profileData[field];

          let conditionMet = false;
          if (operator === 'equals') conditionMet = fieldValue === value;
          else if (operator === 'includes') conditionMet = Array.isArray(fieldValue) && fieldValue.includes(value);

          if (conditionMet) total++;
        }
      });
    });


    return total;
  }, [blocks, profileData, isOnboardingMode]);

  const totalQuestions = useMemo(() => calculateTotalQuestions(), [calculateTotalQuestions]);

  // Checkpoint logic - every 5 answers
  const totalAnswered = answeredQuestionIds.size;

  const checkpointInfo = useMemo(() => {
    // ✅ ONBOARDING: NO mostrar checkpoint, solo trackear progreso
    if (isOnboardingMode && totalAnswered === MATURITY_TEST_CONFIG.ONBOARDING_QUESTIONS) {
      return {
        isAtCheckpoint: false, // ✅ CAMBIO CRÍTICO: false en lugar de true
        checkpointNumber: 0,   // ✅ CAMBIO: 0 para evitar mostrar checkpoint UI
        totalAnswered,
        questionsUntilNext: 0
      };
    }

    // ✅ Caso normal: cada 5 preguntas (pero NO en modo onboarding)
    const isAtCheckpoint = totalAnswered > 0 &&
      totalAnswered % MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY === 0 &&
      !isOnboardingMode; // ✅ NUEVO: No checkpoints en modo onboarding
    const checkpointNumber = Math.ceil(totalAnswered / MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY);

    return {
      isAtCheckpoint,
      checkpointNumber,
      totalAnswered,
      questionsUntilNext: isAtCheckpoint
        ? MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY
        : MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY - (totalAnswered % MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY)
    };
  }, [totalAnswered, isOnboardingMode]);

  // ✅ Save to localStorage using ref (no dependencies to avoid circular re-renders)
  const saveProgressToLocalStorageRef = useRef<() => void>();

  saveProgressToLocalStorageRef.current = () => {
    if (isCompleted) return;

    const progressData = {
      currentBlockIndex,
      profileData,
      businessType,
      showCheckpoint,
      answeredQuestionIds: Array.from(answeredQuestionIds),
      isCompleted: false,
      lastUpdated: new Date().toISOString()
    };

    try {
      userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(progressData));

    } catch (error) {
      console.error('❌ [SAVE] Failed:', error);
    }
  };

  // ✅ INSTANT checkpoint detection con debounce para evitar mostrar durante transiciones
  useEffect(() => {

    // Skip if no answers
    if (answeredQuestionIds.size === 0 || showCheckpoint || isCompleted) {
      return;
    }

    // Usar setTimeout para evitar mostrar checkpoint durante transiciones
    const timer = setTimeout(() => {
      let shouldShowCheckpoint = false;

      // ✅ CASO ÚNICO: Test completo - checkpoint cada 5 preguntas (NUNCA en onboarding)
      if (!isOnboardingMode &&
        answeredQuestionIds.size % MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY === 0 &&
        answeredQuestionIds.size < totalQuestions &&
        answeredQuestionIds.size !== lastCheckpointAt &&
        answeredQuestionIds.size > 0) {

        shouldShowCheckpoint = true;
      }

      if (shouldShowCheckpoint) {

        setShowCheckpoint(true);
        setLastCheckpointAt(answeredQuestionIds.size);
        saveProgressToLocalStorageRef.current?.();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [answeredQuestionIds.size, isCompleted, showCheckpoint, lastCheckpointAt, totalQuestions]);

  // ✅ Auto-complete when all questions answered (uses ref to avoid circular dependencies)
  const completeAssessmentRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // ✅ ONBOARDING: Auto-completar DIRECTAMENTE sin mostrar checkpoint
    if (isOnboardingMode && answeredQuestionIds.size === 3 && !isCompleted && !isProcessing) {

      // ❌ NO mostrar checkpoint
      setShowCheckpoint(false);

      // ✅ Completar inmediatamente con delay mínimo
      const timer = setTimeout(() => {
        if (!isCompleted && !isProcessing) {
          setIsProcessing(true);
          completeAssessmentRef.current?.().finally(() => {
            setIsProcessing(false);
          });
        }
      }, 100); // Delay mínimo para evitar race conditions

      return () => clearTimeout(timer);
    }

    // ✅ FULL ASSESSMENT MODE: Complete ONLY if we have answered ALL REQUIRED questions
    const hasAllQuestions = isAssessmentComplete(answeredQuestionIds.size);
    const shouldAutoComplete = !isOnboardingMode && hasAllQuestions && !isCompleted && !isProcessing;

    if (shouldAutoComplete && completeAssessmentRef.current) {


      const timer = setTimeout(() => {
        if (!isCompleted && !isProcessing) {
          completeAssessmentRef.current?.();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [answeredQuestionIds.size, isCompleted, isProcessing, currentBlockIndex, blocks.length, isOnboardingMode]);

  // 🔄 Actualizar progreso y tareas incrementalmente en cada checkpoint
  const updateProgressAndTasksIncremental = useCallback(async () => {
    if (!user) return;


    try {
      // 1. ✅ Migrado a NestJS - GET /telar/server/agent-tasks/user/{user_id}
      const userTasks = await getAgentTasksByUserId(user.id);

      // 2. Obtener maturity scores del usuario
      // ✅ Migrado a endpoint NestJS (GET /telar/server/user-maturity-scores/user/{user_id})
      const maturityData = await getLatestMaturityScore(user.id);

      // 3. Construir contexto para cálculo
      const masterContext = {
        tasks: userTasks || [],
        maturity: maturityData ? {
          ideaValidation: maturityData.ideaValidation || 0,
          userExperience: maturityData.userExperience || 0,
          marketFit: maturityData.marketFit || 0,
          monetization: maturityData.monetization || 0
        } : {
          ideaValidation: 0,
          userExperience: 0,
          marketFit: 0,
          monetization: 0
        }
      } as any;

      // 4. Calcular progreso basado en contexto actual
      const { calculateCaminoArtesanalProgress } = await import('@/utils/caminoArtesanalProgress');
      const newProgress = calculateCaminoArtesanalProgress(masterContext);



      // 5. Generar tareas incrementales si el progreso lo justifica
      const shouldGenerateTasks = newProgress >= 25 && (userTasks?.length || 0) === 0;

      if (shouldGenerateTasks && profileData.craftType) {

        const { data: tasksData, error: tasksError } = await supabase.functions.invoke('generate-artisan-tasks', {
          body: {
            userId: user.id,
            profileData: {
              name: profileData.brandName || 'Artisan',
              productType: profileData.craftType || '',
              hasSold: profileData.hasSold ? 'yes' : 'no',
              timeInvested: profileData.timeAvailability || '',
              knowsCosts: profileData.financialControl === 'detailed' ? 'yes' : 'no',
              dreamGoal: profileData.growthGoal || '',
              industry: profileData.craftType || '',
              experience: profileData.experience || 'beginner'
            },
            language: language,
            incremental: true
          }
        });

        if (!tasksError && tasksData) {
          toast.success(
            language === 'es'
              ? '✨ Se generaron nuevas tareas para tu camino'
              : '✨ New tasks generated for your journey'
          );
        }
      }

      // 6. Emitir evento para actualizar UI
      EventBus.publish('master.context.updated', {
        progress: newProgress,
        checkpoint: Math.floor(answeredQuestionIds.size / 3)
      });

    } catch (error) {
      console.error('❌ [CHECKPOINT-UPDATE] Error:', error);
    }
  }, [user, answeredQuestionIds.size, profileData, language]);

  const continueFromCheckpoint = useCallback(async () => {

    // 🔄 Actualizar progreso y tareas en cada checkpoint
    updateProgressAndTasksIncremental();

    // ✅ DETECCIÓN AUTOMÁTICA: Con 3 preguntas, completar onboarding (sin importar mode)
    const isOnboardingComplete = answeredQuestionIds.size === 3;


    if (isOnboardingComplete) {
      setShowCheckpoint(false);

      // Llamar a completeAssessment para finalizar el onboarding
      if (completeAssessmentRef.current) {
        setIsProcessing(true);
        completeAssessmentRef.current().finally(() => {
          setIsProcessing(false);
        });
      }
      return;
    }

    // Cerrar el checkpoint (comportamiento normal para evaluación completa)
    setShowCheckpoint(false);

    // 🎯 Publicar evento de bloque completado
    const completedBlockNumber = Math.floor(answeredQuestionIds.size / 5);
    if (completedBlockNumber > 0 && completedBlockNumber <= 6) {
      EventBus.publish('maturity.block.completed', {
        blockNumber: completedBlockNumber,
        totalAnswered: answeredQuestionIds.size
      });
    }

    // 🛤️ **CRÍTICO: Actualizar "Camino Artesanal" con progreso parcial**
    if (user) {
      try {

        // 1. Calcular scores parciales basados en las respuestas actuales
        const partialScores = {
          ideaValidation: calculateIdeaValidation(profileData),
          userExperience: calculateUserExperience(profileData),
          marketFit: calculateMarketFit(profileData),
          monetization: calculateMonetization(profileData)
        };

        // 2. ✅ Migrado a NestJS - GET /telar/server/agent-tasks/user/{user_id}
        let existingTasks = [];
        try {
          existingTasks = await getAgentTasksByUserId(user.id);
        } catch (tasksError) {
          console.error('❌ [CHECKPOINT-TASKS] Error fetching tasks:', tasksError);
        }

        // 3. Calcular progreso del camino artesanal
        const { calculateCaminoArtesanalProgress } = await import('@/utils/caminoArtesanalProgress');
        const caminoProgress = calculateCaminoArtesanalProgress({
          maturity: partialScores,
          tasks: existingTasks || []
        } as any);



        // 4. ✅ Migrado a NestJS - Guardar en master_coordinator_context
        try {
          const existingContext = await getMasterCoordinatorContextByUserId(user.id);
          const existingSnapshot = existingContext?.contextSnapshot || {};
          
          await upsertMasterCoordinatorContext(user.id, {
            contextSnapshot: {
              ...(typeof existingSnapshot === 'object' ? existingSnapshot : {}),
              camino_artesanal_progress: caminoProgress,
              last_checkpoint: checkpointInfo.checkpointNumber,
              checkpoint_updated_at: new Date().toISOString()
            } as any
          });
        } catch (error) {
          console.error('❌ [CHECKPOINT-CONTEXT] Error upserting context:', error);
        }

        // 5. ✅ Emitir evento para actualizar UI del dashboard
        EventBus.publish('master.context.updated', {
          progress: caminoProgress,
          source: 'checkpoint_continuation',
          checkpoint: checkpointInfo.checkpointNumber
        });


      } catch (error) {
        console.error('❌ [CHECKPOINT-CAMINO] Error updating Camino Artesanal:', error);
        // No bloquear el flujo si falla esto
      }
    }

    // 🧮 Calcular el bloque correcto basado en las preguntas respondidas
    let nextBlockIndex = currentBlockIndex;
    let questionsCount = 0;

    for (let i = 0; i < blocks.length; i++) {
      const blockQuestions = blocks[i].questions;
      const answeredInBlock = blockQuestions.filter(q => answeredQuestionIds.has(q.id)).length;

      questionsCount += blockQuestions.length;


      // Si todas las preguntas del bloque están respondidas, avanzar al siguiente
      if (answeredInBlock === blockQuestions.length) {
        nextBlockIndex = Math.min(i + 1, blocks.length - 1);
      } else if (answeredInBlock > 0) {
        // Si algunas preguntas están respondidas pero no todas, quedarse en este bloque
        nextBlockIndex = i;
        break;
      } else {
        // Si no hay preguntas respondidas en este bloque, este es el bloque actual
        nextBlockIndex = i;
        break;
      }
    }


    setCurrentBlockIndex(nextBlockIndex);

    // Guardar progreso
    try {
      const progressData = {
        currentBlockIndex: nextBlockIndex,
        profileData,
        businessType,
        showCheckpoint: false,
        answeredQuestionIds: Array.from(answeredQuestionIds),
        lastUpdated: new Date().toISOString()
      };
      userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(progressData));
    } catch (error) {
      console.error('❌ [CHECKPOINT] Failed to save progress:', error);
    }
  }, [currentBlockIndex, blocks, profileData, businessType, answeredQuestionIds, userLocalStorage, isOnboardingMode, completeAssessmentRef, setIsProcessing, user, checkpointInfo]);

  // Business type detection
  const detectBusinessType = useCallback((description: unknown, industry: unknown) => {
    const lowerDesc = typeof description === 'string' ? description.toLowerCase() : '';
    const lowerIndustry = typeof industry === 'string' ? industry.toLowerCase() : '';

    if (lowerIndustry.includes('creative') || lowerDesc.includes('arte') || lowerDesc.includes('diseño') ||
      lowerDesc.includes('art') || lowerDesc.includes('design') || lowerDesc.includes('craft') ||
      lowerDesc.includes('music') || lowerDesc.includes('photo')) {
      return 'creative';
    }
    if (lowerIndustry.includes('service') || lowerDesc.includes('consultor') || lowerDesc.includes('coaching')) {
      return 'service';
    }
    if (lowerIndustry.includes('tech') || lowerDesc.includes('software') || lowerDesc.includes('app')) {
      return 'tech';
    }
    if (lowerDesc.includes('product') || lowerDesc.includes('vend') || lowerDesc.includes('sell')) {
      return 'product';
    }
    return 'creative'; // Default to creative for most solo entrepreneurs
  }, []);

  const updateProfileData = useCallback((data: Partial<UserProfileData>) => {

    setProfileData(prev => {
      const updated = { ...prev, ...data };

      // Detect business type on industry or description change
      if (data.industry || data.businessDescription) {
        const detectedType = detectBusinessType(
          updated.businessDescription || '',
          updated.industry || ''
        );
        setBusinessType(detectedType);
      }

      return updated;
    });

    // Save to user profile if authenticated
    if (user && data) {
      saveToUserProfile(data);
    }
  }, [detectBusinessType, user]);

  const saveToUserProfile = useCallback(async (data: Partial<UserProfileData>) => {
    if (!user) return;

    try {
      // Map wizard data to user profile structure
      const profileUpdate = {
        business_description: data.businessDescription,
        brand_name: data.brandName || undefined,
        business_type: data.industry || data.businessType,
        target_market: data.targetAudience,
        current_stage: data.experience,
        business_goals: Array.isArray(data.businessGoals) ? data.businessGoals : [data.businessGoals].filter(Boolean),
        monthly_revenue_goal: data.urgencyLevel ? data.urgencyLevel * 1000 : null,
        time_availability: data.supportPreference,
        team_size: data.teamStructure,
        current_challenges: Array.isArray(data.mainObstacles) ? data.mainObstacles : [data.mainObstacles].filter(Boolean),
        sales_channels: Array.isArray(data.promotionChannels) ? data.promotionChannels : [data.promotionChannels].filter(Boolean),
        primary_skills: data.activities ? (Array.isArray(data.activities) ? data.activities : [data.activities]) : [],
        updated_at: new Date().toISOString()
      };

      // Filter out undefined values and convert to camelCase
      const cleanUpdate: any = {};
      if (profileUpdate.business_description) cleanUpdate.businessDescription = profileUpdate.business_description;
      if (profileUpdate.brand_name) cleanUpdate.brandName = profileUpdate.brand_name;
      if (profileUpdate.business_type) cleanUpdate.businessType = profileUpdate.business_type;
      if (profileUpdate.target_market) cleanUpdate.targetMarket = profileUpdate.target_market;
      if (profileUpdate.current_stage) cleanUpdate.currentStage = profileUpdate.current_stage;
      if (profileUpdate.business_goals) cleanUpdate.businessGoals = profileUpdate.business_goals;
      if (profileUpdate.monthly_revenue_goal) cleanUpdate.monthlyRevenueGoal = profileUpdate.monthly_revenue_goal;
      if (profileUpdate.time_availability) cleanUpdate.timeAvailability = profileUpdate.time_availability;
      if (profileUpdate.team_size) cleanUpdate.teamSize = profileUpdate.team_size;
      if (profileUpdate.current_challenges) cleanUpdate.currentChallenges = profileUpdate.current_challenges;
      if (profileUpdate.sales_channels) cleanUpdate.salesChannels = profileUpdate.sales_channels;
      if (profileUpdate.primary_skills) cleanUpdate.primarySkills = profileUpdate.primary_skills;

      // ✅ Migrado a endpoint NestJS (UPSERT: POST o PATCH según existencia)
      const profileExists = await hasUserProfile(user.id);
      if (profileExists) {
        await updateUserProfile(user.id, cleanUpdate);
      } else {
        await createUserProfile({ userId: user.id, ...cleanUpdate });
      }

    } catch (error) {
      console.error('Error saving to user profile:', error);
    }
  }, [user]);

  const answerQuestion = useCallback(async (questionId: string, answer: any) => {
    const question = currentBlock?.questions.find(q => q.id === questionId);
    
    // Track question answered
    trackEvent({
      eventType: 'question_answered',
      eventData: {
        questionId,
        blockId: currentBlock?.id,
        hasAnswer: !!answer,
        totalAnswered: answeredQuestionIds.size + 1
      }
    });

    if (question) {
      const fieldName = question.fieldName;

      // Actualizar profileData INMEDIATAMENTE
      const updatedProfileData = { ...profileData, [fieldName]: answer };

      updateProfileData({ [fieldName]: answer });

      // 🔥 AUTO-DETECT CRAFT TYPE when business description is answered (COMPLETAMENTE NO-BLOQUEANTE)
      // if (questionId === 'business_description' && answer && typeof answer === 'string') {

      //   // Set processing state
      //   setIsProcessing(true);

      //   // ✅ COMPLETAMENTE ASÍNCRONO - NO ESPERAR RESPUESTA
      //   setTimeout(() => {
      //     import('@/utils/aiCraftTypeDetection')
      //       .then(({ detectCraftTypeWithAI }) => {
      //         detectCraftTypeWithAI(answer, language as 'es' | 'en')
      //           .then(detectedCraftType => {
      //             updateProfileData({ craftType: detectedCraftType });
      //             toast.success(
      //               language === 'es'
      //                 ? `✨ Detecté que trabajas con ${detectedCraftType}`
      //                 : `✨ Detected your craft type: ${detectedCraftType}`
      //             );
      //           })
      //           .catch(error => {
      //             console.error('❌ [AUTO-DETECT] Error detecting craft type (silent failure):', error);
      //             // Silent failure - not critical for flow
      //           })
      //           .finally(() => {
      //             setIsProcessing(false);
      //           });
      //       });
      //   }, 500);
      // }

      // ✅ Track explicitly this question was answered
      const updatedAnsweredIds = new Set([...answeredQuestionIds, questionId]);
      setAnsweredQuestionIds(updatedAnsweredIds);


      // 🧮 Calcular el bloque correcto basado en las preguntas respondidas
      const calculateCurrentBlock = () => {
        let questionsCount = 0;
        for (let i = 0; i < blocks.length; i++) {
          const blockQuestions = blocks[i].questions.length;
          if (questionsCount + blockQuestions > updatedAnsweredIds.size) {
            return i; // Estamos en este bloque
          }
          questionsCount += blockQuestions;
        }
        return blocks.length - 1; // Último bloque
      };

      const correctBlockIndex = calculateCurrentBlock();


      // ✅ Guardar siempre en localStorage primero (instantáneo)
      saveProgressToLocalStorageRef.current?.();

      // ✅ NUEVO: Guardar a BD cada 3 respuestas en background (no solo cada 5)
      if (updatedAnsweredIds.size % 3 === 0 && user) {

        // Ejecutar en background sin bloquear UI
        saveProgressToDBWithRetry(user.id, {
          current_block: correctBlockIndex,
          total_answered: updatedAnsweredIds.size,
          answered_question_ids: Array.from(updatedAnsweredIds),
          profile_data: updatedProfileData,
          last_updated: new Date().toISOString()
        }).then(saved => {
          if (!saved) {
            console.warn('⚠️ [SAVE-DB] Failed after retries, will retry on next answer');
          }
        }).catch(error => {
          console.error('❌ [SAVE-DB] Unexpected error:', error);
        });
      }

      // ⏳ Luego guardar en DB en background (sin bloquear)
      if (user && updateContext) {


        updateContext({
          businessProfile: updatedProfileData as any,
          taskGenerationContext: {
            ...context.taskGenerationContext,
            maturity_test_progress: {
              current_block: correctBlockIndex,
              total_answered: updatedAnsweredIds.size,
              answered_question_ids: Array.from(updatedAnsweredIds),
              last_updated: new Date().toISOString()
            }
          }
        })
          .catch(error => {
            console.warn('⚠️ [DB-SAVE] Sync failed (localStorage is primary backup):', error);
          });
      }

    }
  }, [currentBlockIndex, currentBlock, profileData, answeredQuestionIds, updateProfileData, user, language, context, updateContext]);


  const loadProgress = useCallback(() => {

    try {
      const saved = userLocalStorage.getItem('fused_maturity_calculator_progress');
      if (!saved) {
        return false;
      }


      const parsed = JSON.parse(saved);

      if (parsed && typeof parsed === 'object') {
        if (parsed.currentBlockIndex !== undefined) {
          setCurrentBlockIndex(parsed.currentBlockIndex);
        }

        if (parsed.profileData) {
          setProfileData(parsed.profileData);
        }

        if (parsed.businessType) {
          setBusinessType(parsed.businessType);
        }

        if (parsed.answeredQuestionIds && Array.isArray(parsed.answeredQuestionIds)) {
          const answeredSet = new Set<string>(parsed.answeredQuestionIds);
          setAnsweredQuestionIds(answeredSet);
        }

        if (parsed.showCheckpoint !== undefined) {
          setShowCheckpoint(parsed.showCheckpoint);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [LOAD] Error loading progress:', error);
      return false;
    }
  }, []);

  const saveProgress = useCallback(() => {
    try {
      // 🔒 Validar IDs antes de guardar (protección contra desincronizaciones futuras)
      const allValidIds = blocks.flatMap(b => b.questions.map(q => q.id));
      const answeredIdsArray = Array.from(answeredQuestionIds);
      const validAnsweredIds = answeredIdsArray.filter(id => allValidIds.includes(id));

      if (validAnsweredIds.length !== answeredIdsArray.length) {
        const invalidIds = answeredIdsArray.filter(id => !allValidIds.includes(id));
        console.warn('🔒 [SAVE-PROTECTION] Filtering out invalid IDs:', invalidIds);
      }

      const progressData = {
        currentBlockIndex,
        profileData,
        businessType,
        showCheckpoint, // ✅ Usar el estado actual
        answeredQuestionIds: validAnsweredIds, // Solo guardar IDs válidos
        isCompleted,
        lastUpdated: new Date().toISOString()
      };



      userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(progressData));
    } catch (error) {
      console.error('❌ [MANUAL-SAVE] Failed:', error);
    }
  }, [currentBlockIndex, profileData, businessType, showCheckpoint, answeredQuestionIds, isCompleted]);

  const goToNextBlock = useCallback(() => {
    const isLastBlock = currentBlockIndex >= blocks.length - 1;
    const currentBlockQuestions = currentBlock?.questions || [];

    // ✅ PASO 3: CRÍTICO - Validar estado antes de avanzar
    if (currentBlockIndex < 0 || currentBlockIndex >= blocks.length) {
      console.error('🚨 [NEXT-BLOCK] INVALID current block index:', currentBlockIndex, 'of', blocks.length);
      console.error('🚨 [NEXT-BLOCK] EMERGENCY RECOVERY: Resetting to block 0');
      setCurrentBlockIndex(0);
      return;
    }

    // Contar cuántas preguntas del bloque actual están respondidas
    const answeredInCurrentBlock = currentBlockQuestions.filter(q =>
      answeredQuestionIds.has(q.id)
    ).length;

    const hasAnsweredAllInBlock = answeredInCurrentBlock >= currentBlockQuestions.length;


    const isQuestion12Transition = answeredQuestionIds.size === 12 && currentBlockIndex === 2;




    if (!isLastBlock) {
      // 🛡️ VALIDACIÓN: Asegurar que el siguiente bloque existe
      const nextBlockIndex = currentBlockIndex + 1;
      if (nextBlockIndex >= blocks.length) {
        console.error('🚨 [NEXT-BLOCK] Next block index would be invalid:', nextBlockIndex, 'of', blocks.length);
        if (completeAssessmentRef.current) {
          setIsProcessing(true);
          completeAssessmentRef.current().finally(() => {
            setIsProcessing(false);
          });
        }
        return;
      }

      // No es último bloque - avanzar normalmente
      setCurrentBlockIndex(nextBlockIndex);
      
      // Track block completion
      trackEvent({
        eventType: 'onboarding_block_completed',
        eventData: {
          blockIndex: currentBlockIndex,
          blockId: currentBlock?.id,
          totalAnswered: answeredQuestionIds.size,
          answeredInBlock: answeredInCurrentBlock
        }
      });
      
      saveProgress();
    } else if (isLastBlock && hasAnsweredAllInBlock) {
      // ES último bloque Y ya respondió todas las preguntas - completar
      if (completeAssessmentRef.current) {
        setIsProcessing(true);
        completeAssessmentRef.current().finally(() => {
          setIsProcessing(false);
        });
      } else {
        console.error('❌ [COMPLETE] completeAssessmentRef.current is null!');
      }
    } else {
      // ES último bloque PERO aún hay preguntas sin responder - quedarse
      saveProgress();
    }
  }, [currentBlockIndex, blocks, currentBlock, answeredQuestionIds, saveProgress]);

  const goToPreviousBlock = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prev => prev - 1);
      saveProgress();
    }
  }, [currentBlockIndex, saveProgress]);

  const getBlockProgress = useCallback(() => {
    if (!currentBlock) return { currentQuestion: 0, totalQuestions: 0, percentage: 0 };

    const totalQuestions = currentBlock.questions.length;
    const answeredInBlock = currentBlock.questions.filter(q =>
      answeredQuestionIds.has(q.id)
    ).length;

    return {
      currentQuestion: answeredInBlock,
      totalQuestions,
      percentage: totalQuestions > 0 ? (answeredInBlock / totalQuestions) * 100 : 0
    };
  }, [currentBlock, answeredQuestionIds]);

  const calculateMaturityScores = useCallback((): CategoryScore => {
    const ideaValidation = calculateIdeaValidation(profileData);
    const userExperience = calculateUserExperience(profileData);
    const marketFit = calculateMarketFit(profileData);
    const monetization = calculateMonetization(profileData);

    return {
      ideaValidation,
      userExperience,
      marketFit,
      monetization
    };
  }, [profileData]);

  const getMaturityLevel = useCallback((scores: CategoryScore): MaturityLevel => {
    const avgScore = (scores.ideaValidation + scores.userExperience + scores.marketFit + scores.monetization) / 4;

    const maturityLevels: Record<string, MaturityLevel> = {
      'Advanced': {
        id: 'advanced',
        level: 4,
        name: 'Avanzado',
        description: 'Tu negocio está en una etapa madura con procesos establecidos',
        characteristics: ['Ventas consistentes', 'Procesos definidos', 'Marca establecida'],
        nextSteps: ['Escalar operaciones', 'Diversificar ingresos', 'Automatizar procesos']
      },
      'Growing': {
        id: 'growing',
        level: 3,
        name: 'En Crecimiento',
        description: 'Tu negocio está creciendo y validando el mercado',
        characteristics: ['Ventas regulares', 'Base de clientes creciente', 'Procesos en desarrollo'],
        nextSteps: ['Optimizar conversiones', 'Fortalecer marca', 'Sistematizar operaciones']
      },
      'Developing': {
        id: 'developing',
        level: 2,
        name: 'En Desarrollo',
        description: 'Tu negocio está encontrando su camino',
        characteristics: ['Primeras ventas', 'Aprendiendo del mercado', 'Experimentando'],
        nextSteps: ['Validar propuesta de valor', 'Definir cliente ideal', 'Establecer canales']
      },
      'Starting': {
        id: 'starting',
        level: 1,
        name: 'Iniciando',
        description: 'Estás en la etapa inicial de tu emprendimiento',
        characteristics: ['Idea clara', 'Prototipo inicial', 'Primeros pasos'],
        nextSteps: ['Validar idea', 'Conocer clientes', 'Crear MVP']
      }
    };

    if (avgScore >= 80) return maturityLevels['Advanced'];
    if (avgScore >= 60) return maturityLevels['Growing'];
    if (avgScore >= 40) return maturityLevels['Developing'];
    return maturityLevels['Starting'];
  }, []);

  const completeAssessment = useCallback(async () => {
    // ✅ NUEVO: En onboarding, solo requiere 3 preguntas
    const requiredQuestions = isOnboardingMode ? 3 : MATURITY_TEST_CONFIG.TOTAL_QUESTIONS;

    if (answeredQuestionIds.size < requiredQuestions) {
      console.error(`❌ [COMPLETE] Insufficient answers: ${answeredQuestionIds.size}/${requiredQuestions}`);
      toast.error(
        language === 'es'
          ? `Debes responder ${requiredQuestions} preguntas. Has respondido ${answeredQuestionIds.size}.`
          : `You must answer ${requiredQuestions} questions. You've answered ${answeredQuestionIds.size}.`
      );
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);


    // ✅ DETECCIÓN AUTOMÁTICA: Con 3 preguntas, skip cálculos complejos y completar inmediatamente
    const isOnboardingComplete = answeredQuestionIds.size === 3;


    if (isOnboardingComplete) {

      try {
        setIsCompleted(true);

        // ✅ NUEVO: Generar camino artesanal ANTES de llamar onComplete
        if (user) {
          try {
            const { calculateCaminoArtesanalProgress } = await import('@/utils/caminoArtesanalProgress');

            // ✅ Migrado a NestJS - GET /telar/server/agent-tasks/user/{user_id}
            // Obtener tareas existentes (probablemente vacías en onboarding)
            const existingTasks = await getAgentTasksByUserId(user.id);

            // Calcular progreso inicial (será 5% base por completar el test)
            const placeholderScores = {
              ideaValidation: 0,
              userExperience: 0,
              marketFit: 0,
              monetization: 0
            };

            const initialProgress = calculateCaminoArtesanalProgress({
              maturity: placeholderScores,
              tasks: existingTasks || []
            } as any);



            // ✅ Migrado a NestJS - Guardar en master_coordinator_context
            const existingContext = await getMasterCoordinatorContextByUserId(user.id);
            const existingSnapshot = existingContext?.contextSnapshot || {};
            
            await upsertMasterCoordinatorContext(user.id, {
              contextSnapshot: {
                ...(typeof existingSnapshot === 'object' ? existingSnapshot : {}),
                camino_artesanal_progress: initialProgress,
                onboarding_completed: true // ✅ Marcar onboarding como completado
              } as any
            });

            // ✅ Disparar evento para actualizar UI del dashboard
            EventBus.publish('master.context.updated', {
              progress: initialProgress,
              source: 'onboarding_completion'
            });

          } catch (error) {
            console.error('❌ [CAMINO-ONBOARDING] Error calculating/saving initial progress:', error);
            // No bloquear el onboarding si falla esto
          }
        }

        // Guardar progreso básico usando la función del hook
        await saveProgress();

        // Garantizar scores exactamente en 0 (números, no null/undefined)
        const placeholderScores = {
          ideaValidation: 0,
          userExperience: 0,
          marketFit: 0,
          monetization: 0
        };

        // Llamar onComplete con placeholder scores (formato correcto)
        if (onComplete) {
          // Track onboarding completion
          trackEvent({
            eventType: 'onboarding_assessment_completed',
            eventData: {
              totalAnswered: answeredQuestionIds.size,
              businessType: profileData.businessType,
              completedAt: new Date().toISOString(),
              isOnboarding: true
            },
            success: true
          });

          onComplete(
            placeholderScores,
            { primary: [], secondary: [] },
            profileData
          );
        }

        toast.success(
          language === 'es'
            ? '🎉 ¡Onboarding completado! Tu Camino Artesanal está listo en el dashboard.'
            : '🎉 Onboarding complete! Your Artisan Journey is ready in the dashboard.'
        );

        setIsProcessing(false);
        return;
      } catch (error) {
        console.error('❌ [ONBOARDING-COMPLETE] Error:', error);
        toast.error(
          language === 'es'
            ? 'Error al completar onboarding'
            : 'Error completing onboarding'
        );
        setIsProcessing(false);
        return;
      }
    }

    try {
      const scores = calculateMaturityScores();

      const level = getMaturityLevel(scores);

      const recommendedAgents = generateMaturityBasedRecommendations(scores);

      const personalizedTasks = generatePersonalizedTasks(scores, profileData, language);

      if (user) {
        // ✅ Disparar evento para que el dashboard genere tareas


        // ✅ Calcular y guardar progreso inicial del camino artesanal
        try {
          const { calculateCaminoArtesanalProgress } = await import('@/utils/caminoArtesanalProgress');

          // ✅ Migrado a NestJS - GET /telar/server/agent-tasks/user/{user_id}
          const existingTasks = await getAgentTasksByUserId(user.id);

          const initialProgress = calculateCaminoArtesanalProgress({
            maturity: scores,
            tasks: existingTasks || [] // Usar tareas existentes o array vacío
          } as any);



          // ✅ Migrado a NestJS - Guardar en master_coordinator_context
          const existingContext = await getMasterCoordinatorContextByUserId(user.id);
          if (existingContext) {
            const existingSnapshot = existingContext.contextSnapshot || {};
            await upsertMasterCoordinatorContext(user.id, {
              contextSnapshot: {
                ...(typeof existingSnapshot === 'object' ? existingSnapshot : {}),
                camino_artesanal_progress: initialProgress
              } as any
            });
          }
        } catch (error) {
          console.error('❌ [CAMINO] Error calculating/saving initial progress:', error);
        }

        // 1. Guardar scores en DB
        await saveMaturityScores(scores, profileData);

        // 2. Crear agentes recomendados
        await createUserAgentsFromRecommendations(user.id, recommendedAgents);

        // 3. Marcar onboarding completo
        markOnboardingComplete(user.id, scores, recommendedAgents);

        // 4. ✅ Sincronizar progreso con user_master_context usando updateContext (hace merge)
        try {
          await updateContext({
            taskGenerationContext: {
              ...context.taskGenerationContext,
              maturity_test_progress: {
                total_answered: answeredQuestionIds.size,
                total_questions: MATURITY_TEST_CONFIG.TOTAL_QUESTIONS,
                is_complete: true,
                last_updated: new Date().toISOString(),
                completed_at: new Date().toISOString()
              }
            }
          });
        } catch (err) {
          console.warn('⚠️ [COMPLETE] Error updating progress:', err);
        }

        // 🔥 GUARDAR profileData en user-namespaced localStorage para creación de tienda
        try {
          userLocalStorage.setItem('profileData', JSON.stringify(profileData));
        } catch (err) {
          console.error('❌ [COMPLETE] Error saving to localStorage:', err);
        }

        // 🔥 NUEVO: Actualizar user_master_context con datos completos y contexto enriquecido
        const enrichedBusinessContext = {
          assessment_completed: true,
          completion_date: new Date().toISOString(),

          // Historia y contexto del negocio
          resumen: profileData.businessDescription || '',
          historia: `${profileData.brandName || 'Este negocio'} se dedica a ${profileData.craftType || 'la artesanía'}${profileData.experience ? ` con ${profileData.experience} de experiencia` : ''}.`,
          tipo_artesania: profileData.craftType || '',
          ubicacion: profileData.businessLocation || '',
          experiencia: profileData.experience || '',

          // Cliente y mercado
          cliente_ideal: profileData.targetAudience || '',
          conocimiento_cliente: profileData.customerClarity || 0,
          target_customer: profileData.targetAudience || '',

          // Ventas y comercialización
          ha_vendido: profileData.hasSold || false,
          frecuencia_ventas: profileData.salesConsistency || '',
          canales_promocion: profileData.promotionChannels || [],
          canales_actuales: profileData.promotionChannels || [],
          comodidad_venta: profileData.marketingConfidence || 0,

          // Precios y propuesta de valor
          metodo_precio: profileData.pricingMethod || profileData.pricing || '',
          claridad_ganancia: profileData.profitClarity || 0,

          // Datos básicos
          nombre_marca: profileData.brandName || '',
          descripcion: profileData.businessDescription || ''
        };

        // 🔥 Update using unified data hook
        await Promise.all([
          updateProfile({
            businessType: profileData.industry,
            businessDescription: profileData.businessDescription,
            brandName: profileData.brandName,
            targetMarket: profileData.targetAudience,
            languagePreference: language
          }),
          updateContext({
            businessProfile: {
              ...profileData,
              maturity_scores: scores,
              maturity_level: level.name,
              recommended_agents: recommendedAgents
            },
            taskGenerationContext: {
              maturityScores: scores,
              language,
              lastAssessmentSource: 'fused_maturity_agent',
              lastGeneration: new Date().toISOString()
            },
            conversationInsights: enrichedBusinessContext
          })
        ]);


        // 🔥 ✅ Migrado a NestJS - Crear registro en master_coordinator_context
        try {
          await createMasterCoordinatorContext({
            userId: user.id,
            contextSnapshot: {
              profile_data: profileData,
              maturity_scores: scores,
              maturity_level: level.name,
              recommended_agents: recommendedAgents,
              assessment_completed_at: new Date().toISOString()
            } as any,
            aiMemory: [
              {
                timestamp: new Date().toISOString(),
                message: 'Maturity assessment completed',
                context: 'onboarding',
                sentiment: 'positive'
              }
            ],
            lastInteraction: new Date().toISOString(),
            contextVersion: 1
          });
        } catch (insertError) {
          console.error('❌ Error creating coordinator context:', insertError);
        }

        // 🔥 NUEVO: Publicar evento para que MasterAgentContext se actualice
        EventBus.publish('maturity.assessment.completed', {
          userId: user.id,
          scores,
          level,
          recommendedAgents
        });
      }

      setIsCompleted(true);

      // ✅ NUNCA borrar - SIEMPRE guardar como completado
      const completedProgress = {
        currentBlockIndex,
        profileData,
        businessType,
        showCheckpoint: false,
        answeredQuestionIds: Array.from(answeredQuestionIds),
        isCompleted: true,
        completedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      try {
        userLocalStorage.setItem('fused_maturity_calculator_progress', JSON.stringify(completedProgress));

      } catch (error) {
        console.error('❌ [COMPLETION] Failed to save completed progress:', error);
      }

      toast.success(language === 'es' ? 'Evaluación completada' : 'Assessment completed');

      // Track assessment completion
      trackEvent({
        eventType: 'onboarding_assessment_completed',
        eventData: {
          totalAnswered: answeredQuestionIds.size,
          businessType: profileData.businessType,
          completedAt: new Date().toISOString(),
          isOnboarding: isOnboardingMode
        },
        success: true
      });

      onComplete(scores, recommendedAgents, profileData);
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast.error(language === 'es' ? 'Error al completar la evaluación' : 'Error completing assessment');
    } finally {
      setIsProcessing(false);
    }
  }, [
    calculateMaturityScores,
    getMaturityLevel,
    generatePersonalizedTasks,
    profileData,
    language,
    user,
    saveMaturityScores,
    onComplete,
    isProcessing,
    businessType,
    answeredQuestionIds,
    updateProfile,
    updateContext
  ]);

  // ✅ Store completeAssessment in ref for auto-complete useEffect
  useEffect(() => {
    completeAssessmentRef.current = completeAssessment;
  }, [completeAssessment]);

  return {
    currentBlock,
    profileData,
    isCompleted,
    maturityLevel: getMaturityLevel(calculateMaturityScores()),
    personalizedTasks: [],
    updateProfileData,
    answerQuestion,
    goToNextBlock,
    goToPreviousBlock,
    saveProgress,
    loadProgress,
    completeAssessment,
    getBlockProgress,
    businessType,
    isProcessing,
    isLoadingProgress, // ✅ Estado de carga híbrida
    showCheckpoint,
    checkpointInfo,
    continueFromCheckpoint,
    totalAnswered,
    totalQuestions, // ✅ Export dynamic total
    answeredQuestionIds,
    isOnboardingMode, // ✅ Export onboarding mode
    blocks // ✅ Export all blocks for checkpoint
  };
};

// Helper functions for score calculation (12 optimized questions) - RECALIBRATED
function calculateIdeaValidation(profile: UserProfileData): number {
  let score = 10; // Base MUY bajo

  // Q1: business_description (0-20 puntos)
  const descStr = typeof profile.businessDescription === 'string' ? profile.businessDescription : '';
  if (descStr.length > 100) score += 20;
  else if (descStr.length > 50) score += 10;

  // Valor único detectado (+10)
  const descLower = descStr.toLowerCase();
  if (descLower.includes('única') ||
    descLower.includes('diferente') ||
    descLower.includes('especial') ||
    descLower.includes('unique') ||
    descLower.includes('different') ||
    descLower.includes('special')) score += 10;

  // Q2: experience_time (0-20 puntos)
  if (profile.experienceTime === 'more_than_5') score += 20;
  else if (profile.experienceTime === '3_to_5') score += 15;
  else if (profile.experienceTime === '1_to_3') score += 8;
  else score += 3; // less_than_1

  // Q4: Ha vendido? (0-30 puntos) - CRÍTICO
  if (profile.salesStatus === 'consistent') score += 30;
  else if (profile.salesStatus === 'regular') score += 25;
  else if (profile.salesStatus === 'occasional') score += 15;
  else if (profile.salesStatus === 'first_sales') score += 8;
  // not_yet = +0

  // Q11: growth_goal (0-10 puntos)
  if (profile.growthGoal === 'scale_business') score += 10;
  else if (profile.growthGoal === 'expand_market') score += 8;
  else if (profile.growthGoal === 'increase_volume') score += 5;

  return Math.min(100, score);
}

function calculateUserExperience(profile: UserProfileData): number {
  let score = 10; // Base bajo

  // Q2: experience_time (0-15 puntos)
  if (profile.experienceTime === 'more_than_5') score += 15;
  else if (profile.experienceTime === '3_to_5') score += 12;
  else if (profile.experienceTime === '1_to_3') score += 7;
  else score += 2;

  // Q4: sales_status (0-35 puntos) - MÁS PESO
  if (profile.salesStatus === 'consistent') score += 35;
  else if (profile.salesStatus === 'regular') score += 28;
  else if (profile.salesStatus === 'occasional') score += 18;
  else if (profile.salesStatus === 'first_sales') score += 8;
  // not_yet = +0

  // Q8: customer_knowledge (0-25 puntos)
  const knowledge = profile.customerKnowledge || 1;
  if (knowledge === 5) score += 25;
  else if (knowledge === 4) score += 20;
  else if (knowledge === 3) score += 12;
  else if (knowledge === 2) score += 6;
  else score += 2;

  // Q9: promotion_channels (0-15 puntos)
  const channelsCount = profile.promotionChannels?.length || 0;
  if (channelsCount >= 3) score += 15;
  else if (channelsCount === 2) score += 10;
  else if (channelsCount === 1) score += 5;

  return Math.min(100, score);
}

function calculateMarketFit(profile: UserProfileData): number {
  let score = 10; // Base bajo

  // Q7: target_customer (0-15 puntos)
  if (profile.targetCustomer === 'both') score += 15;
  else if (profile.targetCustomer === 'individuals' || profile.targetCustomer === 'businesses') score += 10;
  else score += 3; // unclear

  // Q8: customer_knowledge (0-30 puntos) - MÁS PESO
  const knowledge = profile.customerKnowledge || 1;
  if (knowledge === 5) score += 30;
  else if (knowledge === 4) score += 24;
  else if (knowledge === 3) score += 15;
  else if (knowledge === 2) score += 8;
  else score += 3;

  // Q9: promotion_channels (0-25 puntos)
  const channelsCount = profile.promotionChannels?.length || 0;
  if (channelsCount >= 4) score += 25;
  else if (channelsCount === 3) score += 20;
  else if (channelsCount === 2) score += 12;
  else if (channelsCount === 1) score += 6;

  // Q10: marketing_confidence (0-20 puntos)
  const confidence = profile.marketingConfidence || 1;
  if (confidence === 5) score += 20;
  else if (confidence === 4) score += 15;
  else if (confidence === 3) score += 10;
  else if (confidence === 2) score += 5;
  else score += 2;

  return Math.min(100, score);
}

function calculateMonetization(profile: UserProfileData): number {
  let score = 10; // Base bajo

  // Q4: sales_status (0-40 puntos) - MÁXIMO PESO
  if (profile.salesStatus === 'consistent') score += 40;
  else if (profile.salesStatus === 'regular') score += 32;
  else if (profile.salesStatus === 'occasional') score += 20;
  else if (profile.salesStatus === 'first_sales') score += 10;
  // not_yet = +0

  // Q5: pricing_method (0-20 puntos)
  if (profile.pricingMethod === 'perceived_value') score += 20;
  else if (profile.pricingMethod === 'cost_plus_margin') score += 15;
  else if (profile.pricingMethod === 'market_price') score += 12;
  else if (profile.pricingMethod === 'time_invested') score += 8;
  else score += 3; // no_system

  // Q6: profit_clarity (0-20 puntos)
  const clarity = profile.profitClarity || 1;
  if (clarity === 5) score += 20;
  else if (clarity === 4) score += 16;
  else if (clarity === 3) score += 10;
  else if (clarity === 2) score += 5;
  else score += 2;

  // Q3: work_structure (0-10 puntos)
  if (profile.workStructure === 'small_team') score += 10;
  else if (profile.workStructure === 'partner') score += 7;
  else if (profile.workStructure === 'occasional_help') score += 4;
  else score += 2; // solo

  return Math.min(100, score);
}

function generatePersonalizedTasks(
  scores: CategoryScore,
  profile: UserProfileData,
  language: 'en' | 'es'
): PersonalizedTask[] {
  const tasks: PersonalizedTask[] = [];
  const isSpanish = language === 'es';

  // Identify gaps
  const gaps = {
    ideaValidation: scores.ideaValidation < 70,
    userExperience: scores.userExperience < 70,
    marketFit: scores.marketFit < 70,
    monetization: scores.monetization < 70
  };

  if (gaps.ideaValidation) {
    tasks.push({
      id: 'idea-validation',
      title: isSpanish ? 'Validar tu idea de negocio' : 'Validate your business idea',
      description: isSpanish
        ? 'Clarifica tu propuesta de valor y identifica tu público objetivo'
        : 'Clarify your value proposition and identify your target audience',
      agentId: 'brand-agent',
      priority: 'high',
      estimatedTime: isSpanish ? '2-3 semanas' : '2-3 weeks',
      category: 'ideaValidation'
    });
  }

  if (gaps.userExperience) {
    tasks.push({
      id: 'user-experience',
      title: isSpanish ? 'Mejorar experiencia del cliente' : 'Improve customer experience',
      description: isSpanish
        ? 'Optimiza cómo interactúan los clientes con tu negocio'
        : 'Optimize how customers interact with your business',
      agentId: 'user-experience-agent',
      priority: 'high',
      estimatedTime: isSpanish ? '1-2 semanas' : '1-2 weeks',
      category: 'userExperience'
    });
  }

  if (gaps.marketFit) {
    tasks.push({
      id: 'market-fit',
      title: isSpanish ? 'Encontrar tu encaje de mercado' : 'Find your market fit',
      description: isSpanish
        ? 'Define estrategias para llegar a tus clientes ideales'
        : 'Define strategies to reach your ideal customers',
      agentId: 'market-fit-agent',
      priority: 'medium',
      estimatedTime: isSpanish ? '3-4 semanas' : '3-4 weeks',
      category: 'marketFit'
    });
  }

  if (gaps.monetization) {
    tasks.push({
      id: 'monetization',
      title: isSpanish ? 'Estrategia de monetización' : 'Monetization strategy',
      description: isSpanish
        ? 'Estructura tus precios y canales de venta'
        : 'Structure your pricing and sales channels',
      agentId: 'monetization-agent',
      priority: 'high',
      estimatedTime: isSpanish ? '2-3 semanas' : '2-3 weeks',
      category: 'monetization'
    });
  }

  return tasks;
}

function getBusinessTypeLabel(type: string, language: 'en' | 'es'): string {
  const labels = {
    creative: { en: 'Creative', es: 'Creativo' },
    service: { en: 'Service', es: 'Servicio' },
    product: { en: 'Product', es: 'Producto' },
    tech: { en: 'Technology', es: 'Tecnología' },
    other: { en: 'Other', es: 'Otro' }
  };

  return labels[type as keyof typeof labels]?.[language] || type;
}
