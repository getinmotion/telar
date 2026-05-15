/**
 * useBackofficeAccess
 *
 * Hook central de permisos del backoffice unificado.
 * Lee directamente del authStore (Zustand) — los roles vienen en el JWT
 * desde la Fase 0.2, por lo que NO necesita llamadas adicionales a la API.
 *
 * Reemplaza: useIsModerator, checkAuthorization() de AuthContext,
 * y la lógica dispersa en AdminProtectedRoute y ModeratorProtectedRoute.
 */

import { useAuthStore } from '@/stores/authStore';

export type BackofficeSection =
  | 'home'
  | 'moderation'
  | 'revisor'
  | 'analytics'
  | 'envios'
  | 'cms'
  | 'historias'
  | 'colecciones'
  | 'imagenes'
  | 'tiendas'
  | 'taxonomia'
  | 'usuarios'
  | 'ordenes'
  | 'cupones'
  | 'pagos'
  | 'diseno'
  | 'auditoria'
  | 'dashboard'
  | 'marketplace-health'
  | 'convenios';

/**
 * Mapa de secciones a roles mínimos requeridos.
 * 'super_admin' significa que solo isSuperAdmin=true puede acceder.
 */
const SECTION_ROLES: Record<BackofficeSection, string[]> = {
  // Todos los roles de backoffice
  home:        ['moderator', 'admin', 'super_admin'],
  moderation:  ['moderator', 'admin', 'super_admin'],
  revisor:     ['moderator', 'admin', 'super_admin'],
  analytics:   ['moderator', 'admin', 'super_admin'],
  envios:      ['moderator', 'admin', 'super_admin'],
  cms:         ['moderator', 'admin', 'super_admin'],
  // Admin y super_admin
  historias:   ['admin', 'super_admin'],
  colecciones: ['admin', 'super_admin'],
  imagenes:    ['admin', 'super_admin'],
  tiendas:     ['admin', 'super_admin'],
  taxonomia:   ['admin', 'super_admin'],
  // Solo super_admin
  usuarios:    ['super_admin'],
  ordenes:     ['super_admin'],
  cupones:     ['super_admin'],
  pagos:       ['super_admin'],
  diseno:      ['super_admin'],
  auditoria:   ['super_admin'],
  dashboard:          ['admin', 'super_admin'],
  'marketplace-health': ['admin', 'super_admin'],
  convenios:            ['admin', 'super_admin'],
};

export function useBackofficeAccess() {
  const { user, isAuthenticated } = useAuthStore();

  // Los roles vienen del JWT (incluidos desde Fase 0.2)
  // El store los persiste después del login
  const jwtRoles: string[] = (user as any)?.roles ?? [];
  const isSuperAdmin = user?.isSuperAdmin === true;
  const isAdmin = isSuperAdmin || jwtRoles.includes('admin');
  const isModerator =
    isSuperAdmin || jwtRoles.includes('admin') || jwtRoles.includes('moderator');

  /**
   * Verifica si el usuario actual puede acceder a una sección del backoffice.
   */
  function canAccess(section: BackofficeSection): boolean {
    if (!isAuthenticated || !user) return false;
    if (isSuperAdmin) return true;

    const required = SECTION_ROLES[section] ?? [];
    return required.some((role) => {
      if (role === 'super_admin') return isSuperAdmin;
      if (role === 'admin') return isAdmin;
      if (role === 'moderator') return isModerator;
      return jwtRoles.includes(role);
    });
  }

  /**
   * Verifica si el usuario tiene acceso a cualquier sección del backoffice.
   * Usado por BackofficeProtectedRoute.
   */
  const hasAnyBackofficeRole = isModerator;

  return {
    isSuperAdmin,
    isAdmin,
    isModerator,
    hasAnyBackofficeRole,
    canAccess,
    roles: jwtRoles,
    user,
  };
}
