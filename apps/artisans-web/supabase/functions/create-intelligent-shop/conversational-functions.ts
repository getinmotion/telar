// Conversational shop creation functions for Master Coordinator

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// NEW: Refine user input with AI before saving to database
async function refineUserInput(rawText: string, fieldType: 'description' | 'name' | 'region', language: string): Promise<string> {
  if (!openAIApiKey) {
    console.log('No OpenAI key, returning raw text');
    return rawText.trim();
  }
  
  const prompts = {
    description: language === 'es' ? `
Corrige el siguiente texto que describe productos artesanales:
"${rawText}"

INSTRUCCIONES CRÍTICAS:
1. Corrige TODOS los errores ortográficos (ej: "prodcuto" → "producto", "que gao" → "que hago", "estoyn" → "estoy")
2. Corrige errores gramaticales y puntuación
3. Mejora la redacción manteniendo el mensaje original
4. Mantén en primera persona si el usuario la usó
5. NO añadas información que no esté en el texto original
6. Responde SOLO con el texto corregido, sin explicaciones ni comillas
` : `
Correct the following text describing artisan products:
"${rawText}"

CRITICAL INSTRUCTIONS:
1. Correct ALL spelling errors
2. Fix grammar and punctuation
3. Improve readability while maintaining original message
4. Keep first person if user used it
5. DO NOT add information not in original text
6. Respond ONLY with the corrected text, no explanations or quotes
`,
    name: language === 'es' 
      ? `Corrige errores ortográficos y gramaticales en este nombre de negocio y devuelve SOLO el nombre corregido sin comillas ni explicaciones: "${rawText}"`
      : `Fix spelling and grammar in this business name and return ONLY the corrected name without quotes or explanations: "${rawText}"`,
    region: language === 'es'
      ? `Corrige errores ortográficos en esta ubicación y devuelve SOLO la ubicación corregida sin comillas ni explicaciones: "${rawText}"`
      : `Fix spelling in this location and return ONLY the corrected location without quotes or explanations: "${rawText}"`
  };
  
  try {
    console.log(`Refining ${fieldType} with AI:`, rawText);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un editor experto que corrige textos manteniendo su esencia. Responde SOLO con el texto corregido.' },
          { role: 'user', content: prompts[fieldType] }
        ],
        max_tokens: 200,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error('OpenAI refine error:', response.status);
      return rawText.trim();
    }

    const data = await response.json();
    const refined = data.choices[0].message.content.trim();
    console.log(`Refined ${fieldType}:`, refined);
    return refined;
  } catch (error) {
    console.error('Error refining user input:', error);
    return rawText.trim();
  }
}

// ENHANCED: Detect vague responses that need clarification - FOCUSED ON E-COMMERCE
function isVagueResponse(response: string): boolean {
  const vaguePhrases = [
    // CRITICAL: Profile data issues
    'el mismo que yo tenía', 'la misma que ya tenía', 'la misma que yo tenía',
    'el mismo que ya tenía', 'como ya tenía', 'lo que ya tenía',
    'el mismo que', 'la misma que', 'como antes', 'igual que antes',
    'lo mismo', 'como siempre', 'como ya dije', 'ya lo mencioné',
    
    // Generic non-specific responses
    'pues', 'eh', 'este', 'bueno', 'si', 'sí', 'ok', 'vale', 'no sé',
    'normal', 'básico', 'común', 'típico', 'tradicional', 'regular',
    'cualquier cosa', 'lo que sea', 'no importa', 'da igual',
    
    // Non-product responses for e-commerce
    'cositas', 'cositas lindas', 'cosas bonitas', 'artesanías', 'manualidades'
  ];
  
  const normalizedResponse = response.toLowerCase().trim();
  
  // Check if response is too short (less than 4 words for products)
  if (normalizedResponse.split(' ').length < 4) return true;
  
  // Check for vague phrases
  return vaguePhrases.some(phrase => normalizedResponse.includes(phrase));
}

