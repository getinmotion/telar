import { supabase } from "@/integrations/supabase/client";
import { telarClient } from "@/lib/telarClient";

interface OrderItem {
  product_name: string;
  product_id: string;
  quantity: number;
  price: number;
  image_url?: string;
  shop_id?: string;
  shop_name?: string;
}

interface ShippingAddress {
  full_name: string;
  address: string;
  city: string;
  department: string;
  postal_code: string;
  phone: string;
}

interface OrderNotificationData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number;
  total: number;
  shippingAddress: ShippingAddress;
}

export const useOrderNotifications = () => {
  
  // Send order confirmation email to customer
  const sendOrderConfirmation = async (data: OrderNotificationData) => {
    try {
      console.log("Sending order confirmation for order:", data.orderId);
      
      const { error } = await supabase.functions.invoke('send-order-confirmation', {
        body: {
          order_id: data.orderId,
          customer_email: data.customerEmail,
          customer_name: data.customerName,
          items: data.items.map(item => ({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            image_url: item.image_url,
          })),
          subtotal: data.subtotal,
          shipping_cost: data.shippingCost,
          discount: data.discount,
          total: data.total,
          shipping_address: {
            address: data.shippingAddress.address,
            city: data.shippingAddress.city,
            department: data.shippingAddress.department,
            postal_code: data.shippingAddress.postal_code,
          },
        },
      });

      if (error) {
        console.error("Error sending order confirmation:", error);
        return false;
      }

      console.log("Order confirmation sent successfully");
      return true;
    } catch (error) {
      console.error("Error in sendOrderConfirmation:", error);
      return false;
    }
  };

  // Notify artisans about new sales (grouped by shop)
  const notifyArtisansNewSale = async (data: OrderNotificationData) => {
    try {
      console.log("Notifying artisans for order:", data.orderId);
      
      // Group items by shop
      const itemsByShop = data.items.reduce((acc, item) => {
        const shopId = item.shop_id || 'unknown';
        if (!acc[shopId]) {
          acc[shopId] = {
            shopId,
            shopName: item.shop_name || 'Tienda',
            items: [],
            total: 0,
          };
        }
        acc[shopId].items.push(item);
        acc[shopId].total += item.price * item.quantity;
        return acc;
      }, {} as Record<string, { shopId: string; shopName: string; items: OrderItem[]; total: number }>);

      // For each shop, get artisan email and send notification
      for (const shopData of Object.values(itemsByShop)) {
        try {
          // Get artisan email from telar.ia
          const { data: shop, error: shopError } = await telarClient
            .from('artisan_shops')
            .select('user_id, name')
            .eq('id', shopData.shopId)
            .single();

          if (shopError || !shop) {
            console.log("Could not find shop:", shopData.shopId);
            continue;
          }

          // Get user email from telar.ia auth (via profiles or directly)
          const { data: profile, error: profileError } = await telarClient
            .from('profiles')
            .select('email, full_name')
            .eq('id', shop.user_id)
            .single();

          if (profileError || !profile?.email) {
            console.log("Could not find artisan profile for shop:", shopData.shopId);
            continue;
          }

          // Send notification to artisan
          const { error } = await supabase.functions.invoke('notify-artisan-new-sale', {
            body: {
              order_id: data.orderId,
              shop_id: shopData.shopId,
              shop_name: shop.name || shopData.shopName,
              artisan_email: profile.email,
              artisan_name: profile.full_name || 'Artesano',
              items: shopData.items.map(item => ({
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                image_url: item.image_url,
              })),
              total: shopData.total,
              customer_name: data.customerName,
              shipping_address: data.shippingAddress,
            },
          });

          if (error) {
            console.error("Error notifying artisan:", profile.email, error);
          } else {
            console.log("Artisan notified successfully:", profile.email);
          }
        } catch (shopError) {
          console.error("Error processing shop notification:", shopError);
        }
      }

      return true;
    } catch (error) {
      console.error("Error in notifyArtisansNewSale:", error);
      return false;
    }
  };

  // Send shipping notification when tracking is added
  const sendShippingNotification = async (
    orderId: string,
    customerEmail: string,
    customerName: string,
    trackingNumber: string,
    carrier: string,
    shopName: string,
    items: { product_name: string; quantity: number; image_url?: string }[],
    estimatedDeliveryDate?: string
  ) => {
    try {
      console.log("Sending shipping notification for order:", orderId);
      
      const { error } = await supabase.functions.invoke('send-shipping-notification', {
        body: {
          order_id: orderId,
          customer_email: customerEmail,
          customer_name: customerName,
          tracking_number: trackingNumber,
          carrier,
          estimated_delivery_date: estimatedDeliveryDate,
          shop_name: shopName,
          items,
        },
      });

      if (error) {
        console.error("Error sending shipping notification:", error);
        return false;
      }

      console.log("Shipping notification sent successfully");
      return true;
    } catch (error) {
      console.error("Error in sendShippingNotification:", error);
      return false;
    }
  };

  // Send delivery confirmation when order is delivered
  const sendDeliveryConfirmation = async (
    orderId: string,
    customerEmail: string,
    customerName: string,
    shopName: string,
    items: { product_name: string; product_id: string; image_url?: string }[],
    deliveredAt?: string
  ) => {
    try {
      console.log("Sending delivery confirmation for order:", orderId);
      
      const { error } = await supabase.functions.invoke('send-delivery-confirmation', {
        body: {
          order_id: orderId,
          customer_email: customerEmail,
          customer_name: customerName,
          shop_name: shopName,
          delivered_at: deliveredAt,
          items,
        },
      });

      if (error) {
        console.error("Error sending delivery confirmation:", error);
        return false;
      }

      console.log("Delivery confirmation sent successfully");
      return true;
    } catch (error) {
      console.error("Error in sendDeliveryConfirmation:", error);
      return false;
    }
  };

  // Process all notifications for a completed order
  const processOrderNotifications = async (data: OrderNotificationData) => {
    console.log("Processing all notifications for order:", data.orderId);
    
    // Send both notifications in parallel
    const [customerResult, artisanResult] = await Promise.all([
      sendOrderConfirmation(data),
      notifyArtisansNewSale(data),
    ]);

    return {
      customerNotified: customerResult,
      artisansNotified: artisanResult,
    };
  };

  return {
    sendOrderConfirmation,
    notifyArtisansNewSale,
    sendShippingNotification,
    sendDeliveryConfirmation,
    processOrderNotifications,
  };
};
