/**
 * Materials Service
 * Servicio para manejar materiales
 */

import { telarApi } from '@/integrations/api/telarApi';

export interface Material {
  id: string;
  name: string;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtener todos los materiales aprobados
 * Endpoint: GET /materials?isActive=true
 */
export async function getApprovedMaterials(): Promise<Material[]> {
  try {
    const response = await telarApi.get<Material[]>('/materials', {
      params: {
        isActive: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching approved materials:', error);
    throw error;
  }
}

/**
 * Obtener todos los materiales
 * Endpoint: GET /materials
 */
export async function getAllMaterials(): Promise<Material[]> {
  try {
    const response = await telarApi.get<Material[]>('/materials');
    return response.data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
}

/**
 * Obtener un material por ID
 * Endpoint: GET /materials/:id
 */
export async function getMaterialById(id: string): Promise<Material | null> {
  try {
    const response = await telarApi.get<Material>(`/materials/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}
