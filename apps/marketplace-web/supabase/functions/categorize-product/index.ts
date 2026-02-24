import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tags artesanales basados en el catálogo oficial
const ARTISAN_TAGS = {
  materias_primas: [
    "Madera", "Guadua/Bambú/Chonta/Corozo", "Frutos Secos y Semillas",
    "Fibras Naturales", "Hilos y Filamentos", "Telas", "Arcilla", "Cuero",
    "Vidrio", "Piedras", "Metales Preciosos", "Metales No Preciosos",
    "Papel", "Tamo", "Mopa Mopa", "Cacho/Hueso", "Alambre"
  ],
  oficios: [
    "Carpintería y Ebanistería", "Trabajos en Guadua/Bambú", "Trabajos en Frutos Secos",
    "Cestería", "Tejeduría", "Textiles No Tejidos", "Trabajos en Tela",
    "Cerámica", "Alfarería", "Marroquinería", "Talabartería", "Guarnielería",
    "Tafilería", "Trabajos en Vidrio", "Trabajos en Piedra", "Orfebrería/Platería",
    "Joyería", "Bisutería", "Forja", "Metalistería", "Trabajo en Papel",
    "Enchapado en Tamo", "Barniz de Pasto", "Enchapado", "Trabajo en Cacho/Hueso", "Alambrismo"
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
    "Recubrimiento", "Hojillado", "Enrollado"
  ]
};

// Categorías de marketplace orientadas al comprador
const MARKETPLACE_CATEGORIES = {
  "Joyería y Accesorios": ["joyería", "bisutería", "collar", "aretes", "pulsera", "anillo", "accesorio"],
  "Decoración del Hogar": ["decoración", "escultura", "cuadro", "jarrón", "tapiz", "objeto decorativo"],
  "Textiles y Moda": ["textil", "ropa", "bufanda", "ruana", "mantel", "cojín", "tapete", "hamaca"],
  "Bolsos y Carteras": ["bolso", "mochila", "cartera", "estuche", "monedero", "canasta"],
  "Vajillas y Cocina": ["plato", "taza", "bowl", "bandeja", "cubierto", "utensilio", "cocina", "vajilla"],
  "Muebles": ["mesa", "silla", "estantería", "baúl", "mueble"],
  "Arte y Esculturas": ["arte", "escultura", "figura", "talla"],
  "Iluminación": ["lámpara", "vela", "candelabro", "luz", "iluminación"]
};

