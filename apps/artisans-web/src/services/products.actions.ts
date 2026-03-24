/**
 * Products Service - Servicio Legacy
 *
 * MIGRACIÓN EN PROGRESO:
 * - Operaciones GET migradas a /products-new endpoints (nueva arquitectura multicapa)
 * - Operaciones POST/PATCH/DELETE siguen usando /products (legacy)
 *
 * Para tipos de la nueva arquitectura, ver: @telar/shared-types/products
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { LegacyProduct } from '@telar/shared-types';

// Importar funciones de products-new para operaciones GET
import {
  findProductByLegacyId,
  getProductsByStoreId,
  mapProductToLegacy,
  mapProductsToLegacy,
} from './products-new.actions';

// Importar función de stores para obtener storeId por userId
import { getStoreByUserId } from './stores.actions';

// Tipo alias para compatibilidad con código existente
type Product = LegacyProduct;

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
    inventory: dto.inventory != null ? Number(dto.inventory) : 0,
    sku: dto.sku,
    weight: dto.weight != null ? Number(dto.weight) : undefined,
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

  const numericFields = new Set(['price', 'comparePrice', 'inventory', 'weight']);

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      const mappedKey = fieldMap[key] ?? key;
      if (numericFields.has(mappedKey) && value != null && value !== '') {
        return [mappedKey, Number(value)];
      }
      return [mappedKey, value];
    })
  );
}

/**
 * Obtener un producto por ID (legacy productId)
 * ✅ MIGRADO: Usa products-new internamente
 * Endpoint: GET /products-new/legacy/:legacyId
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const product = await findProductByLegacyId(productId);
    if (!product) return null;
    return mapProductToLegacy(product);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

/**
 * Obtener todos los productos de una tienda
 * ✅ MIGRADO: Usa products-new internamente
 * Endpoint: GET /products-new/store/:storeId
 * @param shopId - Store ID (puede ser legacyId o storeId nuevo)
 */
export async function getProductsByShopId(shopId: string): Promise<Product[]> {
  try {
    const products = await getProductsByStoreId(shopId);
    return mapProductsToLegacy(products);
  } catch (error: any) {
    // Si falla, retornar array vacío para compatibilidad
    console.error(`Error fetching products for shop ${shopId}:`, error);
    return [];
  }
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
 * ✅ MIGRADO: Obtiene store por userId, luego productos
 * Endpoints: GET /stores/user/:userId → GET /products-new/store/:storeId
 */
export async function getProductsByUserId(userId: string): Promise<Product[]> {
  try {
    // Primero obtener la tienda del usuario
    const store = await getStoreByUserId(userId);
    if (!store) {
      return [];
    }

    // Luego obtener los productos de esa tienda
    const products = await getProductsByStoreId(store.id);
    return mapProductsToLegacy(products);
  } catch (error: any) {
    console.error(`Error fetching products for user ${userId}:`, error);
    return [];
  }
}

/**
 * Obtener productos de una tienda para el marketplace (solo aprobados)
 * ✅ MIGRADO: Usa products-new y filtra por status 'approved'
 * Endpoint: GET /products-new/store/:storeId
 */
export async function getMarketplaceProductsByShopId(shopId: string): Promise<Product[]> {
  try {
    const products = await getProductsByStoreId(shopId);

    // Filtrar solo productos aprobados
    const approvedProducts = products.filter(p => p.status === 'approved');

    return mapProductsToLegacy(approvedProducts);
  } catch (error: any) {
    console.error(`Error fetching marketplace products for shop ${shopId}:`, error);
    return [];
  }
}

/**
 * Obtener el conteo de productos aprobados de una tienda
 * ✅ MIGRADO: Obtiene productos y cuenta los aprobados
 * Endpoint: GET /products-new/store/:storeId
 */
export async function getApprovedProductsCount(shopId: string): Promise<number> {
  try {
    const products = await getProductsByStoreId(shopId);

    // Contar solo productos con status 'approved'
    const approvedCount = products.filter(p => p.status === 'approved').length;

    return approvedCount;
  } catch (error: any) {
    console.error(`Error counting approved products for shop ${shopId}:`, error);
    return 0;
  }
}
