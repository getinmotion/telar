import { telarApiPublic } from '@/integrations/api/telarApi';

export interface UsersPassport {
  id: string;
  numIdentificacion: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterWithIdentityKeyDto {
  identityKey: string;
  numIdentificacion: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
}

export interface RegisterWithIdentityKeyResponse {
  message: string;
  userPassport: UsersPassport;
  productIdentity: {
    id: string;
    identityKey: string;
    productId: string;
    storeId: string;
    artisanId: string;
  };
}

/**
 * Registrar usuario comprador con identityKey (endpoint público)
 * Endpoint: POST /users-passport/register-with-key
 */
export const registerUserPassportWithKey = async (
  data: RegisterWithIdentityKeyDto
): Promise<RegisterWithIdentityKeyResponse> => {
  try {
    const response = await telarApiPublic.post<RegisterWithIdentityKeyResponse>(
      '/users-passport/register-with-key',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error registering user passport:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al registrar el certificado'
      );
    }
    throw error;
  }
};
