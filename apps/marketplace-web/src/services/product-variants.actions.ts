/**
 * Product Variants Service
 * Servicio para gestión de variantes de productos con el backend NestJS
 */

import { telarApiPublic } from '@/integrations/api/telarApi';
import { toastError } from '@/utils/toast.utils';

/**
 * Interfaz para variante de producto
 */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name?: string;
  optionValues?: Record<string, any>;
  price?: number;
  compareAtPrice?: number;
  cost?: number;
  stock: number;
  minStock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
  // Campos adicionales para compatibilidad con el frontend
  price_adjustment?: number;
  attributes?: Record<string, any>;
  active?: boolean;
}

/**
 * Obtener variantes de un producto específico
 *
 * Retorna todas las variantes activas del producto especificado.
 *
 * @param {string} productId - ID del producto (UUID)
 * @returns {Promise<ProductVariant[]>} Array de variantes del producto
 *
 * @endpoint GET /product-variants/product/:productId
 *
 * @example
 * const variants = await getProductVariants('123e4567-e89b-12d3-a456-426614174000');
 */
export const getProductVariants = async (productId: string): Promise<ProductVariant[]> => {
  try {
    const response = await telarApiPublic.get<ProductVariant[]>(
      `/product-variants/product/${productId}`
    );
    return response.data;
  } catch (error: any) {
    // Silenciar error - variantes son opcionales
    console.error('Error fetching product variants:', error);
    return [];
  }
};

/**
 * Obtener una variante por su ID
 *
 * @param {string} id - ID de la variante (UUID)
 * @returns {Promise<ProductVariant>} Detalle de la variante
 *
 * @endpoint GET /product-variants/:id
 *
 * @example
 * const variant = await getProductVariantById('123e4567-e89b-12d3-a456-426614174000');
 */
export const getProductVariantById = async (id: string): Promise<ProductVariant> => {
  try {
    const response = await telarApiPublic.get<ProductVariant>(`/product-variants/${id}`);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Obtener variante por SKU
 *
 * @param {string} sku - SKU de la variante
 * @returns {Promise<ProductVariant>} Detalle de la variante
 *
 * @endpoint GET /product-variants/sku/:sku
 *
 * @example
 * const variant = await getProductVariantBySku('PROD-001-RED-M');
 */
export const getProductVariantBySku = async (sku: string): Promise<ProductVariant> => {
  try {
    const response = await telarApiPublic.get<ProductVariant>(`/product-variants/sku/${sku}`);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};
