import { telarApi } from '@/integrations/api/telarApi';

export interface IdTypeUser {
  id: string;
  idTypeValue: string;
  typeName: string;
  countriesId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obtiene todos los tipos de identificación
 * Endpoint: GET /id-type-user
 */
export const getAllIdTypes = async (): Promise<IdTypeUser[]> => {
  try {
    const response = await telarApi.get<IdTypeUser[]>('/id-type-user');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching id types:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener los tipos de identificación'
      );
    }
    throw error;
  }
};

/**
 * Obtiene tipos de identificación por país
 * Endpoint: GET /id-type-user/country/:countryId
 */
export const getIdTypesByCountry = async (
  countryId: string
): Promise<IdTypeUser[]> => {
  try {
    const response = await telarApi.get<IdTypeUser[]>(
      `/id-type-user/country/${countryId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching id types by country:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener los tipos de identificación por país'
      );
    }
    throw error;
  }
};
