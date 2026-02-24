import { telarApi } from "@/integrations/api/telarApi";
import { 
  RegisterPayload, 
  RegisterSuccessResponse,
  VerifyEmailSuccessResponse 
} from "../types/register.types";

/**
 * Registrar un nuevo usuario en el backend NestJS
 * @param registerPayload - Datos del formulario de registro
 * @returns RegisterSuccessResponse con información del usuario creado
 * @throws Error si el registro falla
 */
export const register = async (registerPayload: RegisterPayload): Promise<RegisterSuccessResponse> => {
    try {
        // Llamada al endpoint de registro del backend NestJS
        const response = await telarApi.post<RegisterSuccessResponse>(
            '/telar/server/auth/register',
            registerPayload
        );
        
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Verificar email del usuario con el token recibido por correo
 * @param token - Token de verificación del email
 * @returns VerifyEmailSuccessResponse con información de la verificación
 * @throws Error si la verificación falla
 */
export const verifyEmail = async (token: string): Promise<VerifyEmailSuccessResponse> => {
    try {
        // Llamada al endpoint de verificación de email del backend NestJS
        // El token va en la URL como parámetro de ruta
        const response = await telarApi.post<VerifyEmailSuccessResponse>(
            `/telar/server/email-verifications/verify/${token}`
        );
        
        console.log('✅ Email verificado exitosamente:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error al verificar email:', error);
        throw error;
    }
}