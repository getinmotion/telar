import { supabase } from '@/integrations/supabase/client';
import { AgentTask } from '@/hooks/useAgentTasks';

interface TaskStepTemplate {
  title: string;
  description: string;
  input_type: 'text' | 'textarea' | 'file' | 'url';
  ai_context_prompt?: string;
  validation_criteria: Record<string, any>;
}

// Template steps for different types of tasks
const getDefaultStepsForTask = (task: { title: string }): TaskStepTemplate[] => {
  const title = task.title.toLowerCase();
  
  // Steps for validation tasks
  if (title.includes('validar') || title.includes('validate') || title.includes('investigar')) {
    return [
      {
        title: 'Definir objetivos de validación',
        description: 'Define qué aspectos específicos necesitas validar de tu idea',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a definir objetivos claros para validar mi idea de negocio',
        validation_criteria: { min_length: 100, requires_specific_goals: true }
      },
      {
        title: 'Identificar público objetivo',
        description: 'Define quiénes son las personas que pueden validar tu idea',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a identificar el público objetivo ideal para validar mi idea',
        validation_criteria: { min_length: 80, requires_demographics: true }
      },
      {
        title: 'Preparar preguntas clave',
        description: 'Crea una lista de preguntas específicas para obtener feedback valioso',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a crear preguntas efectivas para validar mi idea de negocio',
        validation_criteria: { min_questions: 5, requires_open_ended: true }
      },
      {
        title: 'Ejecutar validación',
        description: 'Realiza entrevistas, encuestas o pruebas con tu público objetivo',
        input_type: 'textarea',
        ai_context_prompt: 'Guíame en el proceso de ejecutar la validación con usuarios reales',
        validation_criteria: { min_interactions: 5, requires_feedback: true }
      },
      {
        title: 'Analizar resultados',
        description: 'Analiza el feedback recibido y extrae conclusiones clave',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a analizar los resultados de validación y tomar decisiones',
        validation_criteria: { requires_conclusions: true, requires_next_steps: true }
      }
    ];
  }
  
  // Steps for strategy/planning tasks
  if (title.includes('estrategia') || title.includes('strategy') || title.includes('planificar') || title.includes('plan')) {
    return [
      {
        title: 'Análisis de situación actual',
        description: 'Evalúa tu situación actual y recursos disponibles',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a analizar mi situación actual para desarrollar una estrategia efectiva',
        validation_criteria: { min_length: 150, requires_current_state: true }
      },
      {
        title: 'Definir objetivos estratégicos',
        description: 'Establece objetivos claros, medibles y alcanzables',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a definir objetivos estratégicos SMART para mi negocio',
        validation_criteria: { requires_smart_goals: true, min_objectives: 3 }
      },
      {
        title: 'Investigación y análisis',
        description: 'Investiga el mercado, competencia y oportunidades',
        input_type: 'textarea',
        ai_context_prompt: 'Guíame en la investigación de mercado y análisis competitivo',
        validation_criteria: { requires_market_data: true, requires_competitor_analysis: true }
      },
      {
        title: 'Desarrollar plan de acción',
        description: 'Crea un plan detallado con pasos específicos y cronograma',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a crear un plan de acción detallado con cronograma',
        validation_criteria: { requires_timeline: true, requires_specific_actions: true }
      },
      {
        title: 'Implementación y seguimiento',
        description: 'Ejecuta el plan y establece métricas de seguimiento',
        input_type: 'textarea',
        ai_context_prompt: 'Guíame en la implementación y seguimiento de la estrategia',
        validation_criteria: { requires_metrics: true, requires_review_process: true }
      }
    ];
  }
  
  // Steps for development/creation tasks
  if (title.includes('desarrollar') || title.includes('crear') || title.includes('construir') || title.includes('diseñar')) {
    return [
      {
        title: 'Definir requerimientos',
        description: 'Define claramente qué necesitas crear y sus características',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a definir requerimientos claros para mi proyecto',
        validation_criteria: { min_length: 100, requires_functional_specs: true }
      },
      {
        title: 'Diseñar solución',
        description: 'Crea un diseño o prototipo de tu solución',
        input_type: 'textarea',
        ai_context_prompt: 'Guíame en el diseño de la solución más efectiva',
        validation_criteria: { requires_design_elements: true, requires_user_flow: true }
      },
      {
        title: 'Planificar desarrollo',
        description: 'Organiza las tareas y recursos necesarios para el desarrollo',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a planificar el proceso de desarrollo paso a paso',
        validation_criteria: { requires_task_breakdown: true, requires_resources: true }
      },
      {
        title: 'Implementar MVP',
        description: 'Construye una versión mínima viable de tu solución',
        input_type: 'textarea',
        ai_context_prompt: 'Guíame en la implementación de un MVP efectivo',
        validation_criteria: { requires_working_prototype: true, requires_testing: true }
      },
      {
        title: 'Probar y mejorar',
        description: 'Prueba tu solución y realiza mejoras basadas en feedback',
        input_type: 'textarea',
        ai_context_prompt: 'Ayúdame a probar y mejorar mi solución basándome en feedback',
        validation_criteria: { requires_testing_results: true, requires_improvements: true }
      }
    ];
  }
  
  // Default generic steps for any other task
  return [
    {
      title: 'Planificación inicial',
      description: 'Planifica cómo vas a abordar esta tarea paso a paso',
      input_type: 'textarea',
      ai_context_prompt: 'Ayúdame a planificar cómo abordar esta tarea de manera efectiva',
      validation_criteria: { min_length: 50, requires_plan: true }
    },
    {
      title: 'Investigación y preparación',
      description: 'Investiga y reúne la información necesaria para completar la tarea',
      input_type: 'textarea',
      ai_context_prompt: 'Guíame en la investigación necesaria para esta tarea',
      validation_criteria: { min_length: 80, requires_research: true }
    },
    {
      title: 'Ejecución',
      description: 'Ejecuta la tarea siguiendo tu plan inicial',
      input_type: 'textarea',
      ai_context_prompt: 'Ayúdame durante la ejecución de esta tarea',
      validation_criteria: { min_length: 100, requires_execution_details: true }
    },
    {
      title: 'Revisión y optimización',
      description: 'Revisa los resultados y optimiza según sea necesario',
      input_type: 'textarea',
      ai_context_prompt: 'Ayúdame a revisar y optimizar los resultados obtenidos',
      validation_criteria: { requires_review: true, requires_optimization: true }
    }
  ];
};

