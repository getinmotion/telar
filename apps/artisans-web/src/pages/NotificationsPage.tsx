import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useFixedTasksManager } from '@/hooks/useFixedTasksManager';
import { FixedTask } from '@/types/fixedTask';
import { AICopilotCard } from '@/components/dashboard/AICopilotCard';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ── TELAR Design System ────────────────────────────────────────────────────────
const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const glassPrimary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 20px rgba(21,27,45,0.02)',
};

// ── Category definitions ───────────────────────────────────────────────────────
interface CategoryDef {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  types: string[];
}

const CATEGORIES: Record<string, CategoryDef> = {
  moderation: {
    label: 'Curación TELAR',
    icon: 'verified',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.06)',
    border: 'rgba(59,130,246,0.15)',
    types: [
      'moderation_approve', 'moderation_reject',
      'moderation_approve_with_edits', 'moderation_request_changes',
      'marketplace_approved', 'marketplace_removed',
    ],
  },
  shop: {
    label: 'Mi Tienda',
    icon: 'storefront',
    color: '#ec6d13',
    bg: 'rgba(236,109,19,0.06)',
    border: 'rgba(236,109,19,0.15)',
    types: [
      'shop_created', 'shop_published', 'shop_first_sale',
      'artisan_profile_completed', 'new_order',
    ],
  },
  product: {
    label: 'Productos',
    icon: 'inventory_2',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.06)',
    border: 'rgba(139,92,246,0.15)',
    types: [
      'product_created', 'product_approved',
      'product_low_stock', 'product_out_of_stock',
    ],
  },
  milestone: {
    label: 'Progreso & Logros',
    icon: 'emoji_events',
    color: '#166534',
    bg: 'rgba(22,101,52,0.06)',
    border: 'rgba(22,101,52,0.15)',
    types: [
      'milestone_completed', 'task_completed',
      'achievement_unlocked', 'level_up',
    ],
  },
  account: {
    label: 'Mi Cuenta',
    icon: 'manage_accounts',
    color: '#54433e',
    bg: 'rgba(84,67,62,0.05)',
    border: 'rgba(84,67,62,0.12)',
    types: ['welcome', 'profile_completed', 'bank_data_configured'],
  },
  system: {
    label: 'Plataforma',
    icon: 'campaign',
    color: '#151b2d',
    bg: 'rgba(21,27,45,0.04)',
    border: 'rgba(21,27,45,0.1)',
    types: ['system_announcement', 'feature_update'],
  },
};

// Material icon per notification type
const TYPE_ICONS: Record<string, string> = {
  moderation_approve:           'check_circle',
  moderation_reject:            'cancel',
  moderation_approve_with_edits:'edit',
  moderation_request_changes:   'sync_problem',
  marketplace_approved:         'store',
  marketplace_removed:          'store_off',
  shop_created:                 'storefront',
  shop_published:               'rocket_launch',
  shop_first_sale:              'payments',
  artisan_profile_completed:    'person_pin',
  new_order:                    'receipt_long',
  product_created:              'inventory_2',
  product_approved:             'verified',
  product_low_stock:            'warning',
  product_out_of_stock:         'production_quantity_limits',
  milestone_completed:          'emoji_events',
  task_completed:               'task_alt',
  achievement_unlocked:         'military_tech',
  level_up:                     'trending_up',
  welcome:                      'waving_hand',
  profile_completed:            'person',
  bank_data_configured:         'account_balance',
  system_announcement:          'campaign',
  feature_update:               'new_releases',
  default:                      'notifications',
};

// Milestone colors for tasks
const MILESTONE_COLORS: Record<string, string> = {
  brand: '#ec6d13',
  shop:  '#3b82f6',
  sales: '#166534',
};

// ── Helper: assign category ───────────────────────────────────────────────────
function getCategory(type: string): string {
  for (const [key, def] of Object.entries(CATEGORIES)) {
    if (def.types.includes(type)) return key;
  }
  return 'system';
}

// ── Notification item ─────────────────────────────────────────────────────────
interface NotifItemProps {
  notification: Notification;
  accentColor: string;
  onRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}

