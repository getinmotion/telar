import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArtisanProfileData {
  artisanName: string;
  artisticName: string;
  artisanPhoto?: string;
  artisanVideo?: string;
  learnedFrom: string;
  startAge: number;
  culturalMeaning: string;
  motivation: string;
  culturalHistory: string;
  ethnicRelation: string;
  ancestralKnowledge: string;
  territorialImportance: string;
  workshopAddress: string;
  workshopPhotos: string[];
  workshopVideo?: string;
  workshopDescription: string;
  techniques: string[];
  materials: string[];
  averageTime: string;
  uniqueness: string;
  craftMessage: string;
  workingPhotos: string[];
  communityPhotos: string[];
  familyPhotos: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, shopName, craftType, region } = await req.json() as {
      profile: ArtisanProfileData;
      shopName: string;
      craftType: string;
      region: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("[generate-artisan-profile-story] Generating story for:", shopName);

    const systemPrompt = `Eres un escritor de perfiles artesanales para una plataforma de comercio artesanal colombiana. 
Tu tarea es crear una narrativa documental, emotiva y auténtica sobre el artesano, basándote en los datos proporcionados.

IMPORTANTE:
- Escribe en español colombiano natural
- Usa un tono cálido, respetuoso y que honre la tradición
- No inventes datos, usa solo la información proporcionada
- Crea textos que emocionen y conecten con el lector
- Respeta profundamente el contexto cultural y étnico`;

    const userPrompt = `Genera el perfil narrativo para este artesano:

DATOS DEL ARTESANO:
- Nombre: ${profile.artisanName}
- Nombre Artístico: ${profile.artisticName}
- Tienda: ${shopName}
- Tipo de Artesanía: ${craftType}
- Región: ${region}

ORIGEN DEL OFICIO:
- Aprendió de: ${profile.learnedFrom}
- Edad de inicio: ${profile.startAge} años
- Significado cultural: ${profile.culturalMeaning}
- Motivación: ${profile.motivation}

HISTORIA CULTURAL:
- Historia regional/étnica: ${profile.culturalHistory}
- Relación étnica: ${profile.ethnicRelation}
- Conocimiento ancestral: ${profile.ancestralKnowledge}
- Importancia territorial: ${profile.territorialImportance}

EL TALLER:
- Ubicación: ${profile.workshopAddress}
- Descripción: ${profile.workshopDescription}

LA ARTESANÍA:
- Técnicas: ${profile.techniques.join(', ')}
- Materiales: ${profile.materials.join(', ')}
- Tiempo promedio: ${profile.averageTime}
- Lo que lo hace único: ${profile.uniqueness}
- Mensaje del artesano: ${profile.craftMessage}

Por favor genera un JSON con la siguiente estructura:
{
  "heroTitle": "Título emotivo corto para el hero (máx 10 palabras)",
  "heroSubtitle": "Subtítulo poético (máx 15 palabras)", 
  "claim": "Frase distintiva del artesano (máx 12 palabras)",
  "timeline": [
    { "year": "Época o edad", "event": "Descripción del momento clave" }
  ],
  "originStory": "Párrafo narrativo sobre el origen (100-150 palabras)",
  "culturalStory": "Párrafo sobre la tradición cultural (100-150 palabras)",
  "craftStory": "Párrafo sobre la artesanía y técnicas (100-150 palabras)",
  "workshopStory": "Párrafo sobre el taller (80-100 palabras)",
  "artisanQuote": "Una cita memorable del artesano basada en su mensaje",
  "closingMessage": "Mensaje de cierre emotivo (2-3 oraciones)"
}`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-artisan-profile-story] AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let storyData;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      storyData = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("[generate-artisan-profile-story] Parse error:", parseError);
      // Return a basic structure if parsing fails
      storyData = {
        heroTitle: `${profile.artisticName} - Artesano de ${region}`,
        heroSubtitle: `Tradición y arte en cada pieza`,
        claim: profile.craftMessage || "Creando con el corazón",
        timeline: [
          { year: `${profile.startAge} años`, event: `Comenzó a aprender de ${profile.learnedFrom}` }
        ],
        originStory: profile.motivation,
        culturalStory: profile.culturalHistory,
        craftStory: profile.uniqueness,
        workshopStory: profile.workshopDescription,
        artisanQuote: profile.craftMessage,
        closingMessage: "Cada pieza cuenta una historia de tradición y pasión."
      };
    }

    console.log("[generate-artisan-profile-story] Story generated successfully");

    return new Response(JSON.stringify(storyData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[generate-artisan-profile-story] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
