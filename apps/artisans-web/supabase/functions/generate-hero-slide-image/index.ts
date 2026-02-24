import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
      title,
      subtitle,
      shopName,
      craftType,
      brandColors = [],
      brandClaim = '',
      slideIndex = 0,
      referenceText,
      referenceImageUrl,
      culturalContext = '', // NUEVO: contexto cultural
      productImageUrls = []  // NUEVO: URLs de imágenes de productos reales
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Construir prompt detallado para la imagen con contexto cultural
    const colorContext = brandColors.length > 0 
      ? `usando los colores de marca: ${brandColors.join(', ')}. ` 
      : '';
    
    // Sección de contexto cultural (máxima prioridad)
    const culturalSection = culturalContext 
      ? `\n\nCONTEXTO CULTURAL ESPECÍFICO (CRÍTICO - RESPETAR FIELMENTE):\n${culturalContext}\n` 
      : '';
    
    let basePrompt = `Crea una imagen hero profesional y atractiva para una tienda artesanal.
${culturalSection}
Tienda: "${shopName}"${brandClaim ? ` - "${brandClaim}"` : ''}
Tipo de artesanía: ${craftType}
Tema de este slide: "${title}" - "${subtitle}"
${colorContext}

INSTRUCCIONES CRÍTICAS DE PRECISIÓN CULTURAL:
- La imagen DEBE representar FIELMENTE la cultura, región y productos específicos mencionados en el contexto
- NO mezclar ni confundir culturas diferentes (ej: si es arhuaco, NO mostrar diseños incas, mayas o de otras culturas)
- Los patrones, colores y estilos deben coincidir EXACTAMENTE con la tradición artesanal específica
- Si hay productos mencionados, la imagen debe mostrar productos similares o del mismo tipo
- Respetar las técnicas, materiales y características únicas de la región mencionada
- La autenticidad cultural es más importante que la perfección estética genérica

Estilo requerido:
- Fotografía de producto artesanal de alta calidad
- Iluminación natural y cálida que realce las texturas artesanales
- Composición profesional que destaque la autenticidad cultural
- Enfoque en materiales, texturas y patrones tradicionales específicos
- Ambiente que refleje el contexto geográfico y cultural del artesano

IMPORTANTE: 
- NO incluir texto en la imagen
- NO usar diseños genéricos o de otras culturas
- La imagen debe ser culturalmente precisa y específica
- Formato horizontal optimizado para hero banner
- Resolución: 1536x1024 píxeles`;

    // Agregar referencias del usuario si existen
    if (referenceText) {
      basePrompt += `\n\nGUÍA ADICIONAL DEL USUARIO:\n${referenceText}\n\nToma en cuenta esta descripción para refinar la imagen manteniendo la precisión cultural.`;
    }

    // Agregar referencia de imágenes de productos reales si están disponibles
    if (productImageUrls.length > 0) {
      basePrompt += `\n\nREFERENCIAS VISUALES DE PRODUCTOS REALES:\nUsa las imágenes proporcionadas como referencia visual para los patrones, colores y estilo de los productos artesanales.`;
    }

    const prompt = basePrompt;

    console.log(`[HeroImageGen] Generando imagen ${slideIndex + 1} para "${title}"${referenceText ? ' (con referencias)' : ''}${culturalContext ? ' (con contexto cultural)' : ''}`);

    // Construir mensaje con imágenes de productos como referencia visual
    const messageContent: any[] = [{ type: 'text', text: prompt }];
    
    // Agregar hasta 2 imágenes de productos como referencia visual
    if (productImageUrls.length > 0) {
      productImageUrls.slice(0, 2).forEach(url => {
        messageContent.push({
          type: 'image_url',
          image_url: { url }
        });
      });
    }

    // Llamar a Lovable AI Gateway con modelo de generación de imágenes
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{
          role: 'user',
          content: messageContent
        }],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[HeroImageGen] AI API Error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'RATE_LIMIT',
          message: 'Límite de generación alcanzado. Intenta de nuevo en unos momentos.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'NO_CREDITS',
          message: 'Sin créditos disponibles. Por favor, recarga tu cuenta.'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      throw new Error('No se generó imagen en la respuesta');
    }

    console.log(`[HeroImageGen] Imagen ${slideIndex + 1} generada exitosamente`);

    // Retornar la imagen base64
    return new Response(JSON.stringify({ 
      imageBase64: imageData,
      slideIndex
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[HeroImageGen] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'GENERATION_ERROR',
      message: error.message || 'Error al generar la imagen'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
