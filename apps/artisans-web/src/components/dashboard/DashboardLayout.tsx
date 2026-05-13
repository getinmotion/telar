import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useMasterAgent } from '@/context/MasterAgentContext';

const SANS = "'Manrope', sans-serif";

const NavItem: React.FC<{
  icon: string;
  label?: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all',
      active
        ? 'bg-[#151b2d] text-white'
        : 'text-[#54433e]/50 hover:bg-white/60 hover:text-[#151b2d]',
    )}
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

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { masterState } = useMasterAgent();

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
      {/* Sidebar */}
      <aside
        className="w-20 shrink-0 flex flex-col items-center py-8 gap-8 sticky top-0 h-screen z-50"
        style={{
          background: 'rgba(247,246,242,0.45)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        <a href="/dashboard" className="flex items-center justify-center">
          <img src="/iso.svg" alt="Telar" className="w-8 h-8 object-contain" />
        </a>

        <nav className="flex flex-col gap-4 items-center flex-1">
          <NavItem icon="grid_view"    label="Inicio"     active={activeNav(['/dashboard'])}               onClick={() => navigate('/dashboard')} />
          <NavItem icon="storefront"   label="Tienda"     active={activeNav(['/mi-tienda/configurar'])}    onClick={() => navigate('/mi-tienda/configurar')} />
          <NavItem icon="inventory_2"  label="Productos"  active={activeNav(['/productos/subir', '/productos/editar/*'])} onClick={() => navigate('/productos/subir')} />
          <NavItem icon="bar_chart"    label="Inventario" active={activeNav(['/dashboard/inventory', '/inventario'])} onClick={() => navigate('/dashboard/inventory')} />
          <NavItem icon="receipt_long" label="Ventas"     active={activeNav(['/mi-tienda/ventas'])}        onClick={() => navigate('/mi-tienda/ventas')} />
          <NavItem icon="explore"      label="Misiones"   active={activeNav(['/dashboard/tasks'])}         onClick={() => navigate('/dashboard/tasks')} />
        </nav>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              'w-10 h-10 rounded-full overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80',
              activeNav(['/profile']) && 'ring-2 ring-[#151b2d] ring-offset-1',
            )}
            style={{
              background: 'white',
              border: '1px solid rgba(21,27,45,0.06)',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: '#54433e',
            }}
          >
            {(masterState as any).perfil?.avatarUrl ? (
              <img
                src={(masterState as any).perfil.avatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </button>
          <NavItem icon="logout" label="Salir" onClick={handleSignOut} />
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
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
