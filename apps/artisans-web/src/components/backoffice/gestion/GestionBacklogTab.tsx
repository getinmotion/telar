import React from 'react';
import {
  Inbox,
  Package,
  Store,
  Clock,
  AlarmClock,
  Timer,
  CheckCheck,
  Handshake,
  Loader2,
} from 'lucide-react';
import { useModerationBacklog } from '@/hooks/useModerationBacklog';
import { StatTile } from './StatTile';

const NAVY = '#142239';
const GREEN = '#16a34a';
const RED = '#dc2626';
const AMBER = '#d97706';

const BUCKET_COLOR: Record<string, string> = {
  '< 2 días': GREEN,
  '2–7 días': '#65a30d',
  '7–30 días': AMBER,
  '> 30 días': RED,
};

function weekLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Backlog de moderación (F4) — cola cross-dominio (productos + tiendas):
 * pendientes actuales con antigüedad, tiempo de resolución, throughput semanal y
 * cortes por convenio. Derivado del historial (techo de confiabilidad).
 */
export const GestionBacklogTab: React.FC = () => {
  const { data, loading } = useModerationBacklog();

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const { backlog, resolution, throughputByWeek, byAgreement } = data;
  const weekMax = Math.max(
    ...throughputByWeek.map((w) => w.approved + w.rejected + w.changesRequested),
    1,
  );
  const bucketMax = Math.max(...backlog.ageBuckets.map((b) => b.count), 1);

  return (
    <div className="space-y-5">
      {/* KPIs de cola */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Backlog total" value={backlog.total} icon={Inbox} accent={backlog.total > 0} />
        <StatTile label="Productos pendientes" value={backlog.pendingProducts} icon={Package} />
        <StatTile label="Tiendas pendientes" value={backlog.pendingShops} icon={Store} />
        <StatTile label="Antigüedad prom. (días)" value={backlog.avgPendingAgeDays ?? '—'} icon={Clock} />
        <StatTile label="Más viejo (días)" value={backlog.oldestPendingDays ?? '—'} icon={AlarmClock} accent={(backlog.oldestPendingDays ?? 0) > 30} />
        <StatTile label="Resolución prom. (días)" value={resolution.avgResolutionDays ?? '—'} icon={Timer} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Antigüedad de la cola (SLA) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Antigüedad de la cola</p>
          <p className="mb-3 text-[11px] text-slate-400">Cuánto llevan esperando los pendientes — lo rojo es deuda de servicio.</p>
          {backlog.ageBuckets.length === 0 ? (
            <p className="py-6 text-center text-xs text-emerald-500">Cola vacía 🎉</p>
          ) : (
            <ul className="space-y-2.5">
              {backlog.ageBuckets.map((b) => (
                <li key={b.bucket} className="flex items-center gap-2">
                  <span className="w-20 flex-shrink-0 text-xs text-slate-600">{b.bucket}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((b.count / bucketMax) * 100)}%`, background: BUCKET_COLOR[b.bucket] ?? NAVY }} />
                  </div>
                  <span className="w-8 flex-shrink-0 text-right text-xs font-semibold text-slate-700">{b.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Throughput semanal */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ritmo de decisiones (8 semanas)</p>
            <span className="text-[10px] text-slate-400">{resolution.decidedLast30d} en 30d · {resolution.decidedLast7d} en 7d</span>
          </div>
          {throughputByWeek.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">Sin decisiones registradas.</p>
          ) : (
            <>
              <div className="flex h-32 items-end justify-between gap-1.5 pt-2">
                {throughputByWeek.map((w) => {
                  const totalH = w.approved + w.rejected + w.changesRequested;
                  const h = Math.round((totalH / weekMax) * 100);
                  return (
                    <div key={w.week} className="flex flex-1 flex-col items-center gap-1" title={`${w.approved} aprob · ${w.rejected} rech · ${w.changesRequested} cambios`}>
                      <div className="flex w-full flex-col justify-end overflow-hidden rounded" style={{ height: `${Math.max(h, 3)}%`, minHeight: totalH > 0 ? 4 : 0 }}>
                        {w.changesRequested > 0 && <div style={{ flex: w.changesRequested, background: AMBER }} />}
                        {w.rejected > 0 && <div style={{ flex: w.rejected, background: RED }} />}
                        {w.approved > 0 && <div style={{ flex: w.approved, background: GREEN }} />}
                      </div>
                      <span className="text-[9px] text-slate-400">{weekLabel(w.week)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1"><CheckCheck className="h-3 w-3" style={{ color: GREEN }} />Aprobados</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: RED }} />Rechazados</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: AMBER }} />Cambios</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cortes por convenio */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          <Handshake className="h-3.5 w-3.5" /> Backlog por convenio
        </p>
        {byAgreement.length === 0 ? (
          <p className="py-4 text-center text-xs text-emerald-500">Sin pendientes por convenio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="pb-2 font-semibold">Convenio</th>
                  <th className="pb-2 text-right font-semibold">Productos</th>
                  <th className="pb-2 text-right font-semibold">Tiendas</th>
                  <th className="pb-2 text-right font-semibold">Más viejo (días)</th>
                </tr>
              </thead>
              <tbody>
                {byAgreement.map((a) => (
                  <tr key={a.agreementId ?? '__none__'} className="border-t border-slate-100">
                    <td className="py-1.5 pr-2 text-slate-700">{a.agreementName ?? 'Sin convenio'}</td>
                    <td className="py-1.5 text-right font-semibold text-slate-700">{a.pendingProducts}</td>
                    <td className="py-1.5 text-right text-slate-500">{a.pendingShops}</td>
                    <td className="py-1.5 text-right font-semibold" style={{ color: (a.oldestPendingDays ?? 0) > 30 ? RED : '#475569' }}>
                      {a.oldestPendingDays ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Caveats */}
      {data.caveats.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] text-slate-400">
          <Inbox className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <div className="space-y-0.5">
            {data.caveats.map((c, i) => (<p key={i}>{c}</p>))}
          </div>
        </div>
      )}
    </div>
  );
};
