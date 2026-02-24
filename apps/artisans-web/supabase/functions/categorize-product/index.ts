import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lista canónica de categorías de marketplace
const VALID_MARKETPLACE_CATEGORIES = [
  "Joyería y Accesorios",
  "Decoración del Hogar", 
  "Textiles y Moda",
  "Bolsos y Carteras",
  "Vajillas y Cocina",
  "Muebles",
  "Arte y Esculturas",
  "Iluminación",
  "Cuidado Personal"
];

// Tags artesanales basados en el catálogo oficial colombiano
const ARTISAN_TAGS = {
  materias_primas: [
    "Madera", "Guadua/Bambú/Chonta/Corozo", "Frutos Secos y Semillas",
    "Fibras Naturales", "Hilos y Filamentos", "Telas", "Arcilla", "Cuero",
    "Vidrio", "Piedras", "Metales Preciosos", "Metales No Preciosos",
    "Papel", "Tamo", "Mopa Mopa", "Cacho/Hueso", "Alambre",
    // Cosmética
    "Aceites Esenciales", "Plantas Medicinales", "Ceras Naturales",
    "Mantecas Vegetales", "Arcillas Cosméticas", "Extractos Botánicos"
  ],
  oficios: [
    "Carpintería y Ebanistería", "Trabajos en Guadua/Bambú", "Trabajos en Frutos Secos",
    "Cestería", "Tejeduría", "Textilería", "Textiles No Tejidos", "Trabajos en Tela",
    "Cerámica", "Alfarería", "Marroquinería", "Talabartería", "Guarnielería",
    "Tafilería", "Trabajos en Vidrio", "Trabajos en Piedra", "Orfebrería/Platería",
    "Joyería", "Bisutería", "Forja", "Metalistería", "Trabajo en Papel",
    "Enchapado en Tamo", "Barniz de Pasto", "Enchapado", "Trabajo en Cacho/Hueso", 
    "Alambrismo", "Tallado en Madera", "Cuchillería",
    // Cosmética y cuidado personal
    "Cosmética Artesanal", "Jabonería Artesanal", "Herbología/Aromaterapia"
  ],
  tecnicas: [
    "Talla", "Taracea", "Torneado", "Calado", "Curvado", "Labrado", "Ensamble",
    "Laminado", "Rollo", "Radial", "Entrecruzado", "Tejido de Punto", "Tejido Plano",
    "Redes", "Anudados", "Trenzado", "Tejido en Chaquira", "Afieltrado", "Textil Vegetal",
    "Aplicación", "Fruncido", "Bordado", "Tintura por Reserva", "Modelado", "Plancha",
    "Vaciado en Molde", "Apretón en Molde", "Cincelado", "Repujado", "Preforma",
    "Armado", "Soplado", "Vitrofusión", "Vitralería", "Grabado", "Embutido",
    "Obra Plana", "Esmaltado", "Martillado", "Burilado", "Estampado", "Filigrana",
    "Engaste", "Casting", "Mokumé", "Recalcado", "Entorchado", "Soldadura al Fuego",
    "Fundición", "Doblado", "Cartapesta", "Papel Maché", "Recorte con Incrustación",
    "Recubrimiento", "Hojillado", "Enrollado",
    // Cosmética
    "Saponificación en Frío", "Maceración", "Destilación", "Infusión", "Emulsificación"
  ]
};

