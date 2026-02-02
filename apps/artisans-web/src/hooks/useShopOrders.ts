import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShopOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: any;
  items: any;
  subtotal: number;
  shipping_cost?: number;
  total: number;
  payment_status?: string;
  fulfillment_status?: string;
  tracking_number?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  pendingTracking: number;
  pickupOrders: number;
  totalRevenue: number;
}

// Helper to check if order requires shipping (not pickup)
export function orderRequiresShipping(order: ShopOrder): boolean {
  const shippingMethod = order.shipping_address?.method;
  // Es pickup si tiene method='pickup' o si no tiene dirección y shipping_cost es 0
  const isPickup = shippingMethod === 'pickup' || 
                   shippingMethod === 'local_pickup' ||
                   (order.shipping_cost === 0 && (!order.shipping_address || Object.keys(order.shipping_address).length === 0));
  return !isPickup;
}

// Helper to check if order needs tracking number
export function orderNeedsTracking(order: ShopOrder): boolean {
  return (
    orderRequiresShipping(order) &&
    order.payment_status === 'paid' &&
    !order.tracking_number &&
    order.fulfillment_status !== 'fulfilled' &&
    order.fulfillment_status !== 'delivered'
  );
}

export function useShopOrders(shopId: string | undefined) {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    pendingTracking: 0,
    pickupOrders: 0,
    totalRevenue: 0,
  });
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch orders directly from orders table for this shop
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersData = (data || []) as ShopOrder[];

      // Enrich orders with product images from local products table
      const allProductIds = ordersData.flatMap(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        return items.map((item: any) => item.product_id).filter(Boolean);
      });

      let productMap = new Map<string, { images: any; name: string }>();
      if (allProductIds.length > 0) {
        const uniqueProductIds = [...new Set(allProductIds)];
        const { data: products } = await supabase
          .from('products')
          .select('id, images, name')
          .in('id', uniqueProductIds);

        if (products) {
          productMap = new Map(products.map(p => [p.id, { images: p.images, name: p.name }]));
        }
      }

      // Enrich each order's items with product images
      const enrichedOrders = ordersData.map(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        const enrichedItems = items.map((item: any) => {
          const localProduct = productMap.get(item.product_id);
          const localImage = localProduct?.images?.[0] || null;
          const localName = localProduct?.name || null;

          return {
            ...item,
            product_image: item.product_image || item.image || localImage,
            image: item.product_image || item.image || localImage,
            product_name: item.product_name || item.name || localName || 'Producto',
            name: item.product_name || item.name || localName || 'Producto',
          };
        });

        return { ...order, items: enrichedItems };
      });

      setOrders(enrichedOrders);

      // Calculate stats with improved logic
      const newStats: OrderStats = {
        total: enrichedOrders.length,
        pending: enrichedOrders.filter(o => 
          o.status === 'pending' || o.fulfillment_status === 'unfulfilled' || o.fulfillment_status === 'pending'
        ).length,
        processing: enrichedOrders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
        shipped: enrichedOrders.filter(o => o.status === 'shipped' || o.fulfillment_status === 'shipped').length,
        delivered: enrichedOrders.filter(o => o.status === 'delivered' || o.fulfillment_status === 'fulfilled').length,
        // Only count orders that require shipping AND don't have tracking
        pendingTracking: enrichedOrders.filter(o => orderNeedsTracking(o)).length,
        // Count pickup orders
        pickupOrders: enrichedOrders.filter(o => !orderRequiresShipping(o)).length,
        // Total revenue from paid orders (subtotal = products only, excludes shipping)
        totalRevenue: enrichedOrders
          .filter(o => o.payment_status === 'paid')
          .reduce((sum, o) => sum + (o.subtotal || 0), 0),
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las órdenes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [shopId, toast]);

  const updateTrackingNumber = useCallback(async (orderId: string, trackingNumber: string) => {
    try {
      // Solo guardar la guía, NO cambiar el estado automáticamente
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Guía guardada',
        description: 'El número de guía ha sido guardado. Recuerda marcar como enviado cuando despaches.',
      });

      fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el número de guía',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchOrders, toast]);

  const updateFulfillmentStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const updateData: any = { 
        fulfillment_status: status,
        updated_at: new Date().toISOString()
      };

      // Also update main status based on fulfillment
      if (status === 'shipped') updateData.status = 'shipped';
      if (status === 'fulfilled' || status === 'delivered') updateData.status = 'delivered';
      if (status === 'picked_up') updateData.status = 'delivered';

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Estado actualizado',
        description: 'El estado del pedido ha sido actualizado',
      });

      fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating fulfillment status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchOrders, toast]);

  const markAsShipped = useCallback(async (orderId: string) => {
    return updateFulfillmentStatus(orderId, 'shipped');
  }, [updateFulfillmentStatus]);

  const markAsPickedUp = useCallback(async (orderId: string) => {
    return updateFulfillmentStatus(orderId, 'picked_up');
  }, [updateFulfillmentStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    stats,
    fetchOrders,
    updateTrackingNumber,
    updateFulfillmentStatus,
    markAsPickedUp,
    markAsShipped,
  };
}
