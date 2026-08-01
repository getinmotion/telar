import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import type {
  AppliedFilters,
  GestionFilters,
  ShopStatusFilter,
  TiendasSaludResponse,
} from '@/services/gestion.actions';

/**
 * Filtros globales del tablero (Bloque "filtros globales" del brief).
 *
 * Compartida por /backoffice/dashboard y /backoffice/gestion, que tienen
 * lenguajes visuales distintos (glass morado vs. navy plano): por eso el
 * componente es neutro y cada pantalla le pasa su acento.
 *
 * Los selectores se pueblan desde las `facets` que devuelve el backend, no desde
 * una lista escrita a mano: región, departamento y municipio son texto libre sin
 * normalizar y el filtro es de igualdad exacta, así que ofrecer un valor que no
 * existe en la base daría siempre cero resultados.
 *
 * ESTA ES LA ÚNICA BARRA DE FILTROS de la pantalla. Las pestañas no montan la
 * suya: lo que necesita solo una pestaña (buscar por nombre, acotar por motivo
 * de riesgo) entra aquí por `viewControls` y se pinta en la misma fila. Tener
 * dos barras obligaba a adivinar cuál manda y dejaba controles repetidos —
 * "convenio" estaba en las dos, con estados independientes.
 */

/** Valor que pide "unidades productivas sin convenio". Lo entiende la API. */
export const NO_AGREEMENT = 'none';

/** Controles que aporta la pestaña activa. Se pintan en la misma barra. */
export interface ViewControls {
  /** Texto libre. Filtra en cliente sobre lo ya descargado. */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  /** Motivos de riesgo de la pestaña "Clientes en riesgo". */
  reason?: {
    value: string;
    onChange: (value: string | undefined) => void;
    options: { code: string; label: string; count: number }[];
  };
}

export interface TableroFiltersBarProps {
  filters: GestionFilters;
  onChange: (key: keyof GestionFilters, value: string | undefined) => void;
  onClear: () => void;
  facets?: TiendasSaludResponse['facets'];
  applied?: AppliedFilters;
  /** Color de acento de la pantalla anfitriona. */
  accent?: string;
  loading?: boolean;
  viewControls?: ViewControls;
  /**
   * Nº de filtros activos, globales + de vista. Lo calcula el anfitrión porque
   * es quien conoce los de vista; si no se pasa, se cuentan solo los globales.
   */
  activeCount?: number;
}

const SHOP_STATUS_OPTIONS: { value: ShopStatusFilter; label: string }[] = [
  { value: 'activa', label: 'Activas' },
  { value: 'en_riesgo', label: 'En riesgo' },
  { value: 'creada', label: 'Solo creadas' },
];

export const TableroFiltersBar: React.FC<TableroFiltersBarProps> = ({
  filters,
  onChange,
  onClear,
  facets,
  applied,
  accent = '#ec6d13',
  loading,
  viewControls,
  activeCount,
}) => {
  const globalCount = Object.values(filters).filter(
    (v) => v != null && String(v).trim() !== '',
  ).length;
  const count = activeCount ?? globalCount;

  const selectClass =
    'text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50';

  const search = viewControls?.search;
  const reason = viewControls?.reason;

  return (
    <div
      className="tablero-filtros rounded-xl border border-slate-200 bg-white/90 px-4 py-3"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Filter style={{ width: 13, height: 13, color: accent }} />
          Filtros
        </span>

        {search && (
          <div className="relative min-w-[180px] flex-1 basis-48">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? 'Buscar…'}
              aria-label={search.placeholder ?? 'Buscar'}
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0"
            />
          </div>
        )}

        <select
          className={selectClass}
          value={filters.agreementId ?? ''}
          disabled={loading}
          onChange={(e) => onChange('agreementId', e.target.value || undefined)}
          aria-label="Convenio"
        >
          <option value="">Todos los convenios</option>
          {(facets?.agreements ?? []).map((a) => (
            // Sin convenio necesita un valor propio: con value="" chocaba con
            // "Todos" y elegirlo no filtraba nada.
            <option key={a.id ?? NO_AGREEMENT} value={a.id ?? NO_AGREEMENT}>
              {a.name} ({a.count})
            </option>
          ))}
        </select>

        {/* Región va antes que departamento a propósito: el dato estructurado
            está casi vacío (24 de 172 UP con departamento) y la región de texto
            libre es lo que de verdad tiene la mayoría. */}
        <select
          className={selectClass}
          value={filters.region ?? ''}
          disabled={loading}
          onChange={(e) => onChange('region', e.target.value || undefined)}
          aria-label="Región"
        >
          <option value="">Todas las regiones</option>
          {(facets?.regions ?? []).map((r) => (
            <option key={r.value} value={r.value}>
              {r.value} ({r.count})
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={filters.department ?? ''}
          disabled={loading}
          onChange={(e) => onChange('department', e.target.value || undefined)}
          aria-label="Departamento"
        >
          <option value="">Todos los departamentos</option>
          {(facets?.departments ?? []).map((d) => (
            <option key={d.value} value={d.value}>
              {d.value} ({d.count})
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={filters.shopStatus ?? ''}
          disabled={loading}
          onChange={(e) => onChange('shopStatus', e.target.value || undefined)}
          aria-label="Estado de la unidad productiva"
        >
          <option value="">Cualquier estado</option>
          {SHOP_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {reason && (
          <select
            className={selectClass}
            value={reason.value}
            onChange={(e) => reason.onChange(e.target.value || undefined)}
            aria-label="Motivo de riesgo"
          >
            <option value="">Todos los motivos</option>
            {reason.options.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label} ({r.count})
              </option>
            ))}
          </select>
        )}

        <label className="flex items-center gap-1 text-xs text-slate-500">
          <span className="whitespace-nowrap">Creadas entre</span>
          <input
            type="date"
            className={selectClass}
            value={filters.from ?? ''}
            disabled={loading}
            onChange={(e) => onChange('from', e.target.value || undefined)}
            aria-label="Fecha de creación desde"
          />
          <span>y</span>
          <input
            type="date"
            className={selectClass}
            value={filters.to ?? ''}
            disabled={loading}
            onChange={(e) => onChange('to', e.target.value || undefined)}
            aria-label="Fecha de creación hasta"
          />
        </label>

        {count > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: `${accent}14`, color: accent }}
          >
            <X style={{ width: 11, height: 11 }} />
            Limpiar {count}
          </button>
        )}

        {applied && (
          <span className="ml-auto text-xs text-slate-500">
            <strong style={{ color: accent }}>{applied.matchedShops}</strong>{' '}
            unidades productivas en la vista
          </span>
        )}
      </div>

      {/* El rango filtra por fecha de creación, no por actividad. Si no se dice,
          se lee como "lo que pasó en esas fechas", que es otra cosa. */}
      {(filters.from || filters.to) && (
        <p className="mt-2 text-xs italic text-slate-400">
          El rango filtra unidades productivas por su fecha de creación
          (cohorte). Todas las cifras, incluidas las de producto, se calculan
          sobre esas unidades.
        </p>
      )}
    </div>
  );
};
