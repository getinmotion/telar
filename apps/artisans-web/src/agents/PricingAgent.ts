/**
 * Pricing Agent (Invisible)
 * 
 * Responsabilidades:
 * - Calcula precios ideales según materiales, tiempo y mercado
 * - Analiza rentabilidad y márgenes
 * - Se integra con inventario y tienda
 * - Crea tareas de costeo y ajuste de precios
 */

import { 
  InvisibleAgent, 
  UserContext, 
  AgentAnalysis, 
  GeneratedTask,
  ValidationResult
} from '@/types/invisibleAgent';

export class PricingAgent implements InvisibleAgent {
  id = 'pricing';
  name = 'Agente de Precios';
  description = 'Ayuda a calcular precios justos y rentables';

  async analyze(userContext: UserContext): Promise<AgentAnalysis> {
    const hasProducts = userContext.productsCount > 0;
    
    if (!hasProducts) {
      return {
        agentId: this.id,
        score: 0,
        strengths: [],
        weaknesses: ['No tienes productos registrados'],
        recommendations: ['Primero agrega productos a tu inventario'],
        priority: 'low',
        estimatedImpact: 'Necesitas productos primero'
      };
    }

    // Análisis básico - en producción, consultaría la base de datos
    return {
      agentId: this.id,
      score: 60,
      strengths: ['Tienes productos registrados'],
      weaknesses: ['Algunos productos sin precio definido', 'No has calculado costos reales'],
      recommendations: [
        'Calcula el costo real de cada producto',
        'Define un margen de ganancia objetivo',
        'Revisa precios de la competencia'
      ],
      priority: 'high',
      estimatedImpact: 'Alto - impacta directamente tus ganancias'
    };
  }

  async generateTasks(analysis: AgentAnalysis, userContext: UserContext): Promise<GeneratedTask[]> {
    const tasks: GeneratedTask[] = [];

    if (userContext.productsCount === 0) {
      return tasks; // No generar tareas si no hay productos
    }

    tasks.push({
      id: 'pricing-cost-analysis',
      title: 'Calcula tus Costos Reales',
      description: 'Identifica todos los costos de producción para fijar precios rentables',
      agentId: this.id,
      priority: 'high',
      estimatedTime: '2-3 horas',
      category: 'Pricing',
      isUnlocked: true,
      deliverableType: 'cost-sheet',
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Lista tus materiales',
          description: 'Materiales directos: telas, hilos, pinturas, etc.',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Calcula tiempo de producción',
          description: '¿Cuántas horas te toma hacer cada pieza?',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          title: 'Costos indirectos',
          description: 'Luz, arriendo de taller, herramientas, empaque',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-4',
          stepNumber: 4,
          title: 'Define tu margen',
          description: '¿Qué porcentaje de ganancia quieres? (Recomendado: 40-60%)',
          isCompleted: false,
          inputType: 'text'
        }
      ]
    });

    tasks.push({
      id: 'pricing-market-research',
      title: 'Investiga Precios del Mercado',
      description: 'Conoce cómo están los precios de productos similares',
      agentId: this.id,
      priority: 'medium',
      estimatedTime: '1-2 horas',
      category: 'Pricing',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Busca productos similares',
          description: 'Encuentra 5-10 productos parecidos a los tuyos',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Registra sus precios',
          description: 'Anota el precio de cada uno',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          title: 'Compara calidad',
          description: '¿Cómo se compara tu calidad con la de ellos?',
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
        message: 'Completa todos los pasos para generar tu hoja de costos',
        nextSteps: task.steps
          .filter(s => !s.isCompleted)
          .map(s => s.title)
      };
    }

    return {
      isValid: true,
      message: '¡Perfecto! Tu análisis de costos está completo.',
      deliverable: {
        id: `deliverable-${task.id}`,
        taskId: task.id,
        title: 'Hoja de Costos y Precios Sugeridos',
        description: 'Cálculo detallado de costos y precios recomendados',
        type: 'report',
        agentId: 'pricing',
        agentName: 'Pricing Agent',
        content: { 
          summary: 'Análisis de costos completado',
          recommendation: 'Aplica estos precios a tus productos'
        },
        createdAt: new Date()
      }
    };
  }
}

export const pricingAgent = new PricingAgent();
