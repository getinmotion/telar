import React from 'react';
import {
  Store,
  CheckCircle2,
  Timer,
  Loader2,
  Handshake,
  Package,
} from 'lucide-react';
import { useTiendasSalud } from '@/hooks/useTiendasSalud';
import type { GestionFilters } from '@/services/gestion.actions';
import { StatTile, DistributionList } from './StatTile';

const NAVY = '#142239';
const ORANGE = '#ec6d13';

type Severity = 'alta' | 'media' | 'baja';
const SEV_STYLE: Record<Severity, { dot: string; text: string; bg: string }> = {
  alta: { dot: '#dc2626', text: '#b91c1c', bg: '#fef2f2' },
  media: { dot: '#d97706', text: '#b45309', bg: '#fffbeb' },
  baja: { dot: '#64748b', text: '#475569', bg: '#f8fafc' },
};

function pctColor(pct: number): string {
  if (pct >= 80) return '#16a34a';
  if (pct >= 50) return ORANGE;
  return '#dc2626';
}

/**
 * Tiendas — Salud y onboarding (F3).
 * Embudo de onboarding con conteos REALES de producto (mata los ceros falsos de
 * useAdminShops), tiempo de aprobación, brechas accionables y cortes por convenio.
 */
export const GestionTiendasTab: React.FC<{
  filters?: GestionFilters;
}> = ({ filters = {} }) => {
  const { data, loading } = useTiendasSalud(filters);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const { healthScore, totalShops, operationalShops, funnel, gaps, approvalTime, productDistribution, byAgreement, byRegion, byCraftType } = data;
  const healthColor = pctColor(healthScore);
  const funnelMax = Math.max(...funnel.map((f) => f.count), 1);
  const approvedCount = funnel.find((f) => f.code === 'aprobada')?.count ?? 0;

  return (
    <div className="space-y-5">
      {/* Salud del padrón — score + contexto */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 md:w-64 md:flex-shrink-0">
          <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#eef1f5" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke={healthColor} strokeWidth="3"
                strokeDasharray={`${healthScore}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute text-base font-black" style={{ color: healthColor }}>{healthScore}%</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Tiendas listas para vender</p>
            <p className="text-[11px] text-slate-400">
              {operationalShops} de {totalShops} — activa, configurada, puede cobrar, aprobada, publicada y con ≥1 producto vivo
            </p>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Tiendas totales" value={totalShops} icon={Store} />
          <StatTile label="Listas para vender" value={operationalShops} icon={CheckCircle2} />
          <StatTile label="Aprobadas en marketplace" value={approvedCount} icon={CheckCircle2} />
          <StatTile label="Días hasta aprobar (prom.)" value={approvalTime.avgDays ?? '—'} icon={Timer} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Embudo de onboarding */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Embudo de onboarding</p>
          <p className="mb-3 text-[11px] text-slate-400">Cuántas tiendas alcanzan cada etapa hasta tener catálogo vivo.</p>
          <ul className="space-y-2.5">
            {funnel.map((f, i) => {
              const pctOfTotal = totalShops > 0 ? Math.round((f.count / totalShops) * 100) : 0;
              const barPct = Math.round((f.count / funnelMax) * 100);
              return (
                <li key={f.code} className="flex items-center gap-2">
                  <span className="w-40 flex-shrink-0 truncate text-xs text-slate-600" title={f.label}>
                    {i + 1}. {f.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: i === 0 ? NAVY : ORANGE }} />
                  </div>
                  <span className="w-16 flex-shrink-0 text-right text-xs font-semibold text-slate-700">
                    {f.count} <span className="text-slate-400">({pctOfTotal}%)</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Brechas accionables */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Brechas detectadas</p>
          <p className="mb-2 text-[11px] text-slate-400">A cuántas tiendas afecta cada bloqueo — atacar primero lo de severidad alta.</p>
          {gaps.length === 0 ? (
            <p className="py-6 text-center text-xs text-emerald-500">Sin brechas de onboarding 🎉</p>
          ) : (
            <div>
              {gaps.map((g) => {
                const s = SEV_STYLE[g.severity];
                const pct = totalShops > 0 ? Math.round((g.count / totalShops) * 100) : 0;
                return (
                  <div key={g.code} className="flex items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: s.dot }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{g.label}</p>
                      <p className="truncate text-[11px] text-slate-400">{g.hint}</p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end">
                      <span className="text-lg font-bold leading-none" style={{ color: s.dot }}>{g.count}</span>
                      <span className="text-[10px] text-slate-400">{pct}% del padrón</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Productos por tienda + Convenios */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DistributionList
          title="Productos aprobados por tienda"
          items={productDistribution.map((p) => ({ name: p.bucket, count: p.count }))}
        />

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <Handshake className="h-3.5 w-3.5" /> Por convenio
          </p>
          {byAgreement.length === 0 ? (
            <p className="text-xs text-slate-400">Sin datos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
                    <th className="pb-2 font-semibold">Convenio</th>
                    <th className="pb-2 text-right font-semibold">Tiendas</th>
                    <th className="pb-2 text-right font-semibold">Aprob.</th>
                    <th className="pb-2 text-right font-semibold">Con prod.</th>
                  </tr>
                </thead>
                <tbody>
                  {byAgreement.map((a) => (
                    <tr key={a.agreementId ?? '__none__'} className="border-t border-slate-100">
                      <td className="py-1.5 pr-2 text-slate-700">{a.agreementName ?? 'Sin convenio'}</td>
                      <td className="py-1.5 text-right font-semibold text-slate-700">{a.total}</td>
                      <td className="py-1.5 text-right text-slate-500">{a.marketplaceApproved}</td>
                      <td className="py-1.5 text-right text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Package className="h-3 w-3 text-slate-300" />{a.withApprovedProducts}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Distribuciones */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DistributionList title="Top regiones" items={byRegion} />
        <DistributionList title="Top oficios" items={byCraftType} />
      </div>

      {/* Caveats */}
      {data.caveats.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] text-slate-400">
          <Store className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <div className="space-y-0.5">
            {data.caveats.map((c, i) => (<p key={i}>{c}</p>))}
          </div>
        </div>
      )}
    </div>
  );
};
