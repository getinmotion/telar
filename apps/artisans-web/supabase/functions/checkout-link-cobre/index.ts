// Importamos la herramienta para servir peticiones HTTP en Deno (Edge Function)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// --- CONFIGURACIÓN Y UTILIDADES ---
// Cabeceras CORS (Permitir llamadas desde el frontend de tu aplicación)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Variables de Entorno (Se cargan automáticamente en las Edge Functions)
const PAYMENT_API_KEY = Deno.env.get('PAYMENT_API_KEY'); // user_id para /auth
const PAYMENT_API_SECRET = Deno.env.get('PAYMENT_API_SECRET'); // secret para /auth
const PAYMENT_COBRE_BALANCE = Deno.env.get('PAYMENT_COBRE_BALANCE');
const COBRE_API_BASE_URL = Deno.env.get('PAYMENT_API_URL');
// Función para manejar las pre-solicitudes OPTIONS (para CORS)
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
// --- LÓGICA DE FECHAS Y PRECIO ---
/**
 * Calcula la fecha de caducidad (valid_until) 15 minutos después de la hora actual.
 * @returns {string} Fecha en formato ISO 8601 (ej: 2025-12-04T10:45:00Z)
 */ function getValidUntilDate() {
  const now = new Date();
  // Sumamos 15 minutos (15 * 60 * 1000 milisegundos)
  const validUntil = new Date(now.getTime() + 15 * 60 * 1000);
  // Cobre (y el estándar ISO) requiere el formato Z para UTC
  return validUntil.toISOString();
}
/**
 * Genera la descripción con la fecha y hora actual en un formato legible.
 * @returns {string} Descripción (ej: "Pago - 03/12/2025 10:30 AM")
 */ function getDescription() {
  const now = new Date();
  // Usamos toLocaleString para obtener una fecha y hora localizada
  const formattedDate = now.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Formato de 24 horas
  });
  return `Pago - ${formattedDate}`;
}
/**
 * Convierte un monto decimal (ej. 10.50) a la unidad menor (centavos, ej. 1050).
 * Esto es crucial para APIs de pago.
 * @param priceDecimal Monto en formato decimal (ej. 10.50)
 * @returns {number} Monto en centavos (ej. 1050)
 */ function convertToMinorUnit(priceDecimal: number): number {
  // Multiplicamos por 100 y usamos Math.round para evitar errores de coma flotante (ej. 10.50 * 100 = 1049.999...)
  return Math.round(priceDecimal * 100);
}
// --- HANDLER PRINCIPAL DEL EDGE FUNCTION ---
serve(async (req)=>{
  // Manejo de la solicitud OPTIONS para CORS
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
  // 1. ⚠️ Validación de Entorno
  if (!PAYMENT_API_KEY || !PAYMENT_API_SECRET || !PAYMENT_COBRE_BALANCE || !COBRE_API_BASE_URL) {
    console.error("Missing environment variables.");
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'API configuration missing. Check environment variables.'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    // 2. 📥 Extracción de Datos del Body
    const { cart_id, price } = await req.json(); // price aquí es el decimal (ej. 10.50)
    if (typeof cart_id !== 'string' || typeof price !== 'number' || price <= 0) {
      return new Response(JSON.stringify({
        error: 'Invalid Input',
        message: 'cart_id (string) and price (positive number) are required.'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // 💡 AJUSTE CRUCIAL: Convertir el precio de formato decimal a centavos
    const priceInMinorUnit = convertToMinorUnit(price);
    console.log(`Original Price: ${price} | Converted Price (Cobre): ${priceInMinorUnit}`);
    // 3. 🔑 PASO DE AUTENTICACIÓN: Obtener Token de Cobre
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
    const cobreToken = authData.access_token;
    // 4. 📅 Generación de Fechas (15 minutos de validez)
    const validUntil = getValidUntilDate();
    const descriptionToPayee = getDescription();
    // 5. 📝 Construcción del Payload de Cobre
    const payload = {
      "alias": "Marketplace Telar - pagos",
      "amount": priceInMinorUnit,
      "external_id": cart_id,
      "destination_id": PAYMENT_COBRE_BALANCE,
      "checkout_rails": [
        "pse",
        "bancolombia",
        "nequi",
        "breb"
      ],
      "checkout_header": "Pago - Telar",
      "checkout_item": "Pago carrito marketplace por medios digitales",
      "description_to_payee": descriptionToPayee,
      "valid_until": validUntil,
      "money_movement_intent_limit": 1,
      "redirect_url": "https://www.telar.co" // <-- Se recomienda usar la URL real
    };
    // 6. 📞 Llamada para crear el Link de Pago (Usando el Token)
    const apiResponse = await fetch(`${COBRE_API_BASE_URL}/v1/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cobreToken}`
      },
      body: JSON.stringify(payload)
    });
    const cobreData = await apiResponse.json();
    // 7. 🛑 Manejo de Errores de la API
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
    // 8. ✅ Respuesta Exitosa
    const checkoutUrl = cobreData.checkout_url;
    return new Response(JSON.stringify({
      checkout_url: checkoutUrl,
      money_movement_intent_id: cobreData.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("General Edge Function Error:", errorMessage);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: errorMessage
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