// Generate intelligent contextual questions using OpenAI
async function generateIntelligentQuestion(userResponse: string, currentQuestion: string, conversationHistory: any[], userProfile: any, language: string): Promise<string> {
  if (!openAIApiKey) {
    return getDefaultContextualQuestion(currentQuestion, language);
  }

const prompt = language === 'es' ? `
Eres el Coordinador Maestro, un asistente IA especializado en crear TIENDAS ONLINE para artesanos colombianos que quieren VENDER PRODUCTOS.

CONTEXT DEL USUARIO:
- Pregunta actual: ${currentQuestion}
- Respuesta del usuario: "${userResponse}"
- Historial de conversación: ${JSON.stringify(conversationHistory.slice(-3))}
- Perfil disponible: ${JSON.stringify(userProfile)}

SITUACIÓN CRÍTICA: La respuesta "${userResponse}" es vaga e inútil para crear una tienda de productos.

TU MISIÓN ESPECÍFICA: Generar una pregunta que RECHACE la respuesta vaga y EXIJA información específica sobre PRODUCTOS PARA VENDER:

EJEMPLOS CRÍTICOS:
- Si dice "El mismo que yo tenía" → "No puedo usar esa información para crear tu tienda online. Necesito saber exactamente QUÉ PRODUCTOS vas a vender. Por ejemplo: ¿bolsos de cuero, collares, cerámicas, canastas tejidas? Dime los productos específicos que tienes listos para vender."

- Si dice "Cositas lindas" → "Para crear tu tienda necesito productos específicos, no descripciones generales. ¿Qué productos artesanales concretos vendes? Por ejemplo: aretes de plata, libretas encuadernadas, macetas de barro, bolsos tejidos?"

- Si dice "Artesanías" → "¿Qué tipo exacto de artesanías? Necesito productos específicos para configurar tu tienda. Por ejemplo: ¿trabajas joyería en plata, tejidos en lana, cerámica decorativa, productos en cuero?"

ENFOQUE: PRODUCTOS ESPECÍFICOS PARA VENDER ONLINE, no conceptos generales.

Responde SOLO con la pregunta, sin explicaciones adicionales.
` : `
You are the Master Coordinator, an AI assistant specialized in creating digital shops for Colombian artisans.

USER CONTEXT:
- Current question: ${currentQuestion}  
- User response: "${userResponse}"
- Conversation history: ${JSON.stringify(conversationHistory.slice(-3))}
- Available profile: ${JSON.stringify(userProfile)}

SITUATION: The user's response "${userResponse}" is vague or insufficient.

YOUR MISSION: Generate an intelligent, specific and conversational question that:
1. Detects what concrete information you need
2. Is friendly and natural, not robotic
3. Includes relevant examples for Colombian artisans
4. Helps the user give a more specific response

Respond ONLY with the question, no additional explanations.
`;

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
          { role: 'system', content: 'You are an expert conversational AI that generates intelligent, specific questions to clarify vague responses.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating intelligent question:', error);
    return getDefaultContextualQuestion(currentQuestion, language);
  }
}

// ENHANCED: E-commerce focused contextual questions
function getDefaultContextualQuestion(currentQuestion: string, language: string): string {
  const questions = {
    es: {
      business_name: 'Para crear tu tienda online necesito el nombre exacto de tu marca. ¿Cómo se llama tu negocio? Por ejemplo: "Tejidos Luna", "Cerámica Dorada", "Cueros del Valle".',
      business_products: 'Necesito saber QUÉ PRODUCTOS ESPECÍFICOS vas a vender online. No me digas "artesanías" o "cositas". ¿Vendes collares, bolsos, macetas, libretas, aretes? Dime los productos exactos que tienes para vender.',
      business_description: 'Para configurar tu tienda necesito productos específicos. ¿QUÉ vendes exactamente? Por ejemplo: ¿collares de semillas, bolsos de cuero, canastas tejidas, cerámicas decorativas?',
      business_location: 'Para configurar envíos necesito tu ubicación exacta. ¿En qué ciudad estás? Por ejemplo: Bogotá, Medellín, Cartagena, Bucaramanga.',
      product_prices: '¿Cuáles son los precios promedio de tus productos? Por ejemplo: collares $25.000, bolsos $80.000, cerámicas $15.000.',
      product_photos: '¿Tienes fotos de tus productos listos para subir a la tienda? Es esencial para empezar a vender online.'
    },
    en: {
      business_name: 'To create your online store I need your exact brand name. What is your business called? For example: "Luna Textiles", "Golden Ceramics", "Valley Leathers".',
      business_products: 'I need to know WHAT SPECIFIC PRODUCTS you will sell online. Don\'t tell me "crafts" or "things". Do you sell necklaces, bags, pots, notebooks, earrings? Tell me the exact products you have to sell.',
      business_description: 'To configure your store I need specific products. What exactly do you sell? For example: seed necklaces, leather bags, woven baskets, decorative ceramics?',
      business_location: 'To configure shipping I need your exact location. What city are you in? For example: Bogotá, Medellín, Cartagena, Bucaramanga.',
      product_prices: 'What are the average prices of your products? For example: necklaces $25,000, bags $80,000, ceramics $15,000.',
      product_photos: 'Do you have photos of your products ready to upload to the store? It\'s essential to start selling online.'
    }
  };

  return questions[language as keyof typeof questions]?.[currentQuestion as keyof typeof questions.es] || 
         'Could you provide more specific details about that?';
}

