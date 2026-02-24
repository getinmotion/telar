import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const PAYMENT_API_KEY = Deno.env.get('PAYMENT_API_KEY');
const PAYMENT_API_SECRET = Deno.env.get('PAYMENT_API_SECRET');
const COBRE_API_BASE_URL = Deno.env.get('PAYMENT_API_URL') || 'https://api.cobre.co';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client for user auth verification
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Service client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📝 User authenticated:', user.email);

    // Check if user is admin or moderator
    const { data: isAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .eq('is_active', true)
      .maybeSingle();

    const { data: isModerator } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'moderator')
      .maybeSingle();

    if (!isAdmin && !isModerator) {
      console.error('User is not admin or moderator');
      return new Response(JSON.stringify({ error: 'No tienes permisos para realizar esta acción' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ User authorized as admin/moderator');

    // Validate environment variables
    if (!PAYMENT_API_KEY || !PAYMENT_API_SECRET || !COBRE_API_BASE_URL) {
      console.error('Missing Cobre environment variables');
      return new Response(JSON.stringify({ 
        error: 'Error de configuración',
        message: 'Variables de entorno de Cobre no configuradas'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const { shopId, bankData } = await req.json();

    if (!shopId || !bankData) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos (shopId, bankData)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate bank data fields
    const { holder_name, document_type, document_number, bank_code, account_type, account_number } = bankData;
    if (!holder_name || !document_type || !document_number || !bank_code || !account_type || !account_number) {
      return new Response(JSON.stringify({ error: 'Todos los campos bancarios son requeridos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify shop exists and doesn't already have counterparty
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('artisan_shops')
      .select('id, shop_name, id_contraparty, user_id')
      .eq('id', shopId)
      .maybeSingle();

    if (shopError || !shop) {
      console.error('Shop not found:', shopError);
      return new Response(JSON.stringify({ error: 'Tienda no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (shop.id_contraparty) {
      return new Response(JSON.stringify({ error: 'La tienda ya tiene datos bancarios configurados' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📤 Creating counterparty for shop:', shop.shop_name);

    // Authenticate with Cobre API
    const authResponse = await fetch(`${COBRE_API_BASE_URL}/v1/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        user_id: PAYMENT_API_KEY,
        secret: PAYMENT_API_SECRET
      })
    });

    const authData = await authResponse.json();
    if (!authResponse.ok || !authData.access_token) {
      console.error('Cobre Auth Error:', authData);
      return new Response(JSON.stringify({
        error: 'Error de autenticación con Cobre',
        details: authData
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const cobreToken = authData.access_token;
    console.log('✅ Cobre authentication successful');

    // Create counterparty in Cobre
    const cobreResponse = await fetch(`${COBRE_API_BASE_URL}/v1/counterparties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cobreToken}`
      },
      body: JSON.stringify({
        geo: 'col',
        type: 'payee',
        alias: holder_name,
        metadata: {
          counterparty_fullname: holder_name,
          counterparty_id_type: document_type,
          counterparty_id_number: document_number,
          beneficiary_institution: bank_code,
          registered_account: account_type,
          account_number: account_number
        }
      })
    });

    if (!cobreResponse.ok) {
      const errorText = await cobreResponse.text();
      console.error('Cobre API error:', errorText);
      return new Response(JSON.stringify({
        error: 'Error al crear contraparty en Cobre',
        details: errorText
      }), {
        status: cobreResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const cobreData = await cobreResponse.json();
    const idContraparty = cobreData.id || cobreData.counterparty_id;
    console.log('✅ Counterparty created:', idContraparty);

    // Update artisan_shops with id_contraparty
    const { error: updateError } = await supabaseAdmin
      .from('artisan_shops')
      .update({ 
        id_contraparty: idContraparty,
        bank_data_status: 'complete'
      })
      .eq('id', shopId);

    if (updateError) {
      console.error('Error updating shop:', updateError);
      return new Response(JSON.stringify({
        error: 'Error al actualizar la tienda',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: user.id,
      action: 'create_bank_data',
      resource_type: 'artisan_shop',
      resource_id: shopId,
      details: {
        shop_name: shop.shop_name,
        artisan_user_id: shop.user_id,
        id_contraparty: idContraparty,
        created_by_moderator: true
      }
    });

    console.log('✅ Bank data created successfully for shop:', shopId);

    return new Response(JSON.stringify({
      success: true,
      id_contraparty: idContraparty,
      message: 'Datos bancarios creados exitosamente'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Edge Function Error:', errorMessage);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor',
      message: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
