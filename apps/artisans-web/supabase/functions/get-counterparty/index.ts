import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const PAYMENT_API_KEY = Deno.env.get('PAYMENT_API_KEY');
const PAYMENT_API_SECRET = Deno.env.get('PAYMENT_API_SECRET');
const COBRE_API_BASE_URL = Deno.env.get('PAYMENT_API_URL');
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method Not Allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  if (!PAYMENT_API_KEY || !PAYMENT_API_SECRET || !COBRE_API_BASE_URL) {
    console.error("Missing environment variables.");
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'API configuration missing. Check PAYMENT_API_KEY, PAYMENT_API_SECRET, and PAYMENT_API_URL.'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    const { counterparty_id } = await req.json();
    if (typeof counterparty_id !== 'string' || counterparty_id.length === 0) {
      return new Response(JSON.stringify({
        error: 'Invalid Input',
        message: 'counterparty_id (string) is required.'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Authenticate with Cobre API
    const authResponse = await fetch(`${COBRE_API_BASE_URL}/v1/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        user_id: PAYMENT_API_KEY,
        secret: PAYMENT_API_SECRET
      })
    });
    const authData = await authResponse.json();
    if (!authResponse.ok || !authData.access_token) {
      console.error("Cobre Auth Error:", authData);
      return new Response(JSON.stringify({
        error: 'Cobre Authentication Failed',
        status: authResponse.status,
        details: authData
      }), {
        status: authResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(authData)

    const cobreToken = authData.access_token;
    // Get counterparty data
    const apiResponse = await fetch(`${COBRE_API_BASE_URL}/v1/counterparties/${counterparty_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cobreToken}`
      }
    });
    console.log(apiResponse)
    const cobreData = await apiResponse.json();
    if (!apiResponse.ok) {
      console.error("Cobre API Error:", cobreData);
      return new Response(JSON.stringify({
        error: 'Cobre API Error',
        status: apiResponse.status,
        details: cobreData
      }), {
        status: apiResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    return new Response(JSON.stringify(cobreData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Edge Function Error:", error.message);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