export async function analyzeProfileForConversation(supabase: any, userId: string, language: string) {
  // Fetch comprehensive user data
  const [profileResult, contextResult, maturityResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('user_master_context').select('*').eq('user_id', userId).single(),
    supabase.from('user_maturity_scores').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
  ]);

  const profile = profileResult.data;
  const masterContext = contextResult.data;
  const maturityScores = maturityResult.data;

  // Analyze what information is missing for shop creation - WITH VAGUE DETECTION
  const missingInfo = [];
  const requiredFields = {
    shop_name: profile?.brand_name || profile?.business_description?.split(' ').slice(0, 3).join(' '),
    description: profile?.business_description,
    craft_type: detectCraftType(profile, masterContext),
    region: profile?.business_location,
    phone: masterContext?.business_profile?.phone,
    email: profile?.email
  };

  // CRITICAL: Enhanced vague data detection for e-commerce
  const hasVagueData = Object.entries(requiredFields).some(([key, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      return isVagueResponse(value);
    }
    return false;
  });

  Object.entries(requiredFields).forEach(([key, value]) => {
    if (!value || value === 'other' || (typeof value === 'string' && isVagueResponse(value))) {
      missingInfo.push(key);
    }
  });

  // ENHANCED: Strict validation for e-commerce readiness
  const hasSpecificProducts = requiredFields.description && !isVagueResponse(requiredFields.description || '');
  const hasValidName = requiredFields.shop_name && !isVagueResponse(requiredFields.shop_name || '');
  const hasMinimumInfo = hasValidName && hasSpecificProducts && requiredFields.craft_type && !hasVagueData;
  
  // FORCE conversation if ANY vague data detected
  const needsMoreInfo = missingInfo.length > 0 || !hasMinimumInfo || hasVagueData;

  let coordinatorMessage;
  let nextQuestion;

  if (!needsMoreInfo) {
    // Can create automatically ONLY if we have SPECIFIC product info
    coordinatorMessage = language === 'es' 
      ? `¡Perfecto! Tienes información específica sobre tus productos. Voy a crear tu tienda online "${requiredFields.shop_name}" lista para vender. La IA está configurando todo automáticamente.`
      : `Perfect! You have specific information about your products. I'll create your online shop "${requiredFields.shop_name}" ready to sell. AI is configuring everything automatically.`;
  } else {
    // ENHANCED: E-commerce focused conversation flow
    if (!requiredFields.shop_name || isVagueResponse(requiredFields.shop_name || '')) {
      coordinatorMessage = language === 'es'
        ? '¡Hola! 👋 Soy tu Coordinador Maestro IA. Voy a crear tu tienda online para que puedas vender tus productos artesanales. Para empezar necesito el nombre exacto de tu marca o negocio. ¿Cómo se llama?'
        : 'Hello! 👋 I\'m your Master AI Coordinator. I\'ll create your online shop so you can sell your artisan products. To start I need the exact name of your brand or business. What is it called?';
      nextQuestion = 'business_name';
    } else if (!requiredFields.description || isVagueResponse(requiredFields.description || '')) {
      coordinatorMessage = language === 'es'
        ? `Perfecto, "${requiredFields.shop_name}" será tu tienda online. Ahora necesito saber QUÉ PRODUCTOS ESPECÍFICOS vas a vender. No me digas "artesanías" genéricamente. ¿Vendes collares, bolsos, cerámicas, tejidos? Dime los productos exactos que tienes listos para vender.`
        : `Perfect, "${requiredFields.shop_name}" will be your online shop. Now I need to know WHAT SPECIFIC PRODUCTS you will sell. Don't tell me "crafts" generically. Do you sell necklaces, bags, ceramics, textiles? Tell me the exact products you have ready to sell.`;
      nextQuestion = 'business_products';
    } else {
      coordinatorMessage = language === 'es'
        ? `Excelente, ya sé qué productos vendes. Para configurar envíos y pagos locales, ¿en qué ciudad exacta estás ubicado? Esto es importante para que tus clientes puedan encontrarte y recibir sus productos.`
        : `Excellent, I know what products you sell. To configure shipping and local payments, what exact city are you located in? This is important so your customers can find you and receive their products.`;
      nextQuestion = 'business_location';
    }
  }

  return new Response(JSON.stringify({
    needsMoreInfo,
    coordinatorMessage,
    nextQuestion,
    missingInfo,
    userContext: {
      hasExistingData: !!(profile?.business_description || profile?.brand_name),
      detectedCraft: detectCraftType(profile, masterContext),
      maturityLevel: calculateOverallMaturity(maturityScores)
    },
    shopData: needsMoreInfo ? {} : generateFallbackShopData(profile, masterContext)
  }), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
  });
}

