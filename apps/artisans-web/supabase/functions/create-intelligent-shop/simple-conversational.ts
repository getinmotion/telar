// Simple conversational shop creation - streamlined for 3 questions only

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Refine user input with AI
async function refineUserInput(rawText: string, fieldType: 'description' | 'name' | 'region', language: string): Promise<string> {
  if (!openAIApiKey) return rawText.trim();
  
  const prompts = {
    description: language === 'es' ? `Corrige TODOS los errores ortográficos y gramaticales en: "${rawText}". Responde SOLO con el texto corregido.` : `Fix ALL spelling and grammar in: "${rawText}". Respond ONLY with corrected text.`,
    name: language === 'es' ? `Corrige errores en este nombre: "${rawText}". SOLO el nombre corregido.` : `Fix errors in this name: "${rawText}". ONLY corrected name.`,
    region: language === 'es' ? `Corrige esta ubicación: "${rawText}". SOLO la ubicación corregida.` : `Fix this location: "${rawText}". ONLY corrected location.`
  };
  
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
          { role: 'system', content: 'Corrige textos. Responde SOLO con el texto corregido.' },
          { role: 'user', content: prompts[fieldType] }
        ],
        max_tokens: 150,
        temperature: 0.3
      }),
    });

    if (!response.ok) return rawText.trim();
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error refining:', error);
    return rawText.trim();
  }
}

export async function processSimpleConversation(
  userResponse: string, 
  currentQuestion: string,
  shopData: any,
  language: string = 'es'
) {
  const responses = {
    es: {
      shop_name: {
        message: '✅ Excelente nombre! Ahora, ¿qué productos específicos vendes?',
        nextQuestion: 'products'
      },
      products: {
        message: '✅ Perfecto! Por último, ¿en qué ciudad estás ubicado?',
        nextQuestion: 'location'
      },
      location: {
        message: '🎉 ¡Listo! Tengo toda la información necesaria. Creando tu tienda...',
        nextQuestion: null,
        readyToCreate: true
      }
    },
    en: {
      shop_name: {
        message: '✅ Excellent name! Now, what specific products do you sell?',
        nextQuestion: 'products'
      },
      products: {
        message: '✅ Perfect! Finally, what city are you located in?',
        nextQuestion: 'location'
      },
      location: {
        message: '🎉 Ready! I have all the necessary information. Creating your shop...',
        nextQuestion: null,
        readyToCreate: true
      }
    }
  };

  const langResponses = responses[language as keyof typeof responses] || responses.es;
  const response = langResponses[currentQuestion as keyof typeof langResponses];

  if (!response) {
    return {
      message: 'Por favor, responde la pregunta actual.',
      nextQuestion: currentQuestion,
      readyToCreate: false,
      updatedShopData: shopData
    };
  }

  // Update shop data based on question - with AI refinement
  const updatedShopData = { ...shopData };
  
  if (currentQuestion === 'shop_name') {
    updatedShopData.shop_name = await refineUserInput(userResponse, 'name', language);
  } else if (currentQuestion === 'products') {
    updatedShopData.description = await refineUserInput(userResponse, 'description', language);
    updatedShopData.craft_type = detectSimpleCraftType(userResponse);
  } else if (currentQuestion === 'location') {
    updatedShopData.region = await refineUserInput(userResponse, 'region', language);
  }

  const isReady = 'readyToCreate' in response ? response.readyToCreate : false;

  return {
    message: response.message,
    nextQuestion: response.nextQuestion,
    readyToCreate: isReady,
    updatedShopData,
    finalShopData: isReady ? createFinalShopData(updatedShopData) : null
  };
}

function detectSimpleCraftType(text: string): string {
  const craftTypes: Record<string, string[]> = {
    'textiles': ['tejido', 'tela', 'lana', 'algodón', 'bordado', 'tapiz', 'hilo'],
    'ceramica': ['cerámica', 'barro', 'arcilla', 'maceta', 'vasija', 'porcelana'],
    'joyeria': ['collar', 'arete', 'pulsera', 'anillo', 'joya', 'plata', 'oro'],
    'cuero': ['cuero', 'bolso', 'cartera', 'cinturón', 'marroquinería', 'piel'],
    'madera': ['madera', 'tallado', 'mueble', 'decorativo', 'carpintería']
  };

  const lowerText = text.toLowerCase();
  for (const [type, keywords] of Object.entries(craftTypes)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return type;
    }
  }
  return 'artesanias';
}

function createFinalShopData(shopData: any) {
  return {
    ...shopData,
    story: `Somos ${shopData.shop_name}, especialistas en ${shopData.description} desde ${shopData.region}. Cada producto está hecho con amor y tradición artesanal colombiana.`,
    contact_info: { email: '' },
    social_links: {}
  };
}