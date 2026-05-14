import { telarApi } from '@/integrations/api/telarApi';

export interface InfoBuyerIdentity {
  id: number;
  productId: string;
  skuProduct: string;
  email: string | null;
  nombreCompleto: string | null;
  celular: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obtiene un registro de info-buyer-identity por ID
 * Endpoint: GET /info-buyer-identity/:id
 */
export const getInfoBuyerIdentityById = async (
  id: number
): Promise<InfoBuyerIdentity> => {
  try {
    const response = await telarApi.get<InfoBuyerIdentity>(
      `/info-buyer-identity/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching info-buyer-identity:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener la información del comprador'
      );
    }
    throw error;
  }
};

/**
 * Obtiene registros de info-buyer-identity por product ID
 * Endpoint: GET /info-buyer-identity/product/:productId
 */
export const getInfoBuyerIdentityByProductId = async (
  productId: string
): Promise<InfoBuyerIdentity[]> => {
  try {
    const response = await telarApi.get<InfoBuyerIdentity[]>(
      `/info-buyer-identity/product/${productId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching info-buyer-identity by product:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener la información por producto'
      );
    }
    throw error;
  }
};

/**
 * Obtiene registros de info-buyer-identity por SKU
 * Endpoint: GET /info-buyer-identity/sku/:skuProduct
 */
export const getInfoBuyerIdentityBySku = async (
  skuProduct: string
): Promise<InfoBuyerIdentity[]> => {
  try {
    const response = await telarApi.get<InfoBuyerIdentity[]>(
      `/info-buyer-identity/sku/${skuProduct}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching info-buyer-identity by SKU:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener la información por SKU'
      );
    }
    throw error;
  }
};

export interface UpdateInfoBuyerIdentityDto {
  nombreCompleto?: string;
  email?: string;
  celular?: string;
}

/**
 * Actualiza la información de contacto de un registro de info-buyer-identity
 * Endpoint: PATCH /info-buyer-identity/:id
 */
export const updateInfoBuyerIdentity = async (
  id: number,
  updateData: UpdateInfoBuyerIdentityDto
): Promise<InfoBuyerIdentity> => {
  try {
    const response = await telarApi.patch<InfoBuyerIdentity>(
      `/info-buyer-identity/${id}`,
      updateData
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating info-buyer-identity:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al actualizar la información'
      );
    }
    throw error;
  }
};
