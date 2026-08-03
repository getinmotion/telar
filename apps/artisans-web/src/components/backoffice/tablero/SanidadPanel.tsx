import React, { useCallback, useState } from 'react';
import { ChevronDown, ChevronRight, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getSanidadDatos,
  type GestionFilters,
  type SanidadItem,
  type SanidadLine,
  type SanidadProductItem,
  type SanidadUpItem,
} from '@/services/gestion.actions';
import { dateSuffix, exportCsv } from '@/utils/exportCsv';

/**
 * Bloque 4 del brief: panel de sanidad de datos. El centro de gravedad de la
 * vista, porque es lo único accionable.
 *
 * Cada línea muestra conteo, porcentaje sobre SU denominador, el listado nominal
 * de las unidades o productos pendientes y la exportación a CSV. Si no es
 * accionable no sirve, así que cada fila del listado enlaza al sitio donde se
 * arregla.
 *
 * Los porcentajes de líneas de distinto nivel no son comparables: una línea de
 * unidades productivas tiene base ~172 y una de productos ~600. Por eso el
 * denominador se escribe al lado de cada porcentaje en vez de dejarlo implícito.
 */

const SEV_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  alta: { bg: 'rgba(220,38,38,0.08)', fg: '#dc2626', label: 'Alta' },
  media: { bg: 'rgba(236,109,19,0.10)', fg: '#c2560f', label: 'Media' },
  baja: { bg: 'rgba(100,116,139,0.10)', fg: '#475569', label: 'Baja' },
};

const isUpItem = (i: SanidadItem): i is SanidadUpItem => i.kind === 'up';

interface Props {
  summary: SanidadLine[];
  filters: GestionFilters;
  loading?: boolean;
  /** Modo compacto: solo las N líneas más graves, sin drill-down. */
  compact?: number;
  accent?: string;
  onVerTodo?: () => void;
}

