import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { shopId?: string };
    const shopId = body.shopId;

    if (!shopId) {
      return new Response(
        JSON.stringify({ error: 'shopId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the caller owns this shop
    const appUrl = Deno.env.get('SUPABASE_URL');
    const appAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const appServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!appUrl || !appAnonKey) {
      console.error('Missing SUPABASE_URL / SUPABASE_ANON_KEY');
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const appClient = createClient(appUrl, appAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await appClient.auth.getUser();
    const userId = userData?.user?.id;

    if (userError || !userId) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to bypass RLS
    const serviceClient = createClient(appUrl, appServiceKey || appAnonKey, {
      auth: { persistSession: false },
    });

    const { data: ownedShop, error: shopError } = await serviceClient
      .from('artisan_shops')
      .select('id, user_id')
      .eq('id', shopId)
      .maybeSingle();

    if (shopError) {
      console.error('Error verifying shop ownership:', shopError);
      return new Response(
        JSON.stringify({ error: 'Could not verify shop access' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ownedShop || ownedShop.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching orders for shopId=${shopId} userId=${userId}`);

    // STRATEGY: Query local orders table directly using shop_id
    // The orders table has a shop_id column that references artisan_shops
    const { data: orders, error: ordersError } = await serviceClient
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return new Response(
        JSON.stringify({ error: ordersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${orders?.length || 0} orders for shop ${shopId}`);

    return new Response(
      JSON.stringify({ orders: orders || [], meta: { filterColumn: 'shop_id' } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-shop-orders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
