import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { AuthUser } from '@/pages/auth/types/login.types';

/** Convierte AuthUser del backend NestJS al shape de User de Supabase para compatibilidad */
export function convertAuthUserToSupabaseUser(authUser: AuthUser): SupabaseUser {
  return {
    id: authUser.id,
    email: authUser.email,
    aud: authUser.aud || 'authenticated',
    role: authUser.role as string,
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
  } as SupabaseUser;
}

/** Crea una sesión mock compatible con Supabase */
export function createMockSession(user: SupabaseUser, token: string): Session {
  return {
    access_token: token,
    token_type: 'bearer',
    expires_in: 14400,
    expires_at: Math.floor(Date.now() / 1000) + 14400,
    refresh_token: '',
    user,
  } as Session;
}
