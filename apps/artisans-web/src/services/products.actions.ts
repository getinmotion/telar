/**
 * Products Service - Migrado a nueva arquitectura multicapa
 *
 * Este servicio usa los endpoints /products-new que apuntan a la nueva
 * arquitectura de 9 tablas (products_core + 8 capas especializadas)
 *
 * MAPEO: ProductResponse (nueva arquitectura) → Product (legacy format)
 * Los componentes siguen recibiendo Product (snake_case) para mantener compatibilidad
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { ProductResponse, LegacyProduct } from '@telar/shared-types';

// Tipo alias para compatibilidad con código existente
type Product = LegacyProduct;

// ============= FUNCIONES DE MAPEO =============

/**
 * Convierte minor units (centavos) a precio decimal
 * Ejemplo: "5000000" → 50000.00
 */
function priceFromMinor(priceMinor: string): number {
  return parseInt(priceMinor, 10) / 100;
}

/**
 * Convierte precio decimal a minor units (centavos)
 * Ejemplo: 50000.00 → "5000000"
 */
function priceToMinor(price: number): string {
  return (price * 100).toString();
}

/**
 * Mapea ProductResponse (nueva arquitectura) → Product (formato legacy)
 *
 * Esta función convierte la respuesta de /products-new al formato que
 * esperan los componentes existentes (Product con snake_case)
 *
 * PRIORIDAD DE DATOS:
 * - Precio/Stock: Tomar de la primera variante activa o la primera disponible
 * - Imágenes: Convertir de media[] a formato legacy
 * - Materiales/Técnicas: Extraer IDs de las relaciones
 */
