import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función SQL para mapear categorías artesanales a categorías del marketplace
const categoryMappingFunction = `
CREATE OR REPLACE FUNCTION map_artisan_category(artisan_category TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    -- Joyería y Accesorios
    WHEN UPPER(artisan_category) LIKE '%JOYERÍA%' OR UPPER(artisan_category) LIKE '%BISUTERÍA%' 
      OR UPPER(artisan_category) LIKE '%JOYERIA%' OR UPPER(artisan_category) LIKE '%BISUTERIA%'
      THEN 'Joyería y Accesorios'
    
    -- Textiles y Moda
    WHEN UPPER(artisan_category) LIKE '%TEJED%' OR UPPER(artisan_category) LIKE '%TEXTIL%'
      OR UPPER(artisan_category) LIKE '%TELAR%' OR UPPER(artisan_category) LIKE '%ROPA%'
      OR UPPER(artisan_category) LIKE '%MODA%' OR UPPER(artisan_category) LIKE '%BUFANDA%'
      THEN 'Textiles y Moda'
    
    -- Bolsos y Carteras
    WHEN UPPER(artisan_category) LIKE '%CESTE%' OR UPPER(artisan_category) LIKE '%BOLSO%'
      OR UPPER(artisan_category) LIKE '%CARTERA%' OR UPPER(artisan_category) LIKE '%MOCHILA%'
      OR UPPER(artisan_category) LIKE '%CANASTA%' OR UPPER(artisan_category) LIKE '%MORRAL%'
      THEN 'Bolsos y Carteras'
    
    -- Decoración del Hogar
    WHEN UPPER(artisan_category) LIKE '%DECORACIÓN%' OR UPPER(artisan_category) LIKE '%DECORACION%'
      OR UPPER(artisan_category) LIKE '%ADORNO%' OR UPPER(artisan_category) LIKE '%TAPIZ%'
      THEN 'Decoración del Hogar'
    
    -- Vajillas y Cocina
    WHEN UPPER(artisan_category) LIKE '%CERÁMICA%' OR UPPER(artisan_category) LIKE '%CERAMICA%'
      OR UPPER(artisan_category) LIKE '%VAJILLA%' OR UPPER(artisan_category) LIKE '%ALFARERÍA%'
      OR UPPER(artisan_category) LIKE '%ALFARERIA%' OR UPPER(artisan_category) LIKE '%COCINA%'
      THEN 'Vajillas y Cocina'
    
    -- Muebles
    WHEN UPPER(artisan_category) LIKE '%MUEBLE%' OR UPPER(artisan_category) LIKE '%CARPINTERÍA%'
      OR UPPER(artisan_category) LIKE '%CARPINTERIA%' OR UPPER(artisan_category) LIKE '%EBANISTERÍA%'
      OR UPPER(artisan_category) LIKE '%EBANISTERIA%'
      THEN 'Muebles'
    
    -- Arte y Esculturas
    WHEN UPPER(artisan_category) LIKE '%ESCULTURA%' OR UPPER(artisan_category) LIKE '%TALLA%'
      OR UPPER(artisan_category) LIKE '%ARTE%' OR UPPER(artisan_category) LIKE '%PINTURA%'
      THEN 'Arte y Esculturas'
    
    -- Iluminación
    WHEN UPPER(artisan_category) LIKE '%LÁMPARA%' OR UPPER(artisan_category) LIKE '%LAMPARA%'
      OR UPPER(artisan_category) LIKE '%VELA%' OR UPPER(artisan_category) LIKE '%ILUMINACIÓN%'
      OR UPPER(artisan_category) LIKE '%ILUMINACION%'
      THEN 'Iluminación'
    
    -- Por defecto: Decoración del Hogar
    ELSE 'Decoración del Hogar'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
`;

// SQL para crear la vista con categorías mapeadas
const createViewSQL = `
${categoryMappingFunction}

DROP VIEW IF EXISTS marketplace_products CASCADE;

CREATE VIEW marketplace_products AS
SELECT 
  p.id,
  p.shop_id,
  p.name,
  p.description,
  p.short_description,
  p.price,
  p.compare_price,
  CASE 
    WHEN p.images IS NOT NULL AND jsonb_array_length(p.images) > 0 
    THEN p.images->>0
    ELSE NULL 
  END AS image_url,
  p.images,
  s.shop_name AS store_name,
  s.shop_slug AS store_slug,
  s.logo_url AS store_logo,
  s.banner_url,
  s.craft_type AS craft,
  s.region,
  s.description AS store_description,
  map_artisan_category(p.category) AS category,
  p.category AS original_category,
  p.subcategory,
  CASE 
    WHEN jsonb_typeof(p.tags) = 'array' 
    THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p.tags))
    ELSE ARRAY[]::text[]
  END AS tags,
  CASE 
    WHEN jsonb_typeof(p.materials) = 'array' 
    THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p.materials))
    ELSE ARRAY[]::text[]
  END AS materials,
  CASE 
    WHEN jsonb_typeof(p.techniques) = 'array' 
    THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p.techniques))
    ELSE ARRAY[]::text[]
  END AS techniques,
  CASE 
    WHEN p.created_at > NOW() - INTERVAL '30 days' 
    THEN true 
    ELSE false 
  END AS is_new,
  p.inventory AS stock,
  p.customizable,
  p.featured,
  p.made_to_order,
  p.lead_time_days,
  p.created_at,
  p.updated_at,
  p.sku,
  p.active,
  false AS free_shipping,
  0::numeric AS rating,
  0 AS reviews_count
FROM products p
LEFT JOIN artisan_shops s ON p.shop_id = s.id
WHERE p.active = true
  AND p.moderation_status = 'approved'
  AND s.publish_status = 'published'
  AND s.marketplace_approved = true;
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELAR_SERVICE_ROLE_KEY = Deno.env.get('TELAR_SERVICE_ROLE_KEY');
    if (!TELAR_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'TELAR_SERVICE_ROLE_KEY no configurada',
          sql: createViewSQL
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Conectar a telar.ia con service role key
    const supabase = createClient(
      'https://ylooqmqmoufqtxvetxuj.supabase.co',
      TELAR_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false }
      }
    );

    console.log('Intentando crear vista marketplace_products en telar.ia...');

    // Intentar ejecutar SQL directamente
    try {
      const { error } = await supabase.rpc('exec_sql', { query: createViewSQL });
      
      if (error) throw error;

      console.log('✅ Vista marketplace_products creada exitosamente');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Vista marketplace_products creada exitosamente',
          sql: createViewSQL
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (rpcError) {
      console.log('RPC exec_sql no disponible, devolviendo SQL para ejecución manual');
      throw rpcError;
    }

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear vista automáticamente',
        sql: createViewSQL,
        instructions: 'Ejecuta el SQL manualmente en el SQL Editor de Supabase de telar.ia'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
