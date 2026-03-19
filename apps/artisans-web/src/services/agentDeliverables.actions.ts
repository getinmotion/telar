/**
 * Agent Deliverables Service
 * Servicio para gestión de entregables de agentes en el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import {
  GetAgentDeliverablesResponse,
  CreateAgentDeliverableResponse,
  UpdateAgentDeliverableResponse,
  AgentDeliverable,
  CreateAgentDeliverablePayload,
  UpdateAgentDeliverablePayload
} from '@/types/agentDeliverable.types';

/**
 * Obtener todos los entregables del usuario autenticado
 * @returns Array de entregables con relaciones a user y task
 * @throws Error si la petición falla
 * 
 * Endpoint: GET /agent-deliverables
 */
export const getAgentDeliverables = async (): Promise<AgentDeliverable[]> => {
  try {
    const response = await telarApi.get<GetAgentDeliverablesResponse>(
      '/agent-deliverables'
    );

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Crear un nuevo entregable
 * @param payload - Datos del entregable a crear
 * @returns El entregable creado
 * @throws Error si la petición falla
 * 
 * Endpoint: POST /agent-deliverables
 */
export const createAgentDeliverable = async (
  payload: CreateAgentDeliverablePayload
): Promise<AgentDeliverable> => {
  try {
    const response = await telarApi.post<CreateAgentDeliverableResponse>(
      '/agent-deliverables',
      payload
    );

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtener entregables por ID de usuario
 * @param userId - ID del usuario
 * @returns Array de entregables del usuario
 * @throws Error si la petición falla
 *
 * Endpoint: GET /agent-deliverables/user/:userId
 */
export const getAgentDeliverablesByUserId = async (userId: string): Promise<AgentDeliverable[]> => {
  try {
    const response = await telarApi.get<AgentDeliverable[]>(
      `/agent-deliverables/user/${userId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Actualizar un entregable existente
 * @param deliverableId - ID del entregable
 * @param payload - Datos a actualizar
 * @returns El entregable actualizado
 * @throws Error si la petición falla
 *
 * Endpoint: PATCH /agent-deliverables/{id}
 */
export const updateAgentDeliverable = async (
  deliverableId: string,
  payload: UpdateAgentDeliverablePayload
): Promise<AgentDeliverable> => {
  try {
    const response = await telarApi.patch<UpdateAgentDeliverableResponse>(
      `/agent-deliverables/${deliverableId}`,
      payload
    );

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};
