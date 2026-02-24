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
 * Endpoint: GET /telar/server/agent-deliverables
 */
export const getAgentDeliverables = async (): Promise<AgentDeliverable[]> => {
  try {
    const response = await telarApi.get<GetAgentDeliverablesResponse>(
      '/telar/server/agent-deliverables'
    );

    return response.data.data;
  } catch (error: any) {
    console.error('[agentDeliverables.actions] Error fetching agent deliverables:', error);
    throw error;
  }
};

/**
 * Crear un nuevo entregable
 * @param payload - Datos del entregable a crear
 * @returns El entregable creado
 * @throws Error si la petición falla
 * 
 * Endpoint: POST /telar/server/agent-deliverables
 */
export const createAgentDeliverable = async (
  payload: CreateAgentDeliverablePayload
): Promise<AgentDeliverable> => {
  try {
    const response = await telarApi.post<CreateAgentDeliverableResponse>(
      '/telar/server/agent-deliverables',
      payload
    );

    return response.data.data;
  } catch (error: any) {
    console.error('[agentDeliverables.actions] Error creating agent deliverable:', error);
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
 * Endpoint: PATCH /telar/server/agent-deliverables/{id}
 */
export const updateAgentDeliverable = async (
  deliverableId: string,
  payload: UpdateAgentDeliverablePayload
): Promise<AgentDeliverable> => {
  try {
    const response = await telarApi.patch<UpdateAgentDeliverableResponse>(
      `/telar/server/agent-deliverables/${deliverableId}`,
      payload
    );

    return response.data.data;
  } catch (error: any) {
    console.error('[agentDeliverables.actions] Error updating agent deliverable:', error);
    throw error;
  }
};