// Mapeo completo de oficio a categoría de marketplace
const OFICIO_TO_CATEGORY: Record<string, string> = {
  // Joyería y Accesorios
  "Joyería": "Joyería y Accesorios",
  "Bisutería": "Joyería y Accesorios",
  "Orfebrería/Platería": "Joyería y Accesorios",
  "Alambrismo": "Joyería y Accesorios",
  "Trabajo en Cacho/Hueso": "Joyería y Accesorios",
  
  // Bolsos y Carteras
  "Marroquinería": "Bolsos y Carteras",
  "Talabartería": "Bolsos y Carteras",
  "Guarnielería": "Bolsos y Carteras",
  "Tafilería": "Bolsos y Carteras",
  "Cestería": "Bolsos y Carteras",
  
  // Vajillas y Cocina
  "Cerámica": "Vajillas y Cocina",
  "Alfarería": "Vajillas y Cocina",
  "Trabajos en Vidrio": "Vajillas y Cocina",
  
  // Textiles y Moda
  "Tejeduría": "Textiles y Moda",
  "Textilería": "Textiles y Moda",
  "Trabajos en Tela": "Textiles y Moda",
  "Textiles No Tejidos": "Textiles y Moda",
  
  // Muebles
  "Carpintería y Ebanistería": "Muebles",
  "Trabajos en Guadua/Bambú": "Muebles",
  
  // Decoración del Hogar
  "Metalistería": "Decoración del Hogar",
  "Forja": "Decoración del Hogar",
  "Trabajo en Papel": "Decoración del Hogar",
  "Enchapado en Tamo": "Decoración del Hogar",
  "Barniz de Pasto": "Decoración del Hogar",
  "Enchapado": "Decoración del Hogar",
  "Tallado en Madera": "Decoración del Hogar",
  "Trabajos en Frutos Secos": "Decoración del Hogar",
  "Cuchillería": "Decoración del Hogar",
  
  // Arte y Esculturas
  "Trabajos en Piedra": "Arte y Esculturas",
  "Escultura": "Arte y Esculturas",
  "Arte Pictórico": "Arte y Esculturas",
  
  // Cuidado Personal
  "Cosmética Artesanal": "Cuidado Personal",
  "Jabonería Artesanal": "Cuidado Personal",
  "Herbología/Aromaterapia": "Cuidado Personal"
};

// Mapeo de palabras clave de producto a categoría
const PRODUCT_KEYWORDS: Record<string, string> = {
  // Joyería y Accesorios
  "arete": "Joyería y Accesorios",
  "aretes": "Joyería y Accesorios",
  "collar": "Joyería y Accesorios",
  "pulsera": "Joyería y Accesorios",
  "anillo": "Joyería y Accesorios",
  "manilla": "Joyería y Accesorios",
  "brazalete": "Joyería y Accesorios",
  "diadema": "Joyería y Accesorios",
  "pendiente": "Joyería y Accesorios",
  
  // Bolsos y Carteras
  "bolso": "Bolsos y Carteras",
  "mochila": "Bolsos y Carteras",
  "cartera": "Bolsos y Carteras",
  "morral": "Bolsos y Carteras",
  "canasta": "Bolsos y Carteras",
  "cesto": "Bolsos y Carteras",
  "estuche": "Bolsos y Carteras",
  
  // Vajillas y Cocina
  "plato": "Vajillas y Cocina",
  "taza": "Vajillas y Cocina",
  "bowl": "Vajillas y Cocina",
  "bandeja": "Vajillas y Cocina",
  "vajilla": "Vajillas y Cocina",
  "olla": "Vajillas y Cocina",
  "vasija": "Vajillas y Cocina",
  "jarra": "Vajillas y Cocina",
  
  // Textiles y Moda
  "ruana": "Textiles y Moda",
  "poncho": "Textiles y Moda",
  "bufanda": "Textiles y Moda",
  "tapete": "Textiles y Moda",
  "hamaca": "Textiles y Moda",
  "mantel": "Textiles y Moda",
  "cojín": "Textiles y Moda",
  "sombrero": "Textiles y Moda",
  
  // Muebles
  "mesa": "Muebles",
  "silla": "Muebles",
  "banco": "Muebles",
  "estante": "Muebles",
  "baúl": "Muebles",
  "mueble": "Muebles",
  
  // Decoración del Hogar
  "figura": "Decoración del Hogar",
  "adorno": "Decoración del Hogar",
  "jarrón": "Decoración del Hogar",
  "florero": "Decoración del Hogar",
  "espejo": "Decoración del Hogar",
  "reloj": "Decoración del Hogar",
  "cuchillo": "Decoración del Hogar",
  "navaja": "Decoración del Hogar",
  
  // Arte y Esculturas
  "escultura": "Arte y Esculturas",
  "talla": "Arte y Esculturas",
  "pintura": "Arte y Esculturas",
  "cuadro": "Arte y Esculturas",
  
  // Iluminación
  "lámpara": "Iluminación",
  "lampara": "Iluminación",
  "vela": "Iluminación",
  "candelabro": "Iluminación",
  "farol": "Iluminación",
  
  // Cuidado Personal
  "jabón": "Cuidado Personal",
  "jabon": "Cuidado Personal",
  "crema": "Cuidado Personal",
  "bálsamo": "Cuidado Personal",
  "aceite corporal": "Cuidado Personal",
  "aceite facial": "Cuidado Personal",
  "loción": "Cuidado Personal",
  "sérum": "Cuidado Personal",
  "exfoliante": "Cuidado Personal",
  "mascarilla": "Cuidado Personal",
  "hidratante": "Cuidado Personal",
  "cosmético": "Cuidado Personal"
};

