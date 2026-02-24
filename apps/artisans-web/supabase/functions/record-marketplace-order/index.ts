import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify secret
    const syncSecret = req.headers.get("x-sync-secret");
    const expectedSecret = Deno.env.get("MARKETPLACE_SYNC_SECRET");
    
    if (!expectedSecret || syncSecret !== expectedSecret) {
      console.error("Invalid or missing sync secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("Received order data:", JSON.stringify(body, null, 2));

    const {
      shop_id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items,
      subtotal,
      shipping_cost,
      tax,
      total,
      payment_id,
      payment_method,
      notes
    } = body;

    // Validate required fields
    if (!shop_id || !order_number || !customer_name || !customer_email || !items || !total) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ 
        error: "Missing required fields: shop_id, order_number, customer_name, customer_email, items, total" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get product IDs to fetch images from local products table
    const productIds = Array.isArray(items) 
      ? items.map((item: any) => item.product_id).filter(Boolean)
      : [];

    // Fetch product data (images and names) from local database
    let productMap = new Map<string, { images: any; name: string }>();
    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, images, name')
        .in('id', productIds);

      if (productsError) {
        console.warn("Could not fetch product images:", productsError);
      } else if (products) {
        productMap = new Map(products.map(p => [p.id, { images: p.images, name: p.name }]));
        console.log("Fetched product data for", products.length, "products");
      }
    }

    // Normalize items and enrich with local product data
    const normalizedItems = Array.isArray(items) ? items.map((item: any) => {
      const localProduct = productMap.get(item.product_id);
      const localImage = localProduct?.images?.[0] || null;
      const localName = localProduct?.name || null;
      
      const productImage = item.product_image || item.image || localImage;
      const productName = item.product_name || item.name || localName || 'Producto';

      return {
        product_id: item.product_id || null,
        product_name: productName,
        name: productName,
        quantity: item.quantity || 1,
        price: item.price || 0,
        product_image: productImage,
        image: productImage,
        variant_id: item.variant_id || null,
        variant_name: item.variant_name || null,
      };
    }) : items;

    console.log("Normalized items with enriched data:", JSON.stringify(normalizedItems, null, 2));

    // Normalizar shipping_address para detectar pickup
    let normalizedShippingAddress = shipping_address || {};
    
    // Si no hay dirección de envío y shipping_cost es 0, probablemente es pickup
    if ((!shipping_address || Object.keys(shipping_address).length === 0) && (shipping_cost === 0 || !shipping_cost)) {
      normalizedShippingAddress = {
        method: 'pickup',
        note: 'Retiro en local'
      };
      console.log("Detected pickup order (no shipping address + zero shipping cost)");
    }

    // Insert order with normalized items and shipping address
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        shop_id,
        order_number,
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        shipping_address: normalizedShippingAddress,
        items: normalizedItems,
        subtotal: subtotal || total,
        shipping_cost: shipping_cost || 0,
        tax: tax || 0,
        total,
        payment_id: payment_id || null,
        payment_method: payment_method || "wompi",
        payment_status: "paid",
        status: "pending",
        fulfillment_status: "unfulfilled"
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting order:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Order created successfully:", order.id);

    // === NOTIFICACIÓN AL ARTESANO ===
    try {
      // 1. Obtener el user_id del artesano dueño de la tienda
      const { data: shop, error: shopError } = await supabase
        .from('artisan_shops')
        .select('user_id, shop_name')
        .eq('id', shop_id)
        .single();

      if (shopError) {
        console.warn("Could not fetch shop for notification:", shopError);
      } else if (shop?.user_id) {
        // 2. Calcular nombres de productos y cantidad
        const productNames = normalizedItems.map((i: any) => i.product_name || i.name).join(', ');
        const itemsCount = normalizedItems.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
        
        // 3. Crear notificación en la base de datos
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: shop.user_id,
          type: 'new_order',
          title: '💰 ¡Nueva venta!',
          message: `Has vendido ${itemsCount}x producto(s) por $${total.toLocaleString('es-CO')}`,
          metadata: { 
            orderId: order.id, 
            orderNumber: order_number,
            productNames,
            total,
            paymentMethod: payment_method || 'marketplace',
            actionUrl: '/mi-tienda?tab=orders',
            createdAt: new Date().toISOString()
          },
          read: false
        });

        if (notifError) {
          console.error("Error creating notification:", notifError);
        } else {
          console.log("Sale notification created for artisan:", shop.user_id);
        }

        // 4. Enviar email de notificación (opcional, async)
        try {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              userId: shop.user_id,
              type: 'new_order',
              title: '💰 ¡Nueva venta!',
              message: `Has vendido "${productNames}" por $${total.toLocaleString('es-CO')}`,
              actionUrl: '/mi-tienda?tab=orders'
            }
          });
          console.log("Email notification sent to artisan");
        } catch (emailErr) {
          console.warn("Email notification failed (non-critical):", emailErr);
        }
      }
    } catch (notifErr) {
      console.error("Notification process failed (non-critical):", notifErr);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order_id: order.id,
      order_number: order.order_number 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
