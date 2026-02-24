/**
 * Growth Agent (Invisible)
 * 
 * Responsabilidades:
 * - Controla el Maturity Calculator
 * - Determina nivel de madurez del artesano
 * - Genera tareas y misiones de crecimiento
 * - Analiza progreso y redefine estrategias
 */

import { 
  InvisibleAgent, 
  UserContext, 
  AgentAnalysis, 
  GeneratedTask,
  ValidationResult,
  TaskStep
} from '@/types/invisibleAgent';
import { MATURITY_TEST_CONFIG } from '@/config/maturityTest';

export class GrowthAgent implements InvisibleAgent {
  id = 'growth';
  name = 'Agente de Crecimiento';
  description = 'Analiza tu madurez y genera plan de crecimiento personalizado';

  async analyze(userContext: UserContext): Promise<AgentAnalysis> {
    const scores = userContext.maturityScores;
    
    if (!scores) {
      return {
        agentId: this.id,
        score: 0,
        strengths: [],
        weaknesses: ['No se ha completado la evaluación de madurez'],
        recommendations: ['Completa tu evaluación de madurez para obtener recomendaciones personalizadas'],
        priority: 'high',
        estimatedImpact: 'Crítico para comenzar tu viaje'
      };
    }

    const avgScore = (scores.ideaValidation + scores.userExperience + scores.marketFit + scores.monetization) / 4;
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (scores.ideaValidation >= 70) strengths.push('Validación de idea sólida');
    else weaknesses.push('Necesitas fortalecer la validación de tu idea');
    
    if (scores.userExperience >= 70) strengths.push('Buena experiencia de usuario');
    else weaknesses.push('Mejora la experiencia que ofreces');
    
    if (scores.marketFit >= 70) strengths.push('Buen ajuste al mercado');
    else weaknesses.push('Necesitas conocer mejor tu mercado');
    
    if (scores.monetization >= 70) strengths.push('Estrategia de monetización clara');
    else weaknesses.push('Define cómo vas a generar ingresos');

    return {
      agentId: this.id,
      score: avgScore,
      strengths,
      weaknesses,
      recommendations: this.generateRecommendations(scores),
      priority: avgScore < 50 ? 'high' : avgScore < 70 ? 'medium' : 'low',
      estimatedImpact: avgScore < 50 ? 'Alto - bases críticas' : 'Medio - optimización'
    };
  }

