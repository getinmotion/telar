import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CategoryImageRequest {
  category: string;
}

const CATEGORY_PROMPTS: Record<string, string> = {
  "Joyería y Accesorios": "Ultra high resolution professional product photography of authentic Colombian artisan jewelry: wayuu beaded necklace with vibrant geometric patterns, silver filigree earrings, natural stone bracelets, handcrafted rings. Styled on natural wood background with soft natural lighting. Aspect ratio 3:2.",
  "Decoración del Hogar": "Ultra high resolution professional product photography of authentic Colombian home decor: handwoven wall tapestry, colorful ceramic vases from Ráquira, hand-carved wooden sculptures, artisan pottery. Styled in modern minimalist interior with natural lighting. Aspect ratio 3:2.",
  "Textiles y Moda": "Ultra high resolution professional product photography of authentic Colombian textiles: colorful wayuu mochila bag, hand-woven ruana with geometric patterns, traditional poncho, artisan textile with indigenous designs. Styled on neutral background with soft lighting. Aspect ratio 3:2.",
  "Bolsos y Carteras": "Ultra high resolution professional product photography of authentic Colombian artisan bags: wayuu mochila, handcrafted leather bag, fique tote bag, woven morral. Styled on natural background with soft natural lighting. Aspect ratio 3:2.",
  "Vajillas y Cocina": "Ultra high resolution professional product photography of authentic Colombian kitchen ceramics: hand-painted ceramic plates, traditional clay pottery, wooden utensils, artisan bowls. Styled on rustic wooden table with natural lighting. Aspect ratio 3:2.",
  "Muebles": "Ultra high resolution professional product photography of authentic Colombian artisan furniture: hand-carved wooden chair, traditional wooden table, artisan carpentry piece with intricate details. Styled in minimalist interior with natural lighting. Aspect ratio 3:2.",
  "Arte y Esculturas": "Ultra high resolution professional product photography of authentic Colombian artisan sculptures: hand-carved wooden figure, stone sculpture, metal art piece, traditional artisan craft. Styled on neutral background with dramatic natural lighting. Aspect ratio 3:2."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category }: CategoryImageRequest = await req.json();
    
    if (!category || !CATEGORY_PROMPTS[category]) {
      return new Response(
        JSON.stringify({ error: 'Invalid category' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = CATEGORY_PROMPTS[category];
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image returned from AI');
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-category-images function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
