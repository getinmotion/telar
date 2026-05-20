/**
 * AuthContext — shim de compatibilidad
 *
 * Ya no mantiene estado propio. Delega completamente a authStore (Zustand),
 * que es la única fuente de verdad desde la Fase 3 del refactor de estado.
 *
 * Los 155+ componentes que importan useAuth() continúan funcionando sin cambios.
 * Para código nuevo, importar useAuthStore directamente desde @/stores/authStore.
 */
import React, { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/authStore';
import { convertAuthUserToSupabaseUser } from '@/utils/authUser.utils';
import { logout as logoutAction } from '@/pages/auth/actions/login.actions';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthorized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  checkAuthorization: () => Promise<boolean>;
  debugInfo: {
    authStateChangeCount: number;
    lastAuthEvent: string | null;
    authorizationAttempts: number;
  };
}

const DEBUG_INFO = { authStateChangeCount: 0, lastAuthEvent: null, authorizationAttempts: 0 };

export const useAuth = (): AuthContextType => {
  const { user, clearAuth, isInitialized } = useAuthStore();

  const supabaseUser = user
    ? convertAuthUserToSupabaseUser(user as Parameters<typeof convertAuthUserToSupabaseUser>[0])
    : null;

  return {
    user: supabaseUser,
    session: null,
    loading: !isInitialized,
    isAuthorized: user?.isSuperAdmin === true,
    signIn: async () => ({ error: { message: 'Use login action directly from Login.tsx' } }),
    signOut: async () => {
      // Limpiar datos de usuario en localStorage antes de limpiar el store
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
      clearAuth();
    },
    checkAuthorization: async () => user?.isSuperAdmin === true,
    debugInfo: DEBUG_INFO,
  };
};

/** Pass-through — ya no envuelve providers de estado */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <>{children}</>
);
