
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateSuggestedActions(
  taskContext: any, 
  response: string, 
  language: 'en' | 'es'
): ChatAction[] {
  const actions: ChatAction[] = [];
  
  if (!taskContext) return actions;
  
  const lowerResponse = response.toLowerCase();
  
  // Task completion suggestions
  if (lowerResponse.includes('completar') || lowerResponse.includes('complete') || 
      lowerResponse.includes('finalizar') || lowerResponse.includes('finish')) {
    actions.push({
      id: 'complete-task',
      label: language === 'es' ? 'Marcar como completado' : 'Mark as completed',
      type: 'task-action',
      priority: 'high',
      context: { taskId: taskContext.taskId, action: 'complete' }
    });
  }
  
  // Next step suggestions
  if (lowerResponse.includes('siguiente') || lowerResponse.includes('next') ||
      lowerResponse.includes('paso') || lowerResponse.includes('step')) {
    actions.push({
      id: 'next-step',
      label: language === 'es' ? 'Ir al siguiente paso' : 'Go to next step',
      type: 'task-action',
      priority: 'medium',
      context: { taskId: taskContext.taskId, action: 'next_step' }
    });
  }
  
  // Subtask suggestions
  if (lowerResponse.includes('subtarea') || lowerResponse.includes('subtask') ||
      lowerResponse.includes('dividir') || lowerResponse.includes('break down')) {
    actions.push({
      id: 'add-subtask',
      label: language === 'es' ? 'Añadir subtarea' : 'Add subtask',
      type: 'task-action',
      priority: 'medium',
      context: { taskId: taskContext.taskId, action: 'add_subtask' }
    });
  }
  
  // Questions suggestions
  if (lowerResponse.includes('pregunta') || lowerResponse.includes('question') ||
      lowerResponse.includes('duda') || lowerResponse.includes('doubt')) {
    actions.push({
      id: 'ask-questions',
      label: language === 'es' ? 'Hacer preguntas específicas' : 'Ask specific questions',
      type: 'conversation',
      priority: 'low',
      context: { taskId: taskContext.taskId, action: 'ask_questions' }
    });
  }
  
  // Resource suggestions
  if (lowerResponse.includes('recurso') || lowerResponse.includes('resource') ||
      lowerResponse.includes('herramienta') || lowerResponse.includes('tool')) {
    actions.push({
      id: 'add-resource',
      label: language === 'es' ? 'Guardar como recurso' : 'Save as resource',
      type: 'resource',
      priority: 'low',
      context: { taskId: taskContext.taskId, action: 'add_resource' }
    });
  }
  
  // Checklist suggestions
  if (lowerResponse.includes('lista') || lowerResponse.includes('checklist') ||
      lowerResponse.includes('pasos') || lowerResponse.includes('steps')) {
    actions.push({
      id: 'add-checklist',
      label: language === 'es' ? 'Crear checklist' : 'Create checklist',
      type: 'task-action',
      priority: 'medium',
      context: { taskId: taskContext.taskId, action: 'create_checklist' }
    });
  }
  
  return actions.slice(0, 3); // Limit to 3 actions max
}

