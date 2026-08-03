import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Share2,
  HeartPulse,
  Package,
  Store,
  AlertTriangle,
  Inbox,
  ShieldAlert,
} from 'lucide-react';
import { TaxonomyGrafoTab } from '@/components/backoffice/taxonomy/TaxonomyGrafoTab';
import { GestionClientesRiesgoTab } from '@/components/backoffice/gestion/GestionClientesRiesgoTab';
import { GestionBacklogTab } from '@/components/backoffice/gestion/GestionBacklogTab';
import { GestionTaxonomiaTab } from '@/components/backoffice/gestion/GestionTaxonomiaTab';
import { GestionProductosTab } from '@/components/backoffice/gestion/GestionProductosTab';
import { GestionTiendasTab } from '@/components/backoffice/gestion/GestionTiendasTab';
import { GestionSanidadTab } from '@/components/backoffice/gestion/GestionSanidadTab';
import { TableroFiltersBar } from '@/components/backoffice/TableroFiltersBar';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useTableroData } from '@/hooks/useTableroData';
import { cn } from '@/lib/utils';

/**
 * Gestión — capa de ANÁLISIS (nunca modera).
 *
 * Analítica dividida por dominio:
 *  · Hoy        — clientes en riesgo, backlog y sanidad de datos (lo accionable).
 *  · Productos  — salud y detección del catálogo.
 *  · Tiendas    — salud y onboarding.
 *  · Taxonomías — salud y mapa de relaciones.
 *
 * Los filtros globales viven en la URL y aplican a toda la pantalla, con la
 * misma forma que en el tablero institucional: el mismo corte tiene que dar el
 * mismo número en las dos pantallas.
 */

const NAVY = '#142239';
const ORANGE = '#ec6d13';

type TabKey =
  | 'clientes-riesgo'
  | 'backlog'
  | 'sanidad'
  | 'prod-salud'
  | 'tiendas-overview'
  | 'tax-health'
  | 'tax-grafo';

const TABS: {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  group: string;
}[] = [
  { key: 'clientes-riesgo', label: 'Clientes en riesgo', icon: AlertTriangle, group: 'Hoy' },
  { key: 'sanidad', label: 'Sanidad de datos', icon: ShieldAlert, group: 'Hoy' },
  { key: 'backlog', label: 'Backlog de moderación', icon: Inbox, group: 'Hoy' },
  { key: 'prod-salud', label: 'Salud y detección', icon: Package, group: 'Productos' },
  { key: 'tiendas-overview', label: 'Resumen', icon: Store, group: 'Tiendas' },
  { key: 'tax-health', label: 'Salud y detección', icon: HeartPulse, group: 'Taxonomías' },
  { key: 'tax-grafo', label: 'Mapa de relaciones', icon: Share2, group: 'Taxonomías' },
];

const TAB_KEYS = new Set(TABS.map((t) => t.key));

// Orden de grupos preservando la primera aparición en TABS.
const GROUP_ORDER = [...new Set(TABS.map((t) => t.group))];

export default function GestionPage() {
  // La tab también vive en la URL, para que el enlace profundo desde el tablero
  // institucional ("trabajar en Gestión") caiga en el panel correcto.
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tab: TabKey =
    rawTab && TAB_KEYS.has(rawTab as TabKey)
      ? (rawTab as TabKey)
      : 'clientes-riesgo';

  const setTab = (key: TabKey) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', key);
        // Los filtros de vista pertenecen a la pestaña que los ofrece. Si
        // sobrevivieran al cambio, el contador de "Limpiar" seguiría subiendo
        // por controles que ya no están a la vista.
        for (const viewKey of ['q', 'reason', 'level']) next.delete(viewKey);
        return next;
      },
      { replace: true },
    );
  };

  const { filters, setFilter, view, setView, clearFilters, activeCount } =
    useUrlFilters();
  // Una sola carga para toda la pantalla: es lo que garantiza que las pestañas
  // no muestren cifras de dos universos distintos.
  const { salud, sanidad, clientes, loading, refetch } =
    useTableroData(filters);

  // Los controles que aporta la pestaña activa se pintan en la barra de arriba,
  // no en una segunda barra dentro del contenido.
  const viewControls =
    tab === 'clientes-riesgo'
      ? {
          search: {
            value: view.q ?? '',
            onChange: (v: string) => setView('q', v || undefined),
            placeholder: 'Buscar tienda, email o región…',
          },
          reason: {
            value: view.reason ?? '',
            onChange: (v: string | undefined) => setView('reason', v),
            options: clientes?.summary.byReason ?? [],
          },
        }
      : undefined;

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-[#f5f0ec]"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Header */}
      <header className="flex flex-shrink-0 items-center gap-2.5 border-b border-slate-200 bg-white px-5 py-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: NAVY }}
        >
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Gestión</p>
          <p className="text-[11px] text-slate-400">Analítica y salud — no modera</p>
        </div>
        {salud?.generatedAt && (
          <span className="ml-auto text-[10px] text-slate-400">
            Actualizado{' '}
            {new Date(salud.generatedAt).toLocaleString('es-CO', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </header>

      {/* Tab bar — agrupada por dominio */}
      <div className="flex flex-shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
        {GROUP_ORDER.map((group, gi) => (
          <React.Fragment key={group}>
            {gi > 0 && <span className="mx-1 h-5 w-px flex-shrink-0 bg-slate-200" />}
            <span className="px-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {group}
            </span>
            {TABS.filter((t) => t.group === group).map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors',
                    active ? 'text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700',
                  )}
                  style={active ? { background: NAVY } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" style={active ? { color: ORANGE } : undefined} />
                  {label}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Filtros globales — aplican a toda la pantalla */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-[#f5f0ec] px-6 py-3">
        <TableroFiltersBar
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
          facets={salud?.facets}
          applied={salud?.filters}
          accent={ORANGE}
          loading={loading}
          viewControls={viewControls}
          activeCount={activeCount}
        />
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'clientes-riesgo' && (
          <GestionClientesRiesgoTab
            data={clientes}
            loading={loading}
            refetch={refetch}
            view={view}
            onLevel={(level) => setView('level', level)}
          />
        )}
        {tab === 'sanidad' && (
          <GestionSanidadTab sanidad={sanidad} filters={filters} loading={loading} />
        )}
        {tab === 'backlog' && <GestionBacklogTab filters={filters} />}
        {tab === 'prod-salud' && <GestionProductosTab />}
        {tab === 'tiendas-overview' && <GestionTiendasTab filters={filters} />}
        {tab === 'tax-health' && <GestionTaxonomiaTab />}
        {tab === 'tax-grafo' && <TaxonomyGrafoTab />}
      </div>
    </div>
  );
}
