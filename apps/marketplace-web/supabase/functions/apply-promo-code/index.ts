import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// telar.ia Supabase credentials
const TELAR_SUPABASE_URL = "https://ylooqmqmoufqtxvetxuj.supabase.co";
const TELAR_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs";

interface ApplyPromoRequest {
  code: string;
  user_id: string;
  order_id: string;
  cart_total: number;
}

interface ApplyPromoResponse {
  success: boolean;
  final_total: number;
  discount_applied: number;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, user_id, order_id, cart_total }: ApplyPromoRequest = await req.json();

    if (!code || !order_id || cart_total === undefined) {
      return new Response(
        JSON.stringify({ error: "Code, order_id, and cart_total are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Applying promo code: ${code} to order: ${order_id}`);

    // Create telar.ia client
    const telarClient = createClient(TELAR_SUPABASE_URL, TELAR_SUPABASE_ANON_KEY);

    // Call the apply_promo_code_to_order RPC function in telar.ia
    const { data, error } = await telarClient.rpc('apply_promo_code_to_order', {
      p_code: code.toUpperCase().trim(),
      p_user_id: user_id || null,
      p_order_id: order_id,
      p_cart_total: cart_total
    });

    if (error) {
      console.error("Error applying promo code:", error);
      return new Response(
        JSON.stringify({ 
          success: false,
          final_total: cart_total,
          discount_applied: 0,
          message: "Error al aplicar el código"
        } as ApplyPromoResponse),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Apply promo response:", data);

    const response: ApplyPromoResponse = {
      success: data?.success ?? false,
      final_total: data?.final_total ?? cart_total,
      discount_applied: data?.discount_applied ?? 0,
      message: data?.message ?? "Código aplicado"
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in apply-promo-code:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        final_total: 0,
        discount_applied: 0,
        message: "Error al aplicar el código"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
