import { telarApi } from '@/integrations/api/telarApi';

export interface Agreement {
  id: string;
  name: string;
  permissionMongoId: string | null;
  isEnableValidate: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obtiene todos los convenios/acuerdos
 * Endpoint: GET /agreements
 */
export const getAllAgreements = async (): Promise<Agreement[]> => {
  try {
    const response = await telarApi.get<Agreement[]>('/agreements');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching agreements:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener los convenios'
      );
    }
    throw error;
  }
};

/**
 * Obtiene un convenio por ID
 * Endpoint: GET /agreements/:id
 */
export const getAgreementById = async (id: string): Promise<Agreement> => {
  try {
    const response = await telarApi.get<Agreement>(`/agreements/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching agreement:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener el convenio'
      );
    }
    throw error;
  }
};
