import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is moderator or admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'moderator']);

    let isAuthorized = roles && roles.length > 0;

    if (!isAuthorized) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', user.email)
        .eq('is_active', true)
        .maybeSingle();
      
      isAuthorized = !!adminUser;
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized - not a moderator" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse query params
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'products';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const offset = (page - 1) * pageSize;

    // If requesting shops, return shop data
    if (type === 'shops') {
      const filter = url.searchParams.get('filter') || 'all';
      const search = url.searchParams.get('search') || '';
      const hasBankData = url.searchParams.get('hasBankData') || 'all';
      const minApprovedProducts = url.searchParams.get('minApprovedProducts') || 'all';
      const region = url.searchParams.get('region') || '';
      const craftType = url.searchParams.get('craftType') || '';

      // Get available regions and craft types for filters
      const { data: allShopsForFilters } = await supabase
        .from('artisan_shops')
        .select('region, craft_type');

      const availableRegions = [...new Set(allShopsForFilters?.map(s => s.region).filter(Boolean) || [])].sort();
      const availableCraftTypes = [...new Set(allShopsForFilters?.map(s => s.craft_type).filter(Boolean) || [])].sort();

      // Build base query for shops with bank data info
      let shopsQuery = supabase
        .from('artisan_shops')
        .select(`
          id,
          shop_name,
          shop_slug,
          logo_url,
          banner_url,
          description,
          region,
          craft_type,
          marketplace_approved,
          marketplace_approved_at,
          marketplace_approved_by,
          created_at,
          user_id,
          id_contraparty,
          contact_info
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply marketplace filter
      if (filter === 'approved') {
        shopsQuery = shopsQuery.eq('marketplace_approved', true);
      } else if (filter === 'not_approved') {
        shopsQuery = shopsQuery.or('marketplace_approved.is.null,marketplace_approved.eq.false');
      }

      // Apply search
      if (search.trim()) {
        shopsQuery = shopsQuery.ilike('shop_name', `%${search}%`);
      }

      // Apply region filter
      if (region && region !== 'all') {
        shopsQuery = shopsQuery.eq('region', region);
      }

      // Apply craft type filter
      if (craftType && craftType !== 'all') {
        shopsQuery = shopsQuery.eq('craft_type', craftType);
      }

      // Apply bank data filter
      if (hasBankData === 'yes') {
        shopsQuery = shopsQuery.not('id_contraparty', 'is', null);
      } else if (hasBankData === 'no') {
        shopsQuery = shopsQuery.is('id_contraparty', null);
      }

      // Apply pagination
      shopsQuery = shopsQuery.range(offset, offset + pageSize - 1);

      const { data: shops, error: shopsError, count } = await shopsQuery;

      if (shopsError) {
        console.error('[get-moderation-queue] Shops error:', shopsError);
        return new Response(JSON.stringify({ error: "Failed to fetch shops" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Apply minApprovedProducts filter (post-fetch since it requires product counts)
      let filteredShops = shops || [];
      
      if (minApprovedProducts !== 'all') {
        // Get product counts for these shops
        const shopIds = filteredShops.map(s => s.id);
        const { data: products } = await supabase
          .from('products')
          .select('shop_id, moderation_status')
          .in('shop_id', shopIds)
          .in('moderation_status', ['approved', 'approved_with_edits']);

        const productCountsMap = new Map<string, number>();
        products?.forEach(p => {
          productCountsMap.set(p.shop_id, (productCountsMap.get(p.shop_id) || 0) + 1);
        });

        const minCount = minApprovedProducts === '0' ? 0 : 
                        minApprovedProducts === '1' ? 1 : 
                        minApprovedProducts === '5' ? 5 : 0;

        if (minApprovedProducts === '0') {
          filteredShops = filteredShops.filter(s => (productCountsMap.get(s.id) || 0) === 0);
        } else {
          filteredShops = filteredShops.filter(s => (productCountsMap.get(s.id) || 0) >= minCount);
        }
      }

      // Get counts for all filters
      const { data: allShops } = await supabase
        .from('artisan_shops')
        .select('id, marketplace_approved');

      const shopCounts = {
        all: allShops?.length || 0,
        approved: allShops?.filter(s => s.marketplace_approved === true).length || 0,
        not_approved: allShops?.filter(s => !s.marketplace_approved).length || 0,
      };

      const totalItems = count || filteredShops.length;
      const totalPages = Math.ceil(totalItems / pageSize);

      console.log(`[get-moderation-queue] Found ${filteredShops.length} shops (page ${page}/${totalPages})`);

      return new Response(
        JSON.stringify({
          shops: filteredShops,
          counts: shopCounts,
          page,
          pageSize,
          total: totalItems,
          totalPages,
          availableRegions,
          availableCraftTypes,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Otherwise, return products (existing logic)
    const status = url.searchParams.get('status') || 'pending_moderation';
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const region = url.searchParams.get('region') || '';
    const onlyNonMarketplace = url.searchParams.get('only_non_marketplace') === 'true';

    console.log(`[get-moderation-queue] Fetching products with status: ${status}, page: ${page}, pageSize: ${pageSize}`);

    // Build query
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        short_description,
        price,
        compare_price,
        category,
        subcategory,
        images,
        tags,
        materials,
        techniques,
        inventory,
        sku,
        moderation_status,
        active,
        created_at,
        updated_at,
        weight,
        dimensions,
        shipping_data_complete,
        artisan_shops!inner (
          id,
          shop_name,
          shop_slug,
          user_id,
          region,
          craft_type,
          logo_url,
          marketplace_approved
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by status
    if (status !== 'all') {
      query = query.eq('moderation_status', status);
    }

    // Filter by search (product name only - PostgREST doesn't support related tables in .or())
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter by region
    if (region) {
      query = query.eq('artisan_shops.region', region);
    }

    // Filter by non-marketplace approved shops
    if (onlyNonMarketplace) {
      query = query.eq('artisan_shops.marketplace_approved', false);
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: products, error: productsError, count } = await query;

    if (productsError) {
      console.error('[get-moderation-queue] Error:', productsError);
      return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get counts by status
    const { data: statusCounts } = await supabase
      .from('products')
      .select('moderation_status')
      .not('moderation_status', 'is', null);

    const counts: Record<string, number> = {
      pending_moderation: 0,
      approved: 0,
      approved_with_edits: 0,
      changes_requested: 0,
      rejected: 0,
      draft: 0,
    };

    statusCounts?.forEach((item: any) => {
      if (item.moderation_status && counts.hasOwnProperty(item.moderation_status)) {
        counts[item.moderation_status]++;
      }
    });

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    console.log(`[get-moderation-queue] Found ${products?.length || 0} products (page ${page}/${totalPages})`);

    return new Response(JSON.stringify({ 
      products: products || [],
      counts,
      page,
      pageSize,
      total: totalItems,
      totalPages,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('[get-moderation-queue] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