// Mapeo de oficios artesanales a categorías de marketplace
const OFICIO_TO_CATEGORY: Record<string, string> = {
  "Joyería": "Joyería y Accesorios",
  "Bisutería": "Joyería y Accesorios",
  "Orfebrería/Platería": "Joyería y Accesorios",
  "Marroquinería": "Bolsos y Carteras",
  "Talabartería": "Bolsos y Carteras",
  "Cestería": "Bolsos y Carteras",
  "Cerámica": "Vajillas y Cocina",
  "Alfarería": "Vajillas y Cocina",
  "Trabajos en Vidrio": "Vajillas y Cocina",
  "Tejeduría": "Textiles y Moda",
  "Trabajos en Tela": "Textiles y Moda",
  "Textiles No Tejidos": "Textiles y Moda",
  "Carpintería y Ebanistería": "Muebles",
  "Trabajos en Guadua/Bambú": "Muebles",
  "Metalistería": "Decoración del Hogar",
  "Forja": "Decoración del Hogar",
  "Trabajo en Papel": "Decoración del Hogar",
  "Trabajos en Piedra": "Arte y Esculturas",
  "Enchapado en Tamo": "Decoración del Hogar",
  "Barniz de Pasto": "Decoración del Hogar"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, description, price, image_url, store_name, stock, sku } = await req.json();

    if (!name || !description) {
      return new Response(
        JSON.stringify({ error: 'Name and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting categorization for:', name);

    // Step 1: Asignar tags artesanales usando IA
    const tagsPrompt = `Analiza este producto artesanal colombiano y asigna tags relevantes de cada categoría.

Producto:
- Nombre: ${name}
- Descripción: ${description}

MATERIAS PRIMAS disponibles: ${ARTISAN_TAGS.materias_primas.join(', ')}
OFICIOS disponibles: ${ARTISAN_TAGS.oficios.join(', ')}
TÉCNICAS disponibles: ${ARTISAN_TAGS.tecnicas.join(', ')}

Responde SOLO con un JSON válido en este formato:
{
  "materia_prima": "nombre exacto de la materia prima",
  "oficio": "nombre exacto del oficio",
  "tecnicas": ["técnica1", "técnica2"]
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
          { role: 'system', content: 'Eres un experto en artesanías colombianas. Responde SOLO con JSON válido.' },
          { role: 'user', content: tagsPrompt }
        ],
      }),
    });

    if (!tagsResponse.ok) {
      const errorText = await tagsResponse.text();
      console.error('Lovable AI tags error:', tagsResponse.status, errorText);
      throw new Error(`AI tags failed: ${tagsResponse.status}`);
    }

    const tagsData = await tagsResponse.json();
    const tagsContent = tagsData.choices[0]?.message?.content?.trim() || '{}';
    
    let artisanTags: { materia_prima?: string; oficio?: string; tecnicas?: string[] };
    try {
      artisanTags = JSON.parse(tagsContent);
    } catch (e) {
      console.error('Failed to parse tags JSON:', tagsContent);
      artisanTags = {};
    }

    console.log('Artisan tags assigned:', artisanTags);

    // Step 2: Determinar categoría de marketplace
    let marketplaceCategory = "Decoración del Hogar"; // Default

    // Primero intentar mapeo por oficio
    if (artisanTags.oficio && OFICIO_TO_CATEGORY[artisanTags.oficio]) {
      marketplaceCategory = OFICIO_TO_CATEGORY[artisanTags.oficio];
    } else {
      // Si no hay mapeo directo, usar IA para categoría de marketplace
      const categoryPrompt = `Analiza este producto artesanal y asigna la categoría de marketplace más apropiada.

Producto:
- Nombre: ${name}
- Descripción: ${description}

Categorías disponibles:
${Object.keys(MARKETPLACE_CATEGORIES).map(cat => `- ${cat}`).join('\n')}

Responde SOLO con el nombre exacto de UNA categoría.`;

      const categoryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Eres un experto en categorización de productos. Responde solo con el nombre de la categoría.' },
            { role: 'user', content: categoryPrompt }
          ],
        }),
      });

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        const suggestedCategory = categoryData.choices[0]?.message?.content?.trim();
        if (suggestedCategory && Object.keys(MARKETPLACE_CATEGORIES).includes(suggestedCategory)) {
          marketplaceCategory = suggestedCategory;
        }
      }
    }

    console.log('Marketplace category assigned:', marketplaceCategory);

    // Step 3: Construir array de tags
    const tagsArray: string[] = [];
    if (artisanTags.materia_prima) tagsArray.push(artisanTags.materia_prima);
    if (artisanTags.oficio) tagsArray.push(artisanTags.oficio);
    if (artisanTags.tecnicas && Array.isArray(artisanTags.tecnicas)) {
      tagsArray.push(...artisanTags.tecnicas);
    }

    // Step 4: Generar embedding
    const embeddingText = `${name} ${description} ${marketplaceCategory} ${tagsArray.join(' ')}`;
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: embeddingText,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Lovable AI embedding error:', embeddingResponse.status, errorText);
      throw new Error(`AI embedding failed: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    console.log('Embedding generated, dimension:', embedding.length);

    // Step 5: Insertar producto en base de datos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: price || 0,
        image_url: image_url || null,
        store_name: store_name || null,
        category: marketplaceCategory,
        tags: tagsArray,
        embedding,
        stock: stock || 0,
        sku: sku || null,
        rating: 0,
        reviews_count: 0,
        is_new: true,
        free_shipping: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Product inserted successfully:', product.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        product,
        marketplace_category: marketplaceCategory,
        artisan_tags: tagsArray
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in categorize-product:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
