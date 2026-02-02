// Generador de pasos basado en tipo de agente y tarea
import { getMilestoneSteps } from './milestoneWizards';

export interface GeneratedStep {
  step_number: number;
  title: string;
  description: string;
  input_type: string;
  validation_criteria: any;
  ai_context_prompt?: string;
}

// Mapa de agentes a milestones/acciones
const AGENT_TO_MILESTONE_MAP: Record<string, { milestoneId: string, actionId: string }> = {
  'legal-advisor': { milestoneId: 'formalization', actionId: 'complete-nit' },
  'personal-brand-eval': { milestoneId: 'brand', actionId: 'evaluate-identity' },
  'operations-specialist': { milestoneId: 'shop', actionId: 'first-product' },
  'financial-management': { milestoneId: 'formalization', actionId: 'business-profile' },
  'cultural-consultant': { milestoneId: 'community', actionId: 'social-presence' },
};

export function generateStepsForAgent(agentId: string, taskTitle: string): GeneratedStep[] {
  // Intentar mapear agente a milestone/acción conocida
  const mapping = AGENT_TO_MILESTONE_MAP[agentId];
  
  if (mapping) {
    const wizardSteps = getMilestoneSteps(mapping.milestoneId, mapping.actionId);
    
    if (wizardSteps && wizardSteps.length > 0) {
      return wizardSteps.map((step, index) => ({
        step_number: index + 1,
        title: step.title,
        description: step.description || `Completa: ${step.title}`,
        input_type: step.inputType,
        validation_criteria: {
          required: step.required,
          validation: step.validation
        },
        ai_context_prompt: step.description
      }));
    }
  }
  
  // Fallback: generar pasos genéricos basados en el título de la tarea
  return generateGenericSteps(taskTitle);
}

function generateGenericSteps(taskTitle: string): GeneratedStep[] {
  const lowerTitle = taskTitle.toLowerCase();
  
  // Detectar tipo de tarea y generar pasos relevantes
  if (lowerTitle.includes('precio') || lowerTitle.includes('cost')) {
    return [
      {
        step_number: 1,
        title: 'Lista de productos o servicios',
        description: 'Enumera todos los productos o servicios que ofreces',
        input_type: 'textarea',
        validation_criteria: { required: true }
      },
      {
        step_number: 2,
        title: 'Costos de materiales y tiempo',
        description: 'Calcula cuánto te cuesta producir cada ítem',
        input_type: 'textarea',
        validation_criteria: { required: true }
      },
      {
        step_number: 3,
        title: 'Define tus precios',
        description: 'Establece el precio final considerando costos y ganancia deseada',
        input_type: 'number',
        validation_criteria: { required: true }
      }
    ];
  }
  
  if (lowerTitle.includes('marca') || lowerTitle.includes('logo') || lowerTitle.includes('identidad')) {
    return [
      {
        step_number: 1,
        title: 'Nombre de tu marca',
        description: '¿Cómo se llama tu negocio o marca?',
        input_type: 'text',
        validation_criteria: { required: true }
      },
      {
        step_number: 2,
        title: 'Valores de tu marca',
        description: '¿Qué representa tu marca? ¿Qué valores transmite?',
        input_type: 'textarea',
        validation_criteria: { required: true }
      },
      {
        step_number: 3,
        title: 'Logo o imagen',
        description: 'Sube tu logo o una imagen representativa',
        input_type: 'file',
        validation_criteria: { required: false }
      }
    ];
  }
  
  if (lowerTitle.includes('producto') || lowerTitle.includes('inventario')) {
    return [
      {
        step_number: 1,
        title: 'Nombre del producto',
        description: '¿Cómo se llama tu producto?',
        input_type: 'text',
        validation_criteria: { required: true }
      },
      {
        step_number: 2,
        title: 'Descripción detallada',
        description: 'Describe tu producto: características, materiales, tamaño, etc.',
        input_type: 'textarea',
        validation_criteria: { required: true }
      },
      {
        step_number: 3,
        title: 'Fotos del producto',
        description: 'Sube fotos de calidad de tu producto',
        input_type: 'file',
        validation_criteria: { required: false }
      },
      {
        step_number: 4,
        title: 'Precio y stock',
        description: '¿Cuál es el precio y cuántas unidades tienes disponibles?',
        input_type: 'number',
        validation_criteria: { required: true }
      }
    ];
  }
  
  // Pasos genéricos por defecto
  return [
    {
      step_number: 1,
      title: 'Contexto de la tarea',
      description: `Describe el contexto y objetivo de: ${taskTitle}`,
      input_type: 'textarea',
      validation_criteria: { required: true }
    },
    {
      step_number: 2,
      title: 'Recursos necesarios',
      description: '¿Qué necesitas para completar esta tarea?',
      input_type: 'textarea',
      validation_criteria: { required: false }
    },
    {
      step_number: 3,
      title: 'Plan de acción',
      description: 'Define los pasos específicos que vas a seguir',
      input_type: 'textarea',
      validation_criteria: { required: true }
    }
  ];
}
