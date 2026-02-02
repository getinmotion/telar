import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Telar.ia credentials from environment
const TELAR_SUPABASE_URL = 'https://ylooqmqmoufqtxvetxuj.supabase.co';
const TELAR_SERVICE_KEY = Deno.env.get('TELAR_SERVICE_ROLE_KEY');
if (!TELAR_SERVICE_KEY) {
  throw new Error('TELAR_SERVICE_ROLE_KEY not configured');
}

// Artisan tags system (telar.ia backend metadata)
const ARTISAN_TAGS = {
  materias_primas: [
    "Cerámica", "Arcilla", "Barro", "Porcelana",
    "Madera", "Bambú", "Guadua",
    "Textil", "Algodón", "Lana", "Fique", "Cabuya", "Seda",
    "Cuero", "Piel",
    "Metal", "Plata", "Oro", "Cobre", "Bronce", "Hierro",
    "Vidrio", "Cristal",
    "Piedra", "Mármol", "Granito",
    "Semillas", "Tagua", "Totumo",
    "Papel", "Cartón"
  ],
  oficios: [
    "Alfarería", "Cerámica", "Tejeduría", "Tejido", "Bordado",
    "Talabartería", "Marroquinería", "Carpintería", "Ebanistería",
    "Orfebrería", "Joyería", "Filigrana", "Cestería", "Soplado de Vidrio",
    "Escultura", "Talla", "Pintura", "Serigrafía", "Trabajo en Piedra"
  ],
  tecnicas: [
    "Telar Vertical", "Telar Horizontal", "Telar de Cintura",
    "Punto de Cruz", "Bordado a Mano", "Crochet", "Macramé",
    "Repujado", "Pirograbado", "Incrustación", "Esmaltado",
    "Policromado", "Vidriado", "Enchapado", "Forjado", "Fundido"
  ]
};

// Marketplace categories (buyer-centric frontend navigation)
const MARKETPLACE_CATEGORIES = [
  { name: "Joyería y Accesorios", keywords: ["joyería", "collar", "aretes", "pulsera", "anillo", "bisutería", "accesorio"] },
  { name: "Decoración del Hogar", keywords: ["decoración", "hogar", "escultura", "cuadro", "jarrón", "tapiz", "adorno"] },
  { name: "Textiles y Moda", keywords: ["textil", "tejido", "ropa", "bufanda", "ruana", "mantel", "cojín", "hamaca"] },
  { name: "Bolsos y Carteras", keywords: ["bolso", "cartera", "mochila", "morral", "canasta", "estuche", "monedero"] },
  { name: "Vajillas y Cocina", keywords: ["vajilla", "cocina", "plato", "taza", "bowl", "bandeja", "cubierto", "utensilio"] },
  { name: "Muebles", keywords: ["mueble", "mesa", "silla", "estantería", "baúl", "mobiliario"] },
  { name: "Arte y Esculturas", keywords: ["arte", "escultura", "figura", "artístico"] },
  { name: "Iluminación", keywords: ["lámpara", "iluminación", "luz", "vela", "candelabro"] }
];

