/**
 * BackofficeHeader
 * Header del panel backoffice: breadcrumb, usuario activo, botón de logout.
 */
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBackofficeAccess } from '@/hooks/useBackofficeAccess';

// Mapa de rutas a labels legibles para el breadcrumb
const ROUTE_LABELS: Record<string, string> = {
  backoffice: 'Backoffice',
  moderacion: 'Moderación',
  revisor: 'Revisor',
  analytics: 'Analytics',
  envios: 'Envíos',
  cms: 'CMS',
  historias: 'Historias',
  colecciones: 'Colecciones',
  tiendas: 'Tiendas',
  taxonomia: 'Taxonomía',
  usuarios: 'Usuarios y Roles',
  ordenes: 'Órdenes',
  cupones: 'Cupones',
  pagos: 'Pagos',
  diseno: 'Sistema de Diseño',
  auditoria: 'Auditoría',
  dashboard: 'Dashboard',
};

export const BackofficeHeader: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const { isSuperAdmin, isAdmin, isModerator } = useBackofficeAccess();
  const location = useLocation();

  // Construir breadcrumb desde el path actual
  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => ({
    label: ROUTE_LABELS[seg] ?? seg,
    path: '/' + segments.slice(0, idx + 1).join('/'),
    isLast: idx === segments.length - 1,
  }));

  const roleBadge = isSuperAdmin
    ? { label: 'Super Admin', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' }
    : isAdmin
    ? { label: 'Admin', color: '#c2410c', bg: 'rgba(236,109,19,0.08)', border: 'rgba(236,109,19,0.2)' }
    : isModerator
    ? { label: 'Moderador', color: '#15803d', bg: 'rgba(21,128,61,0.08)', border: 'rgba(21,128,61,0.2)' }
    : null;

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/backoffice/login';
  };

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.path}>
            {idx > 0 && <span className="text-muted-foreground/50">/</span>}
            {crumb.isLast ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Usuario y logout */}
      <div className="flex items-center gap-3">
        {roleBadge && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 8px', borderRadius: 9999,
            background: roleBadge.bg, border: `1px solid ${roleBadge.border}`,
            color: roleBadge.color,
            fontSize: 10, fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            {roleBadge.label}
          </span>
        )}
        <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1"
          title="Cerrar sesión"
        >
          Salir
        </button>
      </div>
    </header>
  );
};
