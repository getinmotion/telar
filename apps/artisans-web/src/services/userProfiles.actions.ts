import { telarApi } from "@/integrations/api/telarApi";
import {
  GetUserProfileByUserIdSuccessResponse,
  UserProfileErrorResponse,
  CreateUserProfilePayload,
  UpdateUserProfilePayload
} from "@/types/userProfile.types";

/**
 * Obtener el perfil de usuario por userId desde el backend NestJS
 * @param userId - UUID del usuario
 * @returns GetUserProfileByUserIdSuccessResponse con toda la información del perfil
 * @throws Error si el perfil no existe o hay un error del servidor
 */
export const getUserProfileByUserId = async (
  userId: string
): Promise<GetUserProfileByUserIdSuccessResponse> => {
  try {
    // Llamada al endpoint de user-profiles del backend NestJS
    const response = await telarApi.get<GetUserProfileByUserIdSuccessResponse>(
      `/user-profiles/by-user/${userId}`
    );

    return response.data;
  } catch (error: any) {
    console.error('[UserProfiles] Error al obtener perfil del usuario:', error);

    // Si el backend retorna un error estructurado, lanzarlo tal cual
    if (error.response?.data) {
      throw error.response.data as UserProfileErrorResponse;
    }

    throw error;
  }
};

/**
 * Verificar si un usuario tiene perfil creado
 * @param userId - UUID del usuario
 * @returns true si el perfil existe, false en caso contrario
 */
export const hasUserProfile = async (userId: string): Promise<boolean> => {
  try {
    await getUserProfileByUserId(userId);
    return true;
  } catch (error: any) {
    // Si retorna 404 o 500, significa que no existe
    if (error.statusCode === 404 || error.statusCode === 500) {
      return false;
    }
    throw error;
  }
};

/**
 * Crear un nuevo perfil de usuario en el backend NestJS
 * @param payload - Datos del perfil a crear (CreateUserProfilePayload)
 * @returns GetUserProfileByUserIdSuccessResponse con el perfil creado
 * @throws Error si hay un error en la creación
 */
export const createUserProfile = async (
  payload: CreateUserProfilePayload
): Promise<GetUserProfileByUserIdSuccessResponse> => {
  try {
    const response = await telarApi.post<GetUserProfileByUserIdSuccessResponse>(
      `/user-profiles`,
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error('[UserProfiles] Error al crear perfil:', error);

    if (error.response?.data) {
      throw error.response.data as UserProfileErrorResponse;
    }

    throw error;
  }
};

/**
 * Actualizar un perfil de usuario por ID del profile (directo)
 * Usar esta función cuando ya tengas el profile.id disponible (más eficiente)
 * @param profileId - UUID del user_profile (no del user)
 * @param payload - Datos a actualizar (UpdateUserProfilePayload)
 * @returns GetUserProfileByUserIdSuccessResponse con el perfil actualizado
 * @throws Error si hay un error en la actualización
 */
export const updateUserProfileById = async (
  profileId: string,
  payload: UpdateUserProfilePayload
): Promise<GetUserProfileByUserIdSuccessResponse> => {
  try {
    const response = await telarApi.patch<GetUserProfileByUserIdSuccessResponse>(
      `/user-profiles/${profileId}`,
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error('[UserProfiles] Error al actualizar perfil por ID:', error);

    if (error.response?.data) {
      throw error.response.data as UserProfileErrorResponse;
    }

    throw error;
  }
};

/**
 * Actualizar un perfil de usuario existente en el backend NestJS
 * IMPORTANTE: El endpoint PATCH requiere el ID del user_profile, no el userId
 * Por eso esta función primero obtiene el profile para conseguir su ID
 * 
 * NOTA: Si ya tienes el profile cargado, usa updateUserProfileById() para evitar el GET extra
 * 
 * @param userId - UUID del usuario
 * @param payload - Datos a actualizar (UpdateUserProfilePayload)
 * @returns GetUserProfileByUserIdSuccessResponse con el perfil actualizado
 * @throws Error si hay un error en la actualización o si el perfil no existe
 */
export const updateUserProfile = async (
  userId: string,
  payload: UpdateUserProfilePayload
): Promise<GetUserProfileByUserIdSuccessResponse> => {
  try {
    // PASO 1: Obtener el perfil actual para conseguir su ID
    const currentProfile = await getUserProfileByUserId(userId);

    if (!currentProfile?.id) {
      throw new Error('No se encontró el perfil del usuario para actualizar');
    }

    // PASO 2: Usar la función optimizada con el ID
    return updateUserProfileById(currentProfile.id, payload);
  } catch (error: any) {
    console.error('[UserProfiles] Error al actualizar perfil:', error);

    if (error.response?.data) {
      throw error.response.data as UserProfileErrorResponse;
    }

    throw error;
  }
};