  async generateTasks(analysis: AgentAnalysis, userContext: UserContext): Promise<GeneratedTask[]> {
    const tasks: GeneratedTask[] = [];
    const scores = userContext.maturityScores;

    if (!scores) {
      // Tarea inicial: completar maturity calculator
      tasks.push({
        id: 'growth-initial-assessment',
        title: 'Completa tu Evaluación de Madurez',
        description: `Responde ${MATURITY_TEST_CONFIG.TOTAL_QUESTIONS} preguntas para que pueda entender tu situación actual y crear un plan personalizado.`,
        agentId: this.id,
        priority: 'high',
        estimatedTime: '10-15 minutos',
        category: 'Fundamentos',
        isUnlocked: true,
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Inicia la evaluación',
            description: 'Haz clic en "Comenzar evaluación" para iniciar',
            isCompleted: false
          }
        ]
      });
      return tasks;
    }

    // Generar tareas basadas en debilidades
    if (scores.ideaValidation < 70) {
      tasks.push(this.createIdeaValidationTask(scores.ideaValidation));
    }
    
    if (scores.userExperience < 70) {
      tasks.push(this.createUserExperienceTask(scores.userExperience));
    }
    
    if (scores.marketFit < 70) {
      tasks.push(this.createMarketFitTask(scores.marketFit));
    }
    
    if (scores.monetization < 70) {
      tasks.push(this.createMonetizationTask(scores.monetization));
    }

    return tasks;
  }

  async validateCompletion(task: GeneratedTask, userContext: UserContext): Promise<ValidationResult> {
    const allStepsCompleted = task.steps.every(step => step.isCompleted);
    
    if (!allStepsCompleted) {
      return {
        isValid: false,
        message: 'Aún hay pasos pendientes por completar',
        nextSteps: task.steps
          .filter(s => !s.isCompleted)
          .map(s => s.title)
      };
    }

    return {
      isValid: true,
      message: '¡Excelente! Has completado esta misión de crecimiento.',
      nextSteps: ['Revisa tus entregables', 'Continúa con la siguiente misión'],
      deliverable: {
        id: `deliverable-${task.id}`,
        taskId: task.id,
        title: `Reporte de ${task.title}`,
        description: 'Resumen de aprendizajes y próximos pasos',
        type: 'report',
        agentId: 'growth',
        agentName: 'Growth Agent',
        content: { summary: 'Tarea completada exitosamente' },
        createdAt: new Date()
      }
    };
  }

  private generateRecommendations(scores: any): string[] {
    const recommendations: string[] = [];
    
    if (scores.ideaValidation < 70) {
      recommendations.push('Valida tu idea con clientes reales');
    }
    if (scores.userExperience < 70) {
      recommendations.push('Mejora cómo presentas tus productos');
    }
    if (scores.marketFit < 70) {
      recommendations.push('Investiga más sobre tu mercado objetivo');
    }
    if (scores.monetization < 70) {
      recommendations.push('Define tu estrategia de precios');
    }
    
    return recommendations;
  }

  private createIdeaValidationTask(score: number): GeneratedTask {
    return {
      id: 'growth-idea-validation',
      title: 'Valida tu Idea de Negocio',
      description: 'Confirma que tu artesanía tiene demanda real en el mercado',
      agentId: this.id,
      priority: score < 40 ? 'high' : 'medium',
      estimatedTime: '2-3 días',
      category: 'Validación',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Identifica 10 clientes potenciales',
          description: '¿Quiénes serían tus clientes ideales?',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Conversa con 5 de ellos',
          description: 'Pregúntales si comprarían tu producto y por qué',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          title: 'Documenta tus aprendizajes',
          description: 'Resume lo que descubriste',
          isCompleted: false,
          inputType: 'text'
        }
      ]
    };
  }

  private createUserExperienceTask(score: number): GeneratedTask {
    return {
      id: 'growth-user-experience',
      title: 'Mejora la Experiencia de tus Clientes',
      description: 'Haz que sea fácil y agradable comprar tus productos',
      agentId: this.id,
      priority: 'medium',
      estimatedTime: '1-2 días',
      category: 'Experiencia',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Mejora tus fotos de productos',
          description: 'Toma fotos con buena luz que muestren detalles',
          isCompleted: false,
          inputType: 'file'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Escribe descripciones atractivas',
          description: 'Cuenta la historia detrás de cada pieza',
          isCompleted: false,
          inputType: 'text'
        }
      ]
    };
  }

  private createMarketFitTask(score: number): GeneratedTask {
    return {
      id: 'growth-market-fit',
      title: 'Conoce tu Mercado',
      description: 'Entiende quiénes son tus clientes y qué buscan',
      agentId: this.id,
      priority: score < 40 ? 'high' : 'medium',
      estimatedTime: '2-3 días',
      category: 'Mercado',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Define tu cliente ideal',
          description: 'Edad, ubicación, intereses, poder adquisitivo',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Investiga la competencia',
          description: '¿Quién más vende productos similares?',
          isCompleted: false,
          inputType: 'text'
        }
      ]
    };
  }

  private createMonetizationTask(score: number): GeneratedTask {
    return {
      id: 'growth-monetization',
      title: 'Define tu Estrategia de Precios',
      description: 'Calcula precios justos que te den ganancia',
      agentId: this.id,
      priority: 'high',
      estimatedTime: '1 día',
      category: 'Monetización',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Calcula tus costos reales',
          description: 'Materiales, tiempo, herramientas, envío',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Define tu margen de ganancia',
          description: '¿Cuánto quieres ganar por pieza?',
          isCompleted: false,
          inputType: 'text'
        }
      ]
    };
  }
}

export const growthAgent = new GrowthAgent();
