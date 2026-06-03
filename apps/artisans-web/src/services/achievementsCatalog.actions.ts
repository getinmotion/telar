/**
 * Achievements Catalog Service
 * Servicio para gestión del catálogo de logros en el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import {
  AchievementsCatalog,
  GetAchievementsCatalogResponse,
  GetAchievementCatalogByIdResponse,
  CreateAchievementsCatalogPayload,
  UpdateAchievementsCatalogPayload
} from '@/types/achievementsCatalog.types';

/**
 * Obtiene todos los logros del catálogo ordenados por display_order
 */
export const getAllAchievementsCatalog = async (): Promise<AchievementsCatalog[]> => {
  try {
    const response = await telarApi.get<AchievementsCatalog[]>('/achievements-catalog', {
      _suppressToast: true,
    } as any);
    return response.data;
  } catch {
    return [];
  }
};

/**
 * Obtiene un logro específico del catálogo por ID
 */
export const getAchievementCatalogById = async (id: string): Promise<AchievementsCatalog> => {
  const response = await telarApi.get<AchievementsCatalog>(`/achievements-catalog/${id}`);
  return response.data;
};

/**
 * Obtiene logros del catálogo por categoría
 */
export const getAchievementsCatalogByCategory = async (category: string): Promise<AchievementsCatalog[]> => {
  const response = await telarApi.get<AchievementsCatalog[]>(`/achievements-catalog/category/${category}`);
  return response.data;
};

/**
 * Obtiene logros del catálogo por tier (nivel)
 */
export const getAchievementsCatalogByTier = async (tier: string): Promise<AchievementsCatalog[]> => {
  const response = await telarApi.get<AchievementsCatalog[]>(`/achievements-catalog/tier/${tier}`);
  return response.data;
};

/**
 * Crea un nuevo logro en el catálogo (solo admin)
 */
export const createAchievementCatalog = async (
  payload: CreateAchievementsCatalogPayload
): Promise<AchievementsCatalog> => {
  const response = await telarApi.post<AchievementsCatalog>(
    '/achievements-catalog',
    payload
  );
  return response.data;
};

/**
 * Actualiza un logro del catálogo (solo admin)
 */
export const updateAchievementCatalog = async (
  id: string,
  payload: UpdateAchievementsCatalogPayload
): Promise<AchievementsCatalog> => {
  const response = await telarApi.patch<AchievementsCatalog>(
    `/achievements-catalog/${id}`,
    payload
  );
  return response.data;
};

/**
 * Elimina un logro del catálogo (solo admin)
 */
export const deleteAchievementCatalog = async (id: string): Promise<{ message: string }> => {
  const response = await telarApi.delete<{ message: string }>(`/achievements-catalog/${id}`);
  return response.data;
};
