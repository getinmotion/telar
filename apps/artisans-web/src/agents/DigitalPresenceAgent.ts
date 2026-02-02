/**
 * Digital Presence Agent (Invisible)
 * 
 * Responsabilidades:
 * - Evalúa huella digital (redes, web, visibilidad, SEO)
 * - Ofrece tareas para mejorar presencia online
 * - Analiza engagement y propone optimizaciones
 * - Trabaja con agente de marca y tienda
 */

import { 
  InvisibleAgent, 
  UserContext, 
  AgentAnalysis, 
  GeneratedTask,
  ValidationResult
} from '@/types/invisibleAgent';

export class DigitalPresenceAgent implements InvisibleAgent {
  id = 'digital-presence';
  name = 'Agente de Presencia Digital';
  description = 'Amplifica tu visibilidad en internet y redes sociales';

  async analyze(userContext: UserContext): Promise<AgentAnalysis> {
    const hasShop = userContext.hasShop;
    
    return {
      agentId: this.id,
      score: hasShop ? 50 : 20,
      strengths: hasShop ? ['Tienes una tienda online'] : [],
      weaknesses: hasShop 
        ? ['Baja actividad en redes sociales', 'Pocas visitas a tu tienda']
        : ['No tienes tienda online', 'Sin presencia en redes'],
      recommendations: [
        'Crea perfiles en Instagram y Facebook',
        'Publica contenido regularmente',
        'Conecta con tu comunidad',
        'Usa hashtags relevantes'
      ],
      priority: 'medium',
      estimatedImpact: 'Alto - más visibilidad = más ventas'
    };
  }

  async generateTasks(analysis: AgentAnalysis, userContext: UserContext): Promise<GeneratedTask[]> {
    const tasks: GeneratedTask[] = [];

    tasks.push({
      id: 'presence-social-setup',
      title: 'Configura tus Redes Sociales',
      description: 'Crea perfiles profesionales en Instagram y Facebook',
      agentId: this.id,
      priority: 'high',
      estimatedTime: '2-3 horas',
      category: 'Presencia Digital',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Crea cuenta de Instagram Business',
          description: 'Usa el mismo nombre que tu negocio',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Configura tu biografía',
          description: 'Cuenta qué haces y cómo contactarte',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          title: 'Sube tus primeras 9 fotos',
          description: 'Productos, proceso, tu taller',
          isCompleted: false,
          inputType: 'file'
        }
      ]
    });

    tasks.push({
      id: 'presence-content-plan',
      title: 'Plan de Contenido Semanal',
      description: 'Qué publicar para mantener tu comunidad activa',
      agentId: this.id,
      priority: 'medium',
      estimatedTime: '1 hora',
      category: 'Presencia Digital',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Define 3 tipos de contenido',
          description: 'Ej: productos, proceso, behind-the-scenes',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Calendario de publicaciones',
          description: 'Cuándo vas a publicar cada semana',
          isCompleted: false,
          inputType: 'text'
        }
      ]
    });

    return tasks;
  }

  async validateCompletion(task: GeneratedTask, userContext: UserContext): Promise<ValidationResult> {
    const allStepsCompleted = task.steps.every(step => step.isCompleted);
    
    if (!allStepsCompleted) {
      return {
        isValid: false,
        message: 'Completa todos los pasos para mejorar tu presencia digital',
        nextSteps: task.steps
          .filter(s => !s.isCompleted)
          .map(s => s.title)
      };
    }

    return {
      isValid: true,
      message: '¡Genial! Ahora tienes presencia digital activa.',
      deliverable: {
        id: `deliverable-${task.id}`,
        taskId: task.id,
        title: 'Plan de Presencia Digital',
        description: 'Estrategia de contenido y calendario de publicaciones',
        type: 'guide',
        agentId: 'digital-presence',
        agentName: 'Digital Presence Agent',
        content: { 
          socialProfiles: 'Perfiles configurados',
          contentPlan: 'Plan de contenido semanal'
        },
        createdAt: new Date()
      }
    };
  }
}

export const digitalPresenceAgent = new DigitalPresenceAgent();
