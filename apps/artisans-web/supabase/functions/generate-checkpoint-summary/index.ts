import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      checkpointNumber, 
      questionsAnswered, 
      userResponses, 
      language 
    } = await req.json();

    console.log('📊 [CHECKPOINT-SUMMARY] Generating summary:', {
      checkpointNumber,
      questionsCount: questionsAnswered?.length || 0,
      responsesCount: userResponses?.length || 0,
      language
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // ✅ FIX 3: Prompt MEJORADO para manejar casos con/sin respuestas
    const hasResponses = questionsAnswered && questionsAnswered.length > 0;
    
    const systemPrompt = language === 'es'
      ? (hasResponses 
        ? `Eres un coach de crecimiento para negocios creativos y artesanales. Analiza estas ${questionsAnswered.length} respuestas del artesano y genera un resumen específico del NEGOCIO.

Checkpoint ${checkpointNumber}:
${questionsAnswered.map((q: any, i: number) => `
Pregunta ${i + 1} [${q.category || 'General'}]: ${q.question}
Respuesta: ${userResponses[i] || 'Sin respuesta'}
`).join('\n')}

Genera un resumen de 2-3 párrafos cortos (máximo 150 palabras total) que:
1. ANALICE el negocio específico del usuario (¿qué vende? ¿a quién? ¿dónde?)
2. Identifique el tipo de negocio (ej: "negocio artesanal con identidad cultural", "emprendimiento creativo en fase inicial")
3. Destaque fortalezas específicas y oportunidades basadas en las respuestas
4. Mencione brevemente qué está desbloqueando con este progreso

NO digas "has completado X preguntas". Habla DEL NEGOCIO: qué hace, su identidad, su mercado, sus fortalezas.
Usa tono amigable y cercano. Habla directamente al usuario ("tú" o "tu negocio").`
        : `Eres un coach de crecimiento para negocios creativos y artesanales. El usuario está en el checkpoint ${checkpointNumber} pero aún no ha compartido respuestas detalladas.

Genera un mensaje motivador de 2 párrafos cortos (máximo 100 palabras) que:
1. Celebre que está avanzando en su evaluación
2. Mencione que pronto podrás darle recomendaciones personalizadas
3. Anime a continuar para desbloquear insights específicos de su negocio

Usa tono cálido, amigable y motivador. Habla directamente al usuario ("tú").`
      )
      : (hasResponses
        ? `You are a growth coach for creative and artisan businesses. Analyze these ${questionsAnswered.length} artisan responses and generate a specific BUSINESS summary.

Checkpoint ${checkpointNumber}:
${questionsAnswered.map((q: any, i: number) => `
Question ${i + 1} [${q.category || 'General'}]: ${q.question}
Answer: ${userResponses[i] || 'No answer'}
`).join('\n')}

Generate a summary of 2-3 short paragraphs (max 150 words total) that:
1. ANALYZES the user's specific business (what do they sell? to whom? where?)
2. Identifies the business type (e.g., "artisan business with cultural identity", "early-stage creative venture")
3. Highlights specific strengths and opportunities based on responses
4. Briefly mentions what they're unlocking with this progress

DO NOT say "you've completed X questions". Talk ABOUT THE BUSINESS: what it does, its identity, its market, its strengths.
Use a friendly, close tone. Speak directly to the user ("you" or "your business").`
        : `You are a growth coach for creative and artisan businesses. The user is at checkpoint ${checkpointNumber} but hasn't shared detailed responses yet.

Generate a motivational message of 2 short paragraphs (max 100 words) that:
1. Celebrates they're progressing through their assessment
2. Mentions you'll soon be able to give them personalized recommendations
3. Encourages them to continue to unlock specific insights about their business

Use warm, friendly, motivational tone. Speak directly to the user ("you").`
      );

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Genera el resumen ahora.' }
        ],
        max_completion_tokens: 250
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AI-GATEWAY-ERROR]:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || '';

    console.log('✅ [CHECKPOINT-SUMMARY] Generated successfully');

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ [CHECKPOINT-SUMMARY-ERROR]:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
