import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { OpenAIService } from './openai.service';
import {
  AgentTask,
  TaskRelevance,
  TaskStatus,
} from '../../agent-tasks/entities/agent-task.entity';
import { TaskStep } from '../../task-steps/entities/task-step.entity';
import { AgentDeliverable } from '../../agent-deliverables/entities/agent-deliverable.entity';
import { UserProfile } from '../../user-profiles/entities/user-profile.entity';
import { UserMaturityScore } from '../../user-maturity-scores/entities/user-maturity-score.entity';
import { UserMasterContext } from '../../user-master-context/entities/user-master-context.entity';
import {
  MasterCoordinatorDto,
  MasterCoordinatorAction,
} from '../dto/master-coordinator.dto';
import {
  MaturityScores,
  TaskData,
  UserProfileData,
  TaskSuggestion,
  AITaskSuggestion,
  BrandAnalysis,
  IntelligentQuestion,
} from '../types/master-coordinator.types';

// FASE 1: WHITELIST DE AGENTES FUNCIONALES
const ALLOWED_AGENTS = [
  'growth',
  'inventory',
  'digital-presence',
  'brand',
] as const;

type AllowedAgent = (typeof ALLOWED_AGENTS)[number];

@Injectable()
export class MasterCoordinatorService {
  private readonly logger = new Logger(MasterCoordinatorService.name);

  constructor(
    private readonly openAIService: OpenAIService,
    @Inject('AGENT_TASKS_REPOSITORY')
    private readonly agentTasksRepository: Repository<AgentTask>,
    @Inject('TASK_STEPS_REPOSITORY')
    private readonly taskStepsRepository: Repository<TaskStep>,
    @Inject('AGENT_DELIVERABLES_REPOSITORY')
    private readonly agentDeliverablesRepository: Repository<AgentDeliverable>,
    @Inject('USER_PROFILES_REPOSITORY')
    private readonly userProfilesRepository: Repository<UserProfile>,
    @Inject('USER_MATURITY_SCORES_REPOSITORY')
    private readonly userMaturityScoresRepository: Repository<UserMaturityScore>,
    @Inject('USER_MASTER_CONTEXT_REPOSITORY')
    private readonly userMasterContextRepository: Repository<UserMasterContext>,
  ) {}

  /**
   * Validar si un agente está permitido
   */
  private isAgentAllowed(agentId: string): agentId is AllowedAgent {
    return ALLOWED_AGENTS.includes(agentId as AllowedAgent);
  }

  /**
   * Router principal para coordinar todas las acciones
   */
  async coordinate(dto: MasterCoordinatorDto): Promise<unknown> {
    switch (dto.action) {
      case MasterCoordinatorAction.EVOLVE_TASKS:
        return await this.evolveTasks(
          dto.completedTasks || [],
          dto.maturityScores,
          dto.userProfile,
        );

      case MasterCoordinatorAction.GET_COACHING_MESSAGE:
        return this.getCoachingMessage(
          dto.currentTasks || [],
          dto.completedTasks || [],
          dto.maturityScores,
        );

      case MasterCoordinatorAction.ANALYZE_PROGRESS:
        return await this.analyzeUserProgress(dto.userId, dto.maturityScores);

      case MasterCoordinatorAction.ANALYZE_AND_GENERATE_TASKS:
        return await this.analyzeAndGenerateTasks(
          dto.userId,
          dto.userProfile,
          dto.maturityScores,
          dto.businessDescription,
        );

      case MasterCoordinatorAction.START_CONVERSATION:
        return await this.startIntelligentConversation(
          dto.userId,
          dto.userProfile,
          dto.conversationContext,
        );

      case MasterCoordinatorAction.GENERATE_INTELLIGENT_QUESTIONS:
        return await this.generateIntelligentQuestions(
          dto.userId,
          dto.userProfile,
        );

      case MasterCoordinatorAction.CREATE_TASK_STEPS:
        if (!dto.taskId || !dto.taskData) {
          throw new BadRequestException(
            'taskId y taskData son requeridos para create_task_steps',
          );
        }
        return await this.createTaskSteps(
          dto.taskId,
          dto.taskData,
          dto.profileContext,
        );

      case MasterCoordinatorAction.COMPLETE_STEP:
        if (!dto.taskId || !dto.stepId || !dto.stepData) {
          throw new BadRequestException(
            'taskId, stepId y stepData son requeridos para complete_step',
          );
        }
        return await this.completeStep(
          dto.taskId,
          dto.stepId,
          dto.stepData,
          dto.userId,
        );

      case MasterCoordinatorAction.GENERATE_DELIVERABLE:
        if (!dto.taskId) {
          throw new BadRequestException(
            'taskId es requerido para generate_deliverable',
          );
        }
        return await this.generateDeliverable(
          dto.taskId,
          dto.userId,
          dto.userProfile?.collectedAnswers,
        );

      case MasterCoordinatorAction.GENERATE_INTELLIGENT_RECOMMENDATIONS:
        return this.generateIntelligentRecommendations(
          dto.userId,
          dto.maturityScores,
          dto.language || 'es',
        );

      case MasterCoordinatorAction.EVALUATE_BRAND_IDENTITY:
        if (!dto.wizardData) {
          throw new BadRequestException(
            'wizardData es requerido para evaluate_brand_identity',
          );
        }
        return await this.evaluateBrandIdentity(dto.userId, dto.wizardData);

      default:
        throw new BadRequestException(`Acción desconocida: ${dto.action}`);
    }
  }

