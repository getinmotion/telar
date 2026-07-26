import React, { useEffect, useMemo, useState } from 'react';
import {
  Tags,
  CheckCircle2,
  Activity,
  Clock,
  Loader2,
  Unlink,
  Copy,
  Ghost,
  XCircle,
  ClipboardList,
} from 'lucide-react';
import {
  getAllTaxonomyItems,
  type TaxonomyItemWithCount,
  type TaxonomyType,
} from '@/services/taxonomy.actions';
import { StatTile } from './StatTile';

const ORANGE = '#ec6d13';
const GREEN = '#16a34a';
const AMBER = '#d97706';
const RED = '#dc2626';

type Severity = 'alta' | 'media' | 'baja';
const SEV_STYLE: Record<Severity, { dot: string; text: string; bg: string }> = {
  alta: { dot: RED, text: '#b91c1c', bg: '#fef2f2' },
  media: { dot: AMBER, text: '#b45309', bg: '#fffbeb' },
  baja: { dot: '#64748b', text: '#475569', bg: '#f8fafc' },
};

const TYPES: { type: TaxonomyType; label: string }[] = [
  { type: 'crafts', label: 'Oficios' },
  { type: 'techniques', label: 'Técnicas' },
  { type: 'materials', label: 'Materiales' },
  { type: 'styles', label: 'Estilos' },
  { type: 'herramientas', label: 'Herramientas' },
];

interface Issue {
  code: string;
  label: string;
  hint: string;
  count: number;
  severity: Severity;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const norm = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

function pctColor(pct: number): string {
  if (pct >= 80) return GREEN;
  if (pct >= 50) return ORANGE;
  return RED;
}

const IssueRow: React.FC<{ issue: Issue }> = ({ issue }) => {
  const s = SEV_STYLE[issue.severity];
  const Icon = issue.icon;
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: s.bg }}>
        <Icon className="h-4 w-4" style={{ color: s.dot }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{issue.label}</span>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: s.bg, color: s.text }}>
            {issue.severity}
          </span>
        </div>
        <p className="truncate text-[11px] text-slate-400">{issue.hint}</p>
      </div>
      <span className="flex-shrink-0 text-lg font-bold leading-none" style={{ color: s.dot }}>{issue.count}</span>
    </div>
  );
};

/**
 * Taxonomía — Salud y detección (F5).
 * Reemplaza el dashboard glass por la vista navy/naranja de Gestión: score de
 * curación + cola de issues reales (pendientes, huérfanos, sin-uso, duplicados)
 * derivados de los endpoints de taxonomía existentes, + salud por dimensión.
 */
