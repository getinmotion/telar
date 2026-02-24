import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Connect to telar.ia database
    const supabaseUrl = 'https://ylooqmqmoufqtxvetxuj.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs';
    
    const telarSupabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking telar.ia database structure...');

    const results: any = {
      products: null,
      artisan_shops: null,
      product_variants: null,
      product_reviews: null,
      user_profiles: null,
      cart_items: null,
      wishlist: null,
      favorites: null,
    };

    // Check products table - get 3 samples to see all fields
    const { data: productsData, error: productsError } = await telarSupabase
      .from('products')
      .select('*')
      .limit(3);
    
    results.products = {
      exists: !productsError,
      samples: productsData || [],
      fields: productsData && productsData.length > 0 ? Object.keys(productsData[0]) : [],
      error: productsError?.message || null
    };

    // Check artisan_shops table - get 3 samples to see all fields
    const { data: shopsData, error: shopsError } = await telarSupabase
      .from('artisan_shops')
      .select('*')
      .limit(3);
    
    results.artisan_shops = {
      exists: !shopsError,
      samples: shopsData || [],
      fields: shopsData && shopsData.length > 0 ? Object.keys(shopsData[0]) : [],
      error: shopsError?.message || null
    };

    // Check product_variants table
    const { data: variantsData, error: variantsError } = await telarSupabase
      .from('product_variants')
      .select('*')
      .limit(1);
    
    results.product_variants = {
      exists: !variantsError,
      sample: variantsData?.[0] || null,
      error: variantsError?.message || null
    };

    // Check product_reviews table
    const { data: reviewsData, error: reviewsError } = await telarSupabase
      .from('product_reviews')
      .select('*')
      .limit(1);
    
    results.product_reviews = {
      exists: !reviewsError,
      sample: reviewsData?.[0] || null,
      error: reviewsError?.message || null
    };

    // Check user_profiles table
    const { data: profilesData, error: profilesError } = await telarSupabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    results.user_profiles = {
      exists: !profilesError,
      sample: profilesData?.[0] || null,
      error: profilesError?.message || null
    };

    // Check cart_items table
    const { data: cartData, error: cartError } = await telarSupabase
      .from('cart_items')
      .select('*')
      .limit(1);
    
    results.cart_items = {
      exists: !cartError,
      sample: cartData?.[0] || null,
      error: cartError?.message || null
    };

    // Check wishlist table
    const { data: wishlistData, error: wishlistError } = await telarSupabase
      .from('wishlist')
      .select('*')
      .limit(1);
    
    results.wishlist = {
      exists: !wishlistError,
      sample: wishlistData?.[0] || null,
      error: wishlistError?.message || null
    };

    // Check favorites table (alternative name)
    const { data: favoritesData, error: favoritesError } = await telarSupabase
      .from('favorites')
      .select('*')
      .limit(1);
    
    results.favorites = {
      exists: !favoritesError,
      sample: favoritesData?.[0] || null,
      error: favoritesError?.message || null
    };

    console.log('Database structure check complete:', results);

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking database structure:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
