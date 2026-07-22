import React from 'react';
import type { NewWizardState } from '../../hooks/useNewWizardState';
import type { ResolvedNames } from '../../hooks/useResolvedNames';
import { AVAILABILITY_LABELS, deriveAvailabilityType } from '../../utils/availability';
import { buildMrzLines, PURPOSE_LABELS, STYLE_LABELS, toLines } from '../../utils/passport';

/**
 * DigitalPassport — el documento de trazabilidad de la pieza con estética de
 * pasaporte oficial: portada, página de datos con foto, páginas de historia y
 * proceso, sellos de trazabilidad, anexos fotográficos y MRZ decorativa.
 *
 * Presentacional puro: recibe el estado del wizard y los nombres ya resueltos.
 * Un solo árbol responsive (sin duplicar mobile/desktop).
 */

interface Props {
  state: NewWizardState;
  names: ResolvedNames;
  imagePreviews: string[];
  passportId: string;
  onGoToStep?: (step: number) => void;
}

// ── Piezas tipográficas del documento ────────────────────────────────

const EditLink = ({ step, onGoToStep }: { step: number; onGoToStep?: (n: number) => void }) =>
  onGoToStep ? (
    <button
      onClick={() => onGoToStep(step)}
      className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-[#54433e]/45 hover:text-[#ec6d13] transition-colors shrink-0"
    >
      Editar
    </button>
  ) : null;

const Field = ({
  label,
  value,
  wide,
}: {
  label: string;
  value?: React.ReactNode;
  wide?: boolean;
}) => (
  <div className={wide ? 'col-span-full' : 'min-w-0'}>
    <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#54433e]/55 mb-1">{label}</p>
    <div className="font-['Manrope'] text-[13px] font-[700] text-[#151b2d] leading-snug break-words">
      {value ?? '—'}
    </div>
  </div>
);

const FieldGroup = ({
  title,
  editStep,
  onGoToStep,
  children,
}: {
  title: string;
  editStep: number;
  onGoToStep?: (n: number) => void;
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center justify-between gap-3 mb-2.5 pb-1.5 border-b border-[#151b2d]/10">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#ec6d13]">
        {title}
      </span>
      <EditLink step={editStep} onGoToStep={onGoToStep} />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">{children}</div>
  </div>
);

const Chip = ({ label }: { label: string }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-[#151b2d]/12 bg-white/70 font-['Manrope'] text-[10px] font-[600] text-[#54433e]">
    {label}
  </span>
);

const ChipRow = ({ labels }: { labels: string[] }) =>
  labels.length > 0 ? (
    <span className="flex flex-wrap gap-1">
      {labels.map(l => (
        <Chip key={l} label={l} />
      ))}
    </span>
  ) : (
    <>—</>
  );

const PassportPage = ({
  num,
  title,
  editStep,
  onGoToStep,
  children,
}: {
  num: string;
  title: string;
  editStep: number;
  onGoToStep?: (n: number) => void;
  children: React.ReactNode;
}) => (
  <div className="relative rounded-2xl border border-[#151b2d]/10 bg-white/60 p-4 sm:p-5 overflow-hidden">
    <span className="absolute top-3 right-4 font-mono text-[20px] font-bold text-[#151b2d]/10 select-none">
      {num}
    </span>
    <div className="flex items-center gap-3 mb-3">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#ec6d13]">
        {title}
      </span>
      <EditLink step={editStep} onGoToStep={onGoToStep} />
    </div>
    {children}
  </div>
);

const LineList = ({ lines, emptyText }: { lines: string[]; emptyText: string }) =>
  lines.length > 0 ? (
    <ul className="flex flex-col gap-1.5">
      {lines.map(line => (
        <li key={line} className="flex items-start gap-2">
          <span className="mt-[7px] w-1 h-1 rounded-full bg-[#ec6d13] shrink-0" />
          <span className="font-['Manrope'] text-[12px] font-[500] text-[#151b2d] leading-relaxed">
            {line}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="font-['Manrope'] text-[12px] italic text-[#54433e]/45">{emptyText}</p>
  );

const Stamp = ({
  lines,
  color,
  rotate,
  dimmed,
}: {
  lines: string[];
  color: string;
  rotate: number;
  dimmed?: boolean;
}) => (
  <div
    className="px-4 py-2 rounded-md text-center select-none shrink-0"
    style={{
      border: `3px double ${color}`,
      color,
      transform: `rotate(${rotate}deg)`,
      opacity: dimmed ? 0.4 : 0.7,
    }}
  >
    {lines.map(l => (
      <p key={l} className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] leading-snug">
        {l}
      </p>
    ))}
  </div>
);

const AnnexCell = ({ url, code }: { url: string; code: string }) => (
  <div className="relative aspect-square rounded-lg overflow-hidden border border-[#151b2d]/10 bg-white">
    <img src={url} alt={`Anexo ${code}`} className="w-full h-full object-cover" />
    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#151b2d]/70 font-mono text-[8px] font-bold tracking-[0.15em] text-[#fdfaf6]">
      {code}
    </span>
  </div>
);

// ── Documento ────────────────────────────────────────────────────────

export const DigitalPassport: React.FC<Props> = ({
  state,
  names,
  imagePreviews,
  passportId,
  onGoToStep,
}) => {
  // Valores derivados ('…' = id presente pero nombre aún cargando)
  const craftText = names.craftName ?? (state.craftId ? '…' : '—');
  const primaryTechText = names.primaryTechniqueName ?? (state.primaryTechniqueId ? '…' : '—');
  const secondaryTechText = names.secondaryTechniqueName ?? (state.secondaryTechniqueId ? '…' : '—');
  const categoryText = names.categoryName ?? (state.categoryId ? '…' : '—');

  const origin =
    [state.municipality, state.department, state.country].filter(Boolean).join(', ') || 'Colombia';

  const dimensionParts = [state.heightCm, state.widthCm, state.lengthCm].filter(
    (v): v is number => typeof v === 'number' && v > 0,
  );
  const dimensionsText = dimensionParts.length > 0 ? `${dimensionParts.join(' × ')} cm` : '—';

  const availabilityType =
    state.availabilityType ??
    (state.productionType ? deriveAvailabilityType(state.productionType) : undefined);

  const styleLabels = (state.styles ?? (state.style ? [state.style] : [])).map(
    s => STYLE_LABELS[s] ?? s,
  );

  const issueDate = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const photos = imagePreviews.slice(0, 6);
  const evidence = (state.processEvidenceUrls ?? []).slice(0, 4);
  const [mrz1, mrz2] = buildMrzLines(state, passportId);

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="rounded-3xl overflow-hidden bg-[#fdfaf6] shadow-card"
        style={{ border: '1px solid rgba(21,27,45,0.12)' }}
      >
        {/* ══ PORTADA ══════════════════════════════════════════════ */}
        <header className="bg-[#151b2d] text-[#fdfaf6] px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Emblema */}
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-[#ec6d13]/50" />
                <div className="absolute inset-[5px] rounded-full border border-[#fdfaf6]/20" />
                <span className="material-symbols-outlined text-[#ec6d13]" style={{ fontSize: 26 }}>
                  verified
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.3em]">
                  Pasaporte digital
                </p>
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.24em] text-[#fdfaf6]/55 mt-1.5">
                  Pieza artesanal · TELAR · República de Colombia
                </p>
              </div>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#fdfaf6]/50 mb-1">
                Passport No.
              </p>
              <p className="font-mono text-base sm:text-lg font-bold tracking-[0.12em] text-[#ec6d13]">
                {passportId}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-[#166534]/50 bg-[#166534]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8fd6a8]" />
              <span className="font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.18em] text-[#8fd6a8]">
                Preparado · se activa al aprobarse en curaduría
              </span>
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#fdfaf6]/40">
              Emitido: {issueDate}
            </span>
          </div>
        </header>

        {/* ══ PÁGINA DE DATOS ═══════════════════════════════════════ */}
        <section className="px-4 py-5 sm:px-8 sm:py-7">
          <div className="relative rounded-2xl border border-dashed border-[#151b2d]/15 p-4 sm:p-6 overflow-hidden">
            {/* Marca de agua */}
            <span
              className="material-symbols-outlined absolute -right-8 -bottom-10 text-[#151b2d]/5 pointer-events-none select-none"
              style={{ fontSize: 190 }}
            >
              verified
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-[190px_minmax(0,1fr)] gap-5 sm:gap-8">
              {/* Foto de la pieza */}
              <div className="max-w-[220px] mx-auto sm:mx-0 w-full">
                {photos[0] ? (
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-4 border-white shadow-card">
                    <img src={photos[0]} alt={state.name || 'Pieza'} className="w-full h-full object-cover" />
                    <span
                      className="material-symbols-outlined absolute bottom-2 right-2 text-white/75"
                      style={{ fontSize: 22, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                    >
                      verified
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => onGoToStep?.(1)}
                    className="w-full aspect-[3/4] rounded-xl border border-dashed border-[#151b2d]/20 bg-white/50 flex flex-col items-center justify-center gap-2 text-[#54433e]/45 hover:text-[#ec6d13] hover:border-[#ec6d13]/40 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                      add_photo_alternate
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em]">Sin fotografía</span>
                  </button>
                )}
                <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#54433e]/45 text-center mt-2">
                  Fotografía de la pieza
                </p>
              </div>

              {/* Campos del documento */}
              <div className="relative flex flex-col gap-5">
                <FieldGroup title="Identificación" editStep={1} onGoToStep={onGoToStep}>
                  <Field label="Nombre de la pieza" value={state.name || undefined} wide />
                  <Field
                    label="Descripción corta"
                    value={
                      state.shortDescription ? (
                        <span className="line-clamp-2 font-[500]">{state.shortDescription}</span>
                      ) : undefined
                    }
                    wide
                  />
                  <Field label="SKU" value={state.sku || undefined} />
                  <Field label="Fecha de emisión" value={issueDate} />
                </FieldGroup>

                <FieldGroup title="Autoría y origen" editStep={2} onGoToStep={onGoToStep}>
                  <Field label="Taller" value={state.workshopName || undefined} />
                  <Field label="Lugar de origen" value={origin} />
                  {state.isCollaboration && state.collaboration?.name ? (
                    <Field
                      label="Colaboración"
                      value={
                        state.collaboration.role
                          ? `${state.collaboration.name} · ${state.collaboration.role}`
                          : state.collaboration.name
                      }
                    />
                  ) : null}
                </FieldGroup>

                <FieldGroup title="Clasificación" editStep={2} onGoToStep={onGoToStep}>
                  <Field
                    label="Categoría"
                    value={
                      names.subcategoryName ? `${categoryText} · ${names.subcategoryName}` : categoryText
                    }
                  />
                  <Field
                    label="Propósito"
                    value={state.purpose ? PURPOSE_LABELS[state.purpose] ?? state.purpose : undefined}
                  />
                  <Field
                    label="Estilos"
                    value={styleLabels.length > 0 ? <ChipRow labels={styleLabels} /> : undefined}
                  />
                </FieldGroup>

                <FieldGroup title="Oficio y técnica" editStep={2} onGoToStep={onGoToStep}>
                  <Field label="Oficio" value={craftText} />
                  <Field label="Técnica principal" value={primaryTechText} />
                  {state.secondaryTechniqueId ? (
                    <Field label="Técnica secundaria" value={secondaryTechText} />
                  ) : null}
                  <Field
                    label="Materiales"
                    value={
                      names.materialNames.length > 0 ? (
                        <ChipRow labels={names.materialNames} />
                      ) : state.materials.length > 0 ? (
                        '…'
                      ) : undefined
                    }
                    wide
                  />
                  <Field label="Tiempo de elaboración" value={state.elaborationTime || undefined} />
                  <Field
                    label="Disponibilidad"
                    value={availabilityType ? AVAILABILITY_LABELS[availabilityType] : undefined}
                  />
                </FieldGroup>

                <FieldGroup title="Ficha física" editStep={4} onGoToStep={onGoToStep}>
                  <Field label="Dimensiones (al × an × la)" value={dimensionsText} />
                  <Field
                    label="Peso"
                    value={state.weightKg ? `${state.weightKg} kg` : undefined}
                  />
                </FieldGroup>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PÁGINAS: HISTORIA Y PROCESO ═══════════════════════════ */}
        <section className="px-4 sm:px-8 pb-5 sm:pb-7 grid gap-4 md:grid-cols-2">
          <PassportPage num="02" title="Historia de la pieza" editStep={2} onGoToStep={onGoToStep}>
            {state.artisanalHistory ? (
              <p className="font-['Noto_Serif'] italic text-[13px] leading-relaxed text-[#151b2d] whitespace-pre-line">
                "{state.artisanalHistory}"
              </p>
            ) : (
              <p className="font-['Manrope'] text-[12px] italic text-[#54433e]/45">
                Sin historia registrada aún.
              </p>
            )}
          </PassportPage>

          <PassportPage num="03" title="Proceso de elaboración" editStep={3} onGoToStep={onGoToStep}>
            <div className="flex flex-col gap-3">
              {state.processDescription ? (
                <p className="font-['Manrope'] text-[12px] font-[500] text-[#151b2d] leading-relaxed whitespace-pre-line">
                  {state.processDescription}
                </p>
              ) : (
                <p className="font-['Manrope'] text-[12px] italic text-[#54433e]/45">
                  Sin descripción de proceso registrada.
                </p>
              )}
              {(state.tools?.length ?? 0) > 0 && (
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#54433e]/55 mb-1.5">
                    Herramientas
                  </p>
                  <ChipRow labels={state.tools!} />
                </div>
              )}
              {state.monthlyCapacity != null && (
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#54433e]/60">
                  Capacidad: {state.monthlyCapacity} unidad{state.monthlyCapacity !== 1 ? 'es' : ''}/mes
                </p>
              )}
            </div>
          </PassportPage>

          <PassportPage num="04" title="Cuidados" editStep={3} onGoToStep={onGoToStep}>
            <LineList lines={toLines(state.careNotes)} emptyText="Sin cuidados registrados." />
          </PassportPage>

          <PassportPage num="05" title="Sugerencias de uso" editStep={3} onGoToStep={onGoToStep}>
            <LineList lines={toLines(state.usageSuggestions)} emptyText="Sin sugerencias registradas." />
          </PassportPage>
        </section>

        {/* ══ SELLOS DE TRAZABILIDAD ════════════════════════════════ */}
        <section className="px-4 sm:px-8 pb-6 sm:pb-8">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#54433e]/50 mb-4">
            Sellos de trazabilidad
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pl-1">
            <Stamp lines={['Hecho a mano', 'Colombia']} color="#ec6d13" rotate={-5} />
            {state.department && (
              <Stamp lines={['Origen', state.department]} color="#166534" rotate={3} />
            )}
            {names.craftName && (
              <Stamp lines={['Oficio', names.craftName]} color="#151b2d" rotate={-2} />
            )}
            <Stamp lines={['Curaduría', 'Pendiente']} color="#54433e" rotate={4} dimmed />
          </div>
        </section>

        {/* ══ ANEXOS ════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-8 pb-6 sm:pb-8 grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#54433e]/50">
                Anexo fotográfico
              </span>
              <EditLink step={1} onGoToStep={onGoToStep} />
            </div>
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <AnnexCell key={url} url={url} code={`A-0${i + 1}`} />
                ))}
              </div>
            ) : (
              <p className="font-['Manrope'] text-[12px] italic text-[#54433e]/45">
                Sin fotografías adjuntas.
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#54433e]/50">
                Evidencia de proceso
              </span>
              <EditLink step={3} onGoToStep={onGoToStep} />
            </div>
            {evidence.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {evidence.map((url, i) => (
                  <AnnexCell key={url} url={url} code={`B-0${i + 1}`} />
                ))}
              </div>
            ) : (
              <p className="font-['Manrope'] text-[12px] italic text-[#54433e]/45">
                Sin evidencia de proceso adjunta.
              </p>
            )}
          </div>
        </section>

        {/* ══ MRZ DECORATIVA ════════════════════════════════════════ */}
        <footer className="bg-[#151b2d] px-4 sm:px-8 py-4" aria-hidden="true">
          <div className="overflow-hidden">
            <p className="font-mono text-[10px] sm:text-[12px] tracking-[0.16em] whitespace-nowrap text-[#fdfaf6]/55 leading-relaxed">
              {mrz1}
            </p>
            <p className="font-mono text-[10px] sm:text-[12px] tracking-[0.16em] whitespace-nowrap text-[#fdfaf6]/55 leading-relaxed">
              {mrz2}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
