import React from 'react';
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import type { GestionFilters, SanidadResponse } from '@/services/gestion.actions';
import { SanidadPanel } from '@/components/backoffice/tablero/SanidadPanel';
import { StatTile } from './StatTile';

/**
 * Bloque 4 del brief, versión completa y accionable.
 *
 * En el tablero institucional este panel se muestra en modo compacto (las seis
 * brechas más graves, sin drill-down): allí la pregunta es cuán grande es el
 * problema. Aquí se muestra entero y con listado nominal, porque esta es la
 * pantalla donde se trabaja.
 *
 * La regla de privacidad del brief se cumple aguas arriba: el backend solo
 * devuelve presencia y estado de verificación, nunca el número de cuenta ni el
 * documento.
 */

const NAVY = '#142239';
const ORANGE = '#ec6d13';

interface Props {
  sanidad: SanidadResponse | null;
  filters: GestionFilters;
  loading?: boolean;
}

export const GestionSanidadTab: React.FC<Props> = ({
  sanidad,
  filters,
  loading,
}) => {
  if (loading && !sanidad) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando sanidad de datos…
      </div>
    );
  }

  const summary = sanidad?.summary ?? [];
  const upLines = summary.filter((l) => l.level === 'up');
  const prodLines = summary.filter((l) => l.level === 'producto');
  const conBrechas = summary.filter((l) => l.count > 0);
  const altas = conBrechas.filter((l) => l.severity === 'alta');

  const upDenominator = upLines[0]?.denominator ?? 0;
  const prodDenominator =
    prodLines.find((l) => l.denominatorLabel === 'productos')?.denominator ?? 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={AlertTriangle}
          value={String(altas.length)}
          label="Brechas de severidad alta"
          accent={altas.length > 0}
        />
        <StatTile
          icon={ShieldCheck}
          value={String(conBrechas.length)}
          label={`Brechas abiertas de ${summary.length}`}
        />
        <StatTile
          value={String(upDenominator)}
          label="Unidades productivas en la vista"
        />
        <StatTile value={String(prodDenominator)} label="Productos en la vista" />
      </div>

      <section>
        <div className="mb-2 flex items-baseline gap-2">
          <h3 className="text-sm font-bold" style={{ color: NAVY }}>
            A nivel de unidad productiva
          </h3>
          <span className="text-[11px] text-slate-400">
            sobre {upDenominator} unidades
          </span>
        </div>
        <SanidadPanel
          summary={upLines}
          filters={filters}
          loading={loading}
          accent={ORANGE}
        />
      </section>

      <section>
        <div className="mb-2 flex items-baseline gap-2">
          <h3 className="text-sm font-bold" style={{ color: NAVY }}>
            A nivel de producto
          </h3>
          <span className="text-[11px] text-slate-400">
            cada línea con su propio denominador
          </span>
        </div>
        <SanidadPanel
          summary={prodLines}
          filters={filters}
          loading={loading}
          accent={ORANGE}
        />
      </section>

      {sanidad && sanidad.caveats.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Cómo leer estas cifras
          </p>
          <ul className="space-y-1">
            {sanidad.caveats.map((c, i) => (
              <li key={i} className="text-[11px] leading-relaxed text-slate-500">
                · {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
