import React from 'react';
import { Download } from 'lucide-react';
import type { CatalogoComposicionResponse } from '@/services/gestion.actions';
import { SANS, SERIF, lc } from '@/components/dashboard/dashboardStyles';
import { dateSuffix, exportCsv } from '@/utils/exportCsv';

/**
 * Bloque 3 del brief: composición del catálogo.
 *
 * Nota del brief que se respeta al pie de la letra: el precio es un dato de
 * COMPOSICIÓN DE CATÁLOGO, no de venta. Se presenta como estructura de oferta y
 * en ningún punto se infiere ni se proyecta ingreso a partir de él.
 */

const PURPLE = '#7c3aed';
const NAVY = '#151b2d';

const STATUS_COLOR: Record<string, string> = {
  approved: '#166534',
  approved_with_edits: '#4d7c0f',
  pending_moderation: PURPLE,
  changes_requested: '#a78bfa',
  draft: 'rgba(84,67,62,0.28)',
  rejected: '#dc2626',
  archived: 'rgba(84,67,62,0.18)',
};

/** Los importes vienen en centavos de COP. */
function cop(minor: number | null | undefined): string {
  if (minor == null) return '—';
  return `$${Math.round(minor / 100).toLocaleString('es-CO')}`;
}

const Bar: React.FC<{
  label: string;
  value: number;
  total: number;
  color: string;
  suffix?: string;
}> = ({ label, value, total, color, suffix }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 9 }}>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span style={{ ...lc(0.42), fontSize: 9 }}>{label}</span>
        <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 800, color: NAVY }}>
          {value.toLocaleString('es-CO')}
          {suffix && (
            <span style={{ fontWeight: 500, color: 'rgba(84,67,62,0.45)' }}> {suffix}</span>
          )}
        </span>
      </div>
      <div style={{ height: 5, background: 'rgba(84,67,62,0.08)', borderRadius: 999 }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 999,
            transition: 'width .6s ease',
          }}
        />
      </div>
    </div>
  );
};

const Panel: React.FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, action, children }) => (
  <section>
    <div className="mb-4 flex items-center gap-3">
      <span className="flex items-center gap-1.5">
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: PURPLE,
            display: 'inline-block',
          }}
        />
        <span style={{ ...lc(0.45), fontSize: 10 }}>{title}</span>
      </span>
      <div style={{ flex: 1, height: 1, background: `${PURPLE}22` }} />
      {action}
    </div>
    <div
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.65)',
        borderRadius: 24,
        boxShadow: '0 4px 20px rgba(21,27,45,0.03)',
        padding: '22px 26px',
      }}
    >
      {children}
    </div>
  </section>
);

const CsvButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 rounded-full px-2.5 py-1 print:hidden"
    style={{
      background: 'rgba(124,58,237,0.08)',
      border: `1px solid ${PURPLE}22`,
      color: PURPLE,
      fontFamily: SANS,
      fontSize: 10,
      fontWeight: 700,
    }}
  >
    <Download style={{ width: 11, height: 11 }} />
    CSV
  </button>
);

