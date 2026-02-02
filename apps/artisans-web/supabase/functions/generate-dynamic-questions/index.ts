
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateDynamicQuestionsRequest {
  profileData: any;
  language: 'en' | 'es';
}

// Fallback questions when OpenAI fails
const getFallbackQuestions = (language: 'en' | 'es', profileData: any) => {
  const industry = profileData?.industry || 'creativo';
  const experience = profileData?.experience || 'principiante';
  
  const questions = language === 'es' ? [
    {
      question: `Como ${experience} en ${industry}, ¿cuáles son los principales obstáculos que enfrentas para hacer crecer tu proyecto?`,
      context: "Esta pregunta nos ayuda a entender tus desafíos específicos según tu nivel de experiencia."
    },
    {
      question: `¿Qué estrategias has probado hasta ahora para desarrollar tu proyecto en ${industry} y cuáles han funcionado mejor?`,
      context: "Conocer tus experiencias previas nos permite sugerir mejores enfoques."
    },
    {
      question: `Si pudieras resolver solo una cosa en tu proyecto de ${industry} en los próximos 3 meses, ¿qué sería y por qué?`,
      context: "Esta pregunta nos ayuda a priorizar recomendaciones según tus objetivos inmediatos."
    }
  ] : [
    {
      question: `As a ${experience} in ${industry}, what are the main obstacles you face in growing your project?`,
      context: "This question helps us understand your specific challenges based on your experience level."
    },
    {
      question: `What strategies have you tried so far to develop your ${industry} project and which have worked best?`,
      context: "Knowing your previous experiences allows us to suggest better approaches."
    },
    {
      question: `If you could solve just one thing in your ${industry} project in the next 3 months, what would it be and why?`,
      context: "This question helps us prioritize recommendations based on your immediate goals."
    }
  ];

  return questions;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileData, language }: GenerateDynamicQuestionsRequest = await req.json();

    console.log('Generate Dynamic Questions request:', { 
      profileData: profileData ? Object.keys(profileData) : 'null', 
      language,
      industry: profileData?.industry,
      experience: profileData?.experience
    });

    // If OpenAI API key is not configured, return fallback questions
    if (!openAIApiKey) {
      console.log('OpenAI API key not configured, using fallback questions');
      const fallbackQuestions = getFallbackQuestions(language, profileData);
      return new Response(JSON.stringify({ questions: fallbackQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a comprehensive prompt based on the user's profile data
    const userContext = `
- Industria: ${profileData?.industry || 'No especificada'}
- Experiencia: ${profileData?.experience || 'No especificada'}
- Actividades principales: ${profileData?.activities ? profileData.activities.join(', ') : 'No especificadas'}
- Métodos de pago actuales: ${profileData?.paymentMethods || 'No especificados'}
- Identidad de marca: ${profileData?.brandIdentity || 'No especificada'}
- Control financiero: ${profileData?.financialControl || 'No especificado'}
- Estructura del equipo: ${profileData?.teamStructure || 'No especificada'}
- Organización de tareas: ${profileData?.taskOrganization || 'No especificada'}
- Toma de decisiones: ${profileData?.decisionMaking || 'No especificada'}
- Respuestas adicionales: ${profileData?.extendedAnswers ? Object.values(profileData.extendedAnswers).join(', ') : 'Ninguna'}
    `.trim();

    const systemPrompt = language === 'es' 
      ? `Eres un experto consultor en negocios creativos y culturales. Basándote en el perfil específico del usuario, genera exactamente 3 preguntas abiertas y personalizadas que profundicen en su situación particular.

INFORMACIÓN DEL USUARIO:
${userContext}

INSTRUCCIONES ESPECÍFICAS:
1. Las preguntas DEBEN ser específicas a su industria (${profileData?.industry || 'creativa'}) y nivel de experiencia (${profileData?.experience || 'principiante'})
2. Referenciar directamente sus respuestas anteriores cuando sea relevante
3. Hacer preguntas que lleven a recomendaciones de tareas concretas y accionables
4. Usar un tono natural y conversacional
5. Evitar preguntas genéricas que podrían aplicar a cualquier persona

Responde SOLO con un JSON en este formato:
{
  "questions": [
    {
      "question": "Pregunta específica y personalizada aquí",
      "context": "Por qué esta pregunta es relevante para su perfil específico"
    }
  ]
}`
      : `You are an expert consultant in creative and cultural businesses. Based on the user's specific profile, generate exactly 3 personalized open-ended questions that dive deeper into their particular situation.

USER INFORMATION:
${userContext}

SPECIFIC INSTRUCTIONS:
1. Questions MUST be specific to their industry (${profileData?.industry || 'creative'}) and experience level (${profileData?.experience || 'beginner'})
2. Reference their previous answers directly when relevant
3. Ask questions that lead to concrete, actionable task recommendations
4. Use a natural, conversational tone
5. Avoid generic questions that could apply to anyone

Respond ONLY with a JSON in this format:
{
  "questions": [
    {
      "question": "Specific and personalized question here",
      "context": "Why this question is relevant to their specific profile"
    }
  ]
}`;

    console.log('Making OpenAI request for dynamic questions...');

    try {
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
            { role: 'user', content: 'Generate 3 personalized follow-up questions based on this specific user profile.' }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        
        // Return fallback questions on OpenAI error
        console.log('OpenAI failed, using fallback questions');
        const fallbackQuestions = getFallbackQuestions(language, profileData);
        return new Response(JSON.stringify({ questions: fallbackQuestions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      const result = data.choices[0].message.content;

      console.log('OpenAI response received for questions, length:', result.length);

      // Parse the JSON response
      let questions;
      try {
        const parsed = JSON.parse(result);
        questions = parsed.questions;
        console.log('Successfully parsed questions:', questions.length);
      } catch (parseError) {
        console.error('Failed to parse AI response:', result);
        console.error('Parse error:', parseError);
        
        // Return fallback questions on parse error
        console.log('Parse failed, using fallback questions');
        const fallbackQuestions = getFallbackQuestions(language, profileData);
        return new Response(JSON.stringify({ questions: fallbackQuestions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (openaiError) {
      console.error('OpenAI request failed:', openaiError);
      
      // Return fallback questions on request failure
      console.log('OpenAI request failed, using fallback questions');
      const fallbackQuestions = getFallbackQuestions(language, profileData);
      return new Response(JSON.stringify({ questions: fallbackQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in generate-dynamic-questions function:', error);
    
    // Return fallback questions on any error
    const fallbackQuestions = getFallbackQuestions('es', {}); // Default to Spanish
    
    return new Response(
      JSON.stringify({ 
        questions: fallbackQuestions
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
