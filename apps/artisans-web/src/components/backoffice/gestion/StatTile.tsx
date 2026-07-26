import React from 'react';

const NAVY = '#142239';
const ORANGE = '#ec6d13';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Resalta el valor en naranja (para métricas de atención: pendientes, faltantes…) */
  accent?: boolean;
}

/** Tarjeta KPI liviana usada en los dashboards de Gestión. */
export const StatTile: React.FC<StatTileProps> = ({ label, value, icon: Icon, accent }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
    {Icon && (
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${NAVY}0d` }}>
        <Icon className="h-4 w-4" style={{ color: NAVY }} />
      </div>
    )}
    <div className="min-w-0">
      <p className="text-xl font-bold leading-tight" style={{ color: accent ? ORANGE : NAVY }}>{value}</p>
      <p className="truncate text-[11px] text-slate-400">{label}</p>
    </div>
  </div>
);

/** Mini-lista nombre → conteo, para distribuciones (regiones, oficios…). */
export const DistributionList: React.FC<{
  title: string;
  items: { name: string; count: number }[];
  emptyLabel?: string;
}> = ({ title, items, emptyLabel = 'Sin datos' }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
    {items.length === 0 ? (
      <p className="text-xs text-slate-400">{emptyLabel}</p>
    ) : (
      <ul className="space-y-2">
        {items.map((it) => {
          const max = Math.max(...items.map((i) => i.count), 1);
          const pct = Math.round((it.count / max) * 100);
          return (
            <li key={it.name} className="flex items-center gap-2">
              <span className="w-32 flex-shrink-0 truncate text-xs text-slate-600" title={it.name}>{it.name}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ORANGE }} />
              </div>
              <span className="w-8 flex-shrink-0 text-right text-xs font-semibold text-slate-700">{it.count}</span>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);
