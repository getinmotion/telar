import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user';
import { useToast } from '@/hooks/use-toast';
import { useAgentTasks } from './useAgentTasks';
import { useTaskLimits } from './useTaskLimits';
import { useTaskGenerationControl } from './useTaskGenerationControl';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { getUserProgressByUserId, upsertUserProgress } from '@/services/userProgress.actions';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { analyzeAndGenerateTasks, invokeMasterCoordinator } from '@/services/aiMasterCoordinator.actions';
import { getMasterCoordinatorContextByUserId, updateMasterCoordinatorContextByUserId } from '@/services/masterCoordinatorContext.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';
import { getProductsByUserId } from '@/services/products.actions';
import { updateAgentTask, createAgentTask } from '@/services/agentTasks.actions';
import { getAgentDeliverablesByUserId } from '@/services/agentDeliverables.actions';
import { getTaskStepsByTaskId } from '@/services/taskSteps.actions';

export interface CoordinatorTask {
  id: string;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  priority: number;
  relevance: 'high' | 'medium' | 'low';
  estimatedTime: string;
  category: string;
  isUnlocked: boolean;
  prerequisiteTasks: string[];
  steps: TaskStep[];
}

export interface TaskStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  validationRequired: boolean;
  contextualHelp: string;
}

export interface TaskDeliverable {
  id: string;
  taskId: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'doc' | 'txt' | 'table';
  content?: any;
  downloadUrl?: string;
  createdAt: string;
  agentId: string;
}

