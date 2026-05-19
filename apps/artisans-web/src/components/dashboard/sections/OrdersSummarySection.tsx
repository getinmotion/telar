import React from 'react';
import { glassPrimary, SERIF, SANS, lc, formatCurrency } from '../dashboardStyles';

interface SalesStats {
  totalRevenue: number;
  total: number;
  pending: number;
  shipped?: number;
}

interface OrdersSummarySectionProps {
  salesStats: SalesStats;
  isMarketplaceLive: boolean;
  isActivated: boolean;
  onNavigate: (route: string) => void;
}

export const OrdersSummarySection: React.FC<OrdersSummarySectionProps> = ({
  salesStats,
  isMarketplaceLive,
  isActivated,
  onNavigate,
}) => (
  <div style={{ ...glassPrimary, borderRadius: 32 }} className="p-8">
    <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#151b2d', marginBottom: 16 }}>
      Mis ventas
    </h3>
    {!isMarketplaceLive && (
      <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'rgba(84,67,62,0.6)', lineHeight: 1.7, marginBottom: 16 }}>
        {isActivated
          ? 'Las ventas aparecerán cuando tu tienda sea aprobada en el marketplace.'
          : 'Las ventas aparecerán cuando actives tu tienda y sea aprobada en el marketplace.'}
      </p>
    )}
    <div className="mb-6">
      <span style={lc(0.4)}>Ingresos totales</span>
      <span style={{ fontFamily: SANS, fontSize: 44, fontWeight: 700, color: '#151b2d', lineHeight: 1, letterSpacing: '-0.04em', display: 'block', marginTop: 4 }}>
        {salesStats.totalRevenue > 0 ? formatCurrency(salesStats.totalRevenue) : '$0'}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4 pt-5" style={{ borderTop: '1px solid rgba(21,27,45,0.04)' }}>
      {[
        { label: 'Órdenes',    val: salesStats.total },
        { label: 'Pendientes', val: salesStats.pending, right: true },
        { label: 'Despachados', val: salesStats.shipped ?? 0 },
      ].map((row) => (
        <div key={row.label} className={row.right ? 'text-right' : ''}>
          <span style={lc(0.4)}>{row.label}</span>
          <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: '#151b2d', display: 'block', marginTop: 2 }}>
            {row.val}
          </span>
        </div>
      ))}
      <div className="flex items-end justify-end">
        <button
          onClick={() => onNavigate('/mi-tienda/ventas')}
          className="hover:underline"
          style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
        >
          Ver ventas →
        </button>
      </div>
    </div>
  </div>
);
