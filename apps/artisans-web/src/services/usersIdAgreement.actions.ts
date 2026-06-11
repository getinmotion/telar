/**
 * Users ID Agreement Actions
 * Servicio para validar si un usuario está en la lista de artesanos aprobados
 */

import { telarApi } from '@/integrations/api/telarApi';

export interface ValidateIdAgreementRequest {
  idType: string;
  numId: string;
  agreementId: string;
}

export interface IdTypeUser {
  id: string;
  idTypeValue: string;
  typeName: string;
  countriesId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Agreement {
  id: string;
  name: string;
  permissionMongoId: string;
  isEnableValidate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersIdAgreementRecord {
  id: string;
  idType: string;
  numId: string;
  agreementId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  idTypeUser: IdTypeUser;
  agreement: Agreement;
}

export interface ValidateIdAgreementResponse {
  exists: boolean;
  record?: UsersIdAgreementRecord;
}

/**
 * Valida si una combinación de tipo de ID, número de ID y convenio
 * está registrada en la lista de artesanos aprobados
 */
export const validateIdAgreement = async (
  data: ValidateIdAgreementRequest
): Promise<ValidateIdAgreementResponse> => {
  const response = await telarApi.post<ValidateIdAgreementResponse>(
    '/users-id-agreement/validate',
    data
  );
  return response.data;
};
