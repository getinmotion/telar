import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldQuestion,
  ShieldCheck,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  Mail,
  Package,
  Store,
  Handshake,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  ClienteEnRiesgo,
  ClientesEnRiesgoResponse,
  RiskLevel,
  RiskSeverity,
} from '@/services/gestion.actions';
import type { ViewFilters } from '@/hooks/useUrlFilters';
import { cn } from '@/lib/utils';

const NAVY = '#142239';
const ORANGE = '#ec6d13';

const LEVEL_STYLE: Record<
  Exclude<RiskLevel, 'sano'>,
  { label: string; bar: string; badgeBg: string; badgeText: string; icon: React.ComponentType<{ className?: string }> }
> = {
  alto: { label: 'Alto', bar: '#dc2626', badgeBg: '#fee2e2', badgeText: '#b91c1c', icon: ShieldAlert },
  medio: { label: 'Medio', bar: '#d97706', badgeBg: '#fef3c7', badgeText: '#b45309', icon: ShieldQuestion },
  bajo: { label: 'Bajo', bar: '#64748b', badgeBg: '#f1f5f9', badgeText: '#475569', icon: ShieldCheck },
};

const SEVERITY_STYLE: Record<RiskSeverity, { dot: string; text: string; bg: string }> = {
  alta: { dot: '#dc2626', text: '#b91c1c', bg: '#fef2f2' },
  media: { dot: '#d97706', text: '#b45309', bg: '#fffbeb' },
  baja: { dot: '#64748b', text: '#475569', bg: '#f8fafc' },
};

type LevelFilter = 'alto' | 'medio' | 'bajo';

const LEVELS: LevelFilter[] = ['alto', 'medio', 'bajo'];

function daysAgo(iso: string | null): string | null {
  if (!iso) return null;
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff <= 0) return 'hoy';
  if (diff === 1) return 'hace 1 día';
  return `hace ${diff} días`;
}

// ─── KPI de resumen ──────────────────────────────────────────
const RiskKpi: React.FC<{
  label: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, value, color, icon: Icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-all',
      active ? 'border-transparent ring-2' : 'border-slate-200 hover:border-slate-300',
    )}
    style={active ? ({ ['--tw-ring-color' as string]: color } as React.CSSProperties) : undefined}
  >
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}1a` }}>
      <Icon className="h-4 w-4" style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-bold leading-tight" style={{ color }}>{value}</p>
      <p className="truncate text-[11px] text-slate-400">{label}</p>
    </div>
  </button>
);

// ─── Tarjeta de cliente en riesgo ────────────────────────────
const ClientCard: React.FC<{ shop: ClienteEnRiesgo }> = ({ shop }) => {
  const navigate = useNavigate();
  const lvl = shop.riskLevel === 'sano' ? LEVEL_STYLE.bajo : LEVEL_STYLE[shop.riskLevel];
  const lastMod = daysAgo(shop.metrics.lastModerationAt);

  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Barra de nivel */}
      <div className="w-1.5 flex-shrink-0" style={{ background: lvl.bar }} />

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 md:flex-row md:items-start md:gap-4">
        {/* Score */}
        <div className="flex flex-shrink-0 flex-row items-center gap-2 md:w-16 md:flex-col md:gap-0.5">
          <span className="text-2xl font-black leading-none" style={{ color: lvl.bar }}>{shop.riskScore}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: lvl.badgeBg, color: lvl.badgeText }}
          >
            {lvl.label}
          </span>
        </div>

        {/* Identidad + razones */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-bold text-slate-800">{shop.shopName}</span>
            {!shop.active && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">inactiva</span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            {shop.agreementName && (
              <span className="inline-flex items-center gap-1"><Handshake className="h-3 w-3" />{shop.agreementName}</span>
            )}
            {shop.region && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{shop.region}</span>
            )}
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{shop.ageDays} días de antigüedad</span>
            {shop.userEmail && <span className="truncate">{shop.userEmail}</span>}
          </div>

          {/* Razones */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {shop.reasons.map((r) => {
              const s = SEVERITY_STYLE[r.severity];
              return (
                <span
                  key={r.code}
                  title={r.detail}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
                  style={{ background: s.bg, color: s.text }}
                >
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: s.dot }} />
                  {r.label}
                  {r.detail && <span className="font-normal opacity-70">· {r.detail}</span>}
                </span>
              );
            })}
          </div>

          {/* Mini-métricas de catálogo */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Package className="h-3 w-3 text-slate-400" />
              {shop.metrics.approvedProducts}/{shop.metrics.totalProducts} aprobados
            </span>
            {shop.metrics.pendingProducts > 0 && <span>{shop.metrics.pendingProducts} en cola</span>}
            {shop.metrics.changesRequestedProducts > 0 && <span>{shop.metrics.changesRequestedProducts} con cambios</span>}
            {shop.metrics.rejectionEvents > 0 && <span>{shop.metrics.rejectionEvents} rechazos</span>}
            {lastMod && <span>últ. moderación {lastMod}</span>}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-shrink-0 flex-row gap-2 md:flex-col">
          <button
            type="button"
            onClick={() => navigate(`/backoffice/store-studio?shopId=${shop.shopId}`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: NAVY }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" style={{ color: ORANGE }} />
            Abrir tienda
          </button>
          {shop.userEmail && (
            <a
              href={`mailto:${shop.userEmail}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Mail className="h-3.5 w-3.5" />
              Escribir
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Tab principal ───────────────────────────────────────────

