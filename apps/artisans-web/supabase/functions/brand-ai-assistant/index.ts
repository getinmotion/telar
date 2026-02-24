import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { action, logoUrl, businessDescription, brandName, primaryColors } = requestBody;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`[brand-ai-assistant] Action: ${action}`);

    // Acción 1: Generar claims inteligentes
    if (action === 'generate_claim') {
      const { userId } = requestBody;
      console.log(`[brand-ai-assistant] Generating claims for: ${brandName} (userId: ${userId})`);
      
      // Consultar el contexto completo del usuario
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: contextData } = await supabase
        .from('user_master_context')
        .select('business_context, business_profile')
        .eq('user_id', userId)
        .single();
      
      // Extraer información rica del contexto con múltiples fallbacks
      const businessContext = (contextData?.business_context as any) || {};
      const businessProfile = (contextData?.business_profile as any) || {};
      
      console.log('[brand-ai-assistant] businessContext:', JSON.stringify(businessContext, null, 2));
      console.log('[brand-ai-assistant] businessProfile:', JSON.stringify(businessProfile, null, 2));
      
      // Construir contexto completo con fallbacks entre business_context y business_profile
      const craftType = businessContext.tipo_artesania || businessProfile.craftType || businessProfile.craft_type || 'No especificado';
      const experience = businessContext.experiencia || businessProfile.experienceTime || businessProfile.years_in_business || 'No especificado';
      const location = businessContext.ubicacion || businessProfile.businessLocation || businessProfile.business_location || 'No especificada';
      
      // Historia y descripción
      const story = businessContext.historia || businessContext.resumen || businessContext.brand_story || 
                   businessProfile.businessDescription || businessDescription || '';
      
      // Cliente y mercado
      const target = businessContext.cliente_ideal || businessContext.target_customer || 
                    businessProfile.targetCustomer || businessProfile.customerKnowledge || '';
      
      // Ventas y comercialización
      const hasSold = businessContext.ha_vendido || businessProfile.hasSold || false;
      const salesFrequency = businessContext.frecuencia_ventas || businessProfile.salesFrequency || '';
      const channels = businessContext.canales_actuales || businessContext.canales_promocion || 
                      businessProfile.promotionChannels?.join(', ') || '';
      const sellingComfort = businessContext.comodidad_venta || businessProfile.sellingComfort || '';
      
      // Precios y propuesta de valor
      const pricingMethod = businessContext.metodo_precio || businessProfile.pricingMethod || '';
      const profitClarity = businessContext.claridad_ganancia || businessProfile.profitClarity || '';
      const value = businessContext.propuesta_valor || businessContext.value_proposition || '';
      
      // Opcionales
      const materials = businessContext.materiales || businessContext.materials || businessContext.tecnicas || '';
      const inspiration = businessContext.inspiraciones || businessContext.inspirations || '';
      const products = businessContext.productos || businessContext.products || businessContext.servicios || '';
      
      const richContext = `
Nombre de la marca: ${brandName}
Descripción básica: ${businessDescription}

INFORMACIÓN DEL ARTESANO:
- Tipo de artesanía: ${craftType}
- Experiencia: ${experience}
- Ubicación: ${location}

HISTORIA DEL NEGOCIO:
${story}

SITUACIÓN COMERCIAL ACTUAL:
${hasSold ? `- YA HA REALIZADO VENTAS (Frecuencia: ${salesFrequency || 'No especificada'})` : '- AÚN NO HA REALIZADO VENTAS (está iniciando)'}
${channels ? `- Canales de promoción actuales: ${channels}` : '- Sin canales definidos aún'}
${sellingComfort ? `- Nivel de comodidad vendiendo: ${sellingComfort}` : ''}
${pricingMethod ? `- Método de fijación de precios: ${pricingMethod}` : ''}
${profitClarity ? `- Claridad sobre ganancias: ${profitClarity}` : ''}

${target ? `CLIENTE IDEAL:\n${target}` : ''}

${materials ? `MATERIALES Y TÉCNICAS:\n${materials}` : ''}

${inspiration ? `INSPIRACIONES:\n${inspiration}` : ''}

${value ? `PROPUESTA DE VALOR:\n${value}` : ''}

${products ? `PRODUCTOS/SERVICIOS:\n${products}` : ''}
`;

      console.log('[brand-ai-assistant] Rich context prepared:', richContext.substring(0, 200) + '...');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `Eres un experto en branding artesanal latinoamericano especializado en crear claims auténticos y memorables.

Genera claims que:
- Reflejen la HISTORIA PERSONAL y los VALORES únicos del artesano
- Incorporen los MATERIALES y TÉCNICAS específicas mencionadas
- Conecten emocionalmente con el CLIENTE IDEAL descrito
- Sean cortos (5-8 palabras), memorables y auténticos
- Eviten clichés genéricos como "artesanía con alma" o "hecho con amor"
- Usen lenguaje cercano, cálido y distintivo
- Capturen la esencia única de este negocio específico

CRÍTICO: Usa TODA la información proporcionada para crear claims verdaderamente personalizados que solo podrían aplicar a ESTE negocio.`
            },
            {
              role: 'user',
              content: richContext + '\n\nGenera 3 opciones de claim profesionales y memorables basados en TODA esta información específica.'
            }
          ],
          temperature: 0.8,
          tools: [{
            type: 'function',
            function: {
              name: 'suggest_claims',
              description: 'Retorna 3 opciones de claim con razonamiento',
              parameters: {
                type: 'object',
                properties: {
                  claims: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        text: { type: 'string' },
                        reasoning: { type: 'string' }
                      },
                      required: ['text', 'reasoning']
                    }
                  }
                },
                required: ['claims']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'suggest_claims' } }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[brand-ai-assistant] AI Gateway Error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit excedido. Intenta de nuevo en unos segundos.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Créditos agotados. Contacta al administrador.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        console.error('[brand-ai-assistant] No tool call in response:', data);
        throw new Error('No se pudo generar claims con IA');
      }

      const claims = JSON.parse(toolCall.function.arguments).claims;
      console.log(`[brand-ai-assistant] Generated ${claims.length} claims`);

      return new Response(JSON.stringify({ claims }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Acción 2: Extraer colores del logo con IA visual
    if (action === 'extract_colors' && logoUrl) {
      console.log(`[brand-ai-assistant] Extracting colors from: ${logoUrl}`);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analiza este logo y extrae los 3-5 colores dominantes en formato hexadecimal. Devuelve solo los códigos hex más representativos y visualmente importantes.'
                },
                {
                  type: 'image_url',
                  image_url: { url: logoUrl }
                }
              ]
            }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'extract_colors',
              description: 'Extrae colores dominantes de una imagen',
              parameters: {
                type: 'object',
                properties: {
                  colors: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array de códigos hexadecimales (ej: ["#FF5733", "#C70039"])'
                  }
                },
                required: ['colors']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'extract_colors' } }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[brand-ai-assistant] AI Gateway Error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit excedido' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Créditos agotados' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        console.error('[brand-ai-assistant] No tool call in response:', data);
        throw new Error('No se pudieron extraer colores con IA');
      }

      const colors = JSON.parse(toolCall.function.arguments).colors;
      console.log(`[brand-ai-assistant] Extracted ${colors.length} colors:`, colors);

      return new Response(JSON.stringify({ colors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Acción 3: Generar paleta secundaria complementaria
    if (action === 'generate_color_palette' && primaryColors) {
      console.log(`[brand-ai-assistant] Generating secondary palette from:`, primaryColors);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en teoría del color y diseño de sistemas de marca. Generas paletas de colores secundarias armoniosas y profesionales basadas en colores primarios.'
            },
            {
              role: 'user',
              content: `Colores primarios del logo: ${primaryColors.join(', ')}\n\nGenera 3-5 colores secundarios complementarios en formato hexadecimal que armonicen con los primarios. Incluye variaciones de tonos claros, medios y oscuros para crear un sistema de color completo para una tienda online.`
            }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'generate_palette',
              description: 'Genera paleta de colores secundaria complementaria',
              parameters: {
                type: 'object',
                properties: {
                  secondary_colors: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array de colores secundarios en hex'
                  },
                  reasoning: {
                    type: 'string',
                    description: 'Explicación breve de por qué estos colores complementan a los primarios'
                  }
                },
                required: ['secondary_colors', 'reasoning']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'generate_palette' } }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[brand-ai-assistant] AI Gateway Error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit excedido' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Créditos agotados' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        console.error('[brand-ai-assistant] No tool call in response:', data);
        throw new Error('No se pudo generar paleta secundaria con IA');
      }

      const result = JSON.parse(toolCall.function.arguments);
      console.log(`[brand-ai-assistant] Generated ${result.secondary_colors.length} secondary colors`);

      return new Response(JSON.stringify({ 
        secondary_colors: result.secondary_colors,
        reasoning: result.reasoning 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Acción 4: Diagnóstico completo de identidad de marca
    if (action === 'diagnose_brand_identity') {
      const { logo_url, colors, brand_name, business_description, perception } = requestBody;
      
      console.log(`[brand-ai-assistant] Running brand diagnosis for: ${brand_name}`);
      
      const diagnosticPrompt = `Eres un experto en identidad de marca para artesanos latinoamericanos.

Analiza la siguiente identidad de marca y genera un diagnóstico completo con scores de 1-5 por dimensión:

MARCA: ${brand_name}
DESCRIPCIÓN: ${business_description}

ASSETS VISUALES:
- Logo URL: ${logo_url || 'No proporcionado'}
- Colores primarios: ${colors?.primary?.join(', ') || 'No definidos'}
- Colores secundarios: ${colors?.secondary?.join(', ') || 'No definidos'}

PERCEPCIÓN DEL USUARIO:
- Años con la marca: ${perception?.years_with_brand}
- Descripción en 3 palabras: ${perception?.description_in_3_words}
- Feedback de clientes: ${perception?.customer_feedback}
- Qué transmite el logo: ${perception?.logo_feeling}
- Público objetivo: ${perception?.target_audience}
- Emoción deseada: ${perception?.desired_emotion}

EVALÚA cada dimensión (1=muy mal, 5=excelente):
1. Logo (claridad, escalabilidad, simbolismo, complejidad)
2. Color (armonía, contraste, coherencia con rubro)
3. Tipografía (legibilidad, consistencia, tono)
4. Claim/Mensaje (claridad, diferencial, extensión)
5. Identidad Global (alineación con público, percepción emocional, coherencia)`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: diagnosticPrompt }],
          tools: [{
            type: 'function',
            function: {
              name: 'diagnose_brand',
              parameters: {
                type: 'object',
                properties: {
                  scores: {
                    type: 'object',
                    properties: {
                      logo: { type: 'object', properties: { score: { type: 'number' }, reasoning: { type: 'string' } } },
                      color: { type: 'object', properties: { score: { type: 'number' }, reasoning: { type: 'string' } } },
                      typography: { type: 'object', properties: { score: { type: 'number' }, reasoning: { type: 'string' } } },
                      claim: { type: 'object', properties: { score: { type: 'number' }, reasoning: { type: 'string' } } },
                      global_identity: { type: 'object', properties: { score: { type: 'number' }, reasoning: { type: 'string' } } }
                    }
                  },
                  average_score: { type: 'number' },
                  summary: { type: 'string' },
                  strengths: { type: 'array', items: { type: 'string' } },
                  opportunities: { type: 'array', items: { type: 'string' } },
                  risks: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'diagnose_brand' } }
        })
      });

      if (!response.ok) {
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      const diagnosis = JSON.parse(toolCall.function.arguments);

      console.log(`[brand-ai-assistant] Diagnosis complete. Average score: ${diagnosis.average_score}`);

      return new Response(JSON.stringify({ diagnosis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Acción no válida o parámetros faltantes' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[brand-ai-assistant] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
