/**
 * BackofficeSidebar
 *
 * Navegación lateral del backoffice unificado.
 * Filtra las secciones según los roles del usuario autenticado —
 * solo muestra lo que el usuario puede ver.
 *
 * Grupos:
 *   MODERACIÓN   → moderator / admin / super_admin
 *   CONTENIDO    → admin / super_admin
 *   OPERACIONES  → super_admin
 *   SISTEMA      → super_admin
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useBackofficeAccess, BackofficeSection } from '@/hooks/useBackofficeAccess';

interface NavItem {
  label: string;
  to: string;
  section: BackofficeSection;
  icon: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'MODERACIÓN',
    items: [
      { label: 'Inicio', to: '/backoffice/home', section: 'home', icon: '🏠' },
      { label: 'Cola de moderación', to: '/backoffice/moderacion', section: 'moderation', icon: '🛡️' },
      { label: 'Revisor de productos', to: '/backoffice/revisor', section: 'revisor', icon: '🔍' },
      { label: 'Analytics', to: '/backoffice/analytics', section: 'analytics', icon: '📊' },
      { label: 'Envíos', to: '/backoffice/envios', section: 'envios', icon: '📦' },
    ],
  },
  {
    title: 'CONTENIDO',
    items: [
      { label: 'CMS', to: '/backoffice/cms', section: 'cms', icon: '🗂️' },
      { label: 'Historias', to: '/backoffice/historias', section: 'historias', icon: '📝' },
      { label: 'Colecciones', to: '/backoffice/colecciones', section: 'colecciones', icon: '🎨' },
      { label: 'Tiendas', to: '/backoffice/tiendas', section: 'tiendas', icon: '🏪' },
      { label: 'Taxonomía', to: '/backoffice/taxonomia', section: 'taxonomia', icon: '🏷️' },
      { label: 'Curaduría', to: '/backoffice/curation', section: 'curation', icon: '✨' },
    ],
  },
  {
    title: 'OPERACIONES',
    items: [
      { label: 'Dashboard', to: '/backoffice/dashboard', section: 'dashboard', icon: '📈' },
      { label: 'Comercial', to: '/backoffice/comercial', section: 'comercial', icon: '💰' },
      { label: 'Órdenes', to: '/backoffice/ordenes', section: 'ordenes', icon: '🛒' },
      { label: 'Usuarios y Roles', to: '/backoffice/usuarios', section: 'usuarios', icon: '👥' },
      { label: 'Cupones', to: '/backoffice/cupones', section: 'cupones', icon: '🎟️' },
      { label: 'Pagos (Cobre)', to: '/backoffice/pagos', section: 'pagos', icon: '💳' },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { label: 'Sistema de diseño', to: '/backoffice/diseno', section: 'diseno', icon: '🎨' },
      { label: 'Auditoría', to: '/backoffice/auditoria', section: 'auditoria', icon: '📋' },
    ],
  },
];

interface BackofficeSidebarProps {
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
}

export const BackofficeSidebar: React.FC<BackofficeSidebarProps> = ({
  collapsed = false,
  onCollapse,
}) => {
  const { canAccess } = useBackofficeAccess();
  const navigate = useNavigate();

  return (
    <aside
      className={`
        bg-card border-r border-border flex flex-col shrink-0 transition-all duration-200
        ${collapsed ? 'w-14' : 'w-56'}
      `}
    >
      {/* Logo / toggle */}
      <div className="h-14 border-b border-border flex items-center justify-between px-3 shrink-0">
        {!collapsed && (
          <button
            onClick={() => navigate('/backoffice/home')}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            🧵 Telar Backoffice
          </button>
        )}
        {onCollapse && (
          <button
            onClick={() => onCollapse(!collapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            canAccess(item.section),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-4">
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  {group.title}
                </p>
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 mx-1 rounded-md text-sm transition-colors
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Link al portal del artesano */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>↩</span>
            <span>Portal artesano</span>
          </a>
        </div>
      )}
    </aside>
  );
};
