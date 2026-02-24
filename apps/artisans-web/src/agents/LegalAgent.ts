/**
 * Legal Agent (Invisible)
 * 
 * Responsabilidades:
 * - Ayuda con trámites básicos (registro, contratos, RUT)
 * - Puede conectarse con la DIAN vía API (futuro)
 * - Modo chat especializado o wizard orientativo
 */

import { 
  InvisibleAgent, 
  UserContext, 
  AgentAnalysis, 
  GeneratedTask,
  ValidationResult
} from '@/types/invisibleAgent';

export class LegalAgent implements InvisibleAgent {
  id = 'legal';
  name = 'Agente Legal';
  description = 'Te guío en formalización y trámites legales';

  async analyze(userContext: UserContext): Promise<AgentAnalysis> {
    // En producción, consultaría si tiene RUT, está formalizado, etc.
    const needsRUT = true; // placeholder
    
    return {
      agentId: this.id,
      score: needsRUT ? 20 : 80,
      strengths: needsRUT ? [] : ['Tienes RUT activo'],
      weaknesses: needsRUT 
        ? ['No tienes RUT', 'Negocio no formalizado']
        : ['Pendiente: contratos con clientes'],
      recommendations: [
        'Obtén tu RUT en la DIAN',
        'Regístrate en Cámara de Comercio',
        'Conoce tus obligaciones tributarias',
        'Crea plantillas de contratos básicos'
      ],
      priority: needsRUT ? 'medium' : 'low',
      estimatedImpact: needsRUT ? 'Alto - para vender formalmente' : 'Bajo - mantenimiento'
    };
  }

  async generateTasks(analysis: AgentAnalysis, userContext: UserContext): Promise<GeneratedTask[]> {
    const tasks: GeneratedTask[] = [];

    tasks.push({
      id: 'legal-rut-guide',
      title: 'Obtén tu RUT',
      description: 'Guía paso a paso para registrarte en la DIAN',
      agentId: this.id,
      priority: 'medium',
      estimatedTime: '1-2 días',
      category: 'Legal',
      isUnlocked: true,
      deliverableType: 'guide',
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Reúne documentos necesarios',
          description: 'Cédula, certificado de residencia, actividad económica',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Registra en portal DIAN',
          description: 'Crea tu cuenta en dian.gov.co',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          title: 'Completa solicitud de RUT',
          description: 'Ingresa información de tu negocio artesanal',
          isCompleted: false,
          inputType: 'text',
          aiContextPrompt: 'Guía al artesano con ejemplos específicos para artesanos colombianos'
        },
        {
          id: 'step-4',
          stepNumber: 4,
          title: 'Descarga tu RUT',
          description: 'Una vez aprobado, descarga el documento',
          isCompleted: false,
          inputType: 'file'
        }
      ]
    });

    tasks.push({
      id: 'legal-business-basics',
      title: 'Formaliza tu Negocio',
      description: 'Pasos para operar legalmente como artesano',
      agentId: this.id,
      priority: 'medium',
      estimatedTime: '1 semana',
      category: 'Legal',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Define tu tipo de persona',
          description: '¿Natural o jurídica? Te ayudo a decidir',
          isCompleted: false,
          inputType: 'selection',
          aiContextPrompt: 'Explica diferencias entre persona natural y jurídica para artesanos'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Regístrate en Cámara de Comercio',
          description: 'Si decides formalizar como empresa',
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
        message: 'Completa todos los pasos para formalizar tu negocio',
        nextSteps: task.steps
          .filter(s => !s.isCompleted)
          .map(s => s.title)
      };
    }

    return {
      isValid: true,
      message: '¡Excelente! Estás más cerca de operar formalmente.',
      deliverable: {
        id: `deliverable-${task.id}`,
        taskId: task.id,
        title: 'Guía de Formalización',
        description: 'Documentos y pasos completados para tu formalización',
        type: 'guide',
        agentId: 'legal',
        agentName: 'Legal Agent',
        content: { 
          documents: 'Lista de documentos completados',
          nextSteps: 'Qué sigue después de esto'
        },
        createdAt: new Date()
      }
    };
  }
}

export const legalAgent = new LegalAgent();