  /**
   * ACCIÓN 1: Evolucionar tareas basado en completadas
   */
  private async evolveTasks(
    completedTasks: TaskData[],
    maturityScores?: MaturityScores,
    userProfile?: UserProfileData,
  ): Promise<{
    suggestions: TaskSuggestion[];
    totalAnalyzed: number;
    categoriesCompleted: string[];
  }> {
    const suggestions: TaskSuggestion[] = [];

    // Analizar patrones de tareas completadas
    const completedCategories = new Set(
      completedTasks
        .map((task) => task.agentId || task.agent_id)
        .filter((id): id is string => id !== undefined),
    );
    const totalCompleted = completedTasks.length;

    // Growth evolution path
    if (completedCategories.has('growth') && totalCompleted >= 2) {
      suggestions.push({
        id: 'growth-advanced-' + Date.now(),
        title: 'Profundizar Diagnóstico de Negocio',
        description:
          'Completa preguntas avanzadas para obtener recomendaciones más precisas',
        reason:
          'Has completado tareas iniciales, profundicemos tu perfil empresarial',
        impact: 'high',
        agentId: 'growth',
        priority: 95,
        unlockReason: 'Desbloqueado por completar diagnóstico inicial',
      });
    }

    // Inventory/Product evolution
    if (completedCategories.has('inventory') && totalCompleted >= 2) {
      suggestions.push({
        id: 'inventory-organization-' + Date.now(),
        title: 'Organizar Catálogo de Productos',
        description: 'Estructura tu catálogo con categorías y variantes claras',
        reason: 'Con productos creados, optimiza su organización',
        impact: 'medium',
        agentId: 'inventory',
        priority: 80,
      });
    }

    // Digital presence progression
    if (completedCategories.has('digital-presence') && totalCompleted >= 2) {
      suggestions.push({
        id: 'digital-visibility-' + Date.now(),
        title: 'Optimizar Visibilidad Online',
        description:
          'Mejora la presentación de tu tienda digital para atraer más clientes',
        reason: 'Tu tienda está activa, ahora maximiza su impacto',
        impact: 'high',
        agentId: 'digital-presence',
        priority: 90,
      });
    }

    // Brand identity progression
    if (completedCategories.has('brand') && totalCompleted >= 1) {
      suggestions.push({
        id: 'brand-refinement-' + Date.now(),
        title: 'Refinar Identidad de Marca',
        description: 'Ajusta logo, colores o claim para mayor coherencia',
        reason: 'Con tu identidad básica definida, perfecciona los detalles',
        impact: 'medium',
        agentId: 'brand',
        priority: 85,
      });
    }

    // Maturity-based suggestions
    if (maturityScores) {
      const scores = Object.values(maturityScores);
      const avgMaturity = scores.reduce((a, b) => a + b, 0) / scores.length;

      if (avgMaturity > 60 && !completedCategories.has('digital-presence')) {
        suggestions.push({
          id: 'digital-expansion-' + Date.now(),
          title: 'Activar Tienda Digital',
          description: 'Lanza tu presencia online para alcanzar más clientes',
          reason:
            'Tu madurez empresarial te permite expandir tu presencia digital',
          impact: 'high',
          agentId: 'digital-presence',
          priority: 75,
        });
      }
    }

    // AI-enhanced suggestions si hay pocas sugerencias
    if (suggestions.length < 2) {
      try {
        const aiSuggestions = await this.getAITaskSuggestions(
          completedTasks,
          maturityScores,
          userProfile,
        );
        suggestions.push(...aiSuggestions);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `AI suggestions failed, using fallback logic: ${message}`,
        );
      }
    }

