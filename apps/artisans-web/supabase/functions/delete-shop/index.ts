import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteShopRequest {
  shopId: string;
  reason: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client for service operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin via direct table query (more reliable than RPC)
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Error checking admin role:", roleError);
      return new Response(
        JSON.stringify({ error: "Error al verificar permisos" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminRole) {
      console.log(`User ${user.id} attempted to delete shop without admin role`);
      return new Response(
        JSON.stringify({ error: "Se requiere rol de administrador" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { shopId, reason }: DeleteShopRequest = await req.json();

    if (!shopId) {
      return new Response(
        JSON.stringify({ error: "shopId es requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reason || reason.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Se requiere una razón de al menos 10 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${user.email} attempting to delete shop ${shopId}`);

    // Get shop details before deletion
    const { data: shop, error: shopError } = await supabaseAdmin
      .from("artisan_shops")
      .select("shop_name, shop_slug, user_id")
      .eq("id", shopId)
      .single();

    if (shopError || !shop) {
      console.error("Shop not found:", shopError);
      return new Response(
        JSON.stringify({ error: "Tienda no encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the action before deletion
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_user_id: user.id,
      action: "delete_shop",
      resource_type: "artisan_shops",
      resource_id: shopId,
      details: {
        shop_name: shop.shop_name,
        shop_slug: shop.shop_slug,
        owner_id: shop.user_id,
        reason: reason,
        deleted_at: new Date().toISOString(),
      },
    });

    // Send notification to shop owner before deletion
    const notificationTitle = "Tu tienda ha sido eliminada";
    const notificationMessage = `Tu tienda "${shop.shop_name}" ha sido eliminada por un administrador. Razón: ${reason}`;
    
    await supabaseAdmin.from("notifications").insert({
      user_id: shop.user_id,
      type: "shop_deleted",
      title: notificationTitle,
      message: notificationMessage,
      metadata: {
        shop_id: shopId,
        shop_name: shop.shop_name,
        reason: reason,
        deleted_by: user.email,
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
            type: 'shop_deleted',
            title: notificationTitle,
            message: notificationMessage,
            actionUrl: '/dashboard'
          })
        }
      );
      const emailResult = await emailResponse.json();
      console.log('[delete-shop] Email notification result:', emailResult);
    } catch (emailError) {
      console.error('[delete-shop] Error sending email notification:', emailError);
      // Don't throw - email failure shouldn't block the deletion
    }

    // Delete the shop (CASCADE will handle products, analytics, etc.)
    const { error: deleteError } = await supabaseAdmin
      .from("artisan_shops")
      .delete()
      .eq("id", shopId);

    if (deleteError) {
      console.error("Error deleting shop:", deleteError);
      return new Response(
        JSON.stringify({ error: "Error al eliminar la tienda", details: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Shop ${shopId} (${shop.shop_name}) deleted successfully by admin ${user.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Tienda "${shop.shop_name}" eliminada correctamente`,
        deleted_shop: {
          id: shopId,
          name: shop.shop_name,
          slug: shop.shop_slug,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
