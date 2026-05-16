import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getCurrentUser, refreshToken as refreshTokenAction, logout as logoutAction } from '@/pages/auth/actions/login.actions';
import { AuthUser } from '@/pages/auth/types/login.types';
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

const convertAuthUserToSupabaseUser = (authUser: AuthUser): User => ({
  id: authUser.id,
  email: authUser.email,
  aud: authUser.aud || 'authenticated',
  role: authUser.role as any,
  email_confirmed_at: authUser.emailConfirmedAt || undefined,
  phone: authUser.phone || undefined,
  confirmed_at: authUser.confirmedAt || undefined,
  last_sign_in_at: authUser.lastSignInAt || undefined,
  app_metadata: {
    ...(authUser.rawAppMetaData || {}),
    isSuperAdmin: authUser.isSuperAdmin === true,
  },
  user_metadata: authUser.rawUserMetaData || {},
  identities: [],
  created_at: authUser.createdAt || new Date().toISOString(),
  updated_at: authUser.updatedAt || new Date().toISOString(),
} as User);

const createMockSession = (user: User, token: string): Session => ({
  access_token: token,
  token_type: 'bearer',
  expires_in: 14400,
  expires_at: Math.floor(Date.now() / 1000) + 14400,
  refresh_token: '',
  user,
} as Session);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    authStateChangeCount: 0,
    lastAuthEvent: null as string | null,
    authorizationAttempts: 0,
  });

  const checkAuthorization = async (): Promise<boolean> => {
    if (!user?.email) { setIsAuthorized(false); return false; }
    const meta = (user.app_metadata as any) || {};
    const isAdmin = meta.isSuperAdmin === true || meta.is_admin === true || user.role === 'admin';
    setIsAuthorized(isAdmin);
    return isAdmin;
  };

  /**
   * Lee localStorage SIN llamadas a la API → loading = false inmediatamente.
   * La validación real ocurre en background en initializeAuth.
   */
  const syncUserFromLocalStorage = React.useCallback((mounted: boolean = true) => {
    const token = localStorage.getItem('telar_token');
    const localUserStr = localStorage.getItem('telar_user');

    if (!token) {
      if (mounted) { setUser(null); setSession(null); setLoading(false); }
      return;
    }
    if (localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr);
        const supabaseUser = convertAuthUserToSupabaseUser(localUser);
        if (mounted) {
          setUser(supabaseUser);
          setSession(createMockSession(supabaseUser, token));
          setLoading(false);
          setDebugInfo((p) => ({ ...p, authStateChangeCount: p.authStateChangeCount + 1, lastAuthEvent: 'SIGNED_IN_FROM_LOCALSTORAGE' }));
        }
      } catch {
        if (mounted) setLoading(false);
      }
    } else {
      if (mounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    const initializeAuth = async () => {
      // ① Leer localStorage de inmediato — no bloquea UI
      syncUserFromLocalStorage(mounted);

      const token = localStorage.getItem('telar_token');
      if (!token) return;

      // ② Validar token en background
      try {
        const authUser = await getCurrentUser();
        if (mounted) {
          const su = convertAuthUserToSupabaseUser(authUser);
          setUser(su);
          setSession(createMockSession(su, token));
          localStorage.setItem('telar_user', JSON.stringify(authUser));
          setDebugInfo((p) => ({ ...p, authStateChangeCount: p.authStateChangeCount + 1, lastAuthEvent: 'TOKEN_VALIDATED' }));
        }
      } catch {
        try {
          const r = await refreshTokenAction();
          if (r.access_token) {
            const authUser = await getCurrentUser();
            if (mounted) {
              const su = convertAuthUserToSupabaseUser(authUser);
              setUser(su);
              setSession(createMockSession(su, r.access_token));
              localStorage.setItem('telar_user', JSON.stringify(authUser));
            }
          }
        } catch {
          if (mounted) {
            localStorage.removeItem('telar_token');
            localStorage.removeItem('telar_user');
            useAuthStore.getState().clearAuth();
            setUser(null);
            setSession(null);
            setDebugInfo((p) => ({ ...p, authStateChangeCount: p.authStateChangeCount + 1, lastAuthEvent: 'SIGNED_OUT' }));
          }
        }
      }

      // Auto-refresh cada 3.5 horas
      refreshInterval = setInterval(async () => {
        try { await refreshTokenAction(); } catch { /* silencioso */ }
      }, 3.5 * 60 * 60 * 1000);
    };

    initializeAuth();
    return () => { mounted = false; if (refreshInterval) clearInterval(refreshInterval); };
  }, [syncUserFromLocalStorage]);

  // Sincronización multi-pestaña
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'telar_token' || e.key === 'telar_user') syncUserFromLocalStorage(true);
    };
    const onLogin = () => syncUserFromLocalStorage(true);
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:login', onLogin);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('auth:login', onLogin); };
  }, [syncUserFromLocalStorage]);

  useEffect(() => {
    if (user?.email) { const t = setTimeout(() => checkAuthorization(), 100); return () => clearTimeout(t); }
    else setIsAuthorized(false);
  }, [user?.email]);

  const signIn = async (_e: string, _p: string) => ({ error: { message: 'Use login action from Login.tsx instead' } });

  const signOut = async () => {
    if (user?.id) {
      const prefix = `user_${user.id}_`;
      const preserved = [`${prefix}fused_maturity_calculator_progress`, `${prefix}maturityScores`];
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix) && !preserved.includes(key)) toRemove.push(key);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    }
    logoutAction();
    useAuthStore.getState().clearAuth();
    setUser(null); setSession(null); setIsAuthorized(false);
    setDebugInfo((p) => ({ ...p, authStateChangeCount: p.authStateChangeCount + 1, lastAuthEvent: 'SIGNED_OUT' }));
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAuthorized, signIn, signOut, checkAuthorization, debugInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
