import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse optional shopId from request body for single shop refinement
    let targetShopId: string | null = null;
    try {
      const body = await req.json();
      targetShopId = body?.shopId || null;
    } catch {
      // No body provided, process all shops
    }

    // Get shops with descriptions
    let query = supabase
      .from('artisan_shops')
      .select('id, shop_name, description, region')
      .not('description', 'is', null);

    if (targetShopId) {
      query = query.eq('id', targetShopId);
    }

    const { data: shops, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching shops:', fetchError);
      throw fetchError;
    }

    console.log(`Processing ${shops?.length || 0} shops...`);

    const results = {
      total: shops?.length || 0,
      processed: 0,
      errors: 0,
      details: [] as any[]
    };

    // Process each shop
    for (const shop of shops || []) {
      try {
        console.log(`Processing shop: ${shop.shop_name}`);
        
        // Refine description using Lovable AI
        const refinedDescription = await refineText(shop.description, 'description', LOVABLE_API_KEY);
        
        // Refine shop name if needed
        const refinedName = await refineText(shop.shop_name, 'name', LOVABLE_API_KEY);
        
        // Refine region if needed
        const refinedRegion = shop.region ? await refineText(shop.region, 'region', LOVABLE_API_KEY) : shop.region;

        // Check if any changes were made
        const hasChanges = 
          shop.description !== refinedDescription ||
          shop.shop_name !== refinedName ||
          shop.region !== refinedRegion;

        if (hasChanges) {
          // Update shop in database
          const { error: updateError } = await supabase
            .from('artisan_shops')
            .update({
              description: refinedDescription,
              shop_name: refinedName,
              region: refinedRegion,
              updated_at: new Date().toISOString()
            })
            .eq('id', shop.id);

          if (updateError) {
            console.error(`Error updating shop ${shop.id}:`, updateError);
            results.errors++;
            results.details.push({
              shopId: shop.id,
              shopName: shop.shop_name,
              status: 'error',
              error: updateError.message
            });
          } else {
            results.processed++;
            results.details.push({
              shopId: shop.id,
              shopName: shop.shop_name,
              status: 'success',
              changes: {
                description: shop.description !== refinedDescription,
                name: shop.shop_name !== refinedName,
                region: shop.region !== refinedRegion
              },
              before: {
                description: shop.description?.substring(0, 100),
                name: shop.shop_name,
                region: shop.region
              },
              after: {
                description: refinedDescription?.substring(0, 100),
                name: refinedName,
                region: refinedRegion
              }
            });
            console.log(`✓ Updated shop: ${shop.shop_name}`);
          }
        } else {
          results.details.push({
            shopId: shop.id,
            shopName: shop.shop_name,
            status: 'no_changes',
            message: 'No refinement needed'
          });
          console.log(`- No changes for shop: ${shop.shop_name}`);
        }
      } catch (error) {
        console.error(`Error processing shop ${shop.id}:`, error);
        results.errors++;
        results.details.push({
          shopId: shop.id,
          shopName: shop.shop_name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('Batch refinement complete:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fix-shop-descriptions-batch:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error fixing shop descriptions' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function refineText(text: string, fieldType: 'description' | 'name' | 'region', apiKey: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  const prompts = {
    description: `Corrige TODOS los errores ortográficos y gramaticales en esta descripción de tienda artesanal:
"${text}"

INSTRUCCIONES:
- Corrige errores ortográficos (ej: "prodcuto" → "producto", "que gao" → "que hago", "estoyn" → "estoy")
- Corrige gramática y puntuación
- Mejora la redacción manteniendo el mensaje original
- Mantén el tono en primera persona si está presente
- NO añadas información nueva
- Responde SOLO con el texto corregido, sin explicaciones`,
    
    name: `Corrige errores ortográficos en este nombre de tienda: "${text}". Responde SOLO con el nombre corregido, sin explicaciones.`,
    
    region: `Corrige errores ortográficos en esta ubicación: "${text}". Responde SOLO con la ubicación corregida, sin explicaciones.`
  };

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un editor experto en español. Corrige textos manteniendo su esencia y autenticidad. Responde SOLO con el texto corregido, sin comentarios adicionales.' },
          { role: 'user', content: prompts[fieldType] }
        ],
        max_tokens: fieldType === 'description' ? 500 : 100,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lovable AI error for ${fieldType}:`, response.status, errorText);
      return text;
    }

    const data = await response.json();
    const refinedText = data.choices?.[0]?.message?.content?.trim();
    
    // Sanity check - if AI returned something drastically different or empty, keep original
    if (!refinedText || refinedText.length < text.length * 0.3) {
      console.warn(`AI response too short for ${fieldType}, keeping original`);
      return text;
    }
    
    return refinedText;
  } catch (error) {
    console.error(`Error refining ${fieldType}:`, error);
    return text;
  }
}
