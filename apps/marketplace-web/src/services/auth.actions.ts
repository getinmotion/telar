/**
 * Authentication Service
 * Servicio para gestión de autenticación con el backend NestJS
 */

import { telarApi, telarApiPublic } from '@/integrations/api/telarApi';
import { supabase } from '@/integrations/supabase/client';
import { toastError } from '@/utils/toast.utils';
import { AuthResponse, GoogleAuthResponse, SignUpData } from '@/types/auth.types';

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
 * Registrarse con email y contraseña
 * @param data - Datos completos del registro
 * @returns AuthResponse con datos del usuario y access_token
 *
 * Endpoint: POST /auth/register
 */
export const signUpWithEmail = async (
  data: SignUpData
): Promise<AuthResponse> => {
  try {
    const response = await telarApiPublic.post<AuthResponse>('/auth/register', data);

    // Guardar el token en localStorage
    if (response.data.access_token) {
      localStorage.setItem('telar_token', response.data.access_token);
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
    const response = await telarApiPublic.post<AuthResponse>('/auth/login', {
      email,
      password,
    });


    // Guardar el token en localStorage
    if (response.data.access_token) {
      localStorage.setItem('telar_token', response.data.access_token);
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
    const token = localStorage.getItem('telar_token');
    if (!token) {
      return null;
    }

    const response = await telarApi.get<AuthResponse>('/auth/me');
    return response.data;
  } catch (error: any) {
    localStorage.removeItem('telar_token');
    return null;
  }
};

/**
 * Enviar OTP (One-Time Password)
 * @param email - Email del usuario
 * @param channel - Canal de envío ('email' o 'whatsapp')
 * 
 * Endpoint: POST /auth/send-otp (Supabase)
 */
export const sendOtp = async (
  email: string,
  channel: 'email' | 'whatsapp' = 'email'
): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { email, channel }
    });

    if (error) throw error;
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};

/**
 * Verificar OTP y completar autenticación
 * @param email - Email del usuario
 * @param code - Código OTP recibido
 * @returns AuthResponse con datos del usuario y access_token
 * 
 * Endpoint: POST /auth/verify-otp (Supabase)
 */
export const verifyOtp = async (
  email: string,
  code: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { email, code }
    });

    if (error) throw error;

    // Establecer la sesión usando el token_hash devuelto por el backend
    if (data?.token_hash) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: 'magiclink',
        token_hash: data.token_hash,
      });

      if (verifyError) {
        throw verifyError;
      }
    }

    // Retornar una respuesta compatible con AuthResponse
    return {
      user: {
        id: data?.user_id || '',
        email: email,
        phone: null,
        role: 'user',
        isSuperAdmin: false,
        emailConfirmedAt: new Date().toISOString(),
        lastSignInAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rawUserMetaData: null,
        bannedUntil: null,
        deletedAt: null,
        isSsoUser: false,
      },
      userMasterContext: null,
      artisanShop: null,
      userMaturityActions: [],
      access_token: data?.token_hash || '',
    };
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
    await telarApiPublic.post('/auth/forgot-password', {
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
    const response = await telarApiPublic.post<AuthResponse>('/auth/update-password', {
      newPassword,
    });

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
      await telarApiPublic.post('/auth/logout');
    } catch {
      // Si falla, continuamos con la limpieza local
    }

    // Limpiar token local
    localStorage.removeItem('telar_token');
  } catch (error: any) {
    toastError(error);
    throw error;
  }
};
