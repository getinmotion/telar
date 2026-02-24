import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lista canónica de categorías válidas
const VALID_CATEGORIES = [
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

// Mapeo de categorías incorrectas/variantes a categorías válidas
const CATEGORY_NORMALIZATION: Record<string, string> = {
  // Variantes comunes
  "joyería": "Joyería y Accesorios",
  "joyeria": "Joyería y Accesorios",
  "joyas": "Joyería y Accesorios",
  "accesorios": "Joyería y Accesorios",
  "decoración": "Decoración del Hogar",
  "decoracion": "Decoración del Hogar",
  "hogar": "Decoración del Hogar",
  "textiles": "Textiles y Moda",
  "moda": "Textiles y Moda",
  "ropa": "Textiles y Moda",
  "bolsos": "Bolsos y Carteras",
  "carteras": "Bolsos y Carteras",
  "vajillas": "Vajillas y Cocina",
  "cocina": "Vajillas y Cocina",
  "cerámica": "Vajillas y Cocina",
  "ceramica": "Vajillas y Cocina",
  "muebles": "Muebles",
  "arte": "Arte y Esculturas",
  "esculturas": "Arte y Esculturas",
  "iluminación": "Iluminación",
  "iluminacion": "Iluminación",
  "lámparas": "Iluminación",
  "lamparas": "Iluminación",
  "cuidado personal": "Cuidado Personal",
  "cosmética": "Cuidado Personal",
  "cosmetica": "Cuidado Personal"
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
  
  // Cuidado Personal
  "jabón": "Cuidado Personal",
  "jabon": "Cuidado Personal",
  "crema": "Cuidado Personal",
  "bálsamo": "Cuidado Personal",
  "aceite corporal": "Cuidado Personal",
  "loción": "Cuidado Personal",
  "sérum": "Cuidado Personal",
  "exfoliante": "Cuidado Personal",
  "mascarilla": "Cuidado Personal",
  "hidratante": "Cuidado Personal"
};

// Mapeo de oficio a categoría
const OFICIO_TO_CATEGORY: Record<string, string> = {
  "Joyería": "Joyería y Accesorios",
  "Bisutería": "Joyería y Accesorios",
  "Orfebrería/Platería": "Joyería y Accesorios",
  "Marroquinería": "Bolsos y Carteras",
  "Talabartería": "Bolsos y Carteras",
  "Cestería": "Bolsos y Carteras",
  "Cerámica": "Vajillas y Cocina",
  "Alfarería": "Vajillas y Cocina",
  "Tejeduría": "Textiles y Moda",
  "Textilería": "Textiles y Moda",
  "Carpintería y Ebanistería": "Muebles",
  "Tallado en Madera": "Decoración del Hogar",
  "Cosmética Artesanal": "Cuidado Personal",
  "Jabonería Artesanal": "Cuidado Personal"
};

function isValidCategory(category: string | null): boolean {
  if (!category) return false;
  return VALID_CATEGORIES.includes(category);
}

function normalizeCategory(category: string | null): string {
  if (!category) return "Decoración del Hogar";
  if (VALID_CATEGORIES.includes(category)) return category;
  
  const normalized = category.toLowerCase().trim();
  return CATEGORY_NORMALIZATION[normalized] || "Decoración del Hogar";
}

function detectCategoryFromName(name: string): string | null {
  const nameLower = name.toLowerCase();
  for (const [keyword, category] of Object.entries(PRODUCT_KEYWORDS)) {
    if (nameLower.includes(keyword)) {
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
    const { shop_id, dry_run = false } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔧 Starting product category fix...');
    console.log(`Mode: ${dry_run ? 'DRY RUN' : 'LIVE'}`);

    // Build query
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        category,
        subcategory,
        shop_id,
        artisan_shops!inner(craft_type, shop_name)
      `);

    if (shop_id) {
      query = query.eq('shop_id', shop_id);
    }

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📦 Found ${products?.length || 0} products to analyze`);

    const results = {
      total: products?.length || 0,
      invalid_categories: 0,
      missing_subcategory: 0,
      fixed: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const product of products || []) {
      const shopCraftType = (product as any).artisan_shops?.craft_type;
      const currentCategory = product.category;
      const productName = product.name || '';
      
      let needsFix = false;
      let newCategory = currentCategory;
      let newSubcategory = product.subcategory;
      let fixReason = '';

      // Check 1: Is category valid?
      if (!isValidCategory(currentCategory)) {
        results.invalid_categories++;
        needsFix = true;
        
        // Try to detect from product name
        const detectedCategory = detectCategoryFromName(productName);
        if (detectedCategory) {
          newCategory = detectedCategory;
          fixReason = `Invalid category "${currentCategory}" → detected from name: "${newCategory}"`;
        } else {
          // Normalize existing category
          newCategory = normalizeCategory(currentCategory);
          fixReason = `Invalid category "${currentCategory}" → normalized to: "${newCategory}"`;
        }
      }

      // Check 2: Is subcategory (oficio) missing?
      if (!product.subcategory && shopCraftType) {
        results.missing_subcategory++;
        needsFix = true;
        newSubcategory = shopCraftType;
        fixReason += (fixReason ? ' | ' : '') + `Missing subcategory → set to shop craft_type: "${shopCraftType}"`;
      }

      if (needsFix) {
        const detail = {
          product_id: product.id,
          product_name: productName,
          shop_name: (product as any).artisan_shops?.shop_name,
          shop_craft_type: shopCraftType,
          old_category: currentCategory,
          new_category: newCategory,
          old_subcategory: product.subcategory,
          new_subcategory: newSubcategory,
          fix_reason: fixReason
        };

        if (!dry_run) {
          const { error: updateError } = await supabase
            .from('products')
            .update({
              category: newCategory,
              subcategory: newSubcategory
            })
            .eq('id', product.id);

          if (updateError) {
            console.error(`❌ Error updating product ${product.id}:`, updateError);
            results.errors++;
            detail.error = updateError.message;
          } else {
            results.fixed++;
            console.log(`✅ Fixed product: ${productName} (${currentCategory} → ${newCategory})`);
          }
        } else {
          results.fixed++;
          console.log(`🔍 Would fix: ${productName} (${currentCategory} → ${newCategory})`);
        }

        results.details.push(detail);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`- Total products: ${results.total}`);
    console.log(`- Invalid categories: ${results.invalid_categories}`);
    console.log(`- Missing subcategory: ${results.missing_subcategory}`);
    console.log(`- ${dry_run ? 'Would fix' : 'Fixed'}: ${results.fixed}`);
    console.log(`- Errors: ${results.errors}`);

    return new Response(
      JSON.stringify({
        success: true,
        dry_run,
        ...results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in fix-product-categories:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
