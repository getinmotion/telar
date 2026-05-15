/**
 * useBackofficeAccess
 *
 * Hook central de permisos del backoffice unificado.
 * Lee directamente del authStore (Zustand) — los roles vienen en el JWT
 * desde la Fase 0.2, por lo que NO necesita llamadas adicionales a la API.
 *
 * Roles granulares (Fase 3E):
 *   moderator_product     → cola de productos + reviewer workspace
 *   moderator_taxonomy    → cola taxonómica + merge/alias
 *   curator_marketplace   → curaduría marketplace + colecciones
 *   supervisor            → todo lo anterior + override de decisiones
 *   admin_global          → acceso total incluyendo gestión de moderadores
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
  | 'convenios'
  | 'comercial'
  | 'curation';

/**
 * Mapa de secciones a roles mínimos requeridos.
 * Los roles granulares de Fase 3E se añaden en paralelo a los legacy.
 */
const SECTION_ROLES: Record<BackofficeSection, string[]> = {
  home:        ['moderator', 'admin', 'super_admin', 'moderator_product', 'moderator_taxonomy', 'curator_marketplace', 'supervisor', 'admin_global'],
  moderation:  ['moderator', 'admin', 'super_admin', 'moderator_product', 'supervisor', 'admin_global'],
  revisor:     ['moderator', 'admin', 'super_admin', 'moderator_product', 'supervisor', 'admin_global'],
  analytics:   ['moderator', 'admin', 'super_admin', 'supervisor', 'admin_global'],
  envios:      ['moderator', 'admin', 'super_admin', 'supervisor', 'admin_global'],
  cms:         ['moderator', 'admin', 'super_admin', 'supervisor', 'admin_global'],
  historias:   ['admin', 'super_admin', 'supervisor', 'admin_global'],
  colecciones: ['admin', 'super_admin', 'supervisor', 'admin_global'],
  tiendas:     ['admin', 'super_admin', 'supervisor', 'admin_global'],
  taxonomia:   ['admin', 'super_admin', 'moderator_taxonomy', 'supervisor', 'admin_global'],
  curation:    ['admin', 'super_admin', 'curator_marketplace', 'supervisor', 'admin_global'],
  // Solo super_admin / admin_global
  usuarios:    ['super_admin', 'admin_global'],
  ordenes:     ['super_admin', 'admin_global'],
  cupones:     ['super_admin', 'admin_global'],
  pagos:       ['super_admin', 'admin_global'],
  diseno:      ['super_admin', 'admin_global'],
  auditoria:   ['super_admin', 'admin_global'],
  dashboard:          ['admin', 'super_admin', 'supervisor', 'admin_global'],
  'marketplace-health': ['admin', 'super_admin', 'supervisor', 'admin_global'],
  convenios:            ['admin', 'super_admin', 'supervisor', 'admin_global'],
  comercial:            ['admin', 'super_admin', 'supervisor', 'admin_global'],
};

// Roles granulares de Fase 3E
const GRANULAR_ROLES = [
  'moderator_product',
  'moderator_taxonomy',
  'curator_marketplace',
  'supervisor',
  'admin_global',
] as const;

export type GranularRole = typeof GRANULAR_ROLES[number];

export function useBackofficeAccess() {
  const { user, isAuthenticated } = useAuthStore();

  const jwtRoles: string[] = (user as any)?.roles ?? [];
  const isSuperAdmin = user?.isSuperAdmin === true;
  const isAdmin = isSuperAdmin || jwtRoles.includes('admin') || jwtRoles.includes('admin_global');
  const isModerator =
    isSuperAdmin ||
    jwtRoles.includes('admin') ||
    jwtRoles.includes('admin_global') ||
    jwtRoles.includes('moderator') ||
    jwtRoles.includes('supervisor') ||
    GRANULAR_ROLES.some((r) => jwtRoles.includes(r));

  function hasRole(role: string): boolean {
    if (isSuperAdmin) return true;
    if (role === 'super_admin') return isSuperAdmin;
    if (role === 'admin_global') return jwtRoles.includes('admin_global') || isSuperAdmin;
    if (role === 'admin') return isAdmin;
    if (role === 'moderator') return isModerator;
    if (role === 'supervisor') return jwtRoles.includes('supervisor') || isAdmin;
    return jwtRoles.includes(role);
  }

  /**
   * Verifica si el usuario actual puede acceder a una sección del backoffice.
   */
  function canAccess(section: BackofficeSection): boolean {
    if (!isAuthenticated || !user) return false;
    if (isSuperAdmin) return true;
    const required = SECTION_ROLES[section] ?? [];
    return required.some(hasRole);
  }

  /**
   * Verifica si el usuario tiene acceso a cualquier sección del backoffice.
   */
  const hasAnyBackofficeRole = isModerator;

  return {
    isSuperAdmin,
    isAdmin,
    isModerator,
    hasAnyBackofficeRole,
    canAccess,
    hasRole,
    roles: jwtRoles,
    user,
  };
}
