import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      shopName, 
      craftType, 
      region = '',
      brandClaim = ''
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const claimContext = brandClaim 
      ? `El claim de marca es: "${brandClaim}". ` 
      : '';
    const regionContext = region 
      ? `La tienda está ubicada en ${region}. ` 
      : '';

    const prompt = `Genera textos profesionales y acogedores para la página de contacto de "${shopName}", una tienda de ${craftType}. ${regionContext}${claimContext}
    
    Los textos deben ser cálidos, invitar a la comunicación y reflejar la personalidad artesanal de la marca.
    
    Responde SOLO con un JSON válido en este formato exacto:
    {
      "welcomeMessage": "mensaje de bienvenida cálido y personal (80-120 palabras, invitando al cliente a contactar)",
      "formIntroText": "texto breve antes del formulario de contacto (40-60 palabras, explicando qué tipo de consultas pueden hacer)",
      "suggestedHours": "horario de atención sugerido apropiado para este tipo de negocio artesanal (ej: 'Lun-Vie 9:00-18:00, Sáb 10:00-14:00')",
      "contactPageTitle": "título atractivo para la página de contacto (ej: 'Conecta con Nosotros', 'Hablemos', 'Estamos Aquí para Ti')"
    }`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: prompt
        }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    console.log(`Generated contact content for ${shopName}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-shop-contact:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      welcomeMessage: '',
      formIntroText: '',
      suggestedHours: 'Lun-Vie 9:00-18:00',
      contactPageTitle: 'Contáctanos'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
