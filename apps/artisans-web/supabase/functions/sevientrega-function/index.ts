// Importamos la herramienta para servir peticiones HTTP en Deno (Edge Function)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Importamos el cliente de Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'

// --- CONFIGURACIÓN Y CONSTANTES ---

// URLs de Servientrega
const AUTH_URL = "http://web.servientrega.com:8058/CotizadorCorporativo/api/autenticacion/login";
const QUOTE_URL = "http://web.servientrega.com:8058/CotizadorCorporativo/api/cotizacion/cotizar"; // URL estándar para cotizar

// Credenciales fijas para el login
const LOGIN_PAYLOAD = {
  login: "Luis1937",
  password: "MZR0zNqnI/KplFlYXiFk7m8/G/Iqxb3O",
  codFacturacion: "SER408"
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Inicializar cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- INTERFACES ---

interface ProductItem {
    id: number;
    weight: number;
    price: number;
    shop_id: string;
    artisan_shops: {
        user_id: string; // Ahora es string simple, no relación
    }
}

interface CartItemData {
    quantity: number;
    product: ProductItem;
}

interface ShopGroup {
    shopId: string;
    originCity: string;
    totalValue: number;
    itemsCount: number;
    pieces: Array<{
        Peso: number;
        Largo: number;
        Ancho: number;
        Alto: number;
    }>;
}

// --- FUNCIONES AUXILIARES ---

/**
 * Realiza la autenticación contra Servientrega y obtiene el token.
 */
async function getServientregaToken(): Promise<string> {
    console.log("🔐 Autenticando con Servientrega...");
    const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(LOGIN_PAYLOAD)
    });

    if (!response.ok) throw new Error(`Fallo Auth Servientrega: ${response.status}`);
    
    const authData = await response.json();
    if (!authData.token) throw new Error("No se recibió token de Servientrega");
    
    return authData.token;
}

/**
 * Realiza la cotización para un grupo específico de productos (una tienda).
 */
async function quoteForShop(token: string, shopGroup: ShopGroup, destinationCity: string) {
    const payload = {
        IdProducto: 2,
        NumeroPiezas: shopGroup.itemsCount, // Total de items físicos
        Piezas: shopGroup.pieces,
        ValorDeclarado: shopGroup.totalValue, // Suma del precio de los items
        IdDaneCiudadOrigen: `${shopGroup.originCity}000`,
        IdDaneCiudadDestino: `${destinationCity}000`,
        EnvioConCobro: false,
        FormaPago: 2,
        TiempoEntrega: 1,
        MedioTransporte: 1,
        NumRecaudo: 123456 // Valor fijo según requerimiento, aunque usualmente es 0 si no es contraentrega
    };

    console.log(`🚚 Cotizando ruta: ${shopGroup.originCity} -> ${destinationCity} | Shop: ${shopGroup.shopId}`);
    
    // NOTA: Se asume que la API requiere el token en el Header 'Authorization' o similar. 
    // Servientrega a veces lo pide en el header como 'Authorization: Bearer <token>' o en el body.
    // Usaremos Authorization Bearer estándar basado en la respuesta anterior JWT.
    
    const response = await fetch(QUOTE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch {
        data = { error: "Invalid JSON response", raw: responseText };
    }

    return {
        shop_id: shopGroup.shopId,
        origin_city: shopGroup.originCity,
        request_payload: payload,
        response: data,
        status: response.status
    };
}

// --- HANDLER PRINCIPAL ---

serve(async (req: Request) => {
    // 1. Manejo de CORS
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        // 2. Obtener parámetros (Query Params o Body)
        const url = new URL(req.url);
        const cartId = url.searchParams.get('cart_id');
        const idCityDestino = url.searchParams.get('idCityDestino');

        if (!cartId || !idCityDestino) {
            return new Response(
                JSON.stringify({ error: "Faltan parámetros: cart_id y idCityDestino son requeridos" }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 3. Obtener Token de Servientrega
        const token = await getServientregaToken();

        // 4. Consultar Datos en Supabase
        // PASO A: Obtener items y productos (sin el perfil profundo)
        const { data: cartItems, error: dbError } = await supabase
            .from('cart_items')
            .select(`
                quantity,
                product: product_id (
                    id,
                    price,
                    weight,
                    shop_id,
                    artisan_shops (
                        user_id
                    )
                )
            `)
            .eq('cart_id', cartId);

        if (dbError) throw new Error(`Error DB (Items): ${dbError.message}`);
        if (!cartItems || cartItems.length === 0) throw new Error("El carrito está vacío o no existe");

        const items = cartItems as unknown as CartItemData[];

        // PASO B: Recolectar user_ids únicos para buscar sus ciudades
        // Obtenemos todos los user_id de las tiendas involucradas
        const userIds = [...new Set(items.map(item => item.product.artisan_shops?.user_id).filter(id => id))];

        if (userIds.length === 0) throw new Error("No se encontraron usuarios asociados a las tiendas");

        // PASO C: Consultar user_profile para obtener dane_city
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('user_id, dane_city')
            .in('user_id', userIds);

        if (profilesError) throw new Error(`Error DB (Profiles): ${profilesError.message}`);

        // Crear mapa para búsqueda rápida: user_id -> dane_city
        const cityMap = new Map<string, string>();
        profiles?.forEach((p: any) => {
            if (p.dane_city) cityMap.set(p.user_id, p.dane_city);
        });

        // 5. Agrupar items por Shop ID
        const shopsMap = new Map<string, ShopGroup>();

        for (const item of items) {
            const product = item.product;
            const shopId = product.shop_id;
            const userId = product.artisan_shops?.user_id;
            
            // Acceso a la ciudad origen usando el mapa manual
            console.log('user', userId)
            console.log('profiles', profiles)
            const originCity = cityMap.get(userId);
            console.log('citymap', cityMap)

            if (!originCity) {
                console.warn(`Producto ${product.id} ignorado: No tiene ciudad de origen configurada (Shop: ${shopId}, User: ${userId})`);
                continue;
            }

            if (!shopsMap.has(shopId)) {
                shopsMap.set(shopId, {
                    shopId: shopId,
                    originCity: originCity,
                    totalValue: 0,
                    itemsCount: 0,
                    pieces: []
                });
            }

            const group = shopsMap.get(shopId)!;

            // Actualizar totales
            // Sumamos el valor total declarado: precio * cantidad
            group.totalValue += (product.price * item.quantity);
            
            // Actualizar conteo de piezas y array de piezas
            // Si quantity es 2, agregamos 2 piezas al array para que el cálculo de volumen sea correcto
            for (let i = 0; i < item.quantity; i++) {
                group.itemsCount += 1;
                group.pieces.push({
                    Peso: product.weight > 0 ? product.weight : 1, // Default a 1 si es 0
                    Largo: 1, // Default según requerimiento
                    Ancho: 1, // Default según requerimiento
                    Alto: 1   // Default según requerimiento
                });
            }
        }

        // 6. Realizar peticiones a Servientrega (Una por cada tienda)
        const quotesPromises = Array.from(shopsMap.values()).map(group => 
            quoteForShop(token, group, idCityDestino)
        );

        const quotesResults = await Promise.all(quotesPromises);

        // 7. Respuesta Final
        return new Response(
            JSON.stringify({ 
                success: true, 
                cart_id: cartId,
                destination_city: idCityDestino,
                quotes: quotesResults 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );

    } catch (error: any) {
        console.error("Error en cotizador:", error.message);
        return new Response(
            JSON.stringify({ error: error.message || "Error interno del servidor" }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }
});