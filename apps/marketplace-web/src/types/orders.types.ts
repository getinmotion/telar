/**
 * Orders Types
 * Tipos para gestión de órdenes/pedidos
 */

/**
 * Item de una orden del backend
 */
export interface BackendOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceMinor: string;      // Precio en centavos como string
  lineTotalMinor: string;      // Total en centavos como string
  metadata: Record<string, any>;
  createdAt: string;
}

/**
 * Checkout asociado a una orden
 */
export interface OrderCheckout {
  id: string;
  buyerUserId: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod?: string | null;
  notes?: string | null;
  shippingAddressId?: string | null;
  deliveryMethod?: string | null;
  giftCardDiscount?: string | null;
  giftCardCode?: string | null;
  paidAmount?: string | null;
  shippingCost?: string | null;
  [key: string]: any; // Para otros campos no especificados
}

/**
 * Tienda vendedora
 */
export interface OrderSellerShop {
  id: string;
  name: string;
}

/**
 * Orden del backend (camelCase)
 */
export interface BackendOrder {
  id: string;
  checkoutId: string;
  sellerShopId: string;
  currency: string;
  grossSubtotalMinor: string;   // Subtotal en centavos como string
  netToSellerMinor: string;     // Neto al vendedor en centavos
  status: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippedAt?: string | null;
  estimatedDeliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;
  checkout: OrderCheckout;
  orderItems: BackendOrderItem[];
  sellerShop: OrderSellerShop;
}

/**
 * Response del endpoint GET /orders/buyer/:user_id/with-items
 */
export type GetBuyerOrdersWithItemsResponse = BackendOrder[];
