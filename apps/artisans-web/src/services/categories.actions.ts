/**
 * Categories Service
 * Servicio para manejar categorías de productos
 */

import { telarApi } from '@/integrations/api/telarApi';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtener todas las categorías activas
 * Endpoint: GET /categories?isActive=true
 */
export async function getActiveCategories(): Promise<Category[]> {
  try {
    const response = await telarApi.get<Category[]>('/categories', {
      params: {
        isActive: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching active categories:', error);
    throw error;
  }
}

/**
 * Obtener todas las categorías
 * Endpoint: GET /categories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await telarApi.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Obtener una categoría por ID
 * Endpoint: GET /categories/:id
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const response = await telarApi.get<Category>(`/categories/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}
