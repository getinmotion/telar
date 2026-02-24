import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { analyzeProfileForConversation, processConversationStep } from './conversational-functions.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { userId, language = 'es', action, userResponse, currentQuestion, conversationHistory, shopData } = requestBody;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Create Intelligent Shop - Action: ${action}, User: ${userId}`);

    if (action === 'preconfigurate') {
      return await preconfigureShop(supabase, userId, language);
    }

    if (action === 'generate_product_suggestions') {
      return await generateProductSuggestions(supabase, userId, language);
    }

    if (action === 'analyze_profile') {
      return await analyzeProfileForConversation(supabase, userId, language);
    }

    if (action === 'process_conversation') {
      return await processConversationStep(supabase, userId, language, userResponse, currentQuestion, conversationHistory, shopData);
    }

    throw new Error('Invalid action');

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error in create-intelligent-shop function:', error);
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      requestBody: JSON.stringify(requestBody || {})
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      shopData: getDefaultShopData(),
      coordinatorMessage: requestBody?.language === 'es' 
        ? '⚠️ Hubo un problema al analizar tu perfil, pero puedes llenar la información manualmente.' 
        : '⚠️ There was an issue analyzing your profile, but you can fill the information manually.'
    }), {
      status: 200, // Return 200 with fallback data instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function preconfigureShop(supabase: any, userId: string, language: string) {
  // Fetch user data
  const [profileResult, contextResult, maturityResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('user_master_context').select('*').eq('user_id', userId).single(),
    supabase.from('user_maturity_scores').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
  ]);

  const profile = profileResult.data;
  const masterContext = contextResult.data;
  const maturityScores = maturityResult.data;

  // Extract information for AI analysis
  const userContext = {
    businessDescription: profile?.business_description || '',
    brandName: profile?.brand_name || '',
    businessLocation: profile?.business_location || '',
    businessGoals: profile?.business_goals || [],
    socialMediaPresence: profile?.social_media_presence || {},
    businessProfile: masterContext?.business_profile || {},
    maturityLevel: calculateOverallMaturity(maturityScores),
    language: language
  };

  // Generate AI suggestions if OpenAI is available
  let aiSuggestions = null;
  if (openAIApiKey) {
    try {
      console.log('Generating AI suggestions for user context:', { businessDescription: userContext.businessDescription, craftType: userContext.businessProfile?.craft_type });
      aiSuggestions = await generateShopSuggestions(userContext, language);
      console.log('AI suggestions generated successfully:', aiSuggestions ? 'Yes' : 'No');
    } catch (error) {
      console.error('AI generation failed:', error);
      console.error('Falling back to manual shop data generation');
    }
  } else {
    console.log('OpenAI API key not available, using fallback data');
  }

  // Prepare shop data (AI-enhanced or fallback)
  const shopData = aiSuggestions?.shopData || generateFallbackShopData(profile, masterContext);
  const coordinatorMessage = aiSuggestions?.coordinatorMessage || generateFallbackMessage(language);

  return new Response(JSON.stringify({
    shopData,
    coordinatorMessage,
    userContext: {
      hasExistingData: !!(profile?.business_description || profile?.brand_name),
      detectedCraft: detectCraftType(profile, masterContext),
      maturityLevel: calculateOverallMaturity(maturityScores)
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateProductSuggestions(supabase: any, userId: string, language: string) {
  // Fetch user context and existing shop
  const [shopResult, contextResult] = await Promise.all([
    supabase.from('artisan_shops').select('*').eq('user_id', userId).single(),
    supabase.from('user_master_context').select('*').eq('user_id', userId).single()
  ]);

  const shop = shopResult.data;
  const context = contextResult.data;

  if (!shop) {
    throw new Error('Shop not found');
  }

  const productSuggestions = await generateAIProductSuggestions(shop, context, language);

  return new Response(JSON.stringify({
    productSuggestions,
    shopContext: {
      craftType: shop.craft_type,
      region: shop.region,
      description: shop.description
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateShopSuggestions(userContext: any, language: string) {
  const prompt = language === 'es' ? `
Eres un experto en comercio electrónico y marketing para artesanos colombianos. Analiza el siguiente perfil de usuario y genera sugerencias inteligentes para crear su tienda digital.

Información del usuario:
- Descripción del negocio: ${userContext.businessDescription}
- Nombre de marca: ${userContext.brandName}
- Ubicación: ${userContext.businessLocation}
- Objetivos: ${JSON.stringify(userContext.businessGoals)}
- Redes sociales: ${JSON.stringify(userContext.socialMediaPresence)}
- Nivel de madurez del negocio: ${userContext.maturityLevel}/100

Genera:
1. Un nombre optimizado para la tienda (máximo 40 caracteres)
2. Una descripción atractiva (60-120 caracteres)
3. Una historia compelling del artesano (200-300 palabras)
4. Un mensaje motivacional del Coordinador Maestro (conversacional, como si fuera un asistente IA)

Responde solo en JSON con esta estructura:
{
  "shopData": {
    "shop_name": "nombre de la tienda",
    "description": "descripción corta y atractiva",
    "story": "historia del artesano y su arte",
    "craft_type": "tipo de artesanía detectado",
    "region": "región extraída de la ubicación"
  },
  "coordinatorMessage": "mensaje personalizado del coordinador maestro"
}
` : `
You are an expert in e-commerce and marketing for Colombian artisans. Analyze the following user profile and generate intelligent suggestions for creating their digital shop.

User information:
- Business description: ${userContext.businessDescription}
- Brand name: ${userContext.brandName}
- Location: ${userContext.businessLocation}
- Goals: ${JSON.stringify(userContext.businessGoals)}
- Social media: ${JSON.stringify(userContext.socialMediaPresence)}
- Business maturity level: ${userContext.maturityLevel}/100

Generate:
1. An optimized shop name (max 40 characters)
2. An attractive description (60-120 characters)
3. A compelling artisan story (200-300 words)
4. A motivational message from the Master Coordinator (conversational, as if it were an AI assistant)

Respond only in JSON with this structure:
{
  "shopData": {
    "shop_name": "shop name",
    "description": "short and attractive description",
    "story": "artisan and craft story",
    "craft_type": "detected craft type",
    "region": "region extracted from location"
  },
  "coordinatorMessage": "personalized master coordinator message"
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: language === 'es' 
            ? 'Eres un experto en crear tiendas digitales para artesanos. Generas contenido optimizado y culturalmente apropiado para Colombia.'
            : 'You are an expert in creating digital shops for artisans. You generate optimized and culturally appropriate content for Colombia.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return result;
}

async function generateAIProductSuggestions(shop: any, context: any, language: string) {
  if (!openAIApiKey) {
    return getDefaultProductSuggestions(shop.craft_type, language);
  }

  const prompt = language === 'es' ? `
Eres un experto en productos artesanales colombianos. Basándote en esta información de tienda, sugiere 5 productos específicos que podría vender:

Tienda: ${shop.shop_name}
Tipo de artesanía: ${shop.craft_type}
Región: ${shop.region}
Descripción: ${shop.description}

Para cada producto sugiere:
1. Nombre atractivo
2. Descripción optimizada para SEO (80-120 palabras)
3. Precio sugerido en COP
4. Categoría
5. Tags relevantes

Responde en JSON:
{
  "products": [
    {
      "name": "nombre del producto",
      "description": "descripción detallada",
      "suggested_price": 50000,
      "category": "categoría",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}
` : `
You are an expert in Colombian artisan products. Based on this shop information, suggest 5 specific products they could sell:

Shop: ${shop.shop_name}
Craft type: ${shop.craft_type}
Region: ${shop.region}
Description: ${shop.description}

For each product suggest:
1. Attractive name
2. SEO-optimized description (80-120 words)
3. Suggested price in COP
4. Category
5. Relevant tags

Respond in JSON:
{
  "products": [
    {
      "name": "product name",
      "description": "detailed description",
      "suggested_price": 50000,
      "category": "category",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert in artisan product marketing and e-commerce.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function generateFallbackShopData(profile: any, masterContext: any) {
  const businessProfile = masterContext?.business_profile || {};
  const socialMedia = profile?.social_media_presence || {};

  return {
    shop_name: profile?.brand_name || profile?.business_description?.split(' ').slice(0, 3).join(' ') || 'Mi Tienda Artesanal',
    description: profile?.business_description || 'Productos artesanales únicos hechos con amor',
    story: businessProfile.story || 'Nuestra tradición artesanal se transmite de generación en generación, creando piezas únicas que reflejan la riqueza cultural de Colombia.',
    craft_type: detectCraftType(profile, masterContext) || 'other',
    region: profile?.business_location || '',
    contact_info: {
      phone: businessProfile.phone || '',
      email: profile?.email || '',
      whatsapp: businessProfile.whatsapp || '',
    },
    social_links: {
      instagram: socialMedia.instagram || '',
      facebook: socialMedia.facebook || '',
      website: socialMedia.website || '',
    },
  };
}

function getDefaultShopData() {
  return {
    shop_name: 'Mi Tienda Artesanal',
    description: 'Productos artesanales únicos hechos con amor',
    story: 'Nuestra tradición artesanal se transmite de generación en generación.',
    craft_type: 'other',
    region: '',
    contact_info: { phone: '', email: '', whatsapp: '' },
    social_links: { instagram: '', facebook: '', website: '' },
  };
}

function generateFallbackMessage(language: string) {
  return language === 'es'
    ? '📋 He precargado tu tienda con la información disponible en tu perfil. ¡Revisa y ajusta lo que necesites!'
    : '📋 I have preloaded your shop with available information from your profile. Review and adjust as needed!';
}

function detectCraftType(profile: any, masterContext: any): string {
  const textToAnalyze = [
    profile?.business_description || '',
    profile?.brand_name || '',
    masterContext?.business_profile?.description || ''
  ].join(' ').toLowerCase();

  const craftMappings: Record<string, string> = {
    'tejido': 'textiles', 'textil': 'textiles', 'bordado': 'textiles',
    'cerámica': 'ceramics', 'alfarería': 'ceramics', 'barro': 'ceramics',
    'joyería': 'jewelry', 'orfebrería': 'jewelry',
    'cuero': 'leather', 'marroquinería': 'leather',
    'madera': 'woodwork', 'carpintería': 'woodwork',
    'metal': 'metalwork', 'forja': 'metalwork',
    'vidrio': 'glasswork', 'vitral': 'glasswork',
    'pintura': 'painting', 'arte': 'painting',
    'escultura': 'sculpture'
  };

  for (const [keyword, craftType] of Object.entries(craftMappings)) {
    if (textToAnalyze.includes(keyword)) {
      return craftType;
    }
  }

  return 'other';
}

function calculateOverallMaturity(maturityScores: any): number {
  if (!maturityScores) return 25;
  
  const { idea_validation, user_experience, market_fit, monetization } = maturityScores;
  return Math.round((idea_validation + user_experience + market_fit + monetization) / 4);
}

function getDefaultProductSuggestions(craftType: string, language: string) {
  const suggestions: Record<string, any> = {
    textiles: {
      es: [
        { name: 'Ruana Tradicional', description: 'Ruana tejida a mano con lana virgen, perfecta para el clima frío. Diseño tradicional colombiano.', suggested_price: 120000, category: 'Textiles', tags: ['ruana', 'lana', 'tradicional'] }
      ]
    }
  };

  return suggestions[craftType]?.[language] || suggestions.textiles.es;
}