import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping of common variations to normalized department names
const DEPARTMENT_NORMALIZATION: Record<string, string> = {
  // Variations → Canonical department name (uppercase)
  'bogota': 'BOGOTÁ D.C.',
  'bogotá': 'BOGOTÁ D.C.',
  'bogota d.c.': 'BOGOTÁ D.C.',
  'bogotá d.c.': 'BOGOTÁ D.C.',
  'cundinamarca': 'CUNDINAMARCA',
  'antioquia': 'ANTIOQUIA',
  'medellin': 'ANTIOQUIA',
  'medellín': 'ANTIOQUIA',
  'atlantico': 'ATLÁNTICO',
  'atlántico': 'ATLÁNTICO',
  'bolivar': 'BOLÍVAR',
  'bolívar': 'BOLÍVAR',
  'boyaca': 'BOYACÁ',
  'boyacá': 'BOYACÁ',
  'caldas': 'CALDAS',
  'caqueta': 'CAQUETÁ',
  'caquetá': 'CAQUETÁ',
  'cauca': 'CAUCA',
  'cesar': 'CESAR',
  'choco': 'CHOCÓ',
  'chocó': 'CHOCÓ',
  'cordoba': 'CÓRDOBA',
  'córdoba': 'CÓRDOBA',
  'guainia': 'GUAINÍA',
  'guainía': 'GUAINÍA',
  'guaviare': 'GUAVIARE',
  'huila': 'HUILA',
  'la guajira': 'LA GUAJIRA',
  'guajira': 'LA GUAJIRA',
  'magdalena': 'MAGDALENA',
  'meta': 'META',
  'narino': 'NARIÑO',
  'nariño': 'NARIÑO',
  'norte de santander': 'NORTE DE SANTANDER',
  'putumayo': 'PUTUMAYO',
  'quindio': 'QUINDÍO',
  'quindío': 'QUINDÍO',
  'risaralda': 'RISARALDA',
  'san andres': 'SAN ANDRÉS Y PROVIDENCIA',
  'san andrés': 'SAN ANDRÉS Y PROVIDENCIA',
  'santander': 'SANTANDER',
  'sucre': 'SUCRE',
  'tolima': 'TOLIMA',
  'valle': 'VALLE DEL CAUCA',
  'valle del cauca': 'VALLE DEL CAUCA',
  'vaupes': 'VAUPÉS',
  'vaupés': 'VAUPÉS',
  'vichada': 'VICHADA',
  'amazonas': 'AMAZONAS',
  'arauca': 'ARAUCA',
  'casanare': 'CASANARE',
};

