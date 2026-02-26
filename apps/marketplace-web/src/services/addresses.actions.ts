/**
 * Addresses Service
 * Servicio para gestión de direcciones con el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import { toastError } from '@/utils/toast.utils';
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressResponse,
} from '@/types/addresses.types';

/**
 * Obtener todas las direcciones de un usuario
 *
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<Address[]>} Lista de direcciones del usuario
 *
 * @endpoint GET /addresses/user/:userId
 *
 * @example
 * const addresses = await getUserAddresses(user.id);
 */
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const response = await telarApi.get<Address[]>(`/addresses/user/${userId}`);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Crear una nueva dirección
 *
 * @param {CreateAddressRequest} data - Datos de la dirección
 * @returns {Promise<AddressResponse>} Dirección creada
 *
 * @endpoint POST /addresses
 *
 * @example
 * const newAddress = await createAddress({
 *   userId: user.id,
 *   label: "Casa",
 *   streetAddress: "Calle 123 #45-67",
 *   city: "Bogotá",
 *   state: "Cundinamarca",
 *   postalCode: "110111",
 *   country: "Colombia",
 *   isDefault: true
 * });
 */
export const createAddress = async (
  data: CreateAddressRequest
): Promise<AddressResponse> => {
  try {
    const response = await telarApi.post<AddressResponse>('/addresses', data);
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Actualizar una dirección existente
 *
 * @param {string} addressId - ID de la dirección (UUID)
 * @param {UpdateAddressRequest} data - Datos a actualizar
 * @returns {Promise<AddressResponse>} Dirección actualizada
 *
 * @endpoint PATCH /addresses/:id
 *
 * @example
 * const updated = await updateAddress(addressId, {
 *   label: "Oficina",
 *   isDefault: false
 * });
 */
export const updateAddress = async (
  addressId: string,
  data: UpdateAddressRequest
): Promise<AddressResponse> => {
  try {
    const response = await telarApi.patch<AddressResponse>(
      `/addresses/${addressId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Establecer una dirección como predeterminada
 *
 * Automáticamente marca las demás direcciones del usuario como no predeterminadas.
 *
 * @param {string} addressId - ID de la dirección (UUID)
 * @returns {Promise<AddressResponse>} Dirección actualizada
 *
 * @endpoint PATCH /addresses/:id/set-default
 *
 * @example
 * await setDefaultAddress(addressId);
 */
export const setDefaultAddress = async (
  addressId: string
): Promise<AddressResponse> => {
  try {
    const response = await telarApi.patch<AddressResponse>(
      `/addresses/${addressId}/set-default`
    );
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Eliminar una dirección
 *
 * @param {string} addressId - ID de la dirección (UUID)
 * @returns {Promise<void>}
 *
 * @endpoint DELETE /addresses/:id
 *
 * @example
 * await deleteAddress(addressId);
 */
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    await telarApi.delete(`/addresses/${addressId}`);
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};
