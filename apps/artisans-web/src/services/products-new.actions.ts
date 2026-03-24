/**
 * Products-New Service - API calls para products-new (nueva arquitectura multicapa)
 *
 * Este servicio maneja las operaciones GET para la nueva tabla shop.products_core
 * y sus 8 capas relacionadas (artisanal_identity, physical_specs, logistics, etc.)
 *
 * Endpoints disponibles:
 * - GET /products-new - Obtener todos los productos
 * - GET /products-new/:id - Obtener producto por ID
 * - GET /products-new/store/:storeId - Obtener productos de una tienda
 * - GET /products-new/category/:categoryId - Obtener productos de una categoría
 * - GET /products-new/status/:status - Obtener productos por status
 * - GET /products-new/legacy/:legacyId - Obtener producto por legacy ID
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { ProductResponse, LegacyProduct } from '@telar/shared-types/products';

// ============= GET Functions =============

/**
 * Obtener todos los productos con todas las capas cargadas
 * Endpoint: GET /products-new
 */
export const getAllProducts = async (): Promise<ProductResponse[]> => {
  try {
    const response = await telarApi.get<ProductResponse[]>('/products-new');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all products:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener productos'
      );
    }
    throw error;
  }
};

/**
 * Obtener producto por ID (UUID de shop.products_core)
 * Endpoint: GET /products-new/:id
 */
export const getProductById = async (
  id: string
): Promise<ProductResponse | null> => {
  try {
    const response = await telarApi.get<ProductResponse>(
      `/products-new/${id}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching product ${id}:`, error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener producto'
      );
    }
    throw error;
  }
};

/**
 * Obtener productos de una tienda específica
 * Endpoint: GET /products-new/store/:storeId
 */
export const getProductsByStoreId = async (
  storeId: string
): Promise<ProductResponse[]> => {
  try {
    const response = await telarApi.get<ProductResponse[]>(
      `/products-new/store/${storeId}`
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching products for store ${storeId}:`, error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener productos de la tienda'
      );
    }
    throw error;
  }
};

/**
 * Obtener productos de una categoría específica
 * Endpoint: GET /products-new/category/:categoryId
 */
export const getProductsByCategoryId = async (
  categoryId: string
): Promise<ProductResponse[]> => {
  try {
    const response = await telarApi.get<ProductResponse[]>(
      `/products-new/category/${categoryId}`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching products for category ${categoryId}:`,
      error
    );
    if (error.response?.data) {
      throw new Error(
        error.response.data.message ||
          'Error al obtener productos de la categoría'
      );
    }
    throw error;
  }
};

/**
 * Obtener productos por status
 * Endpoint: GET /products-new/status/:status
 */
export const getProductsByStatus = async (
  status: string
): Promise<ProductResponse[]> => {
  try {
    const response = await telarApi.get<ProductResponse[]>(
      `/products-new/status/${status}`
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching products by status ${status}:`, error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener productos por status'
      );
    }
    throw error;
  }
};

/**
 * Obtener producto por su legacyProductId (ID de shop.products legacy)
 * Endpoint: GET /products-new/legacy/:legacyId
 */
export const findProductByLegacyId = async (
  legacyId: string
): Promise<ProductResponse | null> => {
  try {
    const response = await telarApi.get<ProductResponse>(
      `/products-new/legacy/${legacyId}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching product by legacy ID ${legacyId}:`, error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener producto por legacy ID'
      );
    }
    throw error;
  }
};

// ============= Helper Functions =============

/**
 * Convertir precio de minor units (centavos string) a número
 * Ejemplo: "5000000" → 50000.00
 */
export const priceFromMinor = (priceMinor: string): number => {
  return parseInt(priceMinor, 10) / 100;
};

/**
 * Convertir precio de número a minor units (centavos string)
 * Ejemplo: 50000.00 → "5000000"
 */
export const priceToMinor = (price: number): string => {
  return Math.round(price * 100).toString();
};

// ============= Mapping Functions =============

/**
 * Mapea ProductResponse (multicapa) → LegacyProduct (monolítico)
 *
 * Esta función mantiene compatibilidad con código existente que espera
 * el formato de Product de la tabla legacy shop.products.
 *
 * Prioridad de datos:
 * 1. Datos de relaciones normalizadas (variants, media, artisanalIdentity)
 * 2. Datos de products_core
 * 3. Valores por defecto
 */
export const mapProductToLegacy = (product: ProductResponse): LegacyProduct => {
  // Tomar primera variante activa como precio e inventario base
  const primaryVariant =
    product.variants?.find((v) => v.isActive) || product.variants?.[0];

  // Tomar primera imagen como primaria
  const primaryMedia =
    product.media?.find((m) => m.isPrimary) || product.media?.[0];

  return {
    // IDs
    id: product.legacyProductId || product.id,
    shop_id: product.storeId,

    // Información básica
    name: product.name,
    description: product.history || undefined,
    short_description: product.shortDescription,

    // Precio e inventario (desde variants)
    price: primaryVariant ? priceFromMinor(primaryVariant.basePriceMinor) : 0,
    compare_price: undefined,
    inventory: primaryVariant?.stockQuantity || 0,
    sku: primaryVariant?.sku || undefined,

    // Multimedia (desde product_media)
    images:
      product.media?.map((m) => ({
        url: m.mediaUrl,
        order: m.displayOrder,
        type: m.mediaType,
        isPrimary: m.isPrimary,
      })) || [],

    // Categorización
    category: product.categoryId || undefined,
    subcategory: undefined,
    tags: [],

    // Especificaciones físicas (desde physical_specs o variants)
    weight:
      product.physicalSpecs?.realWeightKg ||
      primaryVariant?.realWeightKg ||
      undefined,
    dimensions: product.physicalSpecs
      ? {
          height: product.physicalSpecs.heightCm,
          width: product.physicalSpecs.widthCm,
          length: product.physicalSpecs.lengthOrDiameterCm,
        }
      : undefined,

    // Artesanía (desde artisanal_identity y materials)
    materials: product.materials?.map((m) => m.materialId) || [],
    techniques: [
      product.artisanalIdentity?.primaryTechniqueId,
      product.artisanalIdentity?.secondaryTechniqueId,
    ].filter(Boolean),
    production_time:
      product.production?.productionTimeDays?.toString() || undefined,

    // Estados y configuración
    customizable: false, // No hay campo equivalente en nueva arquitectura
    active: product.status === 'approved',
    featured: false, // No hay campo equivalente en nueva arquitectura
    moderation_status: product.status,

    // Metadatos
    seo_data: {},
    shipping_data_complete: !!product.logistics,
    ready_for_checkout: !!primaryVariant && !!product.logistics,
    allows_local_pickup: false, // No hay campo equivalente en nueva arquitectura

    // Timestamps
    created_at: product.createdAt,
    updated_at: product.updatedAt || product.createdAt,
  };
};

/**
 * Mapea array de ProductResponse a array de LegacyProduct
 */
export const mapProductsToLegacy = (
  products: ProductResponse[]
): LegacyProduct[] => {
  return products.map(mapProductToLegacy);
};
