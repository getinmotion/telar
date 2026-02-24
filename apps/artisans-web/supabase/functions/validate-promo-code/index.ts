import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { code, user_id, user_email, cart_total } = await req.json();
    if (!code || cart_total === undefined) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Código y total del carrito son requeridos"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const upperCode = code.toUpperCase().trim();
    // 1. Check if it's a gift card
    const { data: giftCard, error: gcError } = await supabase.from("gift_cards").select("*").eq("code", upperCode).single();
    if (giftCard && !gcError) {
      // Validate gift card
      if (giftCard.status !== "active") {
        const statusMessages = {
          expired: "Esta gift card ha expirado",
          depleted: "Esta gift card ya fue utilizada completamente",
          blocked: "Esta gift card está bloqueada"
        };
        return new Response(JSON.stringify({
          valid: false,
          error: statusMessages[giftCard.status] || "Gift card no válida"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      // Check expiration
      if (giftCard.expiration_date && new Date(giftCard.expiration_date) < new Date()) {
        return new Response(JSON.stringify({
          valid: false,
          error: "Esta gift card ha expirado"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      const discountAmount = Math.min(cart_total, giftCard.remaining_amount);
      const newTotal = cart_total - discountAmount;
      const remainingAfter = giftCard.remaining_amount - discountAmount;
      return new Response(JSON.stringify({
        valid: true,
        type: "GIFTCARD",
        promo_id: giftCard.id,
        discount_amount: discountAmount,
        new_total: newTotal,
        remaining_balance_after_use: remainingAfter,
        message: `Gift card válida - Saldo disponible: $${giftCard.remaining_amount.toLocaleString()}`
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // 2. Check if it's a coupon
    const { data: coupon, error: couponError } = await supabase.from("coupons").select("*").eq("code", upperCode).eq("is_active", true).single();
    if (!coupon || couponError) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Código inválido o no encontrado"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Validate dates
    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Este cupón aún no está activo"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Este cupón ha expirado"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Validate min order amount
    if (coupon.min_order_amount && cart_total < coupon.min_order_amount) {
      return new Response(JSON.stringify({
        valid: false,
        error: `Monto mínimo de compra: $${coupon.min_order_amount.toLocaleString()}`
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Validate total usage limit
    if (coupon.usage_limit_total && coupon.times_used >= coupon.usage_limit_total) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Este cupón ya alcanzó su límite de usos"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Validate per-user usage limit
    if (coupon.usage_limit_per_user && (user_id || user_email)) {
      const redemptionQuery = supabase.from("coupon_redemptions").select("id", {
        count: "exact"
      }).eq("coupon_id", coupon.id);
      if (user_id) {
        redemptionQuery.eq("user_id", user_id);
      } else if (user_email) {
        redemptionQuery.eq("user_email", user_email);
      }
      const { count } = await redemptionQuery;
      if (count && count >= coupon.usage_limit_per_user) {
        return new Response(JSON.stringify({
          valid: false,
          error: "Ya usaste este cupón el máximo de veces permitido"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
    }
    // Validate conditions_json
    const conditions = coupon.conditions_json || {};
    if (conditions.primera_compra && (user_id || user_email)) {
      const ordersQuery = supabase.from("coupon_redemptions").select("id", {
        count: "exact"
      });
      if (user_id) {
        ordersQuery.eq("user_id", user_id);
      } else if (user_email) {
        ordersQuery.eq("user_email", user_email);
      }
      const { count: orderCount } = await ordersQuery;
      if (orderCount && orderCount > 0) {
        return new Response(JSON.stringify({
          valid: false,
          error: "Este cupón es solo para primera compra"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
    }
    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percent") {
      discountAmount = Math.round(cart_total * (coupon.value / 100));
    } else {
      discountAmount = coupon.value;
    }
    // Apply max discount if exists
    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }
    // Don't exceed cart total
    discountAmount = Math.min(discountAmount, cart_total);
    const newTotal = cart_total - discountAmount;
    const discountText = coupon.type === "percent" ? `${coupon.value}% de descuento` : `$${coupon.value.toLocaleString()} de descuento`;
    return new Response(JSON.stringify({
      valid: true,
      type: "COUPON",
      promo_id: coupon.id,
      discount_amount: discountAmount,
      new_total: newTotal,
      message: `Cupón válido - ${discountText}`,
      coupon_type: coupon.type,
      coupon_value: coupon.value
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return new Response(JSON.stringify({
      valid: false,
      error: "Error al validar el código"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
