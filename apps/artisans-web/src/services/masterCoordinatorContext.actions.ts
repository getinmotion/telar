/**
 * Master Coordinator Context Service
 * Servicio para gestión del contexto del coordinador maestro en el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import {
  GetMasterCoordinatorContextResponse,
  CreateMasterCoordinatorContextResponse,
  UpdateMasterCoordinatorContextResponse,
  MasterCoordinatorContext,
  CreateMasterCoordinatorContextPayload,
  UpdateMasterCoordinatorContextPayload
} from '@/types/masterCoordinatorContext.types';

/**
 * Obtener el contexto del coordinador maestro por userId
 * @param userId - ID del usuario
 * @returns El contexto del coordinador o null si no existe
 * @throws Error si la petición falla
 * 
 * Endpoint: GET /master-coordinator-context/user/{user_id}
 */
export const getMasterCoordinatorContextByUserId = async (
  userId: string
): Promise<MasterCoordinatorContext | null> => {
  try {
    const response = await telarApi.get<GetMasterCoordinatorContextResponse>(
      `/master-coordinator-context/user/${userId}`
    );

    return response.data.data;
  } catch (error: any) {
    // Si es 404, el contexto no existe (es válido)
    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

/**
 * Crear un nuevo contexto del coordinador maestro
 * @param payload - Datos del contexto a crear
 * @returns El contexto creado
 * @throws Error si la petición falla
 * 
 * Endpoint: POST /master-coordinator-context
 */
export const createMasterCoordinatorContext = async (
  payload: CreateMasterCoordinatorContextPayload
): Promise<MasterCoordinatorContext> => {
  try {
    const response = await telarApi.post<CreateMasterCoordinatorContextResponse>(
      `/master-coordinator-context`,
      payload
    );

    // Mapear la respuesta al formato MasterCoordinatorContext
    return {
      id: response.data.id,
      userId: response.data.userId,
      contextSnapshot: response.data.contextSnapshot,
      aiMemory: response.data.aiMemory,
      lastInteractionAt: response.data.lastInteraction,
      contextVersion: response.data.contextVersion,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Actualizar el contexto del coordinador maestro por userId
 * @param userId - ID del usuario
 * @param payload - Datos a actualizar
 * @returns El contexto actualizado
 * @throws Error si la petición falla
 * 
 * Endpoint: PATCH /master-coordinator-context/user/{user_id}
 */
export const updateMasterCoordinatorContextByUserId = async (
  userId: string,
  payload: UpdateMasterCoordinatorContextPayload
): Promise<MasterCoordinatorContext> => {
  try {
    const response = await telarApi.patch<UpdateMasterCoordinatorContextResponse>(
      `/master-coordinator-context/user/${userId}`,
      payload
    );

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Crear o actualizar el contexto del coordinador maestro (UPSERT)
 * Verifica si existe el contexto y ejecuta CREATE o UPDATE según corresponda
 * @param userId - ID del usuario
 * @param payload - Datos del contexto
 * @returns El contexto creado o actualizado
 */
export const upsertMasterCoordinatorContext = async (
  userId: string,
  payload: Omit<CreateMasterCoordinatorContextPayload, 'userId'>
): Promise<MasterCoordinatorContext> => {
  try {
    // Verificar si existe el contexto
    const existingContext = await getMasterCoordinatorContextByUserId(userId);
    
    if (existingContext) {
      // Si existe, actualizar
      return await updateMasterCoordinatorContextByUserId(userId, payload);
    } else {
      // Si no existe, crear
      return await createMasterCoordinatorContext({ ...payload, userId });
    }
  } catch (error: any) {
    throw error;
  }
};
