import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// telar.ia Supabase credentials
const TELAR_SUPABASE_URL = "https://ylooqmqmoufqtxvetxuj.supabase.co";
const TELAR_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs";

interface ValidatePromoRequest {
  code: string;
  user_id?: string;
  cart_total: number;
}

interface PromoResponse {
  valid: boolean;
  type: 'GIFTCARD' | 'COUPON' | null;
  discount_amount: number;
  new_total: number;
  remaining_balance_after_use?: number;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, user_id, cart_total }: ValidatePromoRequest = await req.json();

    if (!code || cart_total === undefined) {
      return new Response(
        JSON.stringify({ error: "Code and cart_total are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Validating promo code: ${code} for cart total: ${cart_total}`);

    // Create telar.ia client
    const telarClient = createClient(TELAR_SUPABASE_URL, TELAR_SUPABASE_ANON_KEY);

    // Call the validate_promo_code RPC function in telar.ia
    const { data, error } = await telarClient.rpc('validate_promo_code', {
      p_code: code.toUpperCase().trim(),
      p_user_id: user_id || null,
      p_cart_total: cart_total
    });

    if (error) {
      console.error("Error validating promo code:", error);
      return new Response(
        JSON.stringify({ 
          valid: false,
          type: null,
          discount_amount: 0,
          new_total: cart_total,
          message: "Código no válido o expirado"
        } as PromoResponse),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Promo validation response:", data);

    const response: PromoResponse = {
      valid: data?.valid ?? false,
      type: data?.type ?? null,
      discount_amount: data?.discount_amount ?? 0,
      new_total: data?.new_total ?? cart_total,
      remaining_balance_after_use: data?.remaining_balance_after_use,
      message: data?.message ?? "Código aplicado exitosamente"
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in validate-promo-code:", error);
    return new Response(
      JSON.stringify({ 
        valid: false,
        type: null,
        discount_amount: 0,
        new_total: 0,
        message: "Error al validar el código"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