const NotifItem: React.FC<NotifItemProps> = ({
  notification, accentColor, onRead, onDelete, onClick,
}) => {
  const icon = TYPE_ICONS[notification.type] ?? TYPE_ICONS.default;
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true, locale: es,
  });

  return (
    <div
      onClick={notification.metadata?.actionUrl ? onClick : undefined}
      className="group relative flex items-start gap-3 px-5 py-4 transition-colors hover:bg-white/40"
      style={{
        cursor: notification.metadata?.actionUrl ? 'pointer' : 'default',
        background: notification.read ? 'transparent' : `${accentColor}06`,
      }}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full"
          style={{ background: accentColor }}
        />
      )}

      {/* Icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
        style={{ background: `${accentColor}12` }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 16, color: accentColor }}
        >
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: notification.read ? 600 : 700,
            color: '#151b2d',
            lineHeight: 1.3,
          }}
        >
          {notification.title}
        </p>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 400,
            color: 'rgba(84,67,62,0.7)',
            lineHeight: 1.55,
            marginTop: 3,
          }}
        >
          {notification.message}
        </p>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(84,67,62,0.38)',
            marginTop: 5,
            display: 'block',
          }}
        >
          {timeAgo}
        </span>
      </div>

      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 mt-0.5">
        {!notification.read && (
          <button
            onClick={(e) => { e.stopPropagation(); onRead(); }}
            title="Marcar como leída"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: accentColor }}>done</span>
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Eliminar"
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'rgba(239,68,68,0.7)' }}>delete</span>
        </button>
      </div>
    </div>
  );
};

// ── Section card ──────────────────────────────────────────────────────────────
interface SectionProps {
  categoryKey: string;
  notifications: Notification[];
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (url: string, id: string) => void;
}

const NotifSection: React.FC<SectionProps> = ({
  categoryKey, notifications, onRead, onDelete, onNavigate,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const def = CATEGORIES[categoryKey];
  const unread = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) return null;

  return (
    <div style={{ ...glassPrimary, borderRadius: 24, overflow: 'hidden' }}>
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/50"
        style={{ borderBottom: collapsed ? 'none' : `1px solid ${def.border}` }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: def.bg, border: `1px solid ${def.border}` }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: def.color }}>
            {def.icon}
          </span>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: '#151b2d', flex: 1 }}>
          {def.label}
        </span>
        {unread > 0 && (
          <span
            style={{
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 900,
              color: def.color,
              background: def.bg,
              border: `1px solid ${def.border}`,
              borderRadius: 9999,
              padding: '2px 8px',
              letterSpacing: '0.05em',
            }}
          >
            {unread} sin leer
          </span>
        )}
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 16,
            color: 'rgba(21,27,45,0.25)',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          expand_more
        </span>
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="divide-y" style={{ borderColor: 'rgba(21,27,45,0.04)' }}>
          {notifications.map((n) => (
            <NotifItem
              key={n.id}
              notification={n}
              accentColor={def.color}
              onRead={() => onRead(n.id)}
              onDelete={() => onDelete(n.id)}
              onClick={() => n.metadata?.actionUrl && onNavigate(n.metadata.actionUrl, n.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Tasks module (right sidebar) ──────────────────────────────────────────────
interface TasksModuleProps {
  tasks: FixedTask[];
  onNavigate: (route: string) => void;
}

const TasksModule: React.FC<TasksModuleProps> = ({ tasks, onNavigate }) => (
  <div
    style={{
      borderRadius: 20,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(21,27,45,0.96)',
    }}
  >
    {/* Header */}
    <div
      className="flex items-center gap-3 px-5 py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(236,109,19,0.15)' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ec6d13' }}>
          checklist
        </span>
      </div>
      <div className="flex-1">
        <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
          Tareas por hacer
        </span>
      </div>
      <span
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 900,
          color: '#ec6d13',
          background: 'rgba(236,109,19,0.12)',
          borderRadius: 9999,
          padding: '2px 8px',
        }}
      >
        {tasks.length}
      </span>
    </div>

    {/* Task list */}
    {tasks.length === 0 ? (
      <div className="px-5 py-6 flex flex-col items-center gap-2 text-center">
        <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'rgba(255,255,255,0.15)' }}>
          task_alt
        </span>
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>
          ¡Todo completado!
        </p>
      </div>
    ) : (
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {tasks.map((task) => {
          const milestoneColor = MILESTONE_COLORS[task.milestone] ?? '#ec6d13';
          return (
            <button
              key={task.id}
              onClick={() => onNavigate(task.action.destination)}
              className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/5 group"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${milestoneColor}18` }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 15, color: milestoneColor }}
                >
                  {task.icon ?? 'radio_button_unchecked'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.82)',
                    lineHeight: 1.35,
                  }}
                >
                  {task.title}
                </p>
                {task.estimatedMinutes && (
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: 2,
                      display: 'block',
                    }}
                  >
                    ~{task.estimatedMinutes} min
                  </span>
                )}
              </div>
              <span
                className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
                style={{ fontSize: 14, color: milestoneColor }}
              >
                east
              </span>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const { tasks } = useFixedTasksManager();

  // Group notifications by category
  const grouped = useMemo(() => {
    const map: Record<string, Notification[]> = {};
    for (const n of notifications) {
      const cat = getCategory(n.type);
      if (!map[cat]) map[cat] = [];
      map[cat].push(n);
    }
    return map;
  }, [notifications]);

  const handleNotifClick = (url: string, id: string) => {
    markAsRead(id);
    navigate(url);
  };

  const totalNotifs = notifications.length;

  // Category order: most important first
  const CATEGORY_ORDER = ['moderation', 'shop', 'product', 'milestone', 'account', 'system'];

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">

      {/* ── Header (sticky dentro del layout) ───────────────────────────── */}
      <header className="sticky top-0 z-30">
        <div className="px-4 md:px-12 py-3 flex items-center justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                color: '#151b2d',
                lineHeight: 1.2,
              }}
            >
              Notificaciones
            </h1>
            {!loading && (
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'rgba(84,67,62,0.45)',
                  marginTop: 1,
                }}
              >
                {totalNotifs} total · {unreadCount} sin leer
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-all hover:opacity-80"
              style={{
                background: '#151b2d',
                color: 'white',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>done_all</span>
              <span className="hidden sm:inline">Leer todo</span>
              <span
                style={{
                  background: '#ec6d13',
                  borderRadius: 9999,
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '1px 6px',
                  color: 'white',
                  fontFamily: SANS,
                }}
              >
                {unreadCount}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main scrollable ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 md:px-12 pb-20" style={{ overscrollBehavior: 'contain' }}>
        <div className="max-w-[1300px] mx-auto pt-6">

        {/* Mobile: Oráculo at top */}
        <div className="lg:hidden mb-6">
          <AICopilotCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ── Left col: notification sections ─────────────────────────── */}
          <div className="lg:col-span-8 space-y-4">

            {loading ? (
              /* Skeleton */
              <div style={{ ...glassPrimary, borderRadius: 24, padding: '32px 20px' }}>
                <div className="space-y-4">
                  {[90, 70, 55].map((w) => (
                    <div
                      key={w}
                      style={{
                        height: 14,
                        borderRadius: 7,
                        background: 'rgba(21,27,45,0.06)',
                        width: `${w}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : totalNotifs === 0 ? (
              /* Empty state */
              <div
                style={{ ...glassPrimary, borderRadius: 24 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(21,27,45,0.05)' }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 32, color: 'rgba(21,27,45,0.2)' }}
                  >
                    notifications_none
                  </span>
                </div>
                <div className="text-center">
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#151b2d',
                      marginBottom: 6,
                    }}
                  >
                    Sin notificaciones
                  </p>
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(84,67,62,0.5)',
                    }}
                  >
                    Aquí aparecerán los eventos de tu tienda, productos y plataforma.
                  </p>
                </div>
              </div>
            ) : (
              /* Categorized sections */
              CATEGORY_ORDER.map((key) => {
                const notifs = grouped[key];
                if (!notifs?.length) return null;
                return (
                  <NotifSection
                    key={key}
                    categoryKey={key}
                    notifications={notifs}
                    onRead={markAsRead}
                    onDelete={deleteNotification}
                    onNavigate={handleNotifClick}
                  />
                );
              })
            )}
          </div>

          {/* ── Right sidebar ────────────────────────────────────────────── */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Oráculo — desktop only */}
            <div className="hidden lg:block">
              <AICopilotCard />
            </div>

            {/* Tasks module */}
            <TasksModule tasks={tasks} onNavigate={navigate} />

            {/* Quick links */}
            <div style={{ ...glassPrimary, borderRadius: 20 }} className="p-5">
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(84,67,62,0.4)',
                  marginBottom: 12,
                }}
              >
                Accesos rápidos
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Mi Tienda', icon: 'storefront', route: '/mi-tienda/configurar' },
                  { label: 'Inventario', icon: 'inventory_2', route: '/inventario' },
                  { label: 'Mis Pedidos', icon: 'receipt_long', route: '/mi-tienda/ventas' },
                  { label: 'Perfil artesanal', icon: 'person_pin', route: '/dashboard/artisan-profile-wizard' },
                ].map(({ label, icon, route }) => (
                  <button
                    key={route}
                    onClick={() => navigate(route)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/60 text-left"
                    style={{ border: '1px solid rgba(21,27,45,0.06)' }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, color: 'rgba(84,67,62,0.5)' }}
                    >
                      {icon}
                    </span>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#151b2d',
                        flex: 1,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 14, color: 'rgba(21,27,45,0.2)' }}
                    >
                      east
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
