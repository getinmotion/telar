/**
 * Stores Service - API calls para shop.stores (nueva arquitectura)
 *
 * Este servicio maneja las operaciones GET para la nueva tabla shop.stores
 * que reemplaza gradualmente public.artisan_shops.
 *
 * Endpoints disponibles:
 * - GET /stores - Obtener todas las tiendas
 * - GET /stores/:id - Obtener tienda por ID (UUID de shop.stores)
 * - GET /stores/slug/:slug - Obtener tienda por slug
 * - GET /stores/user/:userId - Obtener tienda de un usuario
 * - GET /stores/legacy/:legacyId - Obtener solo datos legacy de artisan_shops
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { StoreResponse, ArtisanShop } from '@telar/shared-types';

// ============= GET Functions =============

/**
 * Obtener todas las tiendas con datos legacy cargados
 * Endpoint: GET /stores
 */
export const getAllStores = async (): Promise<StoreResponse[]> => {
  try {
    const response = await telarApi.get<StoreResponse[]>('/stores');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all stores:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener tiendas');
    }
    throw error;
  }
};

/**
 * Obtener tienda por ID (UUID de shop.stores)
 * Endpoint: GET /stores/:id
 */
export const getStoreById = async (id: string): Promise<StoreResponse | null> => {
  try {
    const response = await telarApi.get<StoreResponse>(`/stores/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching store ${id}:`, error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener tienda');
    }
    throw error;
  }
};

/**
 * Obtener tienda por slug único
 * Endpoint: GET /stores/slug/:slug
 */
export const getStoreBySlug = async (slug: string): Promise<StoreResponse | null> => {
  try {
    const response = await telarApi.get<StoreResponse>(`/stores/slug/${slug}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching store by slug ${slug}:`, error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener tienda por slug');
    }
    throw error;
  }
};

/**
 * Obtener tienda de un usuario específico
 * Endpoint: GET /stores/user/:userId
 */
export const getStoreByUserId = async (userId: string): Promise<StoreResponse | null> => {
  try {
    const response = await telarApi.get<StoreResponse>(`/stores/user/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching store for user ${userId}:`, error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener tienda del usuario');
    }
    throw error;
  }
};

/**
 * Obtener SOLO datos legacy de artisan_shops por legacyId
 * Endpoint: GET /stores/legacy/:legacyId
 */
export const getLegacyShopData = async (legacyId: string): Promise<any | null> => {
  try {
    const response = await telarApi.get(`/stores/legacy/${legacyId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching legacy shop ${legacyId}:`, error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Error al obtener datos legacy');
    }
    throw error;
  }
};

// ============= Mapping Functions =============

/**
 * Mapea StoreResponse (nuevo formato) → ArtisanShop (formato legacy)
 *
 * Esta función mantiene compatibilidad con código existente que espera
 * el formato de ArtisanShop de la tabla legacy public.artisan_shops.
 *
 * Prioridad de datos:
 * 1. Datos de relaciones normalizadas (contacts, artisanalProfile)
 * 2. Datos legacy si existen
 * 3. Datos de shop.stores
 * 4. Valores por defecto
 */
export const mapStoreToArtisanShop = (store: StoreResponse): ArtisanShop => {
  // El backend puede retornar legacy data en 'legacy' o 'legacyShop'
  const legacy = store.legacy || store.legacyShop;

  return {
    // IDs - Usar legacyId si existe, sino usar el id de stores
    id: store.legacyId || store.id,
    userId: store.userId,

    // Nombres - Prioridad: legacy > store
    shopName: legacy?.shopName || store.name,
    shopSlug: legacy?.shopSlug || store.slug,

    // Información básica
    description: legacy?.description || null,
    story: store.story || legacy?.story || null,
    logoUrl: legacy?.logoUrl || null,
    bannerUrl: legacy?.bannerUrl || null,
    craftType: legacy?.craftType || null,
    region: legacy?.region || null,

    // Arrays y objetos JSONB
    certifications: legacy?.certifications || [],
    contactInfo: legacy?.contactInfo || {},
    socialLinks: legacy?.socialLinks || {},

    // Estados booleanos
    active: legacy?.active ?? true,
    featured: legacy?.featured ?? false,

    // SEO y datos estructurados
    seoData: legacy?.seoData || {},

    // Timestamps
    createdAt: store.createdAt,
    updatedAt: store.updatedAt || store.createdAt,

    // Privacidad y clasificación
    privacyLevel: legacy?.privacyLevel || null,
    dataClassification: legacy?.dataClassification || {},
    publicProfile: legacy?.publicProfile || null,

    // Estado de creación
    creationStatus: legacy?.creationStatus || null,
    creationStep: legacy?.creationStep || null,

    // Branding
    primaryColors: legacy?.primaryColors || [],
    secondaryColors: legacy?.secondaryColors || [],
    brandClaim: legacy?.brandClaim || null,

    // Configuraciones JSONB (hero, about, contact)
    heroConfig: legacy?.heroConfig || {},
    aboutContent: legacy?.aboutContent || {},
    contactConfig: legacy?.contactConfig || {},

    // Theme
    activeThemeId: legacy?.activeThemeId || null,

    // Publicación
    publishStatus: legacy?.publishStatus || null,

    // Aprobación de marketplace
    marketplaceApproved: legacy?.marketplaceApproved || null,
    marketplaceApprovedAt: legacy?.marketplaceApprovedAt || null,
    marketplaceApprovedBy: legacy?.marketplaceApprovedBy || null,

    // Banking
    idContraparty: legacy?.idContraparty || null,

    // Perfil artesanal
    artisanProfile: legacy?.artisanProfile || null,
    artisanProfileCompleted: legacy?.artisanProfileCompleted || null,

    // Estados bancarios y aprobación
    bankDataStatus: legacy?.bankDataStatus || null,
    marketplaceApprovalStatus: legacy?.marketplaceApprovalStatus || null,

    // Ubicación - Prioridad: contacts > legacy
    department: store.contacts?.department || legacy?.department || null,
    municipality: store.contacts?.municipality || legacy?.municipality || null,
  };
};

/**
 * Busca una tienda por legacyId en todas las tiendas
 * (Helper para getArtisanShopById que recibe un legacyId)
 */
export const findStoreByLegacyId = async (legacyId: string): Promise<StoreResponse | null> => {
  try {
    const allStores = await getAllStores();
    const store = allStores.find(s => s.legacyId === legacyId);
    return store || null;
  } catch (error) {
    console.error(`Error finding store by legacyId ${legacyId}:`, error);
    return null;
  }
};
