/**
 * Master Coordinator Orchestrator - Block 4
 * 
 * Orquesta los agentes invisibles usando IA real (Lovable AI).
 * - Análisis contextual profundo
 * - Generación de tareas personalizadas
 * - Validación inteligente de completitud
 * - Evolución de tareas basada en progreso (NUEVO)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { evolveTasks } from './evolveTasks.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentInvocation {
  type: 'analyze' | 'generate_tasks' | 'validate_task';
  agentId: string;
  userId: string;
  payload?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const invocation: AgentInvocation = await req.json();
    const { type, agentId, userId, payload } = invocation;

    console.log(`[Orchestrator] ${type} request for agent ${agentId} by user ${userId}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Cargar contexto del usuario
    const { data: profileData } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: scoresData } = await supabaseClient
      .from('user_maturity_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: shopsData } = await supabaseClient
      .from('artisan_shops')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    const hasShop = (shopsData && shopsData.length > 0);
    const shopId = hasShop ? shopsData[0].id : null;

    let productsCount = 0;
    if (shopId) {
      const { count } = await supabaseClient
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId);
      productsCount = count || 0;
    }

    const userContext = {
      userId,
      businessName: profileData?.brand_name || profileData?.full_name,
      craftType: profileData?.business_type,
      maturityScores: scoresData ? {
        ideaValidation: scoresData.idea_validation,
        userExperience: scoresData.user_experience,
        marketFit: scoresData.market_fit,
        monetization: scoresData.monetization
      } : undefined,
      hasShop,
      productsCount,
      hasCompletedOnboarding: !!scoresData,
      language: (profileData?.language_preference || 'es') as 'es' | 'en' | 'pt' | 'fr',
      profileData
    };

    // Respuesta según el tipo de invocación
    let response: any;

    switch (type) {
      case 'analyze':
        response = await analyzeUserContext(agentId, userContext);
        break;
      
      case 'generate_tasks':
        response = await generateAgentTasks(agentId, userContext, supabaseClient);
        break;
      
      case 'validate_task':
        response = await validateTaskCompletion(agentId, payload.taskId, userContext, supabaseClient);
        break;
      
      case 'evolve_tasks':
        response = await evolveTasks(userId, payload, userContext, supabaseClient);
        break;
      
      default:
        throw new Error(`Unknown invocation type: ${type}`);
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        data: response,
        events: [`${agentId}.${type}.completed`]
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[Orchestrator] Error:", error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
        events: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Llama a Lovable AI para análisis inteligente
 */
