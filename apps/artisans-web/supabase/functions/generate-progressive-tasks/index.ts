import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskRecommendation {
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  agent_id: string;
  relevance: 'high' | 'medium' | 'low';
  estimated_time: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, language } = await req.json();
    
    console.log('Generate Progressive Tasks request:', { userId, language });

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get completed tasks to analyze progress
    const { data: completedTasks, error: completedError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10);

    if (completedError) {
      console.error('Error fetching completed tasks:', completedError);
    }

    // Get current pending/in-progress tasks
    const { data: activeTasks, error: activeError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'in_progress']);

    if (activeError) {
      console.error('Error fetching active tasks:', activeError);
    }

    // Get user profile and context for better recommendations
    const { data: userContext, error: contextError } = await supabase
      .from('user_master_context')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    // Build task analysis
    const completedTasksAnalysis = completedTasks?.map(task => ({
      title: task.title,
      agent_id: task.agent_id,
      category: task.relevance,
      timeSpent: task.time_spent || 0
    })) || [];

    const activeTasksAnalysis = activeTasks?.map(task => ({
      title: task.title,
      agent_id: task.agent_id,
      status: task.status,
      progress: task.progress_percentage
    })) || [];

    // Generate recommendations using AI
    let taskRecommendations: TaskRecommendation[] = [];

    if (openAIApiKey) {
      try {
        const analysisContext = `
ANÁLISIS DE PROGRESO DEL USUARIO:

TAREAS COMPLETADAS RECIENTEMENTE:
${completedTasksAnalysis.map(task => `- ${task.title} (Agente: ${task.agent_id}, Tiempo: ${task.timeSpent}min)`).join('\n') || 'Ninguna tarea completada aún'}

TAREAS ACTIVAS ACTUALES:
${activeTasksAnalysis.map(task => `- ${task.title} (${task.status}, ${task.progress}% completado)`).join('\n') || 'No hay tareas activas'}

CONTEXTO DEL USUARIO:
${userContext ? `
- Contexto de negocio: ${JSON.stringify(userContext.business_context)}
- Preferencias: ${JSON.stringify(userContext.preferences)}
- Objetivos: ${JSON.stringify(userContext.goals_and_objectives)}
` : 'Contexto no disponible'}
        `.trim();

        const systemPrompt = language === 'es' 
          ? `Eres un consultor experto en gestión de proyectos creativos. Analiza el progreso del usuario y genera 3-5 tareas ESPECÍFICAS que sean:

1. EVOLUTIVAS: Basadas en las tareas ya completadas
2. COMPLEMENTARIAS: Que completen gaps identificados
3. PROGRESIVAS: Que lleven al siguiente nivel de desarrollo
4. ACCIONABLES: Que se puedan completar en 1-2 semanas

CONTEXTO Y PROGRESO:
${analysisContext}

REGLAS DE GENERACIÓN:
- Si completó tareas de validación → sugerir tareas de implementación
- Si completó tareas de investigación → sugerir tareas de ejecución
- Si completó tareas técnicas → sugerir tareas de marketing/ventas
- Si completó tareas de contenido → sugerir tareas de distribución
- SIEMPRE generar al menos 3 tareas incluso si no hay historial

AGENTES DISPONIBLES:
- admin: Administración general
- cultural: Proyectos creativos y culturales  
- accounting: Finanzas y contabilidad
- legal: Aspectos legales
- operations: Operaciones y procesos

FORMATO REQUERIDO - Responde SOLO con JSON válido:
{
  "tasks": [
    {
      "title": "Título específico basado en el progreso",
      "description": "Descripción que conecta con las tareas completadas",
      "priority": 1,
      "agent_id": "cultural",
      "relevance": "high",
      "estimated_time": 90
    }
  ]
}`
          : `You are an expert consultant in creative project management. Analyze the user's progress and generate 3-5 SPECIFIC tasks that are:

1. EVOLUTIONARY: Based on already completed tasks
2. COMPLEMENTARY: Fill identified gaps
3. PROGRESSIVE: Take to the next development level
4. ACTIONABLE: Can be completed in 1-2 weeks

CONTEXT AND PROGRESS:
${analysisContext}

GENERATION RULES:
- If completed validation tasks → suggest implementation tasks
- If completed research tasks → suggest execution tasks
- If completed technical tasks → suggest marketing/sales tasks
- If completed content tasks → suggest distribution tasks
- ALWAYS generate at least 3 tasks even if no history

AVAILABLE AGENTS:
- admin: General administration
- cultural: Creative and cultural projects
- accounting: Finance and accounting
- legal: Legal aspects
- operations: Operations and processes

REQUIRED FORMAT - Respond ONLY with valid JSON:
{
  "tasks": [
    {
      "title": "Specific title based on progress",
      "description": "Description that connects to completed tasks",
      "priority": 1,
      "agent_id": "cultural",
      "relevance": "high",
      "estimated_time": 90
    }
  ]
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: 'Generate progressive task recommendations based on my current progress and context.' }
            ],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const result = data.choices[0].message.content;
          
          try {
            const parsed = JSON.parse(result);
            taskRecommendations = parsed.tasks || [];
            console.log('Generated progressive AI task recommendations:', taskRecommendations.length);
          } catch (parseError) {
            console.error('Failed to parse progressive AI task recommendations:', parseError);
          }
        }
      } catch (aiError) {
        console.error('Progressive AI task generation failed:', aiError);
      }
    }

    // Always provide fallback recommendations
    if (taskRecommendations.length === 0) {
      console.log('Using progressive fallback task recommendations');
      
      // Intelligent fallbacks based on completed tasks
      const hasCompletedTasks = completedTasks && completedTasks.length > 0;
      const completedAgents = new Set(completedTasks?.map(t => t.agent_id) || []);
      
      if (hasCompletedTasks) {
        // Generate next-level tasks based on completed work
        if (completedAgents.has('cultural')) {
          taskRecommendations.push({
            title: language === 'es' ? 'Desarrollar estrategia de promoción' : 'Develop promotion strategy',
            description: language === 'es' 
              ? 'Basándote en tu trabajo cultural completado, crear un plan de promoción específico'
              : 'Based on your completed cultural work, create a specific promotion plan',
            priority: 1,
            agent_id: 'operations',
            relevance: 'high',
            estimated_time: 120
          });
        }
        
        if (completedAgents.has('admin')) {
          taskRecommendations.push({
            title: language === 'es' ? 'Optimizar procesos operativos' : 'Optimize operational processes',
            description: language === 'es'
              ? 'Mejorar los procesos administrativos que ya has establecido'
              : 'Improve the administrative processes you have already established',
            priority: 2,
            agent_id: 'operations',
            relevance: 'medium',
            estimated_time: 90
          });
        }
      }
      
      // Default progressive tasks
      if (taskRecommendations.length === 0) {
        taskRecommendations = [
          {
            title: language === 'es' ? 'Evaluar progreso actual' : 'Evaluate current progress',
            description: language === 'es' 
              ? 'Revisar el estado actual de tu proyecto y planificar próximos pasos'
              : 'Review your project current status and plan next steps',
            priority: 1,
            agent_id: 'admin',
            relevance: 'high',
            estimated_time: 60
          },
          {
            title: language === 'es' ? 'Identificar nuevas oportunidades' : 'Identify new opportunities',
            description: language === 'es'
              ? 'Explorar nuevas direcciones basadas en lo aprendido hasta ahora'
              : 'Explore new directions based on what has been learned so far',
            priority: 2,
            agent_id: 'cultural',
            relevance: 'medium',
            estimated_time: 90
          }
        ];
      }
    }

    // Create tasks in the database
    const createdTasks = [];
    for (const taskRec of taskRecommendations) {
      try {
        const { data: task, error } = await supabase
          .from('agent_tasks')
          .insert({
            user_id: userId,
            agent_id: taskRec.agent_id,
            title: taskRec.title,
            description: taskRec.description,
            priority: taskRec.priority,
            status: 'pending',
            relevance: taskRec.relevance,
            progress_percentage: 0,
            time_spent: 0,
            notes: language === 'es' 
              ? `Tarea progresiva generada basada en tu desarrollo actual. Tiempo estimado: ${taskRec.estimated_time} minutos.`
              : `Progressive task generated based on your current development. Estimated time: ${taskRec.estimated_time} minutes.`
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating progressive task:', error);
        } else {
          createdTasks.push(task);
          console.log('Created progressive task:', task.title);
        }
      } catch (taskError) {
        console.error('Error creating individual progressive task:', taskError);
      }
    }

    console.log(`Successfully created ${createdTasks.length} progressive tasks for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true,
      tasksCreated: createdTasks.length,
      tasks: createdTasks,
      analysisContext: {
        completedTasks: completedTasksAnalysis.length,
        activeTasks: activeTasksAnalysis.length,
        hasUserContext: !!userContext
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-progressive-tasks function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate progressive task recommendations',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});