/**
 * Tu Taller Digital - Consolidado con MasterAgentContext
 *
 * Tu espacio principal unificado que usa MasterAgentContext como única fuente de verdad.
 * Todos los datos fluyen a través del Coordinador Maestro.
 *
 * Estructura:
 * - Hero dinámico con saludo y nivel de madurez
 * - Sidebar permanente del Coordinador (chat siempre disponible)
 * - Panel de Misiones Activas (tarjetas visuales)
 * - Panel de Entregables (descargables)
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMasterAgent } from "@/context/MasterAgentContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useLanguage } from "@/context/LanguageContext";
import { useMasterOrchestrator } from "@/hooks/useMasterOrchestrator";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProgressByUserId,
  updateUserProgressWithRewards,
} from "@/services/userProgress.actions";
import { getProductsByUserId } from "@/services/products.actions";
import { getArtisanShopByUserId } from "@/services/artisanShops.actions";
import { updateTaskStep } from "@/services/taskSteps.actions";
import { updateAgentTask } from "@/services/agentTasks.actions";
import {
  getAgentDeliverables,
  createAgentDeliverable,
} from "@/services/agentDeliverables.actions";
import { getUserAchievements } from "@/services/userAchievements.actions";
import {
  getMasterCoordinatorContextByUserId,
  updateMasterCoordinatorContextByUserId,
} from "@/services/masterCoordinatorContext.actions";
import { useUnifiedProgress } from "@/hooks/useUnifiedProgress";
import { useUserLocalStorage } from "@/hooks/useUserLocalStorage";
import { useUnifiedUserData } from "@/hooks/user";
import { useFixedTasksManager } from "@/hooks/useFixedTasksManager";
import { useMissionDiscovery } from "@/hooks/useMissionDiscovery";
import { useProfileCompleteness } from "@/hooks/useProfileCompleteness";
import { CoordinatorChatSidebar } from "./CoordinatorChatSidebar";
import { SimpleMissionCard } from "../dashboard/artisan/SimpleMissionCard";
import { RewardsPanel } from "./RewardsPanel";
import { DeliverableCard } from "./DeliverableCard";
import { FloatingMasterAgent } from "@/components/dashboard/FloatingMasterAgent";
import { DashboardActionCard } from "@/components/dashboard/DashboardActionCard";
import { InventoryOrganizerModal } from "@/components/tasks/StepSpecificModals/InventoryOrganizerModal";
import { LegalGuideModal } from "@/components/tasks/StepSpecificModals/LegalGuideModal";
import { ForceCompleteProfileModal } from "@/components/profile/ForceCompleteProfileModal";

import {
  Sparkles,
  Target,
  MessageCircle,
  CheckCircle2,
  Download,
  Lightbulb,
  Crown,
  Bot,
  RefreshCw,
  Package,
  Store,
  TrendingUp,
  ShoppingBag,
  Plus,
  Award,
  User,
  Compass,
  ArrowRight,
  Clock,
  BarChart3,
  ExternalLink,
  Search,
  Palette,
  Edit,
} from "lucide-react";
import { TelarLoadingAnimation } from "@/components/ui/TelarLoadingAnimation";
import { RotatingLoadingPhrases } from "@/components/ui/RotatingLoadingPhrases";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EventBus } from "@/utils/eventBus";
import { getTaskCompletionData } from "@/hooks/utils/taskCompletionHelpers";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";
import { useMaturityTestStatus } from "@/hooks/useMaturityTestStatus";
import { MATURITY_TEST_CONFIG } from "@/config/maturityTest";
import { useBrandSyncValidator } from "@/hooks/useBrandSyncValidator";
import { useWizardTaskDetector } from "@/hooks/useWizardTaskDetector";
import { useOnboardingValidation } from "@/hooks/useOnboardingValidation";
import { ArtisanProgressHero } from "@/components/dashboard/artisan/ArtisanProgressHero";
import { UserProgressDashboard } from "@/components/dashboard/UserProgressDashboard";
import { DashboardNavHeader } from "@/components/dashboard/DashboardNavHeader";
import { ContinueMaturityBanner } from "@/components/dashboard/ContinueMaturityBanner";
import { useShopNavigation } from "@/hooks/useShopNavigation";
import { DashboardSkeleton } from "@/components/dashboard/skeletons";
import { ShopSalesMiniCard } from "@/components/dashboard/ShopSalesMiniCard";

export const NewMasterCoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();
  const { context } = useUnifiedUserData();
  const { masterState, syncAll, refreshModule, isLoading, error } =
    useMasterAgent();
  const { hasShop, shopButtonTextLong, navigateToShop } = useShopNavigation();
  const { progress, updateProgress, progressPercentage } = useUserProgress();
  const { trackEvent } = useAnalyticsTracking();
  const {
    unifiedProgress,
    loading: loadingProgress,
    refreshProgress,
  } = useUnifiedProgress();
  const {
    analyzeContext,
    generateTasks,
    validateTask,
    isAnalyzing,
    isGenerating,
    isValidating: isTaskValidating,
  } = useMasterOrchestrator();
  const {
    isComplete: isProfileComplete,
    isLoading: isProfileLoading,
    missingFields,
    currentData,
    refresh: refreshProfileCompleteness,
  } = useProfileCompleteness();
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [processingTasks, setProcessingTasks] = useState<Set<string>>(
    new Set(),
  );
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 🔧 OPTIMIZATION: Verificación directa con guard para evitar re-ejecución
  const [directProductCount, setDirectProductCount] = useState<number | null>(
    null,
  );
  const verifyProductsRef = useRef<string | null>(null);

  useEffect(() => {
    // ✅ FIX: Resetear guard cuando cambia el userId
    if (!user?.id) return;

    // Si ya se verificó para este usuario, no volver a ejecutar
    if (verifyProductsRef.current === user.id) return;

    verifyProductsRef.current = user.id;

    const verifyProducts = async () => {
      try {
        const products = await getProductsByUserId(user.id);
        setDirectProductCount(products.length);
      } catch (error) {
        console.error(
          "[NewMasterCoordinatorDashboard] Error fetching products:",
          error,
        );
        setDirectProductCount(0);
      }
    };

    verifyProducts();
  }, [user?.id]);

  // 🎯 Fixed Tasks Manager & Mission Discovery
  const {
    tasks: fixedTasks,
    completedTaskIds: completedFixedTasks,
    loading: loadingFixed,
  } = useFixedTasksManager();
  const { suggestions, isDiscovering, discoverMissions } =
    useMissionDiscovery();

  // 🎯 NUEVO: Estados de Maturity Test con diferenciación clara
  const {
    hasCompletedOnboarding,
    hasCompletedMaturityTest,
    totalAnswered: maturityTotalAnswered,
    isInProgress: maturityIsInProgress,
    isValidating: maturityIsValidating,
  } = useOnboardingValidation();

  // Aliases para compatibilidad con código existente
  const checkingOnboarding = maturityIsValidating;
  const hasCompleted = hasCompletedMaturityTest;
  const hasInProgress = maturityIsInProgress;
  const testTotalAnswered = maturityTotalAnswered;

  // 🔄 OPTIMIZATION: Reducir frecuencia de validación de 5 a 15 minutos
  useBrandSyncValidator({ enabled: true, intervalMinutes: 15 });

  // 🎯 Auto-detección de wizards completados para marcar tareas
  useWizardTaskDetector();

  // 🔄 Usar totalAnswered del hook como fuente principal
  const totalAnswered = maturityTotalAnswered;
  const remainingQuestions =
    MATURITY_TEST_CONFIG.TOTAL_QUESTIONS - totalAnswered;

  // 🔐 Mostrar modal de perfil incompleto cuando faltan datos críticos
  useEffect(() => {
    if (!isProfileLoading && !isProfileComplete && user?.id) {
      // Pequeño delay para no bloquear el render inicial
      const timer = setTimeout(() => {
        setShowProfileModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isProfileLoading, isProfileComplete, user?.id]);

  // Timeout de 15 segundos para forzar el render si la carga se congela
  useEffect(() => {
    if (isLoading || isAnalyzing || isGenerating || isTaskValidating) {
      const timer = setTimeout(() => {
        console.warn("[Dashboard] ⏰ Loading timeout reached, forcing render");
        setLoadingTimeout(true);
      }, 15000);

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading, isAnalyzing, isGenerating, isTaskValidating]);

  // Listen for real-time inventory updates
  useEffect(() => {
    const unsubscribeInventory = EventBus.subscribe(
      "inventory.updated",
      async (data) => {
        await refreshModule("inventario");
        await refreshModule("tienda");

        toast.info("Inventario actualizado", {
          description: "Tu catálogo de productos se ha sincronizado",
          duration: 3000,
        });
      },
    );

    const unsubscribeBrand = EventBus.subscribe("brand.updated", async () => {
      await refreshModule("marca");
    });

    // 🧹 NUEVO: Refrescar todo el dashboard cuando se limpien datos
    const unsubscribeDebugClear = EventBus.subscribe(
      "debug.data.cleared",
      async () => {
        await syncAll();
        refreshProgress();
      },
    );

    const unsubscribeProgress = EventBus.subscribe(
      "master.full.sync",
      async () => {
        refreshProgress();
      },
    );

    return () => {
      unsubscribeInventory();
      unsubscribeBrand();
      unsubscribeDebugClear();
      unsubscribeProgress();
    };
  }, [refreshModule, syncAll, refreshProgress]);

  // Extract data from unified MasterAgentContext
  const profile = masterState.perfil;
  const brand = masterState.marca;
  const shop = masterState.tienda;
  const inventory = masterState.inventario;

  // 🔧 OPTIMIZATION: Verificación de tienda con guard
  const [hasShopVerified, setHasShopVerified] = useState<boolean | null>(null);
  const verifyShopRef = useRef<string | null>(null);

  useEffect(() => {
    // ✅ FIX: Resetear guard cuando cambia el userId
    if (!user?.id) return;

    // Si ya se verificó para este usuario, no volver a ejecutar
    if (verifyShopRef.current === user.id) return;

    verifyShopRef.current = user.id;

    const verifyShop = async () => {
      try {
        // ✅ Verificar si existe tienda del usuario desde NestJS backend
        const shop = await getArtisanShopByUserId(user.id);
        setHasShopVerified(!!shop);
      } catch (error) {
        console.error(
          "[NewMasterCoordinatorDashboard] Error verifying shop:",
          error,
        );
        setHasShopVerified(false);
      }
    };

    verifyShop();
  }, [user?.id]);

  // 🔧 FASE 2: Forzar re-sincronización cuando el inventario esté vacío pero la tienda exista
  const inventorySyncedRef = useRef(false);

  useEffect(() => {
    // ✅ FIX: Solo ejecutar UNA VEZ cuando se cumplen las condiciones
    // Si tenemos tienda pero el inventario está vacío, forzar re-sync
    if (
      hasShopVerified &&
      inventory.productos?.length === 0 &&
      !isLoading &&
      directProductCount !== null &&
      directProductCount > 0 &&
      !inventorySyncedRef.current
    ) {
      inventorySyncedRef.current = true;
      refreshModule("inventario");
    }
    // ✅ FIX: No incluir refreshModule en dependencias para evitar loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasShopVerified,
    inventory.productos?.length,
    isLoading,
    directProductCount,
  ]);

  // ✅ FIXED: Always provide default scores if they don't exist
  const maturityScores = masterState.growth.nivel_madurez || {
    ideaValidation: 0,
    userExperience: 0,
    marketFit: 0,
    monetization: 0,
  };

  // 🔧 Deduplicar tareas por agent_id (mantener solo la más reciente de cada tipo)
  const rawTasks = masterState.growth.misiones || [];
  const deduplicatedTasks = rawTasks.reduce((acc: any[], task: any) => {
    const existingIndex = acc.findIndex(
      (t: any) => t.agent_id === task.agent_id,
    );
    if (existingIndex === -1) {
      acc.push(task);
    } else {
      // Mantener la más reciente
      if (new Date(task.created_at) > new Date(acc[existingIndex].created_at)) {
        acc[existingIndex] = task;
      }
    }
    return acc;
  }, []);

  // 🔧 Filtrar tareas según contexto (ocultar "create_shop" si ya existe tienda)
  // Use verified shop state (direct DB query) instead of masterState
  const shouldHideCreateShop = hasShopVerified === true || shop.has_shop;

  const tasks = deduplicatedTasks.filter((task: any) => {
    if (
      shouldHideCreateShop &&
      (task.agent_id === "create_shop" || task.agent_id === "shop")
    ) {
      return false;
    }
    return true;
  });

  const translations = {
    es: {
      welcome: "Hola",
      subtitle: "Tu taller digital artesanal",
      maturityLevel: "Nivel de Madurez",
      nextRecommendation: "Próximo Paso Recomendado",
      activeMissions: "Misiones Activas",
      deliverables: "Tus Entregables",
      viewAll: "Ver Todas",
      startNow: "Empezar Ahora",
      chatWithCoordinator: "Conversemos",
      downloadDeliverable: "Descargar",
      noMissions: "No tienes misiones activas",
      noDeliverables: "Aún no has completado ninguna misión",
      coordinatorMessage:
        "Hola 👋 Estoy aquí para ayudarte a crecer tu negocio artesanal paso a paso.",
      refresh: "Actualizar",
      syncInventory: "Sincronizar Inventario",
      completeProfile: "Completa tu Perfil de Crecimiento",
      answeredQuestions: "Has respondido {{current}} de {{total}} preguntas",
      betterRecommendations:
        "Mientras más completes, mejores recomendaciones recibirás",
      continueButton: "Continuar",
    },
    en: {
      welcome: "Hello",
      subtitle: "Your digital artisan workshop",
      maturityLevel: "Maturity Level",
      nextRecommendation: "Next Recommended Step",
      activeMissions: "Active Missions",
      deliverables: "Your Deliverables",
      viewAll: "View All",
      startNow: "Start Now",
      chatWithCoordinator: "Let's Talk",
      downloadDeliverable: "Download",
      noMissions: "No active missions",
      noDeliverables: "No deliverables yet",
      coordinatorMessage:
        "Hello 👋 I'm here to help you grow your artisan business step by step.",
      refresh: "Refresh",
      syncInventory: "Sync Inventory",
    },
  };

  const t = translations[language as "es" | "en"] || translations.es;

  // Use unified progress instead of manual calculation
  const totalProgress = unifiedProgress?.totalProgress || 0;
  const dynamicMaturityScores =
    unifiedProgress?.maturityScores || maturityScores;

  // Get active tasks (exclude Fixed Tasks to avoid duplication) - MEMOIZED
  const generatedTasks = useMemo(
    () =>
      tasks.filter(
        (task: any) =>
          (task.status === "in_progress" || task.status === "pending") &&
          !fixedTasks.some((ft) => ft.id === task.agent_id),
      ),
    [tasks, fixedTasks],
  );

  const activeTasks = useMemo(
    () => generatedTasks.slice(0, 3),
    [generatedTasks],
  );

  // Transform tasks to match SimpleMissionCard format - MEMOIZED
  const transformFixedTask = useMemo(
    () => (task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      milestone: task.milestone || "general",
      ctaLabel: task.action?.type === "wizard" ? "Iniciar" : "Ver",
      ctaRoute: task.action?.destination || "#",
      isCompleted: completedFixedTasks.includes(task.id),
      isLocked: false,
      icon: task.icon || "Package",
      estimatedMinutes: task.estimatedMinutes,
    }),
    [completedFixedTasks],
  );

  // Get deliverables from completed tasks
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);

  // ✅ OPTIMIZATION: Guard to prevent infinite loops on deliverables fetch
  const deliverablesFetchedRef = useRef<string | null>(null);
  const tasksLengthRef = useRef(0);

  useEffect(() => {
    // ✅ OPTIMIZATION: Only fetch once per user, or when tasks length changes significantly
    if (!user?.id) return;

    // ✅ FIX: Reset guard cuando cambia el usuario
    if (deliverablesFetchedRef.current !== user.id) {
      deliverablesFetchedRef.current = null;
      tasksLengthRef.current = 0;
    }

    // ✅ FIX: Solo fetch si no se ha hecho antes PARA ESTE USUARIO, o si cambian significativamente las tareas
    if (
      deliverablesFetchedRef.current === user.id &&
      Math.abs(tasksLengthRef.current - generatedTasks.length) < 5
    ) {
      return;
    }

    deliverablesFetchedRef.current = user.id;
    tasksLengthRef.current = generatedTasks.length;

    const loadData = async () => {
      // ✅ Load deliverables from NestJS backend
      try {
        const deliverablesData = await getAgentDeliverables();
        // Limitar a los 3 más recientes (el backend ya los ordena por created_at desc)
        if (deliverablesData && Array.isArray(deliverablesData)) {
          setDeliverables(deliverablesData.slice(0, 3));
        }
      } catch (error) {
        console.error(
          "[NewMasterCoordinatorDashboard] Error loading deliverables:",
          error,
        );
        setDeliverables([]);
      }

      // Load user progress stats
      const progressData = await getUserProgressByUserId(user.id).catch(
        () => null,
      );

      // ✅ Load user achievements from NestJS backend
      let achievements: any[] = [];
      try {
        const achievementsData = await getUserAchievements();
        // ✅ FIX: Validar que achievementsData existe y es un array antes de ordenar
        if (achievementsData && Array.isArray(achievementsData)) {
          // Ordenar por unlockedAt descendente (más recientes primero)
          achievements = achievementsData.sort(
            (a, b) =>
              new Date(b.unlockedAt).getTime() -
              new Date(a.unlockedAt).getTime(),
          );
        } else {
          console.warn(
            "[NewMasterCoordinatorDashboard] achievementsData is undefined or not an array",
          );
          achievements = [];
        }
      } catch (error) {
        console.error(
          "[NewMasterCoordinatorDashboard] Error loading achievements:",
          error,
        );
        achievements = [];
      }

      if (progressData) {
        setUserStats({
          level: progressData.level || 1,
          experiencePoints: progressData.experiencePoints || 0,
          nextLevelXP: progressData.nextLevelXp || 100,
          completedMissions: progressData.completedMissions || 0,
          totalMissions: generatedTasks.length,
          currentStreak: progressData.currentStreak || 0,
          longestStreak: progressData.longestStreak || 0,
          achievements: achievements.map((a: any) => ({
            id: a.achievementId,
            title: a.title,
            description: a.description,
            icon: a.icon,
            unlockedAt: new Date(a.unlockedAt),
          })),
        });
      }
    };

    loadData();
  }, [user?.id, generatedTasks.length]); // ✅ FIXED: Use stable primitive dependency

  // ✅ FIX: Usar ref para activeTasks para evitar loops
  const activeTasksRef = useRef(activeTasks);
  useEffect(() => {
    activeTasksRef.current = activeTasks;
  }, [activeTasks]);

  // Verificar que el Camino Artesanal tenga progreso válido después del onboarding
  const caminoVerifiedRef = useRef(false);

  useEffect(() => {
    // ✅ FIX: Solo ejecutar UNA VEZ cuando se cumplen las condiciones
    if (
      !hasCompletedOnboarding ||
      !user?.id ||
      totalProgress !== 0 ||
      loadingProgress ||
      caminoVerifiedRef.current
    ) {
      return;
    }

    caminoVerifiedRef.current = true;

    const verifyCaminoProgress = async () => {
      try {
        // ✅ Get context from NestJS backend
        const contextData = await getMasterCoordinatorContextByUserId(user.id);

        const currentSnapshot = (contextData?.contextSnapshot as any) || {};
        const currentProgress = currentSnapshot?.camino_artesanal_progress;

        if (!currentProgress || currentProgress === 0) {
          const { calculateCaminoArtesanalProgress } =
            await import("@/utils/caminoArtesanalProgress");
          const initialProgress = Math.max(
            10,
            calculateCaminoArtesanalProgress({
              maturity: {
                ideaValidation: 10,
                userExperience: 10,
                marketFit: 10,
                monetization: 10,
              },
              tasks: activeTasksRef.current || [],
            } as any),
          );

          // ✅ Update context via NestJS backend
          await updateMasterCoordinatorContextByUserId(user.id, {
            contextSnapshot: {
              ...(typeof currentSnapshot === "object" &&
              currentSnapshot !== null
                ? currentSnapshot
                : {}),
              camino_artesanal_progress: initialProgress,
              last_updated: new Date().toISOString(),
            },
            lastInteractionAt: new Date().toISOString(),
          });

          setTimeout(() => {
            refreshProgress();
          }, 500);
        }
      } catch (error) {
        console.error("❌ [CAMINO] Error verifying progress:", error);
      }
    };

    verifyCaminoProgress();
    // ✅ FIX: No incluir activeTasks ni refreshProgress en dependencias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedOnboarding, user?.id, totalProgress, loadingProgress]);

  const handleCompleteTaskStep = async (taskId: string, stepId: string) => {
    if (processingTasks.has(taskId)) return;

    setProcessingTasks((prev) => new Set(prev).add(taskId));

    try {
      const task = tasks.find((t: any) => t.id === taskId);

      // Track step start
      trackEvent({
        eventType: "task_step_started",
        eventData: {},
        taskId,
        agentId: task?.agent_id,
      });

      // Update step in database
      // ✅ Migrado a endpoint NestJS - PATCH /telar/server/task-steps/{id}
      await updateTaskStep(stepId, {
        completionStatus: "completed",
      });

      // Track step completion
      trackEvent({
        eventType: "task_step_completed",
        eventData: {
          taskProgress: task?.progress_percentage || 0,
        },
        taskId,
        agentId: task?.agent_id,
        success: true,
      });

      // Check if all steps are completed
      const allStepsCompleted = task?.steps?.every(
        (s: any) => s.id === stepId || s.completion_status === "completed",
      );

      if (allStepsCompleted) {
        // Use AI to validate task completion
        const validation = await validateTask(task.agent_id, taskId);

        if (validation?.isValid) {
          // Mark task as completed usando datos consistentes
          const completionData = getTaskCompletionData();

          // ✅ Migrado a endpoint NestJS - PATCH /telar/server/agent-tasks/{id}
          await updateAgentTask(taskId, {
            status: completionData.status,
            progressPercentage: completionData.progress_percentage,
            completedAt: completionData.completed_at,
          });

          // ✅ Save deliverable to database if present
          if (validation.deliverable && user) {
            try {
              await createAgentDeliverable({
                userId: user.id,
                taskId: taskId,
                agentId: task.agent_id,
                title: validation.deliverable.title,
                description:
                  validation.deliverable.description ||
                  "Entregable generado por IA",
                content: validation.deliverable.content,
                fileType: validation.deliverable.type || "markdown",
                metadata: {
                  generatedBy: "orchestrator",
                  validationMessage: validation.message,
                  nextSteps: validation.nextSteps || [],
                  generatedAt: new Date().toISOString(),
                },
              });

              toast.success("¡Entregable generado y guardado! 📄");
            } catch (deliverableError) {
              console.error("Error saving deliverable:", deliverableError);
              toast.error("Error al guardar el entregable");
            }
          }

          // Update user progress (XP, achievements)
          // ✅ Migrado a endpoint NestJS - POST /telar/server/user-progress/update
          try {
            await updateUserProgressWithRewards({
              xpGained: 50,
              missionCompleted: true,
              timeSpent: 0,
            });
          } catch (progressError) {
            console.error("Error updating user progress:", progressError);
            // No bloqueamos el flujo si falla la actualización de progreso
          }

          // Track mission completion
          trackEvent({
            eventType: "mission_completed",
            eventData: {
              totalSteps: task?.steps?.length || 0,
              timeSpent: task?.time_spent || 0,
              hasDeliverable: !!validation.deliverable,
              deliverableType: validation.deliverable?.type,
            },
            taskId,
            agentId: task.agent_id,
            success: true,
          });

          toast.success("¡Misión completada! 🎉");
        }
      }

      // Trigger refresh
      EventBus.publish("task.updated", { taskId, stepId });
      await refreshModule("growth");
    } catch (err) {
      console.error("Error completing task step:", err);
      toast.error("Error al completar el paso");
    } finally {
      setProcessingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDownloadDeliverable = (deliverable: any) => {
    // Track deliverable download
    trackEvent({
      eventType: "deliverable_downloaded",
      eventData: {
        deliverableId: deliverable.id,
        fileType: deliverable.file_type,
        hasFile: !!deliverable.file_url,
      },
      agentId: deliverable.agent_id,
    });

    if (deliverable.file_url) {
      window.open(deliverable.file_url, "_blank");
    } else {
      toast.info("Este entregable no tiene archivo descargable");
    }
  };

  // Navigation handlers simplified

  // Handlers for navigation
  const handleAddProduct = () => {
    trackEvent({
      eventType: "feature_used" as any,
      eventData: {
        feature: "product_creation",
        source: "dashboard",
        agent: "inventory-manager",
      },
    });

    // Navigate to integrated product upload wizard
    navigate("/productos/subir");
  };

  const handleViewShop = () => {
    trackEvent({
      eventType: "navigation" as any,
      eventData: { destination: "shop", source: "dashboard" },
    });
    navigate("/mi-tienda");
  };

  const showLoadingScreen =
    (isLoading || isAnalyzing || isGenerating || isTaskValidating) &&
    !loadingTimeout;

  // 🎯 Detectar si los datos críticos están listos para renderizar
  const isDataReady = useMemo(() => {
    // Necesitamos que:
    // 1. Las tareas fijas hayan cargado
    const hasFixedTasksLoaded = !loadingFixed;
    // 2. El progreso unificado esté listo
    const hasProgressLoaded = !loadingProgress;
    // 3. El estado básico del master esté cargado
    const hasMasterStateLoaded = !isLoading;

    return hasFixedTasksLoaded && hasProgressLoaded && hasMasterStateLoaded;
  }, [loadingFixed, loadingProgress, isLoading]);

  // Mostrar skeleton cuando loading terminó pero datos no están listos
  const showSkeleton = !showLoadingScreen && !isDataReady;

  const loadingMessage = isAnalyzing
    ? "Analizando tu contexto con IA..."
    : isGenerating
      ? "Generando tareas personalizadas..."
      : isTaskValidating
        ? "Validando tu progreso..."
        : "Sincronizando tu taller...";

  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div className="w-16 h-16 mx-auto">
            <TelarLoadingAnimation size="lg" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{loadingMessage}</h2>
            <RotatingLoadingPhrases className="text-muted-foreground text-base" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Mostrar skeleton si datos no están listos
  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* pt-24 compensates for fixed header */}

        {/* 1️⃣ Artisan Progress Hero - Mostrar PRIMERO (después del onboarding) */}
        {hasCompletedOnboarding && (
          <motion.div
            key="progress-hero"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ArtisanProgressHero
              userName={
                profile.nombre || user?.user_metadata?.name || "Artesano"
              }
              maturityScores={dynamicMaturityScores}
              totalProgress={totalProgress}
              hasCompletedMaturityTest={hasCompleted}
              unifiedProgress={unifiedProgress}
            />
          </motion.div>
        )}

        {/* User Progress Dashboard */}
        {hasCompletedOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <UserProgressDashboard />
          </motion.div>
        )}

        {/* 2️⃣ Dashboard Action Cards - Estilo Nike Sofisticado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card: Test de Madurez */}
          {!checkingOnboarding && !hasCompleted && !hasInProgress && (
            <DashboardActionCard
              badge={{ label: "Nuevo", variant: "recommended" }}
              icon={<Lightbulb className="w-8 h-8" />}
              category="Evaluación"
              title="Test de Madurez"
              subtitle="Descubre dónde estás y hacia dónde ir"
              metadata={[
                {
                  icon: <Clock className="w-3.5 h-3.5" />,
                  value: "~5 minutos",
                },
                {
                  icon: <BarChart3 className="w-3.5 h-3.5" />,
                  value: "4 áreas clave",
                },
              ]}
              primaryAction={{
                label: "Empezar Evaluación",
                onClick: () => {
                  trackEvent({
                    eventType: "onboarding_started" as any,
                    eventData: { source: "dashboard_action_card" },
                  });
                  navigate("/maturity-calculator?mode=onboarding");
                },
              }}
              status="warning"
            />
          )}

          {/* Card: Continuar Test (In Progress) */}
          {!checkingOnboarding && hasInProgress && !hasCompleted && (
            <DashboardActionCard
              badge={{ label: "En Progreso", variant: "default" }}
              icon={<Target className="w-8 h-8" />}
              category="Evaluación"
              title="Test de Madurez"
              subtitle="Continúa donde lo dejaste"
              progress={{
                current: testTotalAnswered,
                total: MATURITY_TEST_CONFIG.TOTAL_QUESTIONS,
                label: "preguntas",
              }}
              metadata={[
                {
                  icon: <Clock className="w-3.5 h-3.5" />,
                  value: `~${Math.ceil(remainingQuestions * 0.5)} min restantes`,
                },
                {
                  icon: <BarChart3 className="w-3.5 h-3.5" />,
                  value: "4 áreas por evaluar",
                },
              ]}
              primaryAction={{
                label: "Continuar",
                onClick: () => {
                  trackEvent({
                    eventType: "onboarding_resumed" as any,
                    eventData: {
                      source: "dashboard_action_card",
                      progress: testTotalAnswered,
                    },
                  });
                  navigate("/maturity-calculator?mode=continue");
                },
              }}
              status="default"
            />
          )}

          {/* Card: Mi Marca - Cuando ya tiene diagnóstico completo */}
          {(() => {
            const brandEval = (context?.conversationInsights as any)
              ?.brand_evaluation;
            const brandDiagnosis = (context?.conversationInsights as any)
              ?.brand_diagnosis;

            // Mostrar cuando YA tiene diagnóstico
            if (brandDiagnosis?.average_score) {
              const score = brandDiagnosis.average_score;
              const scoreLabel =
                score >= 4 ? "Excelente" : score >= 3 ? "Buena" : "Mejorable";

              return (
                <DashboardActionCard
                  badge={{
                    label: `${score.toFixed(1)}/5`,
                    variant: score >= 3 ? "success" : "warning",
                  }}
                  icon={<Palette className="w-8 h-8" />}
                  category="Identidad"
                  title="Mi Marca"
                  subtitle={`Identidad ${scoreLabel}`}
                  metadata={[
                    {
                      icon: <Edit className="w-3.5 h-3.5" />,
                      value: "Logo, colores, claim",
                    },
                    {
                      icon: <Award className="w-3.5 h-3.5" />,
                      value: "Diagnóstico completo",
                    },
                  ]}
                  primaryAction={{
                    label: "Editar Marca",
                    onClick: () => navigate("/dashboard/brand-wizard"),
                  }}
                  secondaryAction={{
                    label: "Ver Diagnóstico",
                    onClick: () => navigate("/dashboard/brand-wizard"),
                  }}
                  status={score >= 3 ? "success" : "warning"}
                />
              );
            }

            // Mostrar cuando tiene logo y claim pero NO tiene diagnóstico
            if (brandEval?.logo_url && brandEval?.claim && !brandDiagnosis) {
              return (
                <DashboardActionCard
                  badge={{ label: "Disponible", variant: "recommended" }}
                  icon={<Search className="w-8 h-8" />}
                  category="Identidad"
                  title="Diagnóstico de Marca"
                  subtitle="Análisis IA de tu identidad visual"
                  metadata={[
                    {
                      icon: <Palette className="w-3.5 h-3.5" />,
                      value: "Logo cargado",
                    },
                    {
                      icon: <Edit className="w-3.5 h-3.5" />,
                      value: "Claim definido",
                    },
                  ]}
                  primaryAction={{
                    label: "Iniciar Diagnóstico",
                    onClick: () => {
                      trackEvent({
                        eventType: "feature_started" as any,
                        eventData: {
                          feature: "brand_diagnosis",
                          source: "dashboard_action_card",
                          has_brand_evaluation: true,
                        },
                      });
                      navigate("/dashboard/brand-wizard");
                    },
                  }}
                  status="info"
                />
              );
            }

            // Mostrar cuando NO tiene nada de marca todavía
            if (!brandEval?.logo_url && !brandDiagnosis) {
              return (
                <DashboardActionCard
                  badge={{ label: "Pendiente", variant: "default" }}
                  icon={<Palette className="w-8 h-8" />}
                  category="Identidad"
                  title="Mi Marca"
                  subtitle="Define tu identidad visual"
                  metadata={[
                    {
                      icon: <Palette className="w-3.5 h-3.5" />,
                      value: "Sube tu logo",
                    },
                    {
                      icon: <Sparkles className="w-3.5 h-3.5" />,
                      value: "IA genera colores",
                    },
                  ]}
                  primaryAction={{
                    label: "Crear Marca",
                    onClick: () => navigate("/dashboard/brand-wizard"),
                  }}
                  status="default"
                />
              );
            }

            return null;
          })()}

          {/* Card: Estado de Tienda */}
          {(() => {
            // FASE 1: Usar conteo directo como fallback si inventory está vacío
            const productCount =
              directProductCount ?? (inventory.productos?.length || 0);
            const hasActiveShop = shop.has_shop && shop.published;
            const shopName = shop.shop_name || "tu tienda";
            const publishedCount =
              inventory.productos?.filter((p: any) => p.active)?.length || 0;
            const draftCount = productCount - publishedCount;

            // Caso 1: Tienda activa con productos
            if (hasActiveShop && productCount > 0) {
              return (
                <DashboardActionCard
                  badge={{
                    label: `${productCount} productos`,
                    variant: "success",
                  }}
                  actionIcon={
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  }
                  icon={<Store className="w-8 h-8" />}
                  category="Tu Tienda"
                  title={shopName}
                  subtitle="Tu catálogo está creciendo"
                  metadata={[
                    {
                      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                      value: `${publishedCount} publicados`,
                    },
                    {
                      icon: <Package className="w-3.5 h-3.5" />,
                      value: `${draftCount} borradores`,
                    },
                  ]}
                  primaryAction={{
                    label: "Agregar Más",
                    onClick: handleAddProduct,
                  }}
                  secondaryAction={{
                    label: "Ver Inventario",
                    onClick: () => navigate("/dashboard/inventory"),
                  }}
                  status="success"
                />
              );
            }

            // Caso 2: Tienda activa pero vacía
            if (hasActiveShop && productCount === 0) {
              return (
                <DashboardActionCard
                  badge={{ label: "Sin Productos", variant: "warning" }}
                  icon={<ShoppingBag className="w-8 h-8" />}
                  category="Tu Tienda"
                  title={shopName}
                  subtitle="Tu escaparate está listo"
                  metadata={[
                    {
                      icon: <Store className="w-3.5 h-3.5" />,
                      value: "Publicada",
                    },
                    {
                      icon: <Package className="w-3.5 h-3.5" />,
                      value: "0 productos",
                    },
                  ]}
                  primaryAction={{
                    label: "Subir Producto",
                    onClick: handleAddProduct,
                  }}
                  secondaryAction={{
                    label: "Ver Tienda",
                    onClick: () => {
                      const slug = (shop as any).shop_slug || shop.url;
                      navigate(`/tienda/${slug}`);
                    },
                  }}
                  status="warning"
                />
              );
            }

            // Caso 3: Tiene productos pero no tienda
            if (!shop.has_shop && productCount > 0) {
              return (
                <DashboardActionCard
                  badge={{ label: "Listo para Publicar", variant: "success" }}
                  icon={<Sparkles className="w-8 h-8" />}
                  category="Tu Catálogo"
                  title={`${productCount} productos listos`}
                  subtitle="Crea tu tienda para venderlos"
                  metadata={[
                    {
                      icon: <Package className="w-3.5 h-3.5" />,
                      value: `${productCount} en inventario`,
                    },
                    {
                      icon: <Store className="w-3.5 h-3.5" />,
                      value: "Sin tienda aún",
                    },
                  ]}
                  primaryAction={{
                    label: "Crear Tienda",
                    onClick: navigateToShop,
                  }}
                  status="success"
                />
              );
            }

            return null;
          })()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Fixed Tasks Section - Priority Missions */}
            {!loadingFixed && fixedTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <Target className="w-6 h-6 text-primary" />
                    🎯 Misiones Progresivas
                  </h2>
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-sm">
                    {fixedTasks.length} disponibles
                  </Badge>
                </div>

                <div className="space-y-4">
                  {fixedTasks.slice(0, 3).map((task: any) => {
                    const transformedTask = transformFixedTask(task);
                    return (
                      <SimpleMissionCard key={task.id} {...transformedTask} />
                    );
                  })}
                  {fixedTasks.length > 3 && (
                    <Card className="neumorphic p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        +{fixedTasks.length - 3} misiones progresivas más
                      </p>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}

            {/* Discover Missions Button */}
            {!loadingFixed &&
              fixedTasks.length === 0 &&
              generatedTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="neumorphic p-8 text-center">
                    <Compass className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      ¡Descubre tus próximos pasos!
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Analiza tu estado actual y recibe misiones personalizadas
                      para hacer crecer tu negocio artesanal
                    </p>
                    <Button
                      onClick={discoverMissions}
                      disabled={isDiscovering}
                      size="lg"
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      {isDiscovering ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Descubrir Misiones
                        </>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              )}

            {/* Active Missions (Generated Tasks) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Lightbulb className="w-6 h-6 text-accent" />
                  💡 Sugerencias IA
                </h2>
                <Badge className="bg-accent/10 text-accent-foreground border-accent/30 font-semibold shadow-sm">
                  {activeTasks.length} activas
                </Badge>
              </div>

              <div className="space-y-4">
                {activeTasks.length > 0 ? (
                  <>
                    {activeTasks.slice(0, 3).map((task: any, index: number) => (
                      <Card key={task.id} className="p-4">
                        <h4 className="font-semibold mb-2">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {task.description}
                        </p>
                        <Button
                          onClick={() =>
                            navigate("/dashboard/tasks", {
                              state: { selectedTaskId: task.id },
                            })
                          }
                          size="sm"
                        >
                          Ver Tarea
                        </Button>
                      </Card>
                    ))}
                    {activeTasks.length > 3 && (
                      <Card className="p-4 text-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40 transition-all">
                        <Button
                          onClick={() => navigate("/dashboard/tasks")}
                          variant="ghost"
                          className="w-full text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Ver todas las {activeTasks.length} misiones
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="p-8 text-center bg-card rounded-2xl shadow-float hover:shadow-hover transition-all duration-300">
                    {hasCompletedOnboarding ? (
                      <>
                        <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="text-foreground font-semibold mb-2">
                          ¡Estás listo para comenzar!
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {hasCompleted
                            ? "Tus misiones se generarán pronto basadas en tu evaluación completa"
                            : "Continúa el Test de Madurez para recibir tareas personalizadas"}
                        </p>
                        {!hasCompleted && (
                          <Button
                            onClick={() =>
                              navigate("/maturity-calculator?mode=continue")
                            }
                            className="bg-gradient-primary hover:opacity-90"
                          >
                            Continuar Test de Madurez
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">
                          {t.noMissions}
                        </p>
                      </>
                    )}
                  </Card>
                )}
              </div>
            </motion.div>

            {/* Deliverables */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Download className="w-6 h-6 text-primary" />
                  {t.deliverables}
                </h2>
                {deliverables.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard/deliverables")}
                    className="hover:bg-primary/10 text-foreground"
                  >
                    {t.viewAll}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliverables.length > 0 ? (
                  deliverables.map((deliverable, index) => (
                    <DeliverableCard
                      key={deliverable.id}
                      id={deliverable.id}
                      title={deliverable.title}
                      description={deliverable.description || ""}
                      type={deliverable.file_type as any}
                      agentId={deliverable.agent_id}
                      agentName={deliverable.agent_id}
                      createdAt={new Date(deliverable.created_at)}
                      downloadUrl={deliverable.file_url}
                      onDownload={() => handleDownloadDeliverable(deliverable)}
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center md:col-span-2 bg-card rounded-2xl shadow-float hover:shadow-hover transition-all duration-300">
                    <Lightbulb className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      {t.noDeliverables}
                    </p>
                  </Card>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shop Sales Mini Card */}
            <ShopSalesMiniCard />

            {/* Rewards Panel */}
            {userStats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <RewardsPanel
                  stats={userStats}
                  language={language as "es" | "en"}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Coordinator Chat Sidebar */}
      <AnimatePresence>
        {isChatExpanded && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsChatExpanded(false)}
            />

            {/* Chat Sidebar */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-2xl z-50 overflow-hidden"
            >
              <CoordinatorChatSidebar />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 hover:bg-destructive/10 hover:text-destructive z-10"
                onClick={() => setIsChatExpanded(false)}
              >
                ×
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Master Agent Button */}
      <FloatingMasterAgent
        language={language as "es" | "en"}
        maturityScores={
          maturityScores || {
            ideaValidation: 0,
            userExperience: 0,
            marketFit: 0,
            monetization: 0,
          }
        }
        activeTasksCount={activeTasks.length}
        completedTasksCount={
          tasks.filter((t: any) => t.status === "completed").length
        }
        userActivityDays={progress?.currentStreak || 0}
        onStartChat={() => {
          trackEvent({
            eventType: "feature_used" as any,
            eventData: {
              feature: "coordinator_chat",
              source: "floating_button",
            },
          });
          setIsChatExpanded(true);
        }}
        onViewProgress={() => {
          trackEvent({
            eventType: "navigation" as any,
            eventData: { destination: "tasks_view", source: "floating_agent" },
          });
          navigate("/dashboard/tasks");
        }}
        onHelp={() => {
          trackEvent({
            eventType: "navigation" as any,
            eventData: { destination: "help", source: "floating_agent" },
          });
          navigate("/help");
        }}
      />

      {/* Modal para forzar completar perfil */}
      <ForceCompleteProfileModal
        isOpen={showProfileModal}
        missingFields={missingFields}
        currentData={currentData}
        onComplete={() => {
          setShowProfileModal(false);
          refreshProfileCompleteness();
        }}
      />
    </div>
  );
};
