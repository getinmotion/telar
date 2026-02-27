/**
 * User Master Context Service - Centralized API calls to NestJS backend
 * 
 * Este servicio maneja todas las operaciones CRUD para user_master_context
 * usando el backend NestJS en lugar de consultas directas a Supabase.
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  UserMasterContext,
  UpdateUserMasterContextPayload,
  CreateUserMasterContextPayload,
  UserMasterContextErrorResponse
} from '@/types/userMasterContext.types';

/**
 * Obtiene el contexto maestro de un usuario por su ID
 * @param userId - ID del usuario
 * @returns El contexto maestro del usuario o null si no existe
 * 
 * Nota: El servidor retorna data: "" (string vacío) con status 200 cuando no hay registro
 */
export const getUserMasterContextByUserId = async (
  userId: string
): Promise<UserMasterContext | null> => {
  try {
    const response = await telarApi.get<UserMasterContext | "" | null>(
      `/user-master-context/user/${userId}`
    );

    // El servidor retorna data: "" (string vacío) cuando no hay registro (status 200)
    // Convertir string vacío a null para mantener consistencia de tipos
    if (response.data === "" || response.data === null) {
      return null;
    }
    
    return response.data;
  } catch (error: any) {
    // Si es 404, el contexto no existe (es válido)
    if (error.response?.status === 404) {
      return null;
    }


    // Para otros errores, lanzar la respuesta estructurada
    if (error.response?.data) {
      throw error.response.data as UserMasterContextErrorResponse;
    }
    throw error;
  }
};

/**
 * Verifica si un usuario tiene un contexto maestro
 * @param userId - ID del usuario
 * @returns true si existe, false si no
 */
export const hasUserMasterContext = async (userId: string): Promise<boolean> => {
  try {
    const context = await getUserMasterContextByUserId(userId);
    return context !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Actualiza el contexto maestro por ID del contexto
 * @param contextId - ID del user_master_context (no del user)
 * @param payload - Datos a actualizar (campos opcionales)
 * @returns El contexto maestro actualizado
 */
export const updateUserMasterContextById = async (
  contextId: string,
  payload: UpdateUserMasterContextPayload
): Promise<UserMasterContext> => {
  try {
    const response = await telarApi.patch<UserMasterContext>(
      `/user-master-context/${contextId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as UserMasterContextErrorResponse;
    }
    throw error;
  }
};

/**
 * Actualiza el contexto maestro de un usuario por userId
 * Helper que primero obtiene el context.id y luego actualiza
 * @param userId - ID del usuario
 * @param payload - Datos a actualizar
 * @returns El contexto maestro actualizado
 */
export const updateUserMasterContext = async (
  userId: string,
  payload: UpdateUserMasterContextPayload
): Promise<UserMasterContext> => {
  try {
    // PASO 1: Obtener el contexto actual para conseguir su ID
    const currentContext = await getUserMasterContextByUserId(userId);

    if (!currentContext?.id) {
      throw new Error('No se encontró el contexto maestro del usuario para actualizar');
    }

    // PASO 2: Usar la función optimizada con el ID
    return updateUserMasterContextById(currentContext.id, payload);
  } catch (error: any) {

    if (error.response?.data) {
      throw error.response.data as UserMasterContextErrorResponse;
    }

    throw error;
  }
};

/**
 * Crea un nuevo contexto maestro para un usuario
 * @param payload - Datos del contexto a crear (userId es requerido)
 * @returns El contexto maestro creado
 */
export const createUserMasterContext = async (
  payload: CreateUserMasterContextPayload
): Promise<UserMasterContext> => {
  try {
    const response = await telarApi.post<UserMasterContext>(
      `/user-master-context`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as UserMasterContextErrorResponse;
    }
    throw error;
  }
};

/**
 * Crea o actualiza el contexto maestro (UPSERT)
 * Verifica si existe y ejecuta CREATE o UPDATE según corresponda
 * @param userId - ID del usuario
 * @param payload - Datos del contexto
 * @returns El contexto maestro creado o actualizado
 */
export const upsertUserMasterContext = async (
  userId: string,
  payload: UpdateUserMasterContextPayload
): Promise<UserMasterContext> => {
  const exists = await hasUserMasterContext(userId);

  if (exists) {
    return updateUserMasterContext(userId, payload);
  } else {
    return createUserMasterContext({ ...payload, userId });
  }
};
