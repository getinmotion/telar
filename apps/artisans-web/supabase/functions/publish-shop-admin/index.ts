import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user and get their info
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin or moderator
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "moderator"]);

    const isModeratorOrAdmin = roleData && roleData.length > 0;

    if (!isModeratorOrAdmin) {
      // Also check admin_users table
      const { data: adminData } = await supabaseClient
        .from("admin_users")
        .select("id")
        .eq("email", user.email)
        .eq("is_active", true)
        .single();

      if (!adminData) {
        return new Response(
          JSON.stringify({ success: false, error: "No tienes permisos de moderador" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { shopId, action, comment } = await req.json();

    if (!shopId || !action) {
      return new Response(
        JSON.stringify({ success: false, error: "Parámetros inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action !== "publish" && action !== "unpublish") {
      return new Response(
        JSON.stringify({ success: false, error: "Acción inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get shop data
    const { data: shop, error: shopError } = await supabaseAdmin
      .from("artisan_shops")
      .select("id, shop_name, user_id, publish_status")
      .eq("id", shopId)
      .single();

    if (shopError || !shop) {
      console.error("Shop fetch error:", shopError);
      return new Response(
        JSON.stringify({ success: false, error: "Tienda no encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For publishing, verify shop has at least one approved product
    if (action === "publish") {
      const { data: approvedProducts, error: productsError } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("shop_id", shopId)
        .in("moderation_status", ["approved", "approved_with_edits"]);

      if (productsError) {
        console.error("Products fetch error:", productsError);
        return new Response(
          JSON.stringify({ success: false, error: "Error al verificar productos" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!approvedProducts || approvedProducts.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "La tienda debe tener al menos un producto aprobado para ser publicada" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update shop publish status
    const newStatus = action === "publish" ? "published" : "pending_publish";
    const newActive = action === "publish";

    const { error: updateError } = await supabaseAdmin
      .from("artisan_shops")
      .update({
        publish_status: newStatus,
        active: newActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shopId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Error al actualizar tienda" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log to admin_audit_log
    await supabaseAdmin
      .from("admin_audit_log")
      .insert({
        admin_user_id: user.id,
        action: action === "publish" ? "shop_published" : "shop_unpublished",
        resource_type: "shop",
        resource_id: shopId,
        details: {
          shop_name: shop.shop_name,
          previous_status: shop.publish_status,
          new_status: newStatus,
          comment: comment || null,
        },
      });

    // Create notification for artisan
    const notificationMessage = action === "publish"
      ? `¡Tu tienda "${shop.shop_name}" ha sido publicada y ya está visible!`
      : `Tu tienda "${shop.shop_name}" ha sido despublicada.`;

    await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: shop.user_id,
        type: "shop_status",
        title: action === "publish" ? "Tienda Publicada" : "Tienda Despublicada",
        message: notificationMessage,
        metadata: {
          shop_id: shopId,
          action,
          comment: comment || null,
        },
      });

    console.log(`Shop ${shopId} ${action}ed by moderator ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: action === "publish" 
          ? "Tienda publicada correctamente" 
          : "Tienda despublicada correctamente",
        publish_status: newStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
