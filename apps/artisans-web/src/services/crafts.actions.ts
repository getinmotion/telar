/**
 * Crafts and Techniques Service
 * Servicio para manejar oficios artesanales y técnicas
 */

import { telarApi } from '@/integrations/api/telarApi';

export interface Craft {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Technique {
  id: string;
  craftId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtener todos los crafts
 * Endpoint: GET /crafts
 */
export async function getAllCrafts(): Promise<Craft[]> {
  try {
    const response = await telarApi.get<Craft[]>('/crafts');
    return response.data;
  } catch (error) {
    console.error('Error fetching crafts:', error);
    throw error;
  }
}

/**
 * Obtener un craft por ID
 * Endpoint: GET /crafts/:id
 */
export async function getCraftById(id: string): Promise<Craft | null> {
  try {
    const response = await telarApi.get<Craft>(`/crafts/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

/**
 * Obtener todas las techniques de un craft específico
 * Endpoint: GET /techniques/craft/:craftId
 */
export async function getTechniquesByCraftId(craftId: string): Promise<Technique[]> {
  try {
    const response = await telarApi.get<Technique[]>(`/techniques/craft/${craftId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching techniques by craft:', error);
    throw error;
  }
}

/**
 * Obtener todas las techniques
 * Endpoint: GET /techniques
 */
export async function getAllTechniques(): Promise<Technique[]> {
  try {
    const response = await telarApi.get<Technique[]>('/techniques');
    return response.data;
  } catch (error) {
    console.error('Error fetching techniques:', error);
    throw error;
  }
}

/**
 * Obtener una technique por ID
 * Endpoint: GET /techniques/:id
 */
export async function getTechniqueById(id: string): Promise<Technique | null> {
  try {
    const response = await telarApi.get<Technique>(`/techniques/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}
