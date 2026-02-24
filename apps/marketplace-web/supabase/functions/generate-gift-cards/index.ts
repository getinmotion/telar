import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// telar.ia Supabase credentials
const TELAR_SUPABASE_URL = "https://ylooqmqmoufqtxvetxuj.supabase.co";
const TELAR_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs";

interface GiftCardItem {
  amount: number;
  quantity: number;
  recipient_email?: string;
  message?: string;
}

interface GenerateGiftCardsRequest {
  order_id: string;
  purchaser_email: string;
  items: GiftCardItem[];
}

interface GenerateGiftCardsResponse {
  success: boolean;
  codes_generated: number;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, purchaser_email, items }: GenerateGiftCardsRequest = await req.json();

    if (!order_id || !purchaser_email || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "order_id, purchaser_email, and items are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating gift cards for order: ${order_id}`);
    console.log(`Items:`, items);

    // Create telar.ia client
    const telarClient = createClient(TELAR_SUPABASE_URL, TELAR_SUPABASE_ANON_KEY);

    // Call the generate_gift_cards_from_order RPC function in telar.ia
    const { data, error } = await telarClient.rpc('generate_gift_cards_from_order', {
      p_order_id: order_id,
      p_purchaser_email: purchaser_email,
      p_items: items
    });

    if (error) {
      console.error("Error generating gift cards:", error);
      return new Response(
        JSON.stringify({ 
          success: false,
          codes_generated: 0,
          message: "Error al generar las gift cards"
        } as GenerateGiftCardsResponse),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generate gift cards response:", data);

    const response: GenerateGiftCardsResponse = {
      success: data?.success ?? false,
      codes_generated: data?.codes_generated ?? 0,
      message: data?.message ?? "Gift cards generadas exitosamente"
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-gift-cards:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        codes_generated: 0,
        message: "Error al generar las gift cards"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
