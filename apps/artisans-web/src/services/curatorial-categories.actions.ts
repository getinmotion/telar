/**
 * Curatorial Categories Service
 * Servicio para manejar categorías curatoriales
 */

import { telarApi } from '@/integrations/api/telarApi';

export interface CuratorialCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtener todas las categorías curatoriales
 * Endpoint: GET /curatorial-categories
 */
export async function getCuratorialCategories(): Promise<CuratorialCategory[]> {
  try {
    const response = await telarApi.get<CuratorialCategory[]>('/curatorial-categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching curatorial categories:', error);
    throw error;
  }
}

/**
 * Obtener una categoría curatorial por ID
 * Endpoint: GET /curatorial-categories/:id
 */
export async function getCuratorialCategoryById(id: string): Promise<CuratorialCategory | null> {
  try {
    const response = await telarApi.get<CuratorialCategory>(`/curatorial-categories/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}
