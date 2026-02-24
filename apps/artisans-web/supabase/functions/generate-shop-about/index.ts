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
      shopName, 
      craftType, 
      region, 
      currentStory = '',
      brandClaim = '',
      brandColors = []
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const storyContext = currentStory 
      ? `Historia actual a expandir: ${currentStory}. ` 
      : '';
    const claimContext = brandClaim 
      ? `El claim de marca es: "${brandClaim}". Incorpora este concepto en el contenido. ` 
      : '';
    const colorContext = brandColors.length > 0 
      ? `Los colores de marca son: ${brandColors.join(', ')}. ` 
      : '';

    const prompt = `Genera contenido profesional y emotivo para la página "Sobre Nosotros" de "${shopName}", una tienda de ${craftType} de ${region}. ${storyContext}${claimContext}${colorContext}
    
    El contenido debe ser auténtico, inspirador y reflejar la pasión artesanal. Usa un tono cálido y personal.
    
    Responde SOLO con un JSON válido en este formato exacto:
    {
      "title": "Sobre Nosotros",
      "story": "historia expandida y emotiva (200-300 palabras, contando el origen, la pasión por el arte, el proceso creativo)",
      "mission": "nuestra misión clara y aspiracional (50-80 palabras)",
      "vision": "nuestra visión de futuro (50-80 palabras)",
      "values": [
        {"name": "Calidad", "description": "descripción específica de cómo aplicamos la calidad"},
        {"name": "Tradición", "description": "cómo honramos las técnicas tradicionales"},
        {"name": "Sostenibilidad", "description": "nuestro compromiso con el medio ambiente y la comunidad"}
      ]
    }`;

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
          content: prompt
        }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    console.log(`Generated about content for ${shopName}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-shop-about:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      title: 'Sobre Nosotros',
      story: '',
      mission: '',
      vision: '',
      values: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
