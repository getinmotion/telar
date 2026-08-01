import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GestionFilters } from '@/services/gestion.actions';

/**
 * Filtros del tablero sincronizados con la URL, en ambos sentidos.
 *
 * El brief lo pide explícitamente: "el estado de los filtros debe reflejarse en
 * la URL para poder compartir una vista filtrada". Hasta ahora el repo usaba
 * useSearchParams solo como deep-link de un parámetro leído al montar, y los
 * filtros de Gestión vivían en estado local, así que una vista filtrada no se
 * podía pasar a nadie.
 *
 * Se leen y escriben SOLO las claves conocidas: cualquier otro parámetro de la
 * URL (por ejemplo la tab activa) se conserva intacto.
 */

const FILTER_KEYS = [
  'agreementId',
  'region',
  'department',
  'municipality',
  'shopStatus',
  'from',
  'to',
] as const;

/**
 * Filtros de VISTA: acotan lo que ya se descargó, no la consulta. Viven en la
 * URL igual que los globales (una vista filtrada se comparte entera), pero NO se
 * mandan a la API: `q` es texto libre y `reason`/`level` son propiedades
 * derivadas en el cliente que el backend no expone como parámetro.
 */
const VIEW_KEYS = ['q', 'reason', 'level'] as const;

type FilterKey = (typeof FILTER_KEYS)[number];
type ViewKey = (typeof VIEW_KEYS)[number];

export type ViewFilters = Partial<Record<ViewKey, string>>;

export interface UseUrlFiltersResult {
  filters: GestionFilters;
  setFilter: (key: FilterKey, value: string | undefined) => void;
  /** Filtros de vista (cliente). Nunca llegan a la API. */
  view: ViewFilters;
  setView: (key: ViewKey, value: string | undefined) => void;
  /** Limpia globales y de vista: el botón "Limpiar" es uno solo. */
  clearFilters: () => void;
  activeCount: number;
  /** Etiqueta legible del rango, para el encabezado y la impresión. */
  rangeLabel: string | null;
}

export function useUrlFilters(): UseUrlFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<GestionFilters>(() => {
    const out: Record<string, string> = {};
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value && value.trim() !== '') out[key] = value;
    }
    return out as GestionFilters;
  }, [searchParams]);

  const view = useMemo<ViewFilters>(() => {
    const out: ViewFilters = {};
    for (const key of VIEW_KEYS) {
      const value = searchParams.get(key);
      if (value && value.trim() !== '') out[key] = value;
    }
    return out;
  }, [searchParams]);

  const writeParam = useCallback(
    (key: string, value: string | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value && value.trim() !== '') next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string | undefined) => writeParam(key, value),
    [writeParam],
  );

  const setView = useCallback(
    (key: ViewKey, value: string | undefined) => writeParam(key, value),
    [writeParam],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        // Solo las claves de filtro: la tab activa y cualquier deep-link siguen.
        for (const key of FILTER_KEYS) next.delete(key);
        for (const key of VIEW_KEYS) next.delete(key);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const activeCount = Object.keys(filters).length + Object.keys(view).length;

  const rangeLabel = useMemo(() => {
    if (!filters.from && !filters.to) return null;
    const fmt = (d: string) =>
      new Date(`${d}T12:00:00`).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    if (filters.from && filters.to)
      return `${fmt(filters.from)} – ${fmt(filters.to)}`;
    if (filters.from) return `desde ${fmt(filters.from)}`;
    return `hasta ${fmt(filters.to!)}`;
  }, [filters.from, filters.to]);

  return {
    filters,
    setFilter,
    view,
    setView,
    clearFilters,
    activeCount,
    rangeLabel,
  };
}
