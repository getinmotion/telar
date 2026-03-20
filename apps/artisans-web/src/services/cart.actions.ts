/**
 * Cart Service - Centralized API calls to NestJS backend
 *
 * Este servicio maneja todas las operaciones de carritos (carts)
 * usando el backend NestJS.
 */

import { telarApi } from '@/integrations/api/telarApi';

// ============= Types =============

export enum SaleContext {
  MARKETPLACE = 'marketplace',
  TENANT = 'tenant',
}

export enum CartStatus {
  OPEN = 'open',
  LOCKED = 'locked',
  CONVERTED = 'converted',
  ABANDONED = 'abandoned',
}

export interface Cart {
  id: string;
  buyerUserId: string;
  context: SaleContext;
  contextShopId?: string | null;
  currency: string;
  status: CartStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  lockedAt?: string | null;
  convertedAt?: string | null;
}

export interface CreateCartDto {
  buyerUserId: string;
  context?: SaleContext;
  contextShopId?: string | null;
  currency?: string;
}

export interface UpdateCartDto {
  context?: SaleContext;
  contextShopId?: string | null;
  currency?: string;
}

export interface UpdateCartStatusDto {
  status: CartStatus;
}

export interface SyncCartItemDto {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface SyncGuestCartDto {
  buyerUserId: string;
  items: SyncCartItemDto[];
}

export interface SyncGuestCartResponse {
  success: boolean;
  cartId: string;
  itemsCreated: number;
}

// ============= Actions =============

/**
 * Crear un nuevo carrito
 * Endpoint: POST /cart
 */
export const createCart = async (dto: CreateCartDto): Promise<Cart> => {
  try {
    const response = await telarApi.post<Cart>('/cart', dto);
    return response.data;
  } catch (error: any) {
    console.error('Error creating cart:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al crear el carrito');
    }
    throw error;
  }
};

/**
 * Obtener todos los carritos
 * Endpoint: GET /cart
 */
export const getAllCarts = async (): Promise<Cart[]> => {
  try {
    const response = await telarApi.get<Cart[]>('/cart');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching carts:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener los carritos');
    }
    throw error;
  }
};

/**
 * Obtener carritos por buyerUserId
 * Endpoint: GET /cart/buyer/:buyerUserId
 */
export const getCartsByBuyerId = async (buyerUserId: string): Promise<Cart[]> => {
  try {
    const response = await telarApi.get<Cart[]>(`/cart/buyer/${buyerUserId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching carts by buyer:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener los carritos');
    }
    throw error;
  }
};

/**
 * Obtener carrito abierto del comprador
 * Endpoint: GET /cart/buyer/:buyerUserId/open
 */
export const getOpenCartByBuyerId = async (buyerUserId: string): Promise<Cart | null> => {
  try {
    const response = await telarApi.get<Cart>(`/cart/buyer/${buyerUserId}/open`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching open cart:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener el carrito abierto');
    }
    throw error;
  }
};

/**
 * Obtener un carrito por ID
 * Endpoint: GET /cart/:id
 */
export const getCartById = async (id: string): Promise<Cart> => {
  try {
    const response = await telarApi.get<Cart>(`/cart/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener el carrito');
    }
    throw error;
  }
};

/**
 * Actualizar un carrito
 * Endpoint: PATCH /cart/:id
 */
export const updateCart = async (id: string, dto: UpdateCartDto): Promise<Cart> => {
  try {
    const response = await telarApi.patch<Cart>(`/cart/${id}`, dto);
    return response.data;
  } catch (error: any) {
    console.error('Error updating cart:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al actualizar el carrito');
    }
    throw error;
  }
};

/**
 * Actualizar estado del carrito
 * Endpoint: PATCH /cart/:id/status
 */
export const updateCartStatus = async (id: string, dto: UpdateCartStatusDto): Promise<Cart> => {
  try {
    const response = await telarApi.patch<Cart>(`/cart/${id}/status`, dto);
    return response.data;
  } catch (error: any) {
    console.error('Error updating cart status:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al actualizar el estado del carrito');
    }
    throw error;
  }
};

/**
 * Eliminar un carrito
 * Endpoint: DELETE /cart/:id
 */
export const deleteCart = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await telarApi.delete<{ message: string }>(`/cart/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting cart:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al eliminar el carrito');
    }
    throw error;
  }
};

/**
 * Sincronizar carrito de invitado a usuario autenticado
 * Endpoint: POST /cart/sync-guest
 */
export const syncGuestCart = async (dto: SyncGuestCartDto): Promise<SyncGuestCartResponse> => {
  try {
    const response = await telarApi.post<SyncGuestCartResponse>('/cart/sync-guest', dto);
    return response.data;
  } catch (error: any) {
    console.error('Error syncing guest cart:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al sincronizar el carrito');
    }
    throw error;
  }
};
