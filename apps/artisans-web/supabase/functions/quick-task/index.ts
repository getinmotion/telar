import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, token-cobre-auth"
};
const COBRE_API_URL = Deno.env.get("COBRE_API_URL") || "https://api.cobre.co";
serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { userId, geo, type, alias, metadata } = await req.json();
    const cobreToken = req.headers.get("token-Cobre-Auth");
    if (!userId || !geo || !type || !metadata) {
      return new Response(JSON.stringify({
        error: "Missing required fields"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("📤 Creating counterparty for user:", userId);
    // Call Cobre API to create counterparty
    const cobreResponse = await fetch(`${COBRE_API_URL}/v1/counterparties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": cobreToken || ""
      },
      body: JSON.stringify({
        geo,
        type,
        alias,
        metadata
      })
    });
    if (!cobreResponse.ok) {
      const errorText = await cobreResponse.text();
      console.error("❌ Cobre API error:", errorText);
      return new Response(JSON.stringify({
        error: "Error creating counterparty",
        details: errorText
      }), {
        status: cobreResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const cobreData = await cobreResponse.json();
    const idContraparty = cobreData.id || cobreData.counterparty_id;
    console.log("✅ Counterparty created:", idContraparty);
    // Update artisan_shops with id_contraparty
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error: updateError } = await supabase.from("artisan_shops").update({
      id_contraparty: idContraparty,
      bank_data_status: "complete"
    }).eq("user_id", userId);
    if (updateError) {
      console.error("❌ Error updating artisan_shops:", updateError);
      return new Response(JSON.stringify({
        error: "Error updating shop",
        details: updateError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("✅ Shop updated with id_contraparty");
    return new Response(JSON.stringify({
      success: true,
      id_contraparty: idContraparty,
      message: "Counterparty created successfully"
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ Error in quick-task:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
