import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StepData {
  id: string;
  title: string;
  description: string;
  input_type: string;
  ai_context_prompt?: string;
  user_input_data: Record<string, any>;
}

interface RequestBody {
  message: string;
  step: StepData;
  language: 'en' | 'es';
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, step, language, conversation_history }: RequestBody = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build specialized context for the step with HTML formatting
    const stepContext = `
CONTEXTO DEL PASO ACTUAL:
- Paso: ${step.title}
- Descripción: ${step.description}
- Tipo de input esperado: ${step.input_type}
- Datos actuales del usuario: ${JSON.stringify(step.user_input_data)}
${step.ai_context_prompt ? `- Contexto específico: ${step.ai_context_prompt}` : ''}

INSTRUCCIONES CRÍTICAS PARA LA IA:
1. Eres un asistente especializado SOLO en este paso específico
2. NO ofrezcas ayuda sobre otros pasos o temas generales
3. Enfócate en ayudar al usuario a completar ESTE paso exitosamente
4. Proporciona instrucciones claras y accionables
5. Si el usuario hace preguntas fuera del contexto del paso, redirige amablemente
6. Ayuda con ejemplos, aclaraciones o solución de bloqueos específicos de este paso
7. Responde SIEMPRE en ${language === 'es' ? 'español' : 'inglés'}
8. Mantén respuestas concisas y enfocadas en la acción

FORMATO DE RESPUESTA OBLIGATORIO - USA HTML BIEN FORMATEADO:
- **<p>** para párrafos (NUNCA uses \\n\\n)
- **<strong>** para texto en negrilla (NUNCA uses **)
- **<ul><li>** para listas con viñetas
- **<ol><li>** para listas numeradas
- **<br>** solo cuando necesites salto de línea específico
- **<em>** para énfasis sutil
- NUNCA uses markdown (*, **, etc.), SOLO HTML limpio

EJEMPLO DE RESPUESTA CORRECTA:
<p><strong>¡Perfecto!</strong> Para completar este paso te sugiero:</p>
<ul>
<li><strong>Primero:</strong> Define tu actividad específica</li>
<li><strong>Segundo:</strong> Considera tu audiencia</li>
</ul>
<p>¿Te ayudo con algún aspecto específico?</p>
`;

    // Build conversation messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: stepContext
      },
      // Include previous conversation for context
      ...conversation_history.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in step-ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});