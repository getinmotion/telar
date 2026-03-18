/**
 * Gift Cards Service
 * Servicio para gestión de gift cards con el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import { toastError } from '@/utils/toast.utils';
import type { GiftCard, GetUserGiftCardsResponse } from '@/types/gift-cards.types';

/**
 * Obtener gift cards de un usuario por email
 *
 * Retorna todas las gift cards donde el usuario es comprador o destinatario.
 *
 * @param {string} userEmail - Email del usuario
 * @returns {Promise<GiftCard[]>} Lista de gift cards del usuario
 *
 * @endpoint GET /gift-cards/user/:email
 *
 * @example
 * const giftCards = await getUserGiftCards(user.email);
 */
export const getUserGiftCards = async (userEmail: string): Promise<GiftCard[]> => {
  try {
    const response = await telarApi.get<GetUserGiftCardsResponse>(
      `/gift-cards/user/${encodeURIComponent(userEmail)}`
    );
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Enmascara un código de gift card
 *
 * Convierte "GC-ABCD-1234" en "GC-XXXX-1234"
 *
 * @param {string} code - Código completo de la gift card
 * @returns {string} Código enmascarado
 *
 * @example
 * maskGiftCardCode("GC-ABCD-1234") // "GC-XXXX-1234"
 */
export const maskGiftCardCode = (code: string): string => {
  if (!code) return '';

  const parts = code.split('-');
  if (parts.length !== 3) return code;

  return `${parts[0]}-XXXX-${parts[2]}`;
};
