import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYMENT_API_KEY = Deno.env.get('PAYMENT_API_KEY');
const PAYMENT_API_SECRET = Deno.env.get('PAYMENT_API_SECRET');
const PAYMENT_COBRE_BALANCE = Deno.env.get('PAYMENT_COBRE_BALANCE');
const COBRE_API_BASE_URL = Deno.env.get('COBRE_API_BASE_URL');

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function getValidUntilDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(23, 59, 0, 0);
  return tomorrow.toISOString();
}

function getDescription(): string {
  const now = new Date();
  const formattedDate = now.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return `Pago - ${formattedDate}`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!PAYMENT_API_KEY || !PAYMENT_API_SECRET || !PAYMENT_COBRE_BALANCE || !COBRE_API_BASE_URL) {
    console.error("Missing environment variables.");
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'API configuration missing. Check PAYMENT_API_KEY, PAYMENT_API_SECRET, etc.'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { cart_id, price } = await req.json();

    if (typeof cart_id !== 'string' || typeof price !== 'number' || price <= 0) {
      return new Response(JSON.stringify({
        error: 'Invalid Input',
        message: 'cart_id (string) and price (positive number) are required.'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Creating checkout link for cart_id: ${cart_id}, price: ${price}`);

    // Authenticate with Cobre
    const authResponse = await fetch(`${COBRE_API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        user_id: PAYMENT_API_KEY,
        secret: PAYMENT_API_SECRET
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.token) {
      console.error("Cobre Auth Error:", authData);
      return new Response(JSON.stringify({
        error: 'Cobre Authentication Failed',
        status: authResponse.status,
        details: authData
      }), { status: authResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const cobreToken = authData.token;
    const validUntil = getValidUntilDate();
    const descriptionToPayee = getDescription();

    const payload = {
      "alias": "Link de Pago - Marketplace",
      "amount": price,
      "external_id": cart_id,
      "destination_id": PAYMENT_COBRE_BALANCE,
      "checkout_rails": ["pse", "bancolombia", "nequi", "breb"],
      "checkout_header": "Pago por medios digitales - Telar",
      "checkout_item": "Pago carrito marketplace por medios digitales",
      "description_to_payee": descriptionToPayee,
      "valid_until": validUntil,
      "money_movement_intent_limit": 1,
      "redirect_url": "https://www.cobre.co"
    };

    console.log("Creating money movement intent with payload:", JSON.stringify(payload));

    const apiResponse = await fetch(`${COBRE_API_BASE_URL}/money-movement-intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cobreToken}`,
      },
      body: JSON.stringify(payload),
    });

    const cobreData = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Cobre API Error:", cobreData);
      return new Response(JSON.stringify({
        error: 'Cobre API Error',
        status: apiResponse.status,
        details: cobreData
      }), { status: apiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log("Checkout link created successfully:", cobreData.checkout_url);

    return new Response(
      JSON.stringify({ 
        checkout_url: cobreData.checkout_url, 
        money_movement_intent_id: cobreData.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("General Edge Function Error:", errorMessage);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: errorMessage
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
