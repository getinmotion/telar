// Importamos la herramienta para servir peticiones HTTP en Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Importamos el cliente de Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';
// Importamos Resend para el envío de correos
import { Resend } from "https://esm.sh/resend@2.0.0";
// --- CONFIGURACIÓN Y UTILIDADES ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-client-info, apikey, content-type'
};
// Variables de Entorno
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const COBRE_WEBHOOK_SECRET = Deno.env.get('COBRE_WEBHOOK_SECRET');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const MARKETPLACE_SYNC_SECRET = Deno.env.get('MARKETPLACE_SYNC_SECRET');

// URL del endpoint de sincronización en telar.co marketplace
const MARKETPLACE_SYNC_URL = 'https://qzjcgwchexqpykqsxxcr.supabase.co/functions/v1/sync-payment-status';

// Inicializar clientes
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(RESEND_API_KEY);
const textEncoder = new TextEncoder();
// Helpers de utilidades (Encoding/Decoding)
const textToArrayBuffer = (str: string) => textEncoder.encode(str);
const bufferToHex = (buffer: ArrayBuffer) => {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
};
// Formateador de moneda (Pesos Colombianos)
const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0
});
// --- FUNCIONES DE VALIDACIÓN ---
async function verifyCobreSignature(rawBody: string, signature: string, secret: string, timestamp: string) {
  const payloadToSign = `${timestamp}.${rawBody}`;
  let keyBytes = textToArrayBuffer(secret);
  const key = await crypto.subtle.importKey("raw", keyBytes, {
    name: "HMAC",
    hash: "SHA-256"
  }, false, [
    "sign"
  ]);
  const dataToSign = textToArrayBuffer(payloadToSign);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
  const calculatedSignature = bufferToHex(signatureBuffer);
  return calculatedSignature === signature;
}
// --- GENERADORES DE HTML PARA EMAILS ---
const getStyles = ()=>`
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .header { background-color: #142239; padding: 20px; text-align: center; }
  .logo { color: #ffffff; font-size: 24px; font-weight: bold; text-decoration: none; }
  .content { padding: 30px 25px; }
  .transaction-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 20px 0; }
  .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .value { font-size: 16px; font-weight: 600; color: #142239; margin-bottom: 10px; }
  .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
  .status-approved { background-color: #d4edda; color: #155724; }
  .status-rejected { background-color: #f8d7da; color: #721c24; }
  .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  .items-table th { text-align: left; padding: 10px; border-bottom: 2px solid #eee; color: #666; font-size: 14px; }
  .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
  .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888; }
`;
// Plantilla APROBADA
const getApprovedHtml = (txData: any, items: any[]) => {
  const itemsRows = items.map((item: any) => `
    <tr>
      <td>${item.product?.name || 'Producto'}</td>
      <td style="text-align: right;">${currencyFormatter.format(item.product?.price || 0)}</td>
    </tr>
  `).join('');
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${getStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">TELAR Marketplace</div>
          </div>
          <div class="content">
            <h2 style="color: #142239; margin-top: 0;">¡Pago Exitoso! 🎉</h2>
            <p>Tu transacción ha sido confirmada correctamente. Aquí tienes los detalles de tu compra.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge status-approved">APROBADO</span>
            </div>

            <div class="transaction-box">
              <div class="label">ID de Transacción (Cobre)</div>
              <div class="value">${txData.id}</div>
              
              <div class="label">Fecha</div>
              <div class="value">${new Date(txData.created_at).toLocaleString('es-CO')}</div>
              
              <div class="label">Total Pagado</div>
              <div class="value" style="font-size: 20px; margin-bottom: 0;">${currencyFormatter.format(txData.amount)}</div>
            </div>

            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Resumen del Pedido</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>Gracias por apoyar el talento local.</p>
            <p>TELAR Marketplace - Artesanías Colombianas Auténticas</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
// Plantilla RECHAZADA
const getRejectedHtml = (txData: any) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>${getStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TELAR Marketplace</div>
        </div>
        <div class="content">
          <h2 style="color: #d63031; margin-top: 0;">Pago Rechazado 😔</h2>
          <p>Lo sentimos, no pudimos procesar tu pago para esta orden.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge status-rejected">RECHAZADO</span>
          </div>

          <div class="transaction-box">
            <div class="label">Referencia de Pedido</div>
            <div class="value">${txData.external_id}</div>
            
            <div class="label">Fecha</div>
            <div class="value">${new Date(txData.created_at).toLocaleString('es-CO')}</div>
            
             <div class="label">Monto Intentado</div>
            <div class="value">${currencyFormatter.format(txData.amount)}</div>
          </div>

          <p>Es posible que haya sido un error temporal o fondos insuficientes. Por favor intenta realizar el pago nuevamente.</p>
          
          <div style="text-align: center; margin-top: 30px;">
             <a href="https://telar.co/checkout/${txData.external_id}" style="background-color: #142239; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Intentar pagar de nuevo</a>
          </div>
        </div>
        <div class="footer">
          <p>Si necesitas ayuda, contacta a soporte.</p>
          <p>TELAR Marketplace</p>
        </div>
      </div>
    </body>
  </html>
`;

// Plantilla para NUEVA VENTA (para el artesano)
const getNewSaleHtml = (productName: string, amount: number, orderId: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>${getStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TELAR</div>
        </div>
        <div class="content">
          <h2 style="color: #142239; margin-top: 0;">💰 ¡Nueva Venta!</h2>
          <p>¡Felicitaciones! Has realizado una nueva venta en TELAR.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge status-approved">VENTA CONFIRMADA</span>
          </div>

          <div class="transaction-box">
            <div class="label">Producto Vendido</div>
            <div class="value">${productName}</div>
            
            <div class="label">Monto</div>
            <div class="value" style="font-size: 20px;">${currencyFormatter.format(amount)}</div>
            
            <div class="label">ID de Orden</div>
            <div class="value">${orderId}</div>
          </div>

          <p>Ingresa a tu panel de ventas para ver los detalles del pedido y gestionar el envío.</p>
          
          <div style="text-align: center; margin-top: 30px;">
             <a href="https://app.telar.co/mi-tienda?tab=orders" style="background-color: #142239; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver mis ventas</a>
          </div>
        </div>
        <div class="footer">
          <p>¡Gracias por ser parte de TELAR!</p>
          <p>TELAR - Artesanías Colombianas</p>
        </div>
      </div>
    </body>
  </html>
`;

// Función para notificar al artesano de una venta
async function notifyArtisanOfSale(
  productId: string, 
  productName: string, 
  amount: number, 
  orderId: string,
  quantity: number
) {
  try {
    // Buscar el artesano dueño del producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('shop_id, artisan_shops(user_id)')
      .eq('id', productId)
      .single();
    
    if (productError || !product) {
      console.error(`❌ No se encontró producto ${productId}:`, productError);
      return;
    }

    const artisanUserId = (product as any).artisan_shops?.user_id;
    if (!artisanUserId) {
      console.error(`❌ No se encontró user_id del artesano para producto ${productId}`);
      return;
    }

    console.log(`📧 Notificando al artesano ${artisanUserId} de venta de ${productName}`);

    // 1. Crear notificación en la base de datos
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: artisanUserId,
        type: 'new_order',
        title: '💰 ¡Nueva venta!',
        message: `Has vendido ${quantity}x "${productName}" por ${currencyFormatter.format(amount)}`,
        metadata: { 
          productId, 
          productName,
          orderId, 
          amount,
          quantity
        }
      });

    if (notifError) {
      console.error('❌ Error creando notificación:', notifError);
    } else {
      console.log('✅ Notificación creada en DB');
    }

    // 2. Obtener email del artesano y enviar correo
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(artisanUserId);
    
    if (authError || !authData?.user?.email) {
      console.error('❌ No se pudo obtener email del artesano:', authError);
      return;
    }

    const artisanEmail = authData.user.email;

    // Verificar preferencias de notificación (opcional)
    const { data: prefs } = await supabase
      .from('user_notification_preferences')
      .select('email_new_orders')
      .eq('user_id', artisanUserId)
      .single();

    // Por defecto enviar si no hay preferencias
    const shouldSendEmail = prefs?.email_new_orders !== false;

    if (shouldSendEmail) {
      const { error: emailError } = await resend.emails.send({
        from: "TELAR <noreply@updates.telar.co>",
        to: [artisanEmail],
        subject: "💰 ¡Nueva venta en tu tienda! - TELAR",
        html: getNewSaleHtml(productName, amount, orderId)
      });

      if (emailError) {
        console.error('❌ Error enviando email al artesano:', emailError);
      } else {
        console.log(`✅ Email de venta enviado a ${artisanEmail}`);
      }
    } else {
      console.log(`ℹ️ Artesano ${artisanEmail} tiene desactivadas las notificaciones de ventas`);
    }

  } catch (error) {
    console.error('❌ Error en notifyArtisanOfSale:', error);
  }
}

// --- HANDLER PRINCIPAL ---
serve(async (req)=>{
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405
    });
  }
  // Leer rawBody
  let rawBody = '';
  try {
    const clonedReq = req.clone();
    rawBody = await clonedReq.text();
  } catch (e) {
    return new Response('Cannot read request body', {
      status: 400
    });
  }
  try {
    // 1. OBTENER HEADERS
    const signature = req.headers.get("event_signature");
    const timestamp = req.headers.get("event-timestamp") || req.headers.get("event_timestamp");
    // 2. VALIDACIÓN CONFIG
    if (!COBRE_WEBHOOK_SECRET || !RESEND_API_KEY) {
      console.error("❌ ERROR CONFIG: Falta SECRET o API KEY");
      return new Response("Configuration Error", {
        status: 500
      });
    }
    // 3. VALIDACIÓN FIRMA
    if (!signature || !timestamp) {
      return new Response("Unauthorized: Missing signature or timestamp", {
        status: 403
      });
    }
    const isSignatureValid = await verifyCobreSignature(rawBody, signature, COBRE_WEBHOOK_SECRET, timestamp);
    if (!isSignatureValid) {
      return new Response("Unauthorized: Invalid signature.", {
        status: 403
      });
    }
    // --- 4. PROCESAMIENTO ---
    const payload = JSON.parse(rawBody);
    const eventType = payload.event_key;
    const content = payload.content;
    // Variables clave del payload
    const moneyMovementId = content?.id;
    const status = content?.status?.state; // "completed" o "rejected"
    const checkoutToken = content?.external_id; // ID del carrito (Cart ID)
    // Datos para el email
    const userEmail = content?.source?.counterparty_email; // Email del pagador
    // CORRECCIÓN: Cobre envía el monto con 2 ceros adicionales (decimales implícitos).
    // Ejemplo: 100000 significa 1000.00. Dividimos por 100 para obtener el valor real.
    const transactionAmount = content?.amount ? Number(content.amount) / 100 : 0;
    const transactionDate = content?.created_at;
    console.log(`Evento: ${eventType}, Estado: ${status}, CartID: ${checkoutToken}`);
    // Solo actuamos si hay datos suficientes
    if (eventType && moneyMovementId && status && checkoutToken) {
      // A. ACTUALIZAR ESTADO EN DB (Siempre se hace primero)
      const { error: dbError } = await supabase.from('cart').update({
        money_movement_id: moneyMovementId,
        payment_status: status,
        updated_at: new Date().toISOString()
      }).eq('id', checkoutToken);
      if (dbError) {
        console.error("Error DB Cart Update:", dbError.message);
        return new Response(`DB Error: ${dbError.message}`, {
          status: 500
        });
      }

      // ======= SINCRONIZACIÓN CON MARKETPLACE (telar.co) =======
      // Sincronizar el estado del pago para que el marketplace actualice su propia DB
      try {
        console.log('🔄 Sincronizando estado de pago con marketplace telar.co...');
        const syncResponse = await fetch(MARKETPLACE_SYNC_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-secret': MARKETPLACE_SYNC_SECRET || '',
          },
          body: JSON.stringify({
            cart_id: checkoutToken,           // El UUID del carrito
            payment_status: status,           // 'completed' o 'rejected'
            money_movement_id: moneyMovementId, // El ID de Cobre
          }),
        });
        
        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
          console.log('✅ Marketplace sync exitoso:', syncResult);
        } else {
          console.error('⚠️ Marketplace sync falló:', syncResponse.status, await syncResponse.text());
        }
      } catch (syncError) {
        console.error('❌ Error sincronizando con marketplace:', syncError);
        // No fallar el webhook por esto, solo loguear
      }
      // ==========================================================

      // Datos para pasar a las plantillas
      const txInfo = {
        id: moneyMovementId,
        amount: transactionAmount,
        created_at: transactionDate,
        state: status,
        external_id: checkoutToken
      };
      // B. MANEJO DE ESTADOS (Completed / Rejected) y ENVÍO DE EMAIL
      if (userEmail) {
        try {
          if (status === 'completed') {
            console.log('✅ Pago completado. Obteniendo items y enviando email...');
            // 1. Consultar items del carrito haciendo Join con Product
            // Asumimos que la relación en Supabase es: items_cart.product_id -> product.id
            const { data: cartItems, error: itemsError } = await supabase.from('items_cart').select(`
                                quantity,
                                product (
                                    id,
                                    name,
                                    price
                                )
                            `).eq('cart_id', checkoutToken);
            if (itemsError) {
              console.error("Error fetching items:", itemsError);
            // Aun si falla obtener items, deberíamos intentar enviar el correo o manejarlo
            }
            const items = cartItems || [];
            // 2. Enviar correo de Aprobado al COMPRADOR
            const { error: emailError } = await resend.emails.send({
              from: "TELAR Marketplace <noreply@updates.telar.co>",
              to: [
                userEmail
              ],
              subject: "¡Pago exitoso! Confirmación de tu orden - TELAR",
              html: getApprovedHtml(txInfo, items)
            });
            if (emailError) console.error("Error enviando email aprobado:", emailError);
            
            // 3. DECREMENTAR INVENTARIO y NOTIFICAR ARTESANOS
            console.log('📦 Decrementando inventario y notificando artesanos...');
            for (const item of items) {
              const productId = (item.product as any)?.id;
              const productName = (item.product as any)?.name || 'Producto';
              const productPrice = (item.product as any)?.price || 0;
              const quantity = item.quantity || 1;
              
              if (productId) {
                // Decrementar inventario
                const { error: stockError } = await supabase.rpc('decrement_product_stock', {
                  p_product_id: productId,
                  p_quantity: quantity
                });
                if (stockError) {
                  console.error(`❌ Error decrementando inventario de ${productId}:`, stockError);
                } else {
                  console.log(`✅ Inventario decrementado para ${productId}`);
                }

                // ===== NOTIFICAR AL ARTESANO =====
                await notifyArtisanOfSale(
                  productId, 
                  productName, 
                  productPrice * quantity, 
                  checkoutToken,
                  quantity
                );
              }
            }
            
            // 4. Cerrar carrito
            await supabase.from('cart').update({
              is_active_cart: false
            }).eq('id', checkoutToken);
          } else if (status === 'rejected') {
            console.log('❌ Pago rechazado. Enviando notificación...');
            // 1. Enviar correo de Rechazado
            const { error: emailError } = await resend.emails.send({
              from: "TELAR Marketplace <noreply@updates.telar.co>",
              to: [
                userEmail
              ],
              subject: "Problema con tu pago - TELAR",
              html: getRejectedHtml(txInfo)
            });
            if (emailError) console.error("Error enviando email rechazado:", emailError);
            // 2. Cerrar carrito (opcional, según tu lógica de negocio si quieres que intenten con el mismo o uno nuevo)
            await supabase.from('cart').update({
              is_active_cart: false
            }).eq('id', checkoutToken);
          }
        } catch (emailExc) {
          console.error("Error en lógica de correo:", emailExc);
        // No retornamos error 500 aquí para no hacer fallar el webhook ante Cobre si ya actualizamos la DB
        }
      } else {
        console.warn("⚠️ No se encontró email en el payload (source.counterparty_email), no se envió correo.");
      }
    } else {
      console.log(`Evento ${eventType} ignorado o faltan datos.`);
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Server Error:", errorMessage);
    return new Response(`Internal Server Error: ${errorMessage}`, {
      status: 500
    });
  }
});
