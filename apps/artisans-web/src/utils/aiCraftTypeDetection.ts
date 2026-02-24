import { supabase } from '@/integrations/supabase/client';
import { CraftType } from '@/types/artisan';
import { detectCraftType } from './artisanDetection';

// Valid craft types mapping
const VALID_CRAFT_TYPES: Record<string, CraftType> = {
  'ceramics': 'ceramics',
  'ceramic': 'ceramics',
  'pottery': 'ceramics',
  'cerámica': 'ceramics',
  'alfarería': 'ceramics',
  'barro': 'ceramics',
  
  'jewelry': 'jewelry',
  'jewellery': 'jewelry',
  'joyería': 'jewelry',
  'orfebrería': 'jewelry',
  'bisutería': 'jewelry',
  
  'textiles': 'textiles',
  'textile': 'textiles',
  'tejido': 'textiles',
  'bordado': 'textiles',
  'costura': 'textiles',
  
  'leather': 'leather',
  'cuero': 'leather',
  'marroquinería': 'leather',
  
  'wood': 'woodwork',
  'woodwork': 'woodwork',
  'madera': 'woodwork',
  'carpintería': 'woodwork',
  
  'metal': 'metalwork',
  'metalwork': 'metalwork',
  'forja': 'metalwork',
  'herrería': 'metalwork',
  
  // Cosmética y cuidado personal
  'cosmetics': 'cosmetics',
  'cosmética': 'cosmetics',
  'cosmético': 'cosmetics',
  'jabón': 'cosmetics',
  'jabonería': 'cosmetics',
  'crema': 'cosmetics',
  'skincare': 'cosmetics',
  'cuidado personal': 'cosmetics',
  'belleza': 'cosmetics',
  
  // 'other' mapeado a 'mixed' para nunca mostrar "other" en la UI
  'other': 'mixed',
  'otro': 'mixed',
  'otra': 'mixed',
  'mixed': 'mixed',
  'mixto': 'mixed'
};

// ✅ Cache to prevent duplicate AI calls
const detectionCache = new Map<string, Promise<CraftType>>();
let isCurrentlyDetecting = false;

/**
 * Detects craft type using AI analysis of business description
 * Falls back to keyword matching if AI fails
 * ✅ Includes cache to prevent duplicate calls
 */
