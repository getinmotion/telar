/**
 * Checkouts Service
 * Servicio para gestión de checkouts con el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import { toastError } from '@/utils/toast.utils';

/**
 * Estado del checkout
 */
export type CheckoutStatus =
  | 'created'
  | 'awaiting_payment'
  | 'paid'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'partial_refunded';

/**
 * Interfaz para Checkout
 */
export interface Checkout {
  id: string;
  cartId: string;
  buyerUserId: string;
  context: 'marketplace' | 'tenant';
  contextShopId?: string;
  currency: string;
  status: CheckoutStatus;
  subtotalMinor: string;
  chargesTotalMinor: string;
  totalMinor: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obtener checkout por ID
 *
 * Retorna el detalle de un checkout específico con su estado actual.
 *
 * @param {string} checkoutId - ID del checkout (UUID)
 * @returns {Promise<Checkout>} Detalle del checkout
 *
 * @endpoint GET /checkouts/:id
 *
 * @example
 * const checkout = await getCheckoutById('123e4567-e89b-12d3-a456-426614174000');
 * console.log(checkout.status); // 'paid', 'failed', etc.
 */
export const getCheckoutById = async (checkoutId: string): Promise<Checkout> => {
  try {
    const response = await telarApi.get<Checkout>(`/checkouts/${checkoutId}`);
    return response.data;
  } catch (error: any) {
    // Don't show toast error for 404s when polling
    if (error.response?.status !== 404) {
      toastError(error);
    }
    throw error;
  }
};

/**
 * Obtener checkout por cart ID
 *
 * Retorna el checkout asociado a un carrito específico.
 *
 * @param {string} cartId - ID del carrito (UUID)
 * @returns {Promise<Checkout | null>} Checkout o null si no existe
 *
 * @endpoint GET /checkouts/cart/:cartId
 *
 * @example
 * const checkout = await getCheckoutByCartId('cart-uuid');
 */
export const getCheckoutByCartId = async (cartId: string): Promise<Checkout | null> => {
  try {
    const response = await telarApi.get<Checkout>(`/checkouts/cart/${cartId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    toastError(error);
    throw error;
  }
};
