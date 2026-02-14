/**
 * Artisan Shops Service - Centralized API calls to NestJS backend
 * 
 * Este servicio maneja todas las operaciones CRUD para artisan_shops
 * usando el backend NestJS en lugar de consultas directas a Supabase.
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  ArtisanShop,
  CreateArtisanShopPayload,
  UpdateArtisanShopPayload,
  ArtisanShopErrorResponse
} from '@/types/artisanShop.types';

/**
 * Obtiene la tienda de un artesano por su user_id
 * @param userId - ID del usuario propietario
 * @returns La tienda del artesano o null si no existe
 */
export const getArtisanShopByUserId = async (
  userId: string
): Promise<ArtisanShop | null> => {
  try {
    const response = await telarApi.get<ArtisanShop>(
      `/telar/server/artisan-shops/user/${userId}`
    );
    return response.data;
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
 * Endpoint: GET /telar/server/artisan-shops/slug/{slug}
 */
export const getArtisanShopBySlug = async (
  shopSlug: string
): Promise<ArtisanShop | null> => {
  try {
    const response = await telarApi.get<ArtisanShop>(
      `/telar/server/artisan-shops/slug/${shopSlug}`
    );
    return response.data;
  } catch (error: any) {
    // Si es 404, la tienda no existe (es válido)
    if (error.response?.status === 404) {
      return null;
    }

    console.error('[ArtisanShops] Error al obtener tienda por slug:', error);

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
 * Endpoint: GET /telar/server/artisan-shops/slug/{slug}
 */
export const isSlugAvailable = async (slug: string): Promise<boolean> => {
  try {
    const shop = await getArtisanShopBySlug(slug);
    return shop === null; // null = no existe = disponible
  } catch (error) {
    console.error('[ArtisanShops] Error al verificar disponibilidad de slug:', error);
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
    console.error('[ArtisanShops] Error al verificar existencia:', error);
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
      `/telar/server/artisan-shops`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error('[ArtisanShops] Error al crear tienda:', error);
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
      `/telar/server/artisan-shops/${shopId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error('[ArtisanShops] Error al actualizar tienda:', error);
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
      console.warn(`[ArtisanShops] No se encontró tienda para userId: ${userId}`);
      return null;
    }

    return await updateArtisanShop(shop.id, payload);
  } catch (error) {
    console.error('[ArtisanShops] Error al actualizar tienda por userId:', error);
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
