/**
 * Categories Service
 * Servicio para manejar categorías de productos
 */

import { telarApi } from '@/integrations/api/telarApi';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
  imageUrl?: string | null;
  isActive: boolean;
  skuCode?: string | null;
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

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  skuCode?: string;
}): Promise<Category> {
  const response = await telarApi.post<Category>('/categories', data);
  return response.data;
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    displayOrder: number;
    isActive: boolean;
    imageUrl: string;
    skuCode: string;
  }>,
): Promise<Category> {
  const response = await telarApi.patch<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await telarApi.delete(`/categories/${id}`);
}