async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY no configurada");
  }

  console.log("[AI] Calling Lovable AI...");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [{
        type: "function",
        function: {
          name: "analyze_context",
          description: "Analiza el contexto del usuario y retorna un análisis estructurado",
          parameters: {
            type: "object",
            properties: {
              score: { type: "number", description: "Puntuación 0-100" },
              strengths: { 
                type: "array", 
                items: { type: "string" },
                description: "Fortalezas identificadas"
              },
              weaknesses: { 
                type: "array", 
                items: { type: "string" },
                description: "Áreas de mejora"
              },
              recommendations: { 
                type: "array", 
                items: { type: "string" },
                description: "Recomendaciones accionables"
              },
              priority: { 
                type: "string", 
                enum: ["low", "medium", "high"],
                description: "Nivel de prioridad"
              },
              estimatedImpact: { type: "string", description: "Impacto estimado" }
            },
            required: ["score", "strengths", "weaknesses", "recommendations", "priority", "estimatedImpact"],
            additionalProperties: false
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "analyze_context" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[AI] Error:", response.status, errorText);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall) {
    throw new Error("No se recibió respuesta estructurada de la IA");
  }

  return JSON.parse(toolCall.function.arguments);
}

async function analyzeUserContext(agentId: string, userContext: any) {
  console.log(`[Orchestrator] AI-powered analysis for agent: ${agentId}`);
  
  const systemPrompt = `Eres un experto consultor de negocios artesanales que analiza el contexto de usuarios para el agente "${agentId}".

Tu tarea es analizar el contexto del usuario y proporcionar:
- Una puntuación de 0-100 sobre su estado actual
- Fortalezas específicas identificadas
- Debilidades o áreas de mejora
- Recomendaciones accionables y concretas
- Prioridad (low, medium, high)
- Estimación del impacto potencial

Sé específico, práctico y empático. Adapta tu análisis al contexto cultural artesanal.`;

  const userPrompt = `Analiza este contexto de usuario para el agente "${agentId}":

Negocio: ${userContext.businessName || 'Sin nombre'}
Tipo de artesanía: ${userContext.craftType || 'No especificado'}
Idioma: ${userContext.language}

${userContext.maturityScores ? `
Puntuaciones de Madurez:
- Validación de Idea: ${userContext.maturityScores.ideaValidation}/100
- Experiencia de Usuario: ${userContext.maturityScores.userExperience}/100
- Ajuste al Mercado: ${userContext.maturityScores.marketFit}/100
- Monetización: ${userContext.maturityScores.monetization}/100
` : 'No ha completado la evaluación de madurez'}

Tiene tienda: ${userContext.hasShop ? 'Sí' : 'No'}
Productos en catálogo: ${userContext.productsCount}

Proporciona un análisis detallado y accionable.`;

  try {
    const aiAnalysis = await callLovableAI(systemPrompt, userPrompt);
    return {
      agentId,
      ...aiAnalysis
    };
  } catch (error) {
    console.error("[Orchestrator] AI analysis failed, using fallback:", error);
    // Fallback a lógica básica si la IA falla
    return {
      agentId,
      score: 50,
      strengths: ["Usuario activo"],
      weaknesses: ["Análisis IA no disponible temporalmente"],
      recommendations: ["Intenta de nuevo más tarde"],
      priority: 'medium',
      estimatedImpact: 'Medio'
    };
  }
}

async function generateAgentTasks(agentId: string, userContext: any, supabase: any) {
  console.log(`[Orchestrator] AI-powered task generation for agent: ${agentId}`);
  
  const systemPrompt = `Eres un experto en diseñar planes de acción para negocios artesanales.

Tu tarea es generar 2-4 tareas específicas y accionables para el agente "${agentId}" según el contexto del usuario.

Cada tarea debe:
- Tener un título claro y motivador
- Describir el valor que aporta
- Incluir 2-4 pasos concretos
- Ser realista en tiempo y esfuerzo
- Adaptarse al nivel de madurez del usuario

Genera tareas progresivas: desde fundamentos hasta optimizaciones avanzadas.`;

  const userPrompt = `Genera tareas para el agente "${agentId}" considerando:

Negocio: ${userContext.businessName || 'Sin nombre'}
Tipo: ${userContext.craftType || 'Artesanía'}
Idioma: ${userContext.language}

${userContext.maturityScores ? `
Madurez Actual:
- Validación: ${userContext.maturityScores.ideaValidation}/100
- UX: ${userContext.maturityScores.userExperience}/100
- Mercado: ${userContext.maturityScores.marketFit}/100
- Monetización: ${userContext.maturityScores.monetization}/100
` : 'Nuevo usuario, sin evaluación'}

Tienda: ${userContext.hasShop ? 'Sí' : 'No'}
Productos: ${userContext.productsCount}

Genera tareas personalizadas y motivadoras.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_tasks",
            description: "Genera tareas personalizadas",
            parameters: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      estimatedTime: { type: "string" },
                      category: { type: "string" },
                      steps: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" }
                          },
                          required: ["title", "description"]
                        }
                      }
                    },
                    required: ["title", "description", "priority", "estimatedTime", "category", "steps"]
                  }
                }
              },
              required: ["tasks"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_tasks" } }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tasks generated");
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Formatear tareas con IDs y estructura completa
    return result.tasks.map((task: any, index: number) => ({
      id: `${agentId}-task-${Date.now()}-${index}`,
      agentId,
      isUnlocked: index === 0, // Solo la primera está desbloqueada
      ...task,
      steps: task.steps.map((step: any, stepIndex: number) => ({
        id: `step-${stepIndex + 1}`,
        stepNumber: stepIndex + 1,
        isCompleted: false,
        ...step
      }))
    }));

  } catch (error) {
    console.error("[Orchestrator] AI task generation failed:", error);
    
    // Fallback: tarea básica
    return [{
      id: `${agentId}-fallback-${Date.now()}`,
      title: userContext.language === 'es' ? 'Comienza tu viaje' : 'Start your journey',
      description: userContext.language === 'es' 
        ? 'Explora las funcionalidades disponibles' 
        : 'Explore available features',
      agentId,
      priority: 'medium',
      estimatedTime: '5-10 min',
      category: 'Inicio',
      isUnlocked: true,
      steps: [{
        id: 'step-1',
        stepNumber: 1,
        title: userContext.language === 'es' ? 'Explora el dashboard' : 'Explore dashboard',
        description: userContext.language === 'es' ? 'Familiarízate con las opciones' : 'Get familiar with options',
        isCompleted: false
      }]
    }];
  }
}

async function validateTaskCompletion(
  agentId: string, 
  taskId: string, 
  userContext: any, 
  supabase: any
) {
  console.log(`[Orchestrator] AI-powered validation for task ${taskId}`);
  
  // Obtener la tarea y sus pasos
  const { data: taskData } = await supabase
    .from('agent_tasks')
    .select(`
      *,
      task_steps (*)
    `)
    .eq('id', taskId)
    .single();

  if (!taskData) {
    throw new Error('Tarea no encontrada');
  }

  const steps = (taskData as any).task_steps || [];
  const completedSteps = steps.filter((s: any) => s.completion_status === 'completed');
  const allStepsCompleted = completedSteps.length === steps.length;

  if (!allStepsCompleted) {
    return {
      isValid: false,
      message: 'Aún hay pasos pendientes por completar',
      progress: `${completedSteps.length}/${steps.length}`,
      nextSteps: steps
        .filter((s: any) => s.completion_status !== 'completed')
        .map((s: any) => s.title)
    };
  }

  // Usar IA para generar un resumen inteligente y recomendaciones
  const systemPrompt = `Eres un mentor que celebra logros y guía próximos pasos.

Genera un mensaje motivador de completitud y recomendaciones personalizadas para continuar el crecimiento.`;

  const userPrompt = `El usuario completó la tarea: "${taskData.title}"
Descripción: ${taskData.description}
Agente: ${agentId}
Pasos completados: ${steps.map((s: any) => s.title).join(', ')}

Contexto del usuario:
- Negocio: ${userContext.businessName}
- Tipo: ${userContext.craftType}
- Nivel de madurez promedio: ${userContext.maturityScores ? 
  Math.round((userContext.maturityScores.ideaValidation + 
    userContext.maturityScores.userExperience + 
    userContext.maturityScores.marketFit + 
    userContext.maturityScores.monetization) / 4) : 'No evaluado'}

Genera un mensaje celebratorio y 2-3 recomendaciones concretas de qué hacer a continuación.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_completion_summary",
            description: "Genera resumen de completitud",
            parameters: {
              type: "object",
              properties: {
                celebrationMessage: { type: "string", description: "Mensaje motivador" },
                keyLearnings: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Aprendizajes clave"
                },
                nextRecommendations: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Próximos pasos recomendados"
                }
              },
              required: ["celebrationMessage", "keyLearnings", "nextRecommendations"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_completion_summary" } }
      }),
    });

    let aiSummary;
    if (response.ok) {
      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        aiSummary = JSON.parse(toolCall.function.arguments);
      }
    }

    return {
      isValid: true,
      message: aiSummary?.celebrationMessage || '¡Excelente! Has completado esta misión.',
      deliverable: {
        id: `deliverable-${taskId}`,
        taskId,
        title: `Resumen: ${taskData.title}`,
        description: 'Aprendizajes y próximos pasos',
        type: 'report',
        content: {
          taskTitle: taskData.title,
          completedSteps: steps.map((s: any) => s.title),
          keyLearnings: aiSummary?.keyLearnings || ['Tarea completada exitosamente'],
          nextRecommendations: aiSummary?.nextRecommendations || ['Continúa con la siguiente misión']
        },
        createdAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error("[Orchestrator] AI validation failed:", error);
    
    // Fallback
    return {
      isValid: true,
      message: '¡Excelente! Has completado esta misión.',
      deliverable: {
        id: `deliverable-${taskId}`,
        taskId,
        title: `Resumen: ${taskData.title}`,
        description: 'Misión completada',
        type: 'report',
        content: { 
          summary: 'Tarea completada exitosamente',
          completedSteps: steps.map((s: any) => s.title)
        },
        createdAt: new Date().toISOString()
      }
    };
  }
}
