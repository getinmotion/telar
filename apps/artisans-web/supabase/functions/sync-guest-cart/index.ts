import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { user_id, items } = await req.json();
    console.log('Syncing guest cart for user:', user_id);
    console.log('Items to sync:', items.length);
    if (!user_id) {
      return new Response(JSON.stringify({
        error: 'user_id is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({
        error: 'No items to sync'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(items);
    // Step 1: Calculate total price from items
    const totalPrice = items.reduce((sum, item)=>{
      return sum + item.price * item.quantity;
    }, 0);
    // Round to 2 decimal places
    const roundedPrice = Math.round(totalPrice * 100) / 100;
    console.log('Calculated total price:', roundedPrice);
    // Step 2: Create a new cart record with price
    const { data: cartData, error: cartError } = await supabase.from('cart').insert({
      user_id,
      price: roundedPrice
    }).select('id').single();
    if (cartError) {
      console.error('Error creating cart:', cartError);
      return new Response(JSON.stringify({
        error: 'Failed to create cart',
        details: cartError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const cart_id = cartData.id;
    console.log('Created cart with id:', cart_id);
    // Step 2: Create cart_items records with the cart_id
    const cartItems = items.map((item)=>({
        cart_id,
        user_id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        price: item.price
      }));
    const { data: itemsData, error: itemsError } = await supabase.from('cart_items').insert(cartItems).select();
    if (itemsError) {
      console.error('Error creating cart items:', itemsError);
      // Rollback: delete the created cart
      await supabase.from('cart').delete().eq('id', cart_id);
      return new Response(JSON.stringify({
        error: 'Failed to create cart items',
        details: itemsError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('Created cart items:', itemsData?.length);
    return new Response(JSON.stringify({
      success: true,
      cart_id,
      items_created: itemsData?.length || 0
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in sync-guest-cart:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
