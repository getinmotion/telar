import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntelligentQuestionsRequest {
  profileData: any;
  language: 'en' | 'es';
  blockContext: string;
  businessDescription: string;
  industry: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      profileData, 
      language, 
      blockContext, 
      businessDescription, 
      industry 
    }: IntelligentQuestionsRequest = await req.json();

    console.log('Generating intelligent questions for:', { industry, blockContext });

    // Enhanced context with business specifics
    const businessContext = `
BUSINESS DETAILS:
- Type: ${businessDescription}
- Industry: ${industry}
- Target Audience: ${profileData?.targetAudience || 'Unknown'}
- Team Structure: ${profileData?.teamStructure || 'Unknown'}
- Revenue Model: ${profileData?.pricingMethod || 'Unknown'}
- Sales History: ${profileData?.hasSold ? 'Has made sales' : 'No sales yet'}
- Main Obstacles: ${Array.isArray(profileData?.mainObstacles) ? profileData.mainObstacles.join(', ') : 'Unknown'}
- Business Goals: ${profileData?.businessGoals || 'Unknown'}
    `;

    const systemPrompt = language === 'es' 
      ? `Eres un consultor experto especializado en ${industry}. Basándote en los detalles específicos del negocio del usuario, genera exactamente 3 preguntas inteligentes y específicas.

${businessContext}

CONTEXTO DEL BLOQUE ACTUAL:
${blockContext}

INSTRUCCIONES ESPECÍFICAS:
1. Las preguntas DEBEN ser súper específicas para su negocio: "${businessDescription}"
2. Referencia directamente sus respuestas y situación actual
3. Cada pregunta debe llevar a una recomendación de tarea concreta
4. Usa terminología específica de la industria ${industry}
5. Considera sus obstáculos actuales: ${Array.isArray(profileData?.mainObstacles) ? profileData.mainObstacles.join(', ') : 'varios desafíos'}
6. Ten en cuenta si ya ha vendido algo o no para ajustar las preguntas
7. Las preguntas deben ser abiertas pero específicas, no genéricas

Formato JSON:
{
  "questions": [
    {
      "question": "Pregunta específica aquí",
      "context": "Por qué esta pregunta es relevante para este negocio específico",
      "expectedInsight": "Qué insight esperamos obtener"
    }
  ]
}`
      : `You are an expert consultant specialized in ${industry}. Based on the user's specific business details, generate exactly 3 intelligent and specific questions.

${businessContext}

CURRENT BLOCK CONTEXT:
${blockContext}

SPECIFIC INSTRUCTIONS:
1. Questions MUST be super specific to their business: "${businessDescription}"
2. Reference their answers and current situation directly
3. Each question should lead to a concrete task recommendation
4. Use industry-specific terminology for ${industry}
5. Consider their current obstacles: ${Array.isArray(profileData?.mainObstacles) ? profileData.mainObstacles.join(', ') : 'various challenges'}
6. Account for whether they've made sales or not to adjust questions
7. Questions should be open-ended but specific, not generic

JSON format:
{
  "questions": [
    {
      "question": "Specific question here",
      "context": "Why this question is relevant to this specific business",
      "expectedInsight": "What insight we expect to gain"
    }
  ]
}`;

    if (!openAIApiKey) {
      // Enhanced fallback questions based on industry and business type
      const fallbackQuestions = generateIndustryFallback(industry, businessDescription, language);
      return new Response(JSON.stringify({ questions: fallbackQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
          { role: 'user', content: `Generate 3 intelligent follow-up questions for this ${industry} business: "${businessDescription}"` }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const fallbackQuestions = generateIndustryFallback(industry, businessDescription, language);
      return new Response(JSON.stringify({ questions: fallbackQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    let questions;
    try {
      const parsed = JSON.parse(result);
      questions = parsed.questions;
    } catch (parseError) {
      console.error('Parse error:', parseError);
      const fallbackQuestions = generateIndustryFallback(industry, businessDescription, language);
      return new Response(JSON.stringify({ questions: fallbackQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-intelligent-questions:', error);
    
    const fallbackQuestions = generateIndustryFallback('creative', '', 'es');
    return new Response(JSON.stringify({ questions: fallbackQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateIndustryFallback(industry: string, businessDescription: string, language: 'en' | 'es') {
  const industryQuestions: Record<string, any> = {
    creative: {
      es: [
        {
          question: `Para tu proyecto de ${businessDescription}, ¿qué proceso sigues desde la idea inicial hasta el producto final?`,
          context: "Entender tu proceso creativo nos ayuda a identificar oportunidades de optimización",
          expectedInsight: "Procesos de trabajo y puntos de mejora"
        },
        {
          question: `¿Cómo decides el precio de tus creaciones y qué factores consideras más importantes?`,
          context: "La estrategia de precios es crucial en el sector creativo",
          expectedInsight: "Estrategia de monetización actual"
        },
        {
          question: `¿Qué te diferencia de otros creativos en tu área y cómo comunicas esa diferencia?`,
          context: "La diferenciación es clave para destacar en mercados creativos saturados",
          expectedInsight: "Propuesta de valor única"
        }
      ],
      en: [
        {
          question: `For your ${businessDescription} project, what process do you follow from initial idea to final product?`,
          context: "Understanding your creative process helps identify optimization opportunities",
          expectedInsight: "Work processes and improvement points"
        },
        {
          question: `How do you decide the price of your creations and what factors do you consider most important?`,
          context: "Pricing strategy is crucial in the creative sector",
          expectedInsight: "Current monetization strategy"
        },
        {
          question: `What differentiates you from other creatives in your area and how do you communicate that difference?`,
          context: "Differentiation is key to standing out in saturated creative markets",
          expectedInsight: "Unique value proposition"
        }
      ]
    },
    tech: {
      es: [
        {
          question: `¿Cómo validas las funcionalidades de ${businessDescription} antes de invertir tiempo en desarrollo completo?`,
          context: "La validación temprana es crucial en proyectos tecnológicos",
          expectedInsight: "Metodología de validación de producto"
        },
        {
          question: `¿Qué métricas trackeas para medir el éxito de tu producto tecnológico?`,
          context: "Las métricas correctas guían las decisiones de producto",
          expectedInsight: "KPIs y análisis de datos"
        },
        {
          question: `¿Cómo planeas escalar técnicamente tu solución cuando crezca la demanda?`,
          context: "La escalabilidad debe considerarse desde el inicio",
          expectedInsight: "Estrategia de escalabilidad técnica"
        }
      ],
      en: [
        {
          question: `How do you validate the features of ${businessDescription} before investing time in full development?`,
          context: "Early validation is crucial in technology projects",
          expectedInsight: "Product validation methodology"
        },
        {
          question: `What metrics do you track to measure the success of your tech product?`,
          context: "The right metrics guide product decisions",
          expectedInsight: "KPIs and data analysis"
        },
        {
          question: `How do you plan to technically scale your solution when demand grows?`,
          context: "Scalability should be considered from the start",
          expectedInsight: "Technical scalability strategy"
        }
      ]
    }
  };

  return industryQuestions[industry]?.[language] || industryQuestions.creative[language];
}