interface ChatAction {
  id: string;
  label: string;
  type: 'task-action' | 'conversation' | 'resource';
  priority: 'high' | 'medium' | 'low';
  context?: {
    taskId?: string;
    action?: string;
    data?: any;
  };
}

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  language: 'en' | 'es';
  questionContext?: {
    id: string;
    title: string;
    subtitle?: string;
  };
  taskContext?: {
    taskId: string;
    agentId: string;
    taskTitle: string;
    taskDescription?: string;
  };
  userId?: string;
  agentId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { messages, language, questionContext, taskContext, userId, agentId }: ChatRequest = await req.json();
    
    // Initialize Supabase client for task context
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let systemPrompt: string | undefined;
    let additionalContext = "";

    // Check if we should use master context system
    if (userId && agentId) {
      try {
        console.log('Getting master prompt for user:', userId, 'agent:', agentId);
        
        const { data: promptResponse, error: promptError } = await supabase.functions.invoke('master-prompt-generator', {
          body: { agentId, userId, language }
        });

        if (promptResponse && promptResponse.success) {
          systemPrompt = promptResponse.systemPrompt;
          console.log('Using master context system prompt');
        } else {
          console.warn('Failed to get master prompt:', promptError);
        }
      } catch (error) {
        console.error('Error getting master context:', error);
      }
    }

    // If we have task context, get task details and create specialized prompt
    if (taskContext) {
      try {
        const { data: taskData } = await supabase
          .from('agent_tasks')
          .select('*')
          .eq('id', taskContext.taskId)
          .single();

        if (taskData) {
          additionalContext = `
Task Details:
- Title: ${taskData.title}
- Description: ${taskData.description || 'No specific description'}
- Current Progress: ${taskData.progress_percentage}%
- Status: ${taskData.status}
- Agent: ${taskContext.agentId}
`;

          systemPrompt = language === 'es'
            ? `Eres un agente especializado trabajando específicamente en el desarrollo de una tarea con el usuario. 

${additionalContext}

Tu rol es ser un mentor experto que guía al usuario paso a paso para completar esta tarea específica. Debes:
- Proporcionar pasos claros y accionables
- Dar recursos específicos y herramientas útiles
- Hacer preguntas para entender mejor las necesidades del usuario
- Celebrar el progreso y mantener la motivación
- Resolver problemas específicos que surjan
- Adaptar tu enfoque según el progreso actual

Mantén un tono amigable, profesional y enfocado en resultados. Tu objetivo es que el usuario complete exitosamente esta tarea.`
            : `You are a specialized agent working specifically on developing a task with the user.

${additionalContext}

Your role is to be an expert mentor who guides the user step by step to complete this specific task. You should:
- Provide clear and actionable steps
- Give specific resources and useful tools
- Ask questions to better understand user needs
- Celebrate progress and maintain motivation
- Solve specific problems that arise
- Adapt your approach based on current progress

Maintain a friendly, professional tone focused on results. Your goal is for the user to successfully complete this task.`;
        }
      } catch (error) {
        console.error('Error fetching task context:', error);
      }
    }

    // Fallback to original logic if no task context or if task context failed
    if (!systemPrompt) {
      if (questionContext && questionContext.title) {
        systemPrompt = language === 'es'
          ? `Eres una persona curiosa que quiere conocer más sobre el emprendimiento del usuario relacionado con: "${questionContext.title}" ${questionContext.subtitle ? `(${questionContext.subtitle})` : ''}.

INSTRUCCIONES CRÍTICAS:
- Solo haz preguntas simples y directas
- Máximo 8-10 palabras por pregunta
- NUNCA des consejos, sugerencias o recomendaciones
- NO uses palabras como "recomiendo", "deberías", "sería bueno"
- Solo siente curiosidad genuina por conocer más

Ejemplos de preguntas CORRECTAS:
- "¿Cuánto tiempo dedicas diariamente?"
- "¿Qué es lo más difícil?"
- "¿Ya tienes clientes?"
- "¿Qué te motiva más?"

Ejemplos de lo que NUNCA debes hacer:
- "Te recomiendo que..."
- "Sería bueno implementar..."
- "Deberías considerar..."
- Análisis o consejos de cualquier tipo

Solo pregunta. Sé curioso, no consultor.`
          : `You are a curious person who wants to know more about the user's venture related to: "${questionContext.title}" ${questionContext.subtitle ? `(${questionContext.subtitle})` : ''}.

CRITICAL INSTRUCTIONS:
- Only ask simple, direct questions
- Maximum 8-10 words per question
- NEVER give advice, suggestions or recommendations
- DO NOT use words like "recommend", "should", "it would be good"
- Only feel genuine curiosity to know more

Examples of CORRECT questions:
- "How much time do you dedicate daily?"
- "What's the hardest part?"
- "Do you have customers already?"
- "What motivates you most?"

Examples of what you should NEVER do:
- "I recommend that..."
- "It would be good to implement..."
- "You should consider..."
- Analysis or advice of any kind

Just ask. Be curious, not a consultant.`;
      } else {
        systemPrompt = language === 'es'
          ? `Eres una persona curiosa que quiere conocer más sobre el emprendimiento del usuario.

INSTRUCCIONES CRÍTICAS:
- Solo haz preguntas simples y directas
- Máximo 8-10 palabras por pregunta
- NUNCA des consejos, sugerencias o recomendaciones
- NO uses palabras como "recomiendo", "deberías", "sería bueno"
- Solo siente curiosidad genuina por conocer más

Ejemplos de preguntas CORRECTAS:
- "¿En qué consiste tu proyecto?"
- "¿Cuánto tiempo le dedicas?"
- "¿Qué es lo más difícil?"
- "¿Ya tienes clientes?"

Ejemplos de lo que NUNCA debes hacer:
- "Te recomiendo que..."
- "Sería bueno implementar..."
- "Deberías considerar..."
- Análisis o consejos de cualquier tipo

Solo pregunta. Sé curioso, no consultor.`
          : `You are a curious person who wants to know more about the user's venture.

CRITICAL INSTRUCTIONS:
- Only ask simple, direct questions
- Maximum 8-10 words per question
- NEVER give advice, suggestions or recommendations
- DO NOT use words like "recommend", "should", "it would be good"
- Only feel genuine curiosity to know more

Examples of CORRECT questions:
- "What does your project involve?"
- "How much time do you dedicate?"
- "What's the hardest part?"
- "Do you have customers already?"

Examples of what you should NEVER do:
- "I recommend that..."
- "It would be good to implement..."
- "You should consider..."
- Analysis or advice of any kind

Just ask. Be curious, not a consultant.`;
      }
    }

    console.log('Making OpenAI request with model gpt-4.1-2025-04-14...');
    
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
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${errorText}`);
      
      // Provide more specific error messages
      if (response.status === 429) {
        throw new Error(language === 'es' 
          ? 'Has alcanzado el límite de tu cuenta de OpenAI. Por favor revisa tu plan y facturación.'
          : 'You have reached your OpenAI account limit. Please check your plan and billing.');
      } else if (response.status === 401) {
        throw new Error(language === 'es' 
          ? 'Clave de API de OpenAI inválida. Por favor verifica tu configuración.'
          : 'Invalid OpenAI API key. Please check your configuration.');
      } else {
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    const assistantResponse = data.choices[0].message.content;
    
    // Generate suggested actions based on context and response
    const suggestedActions = generateSuggestedActions(taskContext, assistantResponse, language);

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      suggestedActions 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in chat-assistant function:', error);
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        fallback: 'Lo siento, no puedo responder en este momento. Por favor intenta más tarde.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
