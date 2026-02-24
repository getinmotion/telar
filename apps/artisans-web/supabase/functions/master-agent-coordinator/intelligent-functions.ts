// Nuevas funciones inteligentes para el Master Agent Coordinator

// FASE 2: Generar preguntas inteligentes contextuales
export async function generateIntelligentQuestions(userId: string, userProfile: any, supabase: any, openAIApiKey: string, corsHeaders: any) {
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Obtener perfil completo del usuario
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: maturityData } = await supabase
      .from('user_maturity_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Crear contexto completo del perfil
    const profileContext = {
      businessName: profile?.brand_name || 'Negocio sin nombre',
      businessDescription: profile?.business_description || 'Sin descripción',
      businessType: profile?.business_type,
      salesChannels: profile?.sales_channels || [],
      teamSize: profile?.team_size,
      timeAvailability: profile?.time_availability,
      monthlyRevenueGoal: profile?.monthly_revenue_goal,
      currentChallenges: profile?.current_challenges || [],
      businessGoals: profile?.business_goals || [],
      maturityScores: maturityData
    };

    const prompt = `
Eres un Master Coordinator especializado en hacer preguntas inteligentes para profundizar en el perfil empresarial.

PERFIL ACTUAL DEL USUARIO:
Negocio: "${profileContext.businessName}"
Descripción: "${profileContext.businessDescription}"
Tipo: ${profileContext.businessType || 'No definido'}
Canales: ${JSON.stringify(profileContext.salesChannels)}
Equipo: ${profileContext.teamSize || 'No definido'}
Meta mensual: $${profileContext.monthlyRevenueGoal || 'No definido'}
Desafíos: ${JSON.stringify(profileContext.currentChallenges)}

TU MISIÓN: Identifica gaps o información poco clara y genera 3-5 preguntas ESPECÍFICAS para enriquecer el perfil.

EJEMPLOS DE BUENAS PREGUNTAS:
- Si dice "vendo muñecos tejidos" pero no menciona precios → "¿Ya tienes definidos los precios para tus muñecos? ¿Varían según el tamaño o complejidad?"
- Si no menciona canales específicos → "¿Dónde vendes principalmente? ¿Instagram, Facebook, ferias, catálogo físico?"
- Si no hay información de costos → "¿Tienes claro cuánto te cuesta producir cada muñeco? ¿Qué materiales usas?"

INSTRUCCIONES:
1. Analiza QUÉ INFORMACIÓN FALTA o es vaga
2. Genera preguntas conversacionales y específicas
3. Enfócate en información crítica para el negocio
4. Usa el nombre del negocio cuando sea relevante
5. Haz preguntas que ayuden a generar tareas más personalizadas

Responde SOLO con un array JSON:
[{
  "question": "Pregunta específica y conversacional",
  "context": "Por qué esta pregunta es importante para el negocio",
  "category": "pricing|marketing|operations|strategy|product"
}]
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;
    
    // Limpiar respuesta
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const questions = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        questions,
        message: `He generado ${questions.length} preguntas inteligentes para enriquecer tu perfil empresarial.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating intelligent questions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// FASE 5: Crear pasos específicos para tareas
export async function createTaskSteps(taskId: string, taskData: any, profileContext: any, supabase: any, openAIApiKey: string, corsHeaders: any) {
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const prompt = `
Eres un Master Coordinator experto en crear pasos específicos y útiles para tareas empresariales.

TAREA A DESARROLLAR:
Título: "${taskData.title}"
Descripción: "${taskData.description}"

CONTEXTO DEL NEGOCIO:
${JSON.stringify(profileContext)}

INSTRUCCIONES:
1. Crea 3-6 pasos específicos y accionables
2. Cada paso debe ser claro y tener un entregable concreto
3. Usa el contexto del negocio para personalizar los pasos
4. Ordena los pasos lógicamente
5. Incluye validaciones y ayuda contextual

EJEMPLO DE PASOS ESPECÍFICOS:
Para "Definir precios de muñecos tejidos de Cositas lindas":
Paso 1: "Lista todos los tipos de muñecos que haces (bebés, animales, personajes)"
Paso 2: "Calcula el costo de materiales para cada tipo de muñeco"
Paso 3: "Cronometra cuánto tardas en tejer cada tipo"
Paso 4: "Define tu ganancia deseada por hora de trabajo"
Paso 5: "Compara con precios de artesanos similares en tu zona"

Responde SOLO con un array JSON:
[{
  "step_number": 1,
  "title": "Título específico del paso",
  "description": "Descripción detallada y contextual",
  "input_type": "text|number|select|file",
  "validation_criteria": "Criterios de validación",
  "ai_context_prompt": "Prompt para ayuda de IA en este paso",
  "deliverable": "Qué entregable concreto debe producir"
}]
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;
    
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const steps = JSON.parse(aiResponse);

    // Insertar pasos en la base de datos
    const stepsToInsert = steps.map((step: any) => ({
      task_id: taskId,
      step_number: step.step_number,
      title: step.title,
      description: step.description,
      input_type: step.input_type || 'text',
      validation_criteria: step.validation_criteria || {},
      ai_context_prompt: step.ai_context_prompt,
      completion_status: 'pending'
    }));

    const { data: insertedSteps, error } = await supabase
      .from('task_steps')
      .insert(stepsToInsert)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        steps: insertedSteps,
        message: `He creado ${insertedSteps.length} pasos específicos para tu tarea.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating task steps:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Completar paso y generar ayuda contextual
export async function completeStep(taskId: string, stepId: string, stepData: any, userId: string, supabase: any, corsHeaders: any) {
  try {
    // Actualizar el paso como completado
    const { error } = await supabase
      .from('task_steps')
      .update({ 
        completion_status: 'completed',
        user_input_data: stepData,
        updated_at: new Date().toISOString()
      })
      .eq('id', stepId);

    if (error) throw error;

    // Verificar si todos los pasos están completos
    const { data: allSteps } = await supabase
      .from('task_steps')
      .select('completion_status')
      .eq('task_id', taskId);

    const allCompleted = allSteps?.every(step => step.completion_status === 'completed');

    if (allCompleted) {
      // Marcar tarea como completada
      await supabase
        .from('agent_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        allCompleted,
        message: allCompleted ? '¡Tarea completada! Generando entregable...' : 'Paso completado exitosamente.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error completing step:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Generar entregable para tarea completada
export async function generateDeliverable(taskId: string, userId: string, supabase: any, openAIApiKey: string, corsHeaders: any) {
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Obtener información de la tarea y sus pasos
    const { data: task } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    const { data: steps } = await supabase
      .from('task_steps')
      .select('*')
      .eq('task_id', taskId)
      .order('step_number');

    const stepData = steps?.map(step => ({
      title: step.title,
      userInput: step.user_input_data
    }));

    const prompt = `
Eres un experto en crear entregables empresariales profesionales.

TAREA COMPLETADA:
Título: "${task.title}"
Descripción: "${task.description}"

PASOS REALIZADOS Y DATOS:
${JSON.stringify(stepData, null, 2)}

INSTRUCCIONES:
1. Crea un entregable profesional y útil
2. Organiza la información de forma clara
3. Incluye recomendaciones específicas
4. Haz que sea un documento que el usuario pueda usar inmediatamente

FORMATO DE ENTREGABLE:
- Título del documento
- Resumen ejecutivo
- Desarrollo basado en los pasos completados
- Recomendaciones específicas
- Próximos pasos sugeridos

Responde con un documento en formato markdown profesional.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    const deliverableContent = data.choices[0].message.content;

    // Crear entregable en la base de datos
    const { data: deliverable, error } = await supabase
      .from('agent_deliverables')
      .insert({
        user_id: userId,
        task_id: taskId,
        agent_id: task.agent_id,
        title: `Entregable: ${task.title}`,
        description: `Documento generado al completar la tarea: ${task.title}`,
        file_type: 'text',
        content: deliverableContent,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        deliverable,
        message: 'Entregable generado exitosamente.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating deliverable:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}