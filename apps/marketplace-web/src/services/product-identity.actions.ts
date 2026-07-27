import { telarApi, telarApiPublic } from '@/integrations/api/telarApi';

export interface ProductIdentity {
  id: string;
  identityKey: string;
  productId: string;
  storeId: string;
  artisanId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductIdentityWithEmailDto {
  productId: string;
  email: string;
}

export interface CreateProductIdentityWithEmailResponse {
  message: string;
  productIdentity: ProductIdentity;
  invitationSent: boolean;
}

/**
 * Crear identidad de producto con email
 * Endpoint autenticado: POST /product-identity/create-with-email
 */
export const createProductIdentityWithEmail = async (
  data: CreateProductIdentityWithEmailDto
): Promise<CreateProductIdentityWithEmailResponse> => {
  try {
    const response = await telarApi.post<CreateProductIdentityWithEmailResponse>(
      '/product-identity/create-with-email',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating product identity:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al crear la identidad del producto'
      );
    }
    throw error;
  }
};

/**
 * Obtener identidad de producto por identityKey
 * Endpoint público: GET /product-identity/key/:identityKey
 */
export const getProductIdentityByKey = async (
  identityKey: string
): Promise<ProductIdentity> => {
  try {
    const response = await telarApiPublic.get<ProductIdentity>(
      `/product-identity/key/${identityKey}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product identity:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener la identidad del producto'
      );
    }
    throw error;
  }
};

/**
 * Obtener identidad de producto por ID
 * Endpoint: GET /product-identity/:id
 */
export const getProductIdentityById = async (
  id: string
): Promise<ProductIdentity> => {
  try {
    const response = await telarApi.get<ProductIdentity>(`/product-identity/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product identity:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al obtener la identidad del producto'
      );
    }
    throw error;
  }
};
