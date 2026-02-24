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
      imageUrl,
      shopName, 
      craftType, 
      brandClaim = '', 
      brandColors = [],
      mode = 'full', // 'full' or 'refine'
      manualInputs = {}
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!imageUrl) {
      throw new Error('imageUrl is required');
    }

    const colorContext = brandColors.length > 0 
      ? `Los colores de marca son: ${brandColors.join(', ')}. ` 
      : '';
    const claimContext = brandClaim 
      ? `El claim de marca es: "${brandClaim}". ` 
      : '';

    let prompt = '';
    
    if (mode === 'full') {
      prompt = `Analiza esta imagen de producto artesanal y genera un slide de hero atractivo y comercial.

Contexto de la tienda:
- Nombre: "${shopName}"
- Tipo de artesanía: ${craftType}
${claimContext}${colorContext}

Genera contenido que:
1. Destaque lo que se ve en la imagen
2. Sea atractivo y comercial
3. Use un lenguaje que conecte emocionalmente
4. Incluya un llamado a la acción apropiado

Responde SOLO con un JSON válido en este formato exacto:
{
  "title": "título impactante y corto (máximo 50 caracteres)",
  "subtitle": "descripción breve y llamativa (máximo 100 caracteres)",
  "ctaText": "texto del botón de acción (máximo 20 caracteres)",
  "ctaLink": "enlace sugerido (#productos, #contacto, #sobre-nosotros, etc.)",
  "suggestedAltText": "descripción de la imagen para accesibilidad"
}`;
    } else {
      // mode === 'refine'
      prompt = `Analiza esta imagen de producto artesanal y refina el contenido proporcionado por el usuario para hacerlo más atractivo y comercial.

Contexto de la tienda:
- Nombre: "${shopName}"
- Tipo de artesanía: ${craftType}
${claimContext}${colorContext}

Contenido proporcionado por el usuario:
- Título: "${manualInputs.title || ''}"
- Subtítulo: "${manualInputs.subtitle || ''}"
- Texto CTA: "${manualInputs.ctaText || ''}"

Instrucciones:
1. Mantén la intención original del usuario
2. Mejora la redacción para que sea más atractiva y profesional
3. Asegúrate de que sea consistente con la imagen
4. Hazlo más comercial pero auténtico
5. Respeta los límites de caracteres

Responde SOLO con un JSON válido en este formato exacto:
{
  "title": "título refinado (máximo 50 caracteres)",
  "subtitle": "subtítulo refinado (máximo 100 caracteres)",
  "ctaText": "texto del botón refinado (máximo 20 caracteres)",
  "ctaLink": "enlace sugerido apropiado (#productos, #contacto, #sobre-nosotros, etc.)",
  "suggestedAltText": "descripción de la imagen para accesibilidad"
}`;
    }

    console.log(`🎨 Generating hero slide content from image for shop: ${shopName} (mode: ${mode})`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
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

    console.log(`✅ Generated hero slide content (${mode} mode):`, {
      title: result.title?.substring(0, 30) + '...',
      hasSubtitle: !!result.subtitle,
      hasCTA: !!result.ctaText
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-hero-slide-from-image:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      // Fallback values
      title: 'Descubre Nuestros Productos',
      subtitle: 'Artesanía única hecha a mano',
      ctaText: 'Ver más',
      ctaLink: '#productos',
      suggestedAltText: 'Producto artesanal'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
