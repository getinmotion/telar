
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRecommendationsRequest {
  scores: {
    ideaValidation: number;
    userExperience: number;
    marketFit: number;
    monetization: number;
  };
  profileData: any;
  language: 'en' | 'es';
}

// Sistema de caché simple en memoria
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Recomendaciones robustas cuando OpenAI falla
const getRobustFallbackRecommendations = (scores: any) => {
  const recommendations = [];
  
  // Validar scores
  if (!scores || typeof scores !== 'object') {
    return getDefaultRecommendations();
  }
  
  try {
    // Analizar cada área específicamente
    const areas = [
      { key: 'monetization', value: scores.monetization || 0, name: 'Monetización' },
      { key: 'ideaValidation', value: scores.ideaValidation || 0, name: 'Validación de Idea' },
      { key: 'userExperience', value: scores.userExperience || 0, name: 'Experiencia de Usuario' },
      { key: 'marketFit', value: scores.marketFit || 0, name: 'Ajuste al Mercado' }
    ].sort((a, b) => a.value - b.value);

    // Generar recomendaciones específicas para las 3 áreas más débiles
    areas.slice(0, 3).forEach((area) => {
      let title = '';
      let description = '';
      let priority = area.value < 40 ? 'Alta' : area.value < 60 ? 'Media' : 'Baja';
      let timeframe = priority === 'Alta' ? '1-2 semanas' : '2-4 semanas';
      
      switch (area.key) {
        case 'monetization':
          title = 'Desarrollar Estrategia de Monetización Sólida';
          description = `Tu puntuación en monetización es ${area.value}%. Enfócate en definir modelos de ingresos claros, calcular costos de producción precisos y establecer precios competitivos. Considera múltiples fuentes de ingresos para diversificar tu propuesta de valor económica.`;
          break;
        case 'ideaValidation':
          title = 'Validar Profundamente tu Propuesta de Valor';
          description = `Con ${area.value}% en validación de idea, necesitas confirmar que tu concepto resuelve problemas reales y significativos. Realiza entrevistas estructuradas con clientes potenciales, crea prototipos mínimos viables y prueba tu idea con audiencias específicas.`;
          break;
        case 'userExperience':
          title = 'Optimizar Integralmente la Experiencia del Usuario';
          description = `Tu puntuación de ${area.value}% en experiencia de usuario indica oportunidades importantes de mejora. Simplifica procesos complejos, mejora la usabilidad de tus interfaces y establece canales efectivos para recolectar feedback directo y continuo de tus usuarios.`;
          break;
        case 'marketFit':
          title = 'Perfeccionar el Ajuste al Mercado Objetivo';
          description = `Con ${area.value}% en ajuste al mercado, debes investigar exhaustivamente tu competencia, definir con precisión tu nicho específico y ajustar tu propuesta para destacar significativamente en tu mercado objetivo.`;
          break;
      }
      
      recommendations.push({ title, description, priority, timeframe });
    });

    // Agregar recomendación estratégica general
    recommendations.push({
      title: 'Implementar Desarrollo Iterativo y Medible',
      description: 'Establece un sistema de mejora continua con métricas claras, metas semanales alcanzables y revisiones regulares de progreso. Mantén un enfoque constante en la validación de cada cambio implementado.',
      priority: 'Media',
      timeframe: 'Continuo'
    });

  } catch (error) {
    console.error('Error generating robust fallbacks:', error);
    return getDefaultRecommendations();
  }

  return recommendations;
};

const getDefaultRecommendations = () => {
  return [
    {
      title: 'Desarrollar Estrategia Básica de Negocio',
      description: 'Enfócate en definir claramente tu propuesta de valor, identificar tu mercado objetivo y establecer un modelo de ingresos básico pero funcional.',
      priority: 'Alta',
      timeframe: '2-3 semanas'
    },
    {
      title: 'Validar Concepto con Audiencia Real', 
      description: 'Realiza pruebas simples con usuarios potenciales para confirmar que tu idea resuelve un problema real y significativo.',
      priority: 'Alta',
      timeframe: '1-2 semanas'
    },
    {
      title: 'Mejorar Experiencia del Usuario',
      description: 'Simplifica procesos, mejora la usabilidad y establece canales para recibir feedback continuo de tus usuarios.',
      priority: 'Media',
      timeframe: '2-4 semanas'
    }
  ];
};