const IssueRow: React.FC<{
  line: SanidadLine;
  filters: GestionFilters;
  accent: string;
}> = ({ line, filters, accent }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SanidadItem[] | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const navigate = useNavigate();
  const sev = SEV_STYLE[line.severity] ?? SEV_STYLE.baja;

  const fetchItems = useCallback(
    async (limit: number): Promise<SanidadItem[]> => {
      const res = await getSanidadDatos(filters, { issue: line.code, limit });
      return res.detail?.items ?? [];
    },
    [filters, line.code],
  );

  const toggle = useCallback(async () => {
    const next = !open;
    setOpen(next);
    if (next && items === null) {
      setLoadingItems(true);
      try {
        setItems(await fetchItems(50));
      } catch {
        toast.error('No se pudo cargar el listado');
        setOpen(false);
      } finally {
        setLoadingItems(false);
      }
    }
  }, [open, items, fetchItems]);

  const handleExport = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        // Se traen todos (tope del backend 500), no solo los 50 visibles: un CSV
        // truncado en silencio es peor que no tener CSV.
        const all = await fetchItems(500);
        const filename = `sanidad-${line.code}-${dateSuffix()}`;
        if (line.level === 'up') {
          exportCsv(filename, all.filter(isUpItem), [
            { header: 'Unidad productiva', value: (r) => r.shopName },
            { header: 'Estado', value: (r) => r.derivedState },
            { header: 'Convenio', value: (r) => r.agreementName ?? 'Sin convenio' },
            { header: 'Departamento', value: (r) => r.department ?? '' },
            { header: 'Municipio', value: (r) => r.municipality ?? '' },
            { header: 'Región (texto libre)', value: (r) => r.region ?? '' },
            { header: 'Qué falta', value: (r) => r.missing.map((m) => m.label).join('; ') },
            { header: 'ID', value: (r) => r.shopId },
          ]);
        } else {
          exportCsv(filename, all.filter((i): i is SanidadProductItem => i.kind === 'producto'), [
            { header: 'Producto', value: (r) => r.productName },
            { header: 'Estado', value: (r) => r.status },
            { header: 'Unidad productiva', value: (r) => r.shopName },
            { header: 'Departamento', value: (r) => r.department ?? '' },
            { header: 'Municipio', value: (r) => r.municipality ?? '' },
            { header: 'ID producto', value: (r) => r.productId },
            { header: 'ID tienda', value: (r) => r.shopId },
          ]);
        }
        if (all.length < line.count) {
          toast.info(
            `Se exportaron ${all.length} de ${line.count}. El listado nominal está limitado a 500 filas por consulta.`,
          );
        }
      } catch {
        toast.error('No se pudo exportar');
      }
    },
    [fetchItems, line],
  );

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={toggle}
        className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        )}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: sev.bg, color: sev.fg }}
        >
          {sev.label}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-800">
            {line.label}
          </span>
          <span className="block text-xs text-slate-500">{line.hint}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-lg font-extrabold leading-none text-slate-900">
            {line.count.toLocaleString('es-CO')}
          </span>
          <span className="block text-[10px] text-slate-500">
            {line.pct}% de {line.denominator.toLocaleString('es-CO')}{' '}
            {line.denominatorLabel}
          </span>
        </span>
        {line.count > 0 && (
          <span
            onClick={handleExport}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleExport(e as never)}
            aria-label={`Exportar ${line.label} a CSV`}
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 print:hidden"
          >
            <Download className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="pb-3 pl-10 pr-2">
          {line.reliability && (
            <p className="mb-2 text-[11px] italic text-slate-400">
              {line.reliability}
            </p>
          )}
          {loadingItems && (
            <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando listado…
            </div>
          )}
          {!loadingItems && items && items.length === 0 && (
            <p className="py-2 text-xs text-slate-500">Sin pendientes.</p>
          )}
          {!loadingItems && items && items.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => {
                if (isUpItem(item)) {
                  return (
                    <li
                      key={item.shopId}
                      className="flex items-center gap-2 py-1.5 text-xs"
                    >
                      <button
                        onClick={() =>
                          navigate(
                            `/backoffice/store-studio?shopId=${item.shopId}`,
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left hover:underline"
                        style={{ color: accent }}
                      >
                        <span className="truncate font-semibold">
                          {item.shopName}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                      </button>
                      <span className="hidden shrink-0 text-slate-400 sm:inline">
                        {[item.municipality, item.department]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </span>
                      {item.missing.length > 0 && (
                        <span className="shrink-0 text-slate-500">
                          {item.missing.map((m) => m.label).join(' · ')}
                        </span>
                      )}
                    </li>
                  );
                }
                return (
                  <li
                    key={item.productId}
                    className="flex items-center gap-2 py-1.5 text-xs"
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/backoffice/studio?shopId=${item.shopId}&productId=${item.productId}`,
                        )
                      }
                      className="flex min-w-0 flex-1 items-center gap-1.5 text-left hover:underline"
                      style={{ color: accent }}
                    >
                      <span className="truncate font-semibold">
                        {item.productName}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                    </button>
                    <span className="shrink-0 truncate text-slate-400">
                      {item.shopName}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {items && line.count > items.length && (
            <p className="mt-2 text-[11px] text-slate-400">
              Se muestran {items.length} de {line.count}. Exporta el CSV para el
              listado completo.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const SanidadPanel: React.FC<Props> = ({
  summary,
  filters,
  loading,
  compact,
  accent = '#ec6d13',
  onVerTodo,
}) => {
  if (loading) {
    return (
      <div className="h-52 rounded-xl border border-slate-200 bg-slate-50" />
    );
  }

  // Las líneas en cero no se pintan: una lista de problemas que no existen
  // distrae de los que sí.
  const withIssues = summary.filter((l) => l.count > 0);
  const lines = compact ? withIssues.slice(0, compact) : withIssues;

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm font-semibold text-slate-600">
          Sin brechas de datos en este corte.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4">
      {lines.map((line) => (
        <IssueRow
          key={line.code}
          line={line}
          filters={filters}
          accent={accent}
        />
      ))}
      {compact && withIssues.length > lines.length && onVerTodo && (
        <button
          onClick={onVerTodo}
          className="w-full py-3 text-xs font-bold print:hidden"
          style={{ color: accent }}
        >
          Ver las {withIssues.length} brechas en Gestión →
        </button>
      )}
    </div>
  );
};
