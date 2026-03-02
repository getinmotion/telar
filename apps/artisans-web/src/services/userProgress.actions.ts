/**
 * User Progress Service - Centralized API calls to NestJS backend
 * 
 * Este servicio maneja todas las operaciones CRUD para user_progress
 * usando el backend NestJS en lugar de consultas directas a Supabase.
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  UserProgress,
  GetUserProgressSuccessResponse,
  CreateUserProgressPayload,
  UpdateUserProgressPayload,
  UserProgressErrorResponse,
  UpdateUserProgressRequest,
  UpdateUserProgressSuccessResponse
} from '@/types/userProgress.types';

/**
 * Obtiene el progreso de un usuario por su user_id
 * @param userId - ID del usuario
 * @returns El progreso del usuario o null si no existe
 */
export const getUserProgressByUserId = async (
  userId: string
): Promise<UserProgress | null> => {
  try {
    const response = await telarApi.get<UserProgress>(
      `/user-progress/user/${userId}`
    );
    return response.data;
  } catch (error: any) {
    // Si es 404, el progreso no existe (es válido)
    if (error.response?.status === 404) {
      return null;
    }


    // Para otros errores, lanzar la respuesta estructurada
    if (error.response?.data) {
      throw error.response.data as UserProgressErrorResponse;
    }
    throw error;
  }
};

/**
 * Verifica si un usuario tiene progreso creado
 * @param userId - ID del usuario
 * @returns true si existe, false si no
 */
export const hasUserProgress = async (userId: string): Promise<boolean> => {
  try {
    const progress = await getUserProgressByUserId(userId);
    return progress !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Crea un nuevo progreso para un usuario
 * @param payload - Datos del progreso a crear
 * @returns El progreso creado
 */
export const createUserProgress = async (
  payload: CreateUserProgressPayload
): Promise<UserProgress> => {
  try {
    const response = await telarApi.post<GetUserProgressSuccessResponse>(
      `/user-progress`,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as UserProgressErrorResponse;
    }
    throw error;
  }
};

/**
 * Actualiza el progreso por ID del progress
 * @param progressId - ID del user_progress (no del user)
 * @param payload - Datos a actualizar (campos opcionales)
 * @returns El progreso actualizado
 */
export const updateUserProgressById = async (
  progressId: string,
  payload: UpdateUserProgressPayload
): Promise<UserProgress> => {
  try {
    const response = await telarApi.patch<GetUserProgressSuccessResponse>(
      `/user-progress/${progressId}`,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as UserProgressErrorResponse;
    }
    throw error;
  }
};

/**
 * Actualiza el progreso de un usuario por userId
 * Helper que primero obtiene el progress.id y luego actualiza
 * @param userId - ID del usuario
 * @param payload - Datos a actualizar
 * @returns El progreso actualizado
 */
export const updateUserProgress = async (
  userId: string,
  payload: UpdateUserProgressPayload
): Promise<UserProgress> => {
  try {
    // PASO 1: Obtener el progreso actual para conseguir su ID
    const currentProgress = await getUserProgressByUserId(userId);

    if (!currentProgress?.id) {
      throw new Error('No se encontró el progreso del usuario para actualizar');
    }

    // PASO 2: Usar la función optimizada con el ID
    return updateUserProgressById(currentProgress.id, payload);
  } catch (error: any) {

    if (error.response?.data) {
      throw error.response.data as UserProgressErrorResponse;
    }

    throw error;
  }
};

/**
 * Crea o actualiza el progreso (UPSERT)
 * Verifica si existe y ejecuta CREATE o UPDATE según corresponda
 * @param userId - ID del usuario
 * @param payload - Datos del progreso
 * @returns El progreso creado o actualizado
 */
export const upsertUserProgress = async (
  userId: string,
  payload: CreateUserProgressPayload | UpdateUserProgressPayload
): Promise<UserProgress> => {
  const exists = await hasUserProgress(userId);

  if (exists) {
    return updateUserProgress(userId, payload as UpdateUserProgressPayload);
  } else {
    return createUserProgress({ ...payload, userId } as CreateUserProgressPayload);
  }
};

/**
 * Actualiza el progreso del usuario con cálculo automático de recompensas
 * Este endpoint calcula automáticamente:
 * - XP y level ups
 * - Achievements desbloqueados
 * - Streaks y misiones completadas
 * 
 * @param payload - Datos de la actividad (xpGained, missionCompleted, timeSpent)
 * @returns Respuesta con el progreso actualizado y recompensas desbloqueadas
 */
export const updateUserProgressWithRewards = async (
  payload: UpdateUserProgressRequest
): Promise<UpdateUserProgressSuccessResponse> => {
  try {
    const response = await telarApi.post<UpdateUserProgressSuccessResponse>(
      `/user-progress/update`,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as UserProgressErrorResponse;
    }
    throw error;
  }
};
