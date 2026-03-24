/**
 * Artisan Shops Service - Centralized API calls to NestJS backend
 *
 * Este servicio maneja todas las operaciones CRUD para artisan_shops.
 *
 * MIGRACIÓN EN PROGRESO:
 * - Operaciones GET migradas a /stores endpoints (nueva arquitectura shop.stores)
 * - Operaciones POST/PATCH/DELETE siguen usando /artisan-shops (legacy)
 *
 * Para tipos de la nueva arquitectura, ver: @/types/store.types
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { ArtisanShop } from '@telar/shared-types';
import type {
  CreateArtisanShopPayload,
  UpdateArtisanShopPayload,
  ArtisanShopErrorResponse
} from '@/types/artisanShop.types';

// Importar funciones de stores para operaciones GET
import {
  getAllStores,
  getStoreBySlug,
  getStoreByUserId,
  findStoreByLegacyId,
  mapStoreToArtisanShop
} from './stores.actions';

/**
 * Obtiene todas las tiendas publicadas para el directorio público
 * ✅ MIGRADO: GET /stores (filtrado en cliente)
 */
export const getPublishedArtisanShops = async (): Promise<ArtisanShop[]> => {
  try {
    const stores = await getAllStores();

    // Filtrar solo tiendas publicadas y activas
    const publishedStores = stores.filter(store => {
      const legacy = store.legacy || store.legacyShop;
      return legacy?.active && legacy?.publishStatus === 'published';
    });

    // Mapear a formato ArtisanShop
    return publishedStores.map(mapStoreToArtisanShop);
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ArtisanShopErrorResponse;
    }
    throw error;
  }
};

/**
 * Obtiene una tienda por su ID (legacyId de artisan_shops)
 * @param shopId - ID de la tienda (legacy artisan_shops.id)
 * @returns La tienda o null si no existe
 *
 * ✅ MIGRADO: Busca en /stores por legacyId
 */
export const getArtisanShopById = async (
  shopId: string
): Promise<ArtisanShop | null> => {
  try {
    const store = await findStoreByLegacyId(shopId);
    if (!store) {
      return null;
    }
    return mapStoreToArtisanShop(store);
  } catch (error: any) {
    // Si es 404, la tienda no existe (es válido)
    if (error.response?.status === 404) {
      return null;
    }

    // Para otros errores, lanzar la respuesta estructurada
    if (error.response?.data) {
      throw error.response.data as ArtisanShopErrorResponse;
    }
    throw error;
  }
};

/**
 * Obtiene la tienda de un artesano por su user_id
 * @param userId - ID del usuario propietario
 * @returns La tienda del artesano o null si no existe
 *
 * ✅ MIGRADO: GET /stores/user/:userId
 */
export const getArtisanShopByUserId = async (
  userId: string
): Promise<ArtisanShop | null> => {
  try {
    const store = await getStoreByUserId(userId);
    if (!store) {
      return null;
    }
    return mapStoreToArtisanShop(store);
  } catch (error: any) {
    // Si es 404, la tienda no existe (es válido)
    if (error.response?.status === 404) {
      return null;
    }

    // Para otros errores, lanzar la respuesta estructurada
    if (error.response?.data) {
      throw error.response.data as ArtisanShopErrorResponse;
    }
    throw error;
  }
};

/**
 * Obtiene una tienda por su slug
 * @param shopSlug - Slug de la tienda
 * @returns La tienda o null si no existe
 *
 * ✅ MIGRADO: GET /stores/slug/:slug
 */
export const getArtisanShopBySlug = async (
  shopSlug: string
): Promise<ArtisanShop | null> => {
  try {
    const store = await getStoreBySlug(shopSlug);
    if (!store) {
      return null;
    }
    return mapStoreToArtisanShop(store);
  } catch (error: any) {
    // Si es 404, la tienda no existe (es válido)
    if (error.response?.status === 404) {
      return null;
    }

    // Para otros errores, lanzar la respuesta estructurada
    if (error.response?.data) {
      throw error.response.data as ArtisanShopErrorResponse;
    }
    throw error;
  }
};

/**
 * Verifica si un slug está disponible para usar
 * @param slug - Slug a verificar
 * @returns true si está disponible (no existe), false si ya existe
 * 
 * Endpoint: GET /artisan-shops/slug/{slug}
 */
export const isSlugAvailable = async (slug: string): Promise<boolean> => {
  try {
    const shop = await getArtisanShopBySlug(slug);
    return shop === null; // null = no existe = disponible
  } catch (error) {
    return false; // En caso de error, asumir que no está disponible
  }
};

/**
 * Verifica si un usuario tiene una tienda
 * @param userId - ID del usuario
 * @returns true si existe, false si no
 */
export const hasArtisanShop = async (userId: string): Promise<boolean> => {
  try {
    const shop = await getArtisanShopByUserId(userId);
    return shop !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Crea una nueva tienda artesanal
 * @param payload - Datos de la tienda a crear
 * @returns La tienda creada
 */
export const createArtisanShop = async (
  payload: CreateArtisanShopPayload
): Promise<ArtisanShop> => {
  try {
    const response = await telarApi.post<ArtisanShop>(
      `/artisan-shops`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ArtisanShopErrorResponse;
    }
    throw error;
  }
};

/**
 * Actualiza una tienda artesanal existente
 * @param shopId - ID de la tienda
 * @param payload - Datos a actualizar (campos opcionales)
 * @returns La tienda actualizada
 */
export const updateArtisanShop = async (
  shopId: string,
  payload: UpdateArtisanShopPayload
): Promise<ArtisanShop> => {
  try {
    const response = await telarApi.patch<ArtisanShop>(
      `/artisan-shops/${shopId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ArtisanShopErrorResponse;
    }
    throw error;
  }
};

/**
 * Actualiza una tienda por user_id (helper útil)
 * @param userId - ID del usuario propietario
 * @param payload - Datos a actualizar
 * @returns La tienda actualizada
 */
export const updateArtisanShopByUserId = async (
  userId: string,
  payload: UpdateArtisanShopPayload
): Promise<ArtisanShop | null> => {
  try {
    // Primero obtener la tienda para tener el shopId
    const shop = await getArtisanShopByUserId(userId);
    if (!shop) {
      return null;
    }

    return await updateArtisanShop(shop.id, payload);
  } catch (error) {
    throw error;
  }
};

/**
 * Crea o actualiza una tienda (UPSERT)
 * Verifica si existe y ejecuta CREATE o UPDATE según corresponda
 * @param userId - ID del usuario propietario
 * @param payload - Datos de la tienda
 * @returns La tienda creada o actualizada
 */
export const upsertArtisanShop = async (
  userId: string,
  payload: CreateArtisanShopPayload | UpdateArtisanShopPayload
): Promise<ArtisanShop> => {
  const exists = await hasArtisanShop(userId);

  if (exists) {
    return await updateArtisanShopByUserId(userId, payload as UpdateArtisanShopPayload) as ArtisanShop;
  } else {
    return await createArtisanShop({ ...payload, userId } as CreateArtisanShopPayload);
  }
};
