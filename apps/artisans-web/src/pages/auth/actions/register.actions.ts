import { telarApi } from "@/integrations/api/telarApi";
import {
    RegisterPayload,
    RegisterSuccessResponse,
    VerifyEmailSuccessResponse,
} from "../types/register.types";

/**
 * Registrar un nuevo usuario en el backend NestJS
 * @param registerPayload - Datos del formulario de registro
 * @returns RegisterSuccessResponse con información del usuario creado
 * @throws Error si el registro falla
 */
export const register = async (
    registerPayload: RegisterPayload
): Promise<RegisterSuccessResponse> => {
    const response = await telarApi.post<RegisterSuccessResponse>(
        "/auth/register",
        registerPayload
    );
    return response.data;
};

/**
 * Verificar email del usuario con el token recibido por correo
 * @param token - Token de verificación del email
 * @returns VerifyEmailSuccessResponse con información de la verificación
 * @throws Error si la verificación falla
 */
export const verifyEmail = async (
    token: string
): Promise<VerifyEmailSuccessResponse> => {
    const response = await telarApi.post<VerifyEmailSuccessResponse>(
        `/email-verifications/verify/${token}`
    );
    return response.data;
};
