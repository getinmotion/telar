import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Map as MapIcon, Printer } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useTableroData } from '@/hooks/useTableroData';
import { TableroFiltersBar } from '@/components/backoffice/TableroFiltersBar';
import { MetricCards } from '@/components/backoffice/tablero/MetricCards';
import { CatalogoComposicion } from '@/components/backoffice/tablero/CatalogoComposicion';
import { SanidadPanel } from '@/components/backoffice/tablero/SanidadPanel';
import { UnidadesMap } from '@/components/backoffice/tablero/UnidadesMap';
import {
  SANS,
  SERIF,
  lc,
  PURPLE,
  PURPLE_DARK,
  PURPLE_MID,
} from '@/components/dashboard/dashboardStyles';
import { dateSuffix, exportCsv } from '@/utils/exportCsv';

/**
 * Tablero institucional — vista de nivel Ministerio.
 *
 * Responde tres preguntas en una sola pantalla: cuántos beneficiarios están
 * realmente activos, dónde están, y qué está frenando la activación. Todo lo
 * demás va en drill-down.
 *
 * Es de SOLO LECTURA: no edita información de la unidad productiva ni de
 * producto, y no muestra ningún dato financiero ni de identificación personal.
 *
 * Fuera de alcance por decisión de negocio (propuesta v9): ventas totales, por
 * tienda, ticket promedio, conversión y productos más vendidos. La activación
 * comercial comprometida se mide por productos publicados y activos, no por
 * venta.
 */

const NAVY = '#151b2d';

function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? email;
  return raw.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const SectionLabel: React.FC<{
  text: string;
  right?: React.ReactNode;
}> = ({ text, right }) => (
  <div className="mb-5 flex items-center gap-3">
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
      <span style={{ ...lc(0.45), fontSize: 10 }}>{text}</span>
    </span>
    <div style={{ flex: 1, height: 1, background: `${PURPLE}22` }} />
    {right}
  </div>
);

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.65)',
  borderRadius: 28,
  boxShadow: '0 4px 20px rgba(21,27,45,0.03)',
};

const BackofficeDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { filters, setFilter, clearFilters, rangeLabel } = useUrlFilters();
  const { salud, catalogo, sanidad, clientes, loading } = useTableroData(filters);

  const name = getFirstName(user?.email ?? '');

  const generatedAt = salud?.generatedAt ?? null;
  const updatedLabel = useMemo(() => {
    if (!generatedAt) return null;
    return new Date(generatedAt).toLocaleString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [generatedAt]);

  const funnel = salud?.funnel ?? [];
  const totalShops = salud?.totalShops ?? 0;
  const pct = (n: number) => (totalShops > 0 ? Math.round((n / totalShops) * 100) : 0);

  const filtersSummary = useMemo(() => {
    const parts: string[] = [];
    const applied = salud?.filters;
    if (applied?.agreementId) {
      const found = salud?.facets.agreements.find(
        (a) => a.id === applied.agreementId,
      );
      parts.push(`Convenio: ${found?.name ?? applied.agreementId}`);
    }
    if (applied?.department) parts.push(`Departamento: ${applied.department}`);
    if (applied?.shopStatus) parts.push(`Estado: ${applied.shopStatus}`);
    if (rangeLabel) parts.push(`Creadas ${rangeLabel}`);
    return parts.length > 0 ? parts.join(' · ') : 'Sin filtros: todo el padrón';
  }, [salud, rangeLabel]);

  return (
    <div
      className="tablero-root"
      style={{
        backgroundColor: '#f9f7f2',
        backgroundImage: `
          radial-gradient(circle at top left, rgba(167,139,250,0.2) 0%, transparent 40%),
          radial-gradient(circle at bottom right, rgba(187,247,208,0.18) 0%, transparent 44%),
          radial-gradient(circle at top right, rgba(255,244,223,0.7) 0%, transparent 36%)
        `,
        backgroundAttachment: 'fixed',
        fontFamily: SANS,
        minHeight: '100vh',
      }}
    >
      {/* Estilos de impresión: el brief pide que todo bloque sea exportable a
          PDF para el reporte de impacto formal. Se resuelve con Imprimir →
          Guardar como PDF, sin dependencias nuevas. */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 14mm; }
          .tablero-root {
            background: white !important;
            background-image: none !important;
            min-height: 0 !important;
          }
          .print\\:hidden, .tablero-filtros { display: none !important; }
          .tablero-print-header { display: block !important; }
          .tablero-card, .tablero-root section > div {
            background: white !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            break-inside: avoid;
          }
          section { break-inside: avoid; }
          header { position: static !important; }
        }
        .tablero-print-header { display: none; }
      `}</style>

      {/* Encabezado sticky en pantalla */}
      <header
        className="sticky top-0 z-30 px-6 py-4 print:hidden"
        style={{
          background: 'rgba(249,247,242,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(84,67,62,0.08)',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/backoffice/home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
              aria-label="Volver"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(84,67,62,0.4)' }}>
                arrow_back
              </span>
            </button>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(76,29,149,0.1) 100%)',
                border: '1px solid rgba(124,58,237,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17, color: PURPLE }}>
                monitoring
              </span>
            </div>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>
                Tablero institucional
              </p>
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, color: 'rgba(84,67,62,0.55)', marginTop: 1 }}>
                Vista de programa · {name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {updatedLabel && (
              <span style={{ ...lc(0.35), fontSize: 8, textAlign: 'right' }}>
                Actualizado
                <br />
                {updatedLabel}
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full px-3 py-2"
              style={{
                background: 'rgba(124,58,237,0.08)',
                border: `1px solid ${PURPLE}33`,
                color: PURPLE_DARK,
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Printer style={{ width: 13, height: 13 }} />
              PDF
            </button>
          </div>
        </div>
      </header>

      {/* Encabezado solo para el papel: sin esto, el PDF del reporte de impacto
          no dice a qué corte corresponden las cifras. */}
      <div className="tablero-print-header" style={{ marginBottom: 18 }}>
        <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: NAVY }}>
          Tablero institucional · Programa artesanal
        </p>
        <p style={{ fontFamily: SANS, fontSize: 11, color: '#475569', marginTop: 4 }}>
          {filtersSummary}
        </p>
        {updatedLabel && (
          <p style={{ fontFamily: SANS, fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
            Datos actualizados: {updatedLabel}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        <TableroFiltersBar
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
          facets={salud?.facets}
          applied={salud?.filters}
          accent={PURPLE}
          loading={loading}
        />

        {/* ── Bloque 1 · Tarjetas de estado ───────────────────────── */}
        <section>
          <SectionLabel text="Estado del programa" />
          <MetricCards
            cards={salud?.cards ?? []}
            definitions={salud?.definitions ?? []}
            loading={loading}
          />
        </section>

        {/* ── Bloque 2 · Mapa geográfico ──────────────────────────── */}
        <section>
          <SectionLabel
            text="Dónde está el programa"
            right={
              <span style={{ ...lc(0.3), fontSize: 9 }}>
                {clientes?.shops.length ?? 0} unidades productivas
              </span>
            }
          />
          <div style={{ ...glassCard, padding: '20px 24px' }}>
            <div className="mb-3 flex items-center gap-2">
              <MapIcon style={{ width: 15, height: 15, color: PURPLE }} />
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: NAVY }}>
                Distribución territorial
              </span>
            </div>
            <UnidadesMap
              shops={clientes?.shops ?? []}
              unmappable={clientes?.unmappable}
              height={420}
            />
          </div>
        </section>

        {/* ── Bloque 4 · Sanidad de datos ─────────────────────────── */}
        {/* Va antes que la composición del catálogo a propósito: es lo único
            accionable de la pantalla y lo que hace verificable el indicador de
            catálogos digitales completos. */}
        <section>
          <SectionLabel
            text="Qué está frenando la activación"
            right={
              <button
                onClick={() => navigate('/backoffice/gestion?tab=sanidad')}
                className="flex items-center gap-1 print:hidden"
                style={{ ...lc(0.4), fontSize: 9, color: PURPLE }}
              >
                Trabajar en Gestión <ArrowUpRight style={{ width: 11, height: 11 }} />
              </button>
            }
          />
          <SanidadPanel
            summary={sanidad?.summary ?? []}
            filters={filters}
            loading={loading}
            compact={6}
            accent={PURPLE}
            onVerTodo={() => navigate('/backoffice/gestion?tab=sanidad')}
          />
        </section>

        {/* ── Embudo de onboarding ────────────────────────────────── */}
        <section>
          <SectionLabel text="Embudo de activación" />
          <div style={{ ...glassCard, padding: '26px 30px' }}>
            <div className="flex flex-wrap items-stretch gap-3">
              {funnel.map((step, i) => (
                <div
                  key={step.code}
                  className="relative flex min-w-[120px] flex-1 flex-col items-center"
                >
                  <div
                    style={{
                      width: '100%',
                      padding: '15px 10px',
                      borderRadius: 14,
                      background:
                        i === 0
                          ? `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE_MID} 100%)`
                          : 'rgba(20,34,57,0.04)',
                      border: i === 0 ? 'none' : '1px solid rgba(20,34,57,0.07)',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: SANS,
                        fontSize: 25,
                        fontWeight: 800,
                        color: i === 0 ? 'white' : NAVY,
                        lineHeight: 1,
                        marginBottom: 4,
                      }}
                    >
                      {loading ? '—' : step.count}
                    </p>
                    <p
                      style={{
                        ...lc(i === 0 ? 0.6 : 0.4),
                        fontSize: 8,
                        color: i === 0 ? 'rgba(255,255,255,0.55)' : undefined,
                      }}
                    >
                      {step.label}
                    </p>
                    {i > 0 && (
                      <p
                        style={{
                          fontFamily: SANS,
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'rgba(20,34,57,0.3)',
                          marginTop: 5,
                        }}
                      >
                        {pct(step.count)}%
                      </p>
                    )}
                  </div>
                  {i < funnel.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        right: -11,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                      }}
                    >
                      <ArrowRight style={{ width: 13, height: 13, color: 'rgba(20,34,57,0.2)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {salud && (
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 12,
                  color: 'rgba(84,67,62,0.45)',
                  fontStyle: 'italic',
                  marginTop: 18,
                  textAlign: 'center',
                }}
              >
                Aprobar y publicar son pasos distintos: una unidad productiva
                aprobada pero sin publicar sigue siendo invisible para el
                público.
                {salud.approvalTime.avgDays != null && (
                  <> Tiempo medio hasta la aprobación: {salud.approvalTime.avgDays} días.</>
                )}
              </p>
            )}
          </div>
        </section>

        {/* ── Bloque 3 · Composición del catálogo ─────────────────── */}
        <section>
          <SectionLabel text="Qué hay en el catálogo" />
          <CatalogoComposicion data={catalogo} loading={loading} />
        </section>

        {/* ── Cortes por convenio y territorio ────────────────────── */}
        {salud && salud.byAgreement.length > 0 && (
          <section>
            <SectionLabel
              text="Por convenio"
              right={
                <button
                  onClick={() =>
                    exportCsv(`convenios-${dateSuffix()}`, salud.byAgreement, [
                      { header: 'Convenio', value: (r) => r.agreementName ?? 'Sin convenio' },
                      { header: 'Unidades productivas', value: (r) => r.total },
                      { header: 'Aprobadas en marketplace', value: (r) => r.marketplaceApproved },
                      { header: 'Con productos aprobados', value: (r) => r.withApprovedProducts },
                    ])
                  }
                  className="print:hidden"
                  style={{ ...lc(0.4), fontSize: 9, color: PURPLE }}
                >
                  Exportar CSV
                </button>
              }
            />
            <div style={{ ...glassCard, padding: '18px 24px', overflowX: 'auto' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(20,34,57,0.08)' }}>
                    <th className="py-2 text-left" style={{ ...lc(0.4), fontSize: 8 }}>Convenio</th>
                    <th className="py-2 text-right" style={{ ...lc(0.4), fontSize: 8 }}>Unidades</th>
                    <th className="py-2 text-right" style={{ ...lc(0.4), fontSize: 8 }}>Aprobadas</th>
                    <th className="py-2 text-right" style={{ ...lc(0.4), fontSize: 8 }}>Con catálogo</th>
                  </tr>
                </thead>
                <tbody>
                  {salud.byAgreement.map((a) => (
                    <tr key={a.agreementId ?? 'none'} style={{ borderBottom: '1px solid rgba(20,34,57,0.05)' }}>
                      <td className="py-2 font-semibold" style={{ color: NAVY }}>
                        {a.agreementName ?? 'Sin convenio'}
                      </td>
                      <td className="py-2 text-right">{a.total}</td>
                      <td className="py-2 text-right">{a.marketplaceApproved}</td>
                      <td className="py-2 text-right">{a.withApprovedProducts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Notas metodológicas ─────────────────────────────────── */}
        {salud && (
          <section>
            <SectionLabel text="Cómo leer estas cifras" />
            <div style={{ ...glassCard, padding: '20px 26px' }}>
              <ul className="space-y-2">
                {salud.caveats.map((c, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: SANS,
                      fontSize: 11.5,
                      color: 'rgba(20,34,57,0.6)',
                      lineHeight: 1.55,
                      paddingLeft: 14,
                      position: 'relative',
                    }}
                  >
                    <span style={{ position: 'absolute', left: 0, color: PURPLE }}>·</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <div
          className="flex items-center justify-between pb-6 pt-2"
          style={{ borderTop: '1px solid rgba(84,67,62,0.08)' }}
        >
          <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(84,67,62,0.4)', fontStyle: 'italic' }}>
            Vista de solo lectura · Sin datos financieros ni de identificación personal
          </p>
          <p style={{ ...lc(0.25), fontSize: 8 }}>Telar · {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default BackofficeDashboardPage;
