import { useEffect } from 'react';
import {
  getCurrentUser,
  refreshToken as refreshTokenAction,
  logout as logoutAction,
} from '@/pages/auth/actions/login.actions';
import { useAuthStore } from '@/stores/authStore';
import { isJwtExpired } from '@/utils/jwt.utils';

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

    console.log('Store de la auth', store)

    // ✅ MIGRATION: If Zustand persist has no data, try loading from legacy keys
    // This handles users who logged in before we implemented Zustand persist
    if (!store.user && !store.access_token) {
      const legacyToken = localStorage.getItem('telar_token');
      const legacyUserStr = localStorage.getItem('telar_user');

      if (legacyToken && legacyUserStr) {
        try {
          const legacyUser = JSON.parse(legacyUserStr);
          console.log('[useAuthInit] Migrating legacy localStorage data to Zustand');

          // Extract user data from legacy structure
          const user = {
            id: legacyUser.profile?.userId || legacyUser.id || '',
            email: legacyUser.profile?.email || legacyUser.email || '',
            role: legacyUser.profile?.userType || 'authenticated',
            phone: legacyUser.profile?.whatsappE164,
            emailConfirmedAt: legacyUser.profile?.createdAt,
            rawUserMetaData: {
              full_name: legacyUser.profile?.fullName,
              first_name: legacyUser.profile?.firstName,
              last_name: legacyUser.profile?.lastName,
            },
            createdAt: legacyUser.profile?.createdAt,
            updatedAt: legacyUser.profile?.updatedAt,
          };

          // Migrate to Zustand store
          useAuthStore.setState({
            user,
            access_token: legacyToken,
            isAuthenticated: true,
            userMasterContext: legacyUser.context || null,
            artisanShop: null,
            userMaturityActions: [],
          });

          console.log('[useAuthInit] Migration complete - user restored:', user.email);
        } catch (error) {
          console.error('[useAuthInit] Failed to migrate legacy data:', error);
        }
      }
    }

    // Re-check store after potential migration
    const currentStore = useAuthStore.getState();

    // Si Zustand ya rehidrató y no hay token, marcar como inicializado y salir
    if (!currentStore.access_token) {
      useAuthStore.setState({ isInitialized: true });
      return;
    }

    const validateAndInit = async (attempt = 1) => {
      const maxAttempts = 2; // Try validation twice before giving up

      try {
        // Attempt to validate the token with the backend
        await getCurrentUser();
      } catch (validationError) {
        // Token validation failed - try to refresh it
        try {
          const refreshResponse = await refreshTokenAction();
          if (!refreshResponse?.access_token) {
            throw new Error('Refresh failed');
          }
          // Refresh succeeded - validation complete ✓
        } catch (refreshError) {
          // Both validation and refresh failed
          if (attempt < maxAttempts) {
            // Retry after a short delay (network might be temporarily down)
            await new Promise(resolve => setTimeout(resolve, 1000));
            return validateAndInit(attempt + 1);
          }

          // Only clear session if the JWT is provably expired.
          // Network errors or backend issues should NOT log the user out.
          const storedToken = useAuthStore.getState().access_token || localStorage.getItem('telar_token');
          if (mounted && storedToken && isJwtExpired(storedToken)) {
            console.warn('[useAuthInit] JWT expired, clearing auth');
            logoutAction();
            useAuthStore.getState().clearAuth();
          } else if (mounted) {
            console.warn('[useAuthInit] Validation failed but JWT not expired — keeping session alive');
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
    // const handleStorageChange = (e: StorageEvent) => {
    //   if (e.key !== 'telar_token' && e.key !== 'telar_user') return;

    //   const token = localStorage.getItem('telar_token');
    //   const userStr = localStorage.getItem('telar_user');

    //   if (!token || !userStr) {
    //     useAuthStore.getState().clearAuth();
    //     return;
    //   }

    //   try {
    //     const user = JSON.parse(userStr);
    //     // Solo actualizar si cambió el usuario
    //     if (user?.id !== useAuthStore.getState().user?.id) {
    //       useAuthStore.setState({ access_token: token, user, isAuthenticated: true });
    //     }
    //   } catch {
    //     // localStorage corrupto — ignorar
    //   }
    // };

    // Sincronización misma pestaña: login.actions.ts despacha este evento
    const handleLoginSuccess = () => {
      const token = localStorage.getItem('telar_token');
      if (token && !useAuthStore.getState().isAuthenticated) {
        useAuthStore.setState({ isInitialized: true });
      }
    };

    // window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:login', handleLoginSuccess);

    return () => {
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
      // window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:login', handleLoginSuccess);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