    return {
      suggestions: suggestions.slice(0, 3),
      totalAnalyzed: totalCompleted,
      categoriesCompleted: Array.from(completedCategories),
    };
  }

  /**
   * Obtener sugerencias de tareas usando IA
   */
  private async getAITaskSuggestions(
    completedTasks: TaskData[],
    maturityScores?: MaturityScores,
    userProfile?: UserProfileData,
  ): Promise<TaskSuggestion[]> {
    const prompt = `
Eres un coach empresarial experto. Analiza el progreso del usuario y sugiere 2 tareas específicas para continuar su desarrollo.

Tareas completadas: ${JSON.stringify(completedTasks.map((t) => ({ title: t.title, category: t.agentId || t.agent_id })))}
Puntuaciones de madurez: ${JSON.stringify(maturityScores)}
Perfil del usuario: ${JSON.stringify(userProfile)}

AGENTES PERMITIDOS (USA SOLO ESTOS):
- growth: Crecimiento inicial, diagnóstico, público objetivo
- inventory: Productos, catálogo, inventario
- digital-presence: Visibilidad online, tienda digital
- brand: Identidad visual, logo, colores, claim

Responde SOLO con un array JSON de objetos con esta estructura:
[{
  "title": "Título específico de la tarea",
  "description": "Descripción detallada y accionable",
  "reason": "Por qué esta tarea es el siguiente paso lógico",
  "impact": "high|medium|low",
  "agentId": "growth|inventory|digital-presence|brand",
  "priority": número del 1-100
}]
`;

    try {
      const aiResponse = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });

      const suggestions = JSON.parse(aiResponse) as AITaskSuggestion[];
      return suggestions.map((suggestion) => ({
        ...suggestion,
        id: 'ai-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting AI suggestions: ${message}`);
      return [];
    }
  }

  /**
   * ACCIÓN 2: Obtener mensaje de coaching
   */
  private getCoachingMessage(
    currentTasks: TaskData[],
    completedTasks: TaskData[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maturityScores?: MaturityScores,
  ): {
    message: string;
    stats: { currentTasks: number; completedTasks: number };
  } {
    const totalTasks = currentTasks.length;
    const completedCount = completedTasks.length;

    let message = '¡Hola! ';

    if (completedCount === 0) {
      message +=
        '¡Excelente que hayas comenzado tu viaje empresarial! Te he preparado las primeras tareas basadas en tu perfil.';
    } else if (completedCount < 3) {
      message += `¡Vas genial! Has completado ${completedCount} tareas. Cada paso te acerca más a tu objetivo.`;
    } else if (completedCount < 10) {
      message += `¡Impresionante progreso! Con ${completedCount} tareas completadas, tu negocio está tomando forma.`;
    } else {
      message += `¡Eres increíble! ${completedCount} tareas completadas. Estás construyendo algo realmente sólido.`;
    }

    if (totalTasks > 12) {
      message += ` Tienes ${totalTasks} tareas activas. Considera pausar algunas para mantener el foco.`;
    } else if (totalTasks < 5) {
      message +=
        ' ¿Te animas a activar algunas tareas más para acelerar tu progreso?';
    }

    return {
      message,
      stats: { currentTasks: totalTasks, completedTasks: completedCount },
    };
  }

  /**
   * ACCIÓN 3: Analizar progreso del usuario
   */
  private async analyzeUserProgress(
    userId: string,
    maturityScores?: MaturityScores,
  ): Promise<{
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    maturityScores?: MaturityScores;
    recentActivity: AgentTask[];
    suggestions: string[];
  }> {
    // Obtener historial de tareas del usuario
    const tasks = await this.agentTasksRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const totalTasks = tasks.length;

    const analysis = {
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate:
        totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0,
      maturityScores,
      recentActivity: completedTasks.slice(0, 5),
      suggestions:
        completedTasks.length >= 3
          ? [
              'Considera revisar tu estrategia de negocio',
              'Es momento de pensar en escalar operaciones',
              'Explora herramientas avanzadas y automatización',
            ]
          : [
              'Enfócate en completar tus tareas actuales',
              'Construye momentum con victorias rápidas',
              'No dudes en pedir ayuda',
            ],
    };

    return analysis;
  }

  /**
   * ACCIÓN 4: Analizar y generar tareas personalizadas (FUNCIÓN PRINCIPAL)
   */
  private async analyzeAndGenerateTasks(
    userId: string,
    userProfile?: UserProfileData,
    maturityScores?: MaturityScores,
    businessDescription?: string,
  ): Promise<{ success: boolean; tasks: AgentTask[]; message: string }> {
    try {
      // Obtener información COMPLETA del usuario
      const profile = await this.userProfilesRepository.findOne({
        where: { userId },
      });

      const maturityData = await this.userMaturityScoresRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      // FUSIÓN COMPLETA de datos
      const businessInfo =
        businessDescription ||
        profile?.businessDescription ||
        'No hay descripción del negocio disponible';
      const brandName =
        profile?.brandName ||
        `${profile?.fullName} Business` ||
        'Negocio sin nombre definido';

      const unifiedProfile = {
        businessName: brandName,
        businessDescription: businessInfo,
        businessType: profile?.businessType ?? undefined,
        marketTarget: profile?.targetMarket ?? undefined,
        currentStage: profile?.currentStage ?? undefined,
        location: profile?.businessLocation ?? undefined,
        teamSize: profile?.teamSize ?? undefined,
        timeAvailability: profile?.timeAvailability ?? undefined,
        salesChannels: profile?.salesChannels || [],
        monthlyRevenueGoal: profile?.monthlyRevenueGoal ?? undefined,
        yearsInBusiness: profile?.yearsInBusiness ?? undefined,
        initialInvestment: profile?.initialInvestmentRange ?? undefined,
        primarySkills: profile?.primarySkills || [],
        currentChallenges: profile?.currentChallenges || [],
        businessGoals: profile?.businessGoals || [],
        socialMediaPresence: profile?.socialMediaPresence ?? undefined,
        maturityScores: maturityData
          ? {
              ideaValidation: maturityData.ideaValidation,
              userExperience: maturityData.userExperience,
              marketFit: maturityData.marketFit,
              monetization: maturityData.monetization,
            }
          : null,
      };

      const prompt = this.buildTaskGenerationPrompt(unifiedProfile);

      // Llamar a OpenAI
      const aiResponse = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const tasks = JSON.parse(aiResponse) as TaskData[];

      // Validar y filtrar solo agentes permitidos
      const validTasks = tasks.filter((task) => {
        const agentId = task.agent_id || task.agentId;
        if (!agentId || !this.isAgentAllowed(agentId)) {
          this.logger.warn(
            `⚠️ Blocking task with invalid agent: ${agentId} - "${task.title}"`,
          );
          return false;
        }
        return true;
      });

      if (validTasks.length === 0) {
        throw new BadRequestException(
          'No se pudieron generar tareas con los agentes disponibles',
        );
      }

      this.logger.log(
        `✅ Filtered ${validTasks.length} valid tasks from ${tasks.length} generated`,
      );

      // Verificar límite de tareas activas
      const activeTasks = await this.agentTasksRepository.find({
        where: { userId, status: 'pending' as any },
      });

      if (activeTasks.length >= 15) {
        // Pausar tareas antiguas
        const oldTasks = activeTasks
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .slice(0, Math.min(validTasks.length, activeTasks.length - 10));

        for (const oldTask of oldTasks) {
          oldTask.status = 'cancelled' as any;
          await this.agentTasksRepository.save(oldTask);
        }

        this.logger.log(
          `⚠️ Paused ${oldTasks.length} old tasks to make room for new ones`,
        );
      }

      // Crear las tareas en la base de datos
      const tasksToInsert = validTasks.map((task) => {
        // Mapear relevance string a enum
        let relevance: TaskRelevance = TaskRelevance.MEDIUM;
        if (task.relevance === 'high') relevance = TaskRelevance.HIGH;
        else if (task.relevance === 'low') relevance = TaskRelevance.LOW;

        const newTask = this.agentTasksRepository.create({
          userId,
          agentId: task.agent_id || task.agentId || 'growth',
          title: task.title,
          description: task.description,
          relevance,
          status: 'pending' as any,
          priority: Math.min(Math.max(task.priority || 3, 1), 5),
        });
        return newTask;
      });

      const insertedTasks = await this.agentTasksRepository.save(tasksToInsert);

      this.logger.log(
        `✅ Generated ${insertedTasks.length} personalized tasks for user ${userId}`,
      );

      // Crear pasos automáticamente para cada tarea
      for (const task of insertedTasks) {
        const taskWithSteps = tasks.find((t) => t.title === task.title);

        if (taskWithSteps?.steps && taskWithSteps.steps.length > 0) {
          const stepsToInsert = taskWithSteps.steps.map(
            (step, index: number) => {
              return this.taskStepsRepository.create({
                taskId: task.id,
                stepNumber: index + 1,
                title: step.title,
                description: step.description,
                inputType: this.determineInputType(step.title),
                validationCriteria: { deliverable: step.deliverable },
                aiContextPrompt: step.description,
                completionStatus: 'pending',
              });
            },
          );

          await this.taskStepsRepository.save(stepsToInsert);
          this.logger.log(
            `✅ Created ${stepsToInsert.length} steps for task: ${task.title}`,
          );
        }
      }

      return {
        success: true,
        tasks: insertedTasks,
        message: `He generado ${insertedTasks.length} tareas específicas para tu negocio: ${businessInfo}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error generating personalized tasks: ${message}`);
      throw new InternalServerErrorException(
        'Error al generar tareas personalizadas',
      );
    }
  }

  /**
   * Helper para construir el prompt de generación de tareas
   */
  private buildTaskGenerationPrompt(unifiedProfile: {
    businessName: string;
    businessDescription: string;
    businessType?: string;
    marketTarget?: string;
    currentStage?: string;
    location?: string;
    teamSize?: string;
    timeAvailability?: string;
    salesChannels: string[];
    monthlyRevenueGoal?: number;
    yearsInBusiness?: number;
    initialInvestment?: string;
    primarySkills: string[];
    currentChallenges: string[];
    businessGoals: string[];
    socialMediaPresence?: Record<string, unknown>;
    maturityScores: {
      ideaValidation: number;
      userExperience: number;
      marketFit: number;
      monetization: number;
    } | null;
  }): string {
    return `
Eres un Master Coordinator AI experto en emprendimiento. Analiza el PERFIL COMPLETO Y FUSIONADO del usuario y genera tareas ULTRA-PERSONALIZADAS y ESPECÍFICAS para su negocio.

PERFIL EMPRESARIAL COMPLETO:
Negocio: "${unifiedProfile.businessName}"
Descripción: "${unifiedProfile.businessDescription}"
Tipo: ${unifiedProfile.businessType || 'No definido'}
Mercado objetivo: ${unifiedProfile.marketTarget || 'No definido'}
Etapa actual: ${unifiedProfile.currentStage || 'No definido'}
Ubicación: ${unifiedProfile.location || 'No definido'}
Canales de venta: ${JSON.stringify(unifiedProfile.salesChannels)}
Tamaño del equipo: ${unifiedProfile.teamSize || 'No definido'}
Tiempo disponible: ${unifiedProfile.timeAvailability || 'No definido'}
Meta de ingresos: $${unifiedProfile.monthlyRevenueGoal || 'No definido'} mensuales
Años en el negocio: ${unifiedProfile.yearsInBusiness || 'Nuevo'}
Inversión inicial: ${unifiedProfile.initialInvestment || 'No definido'}

HABILIDADES Y CONTEXTO:
Habilidades principales: ${JSON.stringify(unifiedProfile.primarySkills)}
Desafíos actuales: ${JSON.stringify(unifiedProfile.currentChallenges)}
Objetivos del negocio: ${JSON.stringify(unifiedProfile.businessGoals)}
Presencia en redes: ${JSON.stringify(unifiedProfile.socialMediaPresence)}

PUNTUACIONES DE MADUREZ (PRIORIZAR ÁREAS MÁS BAJAS):
${
  unifiedProfile.maturityScores
    ? `
- Validación de idea: ${unifiedProfile.maturityScores.ideaValidation}/100
- Experiencia de usuario: ${unifiedProfile.maturityScores.userExperience}/100  
- Ajuste al mercado: ${unifiedProfile.maturityScores.marketFit}/100
- Monetización: ${unifiedProfile.maturityScores.monetization}/100
`
    : 'No hay datos de madurez disponibles'
}

INSTRUCCIONES CRÍTICAS:
1. Usa EXACTAMENTE el nombre del negocio "${unifiedProfile.businessName}" en los títulos cuando sea relevante
2. Si el negocio es específico (ej: "cositas lindas", "muñecos tejidos"), haz tareas ULTRA ESPECÍFICAS
3. Prioriza las áreas con puntuaciones de madurez más bajas
4. Genera EXACTAMENTE 5 tareas súper personalizadas
5. Cada tarea debe tener 2-4 pasos específicos y útiles
6. NO uses términos genéricos - todo debe ser contextual al negocio
7. ⚠️ CRÍTICO: USA SOLO LOS AGENTES PERMITIDOS - No inventes agentes que no existen

AGENTES DISPONIBLES (USA SOLO ESTOS):
- growth: Crecimiento inicial, diagnóstico, preguntas estratégicas, público objetivo
- inventory: Productos, catálogo, inventario, creación de tienda, upload de productos
- digital-presence: Visibilidad online, configuración de tienda pública, presencia digital
- brand: Identidad visual, logo, colores, claim, coherencia de marca

Responde SOLO con un array JSON con esta estructura:
[{
  "title": "Título súper específico usando el nombre del negocio",
  "description": "Descripción detallada mencionando el tipo de negocio específico",
  "agent_id": "growth|inventory|digital-presence|brand",
  "relevance": "high|medium|low",
  "priority": 1-5,
  "estimated_time": "15 min|30 min|1 hora|2 horas",
  "category": "Categoría específica del tipo de negocio",
  "steps": [
    {
      "title": "Paso súper específico 1",
      "description": "Descripción detallada del paso con contexto del negocio",
      "deliverable": "Entregable concreto y específico"
    }
  ]
}]
`;
  }

  /**
   * Helper para determinar tipo de input basado en el título del paso
   */
  private determineInputType(title: string): string {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes('foto') ||
      lowerTitle.includes('imagen') ||
      lowerTitle.includes('logo') ||
      lowerTitle.includes('sube')
    ) {
      return 'file';
    }
    if (
      lowerTitle.includes('precio') ||
      lowerTitle.includes('costo') ||
      lowerTitle.includes('número') ||
      lowerTitle.includes('cantidad')
    ) {
      return 'number';
    }
    if (
      lowerTitle.includes('selecciona') ||
      lowerTitle.includes('elige') ||
      lowerTitle.includes('opciones')
    ) {
      return 'select';
    }
    if (
      lowerTitle.includes('describe') ||
      lowerTitle.includes('lista') ||
      lowerTitle.includes('enumera')
    ) {
      return 'textarea';
    }

    return 'text';
  }

  /**
   * ACCIÓN 5: Iniciar conversación inteligente
   */
  private async startIntelligentConversation(
    userId: string,
    userProfile?: UserProfileData,
    conversationContext?: string,
  ): Promise<{
    message: string;
    questions: string[];
    actionButtons: Array<{ text: string; action: string }>;
    nextSteps: string[];
  }> {
    const profile = await this.userProfilesRepository.findOne({
      where: { userId },
    });

    const tasks = await this.agentTasksRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const businessInfo = profile?.businessDescription || 'No definido';
    const completedTasks = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED,
    );
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING);

    const prompt = `
Eres el Master Coordinator, un guía empresarial empático y conversacional. Tu trabajo es hablar con ${profile?.fullName || 'el usuario'} sobre su negocio de forma natural y personalizada.

INFORMACIÓN DEL NEGOCIO:
Descripción: ${businessInfo}
Nombre de marca: ${profile?.brandName || 'Sin definir'}
Tareas completadas: ${completedTasks.length}
Tareas pendientes: ${pendingTasks.length}

CONTEXTO DE CONVERSACIÓN: ${conversationContext || 'Inicio de conversación'}

Responde en JSON con este formato:
{
  "message": "Mensaje conversacional específico para su negocio",
  "questions": ["¿Pregunta específica 1?", "¿Pregunta específica 2?"],
  "actionButtons": [
    {"text": "Empezar ahora", "action": "start_tasks"},
    {"text": "Explícame más", "action": "explain_more"},
    {"text": "Hablar de mi negocio", "action": "business_details"}
  ],
  "nextSteps": ["Paso específico 1", "Paso específico 2"]
}
`;

    try {
      const aiResponse = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
      });

      return JSON.parse(aiResponse) as {
        message: string;
        questions: string[];
        actionButtons: Array<{ text: string; action: string }>;
        nextSteps: string[];
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error starting intelligent conversation: ${message}`);
      throw new InternalServerErrorException(
        'Error al iniciar conversación inteligente',
      );
    }
  }

  /**
   * ACCIÓN 6: Generar preguntas inteligentes
   */
  private async generateIntelligentQuestions(
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userProfile?: UserProfileData,
  ): Promise<{
    success: boolean;
    questions: IntelligentQuestion[];
    message: string;
  }> {
    const profile = await this.userProfilesRepository.findOne({
      where: { userId },
    });

    const maturityData = await this.userMaturityScoresRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const profileContext = {
      businessName: profile?.brandName || 'Negocio sin nombre',
      businessDescription: profile?.businessDescription || 'Sin descripción',
      businessType: profile?.businessType,
      salesChannels: profile?.salesChannels || [],
      teamSize: profile?.teamSize,
      timeAvailability: profile?.timeAvailability,
      monthlyRevenueGoal: profile?.monthlyRevenueGoal,
      currentChallenges: profile?.currentChallenges || [],
      businessGoals: profile?.businessGoals || [],
      maturityScores: maturityData,
    };

    const prompt = `
Eres un Master Coordinator especializado en hacer preguntas inteligentes para profundizar en el perfil empresarial.

PERFIL ACTUAL DEL USUARIO:
${JSON.stringify(profileContext, null, 2)}

TU MISIÓN: Identifica gaps o información poco clara y genera 3-5 preguntas ESPECÍFICAS para enriquecer el perfil.

Responde SOLO con un array JSON:
[{
  "question": "Pregunta específica y conversacional",
  "context": "Por qué esta pregunta es importante para el negocio",
  "category": "pricing|marketing|operations|strategy|product"
}]
`;

    try {
      const aiResponse = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const questions = JSON.parse(aiResponse) as IntelligentQuestion[];

      return {
        success: true,
        questions,
        message: `He generado ${questions.length} preguntas inteligentes para enriquecer tu perfil empresarial.`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error generating intelligent questions: ${message}`);
      throw new InternalServerErrorException(
        'Error al generar preguntas inteligentes',
      );
    }
  }

  /**
   * ACCIÓN 7: Crear pasos específicos para tareas
   */
  private async createTaskSteps(
    taskId: string,
    taskData: TaskData,
    profileContext?: Record<string, unknown>,
  ): Promise<{
    success: boolean;
    steps: TaskStep[];
    message: string;
  }> {
    this.logger.log(
      `🔧 Creating steps for task: ${taskId} - ${taskData.title}`,
    );

    // Validar agente permitido
    if (taskData.agent_id && !this.isAgentAllowed(taskData.agent_id)) {
      throw new BadRequestException(
        `Agente no permitido: ${taskData.agent_id}. Usa: ${ALLOWED_AGENTS.join(', ')}`,
      );
    }

    // Verificar si ya existen pasos
    const existingSteps = await this.taskStepsRepository.find({
      where: { taskId },
    });

    if (existingSteps.length > 0) {
      this.logger.log(`✅ Steps already exist for task ${taskId}`);
      return {
        success: true,
        steps: existingSteps,
        message: 'Los pasos ya existen para esta tarea.',
      };
    }

    const prompt = `
Eres un Master Coordinator experto en crear pasos específicos y útiles para tareas empresariales.

TAREA A DESARROLLAR:
Título: "${taskData.title}"
Descripción: "${taskData.description}"

CONTEXTO DEL NEGOCIO:
${JSON.stringify(profileContext)}

INSTRUCCIONES:
1. Crea 3-6 pasos específicos y accionables
2. Cada paso debe ser claro y tener un entregable concreto
3. Usa el contexto del negocio para personalizar los pasos
4. Ordena los pasos lógicamente
5. Incluye validaciones y ayuda contextual

Responde SOLO con un array JSON:
[{
  "step_number": 1,
  "title": "Título específico del paso",
  "description": "Descripción detallada y contextual",
  "input_type": "text|number|select|file",
  "validation_criteria": "Criterios de validación",
  "ai_context_prompt": "Prompt para ayuda de IA en este paso",
  "deliverable": "Qué entregable concreto debe producir"
}]
`;

    try {
      const aiResponse = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      interface AIStep {
        step_number?: number;
        title?: string;
        description?: string;
        input_type?: string;
        validation_criteria?: string | Record<string, unknown>;
        ai_context_prompt?: string;
      }

      const steps = JSON.parse(aiResponse) as AIStep[];

      // Insertar pasos en la base de datos
      const stepsToInsert = steps.map((step, index: number) => {
        return this.taskStepsRepository.create({
          taskId,
          stepNumber: step.step_number || index + 1,
          title: step.title || `Paso ${index + 1}`,
          description: step.description || '',
          inputType: step.input_type || 'text',
          validationCriteria:
            typeof step.validation_criteria === 'string'
              ? { criteria: step.validation_criteria }
              : step.validation_criteria || {},
          aiContextPrompt: step.ai_context_prompt || '',
          completionStatus: 'pending',
        });
      });

      const insertedSteps = await this.taskStepsRepository.save(stepsToInsert);

      this.logger.log(
        `✅ Successfully created ${insertedSteps.length} steps for task ${taskId}`,
      );

      return {
        success: true,
        steps: insertedSteps,
        message: `He creado ${insertedSteps.length} pasos específicos para tu tarea.`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in createTaskSteps: ${message}`);
      throw new InternalServerErrorException('Error al crear pasos de tarea');
    }
  }

  /**
   * ACCIÓN 8: Completar paso y verificar si tarea está completa
   */
  private async completeStep(
    taskId: string,
    stepId: string,
    stepData: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId?: string,
  ): Promise<{
    success: boolean;
    allCompleted: boolean;
    message: string;
  }> {
    // Actualizar el paso como completado
    await this.taskStepsRepository.update(stepId, {
      completionStatus: 'completed',
      userInputData: stepData,
    });

    // Verificar si todos los pasos están completos
    const allSteps = await this.taskStepsRepository.find({
      where: { taskId },
    });

    const allCompleted = allSteps.every(
      (step) => step.completionStatus === 'completed',
    );

    if (allCompleted) {
      // Marcar tarea como completada
      await this.agentTasksRepository.update(taskId, {
        status: 'completed' as any,
        completedAt: new Date(),
      });
    }

    return {
      success: true,
      allCompleted,
      message: allCompleted
        ? '¡Tarea completada! Generando entregable...'
        : 'Paso completado exitosamente.',
    };
  }

  /**
   * ACCIÓN 9: Generar entregable para tarea completada
   */
  private async generateDeliverable(
    taskId: string,
    userId?: string,
    collectedAnswers?: Array<{ question: string; answer: string }>,
  ): Promise<{
    success: boolean;
    deliverable: AgentDeliverable;
    message: string;
  }> {
    // Obtener información de la tarea y sus pasos
    const task = await this.agentTasksRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    const steps = await this.taskStepsRepository.find({
      where: { taskId },
      order: { stepNumber: 'ASC' },
    });

    let inputData;
    if (collectedAnswers && collectedAnswers.length > 0) {
      inputData = collectedAnswers;
    } else {
      inputData = steps.map((step) => ({
        title: step.title,
        userInput: step.userInputData,
      }));
    }

    const prompt = `
Eres un experto en crear entregables empresariales profesionales y valiosos.

TAREA COMPLETADA:
Título: "${task.title}"
Descripción: "${task.description}"
Agente: "${task.agentId}"

INFORMACIÓN RECOPILADA:
${JSON.stringify(inputData, null, 2)}

INSTRUCCIONES:
1. Crea un entregable profesional y útil
2. Organiza la información de forma clara
3. Incluye recomendaciones específicas
4. Haz que sea un documento que el usuario pueda usar inmediatamente

FORMATO DE ENTREGABLE:
- Título del documento
- Resumen ejecutivo
- Desarrollo basado en los pasos completados
- Recomendaciones específicas
- Próximos pasos sugeridos

Responde con un documento en formato markdown profesional.
`;

    try {
      const deliverableContent = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Crear entregable en la base de datos
      const deliverable = this.agentDeliverablesRepository.create({
        userId,
        taskId,
        agentId: task.agentId,
        title: `Entregable: ${task.title}`,
        description: `Documento generado al completar la tarea: ${task.title}`,
        fileType: 'text',
        content: deliverableContent,
      });

      const savedDeliverable =
        await this.agentDeliverablesRepository.save(deliverable);

      return {
        success: true,
        deliverable: savedDeliverable,
        message: 'Entregable generado exitosamente.',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error generating deliverable: ${message}`);
      throw new InternalServerErrorException('Error al generar entregable');
    }
  }

  /**
   * ACCIÓN 10: Generar recomendaciones inteligentes
   */
  private generateIntelligentRecommendations(
    userId: string,
    maturityScores?: MaturityScores,
    language: 'es' | 'en' = 'es',
  ): {
    success: boolean;
    recommendations: unknown[];
    message: string;
  } {
    // Esta función ya existe en generateIntelligentRecommendations.ts
    // Por ahora retornamos un placeholder
    this.logger.log(
      `Generating intelligent recommendations for user ${userId} in ${language}`,
    );

    return {
      success: true,
      recommendations: [],
      message:
        'Función de recomendaciones inteligentes - implementación pendiente',
    };
  }

  /**
   * ACCIÓN 11: Evaluar identidad de marca
   */
  private async evaluateBrandIdentity(
    userId: string,
    wizardData: Record<string, unknown>,
  ): Promise<{
    success: boolean;
    analysis: BrandAnalysis;
    message: string;
  }> {
    this.logger.log(
      `🎨 Master Agent: Evaluating brand identity for user ${userId}`,
    );

    // Calcular score
    const score = this.calculateBrandScore(wizardData);

    // Helper para convertir valores de wizardData a string seguro
    const toString = (value: unknown): string => {
      if (typeof value === 'string') return value;
      if (value === null || value === undefined) return 'No especificado';
      if (typeof value === 'object') return 'No especificado';
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return String(value);
    };

    const logoStatus = toString(
      wizardData['¿Ya tienes un logo para tu negocio?'],
    );
    const colorStatus = toString(
      wizardData['¿Tienes colores corporativos definidos?'],
    );
    const claimStatus = toString(
      wizardData['¿Tienes un slogan o claim definido?'],
    );
    const channelsData = wizardData['¿Dónde usas tu identidad actualmente?'];
    const channelsText = Array.isArray(channelsData)
      ? channelsData.join(', ')
      : 'No especificado';

    const analysisPrompt = `
Eres un experto en branding para negocios artesanales. Analiza esta evaluación de identidad visual:

Logo: ${logoStatus}
Colores: ${colorStatus}
Claim: ${claimStatus}
Canales: ${channelsText}

Genera un análisis profesional en formato JSON con:
{
  "score": ${score},
  "summary": "Resumen ejecutivo en 2-3 oraciones sobre el estado actual de la marca",
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "weaknesses": ["debilidad 1", "debilidad 2"],
  "recommendations": [
    {
      "priority": "high",
      "title": "Título de recomendación prioritaria",
      "description": "Descripción detallada y accionable",
      "impact": "Impacto esperado en el negocio",
      "effort": "1-2 horas"
    }
  ],
  "next_steps": ["Paso accionable 1", "Paso accionable 2", "Paso accionable 3"]
}

Sé específico, constructivo y enfocado en artesanos.
`;

    try {
      const aiResponse = await this.openAIService.chatCompletion({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const analysis = JSON.parse(aiResponse) as BrandAnalysis;

      // Guardar en user_master_context
      const existingContext = await this.userMasterContextRepository.findOne({
        where: { userId },
      });

      const currentContext = existingContext?.businessContext || {};

      await this.userMasterContextRepository.save({
        ...existingContext,
        userId,
        businessContext: {
          ...currentContext,
          brand_evaluation: {
            ...analysis,
            raw_answers: wizardData,
            evaluated_at: new Date().toISOString(),
          },
        },
      });

      // Generar deliverable con el plan de mejora
      const deliverable = this.agentDeliverablesRepository.create({
        userId,
        agentId: 'brand',
        title: 'Plan de Mejora de Identidad Visual',
        description: analysis.summary,
        fileType: 'json',
        content: JSON.stringify(analysis.recommendations),
        metadata: {
          score: analysis.score,
          evaluation_type: 'brand_identity',
        },
      });

      await this.agentDeliverablesRepository.save(deliverable);

      this.logger.log(
        `✅ Brand evaluation completed for user ${userId} - Score: ${score}%`,
      );

      return {
        success: true,
        analysis,
        message: 'Evaluación completada exitosamente',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error evaluating brand identity: ${message}`);
      throw new InternalServerErrorException(
        'Error al evaluar identidad de marca',
      );
    }
  }

  /**
   * Helper para calcular score de marca
   */
  private calculateBrandScore(wizardData: Record<string, unknown>): number {
    let score = 0;

    // Logo (+30 pts)
    const logoStatus = wizardData['¿Ya tienes un logo para tu negocio?'];
    if (logoStatus === 'Sí, tengo logo') score += 30;
    else if (logoStatus === 'Tengo uno pero no estoy seguro si es bueno')
      score += 15;

    // Colores (+25 pts)
    const colorStatus = wizardData['¿Tienes colores corporativos definidos?'];
    if (colorStatus === 'Sí, tengo paleta definida') score += 25;
    else if (colorStatus === 'Uso colores pero sin sistema') score += 12;

    // Claim (+20 pts)
    const claimStatus = wizardData['¿Tienes un slogan o claim definido?'];
    if (claimStatus === 'Sí, tengo claim') score += 20;
    else if (claimStatus === 'Tengo ideas pero no definido') score += 10;

    // Canales (+25 pts)
    const channelsData = wizardData['¿Dónde usas tu identidad actualmente?'];
    const channels = Array.isArray(channelsData) ? channelsData : [];
    score += Math.min(25, channels.length * 4);

    return Math.min(100, score);
  }
}
