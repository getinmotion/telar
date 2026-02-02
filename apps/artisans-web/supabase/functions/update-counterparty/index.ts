import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYMENT_API_KEY = Deno.env.get("PAYMENT_API_KEY");
const PAYMENT_API_SECRET = Deno.env.get("PAYMENT_API_SECRET");
const COBRE_API_BASE_URL = Deno.env.get("PAYMENT_API_URL") || "https://api.cobre.co";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate API credentials
    if (!PAYMENT_API_KEY || !PAYMENT_API_SECRET) {
      console.error("Missing Cobre API credentials");
      return new Response(
        JSON.stringify({ error: "Payment API configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the authorization header to identify the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token for auth check
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { holder_name, document_type, document_number, bank_code, account_type, account_number, geo } = body;

    // Validate required fields
    if (!holder_name || !document_type || !document_number || !bank_code || !account_type || !account_number) {
      console.error("Missing required fields:", { holder_name, document_type, document_number, bank_code, account_type, account_number });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user's shop and current id_contraparty
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from("artisan_shops")
      .select("id, id_contraparty, shop_name")
      .eq("user_id", user.id)
      .single();

    if (shopError || !shopData) {
      console.error("Shop fetch error:", shopError);
      return new Response(
        JSON.stringify({ error: "Shop not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const previousCounterpartyId = shopData.id_contraparty;

    // Step 1: Authenticate with Cobre API (OAuth2)
    console.log("Authenticating with Cobre API...");
    const authResponse = await fetch(`${COBRE_API_BASE_URL}/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        user_id: PAYMENT_API_KEY,
        secret: PAYMENT_API_SECRET,
      }),
    });

    const authData = await authResponse.json();
    if (!authResponse.ok || !authData.access_token) {
      console.error("Cobre Auth Error:", authData);
      return new Response(
        JSON.stringify({ error: "Payment API authentication failed", details: authData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cobreToken = authData.access_token;
    console.log("Cobre authentication successful");

    // Step 2: Create new counterparty in Cobre API
    const cobrePayload = {
      geo: geo || "col",
      type: account_type,
      alias: `${holder_name} - ${account_type}`,
      metadata: {
        account_number: account_number,
        beneficiary_institution: bank_code,
        counterparty_fullname: holder_name,
        counterparty_id_number: document_number,
        counterparty_id_type: document_type,
      },
    };

    console.log("Creating new counterparty in Cobre:", cobrePayload);

    const cobreResponse = await fetch(`${COBRE_API_BASE_URL}/v1/counterparties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cobreToken}`,
      },
      body: JSON.stringify(cobrePayload),
    });

    if (!cobreResponse.ok) {
      const errorText = await cobreResponse.text();
      console.error("Cobre API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Error creating counterparty in payment system", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cobreData = await cobreResponse.json();
    const newCounterpartyId = cobreData.id;

    console.log("New counterparty created:", newCounterpartyId);

    // Step 3: Update artisan_shops with new id_contraparty
    const { error: updateError } = await supabaseAdmin
      .from("artisan_shops")
      .update({
        id_contraparty: newCounterpartyId,
        bank_data_status: "complete",
        updated_at: new Date().toISOString(),
      })
      .eq("id", shopData.id);

    if (updateError) {
      console.error("Error updating shop:", updateError);
      return new Response(
        JSON.stringify({ error: "Error updating shop data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the change in admin_audit_log
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_user_id: user.id,
      action: "update_bank_data",
      resource_type: "artisan_shops",
      resource_id: shopData.id,
      details: {
        previous_counterparty_id: previousCounterpartyId,
        new_counterparty_id: newCounterpartyId,
        shop_name: shopData.shop_name,
        updated_by: "artisan",
      },
    });

    console.log("Bank data updated successfully for shop:", shopData.id);

    return new Response(
      JSON.stringify({
        success: true,
        id_contraparty: newCounterpartyId,
        message: "Bank data updated successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in update-counterparty:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
