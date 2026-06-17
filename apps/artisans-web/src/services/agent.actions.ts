/**
 * Agent Service
 * Handles communication with the agent API
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { ArtisansIdentityProfile } from '@/types/artisansKnowledge.types';
import type {
  OnboardingResponse,
  AgentErrorResponse,
  Step1InitialCaptureRequest,
  Step1InitialCaptureResponse,
  Step1ConfirmRequest,
  Step1ConfirmResponse,
  Step2CaptureRequest,
  Step2CaptureResponse,
  Step2ConfirmRequest,
  Step2ConfirmResponse,
} from '@/types/agent.types';

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

/**
 * Procesa el paso 1 de captura inicial del producto
 * @param data - Datos del producto en paso 1 (nombre, descripción, historia, imágenes)
 * @returns Respuesta del servicio de agentes con sugerencias
 */
export const step1InitialCapture = async (
  data: Step1InitialCaptureRequest
): Promise<Step1InitialCaptureResponse> => {
  try {
    const response = await telarApi.post<Step1InitialCaptureResponse>(
      '/agent/product/step-1-initial-capture',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('[step1InitialCapture] Error:', error);
    if (error.response?.data) {
      throw error.response.data as AgentErrorResponse;
    }
    throw error;
  }
};

/**
 * Confirma las sugerencias de identidad artesanal del paso 1
 * @param data - fieldMetadata con userId, productDraftId, y las confirmaciones
 * @returns Respuesta con oráculo y estado de guardado
 */
export const step1Confirm = async (
  data: Step1ConfirmRequest
): Promise<Step1ConfirmResponse> => {
  try {
    const response = await telarApi.post<Step1ConfirmResponse>(
      '/agent/product/step-1-confirm',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('[step1Confirm] Error:', error);
    if (error.response?.data) {
      throw error.response.data as AgentErrorResponse;
    }
    throw error;
  }
};

/**
 * Registra el proceso de elaboración del producto (paso 2 capture)
 * @param data - Descripción del proceso y URLs de evidencia
 * @returns Respuesta con análisis de proceso, pricing y oráculo
 */
export const step2Capture = async (
  data: Step2CaptureRequest
): Promise<Step2CaptureResponse> => {
  try {
    const response = await telarApi.post<Step2CaptureResponse>(
      '/agent/product/step-2-capture',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('[step2Capture] Error:', error);
    if (error.response?.data) {
      throw error.response.data as AgentErrorResponse;
    }
    throw error;
  }
};

/**
 * Confirma pricing y logística del paso 2
 * @param data - fieldMetadata con userId, productId y confirmaciones de cada campo
 * @returns Respuesta con oráculo y estado de guardado
 */
export const step2Confirm = async (
  data: Step2ConfirmRequest
): Promise<Step2ConfirmResponse> => {
  try {
    const response = await telarApi.post<Step2ConfirmResponse>(
      '/agent/product/step-2-confirm',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('[step2Confirm] Error:', error);
    if (error.response?.data) {
      throw error.response.data as AgentErrorResponse;
    }
    throw error;
  }
};
