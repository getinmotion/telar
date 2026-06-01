import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SANS = "'Manrope', sans-serif";

const BottomNavItem: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] flex-1 py-1.5 transition-all"
    style={{ color: active ? '#151b2d' : 'rgba(84,67,62,0.45)' }}
  >
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: 22,
        fontVariationSettings: active ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
      }}
    >
      {icon}
    </span>
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
  </button>
);

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (paths: string[]) =>
    paths.some(p =>
      p.endsWith('*')
        ? location.pathname.startsWith(p.slice(0, -1))
        : location.pathname === p,
    );

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center px-2 md:hidden"
      style={{
        background: 'rgba(247,246,242,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.5)',
        minHeight: 60,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavItem
        icon="grid_view"
        label="Inicio"
        active={isActive(['/dashboard'])}
        onClick={() => navigate('/dashboard')}
      />
      <BottomNavItem
        icon="storefront"
        label="Tienda"
        active={isActive(['/mi-tienda/configurar'])}
        onClick={() => navigate('/mi-tienda/configurar')}
      />
      <BottomNavItem
        icon="bar_chart"
        label="Inventario"
        active={isActive(['/dashboard/inventory', '/inventario'])}
        onClick={() => navigate('/dashboard/inventory')}
      />
      <BottomNavItem
        icon="receipt_long"
        label="Ventas"
        active={isActive(['/mi-tienda/ventas'])}
        onClick={() => navigate('/mi-tienda/ventas')}
      />
      <BottomNavItem
        icon="explore"
        label="Misiones"
        active={isActive(['/dashboard/tasks'])}
        onClick={() => navigate('/dashboard/tasks')}
      />
    </div>
  );
};