// Combinaciones válidas de craft type de tienda y categoría de producto
const VALID_CROSS_SELLS: Record<string, string[]> = {
  "Tejeduría": ["Textiles y Moda", "Bolsos y Carteras", "Joyería y Accesorios"],
  "Textilería": ["Textiles y Moda", "Bolsos y Carteras", "Joyería y Accesorios"],
  "Cestería": ["Bolsos y Carteras", "Decoración del Hogar"],
  "Cerámica": ["Vajillas y Cocina", "Decoración del Hogar", "Arte y Esculturas"],
  "Alfarería": ["Vajillas y Cocina", "Decoración del Hogar", "Arte y Esculturas"],
  "Carpintería y Ebanistería": ["Muebles", "Decoración del Hogar", "Arte y Esculturas"],
  "Tallado en Madera": ["Decoración del Hogar", "Arte y Esculturas", "Muebles"],
  "Joyería": ["Joyería y Accesorios", "Decoración del Hogar"],
  "Bisutería": ["Joyería y Accesorios", "Decoración del Hogar"],
  "Marroquinería": ["Bolsos y Carteras", "Joyería y Accesorios"],
  "Cosmética Artesanal": ["Cuidado Personal"],
  "Jabonería Artesanal": ["Cuidado Personal"]
};

// Normalización de craft types
const CRAFT_TYPE_NORMALIZATION: Record<string, string> = {
  "tejeduria": "Tejeduría",
  "tejeduría": "Tejeduría",
  "tejido": "Tejeduría",
  "textileria": "Textilería",
  "textilería": "Textilería",
  "textil": "Textilería",
  "textiles": "Textilería",
  "ceramica": "Cerámica",
  "cerámica": "Cerámica",
  "alfareria": "Alfarería",
  "alfarería": "Alfarería",
  "joyeria": "Joyería",
  "joyería": "Joyería",
  "bisuteria": "Bisutería",
  "bisutería": "Bisutería",
  "marroquineria": "Marroquinería",
  "marroquinería": "Marroquinería",
  "cesteria": "Cestería",
  "cestería": "Cestería",
  "carpinteria": "Carpintería y Ebanistería",
  "carpintería": "Carpintería y Ebanistería",
  "madera": "Carpintería y Ebanistería",
  "tallado": "Tallado en Madera",
  "cosmética": "Cosmética Artesanal",
  "cosmetica": "Cosmética Artesanal",
  "jabonería": "Jabonería Artesanal",
  "jaboneria": "Jabonería Artesanal",
  "cosmetics": "Cosmética Artesanal",
  "woodwork": "Carpintería y Ebanistería",
  "jewelry": "Joyería",
  "ceramics": "Cerámica",
  "leather": "Marroquinería",
  "basketry": "Cestería"
};

