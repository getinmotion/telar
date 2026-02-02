import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ARTISAN_TAGS = {
  materias_primas: [
    'Madera', 'Guadua/Bambú/Chonta/Corozo', 'Frutos Secos y Semillas',
    'Fibras Naturales', 'Hilos y Filamentos', 'Telas', 'Arcilla', 'Cuero',
    'Vidrio', 'Piedras', 'Metales Preciosos', 'Metales No Preciosos',
    'Papel', 'Tamo', 'Mopa Mopa', 'Cacho/Hueso', 'Alambre',
    // Cosmética
    'Aceites Esenciales', 'Plantas Medicinales', 'Ceras Naturales',
    'Mantecas Vegetales', 'Arcillas Cosméticas', 'Extractos Botánicos'
  ],
  oficios: [
    'Carpintería y Ebanistería', 'Trabajos en Guadua/Bambú',
    'Trabajos en Frutos Secos', 'Cestería', 'Tejeduría',
    'Textiles No Tejidos', 'Trabajos en Tela', 'Cerámica', 'Alfarería',
    'Marroquinería', 'Talabartería', 'Guarnielería', 'Tafilería',
    'Trabajos en Vidrio', 'Trabajos en Piedra', 'Orfebrería/Platería',
    'Joyería', 'Bisutería', 'Forja', 'Metalistería', 'Trabajo en Papel',
    'Enchapado en Tamo', 'Barniz de Pasto', 'Enchapado',
    'Trabajo en Cacho/Hueso', 'Alambrismo',
    // Cosmética y cuidado personal
    'Cosmética Artesanal', 'Jabonería Artesanal', 'Herbología/Aromaterapia'
  ],
  tecnicas: [
    'Talla', 'Taracea', 'Torneado', 'Calado', 'Curvado', 'Labrado',
    'Ensamble', 'Laminado', 'Rollo', 'Radial', 'Entrecruzado',
    'Tejido de Punto', 'Tejido Plano', 'Redes', 'Anudados', 'Trenzado',
    'Crochet', 'Tejido de Calceta', 'Tejido de Ganchillo', 'Incrustación',
    'Cosido/Unión', 'Corte', 'Modelado', 'Bruñido', 'Pintura', 'Esmaltado',
    'Moldeado', 'Repujado', 'Estampado', 'Grabado', 'Calado', 'Soldadura',
    'Fundición', 'Teñido', 'Pulido', 'Plegado',
    // Cosmética
    'Saponificación en Frío', 'Maceración', 'Destilación', 'Infusión', 'Emulsificación'
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY no está configurado');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener productos sin tags
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, description')
      .or('tags.is.null,tags.eq.[]')
      .limit(100);

    if (fetchError) throw fetchError;

    console.log(`📦 Encontrados ${products.length} productos sin tags`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const product of products) {
      try {
        console.log(`🔄 Procesando: ${product.name}`);

        // Llamar a AI para detectar tags
        const aiPrompt = `Analiza este producto artesanal colombiano y clasifícalo según estas opciones:

**Producto:** ${product.name}
**Descripción:** ${product.description || 'Sin descripción'}

**MATERIAS PRIMAS (elige UNA):**
${ARTISAN_TAGS.materias_primas.join(', ')}

**OFICIOS (elige UNO):**
${ARTISAN_TAGS.oficios.join(', ')}

**TÉCNICAS (elige las que apliquen):**
${ARTISAN_TAGS.tecnicas.join(', ')}

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "materia_prima": "nombre exacto de UNA materia prima de la lista",
  "oficio": "nombre exacto de UN oficio de la lista",
  "tecnicas": ["técnica1", "técnica2"]
}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Eres un experto en artesanías colombianas. Responde SOLO con JSON válido.' },
              { role: 'user', content: aiPrompt }
            ],
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices[0].message.content;
        
        // Extraer JSON del contenido
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No se pudo extraer JSON de la respuesta AI');
        }

        const classification = JSON.parse(jsonMatch[0]);

        // Construir array de tags
        const tags = [
          classification.materia_prima,
          classification.oficio,
          ...(classification.tecnicas || [])
        ].filter(Boolean);

        if (tags.length === 0) {
          throw new Error('No se generaron tags');
        }

        // Actualizar producto
        const { error: updateError } = await supabase
          .from('products')
          .update({ tags })
          .eq('id', product.id);

        if (updateError) throw updateError;

        successCount++;
        results.push({
          id: product.id,
          name: product.name,
          tags,
          status: 'success'
        });

        console.log(`✅ ${product.name} → ${tags.join(', ')}`);

        // Pequeño delay para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        errorCount++;
        results.push({
          id: product.id,
          name: product.name,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Error en ${product.name}:`, error.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Procesados ${products.length} productos`,
        total: products.length,
        successful: successCount,
        failed: errorCount,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error general:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
