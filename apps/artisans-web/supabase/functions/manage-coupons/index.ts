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
    const { action, data } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case "list": {
        const { data: coupons, error } = await supabase
          .from("coupons")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, coupons }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create": {
        const {
          code,
          type,
          value,
          description,
          is_public,
          start_date,
          end_date,
          min_order_amount,
          max_discount_amount,
          usage_limit_total,
          usage_limit_per_user,
          conditions_json,
          created_by_admin_id,
        } = data;

        if (!code || !type || !value) {
          return new Response(
            JSON.stringify({ success: false, error: "Código, tipo y valor son requeridos" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: newCoupon, error } = await supabase
          .from("coupons")
          .insert({
            code: code.toUpperCase().trim(),
            type,
            value,
            description,
            is_public: is_public || false,
            is_active: true,
            start_date,
            end_date,
            min_order_amount,
            max_discount_amount,
            usage_limit_total,
            usage_limit_per_user,
            conditions_json: conditions_json || {},
            created_by_admin_id,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            return new Response(
              JSON.stringify({ success: false, error: "Ya existe un cupón con ese código" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          throw error;
        }

        console.log(`✅ Coupon created: ${code}`);

        return new Response(
          JSON.stringify({ success: true, coupon: newCoupon }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update": {
        const { id, ...updateData } = data;

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "ID del cupón requerido" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (updateData.code) {
          updateData.code = updateData.code.toUpperCase().trim();
        }

        const { data: updated, error } = await supabase
          .from("coupons")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        console.log(`✅ Coupon updated: ${id}`);

        return new Response(
          JSON.stringify({ success: true, coupon: updated }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "deactivate": {
        const { id } = data;

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "ID del cupón requerido" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("coupons")
          .update({ is_active: false })
          .eq("id", id);

        if (error) throw error;

        console.log(`✅ Coupon deactivated: ${id}`);

        return new Response(
          JSON.stringify({ success: true, message: "Cupón desactivado" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_redemptions": {
        const { coupon_id } = data;

        const { data: redemptions, error } = await supabase
          .from("coupon_redemptions")
          .select("*")
          .eq("coupon_id", coupon_id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, redemptions }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Acción no válida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("Error in manage-coupons:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
