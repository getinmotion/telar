/**
 * Interfaces para el proceso de Login con el backend NestJS
 */

/**
 * Datos requeridos para el login
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Metadatos del usuario (rawUserMetaData del backend)
 */
export interface UserMetadata {
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Información completa del usuario autenticado (estructura del backend NestJS)
 */
export interface AuthUser {
  id: string;
  instanceId: string | null;
  aud: string | null;
  role: string;
  email: string;
  emailConfirmedAt: string | null;
  invitedAt: string | null;
  confirmationToken: string | null;
  confirmationSentAt: string | null;
  recoveryToken: string | null;
  recoverySentAt: string | null;
  emailChangeTokenNew: string | null;
  emailChange: string | null;
  emailChangeSentAt: string | null;
  lastSignInAt: string | null;
  rawAppMetaData: any;
  rawUserMetaData: UserMetadata | null;
  isSuperAdmin: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  phone: string | null;
  phoneConfirmedAt: string | null;
  phoneChange: string;
  phoneChangeToken: string;
  phoneChangeSentAt: string | null;
  confirmedAt: string | null;
  emailChangeTokenCurrent: string;
  emailChangeConfirmStatus: number;
  bannedUntil: string | null;
  reauthenticationToken: string;
  reauthenticationSentAt: string | null;
  isSsoUser: boolean;
  deletedAt: string | null;
  isAnonymous: boolean;
}

/**
 * Maturity Scores del usuario
 */
export interface MaturityScores {
  ideaValidation?: number;
  userExperience?: number;
  marketFit?: number;
  monetization?: number;
}

/**
 * Task Generation Context
 */
export interface TaskGenerationContext {
  maturityScores?: MaturityScores;
  preferred_task_complexity?: string;
  focus_areas?: string[];
  learning_style?: string;
  available_time_per_week?: number;
  language?: string;
  lastAssessmentSource?: string;
  lastGeneration?: string;
}

/**
 * User Master Context (contexto completo del usuario)
 */
export interface UserMasterContext {
  id?: string;
  user_id: string;
  business_profile?: Record<string, any>;
  task_generation_context?: TaskGenerationContext;
  conversation_insights?: Record<string, any>;
  preferences?: Record<string, any>;
  language_preference?: string;
  context_version?: number;
  last_updated?: string;
  created_at?: string;
}

/**
 * Artisan Shop (tienda del usuario)
 */
export interface ArtisanShop {
  id: string;
  user_id: string;
  creation_status?: 'complete' | 'in_progress' | null;
  creation_step?: number;
  logo_url?: string;
  hero_config?: Record<string, any>;
  story?: string;
  about_content?: Record<string, any>;
  social_links?: Record<string, any>;
  contact_info?: Record<string, any>;
}

/**
 * User Maturity Action
 */
export interface UserMaturityAction {
  id: string;
  user_id: string;
  action_type: string;
  action_data?: Record<string, any>;
  created_at?: string;
}

/**
 * Respuesta exitosa del login (HTTP 200)
 * Ahora incluye userMasterContext, artisanShop y userMaturityActions
 */
export interface LoginSuccessResponse {
  user: AuthUser;
  userMasterContext: UserMasterContext | null;
  artisanShop: ArtisanShop | null;
  userMaturityActions: UserMaturityAction[];
  access_token: string;
}

/**
 * Estructura del error interno del backend NestJS
 */
interface NestJSErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

/**
 * Estructura completa del error de login
 */
export interface LoginErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: {
    response: NestJSErrorResponse;
    status: number;
    options: Record<string, any>;
    message: string;
    name: string;
  };
}

/**
 * Type union para manejar ambos casos de respuesta
 */
export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

/**
 * Respuesta exitosa al obtener el perfil del usuario
 */
export type GetProfileSuccessResponse = AuthUser;

/**
 * Respuesta exitosa al refrescar el token
 */
export interface RefreshTokenSuccessResponse {
  access_token: string;
}

/**
 * Estructura del error de autenticación genérico (401)
 */
export interface AuthErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: {
    response: {
      message: string;
      error: string;
      statusCode: number;
    };
    status: number;
    options: Record<string, any>;
    message: string;
    name: string;
  };
}

