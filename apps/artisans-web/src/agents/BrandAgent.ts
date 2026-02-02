/**
 * Brand Agent (Invisible)
 * 
 * Responsabilidades:
 * - Evalúa identidad visual y narrativa
 * - Solicita logo, colores, claim, fotos
 * - Analiza coherencia entre imagen, discurso y valores
 * - Se integra con tienda y presencia digital
 */

import { 
  InvisibleAgent, 
  UserContext, 
  AgentAnalysis, 
  GeneratedTask,
  ValidationResult
} from '@/types/invisibleAgent';

export class BrandAgent implements InvisibleAgent {
  id = 'brand';
  name = 'Agente de Marca';
  description = 'Fortalece la identidad visual y narrativa de tu negocio';

  async analyze(userContext: UserContext): Promise<AgentAnalysis> {
    const hasBusinessName = !!userContext.businessName;
    
    // ✅ FASE 6: Usar diagnóstico de marca si existe
    const brandDiagnosis = (userContext as any).brand_diagnosis;
    
    if (brandDiagnosis && brandDiagnosis.average_score) {
      // Usar datos reales del diagnóstico
      const score = Math.round((brandDiagnosis.average_score / 5) * 100); // Convert 1-5 to 0-100
      
      return {
        agentId: this.id,
        score,
        strengths: brandDiagnosis.strengths || [],
        weaknesses: brandDiagnosis.opportunities || [],
        recommendations: brandDiagnosis.opportunities?.slice(0, 4) || [],
        priority: score >= 60 ? 'low' : score >= 40 ? 'medium' : 'high',
        estimatedImpact: score >= 60 
          ? 'Medio - tu marca está bien encaminada' 
          : 'Alto - tu marca necesita atención'
      };
    }
    
    // Fallback: análisis básico si no hay diagnóstico
    return {
      agentId: this.id,
      score: hasBusinessName ? 40 : 20,
      strengths: hasBusinessName ? ['Tienes un nombre de negocio'] : [],
      weaknesses: [
        'No tienes diagnóstico de marca completo',
        'Completa el Wizard de Marca para análisis profundo'
      ],
      recommendations: [
        'Accede al Wizard de Marca con IA',
        'Completa diagnóstico de identidad visual',
        'Obtén misiones personalizadas de mejora'
      ],
      priority: 'high',
      estimatedImpact: 'Alto - tu marca es tu identidad'
    };
  }

  async generateTasks(analysis: AgentAnalysis, userContext: UserContext): Promise<GeneratedTask[]> {
    const tasks: GeneratedTask[] = [];
    
    // ✅ FASE 6: Si ya existen misiones del diagnóstico, no generar tareas duplicadas
    const brandDiagnosis = (userContext as any).brand_diagnosis;
    if (brandDiagnosis && brandDiagnosis.generated_missions?.length > 0) {
      console.log('[BrandAgent] ✅ Diagnosis missions already exist, skipping generic tasks');
      return []; // Las misiones específicas del diagnóstico ya fueron creadas
    }

    tasks.push({
      id: 'brand-story',
      title: 'Cuenta la Historia de tu Marca',
      description: 'Define quién eres, qué haces y por qué lo haces',
      agentId: this.id,
      priority: 'high',
      estimatedTime: '1-2 horas',
      category: 'Marca',
      deliverableType: 'brand_identity_wizard',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: '¿Por qué empezaste con tu artesanía?',
          description: 'Cuéntame tu historia personal',
          isCompleted: false,
          inputType: 'text',
          aiContextPrompt: 'Ayuda al artesano a contar su historia de forma auténtica y emotiva'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: '¿Qué hace especial tu trabajo?',
          description: '¿Qué te diferencia de otros artesanos?',
          isCompleted: false,
          inputType: 'text'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          title: '¿Para quién creas?',
          description: '¿Quién es tu cliente ideal?',
          isCompleted: false,
          inputType: 'text'
        }
      ]
    });

    tasks.push({
      id: 'brand-visual-identity',
      title: 'Define tu Identidad Visual con IA',
      description: 'Usa nuestro wizard inteligente para crear tu logo, colores y claim',
      agentId: this.id,
      priority: 'medium',
      estimatedTime: '20-30 minutos',
      category: 'Marca',
      deliverableType: 'brand_identity_wizard',
      isUnlocked: true,
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          title: 'Accede al Wizard de Marca',
          description: 'Herramienta especializada con IA para crear tu identidad',
          isCompleted: false,
          inputType: 'text',
          aiContextPrompt: 'Redirect to /brand-wizard'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          title: 'Sube tu logo o genera uno con IA',
          description: 'El wizard extraerá colores automáticamente',
          isCompleted: false,
          inputType: 'file'
        },
        {
          id: 'step-3',
          stepNumber: 3,
          title: 'Genera tu claim con IA',
          description: 'La IA creará un claim memorable basado en tu marca',
          isCompleted: false,
          inputType: 'chat'
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
        message: 'Completa todos los pasos para fortalecer tu marca',
        nextSteps: task.steps
          .filter(s => !s.isCompleted)
          .map(s => s.title)
      };
    }

    return {
      isValid: true,
      message: '¡Excelente! Tu identidad de marca está tomando forma.',
      deliverable: {
        id: `deliverable-${task.id}`,
        taskId: task.id,
        title: 'Guía de Identidad de Marca',
        description: 'Tu historia, valores, logo y colores en un solo lugar',
        type: 'guide',
        agentId: 'brand',
        agentName: 'Brand Agent',
        content: { 
          story: 'Historia de la marca',
          visualIdentity: 'Logo y colores',
          claim: 'Frase de la marca'
        },
        createdAt: new Date()
      }
    };
  }
}

export const brandAgent = new BrandAgent();
