import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getCurrentUser, refreshToken as refreshTokenAction, logout as logoutAction } from '@/pages/auth/actions/login.actions';
import { AuthUser } from '@/pages/auth/types/login.types';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useAuthStore } from '@/stores/authStore';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthorized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  checkAuthorization: () => Promise<boolean>;
  debugInfo: {
    authStateChangeCount: number;
    lastAuthEvent: string | null;
    authorizationAttempts: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convierte AuthUser del backend NestJS a User de Supabase para mantener compatibilidad
 */
const convertAuthUserToSupabaseUser = (authUser: AuthUser): User => {
  return {
    id: authUser.id,
    email: authUser.email,
    aud: authUser.aud || 'authenticated',
    role: authUser.role as any,
    email_confirmed_at: authUser.emailConfirmedAt || undefined,
    phone: authUser.phone || undefined,
    confirmed_at: authUser.confirmedAt || undefined,
    last_sign_in_at: authUser.lastSignInAt || undefined,
    app_metadata: authUser.rawAppMetaData || {},
    user_metadata: authUser.rawUserMetaData || {},
    identities: [],
    created_at: authUser.createdAt || new Date().toISOString(),
    updated_at: authUser.updatedAt || new Date().toISOString(),
  } as User;
};

/**
 * Crea una sesión mock compatible con Supabase para mantener compatibilidad
 */
const createMockSession = (user: User, token: string): Session => {
  return {
    access_token: token,
    token_type: 'bearer',
    expires_in: 14400, // 4 horas (asumiendo)
    expires_at: Math.floor(Date.now() / 1000) + 14400,
    refresh_token: '',
    user: user,
  } as Session;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    authStateChangeCount: 0,
    lastAuthEvent: null as string | null,
    authorizationAttempts: 0
  });

  const { recordFailedAttempt, recordSuccessfulLogin, checkRateLimit } = useSecurityMonitoring();

  /**
   * Verificar si el usuario es administrador basándose en el rol
   */
  const checkAuthorization = async (): Promise<boolean> => {
    if (!user?.email) {
      setIsAuthorized(false);
      return false;
    }

    try {
      setDebugInfo(prev => ({ ...prev, authorizationAttempts: prev.authorizationAttempts + 1 }));

      // En el nuevo sistema, verificamos el rol del usuario
      const isAdmin = user.role === 'admin' || (user.app_metadata as any)?.is_admin === true;

      setIsAuthorized(isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Authorization check failed:', error);
      return isAuthorized;
    }
  };

  /**
   * Sincronizar usuario desde localStorage
   */
  const syncUserFromLocalStorage = React.useCallback((mounted: boolean = true) => {
    const token = localStorage.getItem('telar_token');
    const localUserString = localStorage.getItem('telar_user');

    if (!token) {
      if (mounted) {
        setUser(null);
        setSession(null);
        setLoading(false);
      }
      return;
    }

    if (localUserString) {
      try {
        const localUser = JSON.parse(localUserString);
        const supabaseUser = convertAuthUserToSupabaseUser(localUser);
        const mockSession = createMockSession(supabaseUser, token);

        if (mounted) {
          setUser(supabaseUser);
          setSession(mockSession);
          setLoading(false);

          setDebugInfo(prev => ({
            ...prev,
            authStateChangeCount: prev.authStateChangeCount + 1,
            lastAuthEvent: 'SIGNED_IN_FROM_LOCALSTORAGE'
          }));
        }
      } catch (parseError) {
        console.error('Error parsing localStorage user:', parseError);
      }
    }
  }, []);

  /**
   * Inicializar autenticación al cargar la aplicación
   */
  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      try {
        syncUserFromLocalStorage(mounted);

        const token = localStorage.getItem('telar_token');
        if (!token) {
          return;
        }

        // Validar el token con el backend (en background)
        try {
          const authUser = await getCurrentUser();

          if (mounted) {
            const supabaseUser = convertAuthUserToSupabaseUser(authUser);
            const mockSession = createMockSession(supabaseUser, token);

            setUser(supabaseUser);
            setSession(mockSession);
            localStorage.setItem('telar_user', JSON.stringify(authUser));

            setDebugInfo(prev => ({
              ...prev,
              authStateChangeCount: prev.authStateChangeCount + 1,
              lastAuthEvent: 'TOKEN_VALIDATED'
            }));
          }
        } catch (error: any) {
          // Intentar refrescar el token
          try {
            const refreshResponse = await refreshTokenAction();

            if (refreshResponse.access_token) {
              const authUser = await getCurrentUser();

              if (mounted) {
                const supabaseUser = convertAuthUserToSupabaseUser(authUser);
                const mockSession = createMockSession(supabaseUser, refreshResponse.access_token);

                setUser(supabaseUser);
                setSession(mockSession);
                localStorage.setItem('telar_user', JSON.stringify(authUser));
              }
            }
          } catch (refreshError) {
            if (mounted) {
              localStorage.removeItem('telar_token');
              localStorage.removeItem('telar_user');
              useAuthStore.getState().clearAuth();
              setUser(null);
              setSession(null);

              setDebugInfo(prev => ({
                ...prev,
                authStateChangeCount: prev.authStateChangeCount + 1,
                lastAuthEvent: 'SIGNED_OUT'
              }));
            }
          }
        }

        if (mounted) {
          setLoading(false);
        }

        // Configurar refresh automático del token cada 3.5 horas
        refreshInterval = setInterval(async () => {
          try {
            await refreshTokenAction();
          } catch (error) {
            console.error('Auto token refresh failed:', error);
          }
        }, 3.5 * 60 * 60 * 1000);

      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (mounted) {
          setIsAuthorized(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [syncUserFromLocalStorage]);

  /**
   * Escuchar cambios en localStorage (cuando se hace login desde otra pestaña o después del login)
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'telar_token' || e.key === 'telar_user') {
        syncUserFromLocalStorage(true);
      }
    };

    // Escuchar custom event para login en la misma pestaña
    const handleLoginSuccess = () => {
      syncUserFromLocalStorage(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:login', handleLoginSuccess);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:login', handleLoginSuccess);
    };
  }, [syncUserFromLocalStorage]);

  // Verificar autorización cuando cambia el usuario
  useEffect(() => {
    if (user?.email) {
      const timeoutId = setTimeout(() => {
        checkAuthorization();
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      setIsAuthorized(false);
    }
  }, [user?.email]);

  /**
   * Función de login - MANTIENE LA MISMA INTERFAZ pero ya no se usa aquí
   * El login real se hace en Login.tsx
   */
  const signIn = async (email: string, password: string) => {
    // Esta función se mantiene por compatibilidad pero ya no se usa
    return { error: { message: 'Use login action from Login.tsx instead' } };
  };

  /**
   * Cerrar sesión
   */
  const signOut = async () => {
    setLoading(true);

    // Limpiar user-specific localStorage
    if (user?.id) {
      const prefix = `user_${user.id}_`;
      const keysToRemove: string[] = [];

      const preservedKeys = [
        `${prefix}fused_maturity_calculator_progress`,
        `${prefix}maturityScores`,
      ];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix) && !preservedKeys.includes(key)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    // Limpiar tokens y datos del usuario
    logoutAction();
    useAuthStore.getState().clearAuth();

    setUser(null);
    setSession(null);
    setIsAuthorized(false);
    setLoading(false);

    setDebugInfo(prev => ({
      ...prev,
      authStateChangeCount: prev.authStateChangeCount + 1,
      lastAuthEvent: 'SIGNED_OUT'
    }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthorized,
      signIn,
      signOut,
      checkAuthorization,
      debugInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
