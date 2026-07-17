/**
 * Authentication Service
 * Servicio para gestión de autenticación con el backend NestJS
 */

import { telarApi, telarApiPublic } from "@/integrations/api/telarApi";
import { toastError } from "@/utils/toast.utils";
import {
  AuthResponse,
  GoogleAuthResponse,
  RegisterMarketplaceResponse,
  RegisterOtpResponse,
  SignUpData,
  VerifyOtpResponse,
} from "@/types/auth.types";

/**
 * Iniciar sesión con Google
 * Redirige al usuario a la URL de autenticación de Google
 * El backend maneja todo el flujo OAuth y redirige a /auth/google/callback
 *
 * Flujo:
 * 1. Frontend llama a esta función
 * 2. Redirige a backend /auth/google
 * 3. Backend redirige a Google OAuth
 * 4. Google redirige de vuelta al backend /auth/google/callback
 * 5. Backend valida el token y redirige al frontend a /auth/google/callback?token=xxx
 * 6. Frontend (GoogleAuthCallback) extrae el token y lo guarda en localStorage
 * 7. Contexto de auth se actualiza automáticamente
 *
 * Endpoint: GET /auth/google
 */
export const initiateGoogleAuth = async (): Promise<void> => {
  try {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Registrarse con email y contraseña en el marketplace
 *
 * @param {SignUpData} data - Datos completos del registro del comprador
 * @returns {Promise<RegisterMarketplaceResponse>} Response con datos del usuario creado y access_token
 *
 * @endpoint POST /auth/register-marketplace
 */
export const signUpWithEmail = async (
  data: SignUpData
): Promise<RegisterMarketplaceResponse> => {
  try {
    const response = await telarApiPublic.post<RegisterMarketplaceResponse>(
      "/auth/register-marketplace",
      data
    );

    if (response.data.access_token) {
      localStorage.setItem("telar_token", response.data.access_token);
    }

    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Iniciar sesión con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña
 * @returns AuthResponse con datos del usuario y access_token
 *
 * Endpoint: POST /auth/login
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await telarApiPublic.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    // Guardar el token en localStorage
    if (response.data.access_token) {
      localStorage.setItem("telar_token", response.data.access_token);
    }

    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Obtener el usuario actual usando el token almacenado
 * @returns AuthUser si hay sesión activa, null si no hay token
 *
 * Endpoint: GET /auth/me
 */
export const getCurrentUser = async (): Promise<AuthResponse | null> => {
  try {
    const token = localStorage.getItem("telar_token");
    if (!token) {
      return null;
    }

    const response = await telarApi.get<AuthResponse>("/auth/me");
    return response.data;
  } catch (error: any) {
    localStorage.removeItem("telar_token");
    return null;
  }
};

/**
 * Registrar (o reutilizar) un usuario invitado y enviar código OTP al correo
 * @param email - Email del usuario
 * @returns {Promise<RegisterOtpResponse>} Confirmación de envío con userId
 *
 * @endpoint POST /auth/register-otp
 */
export const registerOtp = async (
  email: string
): Promise<RegisterOtpResponse> => {
  try {
    const response = await telarApiPublic.post<RegisterOtpResponse>(
      "/auth/register-otp",
      { email }
    );
    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Verificar OTP, confirmar la cuenta y completar autenticación
 * @param email - Email del usuario
 * @param code - Código OTP de 6 dígitos recibido
 * @returns {Promise<VerifyOtpResponse>} Datos del usuario y access_token
 *
 * @endpoint POST /auth/verify-otp
 */
export const verifyOtp = async (
  email: string,
  code: string
): Promise<VerifyOtpResponse> => {
  try {
    const response = await telarApiPublic.post<VerifyOtpResponse>(
      "/auth/verify-otp",
      { email, code }
    );

    if (response.data.access_token) {
      localStorage.setItem("telar_token", response.data.access_token);
    }

    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Solicitar reseteo de contraseña
 * @param email - Email del usuario
 *
 * Endpoint: POST /auth/forgot-password
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await telarApiPublic.post("/auth/request-password-recovery", {
      email,
    });
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Actualizar contraseña
 * @param newPassword - Nueva contraseña
 * @returns AuthResponse actualizado
 *
 * Endpoint: POST /auth/update-password
 */
export const updatePassword = async (
  newPassword: string
): Promise<AuthResponse> => {
  try {
    const response = await telarApiPublic.post<AuthResponse>(
      "/auth/update-password",
      {
        newPassword,
      }
    );

    return response.data;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Cerrar sesión (Sign Out)
 * Limpia el token del localStorage
 *
 * Endpoint: POST /auth/logout
 */
export const signOut = async (): Promise<void> => {
  try {
    // Intentar notificar al backend
    try {
      await telarApiPublic.post("/auth/logout");
    } catch {
      // Si falla, continuamos con la limpieza local
    }

    // Limpiar token local
    localStorage.removeItem("telar_token");
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};
