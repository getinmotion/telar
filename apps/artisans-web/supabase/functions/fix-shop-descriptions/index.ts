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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all shops with descriptions
    const { data: shops, error: fetchError } = await supabase
      .from('artisan_shops')
      .select('id, shop_name, description, region')
      .not('description', 'is', null);

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
        
        // Refine description
        const refinedDescription = await refineText(shop.description, 'description', openAIApiKey);
        
        // Refine shop name if needed
        const refinedName = await refineText(shop.shop_name, 'name', openAIApiKey);
        
        // Refine region if needed
        const refinedRegion = shop.region ? await refineText(shop.region, 'region', openAIApiKey) : shop.region;

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
            }
          });
          console.log(`✓ Updated shop: ${shop.shop_name}`);
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

    console.log('Migration complete:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fix-shop-descriptions:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error fixing shop descriptions' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function refineText(text: string, fieldType: 'description' | 'name' | 'region', openAIApiKey: string): Promise<string> {
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
- Responde SOLO con el texto corregido`,
    
    name: `Corrige errores ortográficos en este nombre de tienda: "${text}". Responde SOLO con el nombre corregido.`,
    
    region: `Corrige errores ortográficos en esta ubicación: "${text}". Responde SOLO con la ubicación corregida.`
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un editor experto. Corrige textos manteniendo su esencia. Responde SOLO con el texto corregido.' },
          { role: 'user', content: prompts[fieldType] }
        ],
        max_tokens: fieldType === 'description' ? 300 : 100,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI error for ${fieldType}:`, response.status);
      return text;
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error refining ${fieldType}:`, error);
    return text;
  }
}
