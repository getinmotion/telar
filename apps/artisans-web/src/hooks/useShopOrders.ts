import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getOrdersBySellerShopId, updateOrderStatus, Order } from '@/services/orders.actions';

export type ShopOrder = Order;

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

type ValidOrderStatus = 'pending_fulfillment' | 'delivered' | 'canceled' | 'refunded';

// Mapeo de estados legacy (fulfillment) → estados del backend
const LEGACY_TO_ORDER_STATUS: Record<string, ValidOrderStatus | undefined> = {
  picked_up: 'delivered',
  fulfilled: 'delivered',
  delivered: 'delivered',
  canceled: 'canceled',
  refunded: 'refunded',
  pending_fulfillment: 'pending_fulfillment',
  pending: 'pending_fulfillment',
  unfulfilled: 'pending_fulfillment',
  // 'shipped' no tiene equivalente en el nuevo backend (flujo en revisión)
};

export function orderRequiresShipping(order: ShopOrder): boolean {
  const shippingMethod = order.shipping_address?.method;
  const isPickup =
    shippingMethod === 'pickup' ||
    shippingMethod === 'local_pickup' ||
    (order.shipping_cost === 0 &&
      (!order.shipping_address || Object.keys(order.shipping_address).length === 0));
  return !isPickup;
}

export function orderNeedsTracking(order: ShopOrder): boolean {
  return (
    orderRequiresShipping(order) &&
    order.payment_status === 'paid' &&
    !order.tracking_number &&
    order.fulfillment_status !== 'fulfilled' &&
    order.fulfillment_status !== 'delivered'
  );
}

function calculateStats(orders: ShopOrder[]): OrderStats {
  return {
    total: orders.length,
    pending: orders.filter(
      o =>
        o.status === 'pending_fulfillment' ||
        o.fulfillment_status === 'unfulfilled' ||
        o.fulfillment_status === 'pending'
    ).length,
    processing: orders.filter(
      o =>
        o.fulfillment_status === 'processing' ||
        o.fulfillment_status === 'confirmed'
    ).length,
    shipped: orders.filter(o => o.fulfillment_status === 'shipped').length,
    delivered: orders.filter(
      o => o.status === 'delivered' || o.fulfillment_status === 'fulfilled'
    ).length,
    pendingTracking: orders.filter(o => orderNeedsTracking(o)).length,
    pickupOrders: orders.filter(o => !orderRequiresShipping(o)).length,
    totalRevenue: orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.subtotal || 0), 0),
  };
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
      const ordersData = await getOrdersBySellerShopId(shopId);
      setOrders(ordersData);
      setStats(calculateStats(ordersData));
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las órdenes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [shopId, toast]);

  // TODO: Pendiente — el flujo de tracking está siendo revisado
  const updateTrackingNumber = useCallback(
    async (_orderId: string, _trackingNumber: string) => {
      toast({
        title: 'Funcionalidad en revisión',
        description: 'El flujo de números de guía está siendo actualizado',
      });
      return false;
    },
    [toast]
  );

  const updateFulfillmentStatus = useCallback(
    async (orderId: string, status: string) => {
      const mappedStatus = LEGACY_TO_ORDER_STATUS[status];

      if (!mappedStatus) {
        toast({
          title: 'Funcionalidad en revisión',
          description: 'Este cambio de estado está siendo actualizado',
        });
        return false;
      }

      try {
        const updatedOrder = await updateOrderStatus(orderId, mappedStatus);

        setOrders(prev => {
          const next = prev.map(o => (o.id === orderId ? updatedOrder : o));
          setStats(calculateStats(next));
          return next;
        });

        toast({
          title: 'Estado actualizado',
          description: 'El estado del pedido ha sido actualizado',
        });
        return true;
      } catch {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el estado',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  const markAsShipped = useCallback(
    (orderId: string) => updateFulfillmentStatus(orderId, 'shipped'),
    [updateFulfillmentStatus]
  );

  const markAsPickedUp = useCallback(
    (orderId: string) => updateFulfillmentStatus(orderId, 'picked_up'),
    [updateFulfillmentStatus]
  );

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
