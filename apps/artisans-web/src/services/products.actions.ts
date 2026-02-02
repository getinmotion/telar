/**
 * Products Service
 * Servicio para gestión de productos en el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import {
  GetProductsByUserIdResponse,
  Product
} from '@/types/product.types';

/**
 * Obtener todos los productos activos de un usuario
 * @param userId - ID del usuario
 * @returns Array de productos activos ligados al artisan_shops del usuario
 * @throws Error si la petición falla
 * 
 * Endpoint: GET /telar/server/products/user/{user_id}
 */
export const getProductsByUserId = async (userId: string): Promise<Product[]> => {
  try {
    const response = await telarApi.get<GetProductsByUserIdResponse>(
      `/telar/server/products/user/${userId}`
    );

    return response.data.data;
  } catch (error: any) {
    console.error('[products.actions] Error fetching products by user ID:', error);
    throw error;
  }
};
