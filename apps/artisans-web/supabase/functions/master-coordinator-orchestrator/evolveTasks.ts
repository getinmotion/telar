/**
 * evolveTasks - Generación Inteligente de Nuevas Tareas
 * 
 * Analiza el progreso del usuario (tareas completadas + maturity scores)
 * y genera 2-3 tareas nuevas ultra-personalizadas usando IA.
 * 
 * Ahora con soporte para milestone-specific task generation:
 * - Cada tarea tiene un milestone_category
 * - Puede generar tareas para un milestone específico (focus_milestone)
 * - Respeta mapeo milestone → agentes
 */

/**
 * Infiere milestone_category basado en agent_id
 */
function inferMilestoneFromAgent(agentId: string): string | null {
  const milestoneMapping: Record<string, string[]> = {
    formalization: ['legal'],
    brand: ['brand'],
    shop: ['inventory', 'digital-presence'],
    sales: ['pricing'],
    community: ['digital-presence']
  };
  
  for (const [milestone, agents] of Object.entries(milestoneMapping)) {
    if (agents.includes(agentId)) {
      return milestone;
    }
  }
  
  // Default a 'shop' si es growth o no está mapeado
  return 'shop';
}

export async function evolveTasks(
  userId: string, 
  payload: any, 
  userContext: any, 
  supabase: any
) {
  console.log(`[evolveTasks] 🔄 Generating new tasks for user ${userId}`);
  
  const { completedTasks = [], maturityScores = null, userProfile = {} } = payload;
  const focusMilestone = userProfile.focus_milestone;
  const allowedAgents = userProfile.allowed_agents;

  // Analizar categorías de tareas completadas
  const taskCategories = completedTasks.reduce((acc: any, task: any) => {
    const agentId = task.agent_id || 'general';
    acc[agentId] = (acc[agentId] || 0) + 1;
    return acc;
  }, {});

  console.log('[evolveTasks] 📊 Completed task categories:', taskCategories);

  // Construir prompt inteligente con awareness de milestones
  const systemPrompt = `Eres un Master Coordinator experto en negocios artesanales.

MILESTONES DEL CAMINO DEL ARTESANO:
- formalization: Tareas de registro legal, RUT, formalización tributaria
- brand: Tareas de logo, colores, identidad de marca, branding visual
- shop: Tareas de tienda online, productos, inventario, catálogo
- sales: Tareas de precios, ventas, monetización, estrategia comercial
- community: Tareas de redes sociales, comunidad, engagement, audiencia

AGENTES POR MILESTONE:
- formalization → legal, growth
- brand → brand, growth
- shop → inventory, digital-presence, growth
- sales → pricing, growth
- community → digital-presence, growth

${focusMilestone ? `
🎯 ENFOQUE ESPECIAL: Genera tareas EXCLUSIVAMENTE para el milestone "${focusMilestone}".
Agentes permitidos: ${allowedAgents?.join(', ') || 'todos'}
TODAS las tareas DEBEN tener milestone_category="${focusMilestone}"
` : ''}

Tu misión es generar EXACTAMENTE 2-3 tareas nuevas que:
1. Sean el SIGUIENTE PASO LÓGICO después de las tareas completadas
2. Estén CATEGORIZADAS por milestone (milestone_category)
3. Usen agentes apropiados para ese milestone (agent_id)
4. Prioricen áreas con scores de madurez más bajos
5. Sean específicas y accionables (no genéricas)
6. Estén personalizadas para el tipo de negocio del usuario

IMPORTANTE: 
- SIEMPRE especifica milestone_category en cada tarea
- NO repitas tareas ya completadas
- NO generes más de 3 tareas
- Cada tarea debe tener pasos claros y medibles`;

  const userPrompt = `Usuario: ${userContext.businessName || 'Artesano'}
Tipo de artesanía: ${userContext.craftType || 'No especificado'}
Idioma: ${userContext.language}

Tareas Completadas Recientemente:
${completedTasks.map((t: any) => `- ${t.title} (${t.agent_id})`).join('\n') || 'Ninguna aún'}

Scores de Madurez Actuales:
${maturityScores ? `
- Validación de Idea: ${maturityScores.ideaValidation || 0}/100
- Experiencia de Usuario: ${maturityScores.userExperience || 0}/100
- Ajuste al Mercado: ${maturityScores.marketFit || 0}/100
- Monetización: ${maturityScores.monetization || 0}/100
` : 'No evaluado aún'}

Contexto Adicional:
- Tiene tienda: ${userContext.hasShop ? 'Sí' : 'No'}
- Productos: ${userContext.productsCount || 0}
- Onboarding completado: ${userContext.hasCompletedOnboarding ? 'Sí' : 'No'}

Genera 2-3 tareas que sean el SIGUIENTE PASO NATURAL para este usuario.`;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY no configurada");
    }

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
            name: "generate_evolved_tasks",
            description: "Genera tareas inteligentes basadas en progreso",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  minItems: 2,
                  maxItems: 3,
                  items: {
                  type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      agent_id: { 
                        type: "string",
                        enum: allowedAgents && allowedAgents.length > 0 
                          ? allowedAgents 
                          : ["growth", "brand", "pricing", "legal", "inventory", "digital-presence"]
                      },
                      milestone_category: {
                        type: "string",
                        enum: focusMilestone ? [focusMilestone] : ["formalization", "brand", "shop", "sales", "community"],
                        description: "Milestone al que pertenece esta tarea"
                      },
                      priority: { type: "number", minimum: 1, maximum: 5 },
                      relevance: { type: "string", enum: ["high", "medium", "low"] },
                      estimatedTime: { type: "string" },
                      reason: { type: "string", description: "Por qué esta tarea es el siguiente paso lógico" },
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
                    required: ["title", "description", "agent_id", "milestone_category", "priority", "relevance", "estimatedTime", "reason", "steps"]
                  }
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_evolved_tasks" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[evolveTasks] AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No suggestions generated by AI");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log(`[evolveTasks] ✅ Generated ${result.suggestions.length} new tasks`);

    // Insertar tareas en agent_tasks con milestone_category
    const tasksToInsert = result.suggestions.map((task: any) => ({
      user_id: userId,
      agent_id: task.agent_id,
      milestone_category: task.milestone_category || inferMilestoneFromAgent(task.agent_id),
      title: task.title,
      description: task.description,
      priority: task.priority,
      relevance: task.relevance,
      status: 'pending',
      progress_percentage: 0,
      environment: 'production'
    }));

    const { data: insertedTasks, error: insertError } = await supabase
      .from('agent_tasks')
      .insert(tasksToInsert)
      .select();

    if (insertError) {
      console.error('[evolveTasks] Error inserting tasks:', insertError);
      throw insertError;
    }

    // Actualizar master_coordinator_context
    const { data: existingContext } = await supabase
      .from('master_coordinator_context')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingContext) {
      await supabase
        .from('master_coordinator_context')
        .update({
          context_snapshot: {
            ...(existingContext.context_snapshot as any || {}),
            last_evolution_time: new Date().toISOString(),
            tasks_generated_count: result.suggestions.length,
            completed_tasks_analyzed: completedTasks.length,
            generation_trigger: 'auto'
          },
          last_interaction: new Date().toISOString(),
          context_version: (existingContext.context_version || 0) + 1
        })
        .eq('user_id', userId);
    }

    return {
      suggestions: insertedTasks,
      reasonings: result.suggestions.map((t: any) => ({ title: t.title, reason: t.reason })),
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("[evolveTasks] Error:", error);
    
    // Fallback: tarea básica motivacional
    return {
      suggestions: [],
      error: 'Could not generate tasks with AI',
      fallback: true
    };
  }
}
