import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ReadinessItem } from './readiness';

const NAVY = '#142239';
const GREEN = '#16a34a';
const RED = '#dc2626';

function pctColor(pct: number): string {
  if (pct >= 100) return GREEN;
  if (pct >= 50) return '#d97706';
  return RED;
}

interface ReadinessPanelProps {
  title: string;
  items: ReadinessItem[];
  ready: boolean;
  /** Filas de estado (no requisitos): p.ej. Aprobada / Publicada. */
  statusRows?: { label: string; ok: boolean }[];
  /** Botones de acción al pie del panel. */
  children?: React.ReactNode;
}

/**
 * Panel lateral "¿Listo para aprobar?" para los estudios de moderación.
 * Veredicto + anillo de cumplimiento + checklist de requisitos + estado + acciones.
 */
export const ReadinessPanel: React.FC<ReadinessPanelProps> = ({
  title,
  items,
  ready,
  statusRows,
  children,
}) => {
  const okCount = items.filter((i) => i.ok).length;
  const pct = items.length > 0 ? Math.round((okCount / items.length) * 100) : 0;
  const ringColor = ready ? GREEN : pctColor(pct);
  const missing = items.length - okCount;

  return (
    <div className="flex h-full flex-col bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Cabecera + veredicto */}
      <div className="flex-shrink-0 border-b border-slate-200 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#eef1f5" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke={ringColor} strokeWidth="3"
                strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute text-xs font-black" style={{ color: ringColor }}>{pct}%</span>
          </div>
          <div className="min-w-0">
            {ready ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Listo para aprobar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                <AlertTriangle className="h-3.5 w-3.5" /> Faltan {missing} requisito{missing !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Checklist + estado (scrollable) */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-4 py-3">
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.key} className="flex items-start gap-2.5">
                {it.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: GREEN }} />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: RED }} />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700">{it.label}</p>
                  {!it.ok && it.hint && <p className="text-[11px] text-slate-400">{it.hint}</p>}
                </div>
              </li>
            ))}
          </ul>

          {statusRows && statusRows.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Estado</p>
              <ul className="space-y-2">
                {statusRows.map((r) => (
                  <li key={r.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{r.label}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={r.ok
                        ? { background: '#dcfce7', color: '#15803d' }
                        : { background: `${NAVY}0d`, color: '#64748b' }}
                    >
                      {r.ok ? 'Sí' : 'No'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Acciones */}
      {children && <div className="flex-shrink-0 border-t border-slate-200">{children}</div>}
    </div>
  );
};
