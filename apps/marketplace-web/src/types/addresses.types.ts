/**
 * Addresses Types
 * Tipos para el módulo de direcciones del marketplace
 */

/**
 * Dirección de envío del usuario
 */
export interface Address {
  id: string;
  userId: string;
  label: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  daneCode: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para crear una nueva dirección
 */
export interface CreateAddressRequest {
  userId: string;
  label: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  daneCode?: string | null;
}

/**
 * Request para actualizar una dirección existente
 */
export interface UpdateAddressRequest {
  label?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isDefault?: boolean;
  daneCode?: string | null;
}

/**
 * Response al crear o actualizar dirección
 */
export interface AddressResponse extends Address {}