export function mapProductResponseToLegacy(product: ProductResponse): Product {
  // Obtener variante primaria (primera activa o primera disponible)
  const primaryVariant = product.variants?.find(v => v.isActive) || product.variants?.[0];

  // Mapear imágenes de media a formato legacy
  const images = product.media
    ? product.media
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(m => ({
        url: m.mediaUrl,
        alt: '',
        order: m.displayOrder,
        is_primary: m.isPrimary,
      }))
    : [];

  const materials = product.materials
    ? product.materials.map(m => m.material.name) // Usar nombre del material como tag
    : [];

  // const tags = product.badges
  //   ? product.badges.map(m => m.) // Usar nombre del badge como tag
  //   : [];

  // Construir objeto legacy Product
  return {
    // Identificación
    id: product.id, // Usar legacyProductId si existe, sino el id nuevo
    shop_id: product.storeId,

    // Información básica
    name: product.name,
    description: product.history || '', // history → description
    short_description: product.shortDescription,

    // Precio e inventario (de variants)
    price: primaryVariant ? priceFromMinor(primaryVariant.basePriceMinor) : 0,
    compare_price: primaryVariant?.basePriceMinor
      ? priceFromMinor(primaryVariant.basePriceMinor)
      : undefined,
    inventory: primaryVariant?.stockQuantity || 0,
    sku: primaryVariant?.sku || undefined,

    // Multimedia
    images: images,

    // Categorización
    category: product.category?.name || product.artisanalIdentity?.curatorialCategory?.name || undefined,
    subcategory: product.artisanalIdentity?.curatorialCategoryId || undefined,
    tags: [], // TODO: Implementar tags cuando exista la tabla

    // Especificaciones físicas (de physicalSpecs)
    weight: product.physicalSpecs?.realWeightKg,
    dimensions: product.physicalSpecs
      ? {
        height: product.physicalSpecs.heightCm,
        width: product.physicalSpecs.widthCm,
        length: product.physicalSpecs.lengthOrDiameterCm,
      }
      : undefined,

    // Artesanía
    materials: materials,
    techniques: [
      ...product.materials,
    ].filter(Boolean), // Filtrar nulls/undefined
    production_time:
      product.artisanalIdentity?.estimatedElaborationTime ||
      product.production?.productionTimeDays?.toString() ||
      undefined,

    // Estados y configuración
    customizable: false,
    active: product.status === 'approved' || product.status === 'published',
    featured: false, // TODO: Agregar campo featured si es necesario
    moderation_status: product.status,

    // Metadatos
    seo_data: {}, // TODO: Agregar SEO data si es necesario
    shipping_data_complete: !!product.logistics,
    ready_for_checkout: !!primaryVariant && primaryVariant.stockQuantity > 0,
    allows_local_pickup: true, // TODO: Implementar cuando exista el campo

    // Timestamps
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
}

/**
 * Mapea múltiples ProductResponse → Product[]
 */
export function mapProductsResponseToLegacy(products: ProductResponse[]): Product[] {
  return products.map(mapProductResponseToLegacy);
}

// ============= FUNCIONES GET (Operaciones de lectura) =============

/**
 * Obtener un producto por ID
 * Endpoint: GET /products-new/:id
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const response = await telarApi.get<ProductResponse>(`/products-new/${productId}`);
    return mapProductResponseToLegacy(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

/**
 * Obtener todos los productos de una tienda
 * Endpoint: GET /products-new/store/:storeId
 *
 * NOTA: storeId es el ID de artisan_shops (legacy), NO de la tabla stores
 */
export async function getProductsByShopId(shopId: string): Promise<Product[]> {
  const response = await telarApi.get<ProductResponse[]>(
    `/products-new/store/${shopId}`
  );
  return mapProductsResponseToLegacy(response.data);
}

/**
 * Obtener todos los productos activos de un usuario (a través de su tienda)
 * Endpoint: GET /products-new/user/:userId
 *
 * Busca productos cuyo artisan_shop pertenezca al userId especificado
 */
export async function getProductsByUserId(userId: string): Promise<Product[]> {
  const response = await telarApi.get<ProductResponse[]>(
    `/products-new/user/${userId}`
  );
  return mapProductsResponseToLegacy(response.data);
}

/**
 * Obtener productos de una tienda para el marketplace (solo aprobados)
 * Endpoint: GET /products-new/store/:storeId con filtro de status
 */
export async function getMarketplaceProductsByShopId(shopId: string): Promise<Product[]> {
  const response = await telarApi.get<ProductResponse[]>(
    `/products-new/store/${shopId}`,
    {
      params: {
        status: 'approved', // Filtrar solo aprobados
      },
    }
  );
  return mapProductsResponseToLegacy(response.data);
}

/**
 * Obtener el conteo de productos aprobados de una tienda
 * Endpoint: GET /products-new/store/:storeId con filtro y contar
 */
export async function getApprovedProductsCount(shopId: string): Promise<number> {
  const response = await telarApi.get<ProductResponse[]>(
    `/products-new/store/${shopId}`,
    {
      params: {
        status: 'approved',
      },
    }
  );
  return response.data.length;
}

/**
 * Obtener un producto por su legacyProductId
 * Endpoint: GET /products-new/legacy/:legacyId
 *
 * Útil para buscar productos usando el ID de la tabla legacy shop.products
 */
export async function getProductByLegacyId(legacyId: string): Promise<Product | null> {
  try {
    const response = await telarApi.get<ProductResponse>(
      `/products-new/legacy/${legacyId}`
    );
    return mapProductResponseToLegacy(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

// ============= FUNCIONES POST/PATCH/DELETE =============
// NOTA: Estas operaciones siguen usando /products (legacy) por ahora
// TODO: Migrar a /products-new cuando el backend esté listo

/**
 * Crear un nuevo producto
 * Endpoint: POST /products (legacy)
 *
 * TODO: Migrar a POST /products-new con estructura multicapa
 */
export async function createProduct(
  productData: Record<string, any>
): Promise<Product> {
  // Mapear campos snake_case a camelCase para backend legacy
  const payload = {
    shopId: productData.shop_id,
    name: productData.name,
    shortDescription: productData.short_description || productData.description,
    description: productData.description,
    price: productData.price,
    comparePrice: productData.compare_price,
    images: productData.images,
    category: productData.category,
    subcategory: productData.subcategory,
    tags: productData.tags || [],
    inventory: productData.inventory,
    sku: productData.sku,
    weight: productData.weight,
    dimensions: productData.dimensions,
    materials: productData.materials || [],
    techniques: productData.techniques || [],
    productionTime: productData.production_time,
    customizable: productData.customizable || false,
    active: productData.active !== false,
    featured: productData.featured || false,
    moderationStatus: productData.moderation_status,
    seoData: productData.seo_data || {},
    shippingDataComplete: productData.shipping_data_complete,
    readyForCheckout: productData.ready_for_checkout,
    allowsLocalPickup: productData.allows_local_pickup,
  };

  const response = await telarApi.post('/products', payload);

  // Si el backend retorna ProductResponse, mapear
  if ('storeId' in response.data) {
    return mapProductResponseToLegacy(response.data);
  }

  // Si retorna formato legacy, convertir camelCase a snake_case
  return {
    id: response.data.id,
    shop_id: response.data.shopId,
    name: response.data.name,
    description: response.data.description,
    short_description: response.data.shortDescription,
    price: response.data.price,
    compare_price: response.data.comparePrice,
    inventory: response.data.inventory,
    sku: response.data.sku,
    images: response.data.images || [],
    category: response.data.category,
    subcategory: response.data.subcategory,
    tags: response.data.tags || [],
    weight: response.data.weight,
    dimensions: response.data.dimensions,
    materials: response.data.materials || [],
    techniques: response.data.techniques || [],
    production_time: response.data.productionTime,
    customizable: response.data.customizable || false,
    active: response.data.active,
    featured: response.data.featured || false,
    moderation_status: response.data.moderationStatus,
    seo_data: response.data.seoData || {},
    shipping_data_complete: response.data.shippingDataComplete,
    ready_for_checkout: response.data.readyForCheckout,
    allows_local_pickup: response.data.allowsLocalPickup,
    created_at: response.data.createdAt || new Date().toISOString(),
    updated_at: response.data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Actualizar un producto existente
 * Endpoint: PATCH /products/:id (legacy)
 *
 * TODO: Migrar a PATCH /products-new/:id con estructura multicapa
 */
export async function updateProduct(
  productId: string,
  updates: Record<string, any>
): Promise<Product> {
  // Mapear campos snake_case a camelCase
  const payload: Record<string, any> = {};

  const fieldMap: Record<string, string> = {
    shop_id: 'shopId',
    short_description: 'shortDescription',
    compare_price: 'comparePrice',
    production_time: 'productionTime',
    seo_data: 'seoData',
    shipping_data_complete: 'shippingDataComplete',
    ready_for_checkout: 'readyForCheckout',
    allows_local_pickup: 'allowsLocalPickup',
    moderation_status: 'moderationStatus',
  };

  Object.entries(updates).forEach(([key, value]) => {
    const mappedKey = fieldMap[key] || key;
    payload[mappedKey] = value;
  });

  const response = await telarApi.patch(`/products/${productId}`, payload);

  // Si el backend retorna ProductResponse, mapear
  if ('storeId' in response.data) {
    return mapProductResponseToLegacy(response.data);
  }

  // Si retorna formato legacy, convertir camelCase a snake_case
  return {
    id: response.data.id,
    shop_id: response.data.shopId,
    name: response.data.name,
    description: response.data.description,
    short_description: response.data.shortDescription,
    price: response.data.price,
    compare_price: response.data.comparePrice,
    inventory: response.data.inventory,
    sku: response.data.sku,
    images: response.data.images || [],
    category: response.data.category,
    subcategory: response.data.subcategory,
    tags: response.data.tags || [],
    weight: response.data.weight,
    dimensions: response.data.dimensions,
    materials: response.data.materials || [],
    techniques: response.data.techniques || [],
    production_time: response.data.productionTime,
    customizable: response.data.customizable || false,
    active: response.data.active,
    featured: response.data.featured || false,
    moderation_status: response.data.moderationStatus,
    seo_data: response.data.seoData || {},
    shipping_data_complete: response.data.shippingDataComplete,
    ready_for_checkout: response.data.readyForCheckout,
    allows_local_pickup: response.data.allowsLocalPickup,
    created_at: response.data.createdAt || new Date().toISOString(),
    updated_at: response.data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Eliminar un producto (soft delete)
 * Endpoint: DELETE /products/:id (legacy)
 *
 * TODO: Migrar a DELETE /products-new/:id
 */
export async function deleteProduct(productId: string): Promise<void> {
  await telarApi.delete(`/products/${productId}`);
}
