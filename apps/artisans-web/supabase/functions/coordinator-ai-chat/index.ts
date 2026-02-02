/**
 * Coordinator AI Chat - Streaming Chat con Lovable AI
 * 
 * Chat conversacional del Coordinador Maestro que usa Gemini 2.5 Flash
 * para responder preguntas contextuales del usuario sobre su negocio artesanal.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Obtener contexto del usuario desde Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Cargar contexto del coordinador
    const { data: contextData } = await supabaseClient
      .from('master_coordinator_context')
      .select('context_snapshot, ai_memory')
      .eq('user_id', userId)
      .single();

    // Cargar perfil del usuario
    const { data: profileData } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Cargar scores de madurez
    const { data: scoresData } = await supabaseClient
      .from('user_maturity_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const contextSnapshot = contextData?.context_snapshot || {};
    const businessName = profileData?.brand_name || profileData?.full_name || 'artesano';
    const craftType = profileData?.business_type || 'artesanía';
    
    let maturityLevel = 'iniciando';
    if (scoresData) {
      const avgScore = Math.round(
        (scoresData.idea_validation + scoresData.user_experience + 
         scoresData.market_fit + scoresData.monetization) / 4
      );
      if (avgScore >= 80) maturityLevel = 'avanzado';
      else if (avgScore >= 60) maturityLevel = 'intermedio';
      else if (avgScore >= 40) maturityLevel = 'en desarrollo';
    }

    const systemPrompt = `Eres el Coordinador Maestro de TELAR, una plataforma para artesanos colombianos.

CONTEXTO DEL USUARIO:
- Nombre del negocio: ${businessName}
- Tipo de artesanía: ${craftType}
- Nivel de madurez: ${maturityLevel}
- Contexto adicional: ${JSON.stringify(contextSnapshot)}

TU ROL:
- Hablas en español colombiano, de forma cercana y motivadora
- Usas emojis artesanales ocasionalmente 🎨🧵✂️🪡
- Eres experto en negocios artesanales, marketing, finanzas y operaciones
- Acompañas al artesano paso a paso, sin abrumarlo
- Das respuestas CORTAS y ACCIONABLES (máximo 3-4 líneas)
- Preguntas para entender mejor antes de dar soluciones complejas

TU PERSONALIDAD:
- Humano, cálido, empático
- Práctico y orientado a resultados
- Celebras los logros pequeños
- Reconoces cuando algo es difícil, pero animas a seguir

IMPORTANTE:
- Si te preguntan sobre tareas, misiones o agentes, explicas que tú orquestas todo internamente
- Si necesitan algo técnico (costeo, inventario, redes), ofreces crear una misión específica
- Nunca digas "no puedo" - siempre ofreces alternativas o próximos pasos`;

    // Llamar a Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    // Manejo de errores de rate limit y pago
    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Demasiadas consultas. Por favor espera un momento e intenta de nuevo." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Se agotaron los créditos de IA. Contacta a soporte." 
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      console.error("AI Gateway error:", response.status, await response.text());
      throw new Error("Error comunicándose con el asistente de IA");
    }

    // Retornar stream directamente
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("coordinator-ai-chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
