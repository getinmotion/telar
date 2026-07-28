import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Store,
  Gauge,
  Loader2,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Boxes,
  Tag,
  DollarSign,
  Ruler,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';
import {
  getCatalogoIssueProducts,
  CatalogoIssueProduct,
} from '@/services/gestion.actions';
import { StatTile } from './StatTile';
import { cn } from '@/lib/utils';

const NAVY = '#142239';
const ORANGE = '#ec6d13';

type Severity = 'alta' | 'media' | 'baja';

const SEV_STYLE: Record<Severity, { dot: string; text: string; bg: string }> = {
  alta: { dot: '#dc2626', text: '#b91c1c', bg: '#fef2f2' },
  media: { dot: '#d97706', text: '#b45309', bg: '#fffbeb' },
  baja: { dot: '#64748b', text: '#475569', bg: '#f8fafc' },
};

interface Issue {
  code: string;
  label: string;
  hint: string;
  count: number;
  severity: Severity;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

/** Color de una barra de completitud según el % (verde alto → naranja bajo). */
function pctColor(pct: number): string {
  if (pct >= 80) return '#16a34a';
  if (pct >= 50) return ORANGE;
  return '#dc2626';
}

const IssueRow: React.FC<{ issue: Issue; total: number }> = ({ issue, total }) => {
  const navigate = useNavigate();
  const s = SEV_STYLE[issue.severity];
  const pct = total > 0 ? Math.round((issue.count / total) * 100) : 0;
  const Icon = issue.icon;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [products, setProducts] = useState<CatalogoIssueProduct[]>([]);
  const [fetchedTotal, setFetchedTotal] = useState(0);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded && !loading) {
      setLoading(true);
      try {
        const res = await getCatalogoIssueProducts(issue.code, 50);
        setProducts(res.products);
        setFetchedTotal(res.total);
        setLoaded(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-slate-50/60"
      >
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
        <div className="flex flex-shrink-0 flex-col items-end">
          <span className="text-lg font-bold leading-none" style={{ color: issue.count > 0 ? s.dot : '#94a3b8' }}>
            {issue.count}
          </span>
          {total > 0 && <span className="text-[10px] text-slate-400">{pct}% del catálogo</span>}
        </div>
        {open ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-300" /> : <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />}
      </button>

      {open && (
        <div className="pb-3 pl-11 pr-1">
          {loading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando productos…
            </div>
          ) : products.length === 0 ? (
            <p className="py-2 text-xs text-slate-400">Sin productos para mostrar.</p>
          ) : (
            <>
              <ul className="divide-y divide-slate-50 rounded-lg border border-slate-100">
                {products.map((p) => (
                  <li key={p.productId} className="flex items-center gap-2 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-700">{p.name || 'Sin nombre'}</p>
                      <p className="truncate text-[10px] text-slate-400">{p.storeName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/backoffice/studio?shopId=${p.storeId}&productId=${p.productId}`)}
                      className="inline-flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: NAVY }}
                    >
                      <ArrowUpRight className="h-3 w-3" style={{ color: ORANGE }} />
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
              {fetchedTotal > products.length && (
                <p className="mt-1.5 text-[10px] text-slate-400">
                  Mostrando {products.length} de {fetchedTotal}. Abre el producto en el Studio para corregirlo.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Productos — Salud y detección.
 * Reencuadra el analytics de catálogo (/products-new/analytics) como salud
 * (score + desglose de completitud) + cola de issues accionables detectados,
 * en vez de un tablero de métricas sueltas.
 */
export const GestionProductosTab: React.FC = () => {
  const { data, loading, fetchAnalytics } = useProductAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const issues = useMemo<Issue[]>(() => {
    if (!data) return [];
    const { catalogQuality, priceDistribution, volumetricAnalysis } = data;
    const list: Issue[] = [
      { code: 'sin_imagenes', label: 'Sin imágenes', hint: 'Bloquea la publicación en el marketplace.', count: catalogQuality.withoutImages, severity: 'alta', icon: ImageIcon },
      { code: 'sin_categoria', label: 'Sin categoría', hint: 'No aparece en navegación ni filtros.', count: catalogQuality.withoutCategory, severity: 'alta', icon: Tag },
      { code: 'precio_sospechoso', label: 'Precios sospechosamente bajos', hint: 'Variantes con precio ≤ $100 — probable error de carga.', count: priceDistribution.suspiciousCheapCount, severity: 'alta', icon: DollarSign },
      { code: 'sin_identidad', label: 'Sin identidad artesanal', hint: 'Falta oficio/técnica — pierde valor curatorial.', count: catalogQuality.withoutArtisanalIdentity, severity: 'media', icon: Sparkles },
      { code: 'sin_descripcion', label: 'Sin descripción', hint: 'Ficha incompleta para el comprador.', count: catalogQuality.withoutDescription, severity: 'media', icon: FileText },
      { code: 'sin_materiales', label: 'Sin materiales', hint: 'No se puede calcular sostenibilidad ni filtrar por material.', count: catalogQuality.withoutMaterials, severity: 'media', icon: Boxes },
      { code: 'anomalia_volumen', label: 'Anomalías de peso/volumen', hint: 'Dimensiones/peso fuera de rango — riesgo de flete mal cotizado.', count: volumetricAnalysis.anomaliesDetected, severity: 'media', icon: Ruler },
    ];
    // Solo issues con ocurrencias, ordenados por severidad y luego por conteo.
    const sevRank: Record<Severity, number> = { alta: 0, media: 1, baja: 2 };
    return list
      .filter((i) => i.count > 0)
      .sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || b.count - a.count);
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const { topMetrics, completeness, catalogQuality } = data;
  const health = Math.round(completeness.avgCompleteness);
  const healthColor = pctColor(health);

  return (
    <div className="space-y-5">
      {/* Salud del catálogo — score + contexto */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 md:w-64 md:flex-shrink-0">
          <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#eef1f5" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke={healthColor} strokeWidth="3"
                strokeDasharray={`${health}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute text-lg font-black" style={{ color: healthColor }}>{health}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Salud del catálogo</p>
            <p className="text-[11px] text-slate-400">Completitud promedio de todas las capas</p>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-3">
          <StatTile label="Productos" value={topMetrics.totalProducts} icon={Package} />
          <StatTile label="Tiendas" value={topMetrics.totalStores} icon={Store} />
          <StatTile label="Completitud" value={`${health}%`} icon={Gauge} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Issues detectados — la cola accionable */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Issues detectados</p>
          <p className="mb-2 text-[11px] text-slate-400">Ordenados por severidad — atacar primero lo que bloquea publicación.</p>
          {issues.length === 0 ? (
            <p className="py-6 text-center text-xs text-emerald-500">Sin issues de catálogo detectados 🎉</p>
          ) : (
            <div>
              {issues.map((i) => (
                <IssueRow key={i.code} issue={i} total={topMetrics.totalProducts} />
              ))}
            </div>
          )}
        </div>

        {/* Completitud por capa — el desglose de la salud */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Completitud por capa</p>
          <p className="mb-3 text-[11px] text-slate-400">Desglose del score de salud por dimensión del producto.</p>
          <ul className="space-y-2.5">
            {completeness.layers.map((l) => (
              <li key={l.layer} className="flex items-center gap-2">
                <span className="w-40 flex-shrink-0 truncate text-xs text-slate-600" title={l.layer}>{l.layer}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${l.percentage}%`, background: pctColor(l.percentage) }} />
                </div>
                <span className="w-9 flex-shrink-0 text-right text-xs font-semibold" style={{ color: pctColor(l.percentage) }}>
                  {l.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Motivos de rechazo — con caveat de confiabilidad */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Motivos de rechazo (90 días)</p>
          <span className="text-[10px] text-slate-400">texto libre del moderador · estimado</span>
        </div>
        {catalogQuality.rejectionReasons.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">Sin rechazos registrados en el período.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {catalogQuality.rejectionReasons.map((r, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs">
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-300" />
                <span className="min-w-0 flex-1 truncate text-slate-600" title={r.reason}>{r.reason}</span>
                <span className={cn('flex-shrink-0 rounded px-1.5 py-0.5 font-semibold text-slate-600')} style={{ background: `${NAVY}0d` }}>
                  {r.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
