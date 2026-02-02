import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateThemeRequest {
  userId: string;
  logoUrl?: string;
  logoColors?: string[];
  brandName: string;
  brandDescription: string;
  sector: string;
  emotions: string[];
  forceRegenerate?: boolean;
}

interface ColorPalette {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  accent: Record<string, string>;
  neutral: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
  info: Record<string, string>;
}

interface StyleContext {
  tone: string;
  emotion: string;
  contrast_mode: string;
  texture_hint: string;
}

interface UsageRules {
  buttons: string;
  hover: string;
  background: string;
  text: string;
  links: string;
  borders: string;
}

interface ThemeResponse {
  palette: ColorPalette;
  style_context: StyleContext;
  usage: UsageRules;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      userId,
      logoUrl,
      logoColors,
      brandName,
      brandDescription,
      sector,
      emotions,
      forceRegenerate
    }: GenerateThemeRequest = await req.json();

    console.log('Generating brand theme for user:', userId);

    // Get current version if regenerating
    let version = 1;
    if (forceRegenerate) {
      const { data: existingThemes } = await supabase
        .from('brand_themes')
        .select('version')
        .eq('user_id', userId)
        .order('version', { ascending: false })
        .limit(1);
      
      if (existingThemes && existingThemes.length > 0) {
        version = existingThemes[0].version + 1;
      }
    }

    // Build AI prompt
    const logoColorInfo = logoColors && logoColors.length > 0 
      ? `- Colores extraídos del logo: ${logoColors.join(', ')}`
      : '';

    const prompt = `Eres un diseñador experto en sistemas cromáticos para marcas artesanales colombianas.

Información de la marca:
- Nombre: ${brandName}
- Sector: ${sector}
- Descripción: ${brandDescription}
- Emociones/Valores: ${emotions.join(', ')}
${logoColorInfo}

Genera una paleta de colores completa siguiendo estas reglas:

1. COHERENCIA ARTESANAL:
   - Evita tonos sintéticos, neón o muy saturados
   - Prefiere tonos tierra, piedra, madera, metal envejecido, fibras naturales
   - Mantén autenticidad y calidez humana

2. ESTRUCTURA DE PALETA:
   - Primary: Color principal de identidad (debe derivar del logo si existe)
   - Secondary: Color complementario que armonice con primary
   - Accent: Color de acento emocional para detalles y CTAs
   - Neutral: Base de fondos y textos (cálidos: beige/lino; fríos: gris azulado/pizarra)
   - Success: Verde natural (#3AA76D)
   - Warning: Ámbar/Ocre (#E9B64F)
   - Error: Terracota rojizo (#E04F5F)
   - Info: Azul índigo suave (#4D8DE3)

3. ESCALAS TONALES (50-900):
   - Genera 9 tonos por color principal (primary, secondary, accent, neutral)
   - Asegura contraste AA/AAA entre texto y fondo (4.5:1 mínimo, 7:1 ideal)
   - 50: muy claro (fondos sutiles)
   - 500: tono base (identidad)
   - 900: muy oscuro (textos, contraste)

4. TEMPERATURA COHERENTE:
   - Si las emociones son cálidas/naturales: usa neutrales beige, lino, marfil
   - Si son frescas/minimalistas: usa neutrales gris azulado, pizarra

Devuelve SOLO un objeto JSON válido con esta estructura exacta:
{
  "palette": {
    "primary": {"50":"#...","100":"#...","200":"#...","300":"#...","400":"#...","500":"#...","600":"#...","700":"#...","800":"#...","900":"#..."},
    "secondary": {"50":"#...","100":"#...","200":"#...","300":"#...","400":"#...","500":"#...","600":"#...","700":"#...","800":"#...","900":"#..."},
    "accent": {"50":"#...","100":"#...","200":"#...","300":"#...","400":"#...","500":"#...","600":"#...","700":"#...","800":"#...","900":"#..."},
    "neutral": {"50":"#...","100":"#...","200":"#...","300":"#...","400":"#...","500":"#...","600":"#...","700":"#...","800":"#...","900":"#..."},
    "success": {"500":"#3AA76D"},
    "warning": {"500":"#E9B64F"},
    "error": {"500":"#E04F5F"},
    "info": {"500":"#4D8DE3"}
  },
  "style_context": {
    "tone": "descripción del tono (ej: cálido artesanal)",
    "emotion": "emociones evocadas (ej: natural, humano, auténtico)",
    "contrast_mode": "medium-high",
    "texture_hint": "textura sugerida (ej: lino sutil, piedra pulida)"
  },
  "usage": {
    "buttons": "primary-500",
    "hover": "primary-700",
    "background": "neutral-50",
    "text": "neutral-900",
    "links": "accent-500",
    "borders": "neutral-200"
  }
}`;

    // Call Lovable AI
    console.log('Calling AI to generate palette...');
    const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-chat', {
      body: {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'gemini-2.0-flash-exp'
      }
    });

    if (aiError) {
      console.error('AI call error:', aiError);
      throw aiError;
    }

    // Parse AI response
    let themeData: ThemeResponse;
    try {
      const aiResponse = aiData.choices[0].message.content;
      console.log('AI response:', aiResponse);
      
      // Extract JSON from response (might be wrapped in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      themeData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Generate theme_id
    const timestamp = Date.now();
    const themeId = version > 1 
      ? `${userId}_${timestamp}_v${version}`
      : `${userId}_${timestamp}`;

    // Generate preview description
    const previewDescription = `Botones en ${extractColorName(themeData.palette.primary['500'])} ` +
      `con hover en ${extractColorName(themeData.palette.primary['700'])}, ` +
      `fondo ${extractColorName(themeData.palette.neutral['50'])} ` +
      `y tipografía ${extractColorName(themeData.palette.neutral['900'])}.`;

    // Mark old themes as inactive if regenerating
    if (forceRegenerate) {
      await supabase
        .from('brand_themes')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);
    }

    // Save to database
    const { data: savedTheme, error: saveError } = await supabase
      .from('brand_themes')
      .insert({
        user_id: userId,
        theme_id: themeId,
        version,
        is_active: true,
        palette: themeData.palette,
        style_context: themeData.style_context,
        usage_rules: themeData.usage,
        preview_description: previewDescription
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save theme:', saveError);
      throw saveError;
    }

    // Update artisan_shops with active_theme_id
    const { error: shopUpdateError } = await supabase
      .from('artisan_shops')
      .update({ active_theme_id: themeId })
      .eq('user_id', userId);

    if (shopUpdateError) {
      console.warn('Failed to update shop theme_id:', shopUpdateError);
      // Not critical, continue
    }

    console.log('Theme generated successfully:', themeId);

    return new Response(
      JSON.stringify({
        success: true,
        themeId,
        palette: themeData.palette,
        styleContext: themeData.style_context,
        usageRules: themeData.usage,
        previewDescription,
        version
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-brand-theme:', error);
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

// Helper to extract color name from hex
function extractColorName(hex: string): string {
  // Simple color name extraction based on hue
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  if (max - min < 20) return 'gris';
  
  if (r > g && r > b) {
    if (g > 150) return 'naranja';
    if (b > 150) return 'rosa';
    return 'terracota';
  }
  if (g > r && g > b) {
    if (r > 150) return 'amarillo';
    return 'verde oliva';
  }
  if (b > r && b > g) {
    if (r > 150) return 'púrpura';
    return 'índigo';
  }
  
  return hex;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
