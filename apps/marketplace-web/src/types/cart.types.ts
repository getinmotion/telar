/**
 * Cart Types
 * Tipos para gestión del carrito de compras
 */

/**
 * Item del carrito (guest o user)
 */
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  isGiftCard?: boolean;
  giftCardAmount?: number;
  recipientEmail?: string;
  giftMessage?: string;
  product: {
    name: string;
    price: number;
    imageUrl: string;
    allowsLocalPickup?: boolean;
  };
}

/**
 * Item local del carrito (localStorage)
 */
export interface LocalCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  isGiftCard?: boolean;
  giftCardAmount?: number;
  recipientEmail?: string;
  giftMessage?: string;
  product: {
    name: string;
    price: number;
    imageUrl: string;
    allowsLocalPickup?: boolean;
  };
}

/**
 * Item para sincronización del carrito
 */
export interface CartItemToSync {
  productId: string;
  variantId?: string;
  quantity: number;
}

/**
 * Request para sincronizar carrito de invitado
 */
export interface SyncGuestCartRequest {
  buyerUserId: string; // UUID del usuario autenticado
  items: CartItemToSync[];
}

/**
 * Response de sincronización del carrito
 */
export interface SyncGuestCartResponse {
  cartId: string;
}

/**
 * Estados del carrito
 */
export type CartStatus = 'open' | 'locked' | 'converted' | 'abandoned';

/**
 * Información del comprador en el carrito
 */
export interface CartBuyer {
  id: string;
  email: string;
  displayName: string;
}

/**
 * Información de la tienda de contexto
 */
export interface CartShop {
  id: string;
  shopName: string;
  shopSlug: string;
  craftType: string;
  region: string;
}

/**
 * Carrito del usuario (response de GET /cart/buyer/:buyerUserId/open)
 */
export interface Cart {
  id: string;
  buyerUserId: string;
  context: string;
  contextShopId: string;
  currency: string;
  status: CartStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  lockedAt: string | null;
  convertedAt: string | null;
  buyer: CartBuyer;
  contextShop: CartShop;
}

/**
 * Item del carrito detallado (response de GET /cart-items/cart/:cartId)
 * Incluye información enriquecida del producto y tienda vendedora
 */
export interface CartItemDetailed {
  id: string;
  cartId: string;
  productId: string;
  sellerShopId: string;
  quantity: number;
  currency: string;
  unitPriceMinor: string; // Precio en centavos (ej: "5000000" = $50,000)
  priceSource: 'PRODUCT_BASE' | 'OVERRIDE';
  priceRefId: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  product: any; // TODO: Definir tipo Product completo
  sellerShop: any; // TODO: Definir tipo Shop completo
}

/**
 * Request para agregar item al carrito (POST /cart-items)
 */
export interface AddCartItemRequest {
  cartId: string; // UUID del carrito
  productId: string; // UUID del producto
  sellerShopId: string; // UUID de la tienda vendedora
  quantity: number; // Cantidad (min: 1)
  currency: string; // ISO 4217 (ej: 'COP'), 3 caracteres
  unitPriceMinor: string; // Precio en centavos (ej: '5000000' = $50,000)
  priceSource: 'product_base' | 'override';
  priceRefId?: string; // UUID opcional para referencia de precio
  metadata?: {
    variantId?: string;
    color?: string;
    size?: string;
    [key: string]: any;
  };
}

/**
 * Request para actualizar item del carrito (PATCH /cart-items/:id)
 * Todos los campos son opcionales
 */
export interface UpdateCartItemRequest {
  cartId?: string;
  productId?: string;
  sellerShopId?: string;
  quantity?: number;
  currency?: string;
  unitPriceMinor?: string;
  priceSource?: 'product_base' | 'override';
  priceRefId?: string;
  metadata?: {
    variantId?: string;
    [key: string]: any;
  };
}

/**
 * Response de eliminación de item del carrito (DELETE /cart-items/:id)
 */
export interface DeleteCartItemResponse {
  message: string;
}

/**
 * Request para actualizar estado del carrito (PATCH /cart/:id/status)
 */
export interface UpdateCartStatusRequest {
  status: CartStatus;
}
