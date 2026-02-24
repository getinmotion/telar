/**
 * Classify Artisan Craft - Sistema RAG con Catálogo Oficial
 * 
 * Edge function que usa Lovable AI (Gemini 2.5 Flash) para clasificar
 * artesanos según el catálogo oficial de oficios y técnicas artesanales.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Catálogo oficial simplificado para el contexto del AI
const CATALOGO_OFICIAL = `
CATÁLOGO OFICIAL DE OFICIOS Y TÉCNICAS ARTESANALES DE COLOMBIA

1. MADERA (CUOC 735, AdeC 735)
   - Oficio: Trabajos en madera, carpintería y ebanistería (CUOC 7351, AdeC 7351-1)
   - Técnicas: Talla, Taracea, Torneado, Calado, Curvado, Labrado, Ensamble

2. GUADUA Y BAMBÚ (CUOC 739, AdeC 739-6)
   - Oficio: Trabajos en Guadua, Bambú, Chonta, Corozo (CUOC 7351, AdeC 7399-1)
   - Técnicas: Torneado, Labrado, Ensamble, Laminado, Calado, Curvado

3. FRUTOS SECOS Y SEMILLAS (CUOC 739, AdeC 739-1)
   - Oficio: Trabajos en frutos secos y semillas (CUOC 7393, AdeC 7393)
   - Materiales: Totumo, coco, calabazo, tagua
   - Técnicas: Torneado en tagua, Labrado, Calado

4. CESTERÍA (CUOC 734, AdeC 734)
   - Oficio: Cestería (CUOC 7341, AdeC 7341)
   - Materiales: Fibras vegetales duras y semiduras
   - Técnicas: Rollo en fibras, Radial, Entrecruzado

5. TEJEDURÍA (CUOC 734, AdeC 734)
   - Oficio: Tejeduría (CUOC 7331/7332/7333, AdeC 7331-1)
   - Materiales: Fibras, hilos, filamentos
   - Técnicas: Tejido de punto, Tejido plano, Redes, Anudados, Trenzado, Tejido en chaquira

6. TEXTILES NO TEJIDOS (CUOC 734, AdeC 734)
   - Oficio: Textiles no tejidos (AdeC 7331-2)
   - Técnicas: Afieltrado, Textil vegetal (damagua), Textil aglomerado

7. TRABAJOS EN TELA (CUOC 739, AdeC 739-3)
   - Oficio: Trabajos en tela (AdeC 7399-2)
   - Técnicas: Capas de tela, Calado en tela, Aplicación, Fruncido, Bordado, Tintura por reserva

8. CERÁMICA (CUOC 731, AdeC 731-1)
   - Oficio: Cerámica (CUOC 7314, AdeC 7314-1)
   - Quema: 800-1280°C
   - Técnicas: Modelado, Rollo, Plancha, Torneado, Torneado con tarraja, Vaciado en molde

9. ALFARERÍA (CUOC 731, AdeC 731-1)
   - Oficio: Alfarería (CUOC 7314, AdeC 7314-2)
   - Quema: <800°C
   - Técnicas: Modelado, Rollo, Plancha, Torneado, Apretón en molde

10. JOYERÍA (CUOC 732, AdeC 732)
    - Oficio: Joyería (CUOC 7321, AdeC 7321)
    - Materiales: Metales preciosos, semipreciosos
    - Técnicas: Cera perdida, Laminado, Filigrana, Engastado, Embutido/Repujado

11. PAPEL (CUOC 739, AdeC 739-4)
    - Oficio: Trabajos en papel (AdeC 7399-3)
    - Técnicas: Papel maché, Capas de papel, Moldeado de pulpa

12. BARNIZ DE PASTO / MOPA-MOPA (CUOC 739, AdeC 739-5)
    - Oficio: Barniz de Pasto (AdeC 7399-4)
    - Material: Resina Mopa-Mopa (Elaeagia Pastoensis Mora)

13. CACHO Y HUESO (CUOC 739, AdeC 739-2)
    - Oficio: Trabajos en cacho y hueso (AdeC 7399-5)
    - Materiales: Cuernos, huesos, conchas
    - Técnicas: Tallado, Calado, Torneado

14. ALAMBRISMO (CUOC 739, AdeC 739-7)
    - Oficio: Alambrismo (AdeC 7399-6)
    - Técnicas: Modelado en alambre
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessDescription, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    if (!businessDescription || businessDescription.length < 10) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Descripción demasiado corta. Necesito al menos 10 caracteres." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔍 [CLASSIFY] Clasificando artesano:", { userId, descLength: businessDescription.length });

    const systemPrompt = `Eres un experto clasificador de oficios artesanales colombianos.

${CATALOGO_OFICIAL}

INSTRUCCIONES CRÍTICAS:
1. Analiza la descripción del artesano cuidadosamente
2. Identifica la MATERIA PRIMA PRINCIPAL que trabaja
3. Clasifica el OFICIO ESPECÍFICO según el catálogo oficial
4. Detecta TÉCNICAS mencionadas o implícitas
5. Retorna SOLO JSON válido con esta estructura exacta:

{
  "materiaPrima": "nombre exacto del catálogo",
  "codigoMateriaPrimaCUOC": "código CUOC",
  "codigoMateriaPrimaAdeC": "código AdeC",
  "oficio": "nombre exacto del oficio del catálogo",
  "codigoOficioCUOC": "código CUOC del oficio",
  "codigoOficioAdeC": "código AdeC del oficio",
  "tecnicasDetectadas": [
    {
      "tecnica": "nombre de la técnica",
      "codigoTecnicaAdeC": "código AdeC"
    }
  ],
  "confianza": 0.95,
  "justificacion": "Explicación clara de por qué se eligió esta clasificación"
}

IMPORTANTE:
- USA SOLO oficios, materias primas y técnicas que están en el catálogo
- Si no estás seguro, elige el oficio MÁS CERCANO y baja la confianza
- La confianza debe reflejar qué tan seguro estás (0.5 = dudoso, 0.9+ = muy seguro)
- NO inventes códigos que no existen en el catálogo`;

    const userPrompt = `Clasifica este artesano colombiano según el catálogo oficial:

DESCRIPCIÓN DEL ARTESANO:
"${businessDescription}"

Retorna SOLO el JSON de clasificación, sin texto adicional.`;

    // Llamar a Lovable AI (Gemini 2.5 Flash)
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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Baja temperatura para respuestas más deterministas
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [CLASSIFY] AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Demasiadas consultas. Intenta de nuevo en un momento." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No se recibió respuesta del AI");
    }

    console.log("🤖 [CLASSIFY] AI Response:", content);

    // Parsear JSON de la respuesta
    let clasificacion;
    try {
      // Extraer JSON del contenido (por si viene con markdown o texto adicional)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se encontró JSON válido en la respuesta");
      }
      clasificacion = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("❌ [CLASSIFY] Error parsing AI response:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Error al procesar la clasificación. Intenta con una descripción más clara." 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validar que tenga los campos requeridos
    if (!clasificacion.oficio || !clasificacion.materiaPrima || 
        clasificacion.oficio === null || clasificacion.materiaPrima === null) {
      console.log("⚠️ [CLASSIFY] No se pudo clasificar - descripción no corresponde al catálogo");
      return new Response(
        JSON.stringify({
          success: false,
          error: "no_match",
          message: "La descripción no corresponde a ningún oficio artesanal del catálogo oficial. Por favor describe tu oficio artesanal real.",
          justificacion: clasificacion.justificacion
        }),
        {
          status: 200, // 200 porque no es un error técnico, es una clasificación no exitosa
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ [CLASSIFY] Clasificación exitosa:", {
      oficio: clasificacion.oficio,
      materiaPrima: clasificacion.materiaPrima,
      confianza: clasificacion.confianza
    });

    return new Response(
      JSON.stringify({
        success: true,
        clasificacion: {
          ...clasificacion,
          fechaClasificacion: new Date().toISOString(),
          clasificadoAutomaticamente: true,
          clasificadoPorUsuario: false
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("❌ [CLASSIFY] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al clasificar" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
