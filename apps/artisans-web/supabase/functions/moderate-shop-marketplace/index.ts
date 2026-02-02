import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShopApprovalRequest {
  shopId: string;
  approved: boolean;
  comment?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
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

    const body: ShopApprovalRequest = await req.json();
    const { shopId, approved, comment } = body;

    console.log(`[moderate-shop-marketplace] Setting marketplace_approved=${approved} for shop: ${shopId}`);

    // Get current shop info
    const { data: shop, error: shopError } = await supabase
      .from('artisan_shops')
      .select('*, user_id')
      .eq('id', shopId)
      .single();

    if (shopError || !shop) {
      return new Response(JSON.stringify({ error: "Shop not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const previousApproval = shop.marketplace_approved || false;

    // Update shop marketplace approval
    const { error: updateError } = await supabase
      .from('artisan_shops')
      .update({
        marketplace_approved: approved,
        marketplace_approved_at: approved ? new Date().toISOString() : null,
        marketplace_approved_by: approved ? user.id : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shopId);

    if (updateError) {
      console.error('[moderate-shop-marketplace] Update error:', updateError);
      return new Response(JSON.stringify({ error: "Failed to update shop" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create notification for artisan
    const notificationTitle = approved 
      ? '¡Tu tienda fue aprobada para el Marketplace!'
      : 'Tu tienda fue removida del Marketplace';
    
    const notificationMessage = approved
      ? `Tu tienda "${shop.shop_name}" ahora aparecerá en telar.co y tus productos aprobados serán visibles para todos los compradores.`
      : `Tu tienda "${shop.shop_name}" fue removida del marketplace central. Tus productos seguirán disponibles en tu tienda propia.${comment ? ` Razón: ${comment}` : ''}`;

    await supabase.from('notifications').insert({
      user_id: shop.user_id,
      type: approved ? 'marketplace_approved' : 'marketplace_removed',
      title: notificationTitle,
      message: notificationMessage,
      metadata: {
        shop_id: shopId,
        shop_name: shop.shop_name,
        approved,
        comment,
        moderator_id: user.id,
      },
    });

    // Send email notification based on user preferences
    try {
      const emailResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-notification-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            userId: shop.user_id,
            type: approved ? 'marketplace_approved' : 'marketplace_removed',
            title: notificationTitle,
            message: notificationMessage,
            actionUrl: '/mi-tienda'
          })
        }
      );
      const emailResult = await emailResponse.json();
      console.log('[moderate-shop-marketplace] Email notification result:', emailResult);
    } catch (emailError) {
      console.error('[moderate-shop-marketplace] Error sending email notification:', emailError);
      // Don't throw - email failure shouldn't block the moderation action
    }

    console.log(`[moderate-shop-marketplace] Successfully updated shop ${shopId} marketplace_approved=${approved}`);

    return new Response(JSON.stringify({ 
      success: true,
      previousApproval,
      newApproval: approved,
      message: approved 
        ? 'Tienda aprobada para marketplace' 
        : 'Tienda removida del marketplace'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('[moderate-shop-marketplace] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
