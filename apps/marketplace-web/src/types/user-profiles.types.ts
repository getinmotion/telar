/**
 * User Profiles Types
 * Tipos para el módulo de perfiles de usuario
 */

/**
 * Perfil del usuario
 */
export interface UserProfile {
  id: string;
  fullName: string | null;
  userType: string; // "customer" | "artisan" | "admin" | "shop_owner"
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request para actualizar perfil de usuario
 */
export interface UpdateUserProfileRequest {
  fullName?: string;
  userType?: string;
}

/**
 * Response al actualizar perfil
 */
export interface UserProfileResponse extends UserProfile {}
