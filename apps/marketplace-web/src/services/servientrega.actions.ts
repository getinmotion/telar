/**
 * Servientrega Service
 * Servicio para cotización de envíos con Servientrega
 */

import { telarApi } from '@/integrations/api/telarApi';
import { toastError } from '@/utils/toast.utils';
import type {
  ServientregaQuoteRequest,
  ServientregaQuoteResponse,
} from '@/types/servientrega.types';

/**
 * Obtener cotización de envío para un carrito
 *
 * Calcula el costo de envío desde las tiendas del carrito
 * hasta la ciudad de destino del comprador usando Servientrega.
 *
 * @param {ServientregaQuoteRequest} data - Datos para cotización
 * @param {string} data.cart_id - ID del carrito (UUID)
 * @param {string} data.idCityDestino - Código DANE de ciudad destino
 * @returns {Promise<ServientregaQuoteResponse>} Cotización con costos por tienda
 *
 * @endpoint POST /servientrega/quote
 *
 * @example
 * const quote = await getShippingQuote({
 *   cart_id: activeCartId,
 *   idCityDestino: "11001" // Bogotá
 * });
 *
 * if (quote.success) {
 *   console.log('Total shipping:', quote.totalShipping);
 *   quote.quotes.forEach(q => {
 *     console.log(`${q.shopName}: $${q.shippingCost} (${q.estimatedDays} días)`);
 *   });
 * }
 */
export const getShippingQuote = async (
  data: ServientregaQuoteRequest
): Promise<ServientregaQuoteResponse> => {
  try {
    const response = await telarApi.post<ServientregaQuoteResponse>(
      '/servientrega/quote',
      data
    );
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};
