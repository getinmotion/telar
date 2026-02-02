/**
 * Tipos e Interfaces para User Profiles (NestJS Backend)
 */

/**
 * Metadatos raw del usuario
 */
export interface RawUserMetaData {
  full_name?: string;
  last_name?: string;
  first_name?: string;
}

/**
 * Usuario completo del backend (nested en UserProfile)
 */
export interface UserProfileUser {
  id: string;
  instanceId: string | null;
  aud: string | null;
  role: string;
  email: string;
  encryptedPassword: string;
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
  rawUserMetaData: RawUserMetaData | null;
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
 * Perfil completo del usuario (respuesta del backend)
 */
export interface UserProfile {
  id: string;
  userId: string;
  user: UserProfileUser;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  businessDescription: string | null;
  brandName: string | null;
  businessType: string | null;
  targetMarket: string | null;
  currentStage: string | null;
  businessGoals: string | null;
  monthlyRevenueGoal: string | null;
  timeAvailability: string | null;
  teamSize: string | null;
  currentChallenges: string | null;
  salesChannels: string | null;
  socialMediaPresence: Record<string, any>;
  businessLocation: string | null;
  yearsInBusiness: number | null;
  initialInvestmentRange: string | null;
  primarySkills: string | null;
  languagePreference: string;
  userType: string;
  firstName: string;
  lastName: string;
  whatsappE164: string | null;
  department: string | null;
  city: string | null;
  rut: string | null;
  rutPendiente: boolean;
  newsletterOptIn: boolean;
  accountType: string;
  daneCity: string | null;
}

/**
 * Respuesta exitosa al obtener perfil de usuario por userId
 */
export type GetUserProfileByUserIdSuccessResponse = UserProfile;

/**
 * Respuesta de error genérico del backend
 */
export interface UserProfileErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

/**
 * Tipo unión para manejar respuestas
 */
export type GetUserProfileByUserIdResponse = 
  | GetUserProfileByUserIdSuccessResponse 
  | UserProfileErrorResponse;

/**
 * Payload para crear un nuevo perfil de usuario (POST)
 */
export interface CreateUserProfilePayload {
  userId: string;
  fullName?: string;
  avatarUrl?: string;
  businessDescription?: string;
  brandName?: string;
  businessType?: string;
  targetMarket?: string;
  currentStage?: string;
  businessGoals?: string[];
  monthlyRevenueGoal?: number;
  timeAvailability?: string;
  teamSize?: string;
  currentChallenges?: string[];
  salesChannels?: string[];
  socialMediaPresence?: Record<string, any>;
  businessLocation?: string;
  yearsInBusiness?: number;
  initialInvestmentRange?: string;
  primarySkills?: string[];
  languagePreference?: string;
  userType?: string;
  firstName?: string;
  lastName?: string;
  whatsappE164?: string;
  department?: string;
  city?: string;
  rut?: string;
  rutPendiente?: boolean;
  newsletterOptIn?: boolean;
  accountType?: string;
  daneCity?: number;
}

/**
 * Payload para actualizar un perfil existente (PATCH)
 * Todos los campos son opcionales excepto el userId (que va en la URL)
 */
export type UpdateUserProfilePayload = Partial<Omit<CreateUserProfilePayload, 'userId'>>;
