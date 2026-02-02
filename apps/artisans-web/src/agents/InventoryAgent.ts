/**
 * Inventory Agent (Invisible)
 * 
 * Responsabilidades:
 * - Organiza, clasifica y analiza productos
 * - Usa IA para limpiar, completar y mejorar descripciones
 * - Controla stock, productos más vendidos, demanda y variaciones
 * - Conecta con Pricing y Tienda
 */

import { 
  InvisibleAgent, 
  UserContext, 
  AgentAnalysis, 
  GeneratedTask,
  ValidationResult
} from '@/types/invisibleAgent';

export class InventoryAgent implements InvisibleAgent {
  id = 'inventory';
  name = 'Agente de Inventario';
  description = 'Organiza y optimiza tu catálogo de productos';

  async analyze(userContext: UserContext): Promise<AgentAnalysis> {
    const hasProducts = userContext.productsCount > 0;
    const productCount = userContext.productsCount;
    
    if (!hasProducts) {
      return {
        agentId: this.id,
        score: 0,
        strengths: [],
        weaknesses: ['No tienes productos en tu catálogo'],
        recommendations: ['Agrega tus primeros productos con fotos y descripciones'],
        priority: 'high',
        estimatedImpact: 'Crítico - necesitas productos para vender'
      };
    }

    return {
      agentId: this.id,
      score: Math.min((productCount / 10) * 100, 100),
      strengths: [`Tienes ${productCount} producto${productCount > 1 ? 's' : ''} registrado${productCount > 1 ? 's' : ''}`],
      weaknesses: [
        'Algunos productos sin fotos de calidad',
        'Descripciones incompletas',
        'Control de stock manual'
      ],
      recommendations: [
        'Mejora las fotos de tus productos',
        'Completa descripciones con IA',
        'Organiza por categorías'
      ],
      priority: 'medium',
      estimatedImpact: 'Medio - mejora presentación y gestión'
    };
  }

  async generateTasks(analysis: AgentAnalysis, userContext: UserContext): Promise<GeneratedTask[]> {
    const tasks: GeneratedTask[] = [];

    if (userContext.productsCount === 0) {
      tasks.push({
        id: 'inventory-first-products-wizard',
        title: 'Agrega tus Primeros Productos con IA',
        description: 'Usa nuestro wizard de productos con IA para subir tus creaciones rápidamente',
        agentId: this.id,
        priority: 'high',
        estimatedTime: '30-45 minutos',
        category: 'Inventario',
        deliverableType: 'product_upload_wizard',
        isUnlocked: true,
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Accede al Wizard de Productos',
            description: 'Herramienta especializada para subir productos rápidamente',
            isCompleted: false,
            inputType: 'text',
            aiContextPrompt: 'Redirect to /productos/subir'
          },
          {
            id: 'step-2',
            stepNumber: 2,
            title: 'Sube fotos de tus productos',
            description: 'El wizard te guiará para tomar fotos de calidad',
            isCompleted: false,
            inputType: 'file'
          },
          {
            id: 'step-3',
            stepNumber: 3,
            title: 'Genera descripciones con IA',
            description: 'La IA creará descripciones atractivas automáticamente',
            isCompleted: false,
            inputType: 'chat'
          }
        ]
      });
    } else {
      tasks.push({
        id: 'inventory-optimize-descriptions',
        title: 'Mejora Descripciones con IA',
        description: 'Usa inteligencia artificial para crear descripciones atractivas',
        agentId: this.id,
        priority: 'medium',
        estimatedTime: '30 minutos',
        category: 'Inventario',
        isUnlocked: true,
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Revisa productos con descripciones cortas',
            description: 'Identifica cuáles necesitan mejoras',
            isCompleted: false,
            inputType: 'selection'
          },
          {
            id: 'step-2',
            stepNumber: 2,
            title: 'Genera descripciones mejoradas',
            description: 'Usa la herramienta de IA del dashboard',
            isCompleted: false,
            inputType: 'chat'
          }
        ]
      });

      tasks.push({
        id: 'inventory-categories',
        title: 'Organiza por Categorías',
        description: 'Agrupa tus productos para que sean fáciles de encontrar',
        agentId: this.id,
        priority: 'low',
        estimatedTime: '20 minutos',
        category: 'Inventario',
        isUnlocked: true,
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Define 3-5 categorías',
            description: 'Ej: joyería, textiles, cerámica',
            isCompleted: false,
            inputType: 'text'
          },
          {
            id: 'step-2',
            stepNumber: 2,
            title: 'Asigna cada producto a una categoría',
            description: 'Organiza tu catálogo',
            isCompleted: false,
            inputType: 'selection'
          }
        ]
      });
    }

    return tasks;
  }

  async validateCompletion(task: GeneratedTask, userContext: UserContext): Promise<ValidationResult> {
    const allStepsCompleted = task.steps.every(step => step.isCompleted);
    
    if (!allStepsCompleted) {
      return {
        isValid: false,
        message: 'Completa todos los pasos para optimizar tu inventario',
        nextSteps: task.steps
          .filter(s => !s.isCompleted)
          .map(s => s.title)
      };
    }

    return {
      isValid: true,
      message: '¡Perfecto! Tu inventario está mejor organizado.',
      deliverable: {
        id: `deliverable-${task.id}`,
        taskId: task.id,
        title: 'Reporte de Inventario Optimizado',
        description: 'Tu catálogo mejorado y organizado',
        type: 'report',
        agentId: 'inventory',
        agentName: 'Inventory Agent',
        content: { 
          totalProducts: userContext.productsCount,
          improvements: 'Mejoras aplicadas'
        },
        createdAt: new Date()
      }
    };
  }
}

export const inventoryAgent = new InventoryAgent();