// Common city → department mappings
const CITY_TO_DEPARTMENT: Record<string, { department: string; municipality: string }> = {
  'bogota': { department: 'BOGOTÁ D.C.', municipality: 'BOGOTÁ D.C.' },
  'bogotá': { department: 'BOGOTÁ D.C.', municipality: 'BOGOTÁ D.C.' },
  'medellin': { department: 'ANTIOQUIA', municipality: 'MEDELLÍN' },
  'medellín': { department: 'ANTIOQUIA', municipality: 'MEDELLÍN' },
  'cali': { department: 'VALLE DEL CAUCA', municipality: 'CALI' },
  'barranquilla': { department: 'ATLÁNTICO', municipality: 'BARRANQUILLA' },
  'cartagena': { department: 'BOLÍVAR', municipality: 'CARTAGENA DE INDIAS' },
  'bucaramanga': { department: 'SANTANDER', municipality: 'BUCARAMANGA' },
  'pereira': { department: 'RISARALDA', municipality: 'PEREIRA' },
  'manizales': { department: 'CALDAS', municipality: 'MANIZALES' },
  'armenia': { department: 'QUINDÍO', municipality: 'ARMENIA' },
  'ibague': { department: 'TOLIMA', municipality: 'IBAGUÉ' },
  'ibagué': { department: 'TOLIMA', municipality: 'IBAGUÉ' },
  'neiva': { department: 'HUILA', municipality: 'NEIVA' },
  'pasto': { department: 'NARIÑO', municipality: 'PASTO' },
  'popayan': { department: 'CAUCA', municipality: 'POPAYÁN' },
  'popayán': { department: 'CAUCA', municipality: 'POPAYÁN' },
  'villavicencio': { department: 'META', municipality: 'VILLAVICENCIO' },
  'tunja': { department: 'BOYACÁ', municipality: 'TUNJA' },
  'monteria': { department: 'CÓRDOBA', municipality: 'MONTERÍA' },
  'montería': { department: 'CÓRDOBA', municipality: 'MONTERÍA' },
  'santa marta': { department: 'MAGDALENA', municipality: 'SANTA MARTA' },
  'cucuta': { department: 'NORTE DE SANTANDER', municipality: 'CÚCUTA' },
  'cúcuta': { department: 'NORTE DE SANTANDER', municipality: 'CÚCUTA' },
  'valledupar': { department: 'CESAR', municipality: 'VALLEDUPAR' },
  'sincelejo': { department: 'SUCRE', municipality: 'SINCELEJO' },
  'riohacha': { department: 'LA GUAJIRA', municipality: 'RIOHACHA' },
  'quibdo': { department: 'CHOCÓ', municipality: 'QUIBDÓ' },
  'quibdó': { department: 'CHOCÓ', municipality: 'QUIBDÓ' },
  'florencia': { department: 'CAQUETÁ', municipality: 'FLORENCIA' },
  'mocoa': { department: 'PUTUMAYO', municipality: 'MOCOA' },
  'leticia': { department: 'AMAZONAS', municipality: 'LETICIA' },
  'yopal': { department: 'CASANARE', municipality: 'YOPAL' },
  'arauca': { department: 'ARAUCA', municipality: 'ARAUCA' },
  'san jacinto': { department: 'BOLÍVAR', municipality: 'SAN JACINTO' },
  'raquira': { department: 'BOYACÁ', municipality: 'RÁQUIRA' },
  'ráquira': { department: 'BOYACÁ', municipality: 'RÁQUIRA' },
  'la chamba': { department: 'TOLIMA', municipality: 'GUAMO' },
  'guamo': { department: 'TOLIMA', municipality: 'GUAMO' },
  'sampues': { department: 'SUCRE', municipality: 'SAMPUÉS' },
  'sampués': { department: 'SUCRE', municipality: 'SAMPUÉS' },
  'mompos': { department: 'BOLÍVAR', municipality: 'SANTA CRUZ DE MOMPOX' },
  'mompox': { department: 'BOLÍVAR', municipality: 'SANTA CRUZ DE MOMPOX' },
  'barichara': { department: 'SANTANDER', municipality: 'BARICHARA' },
  'guatape': { department: 'ANTIOQUIA', municipality: 'GUATAPÉ' },
  'guatapé': { department: 'ANTIOQUIA', municipality: 'GUATAPÉ' },
  'salento': { department: 'QUINDÍO', municipality: 'SALENTO' },
  'silvia': { department: 'CAUCA', municipality: 'SILVIA' },
  'nobsa': { department: 'BOYACÁ', municipality: 'NOBSA' },
  'filandia': { department: 'QUINDÍO', municipality: 'FILANDIA' },
  'zipaquira': { department: 'CUNDINAMARCA', municipality: 'ZIPAQUIRÁ' },
  'zipaquirá': { department: 'CUNDINAMARCA', municipality: 'ZIPAQUIRÁ' },
  'villa de leyva': { department: 'BOYACÁ', municipality: 'VILLA DE LEYVA' },
};

interface ParsedLocation {
  department: string;
  municipality: string;
  address?: string;
  confidence: 'high' | 'medium' | 'low';
}