export async function detectCraftTypeWithAI(
  businessDescription: string,
  language: 'es' | 'en' = 'es'
): Promise<CraftType> {
  // ✅ Create cache key
  const cacheKey = `${businessDescription.trim().toLowerCase()}_${language}`;
  
  // ✅ Check if already detecting this exact description
  if (detectionCache.has(cacheKey)) {
    console.log('🔄 [AI-CRAFT] Using cached detection result');
    return detectionCache.get(cacheKey)!;
  }
  
  console.log('🤖 [AI-CRAFT] Starting craft type detection with AI');
  console.log('📝 [AI-CRAFT] Business description:', businessDescription.substring(0, 100) + '...');

  // ✅ Create promise and cache it immediately
  const detectionPromise = (async () => {
    try {
      const prompt = language === 'es'
      ? `Analiza esta descripción de negocio artesanal y determina el tipo de artesanía principal.

Descripción: "${businessDescription}"

Tipos válidos:
- ceramics (cerámica, alfarería, barro, arcilla, porcelana)
- jewelry (joyería, orfebrería, bisutería, collares, aretes, pulseras)
- textiles (tejido, bordado, textil, telas, lanas)
- leather (cuero, marroquinería, talabartería, pieles)
- woodwork (madera, carpintería, talla)
- metalwork (metal, forja, herrería)
- cosmetics (cosmética, jabones, cremas, cuidado personal, belleza natural, skincare)
- other (cualquier otra artesanía)

Responde únicamente con el tipo exacto en inglés (ceramics, jewelry, cosmetics, etc.).`
      : `Analyze this artisan business description and determine the main craft type.

Description: "${businessDescription}"

Valid types:
- ceramics (pottery, clay, porcelain)
- jewelry (goldsmithing, silversmithing, jewelry making)
- textiles (weaving, embroidery, fabric work)
- leather (leatherwork, leather goods)
- woodwork (woodworking, carpentry, wood carving)
- metalwork (metalworking, forging, blacksmithing)
- cosmetics (soaps, creams, skincare, natural beauty, personal care)
- other (any other craft)

Respond only with the exact type in English (ceramics, jewelry, cosmetics, etc.).`;

    console.log('🔄 [AI-CRAFT] Calling Lovable AI with optimized settings...');
    
    // Create abort controller for 5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ [AI-CRAFT] Timeout after 5 seconds, aborting...');
      controller.abort();
    }, 5000);
    
    try {
      const { data, error } = await supabase.functions.invoke('lovable-ai', {
        body: {
          messages: [
            { 
              role: 'user', 
              content: `Classify this artisan craft in ONE WORD: "${businessDescription.substring(0, 200)}"\n\nOptions: ceramics, jewelry, textiles, leather, woodwork, metalwork, cosmetics, other`
            }
          ],
          temperature: 0.2, // ✅ Low temperature for deterministic responses
          max_tokens: 10,   // ✅ Only need 1 word
          tools: [
            {
              type: 'function',
              function: {
                name: 'classify_craft',
                description: 'Classify the craft type based on description',
                parameters: {
                  type: 'object',
                  properties: {
                    craftType: {
                      type: 'string',
                      enum: ['ceramics', 'jewelry', 'textiles', 'leather', 'woodwork', 'metalwork', 'cosmetics', 'basketry', 'glasswork', 'painting', 'sculpture', 'paper'],
                      description: 'The detected craft type - MUST choose the closest match, never use other'
                    },
                    confidence: {
                      type: 'number',
                      description: 'Confidence level (0-1)'
                    }
                  },
                  required: ['craftType'],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: 'function', function: { name: 'classify_craft' } }
        }
      });
      
      clearTimeout(timeoutId); // ✅ Cancel timeout if request completes

      if (error) {
        console.error('❌ [AI-CRAFT] Lovable AI error:', error);
        throw error;
      }

      console.log('✅ [AI-CRAFT] Lovable AI response:', data);

      // Parse tool call response
      const toolCalls = data?.choices?.[0]?.message?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        const args = JSON.parse(toolCalls[0].function.arguments);
        const detectedType = args.craftType?.toLowerCase().trim();
        
        console.log('🎯 [AI-CRAFT] AI detected craft type:', detectedType);
        console.log('📊 [AI-CRAFT] Confidence:', args.confidence);
        
        if (VALID_CRAFT_TYPES[detectedType]) {
          const finalType = VALID_CRAFT_TYPES[detectedType];
          console.log('✅ [AI-CRAFT] Valid craft type detected:', finalType);
          return finalType;
        }
      }

      // If no valid tool call, try parsing text response
      const content = data?.choices?.[0]?.message?.content?.toLowerCase().trim();
      if (content && VALID_CRAFT_TYPES[content]) {
        const finalType = VALID_CRAFT_TYPES[content];
        console.log('✅ [AI-CRAFT] Craft type from text response:', finalType);
        return finalType;
      }

      console.warn('⚠️ [AI-CRAFT] AI response not recognized, falling back to keywords');
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.warn('⏱️ [AI-CRAFT] Request timed out after 5 seconds, using fallback');
      } else {
        console.error('❌ [AI-CRAFT] Error with AI detection:', error);
      }
    }
  } catch (error) {
    console.error('❌ [AI-CRAFT] Outer error:', error);
  }

    // Fallback to keyword matching - NUNCA devolver 'other'
    console.log('🔄 [AI-CRAFT] Using keyword matching fallback...');
    const fallbackResult = detectCraftType({ businessDescription });
    // Si es 'other', usar 'mixed' como fallback más descriptivo
    const finalResult = (!fallbackResult || fallbackResult === 'other') ? 'mixed' : fallbackResult;
    console.log('✅ [AI-CRAFT] Fallback result:', finalResult);
    
    return finalResult as CraftType;
  })();

  // ✅ Store promise in cache
  detectionCache.set(cacheKey, detectionPromise);
  
  // ✅ Clean cache after 5 minutes
  setTimeout(() => {
    detectionCache.delete(cacheKey);
  }, 5 * 60 * 1000);
  
  return detectionPromise;
}

/**
 * Gets the craft type display name in the specified language
 */
export function getCraftTypeLabel(craftType: CraftType, language: 'es' | 'en'): string {
  const labels: Record<string, { es: string; en: string }> = {
    ceramics: { es: 'Cerámica', en: 'Ceramics' },
    jewelry: { es: 'Joyería', en: 'Jewelry' },
    textiles: { es: 'Textiles y Tejidos', en: 'Textiles' },
    leather: { es: 'Marroquinería y Cuero', en: 'Leather' },
    woodwork: { es: 'Trabajo en Madera', en: 'Woodwork' },
    basketry: { es: 'Cestería y Fibras Naturales', en: 'Basketry' },
    metalwork: { es: 'Metalistería', en: 'Metalwork' },
    glasswork: { es: 'Vidrio Artesanal', en: 'Glasswork' },
    painting: { es: 'Pintura Artística', en: 'Painting' },
    sculpture: { es: 'Escultura', en: 'Sculpture' },
    cosmetics: { es: 'Cosmética y Cuidado Personal', en: 'Cosmetics' },
    paper: { es: 'Arte en Papel', en: 'Paper' },
    mixed: { es: 'Técnicas Mixtas', en: 'Mixed Techniques' },
    // Fallback - nunca mostrar "other" en inglés
    other: { es: 'Artesanía Tradicional', en: 'Traditional Craft' }
  };

  // Si es 'other', convertir a 'mixed' antes de buscar
  const normalizedType = craftType === 'other' ? 'mixed' : craftType;
  return labels[normalizedType]?.[language] || labels.mixed[language];
}
