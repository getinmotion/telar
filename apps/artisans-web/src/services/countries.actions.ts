import { telarApi } from '@/integrations/api/telarApi';
<<<<<<< HEAD

export interface Country {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
=======
import type { Country } from '@/types/country.types';
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119

/**
 * Obtiene todos los países
 * Endpoint: GET /countries
 */
export const getAllCountries = async (): Promise<Country[]> => {
  try {
    const response = await telarApi.get<Country[]>('/countries');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching countries:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener los países'
      );
    }
    throw error;
  }
};

/**
 * Obtiene un país por ID
 * Endpoint: GET /countries/:id
 */
export const getCountryById = async (id: string): Promise<Country> => {
  try {
    const response = await telarApi.get<Country>(`/countries/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching country:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener el país'
      );
    }
    throw error;
  }
};
