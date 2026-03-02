/**
 * Authentication Types
 * Tipos para la respuesta del servicio de autenticación
 */

/**
 * Metadatos adicionales del usuario
 */
export interface RawUserMetaData {
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

/**
 * Usuario autenticado
 * Response de /auth/me, /auth/login, /auth/register
 */
export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  isSuperAdmin: boolean;
  emailConfirmedAt: string;
  lastSignInAt: string;
  createdAt: string;
  updatedAt: string;
  rawUserMetaData: RawUserMetaData | null;
  bannedUntil: string | null;
  deletedAt: string | null;
  isSsoUser: boolean;
}

/**
 * Perfil de negocio del usuario
 */
export interface BusinessProfile {
  products?: string[];
  [key: string]: any;
}

/**
 * Contexto de negocio
 */
export interface BusinessContext {
  industry?: string;
  size?: string;
  [key: string]: any;
}

/**
 * Objetivos y metas
 */
export interface GoalsAndObjectives {
  goal?: string;
  [key: string]: any;
}

/**
 * Contexto maestro del usuario
 * Información adicional sobre el contexto de negocio del usuario
 */
export interface UserMasterContext {
  id: string;
  userId: string;
  languagePreference: string;
  businessContext: BusinessContext | null;
  goalsAndObjectives: GoalsAndObjectives | null;
  businessProfile: BusinessProfile | null;
  contextVersion: number;
  lastAssessmentDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tienda del artesano
 * Información de la tienda si el usuario es artesano
 */
export interface ArtisanShop {
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description: string;
  department: string;
  municipality: string;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Acciones de madurez del usuario
 * Seguimiento de acciones completadas por el usuario
 */
export interface UserMaturityAction {
  id: string;
  userId: string;
  actionType: string;
  category: string;
  description: string;
  points: number;
  createdAt: string;
}

/**
 * Response completo de autenticación
 * Retornado por /auth/login, /auth/register, /auth/me
 */
export interface AuthResponse {
  user: AuthUser;
  userMasterContext: UserMasterContext | null;
  artisanShop: ArtisanShop | null;
  userMaturityActions: UserMaturityAction[];
  access_token: string;
}

/**
 * Response de Google OAuth
 * Extiende AuthResponse con la misma estructura
 */
export interface GoogleAuthResponse extends AuthResponse {}

/**
 * Data para registro de nuevo usuario
 * Payload para POST /auth/register-marketplace
 */
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  whatsapp: string; // Formato: +573001234567
  department: string; // Departamento de Colombia
  city: string; // Ciudad de Colombia
  hasRUT: boolean;
  rut?: string; // Opcional, solo si hasRUT = true
  acceptTerms: boolean; // Obligatorio
  newsletterOptIn: boolean; // Opcional
}

/**
 * Usuario incluido en el response de registro del marketplace
 * User object de POST /auth/register-marketplace
 */
export interface RegisterMarketplaceUser {
  id: string;
  email: string;
  phone: string;
  role: string;
  emailConfirmedAt: string;
  lastSignInAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response de registro en el marketplace
 * Response de POST /auth/register-marketplace
 */
export interface RegisterMarketplaceResponse {
  success: boolean;
  message: string;
  userId: string;
  user: RegisterMarketplaceUser;
  access_token: string;
}
