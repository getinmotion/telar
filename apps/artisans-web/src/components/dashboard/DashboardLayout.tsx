import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { useTelarSync } from '@/hooks/useTelarSync';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { AICopilotCard } from '@/components/dashboard/AICopilotCard';
import { OraculoProvider, useOraculo } from '@/components/oraculo/OraculoContext';
import { useIsWizardRoute } from '@/hooks/useIsWizardRoute';

const SANS = "'Manrope', sans-serif";

const NavItem: React.FC<{
  icon: string;
  label?: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex flex-col items-center gap-1 py-2.5 px-2 transition-all"
    style={{
      borderRadius: 9999,
      background: active ? 'white' : 'transparent',
      color: active ? '#151b2d' : 'rgba(255,255,255,0.38)',
      boxShadow: active ? '0 2px 8px rgba(21,27,45,0.12)' : 'none',
    }}
    onMouseEnter={e => {
      if (!active) {
        (e.currentTarget as HTMLElement).style.background = 'white';
        (e.currentTarget as HTMLElement).style.color = '#151b2d';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(21,27,45,0.10)';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.38)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }
    }}
  >
    <span
      className="material-symbols-outlined"
      style={{ fontSize: 20, fontVariationSettings: "'FILL' 0, 'wght' 300" }}
    >
      {icon}
    </span>
    {label && (
      <span
        style={{
          fontFamily: SANS,
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    )}
  </button>
);

const MobileAgentDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { node } = useOraculo();
  const content = node ?? <AICopilotCard />;
  return (
    <div className="md:hidden fixed left-0 right-0 z-40" style={{ bottom: 60 }}>
      {/* Content — slides up when open */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '55vh' : 0,
        transition: 'max-height 0.28s ease',
      }}>
        <div style={{ overflowY: 'auto', maxHeight: '55vh', background: '#151b2d', borderRadius: '16px 16px 0 0' }}>
          {content}
        </div>
      </div>
      {/* Trigger bar */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5"
        style={{
          background: '#151b2d',
          height: 46,
          borderTopLeftRadius: open ? 0 : 14,
          borderTopRightRadius: open ? 0 : 14,
          borderTop: open ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 16 }}>psychology</span>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
            ORÁCULO
          </span>
        </div>
        <span
          className="material-symbols-outlined"
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 18,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.25s ease',
          }}
        >
          expand_less
        </span>
      </button>
    </div>
  );
};

const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { masterState } = useMasterAgent();
  const isWizardRoute = useIsWizardRoute();

  useTelarSync();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'A';
  const handleSignOut = async () => { try { await signOut(); navigate('/login'); } catch {} };

  const activeNav = (paths: string[]) => paths.some(p =>
    p.endsWith('*') ? location.pathname.startsWith(p.slice(0, -1)) : location.pathname === p
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: '#f9f7f2',
        backgroundImage: [
          'radial-gradient(circle at top left, rgba(223,244,232,0.95), transparent 38%)',
          'radial-gradient(circle at bottom right, rgba(238,241,245,0.95), transparent 42%)',
          'radial-gradient(circle at top right, rgba(255,244,223,0.75), transparent 34%)',
        ].join(', '),
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <aside
        className="hidden md:flex w-[76px] shrink-0 flex-col items-center py-5 sticky top-0 h-screen z-[60]"
        style={{ marginLeft: 8 }}
      >
        {/* Dark floating container — logo + nav items + user, vertically centered */}
        <div className="flex-1 flex items-center justify-center w-full">
          <nav
            className="flex flex-col gap-1 items-center w-full px-2 py-3"
            style={{
              background: '#151b2d',
              borderRadius: 9999,
              boxShadow: '0 8px 32px rgba(21,27,45,0.22)',
            }}
          >
            {/* Logo */}
            <a
              href="/dashboard"
              className="flex items-center justify-center mb-2"
              style={{ padding: '6px 0' }}
            >
              <img src="/iso.svg" alt="Telar" className="w-7 h-7 object-contain opacity-85" />
            </a>

            {/* Divider */}
            <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 1, marginBottom: 4 }} />

            <NavItem icon="grid_view"    label="Inicio"     active={activeNav(['/dashboard'])}                          onClick={() => navigate('/dashboard')} />
            <NavItem icon="storefront"   label="Tienda"     active={activeNav(['/mi-tienda/configurar'])}               onClick={() => navigate('/mi-tienda/configurar')} />
            <NavItem icon="bar_chart"    label="Inventario" active={activeNav(['/dashboard/inventory', '/inventario'])}  onClick={() => navigate('/dashboard/inventory')} />
            <NavItem icon="receipt_long" label="Ventas"     active={activeNav(['/mi-tienda/ventas'])}                   onClick={() => navigate('/mi-tienda/ventas')} />
            <NavItem icon="explore"      label="Misiones"   active={activeNav(['/dashboard/tasks'])}                    onClick={() => navigate('/dashboard/tasks')} />
            <NavItem icon="notifications" label="Alertas"   active={activeNav(['/notifications'])}                      onClick={() => navigate('/notifications')} />

            {/* Divider */}
            <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 1, marginTop: 4, marginBottom: 4 }} />

            {/* Avatar */}
            <button
              onClick={() => navigate('/profile')}
              className={cn(
                'w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80',
                activeNav(['/profile']) && 'ring-2 ring-white/30 ring-offset-1 ring-offset-[#151b2d]',
              )}
              style={{
                background: 'rgba(255,255,255,0.1)',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {(masterState as any).perfil?.avatarUrl ? (
                <img src={(masterState as any).perfil.avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </button>

            {/* Logout */}
            <NavItem icon="logout" onClick={handleSignOut} />
          </nav>
        </div>
      </aside>

      {/* Content with page transitions */}
      <main className="flex-1 overflow-hidden min-w-0 flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="flex-1 flex flex-col min-h-0"
          >
            <Outlet />
            {/* Spacer: mobile bottom nav (60px) + agent trigger bar (46px). Hidden during wizards. */}
            {!isWizardRoute && <div className="h-[106px] shrink-0 md:hidden" />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile agent drawer and bottom nav are hidden during wizard routes */}
      {!isWizardRoute && <MobileAgentDrawer />}
      {!isWizardRoute && <MobileBottomNav />}
    </div>
  );
};

export const DashboardLayout: React.FC = () => (
  <OraculoProvider>
    <DashboardContent />
  </OraculoProvider>
);
