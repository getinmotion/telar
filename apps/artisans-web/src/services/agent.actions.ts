/**
 * Agent Service
 * Handles communication with the agent API
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { ArtisansIdentityProfile } from '@/types/artisansKnowledge.types';
import type { OnboardingResponse, AgentErrorResponse } from '@/types/agent.types';

/**
 * Procesa el onboarding del artesano enviando su perfil completo al servicio de agentes
 * @param profile - Perfil completo del artesano con los 4 pasos completados
 * @returns Respuesta del servicio de agentes con nivel de madurez, mensaje y acciones prioritarias
 */
export const processOnboarding = async (
  profile: ArtisansIdentityProfile
): Promise<OnboardingResponse> => {
  try {
    const response = await telarApi.post<OnboardingResponse>(
      '/agent/onboarding',
      profile
    );
    return response.data;
  } catch (error: any) {
    console.error('[processOnboarding] Error:', error);
    if (error.response?.data) {
      throw error.response.data as AgentErrorResponse;
    }
    throw error;
  }
};
