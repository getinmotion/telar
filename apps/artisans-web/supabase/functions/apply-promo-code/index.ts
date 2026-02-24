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
    const { code, user_id, user_email, order_id, cart_total } = await req.json();

    if (!code || !order_id || cart_total === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: "Código, order_id y cart_total son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const upperCode = code.toUpperCase().trim();

    // 1. Check if it's a gift card
    const { data: giftCard, error: gcError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("code", upperCode)
      .single();

    if (giftCard && !gcError) {
      // Re-validate gift card
      if (giftCard.status !== "active") {
        return new Response(
          JSON.stringify({ success: false, error: "Gift card no válida o ya fue utilizada" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (giftCard.expiration_date && new Date(giftCard.expiration_date) < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: "Gift card expirada" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (giftCard.remaining_amount <= 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Gift card sin saldo disponible" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const discountAmount = Math.min(cart_total, giftCard.remaining_amount);
      const newRemainingAmount = giftCard.remaining_amount - discountAmount;
      const newStatus = newRemainingAmount === 0 ? "depleted" : "active";

      // Update gift card balance
      const { error: updateError } = await supabase
        .from("gift_cards")
        .update({ 
          remaining_amount: newRemainingAmount,
          status: newStatus 
        })
        .eq("id", giftCard.id);

      if (updateError) {
        console.error("Error updating gift card:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Error al actualizar gift card" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Record transaction
      const { error: txError } = await supabase
        .from("gift_card_transactions")
        .insert({
          gift_card_id: giftCard.id,
          order_id: order_id,
          amount_used: discountAmount,
        });

      if (txError) {
        console.error("Error recording gift card transaction:", txError);
      }

      console.log(`✅ Gift card ${upperCode} applied: $${discountAmount} to order ${order_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          type: "GIFTCARD",
          discount_applied: discountAmount,
          new_total: cart_total - discountAmount,
          remaining_balance: newRemainingAmount,
          message: "Gift card aplicada exitosamente",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check if it's a coupon
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", upperCode)
      .single();

    if (!coupon || couponError) {
      return new Response(
        JSON.stringify({ success: false, error: "Código inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Full re-validation of coupon
    if (!coupon.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupón inactivo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupón aún no está vigente" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupón expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (coupon.min_order_amount && cart_total < coupon.min_order_amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Monto mínimo de orden: $${coupon.min_order_amount.toLocaleString()}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (coupon.usage_limit_total && coupon.times_used >= coupon.usage_limit_total) {
      return new Response(
        JSON.stringify({ success: false, error: "Cupón ha alcanzado el límite de usos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check per-user limit
    if (coupon.usage_limit_per_user && (user_id || user_email)) {
      const { count: userRedemptions } = await supabase
        .from("coupon_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)
        .or(user_id ? `user_id.eq.${user_id}` : `user_email.eq.${user_email}`);

      if (userRedemptions && userRedemptions >= coupon.usage_limit_per_user) {
        return new Response(
          JSON.stringify({ success: false, error: "Ya has usado este cupón el máximo de veces permitido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate conditions_json
    const conditions = coupon.conditions_json || {};
    
    if (conditions.primera_compra && (user_id || user_email)) {
      const { count: previousRedemptions } = await supabase
        .from("coupon_redemptions")
        .select("*", { count: "exact", head: true })
        .or(user_id ? `user_id.eq.${user_id}` : `user_email.eq.${user_email}`);

      if (previousRedemptions && previousRedemptions > 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Este cupón es solo para primera compra" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percent") {
      discountAmount = Math.round(cart_total * (coupon.value / 100));
    } else {
      discountAmount = coupon.value;
    }

    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }
    discountAmount = Math.min(discountAmount, cart_total);

    // Increment times_used
    const { error: updateError } = await supabase
      .from("coupons")
      .update({ times_used: (coupon.times_used || 0) + 1 })
      .eq("id", coupon.id);

    if (updateError) {
      console.error("Error updating coupon:", updateError);
    }

    // Record redemption
    const { error: redemptionError } = await supabase
      .from("coupon_redemptions")
      .insert({
        coupon_id: coupon.id,
        user_id: user_id || null,
        user_email: user_email || null,
        order_id: order_id,
        amount_discounted: discountAmount,
      });

    if (redemptionError) {
      console.error("Error recording coupon redemption:", redemptionError);
    }

    console.log(`✅ Coupon ${upperCode} applied: $${discountAmount} to order ${order_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        type: "COUPON",
        discount_applied: discountAmount,
        new_total: cart_total - discountAmount,
        message: "Cupón aplicado exitosamente",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error applying promo code:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error al aplicar el código" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
