/**
 * PayoutUserInfo types
 * Resource: payout-user-info
 *
 * Nota: Los campos bankName y numAccount vienen DESENCRIPTADOS del backend
 * Los campos idType e idNumber vienen del perfil del usuario (user_profiles)
 */

export interface PayoutUserInfo {
  id: string;
  namePayoutMain: string;
  userId: string;
  typeAccount: string;
  bankName: string; // Desencriptado
  numAccount: string; // Desencriptado
  countryId: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  // Campos del perfil del usuario (agregados en GET)
  idType?: string; // Tipo de identificación (CC, PA, NIT, CE)
  idNumber?: string; // Número de identificación (desencriptado)
}

export interface CreatePayoutUserInfoPayload {
  namePayoutMain: string;
  userId: string;
  typeAccount: string;
  bankName: string;
  numAccount: string;
  countryId: string;
  currency: string;
  idType: string; // Tipo de identificación (CC, PA, NIT, CE)
  idNumber: string; // Número de identificación
  createdBy?: string;
}

export interface UpdatePayoutUserInfoPayload {
  namePayoutMain?: string;
  userId?: string;
  typeAccount?: string;
  bankName?: string;
  numAccount?: string;
  countryId?: string;
  currency?: string;
  idType?: string; // Tipo de identificación (CC, PA, NIT, CE)
  idNumber?: string; // Número de identificación
  updatedBy?: string;
}

export interface GetPayoutUserInfoResponse {
  data: PayoutUserInfo[];
}