export const useMasterCoordinator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, context } = useUnifiedUserData();
  const { tasks, createTask, updateTask, deleteTask, deleteAllTasks } = useAgentTasks();
  const { isAtLimit, getLimitMessage } = useTaskLimits(tasks);
  const { allowAutoGeneration } = useTaskGenerationControl();
  const { trackEvent } = useAnalyticsTracking();

  // Extract data from unified context
  const currentScores = context.taskGenerationContext?.maturityScores || null;
  const profileData = context.businessProfile || null;
  const businessProfile = profile || null;

  const [coordinatorTasks, setCoordinatorTasks] = useState<CoordinatorTask[]>([]);
  const [currentPath, setCurrentPath] = useState<CoordinatorTask[]>([]);
  const [deliverables, setDeliverables] = useState<TaskDeliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // FASE 1: DISABLED - Using fixed tasks instead
  const analyzeProfileAndGenerateTasks = useCallback(async () => {

    if (!user || loading) {
      console.warn('No user available or already generating tasks', { user: !!user, loading });
      return;
    }

    // Verificar límite de tareas activas
    if (isAtLimit) {
      console.warn('Active tasks limit reached');
      toast({
        title: "Límite de Tareas Alcanzado",
        description: getLimitMessage('es'),
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // 🛡️ CRÍTICO: Garantizar que user_progress existe ANTES de cualquier cosa
      await upsertUserProgress(user.id, {
        experiencePoints: 0,
        level: 1,
        completedMissions: 0,
        nextLevelXp: 100,
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0
      }).catch((progressError) => {
        console.error('Failed to create user_progress:', progressError);
        throw new Error('No se pudo inicializar el progreso del usuario');
      });

      // ✅ Migrado a NestJS - Obtener TODOS los datos antes de llamar al coordinador
      const fullProfile = await getUserProfileByUserId(user.id);

      // ✅ Migrado a NestJS - GET /artisan-shops/user/{user_id}
      const shopData = await getArtisanShopByUserId(user.id);

      // ✅ Migrado a NestJS - GET /products/user/{user_id}
      const productsData = shopData ? await getProductsByUserId(user.id) : [];

      // ✅ Migrado a endpoint NestJS - POST /ai/master-coordinator
      const data = await analyzeAndGenerateTasks({
        userId: user.id,
        businessDescription: businessProfile?.businessDescription || shopData?.description,
        maturityScores: currentScores ? {
          ideaValidation: currentScores.ideaValidation || 0,
          userExperience: currentScores.userExperience || 0,
          marketFit: currentScores.marketFit || 0,
          monetization: currentScores.monetization || 0
        } : undefined,
        userProfile: {
          ...profileData,
          ...fullProfile,
          shop: shopData || null,
          products_count: productsData?.length || 0,
          has_shop: !!shopData
        },
        // businessProfile: businessProfile || null
      });

      if (data?.tasks && data.tasks.length > 0) {

        // ✅ Migrado a endpoint NestJS - Actualizar master_coordinator_context
        const existingContext = await getMasterCoordinatorContextByUserId(user.id);

        if (existingContext) {
          const currentSnapshot = existingContext.contextSnapshot as any || {};
          await updateMasterCoordinatorContextByUserId(user.id, {
            contextSnapshot: {
              ...currentSnapshot,
              last_generated_tasks: data.tasks,
              tasks_generated_at: new Date().toISOString()
            }
          });
        }

        toast({
          title: "¡Tareas Inteligentes Generadas!",
          description: `He creado ${data.tasks.length} tareas específicas basadas en tu perfil completo.`,
        });

        // Track successful task generation
        // trackEvent({
        //   eventType: 'tasks_generated',
        //   eventData: {
        //     tasksCount: data.tasks.length,
        //     hasMaturityScores: !!currentScores,
        //     hasBusinessProfile: !!businessProfile
        //   },
        //   success: true
        // });

        return data.tasks;
      } else {
        console.warn('⚠️ Master Coordinator: No tasks returned from edge function');
      }
    } catch (error) {
      console.error('❌ [MasterCoordinator] Error generating tasks:', error);
      console.error('❌ [MasterCoordinator] Error stack:', (error as Error)?.stack);
      console.error('❌ [MasterCoordinator] Error details:', JSON.stringify(error, null, 2));

      // Track task generation failure
      trackEvent({
        eventType: 'tasks_generation_failed',
        eventData: {
          errorMessage: (error as Error)?.message,
          hasMaturityScores: !!currentScores,
          hasBusinessProfile: !!businessProfile
        },
        success: false
      });

      toast({
        title: "Error al Generar Tareas",
        description: "Hubo un problema generando tus tareas personalizadas. Intenta de nuevo.",
        variant: "destructive"
      });
      throw error; // Re-throw para que el caller pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [user, profileData, currentScores, businessProfile, toast, isAtLimit, getLimitMessage]);

  // FASE 2: Generar preguntas inteligentes contextuales
  const generateIntelligentQuestions = useCallback(async () => {
    if (!user?.id) return [];

    try {
      // ✅ Migrado a NestJS - POST /ai/master-coordinator
      const data = await invokeMasterCoordinator<{ questions: any[] }>({
        action: 'generate_intelligent_questions',
        userId: user.id,
        userProfile: profileData || null,
        maturityScores: currentScores || null,
        businessProfile: businessProfile || null
      });

      if (data?.questions) {
        return data.questions;
      }
      return [];
    } catch (error) {
      console.error('❌ Error generating intelligent questions:', error);
      return [];
    }
  }, [user?.id, profileData, currentScores, businessProfile]);

  // Convertir tareas normales a tareas del coordinador con lógica de desbloqueo
  const transformToCoordinatorTasks = useMemo(() => {
    // Validaciones para evitar errores de variables no inicializadas
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return [];
    }

    try {
      const validTasks = tasks.filter(task => task && task.id);

      if (validTasks.length === 0) {
        return [];
      }

      const sortedTasks = validTasks.sort((a, b) => {
        const relevanceOrder = { high: 3, medium: 2, low: 1 };
        const aRelevance = relevanceOrder[a.relevance as keyof typeof relevanceOrder] || 2;
        const bRelevance = relevanceOrder[b.relevance as keyof typeof relevanceOrder] || 2;

        if (aRelevance !== bRelevance) {
          return bRelevance - aRelevance;
        }
        return (a.priority || 1) - (b.priority || 1);
      });

      return sortedTasks.slice(0, 15).map((task, index) => {
        if (!task || !task.id) {
          console.warn('🚫 useMasterCoordinator: Invalid task encountered:', task);
          return null;
        }

        return {
          id: task.id,
          title: task.title || 'Tarea sin título',
          description: task.description || '',
          agentId: task.agent_id || 'general',
          agentName: getAgentName(task.agent_id || 'general'),
          priority: task.priority || 1,
          relevance: task.relevance || 'medium',
          estimatedTime: getEstimatedTime(task.title || ''),
          category: getTaskCategory(task.agent_id || 'general'),
          isUnlocked: index === 0 || sortedTasks.slice(0, index).some(t => t.status === 'completed'),
          prerequisiteTasks: index > 0 && sortedTasks[index - 1] ? [sortedTasks[index - 1].id] : [],
          steps: generateStepsForTask(task)
        };
      }).filter(Boolean); // Remove any null entries
    } catch (error) {
      console.error('❌ Error transforming tasks:', error);
      return [];
    }
  }, [tasks]);

  // Generate initial tasks only when auto-generation is allowed (after maturity test)
  const generateInitialTasks = useCallback(async () => {
    if (!allowAutoGeneration || !user?.id || isInitialized || loading || tasks.length > 0) {
      return;
    }

    try {
      await analyzeProfileAndGenerateTasks();
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ Error in initial task generation:', error);
    }
  }, [allowAutoGeneration, user?.id, isInitialized, loading, tasks.length, analyzeProfileAndGenerateTasks]);

  // Auto-initialize only when conditions are met
  useEffect(() => {
    if (allowAutoGeneration && user?.id && !isInitialized && tasks.length === 0 && !loading) {
      // Debounce para evitar múltiples llamadas
      const timeoutId = setTimeout(generateInitialTasks, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [allowAutoGeneration, generateInitialTasks]);

  // Actualizar tareas del coordinador cuando cambien las tareas normales
  useEffect(() => {
    setCoordinatorTasks(transformToCoordinatorTasks);
  }, [transformToCoordinatorTasks]);

  // Cargar entregables del usuario
  useEffect(() => {
    if (user) {
      loadDeliverables();
    }
  }, [user]);

  // ✅ MIGRATED: GET /agent-deliverables/user/:userId
  const loadDeliverables = async () => {
    if (!user) return;

    try {
      const data = await getAgentDeliverablesByUserId(user.id);

      // Transform NestJS camelCase response to frontend format
      const transformedDeliverables: TaskDeliverable[] = data.map((item: any) => ({
        id: item.id,
        taskId: item.taskId,
        title: item.title,
        description: item.description || '',
        fileType: item.fileType as 'pdf' | 'doc' | 'txt' | 'table',
        content: item.content,
        downloadUrl: item.fileUrl,
        createdAt: item.createdAt,
        agentId: item.agentId
      }));

      setDeliverables(transformedDeliverables);
    } catch (error) {
      console.error('Error loading deliverables:', error);
    }
  };

  const regenerateTasksFromProfile = async () => {
    setLoading(true);
    setIsInitialized(false);
    await analyzeProfileAndGenerateTasks();
    setIsInitialized(true);
    setLoading(false);
  };

  // 🔥 NUEVO: Función evolveTasks para auto-generación inteligente
  const evolveTasks = useCallback(async () => {
    if (!user || loading) {
      console.warn('🚫 evolveTasks: No user or already loading');
      return;
    }

    // Verificar límite de tareas activas
    if (isAtLimit) {
      console.warn('🚫 evolveTasks: Active tasks limit reached');
      toast({
        title: "Límite de Tareas Alcanzado",
        description: getLimitMessage('es'),
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Get recent completed tasks
      const recentCompleted = tasks
        .filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
        .slice(0, 10);

      // ✅ Migrado a NestJS - POST /ai/master-coordinator
      const data = await invokeMasterCoordinator<{ suggestions: any[] }>({
        action: 'evolve_tasks',
        userId: user.id,
        completedTasks: recentCompleted.map(t => ({
          id: t.id,
          title: t.title,
          agent_id: t.agent_id
        })),
        maturityScores: currentScores || null,
        userProfile: profileData || null
      });

      if (data?.suggestions && data.suggestions.length > 0) {
        toast({
          title: "🎯 Nuevas Misiones Generadas",
          description: `${data.suggestions.length} tareas personalizadas basadas en tu progreso`,
        });

        return data.suggestions;
      } else {
        console.warn('⚠️ evolveTasks: No suggestions returned');
        toast({
          title: "Sin Nuevas Tareas",
          description: "Continúa con tus tareas actuales",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('❌ evolveTasks: Error:', error);
      toast({
        title: "Error al Generar Tareas",
        description: "No se pudieron generar nuevas tareas. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, tasks, currentScores, profileData, toast, isAtLimit, getLimitMessage, loading]);

  const startTaskJourney = async (taskId: string) => {

    // First check if this is a default task or coordinator task
    const coordinatorTask = coordinatorTasks.find(t => t.id === taskId);
    const regularTask = tasks.find(t => t.id === taskId);

    // ✅ MIGRATED: POST /agent-tasks
    // For default tasks, create them first
    if (taskId.startsWith('default-') && !regularTask) {
      try {
        const defaultTask = coordinatorTask;
        if (!defaultTask) {
          throw new Error('Default task not found');
        }

        const newTask = await createAgentTask({
          userId: user?.id!,
          agentId: defaultTask.agentId,
          title: defaultTask.title,
          description: defaultTask.description,
          relevance: defaultTask.relevance,
          priority: defaultTask.priority,
          status: 'in_progress'
        });

        // Update the taskId to the newly created task
        taskId = newTask.id;

      } catch (error) {
        console.error('❌ Error creating task:', error);
        toast({
          title: "Error",
          description: "No se pudo crear la tarea. Inténtalo de nuevo.",
          variant: "destructive"
        });
        return false;
      }
    }

    const task = coordinatorTask || regularTask;
    if (!task) {
      console.error('❌ Task not found:', taskId);
      return false;
    }

    try {
      // ✅ MIGRATED: GET /task-steps/task/:taskId
      // Check if steps already exist for this task
      const existingSteps = await getTaskStepsByTaskId(taskId);

      // Create steps if they don't exist
      if (!existingSteps || existingSteps.length === 0) {
        // ✅ Migrado a NestJS - POST /ai/master-coordinator
        await invokeMasterCoordinator({
          action: 'create_task_steps',
          taskId,
          taskData: task,
          profileContext: {
            profileData: profileData || null,
            businessProfile: businessProfile || null
          }
        });
      }

      // ✅ Migrado a NestJS - PATCH /agent-tasks/{id}
      try {
        await updateAgentTask(taskId, {
          status: 'in_progress'
        });
      } catch (updateError) {
        console.warn('⚠️ Could not update task status:', updateError);
        // Don't fail the entire operation for this
      }

      return true;
    } catch (error) {
      console.error('❌ Error starting task journey:', error);
      return false;
    }
  };

  const completeTaskStep = async (taskId: string, stepId: string, stepData: any) => {
    try {

      // ✅ Migrado a NestJS - POST /ai/master-coordinator
      await invokeMasterCoordinator({
        action: 'complete_step',
        taskId,
        stepId,
        stepData,
        userId: user?.id
      });

      // Actualizar el paso en el estado local
      setCoordinatorTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            steps: task.steps.map(step =>
              step.id === stepId
                ? { ...step, isCompleted: true }
                : step
            )
          };
        }
        return task;
      }));

      // Si todos los pasos están completos, generar entregable
      const task = coordinatorTasks.find(t => t.id === taskId);
      const allStepsCompleted = task?.steps.every(step => step.isCompleted || step.id === stepId);

      if (allStepsCompleted) {
        await generateTaskDeliverable(taskId);
      }

      return true;
    } catch (error) {
      console.error('Error completing step:', error);
      return false;
    }
  };

  const generateTaskDeliverable = async (taskId: string) => {
    try {

      // ✅ Migrado a NestJS - POST /ai/master-coordinator
      await invokeMasterCoordinator({
        action: 'generate_deliverable',
        taskId,
        userId: user?.id
      });

      await loadDeliverables();

      toast({
        title: "¡Entregable Generado!",
        description: "Tu documento está listo en la sección 'Mis Avances'",
      });

    } catch (error) {
      console.error('Error generating deliverable:', error);
    }
  };

  const getNextUnlockedTask = () => {
    return coordinatorTasks.find(task => task.isUnlocked &&
      tasks.find(t => t.id === task.id)?.status === 'pending');
  };

  // FASE 4: Mensaje inteligente del coordinador
  const getCoordinatorMessage = () => {
    try {
      const nextTask = getNextUnlockedTask();
      const completedCount = tasks.filter(t => t.status === 'completed').length;
      const rawName = businessProfile?.brandName ?? businessProfile?.businessDescription;
      const businessName = typeof rawName === 'string' && rawName.trim().length > 0 ? rawName : 'tu negocio';

      let result;
      if (!nextTask && completedCount === 0) {
        result = {
          type: 'welcome',
          message: `¡Hola! He analizado tu perfil completo y generé tareas específicas para ${businessName}. Estas son las recomendaciones exactas que necesitas para hacer crecer tu emprendimiento. ¡Vamos paso a paso!`
        };
      } else if (nextTask) {
        result = {
          type: 'guidance',
          message: `Perfecto, tu siguiente misión para ${businessName} es: "${nextTask.title}". Haz clic en "Empezar ahora" y te guiaré paso a paso con detalles específicos.`,
          taskId: nextTask.id
        };
      } else {
        result = {
          type: 'progress',
          message: `¡Increíble! Has completado ${completedCount} tareas para ${businessName}. Estás construyendo algo realmente sólido. ¿Quieres que analice tu progreso y genere las siguientes recomendaciones?`
        };
      }

      return result;
    } catch (error) {
      console.error('❌ Error in getCoordinatorMessage:', error);
      return { type: 'error', message: 'Analyzing your business profile...' };
    }
  };

  // Helper functions
  const getAgentName = (agentId: string) => {
    const agentNames: Record<string, string> = {
      'pricing-analyst': 'Especialista en Precios',
      'market-strategist': 'Estratega de Mercado',
      'ux-designer': 'Diseñador UX',
      'business-advisor': 'Asesor de Negocios'
    };
    return agentNames[agentId] || 'Especialista';
  };

  const getEstimatedTime = (title: string) => {
    if (title.includes('precio') || title.includes('costo')) return '30-45 min';
    if (title.includes('estrategia') || title.includes('plan')) return '1-2 horas';
    if (title.includes('diseño') || title.includes('interfaz')) return '45 min - 1 hora';
    return '30-60 min';
  };

  const getTaskCategory = (agentId: string) => {
    const categories: Record<string, string> = {
      'pricing-analyst': 'Monetización',
      'market-strategist': 'Marketing',
      'ux-designer': 'Experiencia de Usuario',
      'business-advisor': 'Estrategia'
    };
    return categories[agentId] || 'General';
  };

  const generateStepsForTask = (task: any): TaskStep[] => {
    // Generate specific steps based on task type and agent
    const agentId = task.agent_id || 'general';
    const title = (task.title || '').toLowerCase();

    // Pricing-related tasks
    if (agentId === 'pricing-analyst' || title.includes('precio') || title.includes('costo')) {
      return [
        {
          id: `${task.id}-step-1`,
          stepNumber: 1,
          title: 'Calcular costos de materiales',
          description: 'Identificar y calcular todos los costos de materiales y suministros',
          isCompleted: false,
          isLocked: false,
          validationRequired: true,
          contextualHelp: 'Lista todos los materiales que usas y su costo unitario.'
        },
        {
          id: `${task.id}-step-2`,
          stepNumber: 2,
          title: 'Determinar tiempo de producción',
          description: 'Calcular horas de trabajo y valor por hora',
          isCompleted: false,
          isLocked: true,
          validationRequired: true,
          contextualHelp: 'Calcula cuántas horas toma crear cada producto y asigna un valor a tu tiempo.'
        },
        {
          id: `${task.id}-step-3`,
          stepNumber: 3,
          title: 'Definir precio final',
          description: 'Establecer precio considerando costos, margen y mercado',
          isCompleted: false,
          isLocked: true,
          validationRequired: true,
          contextualHelp: 'Suma costos + mano de obra + margen deseado, y compara con precios del mercado.'
        }
      ];
    }

    // Market strategy tasks
    if (agentId === 'market-strategist' || title.includes('mercado') || title.includes('cliente')) {
      return [
        {
          id: `${task.id}-step-1`,
          stepNumber: 1,
          title: 'Definir cliente ideal',
          description: 'Identificar características del cliente objetivo',
          isCompleted: false,
          isLocked: false,
          validationRequired: true,
          contextualHelp: '¿Quién compraría tus productos? Define edad, intereses y necesidades.'
        },
        {
          id: `${task.id}-step-2`,
          stepNumber: 2,
          title: 'Analizar competencia',
          description: 'Investigar otros artesanos y sus ofertas',
          isCompleted: false,
          isLocked: true,
          validationRequired: true,
          contextualHelp: 'Busca 3-5 artesanos similares. ¿Qué hacen bien? ¿Cómo puedes diferenciarte?'
        },
        {
          id: `${task.id}-step-3`,
          stepNumber: 3,
          title: 'Crear propuesta de valor',
          description: 'Definir qué hace único tu negocio',
          isCompleted: false,
          isLocked: true,
          validationRequired: true,
          contextualHelp: 'Resume en una frase: ¿Por qué alguien debería comprar TUS productos?'
        }
      ];
    }

    // UX/Design tasks
    if (agentId === 'ux-designer' || title.includes('diseño') || title.includes('tienda')) {
      return [
        {
          id: `${task.id}-step-1`,
          stepNumber: 1,
          title: 'Definir identidad visual',
          description: 'Seleccionar colores, logo y estilo',
          isCompleted: false,
          isLocked: false,
          validationRequired: true,
          contextualHelp: 'Elige 2-3 colores que representen tu marca y crea o actualiza tu logo.'
        },
        {
          id: `${task.id}-step-2`,
          stepNumber: 2,
          title: 'Preparar fotos de productos',
          description: 'Tomar fotos profesionales de calidad',
          isCompleted: false,
          isLocked: true,
          validationRequired: true,
          contextualHelp: 'Usa buena luz natural, fondo limpio y muestra detalles de cada producto.'
        },
        {
          id: `${task.id}-step-3`,
          stepNumber: 3,
          title: 'Organizar catálogo',
          description: 'Estructurar productos y categorías',
          isCompleted: false,
          isLocked: true,
          validationRequired: true,
          contextualHelp: 'Agrupa productos por categorías lógicas y escribe descripciones claras.'
        }
      ];
    }

    // Default generic steps
    return [
      {
        id: `${task.id}-step-1`,
        stepNumber: 1,
        title: 'Recopilar información',
        description: 'Reunir datos y recursos necesarios',
        isCompleted: false,
        isLocked: false,
        validationRequired: false,
        contextualHelp: 'Comienza identificando qué necesitas para completar esta tarea.'
      },
      {
        id: `${task.id}-step-2`,
        stepNumber: 2,
        title: 'Ejecutar acción principal',
        description: 'Desarrollar la tarea paso a paso',
        isCompleted: false,
        isLocked: true,
        validationRequired: true,
        contextualHelp: 'Trabaja en cada elemento con calma y atención al detalle.'
      },
      {
        id: `${task.id}-step-3`,
        stepNumber: 3,
        title: 'Revisar y documentar',
        description: 'Verificar resultados y guardar avances',
        isCompleted: false,
        isLocked: true,
        validationRequired: true,
        contextualHelp: 'Revisa que todo esté completo y guarda tu trabajo.'
      }
    ];
  };

  return {
    coordinatorTasks,
    currentPath,
    deliverables,
    loading,
    coordinatorMessage: getCoordinatorMessage(),
    nextUnlockedTask: getNextUnlockedTask(),
    regenerateTasksFromProfile,
    analyzeProfileAndGenerateTasks,
    generateInitialTasks,
    generateIntelligentQuestions,
    evolveTasks,
    startTaskJourney,
    completeTaskStep,
    generateTaskDeliverable,
    loadDeliverables
  };
};