/**
 * Migrates existing user tasks to include task steps
 */
export const migrateUserTasksToSteps = async (userId: string): Promise<boolean> => {
  try {
    console.log('Starting task migration for user:', userId);
    
    // 1. Get all user tasks that don't have steps yet
    const { data: tasks, error: tasksError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (tasksError) {
      console.error('Error fetching user tasks:', tasksError);
      return false;
    }
    
    if (!tasks || tasks.length === 0) {
      console.log('No tasks found for user');
      return true;
    }
    
    console.log(`Found ${tasks.length} tasks to migrate`);
    
    // 2. For each task, check if it already has steps
    for (const task of tasks) {
      const { data: existingSteps, error: stepsError } = await supabase
        .from('task_steps')
        .select('id')
        .eq('task_id', task.id)
        .limit(1);
      
      if (stepsError) {
        console.error('Error checking existing steps for task:', task.id, stepsError);
        continue;
      }
      
      // Skip if task already has steps
      if (existingSteps && existingSteps.length > 0) {
        console.log(`Task ${task.id} already has steps, skipping`);
        continue;
      }
      
      // 3. Generate steps for this task
      const stepTemplates = getDefaultStepsForTask({ title: task.title });
      
      const stepsToInsert = stepTemplates.map((template, index) => ({
        task_id: task.id,
        step_number: index + 1,
        title: template.title,
        description: template.description,
        input_type: template.input_type,
        ai_context_prompt: template.ai_context_prompt,
        validation_criteria: template.validation_criteria,
        completion_status: 'pending'
      }));
      
      // 4. Insert steps for this task
      const { error: insertError } = await supabase
        .from('task_steps')
        .insert(stepsToInsert);
      
      if (insertError) {
        console.error('Error inserting steps for task:', task.id, insertError);
        continue;
      }
      
      console.log(`Successfully created ${stepsToInsert.length} steps for task: ${task.title}`);
    }
    
    console.log('Task migration completed successfully');
    return true;
    
  } catch (error) {
    console.error('Failed to migrate user tasks:', error);
    return false;
  }
};

/**
 * Creates basic user master context if it doesn't exist
 */
export const createBasicUserContext = async (userId: string): Promise<boolean> => {
  try {
    console.log('Creating basic user context for user:', userId);
    
    // Check if user already has context
    const { data: existingContext, error: fetchError } = await supabase
      .from('user_master_context')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (fetchError) {
      console.error('Error checking existing context:', fetchError);
      return false;
    }
    
    if (existingContext && existingContext.length > 0) {
      console.log('User already has master context');
      return true;
    }
    
    // Create basic context
    const { error: insertError } = await supabase
      .from('user_master_context')
      .insert({
        user_id: userId,
        business_profile: {
          business_stage: 'idea',
          industry: 'general',
          target_market: 'to_be_defined',
          team_size: 1,
          current_challenges: ['time_management', 'validation', 'planning']
        },
        task_generation_context: {
          preferred_task_complexity: 'medium',
          focus_areas: ['validation', 'planning', 'development'],
          learning_style: 'hands_on',
          available_time_per_week: 10
        },
        language_preference: 'es',
        preferences: {
          notification_settings: { email: true, push: false },
          dashboard_layout: 'comprehensive'
        }
      });
    
    if (insertError) {
      console.error('Error creating basic context:', insertError);
      return false;
    }
    
    console.log('Successfully created basic user context');
    return true;
    
  } catch (error) {
    console.error('Failed to create basic user context:', error);
    return false;
  }
};

/**
 * Performs complete migration for a user
 */
export const performCompleteMigration = async (userId: string): Promise<boolean> => {
  try {
    console.log('Starting complete migration for user:', userId);
    
    // 1. Create basic user context
    const contextCreated = await createBasicUserContext(userId);
    if (!contextCreated) {
      console.error('Failed to create user context');
      return false;
    }
    
    // 2. Migrate tasks to include steps
    const tasksMigrated = await migrateUserTasksToSteps(userId);
    if (!tasksMigrated) {
      console.error('Failed to migrate user tasks');
      return false;
    }
    
    console.log('Complete migration finished successfully');
    return true;
    
  } catch (error) {
    console.error('Complete migration failed:', error);
    return false;
  }
};