function normalizeCraftType(craftType: string | null): string | null {
  if (!craftType) return null;
  const normalized = craftType.toLowerCase().trim();
  return CRAFT_TYPE_NORMALIZATION[normalized] || craftType;
}

function detectCategoryFromKeywords(name: string, description: string): string | null {
  const text = `${name} ${description}`.toLowerCase();
  for (const [keyword, category] of Object.entries(PRODUCT_KEYWORDS)) {
    if (text.includes(keyword.toLowerCase())) {
      return category;
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, description, price, images, shop_id, inventory, sku, short_description, compare_price, weight, dimensions, production_time, customizable, made_to_order, lead_time_days, production_time_hours, requires_customization } = await req.json();

    if (!name || !description) {
      return new Response(
        JSON.stringify({ error: 'Name and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!shop_id) {
      return new Response(
        JSON.stringify({ error: 'shop_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch shop's craft_type for context
    const { data: shopData, error: shopError } = await supabase
      .from('artisan_shops')
      .select('craft_type, shop_name, description')
      .eq('id', shop_id)
      .single();

    if (shopError) {
      console.error('⚠️ Could not fetch shop data:', shopError);
    }

    const shopCraftType = normalizeCraftType(shopData?.craft_type);
    console.log('🏷️ Starting categorization for:', name);
    console.log('🏪 Shop craft_type:', shopCraftType);

    // Step 1: Detect category from keywords first
    const keywordCategory = detectCategoryFromKeywords(name, description);
    console.log('🔍 Keyword-detected category:', keywordCategory);

    // Step 2: Get AI classification with shop context
    const tagsPrompt = `Analiza este producto artesanal colombiano y asigna tags relevantes.

CONTEXTO DE LA TIENDA:
- Nombre: ${shopData?.shop_name || 'No disponible'}
- Oficio de la tienda: ${shopCraftType || 'No especificado'}
- Descripción de la tienda: ${shopData?.description || 'No disponible'}

PRODUCTO A CATEGORIZAR:
- Nombre: ${name}
- Descripción: ${description}

OFICIOS ARTESANALES DISPONIBLES (usar EXACTAMENTE estos valores):
${ARTISAN_TAGS.oficios.join(', ')}

CATEGORÍAS DE MARKETPLACE DISPONIBLES:
${VALID_MARKETPLACE_CATEGORIES.join(', ')}

MATERIAS PRIMAS disponibles: ${ARTISAN_TAGS.materias_primas.join(', ')}
TÉCNICAS disponibles: ${ARTISAN_TAGS.tecnicas.join(', ')}

⚠️ REGLAS CRÍTICAS:
1. El "oficio" debe ser coherente con el oficio de la tienda (${shopCraftType || 'no especificado'})
2. La "categoria_marketplace" debe basarse en el TIPO DE PRODUCTO, no en el oficio
3. Para productos de cuidado personal (cremas, jabones, aceites, etc.), usa "Cuidado Personal"
4. Para accesorios tejidos (manillas, pulseras), usa "Joyería y Accesorios"
5. Para bolsos y mochilas tejidas, usa "Bolsos y Carteras"

Responde SOLO con un JSON válido:
{
  "materia_prima": ["materia1", "materia2"],
  "oficio": "nombre exacto del oficio de la lista",
  "tecnicas": ["técnica1", "técnica2"],
  "categoria_marketplace": "categoría exacta de la lista"
}`;

    const tagsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un experto en artesanías colombianas. Responde SOLO con JSON válido. Presta especial atención al contexto de la tienda.' },
          { role: 'user', content: tagsPrompt }
        ],
      }),
    });

    if (!tagsResponse.ok) {
      const errorText = await tagsResponse.text();
      console.error('❌ Lovable AI tags error:', tagsResponse.status, errorText);
      throw new Error(`AI tags failed: ${tagsResponse.status}`);
    }

    const tagsData = await tagsResponse.json();
    const tagsContent = tagsData.choices[0]?.message?.content?.trim() || '{}';
    
    let artisanTags: { 
      materia_prima?: string[]; 
      oficio?: string; 
      tecnicas?: string[];
      categoria_marketplace?: string;
    };
    
    try {
      // Clean JSON response
      const cleanedContent = tagsContent.replace(/```json\n?|\n?```/g, '').trim();
      artisanTags = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('Failed to parse tags JSON:', tagsContent);
      artisanTags = {};
    }

    console.log('✅ AI classification result:', artisanTags);

    // Step 3: Determine final category with validation
    let marketplaceCategory = "Decoración del Hogar"; // Default
    let categorySource = "default";

    // Priority 1: Keyword detection (most reliable for product type)
    if (keywordCategory) {
      marketplaceCategory = keywordCategory;
      categorySource = "keyword";
    }
    // Priority 2: AI suggested category
    else if (artisanTags.categoria_marketplace && VALID_MARKETPLACE_CATEGORIES.includes(artisanTags.categoria_marketplace)) {
      marketplaceCategory = artisanTags.categoria_marketplace;
      categorySource = "ai_categoria";
    }
    // Priority 3: Derive from oficio
    else if (artisanTags.oficio && OFICIO_TO_CATEGORY[artisanTags.oficio]) {
      marketplaceCategory = OFICIO_TO_CATEGORY[artisanTags.oficio];
      categorySource = "oficio_mapping";
    }
    // Priority 4: Derive from shop craft_type
    else if (shopCraftType && OFICIO_TO_CATEGORY[shopCraftType]) {
      marketplaceCategory = OFICIO_TO_CATEGORY[shopCraftType];
      categorySource = "shop_craft_type";
    }

    // Validate category is in valid list
    if (!VALID_MARKETPLACE_CATEGORIES.includes(marketplaceCategory)) {
      console.warn(`⚠️ Invalid category "${marketplaceCategory}", defaulting to "Decoración del Hogar"`);
      marketplaceCategory = "Decoración del Hogar";
      categorySource = "fallback";
    }

    // Validate coherence with shop craft type
    if (shopCraftType && VALID_CROSS_SELLS[shopCraftType]) {
      const validCategories = VALID_CROSS_SELLS[shopCraftType];
      if (!validCategories.includes(marketplaceCategory)) {
        console.warn(`⚠️ Category "${marketplaceCategory}" may not match shop craft_type "${shopCraftType}"`);
        // Don't override, just log warning - product type takes priority
      }
    }

    console.log(`✅ Final category: ${marketplaceCategory} (source: ${categorySource})`);

    // Step 4: Build tags array
    const tagsArray: string[] = [];
    if (artisanTags.oficio) tagsArray.push(artisanTags.oficio);
    tagsArray.push(marketplaceCategory);

    // Step 5: Insert product
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        shop_id,
        name,
        description,
        short_description,
        price: price || 0,
        compare_price: compare_price || null,
        images: images || null,
        category: marketplaceCategory,
        subcategory: artisanTags.oficio || shopCraftType || null,
        tags: tagsArray,
        materials: artisanTags.materia_prima || null,
        techniques: artisanTags.tecnicas || null,
        inventory: inventory || 0,
        sku: sku || null,
        weight: weight || null,
        dimensions: dimensions || null,
        production_time: production_time || null,
        customizable: customizable || false,
        made_to_order: made_to_order || false,
        lead_time_days: lead_time_days || null,
        production_time_hours: production_time_hours || null,
        requires_customization: requires_customization || false,
        active: false,
        moderation_status: 'pending_moderation',
        featured: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Database insert error:', insertError);
      throw insertError;
    }

    console.log('✅ Product inserted successfully:', product.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        product,
        marketplace_category: marketplaceCategory,
        category_source: categorySource,
        shop_craft_type: shopCraftType,
        artisan_tags: {
          materials: artisanTags.materia_prima,
          craft: artisanTags.oficio,
          techniques: artisanTags.tecnicas
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in categorize-product:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
