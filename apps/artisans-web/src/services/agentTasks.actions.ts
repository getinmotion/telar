/**
 * Agent Tasks Service - Centralized API calls to NestJS backend
 * 
 * Este servicio maneja las operaciones para agent_tasks
 * usando el backend NestJS en lugar de consultas directas a Supabase.
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  AgentTask,
  GetAgentTasksByUserIdResponse,
  CreateAgentTaskPayload,
  UpdateAgentTaskPayload,
  UpdateAgentTaskSuccessResponse,
  AgentTaskErrorResponse
} from '@/types/agentTask.types';

/**
 * Obtiene todas las tareas de un usuario
 * @param userId - ID del usuario
 * @returns Array de tareas del usuario
 */
export const getAgentTasksByUserId = async (
  userId: string
): Promise<AgentTask[]> => {
  try {
    const response = await telarApi.get<GetAgentTasksByUserIdResponse>(
      `/telar/server/agent-tasks/user/${userId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('[AgentTasks] Error al obtener tareas por usuario:', error);
    
    if (error.response?.data) {
      throw error.response.data as AgentTaskErrorResponse;
    }
    throw error;
  }
};

/**
 * Crea una nueva tarea de agente
 * @param payload - Datos de la tarea a crear
 * @returns La tarea creada
 */
export const createAgentTask = async (
  payload: CreateAgentTaskPayload
): Promise<AgentTask> => {
  try {
    const response = await telarApi.post<AgentTask>(
      `/telar/server/agent-tasks`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error('[AgentTasks] Error al crear tarea:', error);
    
    if (error.response?.data) {
      throw error.response.data as AgentTaskErrorResponse;
    }
    throw error;
  }
};

/**
 * Actualiza una tarea de agente existente
 * @param taskId - ID de la tarea
 * @param payload - Datos a actualizar
 * @returns La tarea actualizada
 */
export const updateAgentTask = async (
  taskId: string,
  payload: UpdateAgentTaskPayload
): Promise<UpdateAgentTaskSuccessResponse> => {
  try {
    const response = await telarApi.patch<UpdateAgentTaskSuccessResponse>(
      `/telar/server/agent-tasks/${taskId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error('[AgentTasks] Error al actualizar tarea:', error);
    
    if (error.response?.data) {
      throw error.response.data as AgentTaskErrorResponse;
    }
    throw error;
  }
};

/**
 * Marca una tarea como completada
 * Helper que actualiza status, progress_percentage y completed_at
 * @param taskId - ID de la tarea
 * @returns La tarea actualizada
 */
export const completeAgentTask = async (
  taskId: string
): Promise<UpdateAgentTaskSuccessResponse> => {
  return updateAgentTask(taskId, {
    status: 'completed',
    progressPercentage: 100,
    completedAt: new Date().toISOString()
  });
};