// Map oficios to marketplace categories
const OFICIO_TO_CATEGORY: Record<string, string> = {
  "Orfebrería": "Joyería y Accesorios",
  "Joyería": "Joyería y Accesorios",
  "Filigrana": "Joyería y Accesorios",
  "Tejeduría": "Textiles y Moda",
  "Tejido": "Textiles y Moda",
  "Bordado": "Textiles y Moda",
  "Talabartería": "Bolsos y Carteras",
  "Marroquinería": "Bolsos y Carteras",
  "Cestería": "Bolsos y Carteras",
  "Alfarería": "Vajillas y Cocina",
  "Cerámica": "Vajillas y Cocina",
  "Carpintería": "Muebles",
  "Ebanistería": "Muebles",
  "Escultura": "Arte y Esculturas",
  "Talla": "Arte y Esculturas",
  "Pintura": "Arte y Esculturas",
  "Soplado de Vidrio": "Iluminación"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const TELAR_KEY = Deno.env.get('TELAR_SERVICE_ROLE_KEY');
    if (!TELAR_KEY) {
      throw new Error('TELAR_SERVICE_ROLE_KEY not configured');
    }

    // Connect to telar.ia database
    const supabase = createClient(TELAR_SUPABASE_URL, TELAR_KEY);

    console.log('Fetching products from telar.ia...');

    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(100); // Process in batches

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${products?.length || 0} products to categorize`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const product of products || []) {
      try {
        console.log(`Processing: ${product.name}`);

        const productText = `${product.name} ${product.description || ''}`;

        // Step 1: Detect materia_prima (raw material)
        const materiaPrimaPrompt = `Analiza este producto artesanal y detecta la materia prima principal.

Producto: ${productText}

Materias primas disponibles: ${ARTISAN_TAGS.materias_primas.join(', ')}

Responde SOLO con el nombre exacto de UNA materia prima de la lista (ej: "Cerámica", "Madera", "Plata", etc).`;

        const materiaPrimaResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Eres un experto en artesanías colombianas. Responde con una sola palabra: la materia prima.' },
              { role: 'user', content: materiaPrimaPrompt }
            ],
          }),
        });

        if (!materiaPrimaResponse.ok) throw new Error(`AI failed: ${materiaPrimaResponse.status}`);
        const materiaPrimaData = await materiaPrimaResponse.json();
        const materiaPrima = materiaPrimaData.choices[0]?.message?.content?.trim() || null;

        // Step 2: Detect oficio (craft/trade)
        const oficioPrompt = `Analiza este producto artesanal y detecta el oficio artesanal principal.

Producto: ${productText}

Oficios disponibles: ${ARTISAN_TAGS.oficios.join(', ')}

Responde SOLO con el nombre exacto de UN oficio de la lista (ej: "Tejeduría", "Orfebrería", "Cerámica", etc).`;

        const oficioResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Eres un experto en artesanías colombianas. Responde con una sola palabra: el oficio.' },
              { role: 'user', content: oficioPrompt }
            ],
          }),
        });

        if (!oficioResponse.ok) throw new Error(`AI failed: ${oficioResponse.status}`);
        const oficioData = await oficioResponse.json();
        const oficio = oficioData.choices[0]?.message?.content?.trim() || null;

        // Step 3: Detect técnicas (specific techniques) - can be multiple
        const tecnicasPrompt = `Analiza este producto artesanal y detecta las técnicas artesanales utilizadas.

Producto: ${productText}

Técnicas disponibles: ${ARTISAN_TAGS.tecnicas.join(', ')}

Responde SOLO con los nombres exactos de las técnicas separados por comas (máximo 3). Si no aplica ninguna, responde "Ninguna".`;

        const tecnicasResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Eres un experto en artesanías colombianas. Responde con técnicas separadas por comas.' },
              { role: 'user', content: tecnicasPrompt }
            ],
          }),
        });

        if (!tecnicasResponse.ok) throw new Error(`AI failed: ${tecnicasResponse.status}`);
        const tecnicasData = await tecnicasResponse.json();
        const tecnicasStr = tecnicasData.choices[0]?.message?.content?.trim() || '';
        const tecnicas = tecnicasStr === 'Ninguna' ? [] : tecnicasStr.split(',').map((t: string) => t.trim()).filter(Boolean);

        // Step 4: Map oficio to marketplace category
        let marketplaceCategory = oficio ? OFICIO_TO_CATEGORY[oficio] : null;

        // Fallback: Use AI to detect marketplace category by keywords if no direct mapping
        if (!marketplaceCategory) {
          const categoryPrompt = `Analiza este producto y asigna la categoría de marketplace más apropiada.

Producto: ${productText}

Categorías disponibles:
${MARKETPLACE_CATEGORIES.map(c => `- ${c.name}: ${c.keywords.join(', ')}`).join('\n')}

Responde SOLO con el nombre exacto de la categoría (ej: "Joyería y Accesorios", "Textiles y Moda", etc).`;

          const categoryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'Eres un experto en clasificación de productos. Responde con una sola frase: el nombre de la categoría.' },
                { role: 'user', content: categoryPrompt }
              ],
            }),
          });

          if (!categoryResponse.ok) throw new Error(`AI failed: ${categoryResponse.status}`);
          const categoryData = await categoryResponse.json();
          marketplaceCategory = categoryData.choices[0]?.message?.content?.trim() || 'Decoración del Hogar';
        }

        // Step 5: Build tags array (artisan metadata)
        const tags = [materiaPrima, oficio, ...tecnicas].filter(Boolean);

        // Step 6: Update product in telar.ia database (sin embeddings por ahora)
        const { error: updateError } = await supabase
          .from('products')
          .update({
            category: marketplaceCategory,
            tags: tags,
          })
          .eq('id', product.id);

        if (updateError) throw updateError;

        successCount++;
        results.push({
          id: product.id,
          name: product.name,
          category: marketplaceCategory,
          tags: tags,
          status: 'success'
        });

        console.log(`✓ ${product.name} → ${marketplaceCategory} | Tags: ${tags.join(', ')}`);

      } catch (error) {
        errorCount++;
        console.error(`✗ Error processing ${product.name}:`, error);
        results.push({
          id: product.id,
          name: product.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`\nCompleted: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        total: products?.length || 0,
        successCount,
        errorCount,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in recategorize-products:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
