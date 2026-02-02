import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { userText, fieldsToExtract, language } = await req.json();
    
    // Validar parámetros requeridos
    if (!userText || typeof userText !== 'string') {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid description',
          message: language === 'es' 
            ? 'La descripción debe tener al menos 20 caracteres' 
            : 'Description must be at least 20 characters'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!fieldsToExtract || !Array.isArray(fieldsToExtract)) {
      return new Response(
        JSON.stringify({ error: 'Missing fields to extract' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validar longitud mínima
    if (userText.trim().length < 10) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid description',
          message: language === 'es' 
            ? 'Escribe al menos 10 caracteres para continuar' 
            : 'Write at least 10 characters to continue'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    // Definir variables para usarlas más adelante en validaciones
    const hasFirstPerson = /\b(yo|mi|hago|trabajo|elaboro|soy|i|my|i make|i work)\b/i.test(userText);
    const hasExplicitBrandName = /\b(mi marca es|se llama|el nombre es|my brand is|it's called)\b/i.test(userText);
    const hasBrandNegation = /\b(no tengo nombre|sin nombre|no name|without name)\b/i.test(userText);
    
    console.log('🔍 [EXTRACT] Analyzing description:', {
      preview: userText.substring(0, 100),
      hasFirstPerson,
      hasExplicitBrandName,
      hasBrandNegation,
      length: userText.length
    });

    const systemPrompt = language === 'es' 
      ? `Eres un asistente experto en analizar descripciones de negocios artesanales. 
         Tu trabajo es extraer información estructurada del texto del usuario.
         
         Campos a extraer: ${fieldsToExtract.join(', ')}
         
         ⭐ PRIORIDAD MÁXIMA - CRAFT_TYPE (TIPO DE ARTESANÍA):
         
         Identifica con MÁXIMA PRECISIÓN el tipo de artesanía basándote en las palabras clave:
         
         🔪 CUCHILLOS/NAVAJAS → craft_type = "Cuchillería"
         - Palabras clave: cuchillo, navaja, blade, knife, cuchillería
         - Materiales mencionados: acero, metal, aleaciones, forja
         - Técnicas: forjado, templado, afilado
         
         🏺 CERÁMICA/BARRO → craft_type = "Cerámica"  
         - Palabras clave: cerámica, barro, arcilla, pottery, clay
         
         🧵 TEXTILES → craft_type = "Textil"
         - Palabras clave: tejido, textil, bordado, textile, weaving
         
         💎 JOYERÍA → craft_type = "Joyería"
         - Palabras clave: joyería, joyas, jewelry, orfebrería
         
         🪵 MADERA → craft_type = "Carpintería Artesanal"
         - Palabras clave: madera, wood, carpintería, tallado
         
         🎨 PINTURA → craft_type = "Arte Pictórico"
         
         ⚠️ ANALIZA TODO EL TEXTO antes de decidir. NO confundas productos mencionados.
         
         Ejemplo:
         "cuchillos más hermosos de aleaciones de metales" → craft_type = "Cuchillería" ✅
         (NO "jewelry" aunque mencione "aleaciones")
         
         
         📍 PRIORIDAD ALTA - BUSINESS_LOCATION (UBICACIÓN):
         
         Busca AGRESIVAMENTE cualquier mención de ubicación:
         
         ✅ Ciudades explícitas: "en Bogotá", "desde Medellín", "Oaxaca", "Lima"
         ✅ Países: "Colombia", "México", "Perú", "Chile"
         ✅ Regiones: "en Antioquia", "costa", "Andes", "Cusco"
         ✅ Frases indirectas: "trabajo desde [ciudad]", "ubicado en [lugar]"
         
         Si NO hay mención EXPLÍCITA de ubicación → business_location = null
         ⚠️ NUNCA inventes o asumas ubicaciones.
         
         
         REGLAS REFORZADAS PARA NOMBRE DE MARCA (brand_name):
         
         ⚠️ ARTÍCULOS INDEFINIDOS INDICAN DESCRIPCIÓN, NO NOMBRE:
         - Si el texto dice "un [algo]", "una [algo]" → NO es nombre de marca
         - Si el texto dice "a [something]", "an [something]" → NO es marca
         
         Ejemplos:
         ❌ "mi marca es un estudio de tejido" → "un estudio" = DESCRIPCIÓN
            → brand_name = "Sin nombre definido"
         
         ❌ "mi marca es una tienda de cerámica" → "una tienda" = DESCRIPCIÓN  
            → brand_name = "Sin nombre definido"
         
         ✅ "mi marca es Tejidos Luna" → "Tejidos Luna" = NOMBRE PROPIO
            → brand_name = "Tejidos Luna"
         
         ✅ "se llama CERÁMICA DEL VALLE" → Nombre en mayúsculas
            → brand_name = "CERÁMICA DEL VALLE"
         
         ⚠️ ARTÍCULOS DEFINIDOS PUEDEN INDICAR NOMBRE:
         - "la cuchillería" → Puede ser nombre si está precedido por "mi estudio es", "mi marca es"
         - "el taller" → Puede ser nombre si tiene contexto de identificación
         - "los tejidos luna" → Puede ser nombre si es identificador principal

         Ejemplos:
         ✅ "mi estudio es la cuchillería" → brand_name = "La Cuchillería"
         ✅ "mi marca es el taller del barro" → brand_name = "El Taller del Barro"
         ✅ "se llama los tejidos luna" → brand_name = "Los Tejidos Luna"

         REGLA: Si el artículo definido (la/el/los/las) está DESPUÉS de frases como:
         - "mi marca/estudio/negocio/taller ES [la/el]..."
         - "se llama [la/el]..."
         - "el nombre es [la/el]..."

         → CONSIDERAR como posible nombre de marca (capitalizar apropiadamente)
         
         REGLA DE ORO: Los nombres de marca son NOMBRES PROPIOS, no descripciones.
         Si contiene artículos indefinidos (un/una/a/an) → NO es nombre de marca.
         
         SOLO considera que existe un nombre de marca si el usuario usa EXPLÍCITAMENTE frases como:
         - "mi marca es [NOMBRE]" (sin "un/una" antes del nombre)
         - "mi marca se llama [NOMBRE]"
         - "se llama [NOMBRE]"
         - "el nombre es [NOMBRE]"
         - "my brand is [NAME]" (sin "a/an" antes del nombre)
         - "it's called [NAME]"
         - Nombres entre comillas: "[NOMBRE]"
         - Nombres en mayúsculas distintivas al inicio: "CERÁMICA LUNA hace..."
         
         IMPORTANTE - ESTAS NO SON MARCAS:
         ❌ "hago cerámica" → NO hay marca
         ❌ "trabajo textiles" → NO hay marca
         ❌ "soy María" → NO es nombre de marca (es nombre personal)
         ❌ "desde Oaxaca" → NO es marca (es ubicación)
         ❌ "un estudio de tejido" → NO es marca (artículo indefinido + descripción)
         ❌ "una tienda de cerámica" → NO es marca (artículo indefinido + descripción)
         ❌ "un taller artesanal" → NO es marca (artículo indefinido + descripción)
         ❌ Primera palabra capitalizada de la descripción → NO asumir que es marca
         ❌ "trabajo en [descripción]" → NO es marca
         
         SI NO ENCUENTRAS FRASE EXPLÍCITA DE IDENTIFICACIÓN (sin artículos indefinidos):
         → brand_name = "Sin nombre definido"
         
         NUNCA inventes o infiera un nombre. Si no es EXPLÍCITO y PROPIO, marca como "Sin nombre definido".
         
         REGLAS PARA UBICACIÓN (business_location):
         
         Busca ACTIVAMENTE menciones de:
         - Ciudades: "en Bogotá", "desde Medellín", "Oaxaca", "from NYC"
         - Países: "en Colombia", "from Mexico", "in USA"
         - Regiones: "en Antioquia", "en la costa", "in the mountains"
         - Preposiciones de lugar: "en", "desde", "from", "in", "at"
         
         Ejemplos:
         ✅ "trabajo desde Medellín" → business_location = "Medellín"
         ✅ "mi taller está en Oaxaca" → business_location = "Oaxaca"
         ✅ "vivo en Bogotá, Colombia" → business_location = "Bogotá, Colombia"
         
         Si NO encuentras ubicación explícita → business_location = null
         NO inventes ubicaciones.
         
         EJEMPLOS CORRECTOS:
         ✅ 'Mi marca es Hemp Anime y hago camisas'
            → { brand_name: 'Hemp Anime', craft_type: 'Textil' }
         
         ✅ 'Se llama ANIMESETAS y hago camisetas de Goku personalizadas'
            → { brand_name: 'ANIMESETAS', craft_type: 'Textil' }
         
         ✅ 'Mi marca es Cerámica del Valle, trabajo con arcilla'
            → { brand_name: 'Cerámica del Valle', craft_type: 'Cerámica' }
         
         EJEMPLOS INCORRECTOS (lo que NO debes hacer):
         ❌ 'Mi marca es ANIMESETAS Y HAGO CAMISETAS DE GOKU PERSONALIZADAS...' 
            → INCORRECTO - esto es toda la descripción, no solo el nombre
            → CORRECTO: { brand_name: 'ANIMESETAS' }
         
          ❌ 'Hago platos de cerámica' 
             → NO hay nombre explícito: { brand_name: 'Sin nombre definido' }
          
          ❌ 'Soy María y trabajo joyería' 
             → NO hay nombre de marca: { brand_name: 'Sin nombre definido' }
          
          Si NO encuentras frases explícitas de identificación → brand_name = 'Sin nombre definido'
          Si el nombre extraído tiene más de 6 palabras → probablemente incluiste la descripción por error
          
          Responde usando la herramienta extract_business_info.`
      : `You are an expert in analyzing artisan business descriptions. 
         Extract structured information from the user's text.
         
         Fields to extract: ${fieldsToExtract.join(', ')}
         
         CRITICAL RULES FOR BRAND NAME (brand_name):
         
         A brand name is SHORT (1-4 words maximum) and is the PROPER NAME that identifies the business.
         
         Only consider a brand name exists IF the user uses explicit phrases like:
         - 'my brand is...', 'it's called...', 'the name is...', 'my brand is called...'
         - Words in quotes as proper names
         - Distinctive capitalized names (e.g., VALLEY CRAFTS)
         
         IMPORTANT: The brand name is ONLY the name, NOT the complete business description.
         Extract ONLY the first 1-4 words after the identification phrase.
         
         CORRECT EXAMPLES:
         ✅ 'My brand is Hemp Anime and I make shirts'
            → { brand_name: 'Hemp Anime', craft_type: 'Textile' }
         
         ✅ 'It's called ANIMESETAS and I make custom Goku t-shirts'
            → { brand_name: 'ANIMESETAS', craft_type: 'Textile' }
         
         ✅ 'My brand is Valley Ceramics, I work with clay'
            → { brand_name: 'Valley Ceramics', craft_type: 'Ceramics' }
         
         INCORRECT EXAMPLES (what NOT to do):
         ❌ 'My brand is ANIMESETAS AND I MAKE CUSTOM GOKU T-SHIRTS...' 
            → WRONG - this is the whole description, not just the name
            → CORRECT: { brand_name: 'ANIMESETAS' }
         
         ❌ 'I make ceramic plates' 
            → NO explicit name: { brand_name: 'No name defined' }
         
         ❌ 'I'm Mary and I work in jewelry' 
            → NO brand name: { brand_name: 'No name defined' }
         
         If NO explicit identification phrases found → brand_name = 'No name defined'
         If the extracted name has more than 6 words → you likely included the description by mistake
         
         Respond using the extract_business_info tool.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_business_info',
              description: 'Extract structured business information from description',
              parameters: {
                type: 'object',
                properties: {
                  brand_name: {
                    type: 'string',
                    description: 'Brand name, null if not mentioned'
                  },
                  products: {
                    type: 'string',
                    description: 'Products the artisan creates'
                  },
                  craft_type: {
                    type: 'string',
                    description: 'Type of artisan craft'
                  },
                  business_location: {
                    type: 'string',
                    description: 'Location, null if not mentioned'
                  },
                  target_audience: {
                    type: 'string',
                    description: 'Target customer demographic'
                  },
                  unique_value: {
                    type: 'string',
                    description: 'What makes the business unique'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score 0.0 to 1.0'
                  }
                },
                required: ['craft_type', 'unique_value', 'confidence'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_business_info' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [EXTRACT] AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add credits to your workspace' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🤖 [EXTRACT] Raw AI response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error('❌ [EXTRACT] No tool call in response');
      throw new Error('Failed to extract structured data from AI response');
    }

    const extractedInfo = JSON.parse(toolCall.function.arguments);
    
    // ========= ADVANCED POST-EXTRACTION VALIDATION =========
    let finalBrandName = extractedInfo.brand_name || '';
    let finalConfidence = extractedInfo.confidence || 0.5;
    let wasNameCorrected = false;
    let correctionReason = '';
    
    console.log('🔎 [VALIDATION] Analyzing extracted brand name:', finalBrandName);
    
    // ✅ NUEVO: Validar longitud del brand_name
    const wordCount = finalBrandName.trim().split(/\s+/).length;
    const isTooLong = wordCount > 6;
    
    if (isTooLong) {
      console.warn(`⚠️ [VALIDATION] Brand name too long (${wordCount} words), likely includes description:`, finalBrandName);
      // Intentar extraer solo las primeras 1-3 palabras
      const words = finalBrandName.trim().split(/\s+/);
      const truncatedName = words.slice(0, 3).join(' ');
      console.log(`🔧 [VALIDATION] Truncating to first 3 words: "${truncatedName}"`);
      finalBrandName = truncatedName;
      wasNameCorrected = true;
      correctionReason = `Brand name was too long (${wordCount} words), truncated to: ${truncatedName}`;
    }
    
    // 1. Check if brand_name starts with first-person phrases
    const invalidStartPatterns = [
      /^(yo |mi negocio |trabajo |hago |elaboro |soy |me dedico |y hago |y trabajo )/i,
      /^(i |my business |i work |i make |i create |and i |and i make )/i
    ];
    const startsWithFirstPerson = invalidStartPatterns.some(pattern => pattern.test(finalBrandName));
    
    // 2. Check if brand_name is just the craft type (generic descriptive name)
    const craftType = (extractedInfo.craft_type || '').toLowerCase();
    const brandNameLower = finalBrandName.toLowerCase();
    const isGenericCraftName = craftType && (
      brandNameLower.includes(craftType) || 
      craftType.includes(brandNameLower) ||
      // Common generic patterns
      /^(cerámica|joyería|textil|madera|cuero|estampados|ceramics|jewelry|textile|wood|leather)(\s+(artesanal|artesanal.*)?)?$/i.test(brandNameLower)
    );
    
    // 3. Check if it's a personal name (single word, capitalized, common names)
    const commonPersonalNames = /^(maría|jose|juan|pedro|ana|carlos|luis|sofia|laura|diego|andrea|camila|santiago|valentina|sebastian|john|michael|sarah|david|emma|james|mary|robert|jennifer|william|linda|richard|patricia|thomas|barbara|mark|susan)/i;
    const isSingleCapitalizedWord = /^[A-Z][a-zá-úñ]+$/i.test(finalBrandName) && !finalBrandName.includes(' ');
    const isPersonalName = isSingleCapitalizedWord && commonPersonalNames.test(finalBrandName);
    
    // 4. NUEVO: Check for indefinite articles at the start
    const hasIndefiniteArticle = /^(un |una |a |an )/i.test(finalBrandName);
    
    // 5. NUEVO: Check for generic description phrases
    const genericDescriptions = [
      'estudio de', 'taller de', 'tienda de', 'empresa de',
      'negocio de', 'marca de', 'shop of', 'studio of',
      'store of', 'business of', 'taller artesanal', 'estudio artesanal'
    ];
    const startsWithGenericDescription = genericDescriptions.some(desc => 
      finalBrandName.toLowerCase().startsWith(desc)
    );
    
    // 6. Check confidence score context
    const lowConfidenceWithFirstPerson = finalConfidence < 0.75 && hasFirstPerson;
    const veryLowConfidence = finalConfidence < 0.60;
    
    // DECISION LOGIC: When to mark as "No name defined"
    let shouldMarkAsNoName = false;
    
    if (startsWithFirstPerson) {
      shouldMarkAsNoName = true;
      correctionReason = 'Starts with first-person phrase';
      console.warn('⚠️ [VALIDATION] Brand name starts with first-person:', finalBrandName);
    } else if (hasIndefiniteArticle) {
      shouldMarkAsNoName = true;
      correctionReason = 'Contains indefinite article - description not name';
      console.warn('⚠️ [VALIDATION] Brand name has indefinite article:', finalBrandName);
    } else if (startsWithGenericDescription) {
      shouldMarkAsNoName = true;
      correctionReason = 'Starts with generic description phrase';
      console.warn('⚠️ [VALIDATION] Brand name is generic description:', finalBrandName);
    } else if (hasBrandNegation) {
      shouldMarkAsNoName = true;
      correctionReason = 'User explicitly stated no name';
      console.log('✅ [VALIDATION] User stated they have no brand name');
    } else if (isGenericCraftName && !hasExplicitBrandName) {
      shouldMarkAsNoName = true;
      correctionReason = 'Generic craft type used as name without explicit mention';
      console.warn('⚠️ [VALIDATION] Generic craft name without explicit brand mention:', finalBrandName);
    } else if (isPersonalName && !hasExplicitBrandName) {
      shouldMarkAsNoName = true;
      correctionReason = 'Personal name used without explicit brand context';
      console.warn('⚠️ [VALIDATION] Personal name without brand context:', finalBrandName);
    } else if (veryLowConfidence && hasFirstPerson && !hasExplicitBrandName) {
      shouldMarkAsNoName = true;
      correctionReason = 'Very low confidence + first-person + no explicit name';
      console.warn('⚠️ [VALIDATION] Low confidence first-person description without explicit name');
    }
    
    // Apply correction if needed
    if (shouldMarkAsNoName) {
      const originalBrandName = finalBrandName;
      finalBrandName = language === 'es' ? 'Sin nombre definido' : 'No name defined';
      finalConfidence = Math.min(finalConfidence, 0.70); // Cap confidence
      wasNameCorrected = true;
      
      console.log('🔧 [VALIDATION] Corrected brand name:', {
        original: originalBrandName,
        corrected: finalBrandName,
        reason: correctionReason,
        newConfidence: finalConfidence
      });
    } else {
      console.log('✅ [VALIDATION] Brand name looks valid:', finalBrandName);
    }

    console.log('✅ [EXTRACT] Final extraction result:', {
      brand_name: finalBrandName,
      craft_type: extractedInfo.craft_type,
      location: extractedInfo.business_location,
      confidence: finalConfidence,
      validation: {
        hasFirstPerson,
        hasExplicitBrandName,
        hasBrandNegation,
        wasNameCorrected,
        correctionReason: correctionReason || 'none'
      }
    });

    // ✅ Post-extraction validation for location
    const needsLocation = fieldsToExtract.includes('business_location');
    const extractedLocation = extractedInfo.business_location;
    const locationMissing = needsLocation && (!extractedLocation || extractedLocation === null || extractedLocation === 'No especificado' || extractedLocation === 'Not specified');
    
    const finalData: any = {
      brand_name: finalBrandName,
      craft_type: extractedInfo.craft_type || '',
      business_location: extractedLocation || (language === 'es' ? 'No especificado' : 'Not specified'),
      unique_value: extractedInfo.unique_value || '',
      confidence: finalConfidence
    };
    
    if (locationMissing) {
      console.log('⚠️ [VALIDATION] Location was requested but not found in extraction');
      finalData._needsLocation = true;
      finalData._locationMissing = true;
    } else if (needsLocation && extractedLocation) {
      console.log('✅ [VALIDATION] Location successfully extracted:', extractedLocation);
      finalData._needsLocation = true;
      finalData._locationMissing = false;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: finalData,
        metadata: {
          hasFirstPerson,
          hasExplicitBrandName,
          hasBrandNegation,
          wasNameCorrected,
          correctionReason: correctionReason || undefined,
          originalBrandName: wasNameCorrected ? extractedInfo.brand_name : undefined
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [EXTRACT] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
