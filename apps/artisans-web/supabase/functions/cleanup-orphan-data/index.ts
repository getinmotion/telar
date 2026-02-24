import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧹 Starting orphan data cleanup...');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Authenticated user: ${user.email}`);

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('email, is_active')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminData) {
      console.error('❌ Admin verification failed:', adminError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Admin verified: ${adminData.email}`);

    // Step 1: Find all valid user IDs from auth.users
    console.log('📊 Finding valid user IDs...');
    const { data: validUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    const validUserIds = validUsers.users.map(u => u.id);
    console.log(`✅ Found ${validUserIds.length} valid users`);

    // Step 2: Find orphan shops (shops whose user_id is not in valid users)
    console.log('🔍 Finding orphan shops...');
    const { data: allShops, error: shopsError } = await supabaseAdmin
      .from('artisan_shops')
      .select('id, user_id, shop_name');

    if (shopsError) {
      console.error('❌ Error fetching shops:', shopsError);
      throw shopsError;
    }

    const orphanShops = allShops?.filter(shop => !validUserIds.includes(shop.user_id)) || [];
    const orphanShopIds = orphanShops.map(s => s.id);
    
    console.log(`🗑️ Found ${orphanShops.length} orphan shops to delete`);

    if (orphanShops.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No orphan data found',
          orphan_shops_deleted: 0,
          orphan_products_deleted: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Count orphan products before deletion
    console.log('📊 Counting orphan products...');
    const { count: orphanProductCount, error: countError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .in('shop_id', orphanShopIds);

    if (countError) {
      console.error('⚠️ Warning: Could not count orphan products:', countError);
    }

    console.log(`🗑️ Found ${orphanProductCount || 0} orphan products to delete`);

    // Step 4: Delete orphan products
    console.log('🧹 Deleting orphan products...');
    const { error: productsDeleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .in('shop_id', orphanShopIds);

    if (productsDeleteError) {
      console.error('❌ Error deleting orphan products:', productsDeleteError);
      throw productsDeleteError;
    }

    console.log(`✅ Deleted ${orphanProductCount || 0} orphan products`);

    // Step 5: Delete other related orphan data
    console.log('🧹 Deleting related orphan data...');
    
    // Delete orphan cart items
    const { error: cartError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .in('product_id', orphanShopIds); // This will cascade from products

    if (cartError) {
      console.warn('⚠️ Warning: Could not delete orphan cart items:', cartError);
    }

    // Delete orphan analytics
    const { error: analyticsError } = await supabaseAdmin
      .from('artisan_analytics')
      .delete()
      .in('shop_id', orphanShopIds);

    if (analyticsError) {
      console.warn('⚠️ Warning: Could not delete orphan analytics:', analyticsError);
    }

    // Delete orphan store embeddings
    const { error: embeddingsError } = await supabaseAdmin
      .from('store_embeddings')
      .delete()
      .in('shop_id', orphanShopIds);

    if (embeddingsError) {
      console.warn('⚠️ Warning: Could not delete orphan embeddings:', embeddingsError);
    }

    // Step 6: Delete orphan shops
    console.log('🧹 Deleting orphan shops...');
    const { error: shopsDeleteError } = await supabaseAdmin
      .from('artisan_shops')
      .delete()
      .in('id', orphanShopIds);

    if (shopsDeleteError) {
      console.error('❌ Error deleting orphan shops:', shopsDeleteError);
      throw shopsDeleteError;
    }

    console.log(`✅ Deleted ${orphanShops.length} orphan shops`);

    const response = {
      success: true,
      message: 'Orphan data cleanup completed successfully',
      orphan_shops_deleted: orphanShops.length,
      orphan_products_deleted: orphanProductCount || 0,
      deleted_shop_names: orphanShops.slice(0, 10).map(s => s.shop_name), // First 10 for reference
      total_valid_users: validUserIds.length
    };

    console.log('✅ Cleanup completed:', response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('❌ Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