export const GestionTaxonomiaTab: React.FC = () => {
  const [items, setItems] = useState<Partial<Record<TaxonomyType, TaxonomyItemWithCount[]>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled(
      TYPES.map((t) => getAllTaxonomyItems(t.type, { withProductCount: true })),
    ).then((results) => {
      const map: Partial<Record<TaxonomyType, TaxonomyItemWithCount[]>> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[TYPES[i].type] = r.value;
      });
      setItems(map);
      setLoading(false);
    });
  }, []);

  const derived = useMemo(() => {
    const perType = TYPES.map(({ type, label }) => {
      const list = items[type] ?? [];
      const total = list.length;
      const approved = list.filter((x) => x.status === 'approved').length;
      const pending = list.filter((x) => x.status === 'pending').length;
      const rejected = list.filter((x) => x.status === 'rejected').length;
      const inUse = list.filter((x) => ((x.productCount ?? 0) + (x.artisanCount ?? 0)) > 0).length;
      const unused = list.filter(
        (x) => x.status === 'approved' && (x.productCount ?? 0) + (x.artisanCount ?? 0) === 0,
      ).length;
      // Duplicados por nombre normalizado (grupos con >1).
      const nameGroups = new Map<string, number>();
      for (const x of list) nameGroups.set(norm(x.name), (nameGroups.get(norm(x.name)) ?? 0) + 1);
      const duplicates = Array.from(nameGroups.values()).filter((n) => n > 1).length;
      return { type, label, total, approved, pending, rejected, inUse, unused, duplicates };
    });

    // Huérfanos.
    const craftsNoCategory = (items.crafts ?? []).filter((c) => !c.categoryId).length;
    const techsNoCraft = (items.techniques ?? []).filter(
      (t) => (t.craftIds?.length ?? 0) === 0 && !t.craftId,
    ).length;

    const totalTerms = perType.reduce((s, t) => s + t.total, 0);
    const totalApproved = perType.reduce((s, t) => s + t.approved, 0);
    const totalPending = perType.reduce((s, t) => s + t.pending, 0);
    const totalRejected = perType.reduce((s, t) => s + t.rejected, 0);
    const totalInUse = perType.reduce((s, t) => s + t.inUse, 0);
    const totalUnused = perType.reduce((s, t) => s + t.unused, 0);
    const totalDuplicates = perType.reduce((s, t) => s + t.duplicates, 0);

    const curationPct = totalTerms > 0 ? Math.round((totalApproved / totalTerms) * 100) : 0;

    const issues: Issue[] = [
      { code: 'oficios_sin_cat', label: 'Oficios sin categoría', hint: 'Huérfanos — rompen la navegación por categoría.', count: craftsNoCategory, severity: 'alta', icon: Unlink },
      { code: 'tecnicas_sin_oficio', label: 'Técnicas sin oficio', hint: 'Huérfanas — no cuelgan de ningún oficio.', count: techsNoCraft, severity: 'alta', icon: Unlink },
      { code: 'pendientes', label: 'Términos pendientes de revisión', hint: 'Sugeridos por artesanos, esperando curación en el Inbox.', count: totalPending, severity: 'media', icon: ClipboardList },
      { code: 'sin_uso', label: 'Términos sin uso', hint: 'Aprobados pero sin productos ni artesanos vinculados.', count: totalUnused, severity: 'media', icon: Ghost },
      { code: 'duplicados', label: 'Nombres duplicados', hint: 'Mismo nombre repetido dentro de un tipo — candidatos a fusión.', count: totalDuplicates, severity: 'media', icon: Copy },
      { code: 'rechazados', label: 'Términos rechazados sin depurar', hint: 'Quedaron en estado rechazado en el catálogo.', count: totalRejected, severity: 'baja', icon: XCircle },
    ];
    const sevRank: Record<Severity, number> = { alta: 0, media: 1, baja: 2 };
    const activeIssues = issues
      .filter((i) => i.count > 0)
      .sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || b.count - a.count);

    return { perType, totalTerms, totalApproved, totalPending, totalRejected, totalInUse, totalUnused, totalDuplicates, curationPct, activeIssues };
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const { perType, totalTerms, totalApproved, totalPending, totalInUse, curationPct, activeIssues } = derived;
  const healthColor = pctColor(curationPct);

  return (
    <div className="space-y-5">
      {/* Curación — score + contexto */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 md:w-64 md:flex-shrink-0">
          <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#eef1f5" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke={healthColor} strokeWidth="3"
                strokeDasharray={`${curationPct}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute text-lg font-black" style={{ color: healthColor }}>{curationPct}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Curación del vocabulario</p>
            <p className="text-[11px] text-slate-400">% de términos aprobados sobre el total</p>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Términos totales" value={totalTerms} icon={Tags} />
          <StatTile label="Aprobados" value={totalApproved} icon={CheckCircle2} />
          <StatTile label="En uso" value={totalInUse} icon={Activity} />
          <StatTile label="Pendientes" value={totalPending} icon={Clock} accent={totalPending > 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Issues detectados */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Issues detectados</p>
          <p className="mb-2 text-[11px] text-slate-400">Huérfanos y pendientes primero — lo que rompe navegación o espera curación.</p>
          {activeIssues.length === 0 ? (
            <p className="py-6 text-center text-xs text-emerald-500">Vocabulario sano, sin issues 🎉</p>
          ) : (
            <div>{activeIssues.map((i) => <IssueRow key={i.code} issue={i} />)}</div>
          )}
        </div>

        {/* Salud por dimensión */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Salud por dimensión</p>
          <p className="mb-3 text-[11px] text-slate-400">Aprobados / pendientes / rechazados y cuántos están en uso.</p>
          <ul className="space-y-3">
            {perType.map((t) => {
              const aW = t.total > 0 ? (t.approved / t.total) * 100 : 0;
              const pW = t.total > 0 ? (t.pending / t.total) * 100 : 0;
              const rW = t.total > 0 ? (t.rejected / t.total) * 100 : 0;
              return (
                <li key={t.type}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{t.label}</span>
                    <span className="text-slate-400">{t.total} · {t.inUse} en uso</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                    <div style={{ width: `${aW}%`, background: GREEN }} />
                    <div style={{ width: `${pW}%`, background: AMBER }} />
                    <div style={{ width: `${rW}%`, background: RED }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: GREEN }} />Aprobados</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: AMBER }} />Pendientes</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: RED }} />Rechazados</span>
          </div>
        </div>
      </div>
    </div>
  );
};