/**
 * Los datos y los filtros los inyecta GestionPage: son los mismos que alimentan
 * al resto de la pantalla y se controlan desde la única barra de filtros de
 * arriba. Esta pestaña ya no monta su propia barra ni su propia petición.
 */
export const GestionClientesRiesgoTab: React.FC<{
  data: ClientesEnRiesgoResponse | null;
  loading?: boolean;
  refetch: () => void;
  view: ViewFilters;
  onLevel: (level: string | undefined) => void;
}> = ({ data, loading, refetch, view, onLevel }) => {
  const levelFilter = LEVELS.includes(view.level as LevelFilter)
    ? (view.level as LevelFilter)
    : null;

  const atRiskShops = useMemo(
    () => (data?.shops ?? []).filter((s) => s.riskLevel !== 'sano'),
    [data],
  );

  /**
   * Universo de las tarjetas de nivel: todo lo que pasa los filtros MENOS el de
   * nivel. Así los números de arriba responden a lo que se está mirando (antes
   * eran siempre los totales del padrón, dijera lo que dijera el filtro) y a la
   * vez siguen funcionando como conmutador: cada tarjeta enseña cuántas caerían
   * si se pulsara.
   */
  const scoped = useMemo(() => {
    const q = (view.q ?? '').trim().toLowerCase();
    const reason = view.reason;
    return atRiskShops.filter((s) => {
      if (reason && !s.reasons.some((r) => r.code === reason)) return false;
      if (q && !(
        s.shopName.toLowerCase().includes(q) ||
        (s.userEmail ?? '').toLowerCase().includes(q) ||
        (s.region ?? '').toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [atRiskShops, view.q, view.reason]);

  const byLevel = useMemo(
    () => ({
      alto: scoped.filter((s) => s.riskLevel === 'alto').length,
      medio: scoped.filter((s) => s.riskLevel === 'medio').length,
      bajo: scoped.filter((s) => s.riskLevel === 'bajo').length,
    }),
    [scoped],
  );

  const filtered = useMemo(
    () =>
      levelFilter ? scoped.filter((s) => s.riskLevel === levelFilter) : scoped,
    [scoped, levelFilter],
  );

  const toggleLevel = (level: LevelFilter) =>
    onLevel(levelFilter === level ? undefined : level);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
        <AlertTriangle className="h-6 w-6" />
        <p className="text-sm">No se pudieron cargar los clientes en riesgo.</p>
        <button type="button" onClick={refetch} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          Reintentar
        </button>
      </div>
    );
  }

  const { summary } = data;
  // `scoped` ya trae los filtros de vista aplicados; `summary.atRisk` es el
  // padrón entero del corte global. Si difieren, se dicen las dos cifras.
  const narrowed = scoped.length !== summary.atRisk;

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Clientes en riesgo</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {narrowed ? (
              <>
                A quién llamar hoy — {scoped.length} de {summary.atRisk} en
                riesgo con estos filtros ({summary.totalShops} tiendas en la
                vista).
              </>
            ) : (
              <>
                A quién llamar hoy — {summary.atRisk} de {summary.totalShops}{' '}
                tiendas necesitan atención.
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Actualizar
        </button>
      </div>

      {/* KPIs por nivel — cuentan lo que hay en la vista, no el padrón, y
          además conmutan el filtro de nivel. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <RiskKpi label="En riesgo" value={scoped.length} color={NAVY} icon={AlertTriangle}
          active={levelFilter === null} onClick={() => onLevel(undefined)} />
        <RiskKpi label="Riesgo alto" value={byLevel.alto} color={LEVEL_STYLE.alto.bar} icon={ShieldAlert}
          active={levelFilter === 'alto'} onClick={() => toggleLevel('alto')} />
        <RiskKpi label="Riesgo medio" value={byLevel.medio} color={LEVEL_STYLE.medio.bar} icon={ShieldQuestion}
          active={levelFilter === 'medio'} onClick={() => toggleLevel('medio')} />
        <RiskKpi label="Riesgo bajo" value={byLevel.bajo} color={LEVEL_STYLE.bajo.bar} icon={ShieldCheck}
          active={levelFilter === 'bajo'} onClick={() => toggleLevel('bajo')} />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-14 text-slate-400">
          <ShieldCheck className="h-7 w-7 text-emerald-400" />
          <p className="text-sm font-medium text-slate-500">Sin clientes en riesgo con estos filtros</p>
          <p className="text-xs">Ajusta los filtros o actualiza los datos.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((shop) => (
            <ClientCard key={shop.shopId} shop={shop} />
          ))}
        </div>
      )}

      {/* Nota de confiabilidad */}
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
