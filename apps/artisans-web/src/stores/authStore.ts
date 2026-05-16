/**
 * Auth Store - Zustand
 * Estado global de autenticación del usuario
 * Almacena: user, token, userMasterContext, artisanShop
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getOnboardingAnswers } from '@/services/onboarding.actions';
import { OnboardingApiResponse } from '@/types/telarData.types';
import { useTelarDataStore } from './telarDataStore';
import { parseJwtPayload } from '@/utils/jwt.utils';

// Tipos
interface RawUserMetaData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  phone?: string;
  emailConfirmedAt?: string;
  lastSignInAt?: string;
  confirmedAt?: string;
  rawUserMetaData?: RawUserMetaData;
  isSuperAdmin?: boolean | null;
  /** Array de roles del usuario, extraído del JWT (e.g. ['admin', 'moderator']) */
  roles?: string[];
  createdAt?: string | null;
  updatedAt?: string;
}

interface MaturityScores {
  ideaValidation?: number;
  userExperience?: number;
  marketFit?: number;
  monetization?: number;
}

interface TaskGenerationContext {
  maturityScores?: MaturityScores;
  preferred_task_complexity?: string;
  focus_areas?: string[];
  learning_style?: string;
  available_time_per_week?: number;
  language?: string;
  lastAssessmentSource?: string;
  lastGeneration?: string;
}

interface UserMasterContext {
  id?: string;
  user_id: string;
  business_profile?: Record<string, any>;
  task_generation_context?: TaskGenerationContext;
  conversation_insights?: Record<string, any>;
  preferences?: Record<string, any>;
  language_preference?: string;
  context_version?: number;
  last_updated?: string;
  created_at?: string;
}

interface ArtisanShop {
  id: string;
  user_id: string;
  creationStatus?: 'complete' | 'in_progress' | null;
  creation_step?: number;
  logo_url?: string;
  hero_config?: Record<string, any>;
  story?: string;
  about_content?: Record<string, any>;
  social_links?: Record<string, any>;
  contact_info?: Record<string, any>;
}

interface UserMaturityAction {
  id: string;
  user_id: string;
  action_type: string;
  action_data?: Record<string, any>;
  created_at?: string;
}

// Estado del store
interface AuthState {
  // Datos del usuario
  user: User | null;
  userMasterContext: UserMasterContext | null;
  artisanShop: ArtisanShop | null;
  userMaturityActions: UserMaturityAction[];

  // Token
  access_token: string | null;

  // Estados derivados
  isAuthenticated: boolean;
  /** true después de que onRehydrateStorage completa — usado por el shim de useAuth() para el flag `loading` */
  isInitialized: boolean;
  hasCompletedMaturityTest: boolean;
  hasShop: boolean;
  isShopComplete: boolean;

  // Acciones
  setAuthData: (data: {
    user: User;
    userMasterContext: UserMasterContext | null;
    artisanShop: ArtisanShop | null;
    userMaturityActions: UserMaturityAction[];
    access_token: string;
  }) => void;

  updateUserMasterContext: (context: UserMasterContext) => void;
  updateArtisanShop: (shop: ArtisanShop) => void;

  clearAuth: () => void;

  // Helpers
  getRedirectPath: () => string;
}

// Store de Zustand con persistencia en localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      userMasterContext: null,
      artisanShop: null,
      userMaturityActions: [],
      access_token: null,
      isAuthenticated: false,
      isInitialized: false,

      get hasCompletedMaturityTest() {
        const context = get().userMasterContext;
        const taskGenContext = context?.task_generation_context;
        const maturityScores = taskGenContext?.maturityScores;

        if (!maturityScores) return false;

        return Object.values(maturityScores).some((v) => (v || 0) > 0);
      },

      get hasShop() {
        return !!get().artisanShop;
      },

      get isShopComplete() {
        const shop = get().artisanShop;
        return shop?.creationStatus === 'complete';
      },

      // Acciones
      setAuthData: (data) => {
        set({
          user: data.user,
          userMasterContext: data.userMasterContext,
          artisanShop: data.artisanShop,
          userMaturityActions: data.userMaturityActions,
          access_token: data.access_token,
          isAuthenticated: !!data.user && !!data.access_token, // ✅ Actualizar estado derivado
        });

        // También guardar en localStorage para compatibilidad
        localStorage.setItem('telar_token', data.access_token);
        localStorage.setItem('telar_user', JSON.stringify(data.user));

        // Hydrate connected data store in background (non-blocking)
        const telarStore = useTelarDataStore.getState();
        if (!telarStore.hydrated) {
          getOnboardingAnswers(data.user.id)
            .then((resp) => useTelarDataStore.getState().hydrateFromDB(resp))
            .catch(() => useTelarDataStore.setState({ hydrated: true }));
        }
      },

      updateUserMasterContext: (context) => {
        set({ userMasterContext: context });
      },

      updateArtisanShop: (shop) => {
        set({ artisanShop: shop });
      },

      clearAuth: () => {
        set({
          user: null,
          userMasterContext: null,
          artisanShop: null,
          userMaturityActions: [],
          access_token: null,
          isAuthenticated: false, // ✅ Actualizar estado derivado
        });

        // Limpiar localStorage
        localStorage.removeItem('telar_token');
        localStorage.removeItem('telar_user');

        // Reset connected data store
        useTelarDataStore.getState().hydrateFromDB({} as OnboardingApiResponse);
        useTelarDataStore.setState({ hydrated: false });
      },

      // Helper para calcular ruta de redirección
      getRedirectPath: () => {
        const state = get();

        // Calcular si tiene test de madurez completado
        const context = state.userMasterContext;
        const taskGenContext = context?.task_generation_context;
        const maturityScores = taskGenContext?.maturityScores;

        const hasMaturityData = maturityScores &&
          Object.values(maturityScores).some((v) => (v || 0) > 0);

        const shop = state.artisanShop;



        // Si tiene datos de madurez o tienda, ir al dashboard
        if (hasMaturityData || shop) {
          // Si tiene tienda pero está incompleta, continuar creación
          if (shop && shop.creationStatus !== 'complete') {
            return '/dashboard/create-shop';
          }
          return '/dashboard';
        }

        // Usuario nuevo sin progreso → test de madurez
        return '/maturity-calculator?mode=onboarding';
      },
    }),
    {
      name: 'auth-storage', // Nombre en localStorage
      partialize: (state) => ({
        // Solo persistir estos campos
        user: state.user,
        userMasterContext: state.userMasterContext,
        artisanShop: state.artisanShop,
        userMaturityActions: state.userMaturityActions,
        access_token: state.access_token,
      }),
      // ✅ Recalcular isAuthenticated y enriquecer roles desde el JWT al rehidratar
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.user && !!state.access_token;

          // Si el user no tiene roles[], intentar extraerlos del JWT guardado
          if (state.user && state.access_token && !state.user.roles?.length) {
            const jwtPayload = parseJwtPayload(state.access_token);
            if (jwtPayload) {
              state.user = {
                ...state.user,
                isSuperAdmin: jwtPayload.isSuperAdmin ?? state.user.isSuperAdmin ?? false,
                roles: jwtPayload.roles ?? [],
              };
            }
          }

          // Marcar como inicializado — permite que useAuth().loading sea false
          state.isInitialized = true;
        }
      },
    }
  )
);

// Exportar tipos para usar en otros archivos
export type {
  User,
  UserMasterContext,
  ArtisanShop,
  UserMaturityAction,
  MaturityScores,
  TaskGenerationContext
};

