/**
 * Cart Items Service - Centralized API calls to NestJS backend
 *
 * Este servicio maneja todas las operaciones de items del carrito (cart_items)
 * usando el backend NestJS.
 */

import { telarApi } from '@/integrations/api/telarApi';

// ============= Types =============

export enum PriceSource {
  PRODUCT_BASE = 'product_base',
  OVERRIDE = 'override',
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  sellerShopId: string;
  quantity: number;
  currency: string;
  unitPriceMinor: string; // Precio en menores (centavos) como string
  priceSource: string;
  priceRefId?: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales (cuando se incluyen con joins)
  product?: any;
  sellerShop?: any;
}

export interface CreateCartItemDto {
  cartId: string;
  productId: string;
  sellerShopId: string;
  quantity: number;
  currency: string;
  unitPriceMinor: string;
  priceSource: string;
  priceRefId?: string | null;
  metadata?: Record<string, any>;
}

export interface UpdateCartItemDto {
  quantity?: number;
  currency?: string;
  unitPriceMinor?: string;
  priceSource?: string;
  priceRefId?: string | null;
  metadata?: Record<string, any>;
}

// ============= Actions =============

/**
 * Crear un nuevo item en el carrito
 * Endpoint: POST /cart-items
 */
export const createCartItem = async (dto: CreateCartItemDto): Promise<CartItem> => {
  try {
    const response = await telarApi.post<CartItem>('/cart-items', dto);
    return response.data;
  } catch (error: any) {
    console.error('Error creating cart item:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al crear el item del carrito');
    }
    throw error;
  }
};

/**
 * Obtener todos los items del carrito
 * Endpoint: GET /cart-items
 */
export const getAllCartItems = async (): Promise<CartItem[]> => {
  try {
    const response = await telarApi.get<CartItem[]>('/cart-items');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cart items:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener los items del carrito');
    }
    throw error;
  }
};

/**
 * Obtener items por cartId
 * Endpoint: GET /cart-items/cart/:cartId
 */
export const getCartItemsByCartId = async (cartId: string): Promise<CartItem[]> => {
  try {
    const response = await telarApi.get<CartItem[]>(`/cart-items/cart/${cartId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cart items by cartId:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener los items del carrito');
    }
    throw error;
  }
};

/**
 * Obtener un item del carrito por ID
 * Endpoint: GET /cart-items/:id
 */
export const getCartItemById = async (id: string): Promise<CartItem> => {
  try {
    const response = await telarApi.get<CartItem>(`/cart-items/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cart item:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener el item del carrito');
    }
    throw error;
  }
};

/**
 * Actualizar un item del carrito
 * Endpoint: PATCH /cart-items/:id
 */
export const updateCartItem = async (id: string, dto: UpdateCartItemDto): Promise<CartItem> => {
  try {
    const response = await telarApi.patch<CartItem>(`/cart-items/${id}`, dto);
    return response.data;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al actualizar el item del carrito');
    }
    throw error;
  }
};

/**
 * Eliminar un item del carrito
 * Endpoint: DELETE /cart-items/:id
 */
export const deleteCartItem = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await telarApi.delete<{ message: string }>(`/cart-items/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting cart item:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al eliminar el item del carrito');
    }
    throw error;
  }
};

/**
 * Eliminar todos los items de un carrito
 * Endpoint: DELETE /cart-items/cart/:cartId/all
 */
export const deleteAllCartItems = async (cartId: string): Promise<{ message: string }> => {
  try {
    const response = await telarApi.delete<{ message: string }>(`/cart-items/cart/${cartId}/all`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting all cart items:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al eliminar los items del carrito');
    }
    throw error;
  }
};

/**
 * Helper: Convertir precio de número a string en menores (centavos)
 * Ejemplo: 50000 COP -> "5000000" (50000 * 100)
 */
export const priceToMinor = (price: number): string => {
  return Math.round(price * 100).toString();
};

/**
 * Helper: Convertir precio de string en menores a número
 * Ejemplo: "5000000" -> 50000 COP
 */
export const priceFromMinor = (priceMinor: string): number => {
  return parseInt(priceMinor, 10) / 100;
};