export const CatalogoComposicion: React.FC<{
  data: CatalogoComposicionResponse | null;
  loading?: boolean;
}> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div
        style={{
          height: 220,
          borderRadius: 24,
          background: 'rgba(20,34,57,0.04)',
          border: '1px solid rgba(20,34,57,0.06)',
        }}
      />
    );
  }

  const totalProducts = data.byStatus.reduce((s, x) => s + x.count, 0);
  const topCategories = data.byCategory.slice(0, 8);
  const topCrafts = data.byCraft.slice(0, 8);
  const maxCategory = topCategories[0]?.count ?? 0;
  const maxCraft = topCrafts[0]?.count ?? 0;
  const { overall, distribution, byCategory: priceByCategory } = data.price;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title="Productos por estado"
          action={
            <CsvButton
              onClick={() =>
                exportCsv(`catalogo-por-estado-${dateSuffix()}`, data.byStatus, [
                  { header: 'Estado', value: (r) => r.label },
                  { header: 'Productos', value: (r) => r.count },
                  { header: '% del catálogo', value: (r) => r.pct },
                ])
              }
            />
          }
        >
          {data.byStatus.map((s) => (
            <Bar
              key={s.status}
              label={s.label}
              value={s.count}
              total={totalProducts}
              color={STATUS_COLOR[s.status] ?? PURPLE}
              suffix={`· ${s.pct}%`}
            />
          ))}
          <div
            className="mt-4 flex items-baseline justify-between pt-4"
            style={{ borderTop: '1px solid rgba(84,67,62,0.08)' }}
          >
            <span style={{ fontFamily: SERIF, fontSize: 12, fontStyle: 'italic', color: 'rgba(84,67,62,0.45)' }}>
              Total en el catálogo filtrado
            </span>
            <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: PURPLE }}>
              {totalProducts.toLocaleString('es-CO')}
            </span>
          </div>
        </Panel>

        <Panel
          title="Oferta por oficio"
          action={
            <CsvButton
              onClick={() =>
                exportCsv(`catalogo-por-oficio-${dateSuffix()}`, data.byCraft, [
                  { header: 'Oficio', value: (r) => r.name },
                  { header: 'Productos aprobados', value: (r) => r.count },
                  { header: '% de aprobados', value: (r) => r.pct },
                ])
              }
            />
          }
        >
          {topCrafts.map((c) => (
            <Bar
              key={c.id ?? c.name}
              label={c.name}
              value={c.count}
              total={maxCraft}
              color={PURPLE}
              suffix={`· ${c.pct}%`}
            />
          ))}
          {data.byCraft.length > 8 && (
            <p style={{ ...lc(0.3), fontSize: 8, marginTop: 8 }}>
              Se muestran los 8 principales de {data.byCraft.length}. El CSV los trae todos.
            </p>
          )}
        </Panel>
      </div>

      <Panel
        title="Oferta por categoría"
        action={
          <CsvButton
            onClick={() =>
              exportCsv(`catalogo-por-categoria-${dateSuffix()}`, data.byCategory, [
                { header: 'Categoría', value: (r) => r.name },
                { header: 'Productos aprobados', value: (r) => r.count },
                { header: '% de aprobados', value: (r) => r.pct },
              ])
            }
          />
        }
      >
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {topCategories.map((c) => (
            <Bar
              key={c.id ?? c.name}
              label={c.name}
              value={c.count}
              total={maxCategory}
              color={PURPLE}
              suffix={`· ${c.pct}%`}
            />
          ))}
        </div>
      </Panel>

      <Panel
        title="Estructura de precios del catálogo"
        action={
          <CsvButton
            onClick={() =>
              exportCsv(`precios-por-categoria-${dateSuffix()}`, priceByCategory, [
                { header: 'Categoría', value: (r) => r.name },
                { header: 'Productos con precio', value: (r) => r.observations },
                { header: 'Promedio (COP)', value: (r) => Math.round(r.avgMinor / 100) },
                { header: 'Mínimo (COP)', value: (r) => Math.round(r.minMinor / 100) },
                { header: 'Máximo (COP)', value: (r) => Math.round(r.maxMinor / 100) },
              ])
            }
          />
        }
      >
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Precio promedio', value: cop(overall.avgMinor) },
            { label: 'Mediana', value: cop(overall.medianMinor) },
            { label: 'Mínimo', value: cop(overall.minMinor) },
            { label: 'Máximo', value: cop(overall.maxMinor) },
          ].map((k) => (
            <div
              key={k.label}
              style={{
                background: 'rgba(124,58,237,0.04)',
                border: '1px solid rgba(124,58,237,0.08)',
                borderRadius: 14,
                padding: '13px 15px',
              }}
            >
              <p style={{ ...lc(0.4), fontSize: 8, marginBottom: 5 }}>{k.label}</p>
              <p style={{ fontFamily: SANS, fontSize: 19, fontWeight: 800, color: NAVY, lineHeight: 1 }}>
                {k.value}
              </p>
            </div>
          ))}
        </div>

        <p style={{ ...lc(0.4), fontSize: 8, marginBottom: 10 }}>
          Distribución por rango de precio
        </p>
        {distribution.map((d) => (
          <Bar
            key={d.bucket}
            label={d.bucket}
            value={d.count}
            total={overall.observations}
            color={PURPLE}
            suffix={`· ${d.pct}%`}
          />
        ))}

        <p
          style={{
            fontFamily: SERIF,
            fontSize: 11.5,
            fontStyle: 'italic',
            color: 'rgba(84,67,62,0.45)',
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          Es un dato de composición de catálogo, no de venta: describe la
          estructura de la oferta del programa. Cada producto aporta una sola
          observación, su precio más bajo entre variantes activas.{' '}
          {overall.observations.toLocaleString('es-CO')} productos aprobados con
          precio
          {data.price.excludedNoPrice > 0 && (
            <>
              {' '}· {data.price.excludedNoPrice} aprobados quedan fuera por no
              tener precio definido
            </>
          )}
          .
        </p>
      </Panel>
    </div>
  );
};
