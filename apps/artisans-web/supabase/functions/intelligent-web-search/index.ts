/**
 * Intelligent Web Search Function - FASE 7
 * 
 * Búsqueda contextual web para enriquecer preguntas del coordinador
 * Usa Lovable AI para resumir información relevante de mercado
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context, language = 'es' } = await req.json();

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Web search for: ${query}`);
    console.log(`📋 Context: ${context}`);

    // Llamar a Lovable AI para búsqueda inteligente
    const searchPrompt = language === 'es'
      ? `Busca información actualizada sobre: "${query}"

Contexto: ${context}

Devuelve un resumen ejecutivo en español con:
- 3-4 puntos clave con datos concretos (precios, tendencias, canales efectivos)
- Fuentes reales de información cuando sea posible
- Información relevante para un artesano en Chile

Si no encuentras información específica, proporciona insights generales del mercado artesanal.`
      : `Search for updated information about: "${query}"

Context: ${context}

Return an executive summary in English with:
- 3-4 key points with concrete data (prices, trends, effective channels)
- Real information sources when possible
- Relevant information for a Chilean artisan

If you don't find specific information, provide general artisan market insights.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: searchPrompt
        }],
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded', 
            summary: 'No se pudo obtener información externa en este momento. Continuando con datos locales.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Payment required', 
            summary: 'No se pudo obtener información externa. Continuando con datos locales.' 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || 'No se pudo obtener información específica.';

    console.log('✅ Web search completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        query,
        context
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in intelligent-web-search:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        summary: 'No se pudo obtener información externa. Continuando sin datos de mercado.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});