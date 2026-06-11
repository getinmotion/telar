/**
 * PayoutUserInfo Service - Centralized API calls to NestJS backend
 *
 * Este servicio maneja todas las operaciones CRUD para payout_user_info
 * usando el backend NestJS en lugar de consultas a Cobre.
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  PayoutUserInfo,
  CreatePayoutUserInfoPayload,
  UpdatePayoutUserInfoPayload,
} from '@/types/payoutUserInfo.types';

/**
 * Crea una nueva información de payout para un usuario
 * Endpoint: POST /payout-user-info
 */
export const createPayoutUserInfo = async (
  payload: CreatePayoutUserInfoPayload
): Promise<PayoutUserInfo> => {
  try {
    const response = await telarApi.post<PayoutUserInfo>(
      '/payout-user-info',
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Obtiene todas las informaciones de payout
 * Endpoint: GET /payout-user-info
 */
export const getAllPayoutUserInfo = async (): Promise<PayoutUserInfo[]> => {
  try {
    const response = await telarApi.get<PayoutUserInfo[]>('/payout-user-info');
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Obtiene información de payout por ID
 * Endpoint: GET /payout-user-info/:id
 */
export const getPayoutUserInfoById = async (
  id: string
): Promise<PayoutUserInfo | null> => {
  try {
    const response = await telarApi.get<PayoutUserInfo>(
      `/payout-user-info/${id}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Obtiene información de payout por ID de usuario
 * Endpoint: GET /payout-user-info/user/:userId
 */
export const getPayoutUserInfoByUserId = async (
  userId: string
): Promise<PayoutUserInfo[]> => {
  try {
    const response = await telarApi.get<PayoutUserInfo[]>(
      `/payout-user-info/user/${userId}`,
      { _suppressToast: true } as any,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Actualiza información de payout
 * Endpoint: PATCH /payout-user-info/:id
 */
export const updatePayoutUserInfo = async (
  id: string,
  payload: UpdatePayoutUserInfoPayload
): Promise<PayoutUserInfo> => {
  try {
    const response = await telarApi.patch<PayoutUserInfo>(
      `/payout-user-info/${id}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Elimina información de payout
 * Endpoint: DELETE /payout-user-info/:id
 */
export const deletePayoutUserInfo = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await telarApi.delete<{ message: string }>(
      `/payout-user-info/${id}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};
