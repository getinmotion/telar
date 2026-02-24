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
      description, 
      brandColors = [], 
      brandClaim = '', 
      count = 1,
      products = [],
      culturalContext = '' // NUEVO: contexto cultural detallado
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const colorContext = brandColors.length > 0 
      ? `Los colores de marca son: ${brandColors.join(', ')}. ` 
      : '';
    const claimContext = brandClaim 
      ? `El claim de marca es: "${brandClaim}". ` 
      : '';
    const productsContext = products?.length > 0 
      ? `Productos destacados: ${products.map(p => `"${p.name}" - ${p.description}`).join(', ')}. ` 
      : '';

    // Construir contexto cultural si está disponible
    const culturalContextSection = culturalContext 
      ? `\n\nCONTEXTO CULTURAL DEL ARTESANO (RESPETAR FIELMENTE):\n${culturalContext}\n` 
      : '';

    const prompt = `Genera ${count} slides de hero para una tienda artesanal llamada "${shopName}" que se especializa en ${craftType}. ${description}. ${colorContext}${claimContext}${productsContext}${culturalContextSection}
    
    INSTRUCCIONES CRÍTICAS:
    - Los títulos y subtítulos DEBEN ser culturalmente precisos y específicos
    - Si el artesano hace "mochilas arhuacas", NO usar términos genéricos como "tejidos tradicionales"
    - Usar la terminología específica de la región y cultura mencionada en el contexto
    - Mencionar técnicas, comunidades o características únicas cuando sea relevante
    - Destacar la autenticidad y el origen cultural específico
    - Evitar descripciones vagas o que puedan confundirse con otras culturas
    
    Cada slide debe ser único y destacar diferentes aspectos:
    1. Primer slide: Presentación de marca con origen cultural específico
    2. Segundo slide: Productos específicos con técnicas tradicionales
    3. Tercer slide: Call to action destacando autenticidad cultural
    
    Responde SOLO con un JSON válido en este formato exacto:
    {
      "slides": [
        {
          "title": "título específico y culturalmente preciso (máximo 50 caracteres)",
          "subtitle": "descripción que mencione técnicas, región o características únicas (máximo 100 caracteres)",
          "ctaText": "texto del botón de acción",
          "ctaLink": "#productos",
          "suggestedImage": "descripción detallada de la imagen ideal, mencionando patrones, colores y estilo cultural específico"
        }
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
      
      // Detectar específicamente error de créditos insuficientes
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'NO_CREDITS',
          message: 'Sin créditos de Lovable AI disponibles. Ve a Settings → Workspace → Usage para agregar créditos.',
          slides: [] 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Limpiar formato markdown si está presente
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    content = content.trim();
    
    const result = JSON.parse(content);

    console.log(`Generated ${result.slides?.length || 0} slides for ${shopName}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-shop-hero-slide:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      slides: [] // Fallback vacío
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
