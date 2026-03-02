/**
 * Payment Service
 * Servicio para integración con el sistema de pagos
 */

import { toastError } from '@/utils/toast.utils';
import type {
  CreateCheckoutRequest,
  CheckoutResponse,
} from '@/types/payment.types';

const PAYMENT_API_URL = import.meta.env.VITE_API_PAYMENT_URL;

/**
 * Crear checkout de pago
 *
 * Crea una sesión de checkout con el proveedor de pago seleccionado
 * (Wompi para tarjeta de crédito o Cobre para PSE).
 *
 * @param {CreateCheckoutRequest} data - Datos para crear el checkout
 * @param {string} data.cart_id - ID del carrito (UUID)
 * @param {number} data.amount - Monto total en COP (sin centavos)
 * @param {string} data.currency - Moneda (ej: 'COP')
 * @param {'wompi' | 'cobre'} data.provider - Proveedor de pago
 * @param {string} data.return_url - URL de retorno después del pago
 * @returns {Promise<CheckoutResponse>} Información del checkout con URL de pago
 *
 * @endpoint POST /checkout
 *
 * @example
 * const checkout = await createCheckout({
 *   cart_id: activeCartId,
 *   amount: 150000,
 *   currency: 'COP',
 *   provider: 'cobre',
 *   return_url: window.location.origin + '/payment-success'
 * });
 *
 * // Redirigir al usuario
 * window.open(checkout.checkout_url, '_blank');
 */
export const createCheckout = async (
  data: CreateCheckoutRequest
): Promise<CheckoutResponse> => {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = {
        response: {
          status: response.status,
          data: errorData
        },
        message: errorData?.message || 'Error al crear checkout de pago'
      };
      toastError(error);
      throw new Error(error.message);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};