export async function processConversationStep(supabase: any, userId: string, language: string, userResponse: string, currentQuestion: string, conversationHistory: any[], shopData: any) {
  let updatedShopData = { ...shopData };
  let nextQuestion;
  let message;
  let readyToCreate = false;

  console.log('Processing conversation step:', { currentQuestion, userResponse, isVague: isVagueResponse(userResponse) });

  // INTELLIGENT VAGUE RESPONSE DETECTION
  if (isVagueResponse(userResponse)) {
    console.log('Detected vague response, generating intelligent question');
    
    // Get user profile for context
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
    
    message = await generateIntelligentQuestion(
      userResponse, 
      currentQuestion, 
      conversationHistory, 
      profile, 
      language
    );
    
    // Keep the same question for retry
    nextQuestion = currentQuestion;
    
    return new Response(JSON.stringify({
      message,
      nextQuestion,
      updatedShopData,
      readyToCreate: false,
      isVagueResponseDetected: true,
      finalShopData: null
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    });
  }

  // ENHANCED: E-commerce focused response processing
  switch (currentQuestion) {
    case 'business_name':
      updatedShopData.shop_name = await refineUserInput(userResponse, 'name', language);
      
      // Generate AI-powered follow-up focused on PRODUCTS
      if (openAIApiKey) {
        try {
          message = await generateContextualResponse(userResponse, 'business_name_confirmation', language, updatedShopData);
        } catch (error) {
          console.error('AI response generation failed, using fallback');
          message = language === 'es'
            ? `¡Perfecto! "${userResponse}" será tu tienda online. Ahora necesito saber QUÉ PRODUCTOS ESPECÍFICOS vas a vender. No digas solo "artesanías". ¿Vendes collares, bolsos, cerámicas, tejidos? Dime los productos exactos que tienes para vender.`
            : `Perfect! "${userResponse}" will be your online shop. Now I need to know WHAT SPECIFIC PRODUCTS you will sell. Don't just say "crafts". Do you sell necklaces, bags, ceramics, textiles? Tell me the exact products you have to sell.`;
        }
      } else {
        message = language === 'es'
          ? `¡Perfecto! "${userResponse}" será tu tienda online. Ahora dime qué productos específicos vas a vender.`
          : `Perfect! "${userResponse}" will be your online shop. Now tell me what specific products you will sell.`;
      }
      nextQuestion = 'business_products';
      break;
      
    case 'business_products':
    case 'business_description':
      const detectedCraft = detectCraftTypeFromText(userResponse);
      updatedShopData.craft_type = detectedCraft;
      updatedShopData.description = await refineUserInput(userResponse, 'description', language);
      
      if (openAIApiKey) {
        try {
          message = await generateContextualResponse(userResponse, 'products_confirmation', language, { ...updatedShopData, detectedCraftType: detectedCraft });
        } catch (error) {
          console.error('AI response generation failed, using fallback');
          message = language === 'es'
            ? `¡Excelente! Detecté que vendes ${detectedCraft}. Para configurar envíos y que tus clientes locales te encuentren, ¿en qué ciudad exacta estás ubicado?`
            : `Excellent! I detected that you sell ${detectedCraft}. To configure shipping and for local customers to find you, what exact city are you located in?`;
        }
      } else {
        message = language === 'es'
          ? `¡Perfecto! Detecté que vendes ${detectedCraft}. ¿En qué ciudad estás ubicado?`
          : `Perfect! I detected that you sell ${detectedCraft}. What city are you located in?`;
      }
      nextQuestion = 'business_location';
      break;

    case 'business_location':
      updatedShopData.region = await refineUserInput(userResponse, 'region', language);
      
      if (openAIApiKey) {
        try {
          message = await generateContextualResponse(userResponse, 'location_confirmation', language, updatedShopData);
        } catch (error) {
          message = language === 'es'
            ? `¡Excelente! Ya tengo toda la información esencial para crear tu tienda digital optimizada. La IA va a configurarla automáticamente con toda esta información.`
            : `Excellent! I have all the essential information to create your optimized digital shop. AI will configure it automatically with all this information.`;
        }
      } else {
        message = language === 'es'
          ? `¡Perfecto! Ya tengo la información necesaria para crear tu tienda digital.`
          : `Perfect! I have the necessary information to create your digital shop.`;
      }
      readyToCreate = true;
      break;

    case 'contact_phone':
      updatedShopData.contact_info = {
        ...updatedShopData.contact_info,
        phone: userResponse.trim(),
        whatsapp: userResponse.trim()
      };
      message = language === 'es'
        ? `¡Perfecto! Ya tengo toda la información necesaria. La IA está creando tu tienda digital optimizada ahora mismo...`
        : `Perfect! I have all the necessary information. AI is creating your optimized digital shop right now...`;
      readyToCreate = true;
      break;

    default:
      message = language === 'es'
        ? 'Gracias por la información. ¿Hay algo más específico que quieras contarme sobre tu negocio?'
        : 'Thanks for the information. Is there anything else specific you\'d like to tell me about your business?';
      readyToCreate = Object.keys(updatedShopData).length >= 3;
  }

  // Generate intelligent story if ready to create
  if (readyToCreate) {
    // Import AI story generation
    const { generateIntelligentStory } = await import('./ai-conversation-helpers.ts');
    
    try {
      updatedShopData.story = await generateIntelligentStory(conversationHistory, updatedShopData, language);
    } catch (error) {
      console.error('AI story generation failed, using fallback');
      updatedShopData.story = generateStoryFromConversation(conversationHistory, updatedShopData, language);
    }
    
    updatedShopData.shop_slug = updatedShopData.shop_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'mi-tienda';
    
    // Set default contact info if not provided
    if (!updatedShopData.contact_info) {
      updatedShopData.contact_info = {
        phone: '',
        email: '',
        whatsapp: ''
      };
    }
    
    if (!updatedShopData.social_links) {
      updatedShopData.social_links = {
        instagram: '',
        facebook: '',
        website: ''
      };
    }
  }

  return new Response(JSON.stringify({
    message,
    nextQuestion,
    updatedShopData,
    readyToCreate,
    finalShopData: readyToCreate ? updatedShopData : null
  }), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
  });
}

function detectCraftTypeFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  const craftMappings: Record<string, string> = {
    'tejido': 'textiles', 'textil': 'textiles', 'bordado': 'textiles', 'ropa': 'textiles',
    'cerámica': 'ceramics', 'alfarería': 'ceramics', 'barro': 'ceramics', 'arcilla': 'ceramics',
    'joyería': 'jewelry', 'orfebrería': 'jewelry', 'bisutería': 'jewelry',
    'cuero': 'leather', 'marroquinería': 'leather', 'bolsos': 'leather',
    'madera': 'woodwork', 'carpintería': 'woodwork', 'muebles': 'woodwork',
    'metal': 'metalwork', 'forja': 'metalwork', 'hierro': 'metalwork',
    'vidrio': 'glasswork', 'vitral': 'glasswork',
    'pintura': 'painting', 'arte': 'painting', 'cuadros': 'painting',
    'escultura': 'sculpture', 'tallado': 'sculpture'
  };

  for (const [keyword, craftType] of Object.entries(craftMappings)) {
    if (lowerText.includes(keyword)) {
      return craftType;
    }
  }

  return 'other';
}

function generateStoryFromConversation(conversation: any[], shopData: any, language: string): string {
  const businessType = shopData.craft_type || 'artesanía';
  const location = shopData.region || 'Colombia';
  const businessName = shopData.shop_name || 'nuestro negocio';

  if (language === 'es') {
    return `En ${businessName}, nos especializamos en crear ${businessType} únicos y de alta calidad. Ubicados en ${location}, combinamos técnicas tradicionales con un toque moderno para ofrecer productos excepcionales. Cada pieza está hecha con amor y dedicación, reflejando nuestra pasión por el arte y la artesanía. Trabajamos con los mejores materiales para garantizar que cada cliente reciba un producto único que perdure en el tiempo.`;
  } else {
    return `At ${businessName}, we specialize in creating unique and high-quality ${businessType}. Located in ${location}, we combine traditional techniques with a modern touch to offer exceptional products. Each piece is made with love and dedication, reflecting our passion for art and craftsmanship. We work with the best materials to ensure each customer receives a unique product that will last over time.`;
  }
}

// Import AI helper function for contextual responses
async function generateContextualResponse(userResponse: string, responseType: string, language: string, shopData: any): Promise<string> {
  const { generateContextualResponse: aiHelper } = await import('./ai-conversation-helpers.ts');
  return aiHelper(userResponse, responseType, language, shopData);
}

// Helper functions (reuse existing ones)
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