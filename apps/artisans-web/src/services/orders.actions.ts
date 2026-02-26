/**
 * Orders Service - NestJS Backend Integration
 * Maneja todas las operaciones de órdenes
 */

import { telarApi } from '@/integrations/api/telarApi';

// TODO: Definir estos tipos en @/types/order.types.ts
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  currency: string;
  unitPriceMinor: string;
  lineTotalMinor: string;
  metadata?: Record<string, any>;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    images: string[];
  };
}

// DTO from backend (camelCase)
export interface OrderDTO {
  id: string;
  checkoutId: string;
  sellerShopId: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: any;
  currency: string;
  grossSubtotalMinor: string;
  netToSellerMinor: string;
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  trackingNumber?: string;
  status: 'pending_fulfillment' | 'delivered' | 'canceled' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
}

// Frontend format (snake_case for compatibility)
export interface Order {
  id: string;
  checkout_id: string;
  seller_shop_id: string;
  order_number?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: any;
  items: OrderItem[];
  currency: string;
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

/**
 * Map backend DTO (camelCase) to frontend format (snake_case)
 */
function mapOrderFromDTO(dto: OrderDTO): Order {
  const subtotal = dto.subtotal ?? parseInt(dto.grossSubtotalMinor) / 100;
  const total = dto.total ?? subtotal + (dto.shippingCost || 0);

  return {
    id: dto.id,
    checkout_id: dto.checkoutId,
    seller_shop_id: dto.sellerShopId,
    order_number: dto.orderNumber,
    customer_name: dto.customerName,
    customer_email: dto.customerEmail,
    customer_phone: dto.customerPhone,
    shipping_address: dto.shippingAddress,
    items: dto.orderItems || [],
    currency: dto.currency,
    subtotal,
    shipping_cost: dto.shippingCost,
    total,
    payment_status: dto.paymentStatus,
    fulfillment_status: dto.fulfillmentStatus,
    tracking_number: dto.trackingNumber,
    status: dto.status,
    notes: dto.notes,
    created_at: dto.createdAt,
    updated_at: dto.updatedAt,
  };
}

/**
 * Obtener todas las órdenes de una tienda (seller)
 * Endpoint: GET /orders/seller/:sellerShopId
 */
export async function getOrdersBySellerShopId(sellerShopId: string): Promise<Order[]> {
  const response = await telarApi.get<OrderDTO[]>(
    `/orders/seller/${sellerShopId}`
  );
  return response.data.map(mapOrderFromDTO);
}

/**
 * Actualizar el status de una orden
 * Endpoint: PATCH /orders/:id/status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending_fulfillment' | 'delivered' | 'canceled' | 'refunded'
): Promise<Order> {
  const response = await telarApi.patch<OrderDTO>(
    `/orders/${orderId}/status`,
    { status }
  );
  return mapOrderFromDTO(response.data);
}

/**
 * TODO: Actualizar tracking number
 * Pendiente de definir el flujo con cart-shipping-info
 *
 * Endpoint pendiente: PATCH /orders/:orderId/tracking
 */
export async function updateOrderTracking(
  _orderId: string,
  _trackingNumber: string
): Promise<void> {
  throw new Error('Funcionalidad pendiente - flujo de tracking en revisión');
}
