/**
 * Products Service
 * Servicio para gestión de productos en el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import { Product } from '@/types/artisan';

// DTO que retorna el backend (camelCase)
interface BackendProductDTO {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  subcategory?: string;
  tags?: string[];
  inventory?: number;
  sku?: string;
  weight?: number;
  dimensions?: any;
  materials?: string[];
  techniques?: string[];
  productionTime?: string;
  customizable?: boolean;
  active: boolean;
  featured?: boolean;
  moderationStatus?: string;
  seoData?: any;
  shippingDataComplete?: boolean;
  readyForCheckout?: boolean;
  allowsLocalPickup?: boolean;
  category?: { id: string; name: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Convierte el DTO camelCase del backend al tipo Product snake_case del frontend
 */
function mapProductFromDTO(dto: BackendProductDTO): Product {
  const categoryName =
    typeof dto.category === 'object' ? dto.category?.name : dto.category;

  return {
    id: dto.id,
    shop_id: dto.shopId,
    name: dto.name,
    description: dto.description,
    short_description: dto.shortDescription,
    price: dto.price,
    compare_price: dto.comparePrice,
    images: dto.images || [],
    category: categoryName,
    subcategory: dto.subcategory,
    tags: dto.tags || [],
    inventory: dto.inventory ?? 0,
    sku: dto.sku,
    weight: dto.weight,
    dimensions: dto.dimensions,
    materials: dto.materials || [],
    techniques: dto.techniques || [],
    production_time: dto.productionTime,
    customizable: dto.customizable ?? false,
    active: dto.active,
    featured: dto.featured ?? false,
    moderation_status: dto.moderationStatus,
    seo_data: dto.seoData,
    shipping_data_complete: dto.shippingDataComplete,
    ready_for_checkout: dto.readyForCheckout,
    allows_local_pickup: dto.allowsLocalPickup,
    created_at: dto.createdAt ?? new Date().toISOString(),
    updated_at: dto.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Convierte un payload snake_case del frontend al DTO camelCase del backend
 */
function toBackendPayload(data: Record<string, any>): Record<string, any> {
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
    category_id: 'categoryId',
    made_to_order: 'madeToOrder',
    lead_time_days: 'leadTimeDays',
    production_time_hours: 'productionTimeHours',
    requires_customization: 'requiresCustomization',
    marketplace_links: 'marketplaceLinks',
    nft_enabled: 'nftEnabled',
  };

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [fieldMap[key] ?? key, value])
  );
}

/**
 * Obtener todos los productos de una tienda
 * Endpoint: GET /products/shop/:shopId
 */
export async function getProductsByShopId(shopId: string): Promise<Product[]> {
  const response = await telarApi.get<BackendProductDTO[]>(
    `/products/shop/${shopId}`
  );
  return response.data.map(mapProductFromDTO);
}

/**
 * Crear un nuevo producto
 * Endpoint: POST /products
 */
export async function createProduct(
  productData: Record<string, any>
): Promise<Product> {
  const payload = toBackendPayload(productData);
  const response = await telarApi.post<BackendProductDTO>(
    '/products',
    payload
  );
  return mapProductFromDTO(response.data);
}

/**
 * Actualizar un producto existente
 * Endpoint: PATCH /products/:id
 */
export async function updateProduct(
  productId: string,
  updates: Record<string, any>
): Promise<Product> {
  const payload = toBackendPayload(updates);
  const response = await telarApi.patch<BackendProductDTO>(
    `/products/${productId}`,
    payload
  );
  return mapProductFromDTO(response.data);
}

/**
 * Eliminar un producto
 * Endpoint: DELETE /products/:id
 */
export async function deleteProduct(productId: string): Promise<void> {
  await telarApi.delete(`/products/${productId}`);
}

/**
 * Obtener todos los productos activos de un usuario (a través de su tienda)
 * Endpoint: GET /products/user/:userId
 */
export async function getProductsByUserId(userId: string): Promise<Product[]> {
  const response = await telarApi.get<BackendProductDTO[]>(
    `/products/user/${userId}`
  );
  return response.data.map(mapProductFromDTO);
}

/**
 * Obtener el conteo de productos aprobados de una tienda
 * Endpoint: GET /products/shop/:shopId/approved-count
 */
export async function getApprovedProductsCount(shopId: string): Promise<number> {
  const response = await telarApi.get<{ count: number }>(
    `/products/shop/${shopId}/approved-count`
  );
  return response.data.count;
}
