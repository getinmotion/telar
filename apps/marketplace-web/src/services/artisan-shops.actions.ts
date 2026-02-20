/**
 * Artisan Shops Service
 * Servicio para gestión de tiendas artesanales con el backend NestJS
 */

import { telarApiPublic, telarApi } from '@/integrations/api/telarApi';
import type {
  ArtisanShop,
  ArtisanShopsResponse,
  ArtisanShopsFilters,
  CreateArtisanShopRequest,
  UpdateArtisanShopRequest,
} from '@/types/artisan-shops.types';

/**
 * Obtener listado de tiendas con filtros y paginación
 *
 * Soporta búsqueda, filtros por región, tipo de oficio, estado, y más.
 * Incluye paginación y ordenamiento personalizado.
 *
 * @param {ArtisanShopsFilters} filters - Filtros opcionales para la búsqueda
 * @returns {Promise<ArtisanShopsResponse>} Listado paginado de tiendas con metadata
 *
 * @endpoint GET /artisan-shops
 *
 * @example
 * // Obtener todas las tiendas (página 1, límite 20)
 * const shops = await getArtisanShops();
 *
 * @example
 * // Búsqueda con filtros
 * const shops = await getArtisanShops({
 *   active: true,
 *   publishStatus: 'published',
 *   marketplaceApproved: true,
 *   region: 'Valle del Cauca',
 *   sortBy: 'shopName',
 *   order: 'ASC'
 * });
 *
 * @example
 * // Solo tiendas con productos aprobados
 * const shops = await getArtisanShops({
 *   hasApprovedProducts: true,
 *   marketplaceApproved: true
 * });
 */
export const getArtisanShops = async (
  filters?: ArtisanShopsFilters
): Promise<ArtisanShopsResponse> => {
  try {
    const response = await telarApiPublic.get<ArtisanShopsResponse>('/artisan-shops', {
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtener tiendas destacadas (featured) con productos aprobados
 *
 * Retorna solo tiendas activas, publicadas, aprobadas para marketplace
 * y que tienen al menos 1 producto con moderation_status aprobado.
 *
 * @param {number} limit - Límite de tiendas a retornar (default: 8)
 * @returns {Promise<ArtisanShop[]>} Lista de tiendas destacadas
 *
 * @endpoint GET /artisan-shops/featured
 *
 * @example
 * // Obtener 8 tiendas destacadas (default)
 * const featuredShops = await getFeaturedShops();
 *
 * @example
 * // Obtener 20 tiendas destacadas
 * const featuredShops = await getFeaturedShops(20);
 */
export const getFeaturedShops = async (limit: number = 8): Promise<ArtisanShop[]> => {
  try {
    const response = await telarApiPublic.get<ArtisanShop[]>('/artisan-shops/featured', {
      params: { limit },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtener el detalle de una tienda por su ID
 *
 * @param {string} id - ID de la tienda (UUID)
 * @returns {Promise<ArtisanShop>} Detalle completo de la tienda
 *
 * @endpoint GET /artisan-shops/:id
 *
 * @example
 * const shop = await getArtisanShopById('123e4567-e89b-12d3-a456-426614174000');
 */
export const getArtisanShopById = async (id: string): Promise<ArtisanShop> => {
  try {
    const response = await telarApiPublic.get<ArtisanShop>(`/artisan-shops/${id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtener el detalle de una tienda por su slug
 *
 * @param {string} slug - Slug de la tienda
 * @returns {Promise<ArtisanShop>} Detalle completo de la tienda
 *
 * @endpoint GET /artisan-shops/slug/:slug
 *
 * @example
 * const shop = await getArtisanShopBySlug('ceramica-valle');
 */
export const getArtisanShopBySlug = async (slug: string): Promise<ArtisanShop> => {
  try {
    const response = await telarApiPublic.get<ArtisanShop>(`/artisan-shops/slug/${slug}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtener tiendas de un usuario específico (requiere autenticación)
 *
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<ArtisanShop[]>} Lista de tiendas del usuario
 *
 * @endpoint GET /artisan-shops/user/:userId
 *
 * @example
 * const userShops = await getShopsByUser('user-uuid');
 */
export const getShopsByUser = async (userId: string): Promise<ArtisanShop[]> => {
  try {
    const response = await telarApi.get<ArtisanShop[]>(`/artisan-shops/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Crear una nueva tienda (requiere autenticación)
 *
 * @param {CreateArtisanShopRequest} data - Datos de la tienda a crear
 * @returns {Promise<ArtisanShop>} Tienda creada
 *
 * @endpoint POST /artisan-shops
 *
 * @example
 * const newShop = await createArtisanShop({
 *   shopName: 'Cerámica Valle',
 *   shopSlug: 'ceramica-valle',
 *   description: 'Taller de cerámica tradicional',
 *   craftType: 'Cerámica',
 *   region: 'Valle del Cauca'
 * });
 */
export const createArtisanShop = async (
  data: CreateArtisanShopRequest
): Promise<ArtisanShop> => {
  try {
    const response = await telarApi.post<ArtisanShop>('/artisan-shops', data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Actualizar una tienda existente (requiere autenticación y permisos)
 *
 * @param {string} id - ID de la tienda a actualizar
 * @param {UpdateArtisanShopRequest} data - Datos a actualizar
 * @returns {Promise<ArtisanShop>} Tienda actualizada
 *
 * @endpoint PATCH /artisan-shops/:id
 *
 * @example
 * const updated = await updateArtisanShop('shop-id', {
 *   description: 'Nueva descripción'
 * });
 */
export const updateArtisanShop = async (
  id: string,
  data: UpdateArtisanShopRequest
): Promise<ArtisanShop> => {
  try {
    const response = await telarApi.patch<ArtisanShop>(`/artisan-shops/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Eliminar una tienda (requiere autenticación y permisos de admin)
 *
 * @param {string} id - ID de la tienda a eliminar (UUID)
 * @returns {Promise<{ message: string }>} Mensaje de confirmación
 *
 * @endpoint DELETE /artisan-shops/:id
 *
 * @example
 * const result = await deleteArtisanShop('shop-id');
 * // result: { message: "Tienda con ID xxx eliminada exitosamente" }
 */
export const deleteArtisanShop = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await telarApi.delete<{ message: string }>(
      `/artisan-shops/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
