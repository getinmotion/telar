/**
 * Orders Service
 * Servicio para gestión de órdenes/pedidos con el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { BackendOrder, GetBuyerOrdersWithItemsResponse } from '@/types/orders.types';

/**
 * Obtener órdenes de un comprador con items
 *
 * Retorna todas las órdenes donde el usuario es el comprador,
 * incluyendo los items de cada orden.
 *
 * @param {string} userId - ID del usuario comprador (UUID)
 * @returns {Promise<BackendOrder[]>} Lista de órdenes con items
 *
 * @endpoint GET /orders/buyer/:user_id/with-items
 *
 * @example
 * const orders = await getBuyerOrdersWithItems(user.id);
 */
export const getBuyerOrdersWithItems = async (userId: string): Promise<BackendOrder[]> => {
  try {
    const response = await telarApi.get<GetBuyerOrdersWithItemsResponse>(
      `/orders/buyer/${userId}/with-items`
    );
    return response.data;
  } catch (error: any) {
    console.error('[OrdersActions] Error fetching buyer orders:', error);
    throw error;
  }
};

/**
 * Convierte un valor en "minor units" (centavos) a número decimal
 *
 * @param {string | null | undefined} minorValue - Valor en centavos como string
 * @returns {number} Valor convertido a pesos (dividido por 100)
 *
 * @example
 * minorToMajor("100000") // 1000 (pesos)
 */
export const minorToMajor = (minorValue: string | null | undefined): number => {
  if (!minorValue) return 0;
  return parseFloat(minorValue) / 100;
};
