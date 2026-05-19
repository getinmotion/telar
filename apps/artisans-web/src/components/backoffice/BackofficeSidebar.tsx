import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Wand2, Shield, BarChart2, Package,
  Database, BookOpen, Grid2X2, Store, Tags, Sparkles,
  LayoutDashboard, TrendingUp, ShoppingCart, Users, Ticket, CreditCard,
  Palette, FileSearch, Layers, ChevronLeft, ChevronRight, ArrowLeft,
  HeartPulse, Handshake,
  type LucideIcon,
} from 'lucide-react';
import { useBackofficeAccess, BackofficeSection } from '@/hooks/useBackofficeAccess';

interface NavItem {
  label: string;
  to: string;
  section: BackofficeSection;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  titleColor?: string;
  activeBg?: string;
  activeColor?: string;
}

// ─── Grupos principales ───────────────────────────────────────────────────────
const MAIN_GROUPS: NavGroup[] = [
  {
    title: 'MODERACIÓN',
    titleColor: '#15803d',
    activeBg: 'rgba(21,128,61,0.08)',
    activeColor: '#166534',
    items: [
      { label: 'Lista de aprobación', to: '/backoffice/moderacion-os', section: 'moderation', icon: Shield   },
      { label: 'Product Studio', to: '/backoffice/studio',        section: 'revisor',    icon: Wand2    },
      { label: 'Tiendas',        to: '/backoffice/tiendas',       section: 'tiendas',    icon: Store    },
      { label: 'Taxonomía',      to: '/backoffice/taxonomia',     section: 'taxonomia',  icon: Tags     },
    ],
  },
  {
    title: 'CONTENIDO',
    titleColor: '#c45a0a',
    activeBg: 'rgba(236,109,19,0.08)',
    activeColor: '#9c3f00',
    items: [
      { label: 'Historias',   to: '/backoffice/historias',   section: 'historias',   icon: BookOpen },
      { label: 'Colecciones', to: '/backoffice/colecciones', section: 'colecciones', icon: Grid2X2  },
      { label: 'CMS',         to: '/backoffice/cms',         section: 'cms',         icon: Database },
    ],
  },
  {
    title: 'NEGOCIO',
    titleColor: '#7c3aed',
    activeBg: 'rgba(124,58,237,0.08)',
    activeColor: '#5b21b6',
    items: [
      { label: 'Dashboard',  to: '/backoffice/dashboard',          section: 'dashboard',          icon: LayoutDashboard },
      { label: 'Salud mkt.', to: '/backoffice/marketplace-health', section: 'marketplace-health', icon: HeartPulse      },
      { label: 'Comercial',  to: '/backoffice/comercial',          section: 'comercial',          icon: TrendingUp      },
    ],
  },
];

// ─── Resto de secciones (abajo) ───────────────────────────────────────────────
const EXTRA_ITEMS: NavItem[] = [
  { label: 'Órdenes',          to: '/backoffice/ordenes',            section: 'ordenes',            icon: ShoppingCart    },
  { label: 'Usuarios y Roles', to: '/backoffice/usuarios',           section: 'usuarios',           icon: Users           },
  { label: 'Cupones',          to: '/backoffice/cupones',            section: 'cupones',            icon: Ticket          },
  { label: 'Pagos (Cobre)',    to: '/backoffice/pagos',              section: 'pagos',              icon: CreditCard      },
  { label: 'Convenios',        to: '/backoffice/convenios',          section: 'convenios',          icon: Handshake       },
  { label: 'Curaduría',        to: '/backoffice/curation',           section: 'curation',           icon: Sparkles        },
  { label: 'Analytics',        to: '/backoffice/analytics',          section: 'analytics',          icon: BarChart2       },
  { label: 'Envíos',           to: '/backoffice/envios',             section: 'envios',             icon: Package         },
  { label: 'Sistema diseño',   to: '/backoffice/diseno',             section: 'diseno',             icon: Palette         },
  { label: 'Auditoría',        to: '/backoffice/auditoria',          section: 'auditoria',          icon: FileSearch      },
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

  const visibleExtra = EXTRA_ITEMS.filter(i => canAccess(i.section));

  const navLinkClass = (isActive: boolean, activeBg?: string) =>
    `flex items-center gap-2 px-3 py-2 mx-1 rounded-md text-sm transition-colors
    ${isActive
      ? `font-medium${!activeBg ? ' bg-primary/10 text-primary' : ''}`
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;

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
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <Layers size={18} className="text-primary shrink-0" />
            Telar Backoffice
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => navigate('/backoffice/home')}
            className="mx-auto text-primary hover:text-primary/80 transition-colors"
            title="Telar Backoffice"
          >
            <Layers size={18} />
          </button>
        )}
        {onCollapse && (
          <button
            onClick={() => onCollapse(!collapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded shrink-0"
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 flex flex-col">

        {/* ── Home — fuera de grupos ──────────────────────────────────────── */}
        <div className="mb-3">
          <NavLink
            to="/backoffice/home"
            title={collapsed ? 'Inicio' : undefined}
            className={({ isActive }) => navLinkClass(isActive)}
            style={({ isActive }) => isActive ? { backgroundColor: 'rgba(124,58,237,0.08)', color: '#5b21b6' } : {}}
          >
            <Home size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">Inicio</span>}
          </NavLink>
        </div>

        {/* ── Grupos principales (moderación + contenido) ─────────────────── */}
        {MAIN_GROUPS.map(group => {
          const visible = group.items.filter(i => canAccess(i.section));
          if (visible.length === 0) return null;
          return (
            <div key={group.title} className="mb-4">
              {!collapsed && (
                <p
                  className="px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
                  style={{ color: group.titleColor }}
                >
                  {group.title}
                </p>
              )}
              {visible.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  style={({ isActive }) =>
                    isActive && group.activeBg
                      ? { backgroundColor: group.activeBg, color: group.activeColor }
                      : {}
                  }
                  className={({ isActive }) => navLinkClass(isActive, group.activeBg)}
                >
                  <item.icon size={16} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}

        {/* ── Spacer ────────────────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Resto de secciones (abajo) ────────────────────────────────────── */}
        {visibleExtra.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            {!collapsed && (
              <p className="px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                MÁS
              </p>
            )}
            {visibleExtra.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => navLinkClass(isActive)}
                style={({ isActive }) => isActive ? { backgroundColor: 'rgba(124,58,237,0.08)', color: '#5b21b6' } : {}}
              >
                <item.icon size={16} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Link al portal del artesano */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} className="shrink-0" />
            <span>Portal artesano</span>
          </a>
        </div>
      )}
    </aside>
  );
};
