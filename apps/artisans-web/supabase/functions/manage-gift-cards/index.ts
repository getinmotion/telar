import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GC-";
  for (let i = 0; i < 3; i++) {
    if (i > 0) code += "-";
    for (let j = 0; j < 4; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

    switch (action) {
      case "list": {
        const { status } = params;
        let query = supabase
          .from("gift_cards")
          .select("*")
          .order("created_at", { ascending: false });

        if (status) {
          query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create": {
        const { amount, purchaser_email, recipient_email, message, expiration_days } = params;

        if (!amount || !purchaser_email) {
          return new Response(
            JSON.stringify({ success: false, error: "Monto y email del comprador son requeridos" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let code = generateGiftCardCode();
        let attempts = 0;
        while (attempts < 10) {
          const { data: existing } = await supabase
            .from("gift_cards")
            .select("id")
            .eq("code", code)
            .single();

          if (!existing) break;
          code = generateGiftCardCode();
          attempts++;
        }

        const expirationDate = expiration_days
          ? new Date(Date.now() + expiration_days * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const { data, error } = await supabase
          .from("gift_cards")
          .insert({
            code,
            initial_amount: amount,
            remaining_amount: amount,
            purchaser_email,
            recipient_email: recipient_email || null,
            message: message || null,
            expiration_date: expirationDate,
            status: "active",
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`✅ Gift card created: ${code} - $${amount}`);

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "block": {
        const { id } = params;

        const { error } = await supabase
          .from("gift_cards")
          .update({ status: "blocked" })
          .eq("id", id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: "Gift card bloqueada" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "unblock": {
        const { id } = params;

        const { data: giftCard } = await supabase
          .from("gift_cards")
          .select("remaining_amount")
          .eq("id", id)
          .single();

        const newStatus = giftCard?.remaining_amount > 0 ? "active" : "depleted";

        const { error } = await supabase
          .from("gift_cards")
          .update({ status: newStatus })
          .eq("id", id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: "Gift card desbloqueada" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_transactions": {
        const { gift_card_id } = params;

        const { data, error } = await supabase
          .from("gift_card_transactions")
          .select("*")
          .eq("gift_card_id", gift_card_id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Acción no válida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in manage-gift-cards:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
