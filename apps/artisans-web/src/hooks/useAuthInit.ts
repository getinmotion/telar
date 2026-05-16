import { useEffect } from 'react';
import {
  getCurrentUser,
  refreshToken as refreshTokenAction,
  logout as logoutAction,
} from '@/pages/auth/actions/login.actions';
import { useAuthStore } from '@/stores/authStore';

const TOKEN_REFRESH_INTERVAL_MS = 3.5 * 60 * 60 * 1000; // 3.5 horas

/**
 * Orquesta la inicialización de autenticación al arrancar la app.
 * - Valida el JWT con el backend en background
 * - Refresca el token si está expirado
 * - Configura auto-refresh periódico
 * - Sincroniza estado si el usuario hace login desde otra pestaña
 * - Marca isInitialized = true cuando termina
 *
 * No mantiene estado propio: toda la escritura va a authStore.
 */
export function useAuthInit(): void {
  useEffect(() => {
    let mounted = true;
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    const store = useAuthStore.getState();

    // Si Zustand ya rehidrató y no hay token, marcar como inicializado y salir
    if (!store.access_token) {
      useAuthStore.setState({ isInitialized: true });
      return;
    }

    const validateAndInit = async () => {
      try {
        // Intentar validar el token con el backend
        await getCurrentUser();
      } catch {
        // Token inválido — intentar refrescar
        try {
          const refreshResponse = await refreshTokenAction();
          if (!refreshResponse?.access_token) {
            throw new Error('Refresh failed');
          }
        } catch {
          // Refresh también falló → limpiar sesión
          if (mounted) {
            logoutAction();
            useAuthStore.getState().clearAuth();
          }
        }
      } finally {
        if (mounted) {
          useAuthStore.setState({ isInitialized: true });
        }
      }
    };

    validateAndInit();

    // Auto-refresh del token cada 3.5 horas
    refreshInterval = setInterval(async () => {
      try {
        await refreshTokenAction();
      } catch {
        // El próximo ciclo detectará el token expirado
      }
    }, TOKEN_REFRESH_INTERVAL_MS);

    // Sincronización multi-pestaña: si el usuario hace login en otra pestaña
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== 'telar_token' && e.key !== 'telar_user') return;

      const token = localStorage.getItem('telar_token');
      const userStr = localStorage.getItem('telar_user');

      if (!token || !userStr) {
        useAuthStore.getState().clearAuth();
        return;
      }

      try {
        const user = JSON.parse(userStr);
        // Solo actualizar si cambió el usuario
        if (user?.id !== useAuthStore.getState().user?.id) {
          useAuthStore.setState({ access_token: token, user, isAuthenticated: true });
        }
      } catch {
        // localStorage corrupto — ignorar
      }
    };

    // Sincronización misma pestaña: login.actions.ts despacha este evento
    const handleLoginSuccess = () => {
      const token = localStorage.getItem('telar_token');
      if (token && !useAuthStore.getState().isAuthenticated) {
        useAuthStore.setState({ isInitialized: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:login', handleLoginSuccess);

    return () => {
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:login', handleLoginSuccess);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