function parseRegionString(region: string): ParsedLocation {
  if (!region) {
    return { department: '', municipality: '', confidence: 'low' };
  }

  const normalized = region.toLowerCase().trim();
  
  // Remove "Colombia" suffix
  const withoutCountry = normalized
    .replace(/,?\s*colombia\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Check direct city mapping first
  for (const [city, location] of Object.entries(CITY_TO_DEPARTMENT)) {
    if (withoutCountry.includes(city)) {
      // Check if there's address info
      const addressMatch = withoutCountry.match(/(?:calle|carrera|cra|cr|cl|barrio|br|avenida|av|transversal|diagonal)\s*.+/i);
      return {
        department: location.department,
        municipality: location.municipality,
        address: addressMatch ? addressMatch[0] : undefined,
        confidence: 'high'
      };
    }
  }

  // Split by comma and analyze parts
  const parts = withoutCountry.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  if (parts.length >= 2) {
    // Last part might be department
    const lastPart = parts[parts.length - 1].toLowerCase();
    const department = DEPARTMENT_NORMALIZATION[lastPart];
    
    if (department) {
      // First part(s) might be municipality or municipality + address
      const firstPart = parts[0];
      const addressMatch = firstPart.match(/(?:calle|carrera|cra|cr|cl|barrio|br|avenida|av|transversal|diagonal)\s*.+/i);
      
      return {
        department,
        municipality: firstPart.toUpperCase().replace(/\s+(calle|carrera|cra|cr|cl|barrio|br|avenida|av).+/i, '').trim(),
        address: addressMatch ? addressMatch[0] : (parts.length > 2 ? parts.slice(1, -1).join(', ') : undefined),
        confidence: 'high'
      };
    }
  }

  // Single value - check if it's a known department
  const department = DEPARTMENT_NORMALIZATION[withoutCountry];
  if (department) {
    return { department, municipality: '', confidence: 'medium' };
  }

  // Check if it looks like an address (has street indicators)
  const hasAddressIndicators = /(?:calle|carrera|cra|cr|cl|barrio|br|avenida|av|transversal|diagonal|#|\d{1,5})/i.test(withoutCountry);
  
  if (hasAddressIndicators) {
    return { department: '', municipality: '', address: withoutCountry, confidence: 'low' };
  }

  // Unknown format - try to use as municipality
  return { 
    department: '', 
    municipality: withoutCountry.toUpperCase(), 
    confidence: 'low' 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { dry_run = true, shop_id } = await req.json();

    console.log(`🔄 Starting region normalization (dry_run: ${dry_run})...`);

    // Fetch shops with region but without structured location
    let query = supabase
      .from('artisan_shops')
      .select('id, shop_name, region, department, municipality')
      .not('region', 'is', null);

    if (shop_id) {
      query = query.eq('id', shop_id);
    } else {
      // Only process shops without normalized data
      query = query.or('department.is.null,municipality.is.null');
    }

    const { data: shops, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Error fetching shops: ${fetchError.message}`);
    }

    console.log(`📊 Found ${shops?.length || 0} shops to process`);

    const results = {
      total: shops?.length || 0,
      processed: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const shop of shops || []) {
      try {
        const parsed = parseRegionString(shop.region);
        
        const detail = {
          shop_id: shop.id,
          shop_name: shop.shop_name,
          original_region: shop.region,
          parsed: {
            department: parsed.department,
            municipality: parsed.municipality,
            address: parsed.address,
            confidence: parsed.confidence
          },
          status: 'pending'
        };

        if (!parsed.department && !parsed.municipality) {
          detail.status = 'skipped_no_match';
          results.skipped++;
          results.details.push(detail);
          continue;
        }

        if (!dry_run) {
          // Update the shop with structured location
          const updateData: any = {};
          
          if (parsed.department) {
            updateData.department = parsed.department;
          }
          if (parsed.municipality) {
            updateData.municipality = parsed.municipality;
          }
          
          // Update region to normalized format
          if (parsed.department && parsed.municipality) {
            updateData.region = `${parsed.municipality}, ${parsed.department}`;
          }

          const { error: updateError } = await supabase
            .from('artisan_shops')
            .update(updateData)
            .eq('id', shop.id);

          if (updateError) {
            throw updateError;
          }

          detail.status = 'updated';
          results.updated++;
        } else {
          detail.status = 'would_update';
          results.updated++;
        }

        results.details.push(detail);
        results.processed++;

      } catch (shopError) {
        console.error(`Error processing shop ${shop.id}:`, shopError);
        results.errors++;
        results.details.push({
          shop_id: shop.id,
          shop_name: shop.shop_name,
          original_region: shop.region,
          status: 'error',
          error: shopError.message
        });
      }
    }

    console.log(`✅ Normalization complete:`, {
      total: results.total,
      processed: results.processed,
      updated: results.updated,
      skipped: results.skipped,
      errors: results.errors
    });

    return new Response(JSON.stringify({
      success: true,
      dry_run,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in normalize-shop-regions:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