// Función de delay para rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limiting mejorado con exponential backoff
let requestCount = 0;
let lastRequestTime = 0;
const MAX_REQUESTS_PER_MINUTE = 10;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scores, profileData, language }: AIRecommendationsRequest = await req.json();

    console.log('AI Recommendations request received:', { 
      scores, 
      profileData: Object.keys(profileData || {}), 
      language 
    });

    // Validar entrada
    if (!scores || typeof scores !== 'object') {
      console.log('Invalid scores provided, using default recommendations');
      const fallbackRecommendations = getDefaultRecommendations();
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar caché
    const cacheKey = JSON.stringify({ scores, language });
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached recommendations');
      return new Response(JSON.stringify({ recommendations: cached.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting simple
    const now = Date.now();
    if (now - lastRequestTime < 60000) {
      requestCount++;
      if (requestCount > MAX_REQUESTS_PER_MINUTE) {
        console.log('Rate limit exceeded, using fallback recommendations');
        const fallbackRecommendations = getRobustFallbackRecommendations(scores);
        return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      requestCount = 1;
      lastRequestTime = now;
    }

    // Si no hay clave de OpenAI, usar fallbacks robustos inmediatamente
    if (!openAIApiKey) {
      console.log('OpenAI API key not configured, using robust fallback recommendations');
      const fallbackRecommendations = getRobustFallbackRecommendations(scores);
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calcular nivel general de madurez
    const overallScore = Math.round(
      (scores.ideaValidation + scores.userExperience + scores.marketFit + scores.monetization) / 4
    );

    console.log('Calculated overall maturity score:', overallScore);

    try {
      // Intentar request a OpenAI con timeout más agresivo
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

      // Prompt más conciso para reducir tokens
      const systemPrompt = language === 'es' 
        ? `Eres consultor experto en negocios creativos. Analiza estos scores y da 3 recomendaciones específicas:

SCORES: Validación=${scores.ideaValidation}%, UX=${scores.userExperience}%, Mercado=${scores.marketFit}%, Monetización=${scores.monetization}%

Responde SOLO JSON válido:
{"recommendations":[{"title":"Título específico","description":"Descripción con pasos concretos","priority":"Alta|Media|Baja","timeframe":"Tiempo estimado"}]}`
        : `You are a creative business expert. Analyze these scores and provide 3 specific recommendations:

SCORES: Validation=${scores.ideaValidation}%, UX=${scores.userExperience}%, Market=${scores.marketFit}%, Monetization=${scores.monetization}%

Respond ONLY with valid JSON:
{"recommendations":[{"title":"Specific title","description":"Detailed description with concrete steps","priority":"High|Medium|Low","timeframe":"Estimated time"}]}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800, // Reducido para respuestas más rápidas
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisResult = data.choices[0].message.content;

      console.log('OpenAI response received successfully');

      // Parsear respuesta JSON con manejo robusto
      let recommendations;
      try {
        const parsed = JSON.parse(analysisResult);
        recommendations = parsed.recommendations;
        
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
          throw new Error('Invalid recommendations format');
        }
        
        // Guardar en caché
        cache.set(cacheKey, { data: recommendations, timestamp: Date.now() });
        
        console.log('Successfully parsed AI recommendations:', recommendations.length);
      } catch (parseError) {
        console.error('Failed to parse AI response, using fallbacks:', parseError);
        const fallbackRecommendations = getRobustFallbackRecommendations(scores);
        cache.set(cacheKey, { data: fallbackRecommendations, timestamp: Date.now() });
        return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ recommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (openaiError: unknown) {
      console.error('OpenAI request failed:', openaiError);
      
      // Implementar backoff en caso de rate limit
      const errorMessage = openaiError instanceof Error ? openaiError.message : '';
      if (errorMessage.includes('429')) {
        await delay(2000); // Wait 2 seconds before fallback
      }
      
      // Usar fallbacks robustos en cualquier error de OpenAI
      console.log('Using robust fallback due to OpenAI failure');
      const fallbackRecommendations = getRobustFallbackRecommendations(scores);
      cache.set(cacheKey, { data: fallbackRecommendations, timestamp: Date.now() });
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in ai-recommendations function:', error);
    
    // Fallback final con recomendaciones básicas pero útiles
    const finalFallbackRecommendations = getDefaultRecommendations();
    
    return new Response(
      JSON.stringify({ recommendations: finalFallbackRecommendations }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
