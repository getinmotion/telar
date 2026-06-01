import { telarApi } from "@/integrations/api/telarApi";
import {
    LoginPayload,
    LoginSuccessResponse,
    GetProfileSuccessResponse,
    RefreshTokenSuccessResponse
} from "../types/login.types";
import { useAuthStore } from "@/stores/authStore";
import { toastError } from "@/utils/toast.utils";
import { parseJwtPayload } from "@/utils/jwt.utils";

/**
 * Iniciar sesión en el backend NestJS
 * @param loginPayload - Email y contraseña del usuario
 * @returns LoginSuccessResponse con información del usuario y token de acceso
 * @throws Error si el login falla (credenciales inválidas, etc.)
 */
export const login = async (loginPayload: LoginPayload): Promise<LoginSuccessResponse> => {
    try {
        // Llamada al endpoint de login del backend NestJS
        const response = await telarApi.post<LoginSuccessResponse>(
            '/auth/login',
            loginPayload
        );

        // Decodificar el JWT para extraer roles[] e isSuperAdmin
        // El JWT (Fase 0.2) ya incluye estos campos; el objeto `user` del response no los trae.
        const jwtPayload = parseJwtPayload(response.data.access_token);

        // ✅ Guardar toda la información en el store de Zustand
        useAuthStore.getState().setAuthData({
            user: {
                ...response.data.user,
                // Enriquecer user con datos del JWT que no vienen en el response body
                isSuperAdmin: jwtPayload?.isSuperAdmin ?? response.data.user?.isSuperAdmin ?? false,
                roles: jwtPayload?.roles ?? [],
            },
            userMasterContext: response.data.userMasterContext,
            artisanShop: response.data.artisanShop,
            userMaturityActions: response.data.userMaturityActions,
            access_token: response.data.access_token
        });

        // ✅ Notificar al AuthProvider que se completó el login
        window.dispatchEvent(new Event('auth:login'));

        return response.data;
    } catch (error) {
        toastError(error);
        throw error;
    }
}

/**
 * Obtener el perfil del usuario actual usando el token almacenado
 * @returns GetProfileSuccessResponse con toda la información del usuario
 * @throws Error si el token no es válido o no existe
 */
export const getCurrentUser = async (): Promise<GetProfileSuccessResponse> => {
    const response = await telarApi.get<GetProfileSuccessResponse>('/auth/profile');
    return response.data;
}

/**
 * Refrescar el token de acceso usando el token actual.
 * Actualiza roles e isSuperAdmin en el store con los datos del nuevo JWT.
 */
export const refreshToken = async (): Promise<RefreshTokenSuccessResponse> => {
    try {
        // El token actual se envía automáticamente por el interceptor de telarApi
        const response = await telarApi.post<RefreshTokenSuccessResponse>(
            '/auth/refresh'
        );

        if (response.data.access_token) {
            localStorage.setItem('telar_token', response.data.access_token);

            // Actualizar roles e isSuperAdmin en el store con el nuevo JWT
            const jwtPayload = parseJwtPayload(response.data.access_token);
            if (jwtPayload) {
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    useAuthStore.getState().setAuthData({
                        user: {
                            ...currentUser,
                            isSuperAdmin: jwtPayload.isSuperAdmin ?? currentUser.isSuperAdmin ?? false,
                            roles: jwtPayload.roles ?? currentUser.roles ?? [],
                        },
                        userMasterContext: useAuthStore.getState().userMasterContext,
                        artisanShop: useAuthStore.getState().artisanShop,
                        userMaturityActions: useAuthStore.getState().userMaturityActions,
                        access_token: response.data.access_token,
                    });
                }
            }
        }

        return response.data;
    } catch (error) {
        localStorage.removeItem('telar_token');
        localStorage.removeItem('telar_user');
        throw error;
    }
}

/**
 * Cerrar sesión (limpiar token del localStorage y store de Zustand)
 */
export const logout = (): void => {
    // Limpiar store de Zustand (esto también limpia localStorage)
    useAuthStore.getState().clearAuth();
}

/**
 * Verificar si el usuario tiene un token guardado
 * @returns true si existe un token en localStorage
 */
export const hasToken = (): boolean => {
    return !!localStorage.getItem('telar_token');
}

/**
 * Obtener el token del localStorage
 * @returns El token o null si no existe
 */
export const getToken = (): string | null => {
    return localStorage.getItem('telar_token');
}

