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

export const getAgentDeliverables = async (): Promise<AgentDeliverable[]> => {
  const response = await telarApi.get<GetAgentDeliverablesResponse>('/agent-deliverables');
  return response.data.data;
};

export const createAgentDeliverable = async (
  payload: CreateAgentDeliverablePayload
): Promise<AgentDeliverable> => {
  const response = await telarApi.post<CreateAgentDeliverableResponse>(
    '/agent-deliverables',
    payload
  );
  return response.data.data;
};

export const getAgentDeliverablesByUserId = async (userId: string): Promise<AgentDeliverable[]> => {
  const response = await telarApi.get<AgentDeliverable[]>(`/agent-deliverables/user/${userId}`);
  return response.data;
};

export const updateAgentDeliverable = async (
  deliverableId: string,
  payload: UpdateAgentDeliverablePayload
): Promise<AgentDeliverable> => {
  const response = await telarApi.patch<UpdateAgentDeliverableResponse>(
    `/agent-deliverables/${deliverableId}`,
    payload
  );
  return response.data.data;
};
