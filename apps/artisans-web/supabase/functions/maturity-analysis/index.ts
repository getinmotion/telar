import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaturityAnalysisRequest {
  scores: {
    ideaValidation: number;
    userExperience: number;
    marketFit: number;
    monetization: number;
  };
  profileType: 'idea' | 'solo' | 'team';
  profileData: any;
  language: 'en' | 'es';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { scores, profileType, profileData, language }: MaturityAnalysisRequest = await req.json();

    const systemPrompt = language === 'es' 
      ? `Eres una persona muy curiosa que quiere conocer mejor su emprendimiento. Tu único trabajo es hacer preguntas simples y directas para conocer más detalles.

### Información que ya sabes:
- Tipo: ${profileType === 'idea' ? 'Solo tiene una idea' : profileType === 'solo' ? 'Trabaja solo' : 'Tiene equipo'}
- Sus respuestas: ${JSON.stringify(profileData, null, 2)}

### REGLAS ESTRICTAS:
- Haz exactamente 3 preguntas
- Máximo 8-10 palabras por pregunta
- Solo preguntas simples y directas
- NUNCA des consejos, recomendaciones o sugerencias
- NUNCA uses palabras como "te recomiendo", "deberías", "sería bueno"

### EJEMPLOS de preguntas CORRECTAS:
- "¿Cuánto tiempo dedicas diariamente al proyecto?"
- "¿Qué es lo más difícil hasta ahora?"
- "¿Tienes clientes pagando ya?"
- "¿Cuántas personas usan tu producto?"

### EJEMPLOS de lo que NUNCA debes hacer:
- "Te recomiendo que desarrolles..."
- "Sería bueno implementar..."
- "Deberías considerar..."

### Formato JSON estricto:
{
  "questions": [
    {
      "question": "Pregunta súper corta (máximo 8-10 palabras)",
      "context": "Quiero conocer este aspecto"
    }
  ]
}`
      : `You're a very curious person who wants to know more about their venture. Your only job is to ask simple, direct questions to learn more details.

### What you already know:
- Type: ${profileType === 'idea' ? 'Just has an idea' : profileType === 'solo' ? 'Works alone' : 'Has a team'}
- Their answers: ${JSON.stringify(profileData, null, 2)}

### STRICT RULES:
- Ask exactly 3 questions
- Maximum 8-10 words per question
- Only simple, direct questions
- NEVER give advice, recommendations or suggestions
- NEVER use words like "I recommend", "you should", "it would be good"

### EXAMPLES of CORRECT questions:
- "How much time daily do you spend on this?"
- "What's the hardest part so far?"
- "Do you have paying customers already?"
- "How many people use your product?"

### EXAMPLES of what you should NEVER do:
- "I recommend you develop..."
- "It would be good to implement..."
- "You should consider..."

### Strict JSON format:
{
  "questions": [
    {
      "question": "Super short question (max 8-10 words)",
      "context": "I want to know this aspect"
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
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: language === 'es' ? 'Analiza las respuestas y haz preguntas de seguimiento específicas.' : 'Analyze the answers and ask specific follow-up questions.' }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenAI API error: ${response.status}`, errorBody);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0].message.content;

    // Parse the JSON response
    let questions;
    try {
      const parsed = JSON.parse(analysisResult);
      questions = parsed.questions;
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisResult);
      throw new Error('Failed to parse AI questions');
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error(err);
    return new Response(String(err?.message || err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
