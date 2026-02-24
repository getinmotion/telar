import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const PAYMENT_API_KEY = Deno.env.get('PAYMENT_API_KEY');
const PAYMENT_API_SECRET = Deno.env.get('PAYMENT_API_SECRET');
const COBRE_API_BASE_URL = Deno.env.get('PAYMENT_API_URL') || 'https://api.cobre.co';
const COBRE_BALANCE_ID = Deno.env.get('PAYMENT_COBRE_BALANCE');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
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

    // Check if user is admin
    const { data: isAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .eq('is_active', true)
      .maybeSingle();

    if (!isAdmin) {
      console.error('User is not admin');
      return new Response(JSON.stringify({ error: 'No tienes permisos para ver el balance' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate environment variables
    if (!PAYMENT_API_KEY || !PAYMENT_API_SECRET) {
      console.error('Missing Cobre environment variables');
      return new Response(JSON.stringify({ 
        error: 'Error de configuración',
        message: 'Variables de entorno de Cobre no configuradas'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!COBRE_BALANCE_ID) {
      console.error('Missing PAYMENT_COBRE_BALANCE');
      return new Response(JSON.stringify({ 
        error: 'Error de configuración',
        message: 'ID de balance de Cobre no configurado'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔐 Authenticating with Cobre API...');

    // Authenticate with Cobre API (fresh token each time)
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

    // Get account data from Cobre API
    console.log('💰 Fetching account:', COBRE_BALANCE_ID);
    const accountResponse = await fetch(`${COBRE_API_BASE_URL}/v1/accounts/${COBRE_BALANCE_ID}?sensitive_data=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cobreToken}`
      }
    });

    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      console.error('Cobre Account Error:', errorText);
      return new Response(JSON.stringify({
        error: 'Error al obtener cuenta de Cobre',
        details: errorText
      }), {
        status: accountResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const accountData = await accountResponse.json();
    console.log('✅ Account data retrieved:', JSON.stringify(accountData));

    // Parse account data - Cobre uses cents (divide by 100)
    // Cobre API returns 'obtained_balance' as the main balance field
    const available = (accountData.obtained_balance || accountData.balance || accountData.available || 0) / 100;
    const pending = (accountData.pending_balance || accountData.pending || 0) / 100;
    const currency = accountData.currency || 'COP';

    return new Response(JSON.stringify({
      success: true,
      balance: {
        available,
        pending,
        currency,
        lastUpdated: new Date().toISOString(),
        raw: accountData // Include raw for debugging
      }
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
