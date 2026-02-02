/**
 * Task Steps Service - Centralized API calls to NestJS backend
 * 
 * Este servicio maneja todas las operaciones CRUD para task_steps
 * usando el backend NestJS en lugar de consultas directas a Supabase.
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  TaskStep,
  GetTaskStepsByUserIdResponse,
  CreateTaskStepPayload,
  UpdateTaskStepPayload,
  TaskStepErrorResponse
} from '@/types/taskStep.types';

/**
 * Obtiene todos los task steps de un usuario
 * @param userId - ID del usuario
 * @returns Array de task steps con información de la tarea relacionada
 */
export const getTaskStepsByUserId = async (
  userId: string
): Promise<TaskStep[]> => {
  try {
    const response = await telarApi.get<GetTaskStepsByUserIdResponse>(
      `/telar/server/task-steps/user/${userId}`
    );
    return response.data.data;
  } catch (error: any) {
    // Si es 404, retornar array vacío (el usuario no tiene steps)
    if (error.response?.status === 404) {
      return [];
    }
    
    console.error('[TaskSteps] Error al obtener task steps:', error);
    
    // Para otros errores, lanzar la respuesta estructurada
    if (error.response?.data) {
      throw error.response.data as TaskStepErrorResponse;
    }
    throw error;
  }
};

/**
 * Crea un nuevo task step
 * @param payload - Datos del task step a crear
 * @returns El task step creado
 */
export const createTaskStep = async (
  payload: CreateTaskStepPayload
): Promise<TaskStep> => {
  try {
    const response = await telarApi.post<{ success: true; data: TaskStep }>(
      `/telar/server/task-steps`,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    console.error('[TaskSteps] Error al crear task step:', error);
    
    if (error.response?.data) {
      throw error.response.data as TaskStepErrorResponse;
    }
    throw error;
  }
};

/**
 * Actualiza un task step existente
 * @param stepId - ID del task step
 * @param payload - Datos a actualizar
 * @returns El task step actualizado
 */
export const updateTaskStep = async (
  stepId: string,
  payload: UpdateTaskStepPayload
): Promise<TaskStep> => {
  try {
    const response = await telarApi.patch<{ success: true; data: TaskStep }>(
      `/telar/server/task-steps/${stepId}`,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    console.error('[TaskSteps] Error al actualizar task step:', error);
    
    if (error.response?.data) {
      throw error.response.data as TaskStepErrorResponse;
    }
    throw error;
  }
};

/**
 * Elimina un task step
 * @param stepId - ID del task step a eliminar
 * @returns True si se eliminó correctamente
 */
export const deleteTaskStep = async (stepId: string): Promise<boolean> => {
  try {
    await telarApi.delete(`/telar/server/task-steps/${stepId}`);
    return true;
  } catch (error: any) {
    console.error('[TaskSteps] Error al eliminar task step:', error);
    
    if (error.response?.data) {
      throw error.response.data as TaskStepErrorResponse;
    }
    throw error;
  }
};
