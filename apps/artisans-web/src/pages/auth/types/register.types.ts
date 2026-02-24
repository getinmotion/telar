/**
 * Tipos e Interfaces para el módulo de Registro
 */

/**
 * Datos del formulario de registro
 */
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  hasRUT: boolean;
  rut: string;
  department: string;
  city: string;
  whatsapp: string;
  acceptTerms: boolean;
  newsletterOptIn: boolean;
}

/**
 * Datos para enviar al backend NestJS
 * ⚠️ IMPORTANTE: El backend requiere passwordConfirmation para validación
 */
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string; // ✅ Requerido por el backend NestJS
  hasRUT: boolean;
  rut: string;
  department: string;
  city: string;
  whatsapp: string;
  acceptTerms: boolean;
  newsletterOptIn: boolean;
}

/**
 * Usuario retornado en la respuesta del registro
 */
export interface RegisterUser {
  id: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

/**
 * Respuesta exitosa del registro desde el servidor NestJS
 */
export interface RegisterSuccessResponse {
  success: true;
  message: string;
  userId: string;
  user: RegisterUser;
}

/**
 * Respuesta con error del registro
 */
export interface RegisterErrorResponse {
  success: false;
  error: string;
  errorCode?: 'EMAIL_EXISTS' | 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'UNKNOWN';
  code?: string;
  message?: string;
}

/**
 * Tipo unión para la respuesta del registro
 */
export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;

/**
 * Errores de validación del formulario
 */
export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  rut?: string;
  department?: string;
  city?: string;
  whatsapp?: string;
  acceptTerms?: string;
  submit?: string;
}

/**
 * Campos validados del formulario
 */
export interface RegisterValidFields {
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  password?: boolean;
  passwordConfirmation?: boolean;
  rut?: boolean;
  department?: boolean;
  city?: boolean;
  whatsapp?: boolean;
}

/**
 * Resultado de validación de un campo
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valores iniciales del formulario
 */
export const REGISTER_FORM_INITIAL_VALUES: RegisterFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  hasRUT: false,
  rut: '',
  department: '',
  city: '',
  whatsapp: '+57',
  acceptTerms: false,
  newsletterOptIn: false,
};

/**
 * Respuesta exitosa de verificación de email
 */
export interface VerifyEmailSuccessResponse {
  success: true;
  message: string;
  userId: string;
  emailConfirmedAt: string;
}

/**
 * Respuesta con error de verificación de email
 */
export interface VerifyEmailErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

