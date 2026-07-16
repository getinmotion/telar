import React from 'react';
import {
  Quote,
  BookOpen,
  Hammer,
  Ruler,
  Layers,
  Wrench,
  Scissors,
  Clock,
  Droplets,
  Sparkles,
  MapPin,
  ShoppingCart,
  Heart,
} from 'lucide-react';
import { composeVariantName } from '@telar/shared-types/products';
import type { NewWizardState } from '../../hooks/useNewWizardState';
import type { ResolvedNames } from '../../hooks/useResolvedNames';
import { AVAILABILITY_LABELS, deriveAvailabilityType } from '../../utils/availability';
import { PURPOSE_LABELS, STYLE_LABELS, toLines } from '../../utils/passport';
import { PreviewEditBadge } from './PreviewEditBadge';

/**
 * MarketplaceProductPreview — réplica compacta y estática del detalle de
 * producto de marketplace-web (apps/marketplace-web/src/pages/ProductDetail.tsx)
 * para que el artesano vea cómo quedará su pieza publicada.
 *
 * NOTA SOBRE ESTILOS: este componente SIMULA deliberadamente la estética de
 * marketplace-web (Playfair Display + los hex #f9f7f2 / #2c2c2c / #ec6d13 /
 * #e5e1d8). Los colores hardcodeados son intencionales y NO deben migrarse a
 * los tokens del design system de artisans-web.
 *
 * Secciones omitidas respecto al detalle real (vista simplificada): mapa
 * (react-map-gl no existe en artisans-web), registro cultural, perfil del
 * artesano, comercio justo, regalo, productos relacionados, nav/cart/footer.
 */

// Google Fonts del marketplace — mismo mecanismo que MarketplacePreviewShell
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,700&family=Manrope:wght@300;400;500;600;700;800&display=swap');`;

const pillClass =
  'border border-[#2c2c2c]/10 text-[#2c2c2c]/60 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest';

interface Props {
  state: NewWizardState;
  names: ResolvedNames;
  imagePreviews: string[];
  onGoToStep: (n: number) => void;
}

export const MarketplaceProductPreview: React.FC<Props> = ({
  state,
  names,
  imagePreviews,
  onGoToStep,
}) => {
  const mainImage = imagePreviews[0] ?? null;
  const thumbs = imagePreviews.slice(1, 4);

  const displayPrice = state.price ? Math.round(state.price * 1.05) : null;

  const availabilityType =
    state.availabilityType ??
    (state.productionType ? deriveAvailabilityType(state.productionType) : undefined);

  // Mismo switch que ProductDetail del marketplace
  const availabilityInfo = (() => {
    switch (availabilityType) {
      case 'pieza_unica':
        return { label: 'Pieza única', note: 'Existe un solo ejemplar de esta pieza.' };
      case 'edicion_limitada':
        return { label: 'Edición limitada', note: null };
      case 'bajo_pedido':
        return {
          label: 'Hecha bajo pedido',
          note: state.elaborationTime
            ? `Se elabora cuando la ordenas · ${state.elaborationTime}`
            : 'Se elabora cuando la ordenas',
        };
      default:
        return null;
    }
  })();

  const activeVariants = (state.variants ?? []).filter(v => v.isActive);
  const visibleVariants = activeVariants.slice(0, 4);

  const styleLabels = (state.styles ?? (state.style ? [state.style] : [])).map(
    s => STYLE_LABELS[s] ?? s,
  );

  const careLines = toLines(state.careNotes);
  const usageLines = toLines(state.usageSuggestions);

  const dimensionParts = [state.lengthCm, state.widthCm, state.heightCm].filter(
    (v): v is number => typeof v === 'number' && v > 0,
  );

  const originText =
    [state.municipality, state.department].filter(Boolean).join(', ') || 'Colombia';

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Label del marco */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#54433e]/50 font-['Manrope']">
          Vista previa · así se verá en el marketplace
        </p>
      </div>

      <div
        className="rounded-3xl overflow-hidden"
        style={{ border: '1px solid rgba(44,44,44,0.1)' }}
      >
        {/* Fuentes del marketplace, scoped a esta preview */}
        <style>{FONT_IMPORT + `
          .mkt-product-preview { font-family: 'Manrope', sans-serif; color: #2c2c2c; }
          .mkt-product-preview .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        `}</style>

        <div className="mkt-product-preview bg-[#f9f7f2] px-4 sm:px-8 py-6 sm:py-10">
          {/* ═══ HERO ═══ */}
          <div className="relative group grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-10">
            <PreviewEditBadge step={1} onGoToStep={onGoToStep} />

            {/* Galería estática */}
            <div className="space-y-2">
              {mainImage ? (
                <div className="aspect-square bg-[#e5e1d8] rounded-xl overflow-hidden">
                  <img src={mainImage} alt={state.name || 'Pieza'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square bg-[#e5e1d8] rounded-xl flex items-center justify-center text-[#2c2c2c]/30 text-xs uppercase tracking-widest">
                  Sin fotografía
                </div>
              )}
              {thumbs.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {thumbs.map(url => (
                    <div key={url} className="aspect-square bg-[#e5e1d8] rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info del producto */}
            <div className="flex flex-col justify-center">
              {state.workshopName && (
                <p className="mb-2 text-[#ec6d13] font-bold tracking-widest text-[10px] uppercase">
                  Taller: {state.workshopName}
                </p>
              )}

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-[#2c2c2c] mb-3">
                {state.name || 'Nombre de la pieza'}
              </h2>

              <p className="text-sm text-[#2c2c2c]/80 italic mb-2">
                Hecho a mano en {originText}
                {state.workshopName ? ` por el taller ${state.workshopName}` : ''}
              </p>
              {state.isCollaboration && state.collaboration?.name && (
                <p className="text-sm text-[#2c2c2c]/60 italic mb-2">
                  En colaboración con {state.collaboration.name}
                </p>
              )}

              {/* Badges de autenticidad (estáticos en la preview) */}
              <div className="flex flex-wrap gap-2 mb-4 pointer-events-none">
                <span className="bg-[#2c2c2c] text-white text-[9px] px-2 py-1 uppercase tracking-widest">
                  Huella Digital Registrada
                </span>
                <span className="bg-[#ec6d13] text-white text-[9px] px-2 py-1 uppercase tracking-widest">
                  Certificado de autenticidad TELAR
                </span>
              </div>

              {/* Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={pillClass}>Hecho a mano en Colombia</span>
                {names.craftName && <span className={pillClass}>{names.craftName}</span>}
                {names.materialNames.length > 0 && (
                  <span className={pillClass}>{names.materialNames.slice(0, 2).join(' · ')}</span>
                )}
                {state.purpose && (
                  <span className={pillClass}>{PURPOSE_LABELS[state.purpose] ?? state.purpose}</span>
                )}
                {styleLabels.map(s => (
                  <span key={s} className={pillClass}>{s}</span>
                ))}
                {state.artisanalHistory && <span className={pillClass}>Pieza con historia</span>}
              </div>

              {/* Precio */}
              <div className="mb-1 text-3xl font-serif text-[#2c2c2c]">
                {displayPrice != null ? `$${displayPrice.toLocaleString('es-CO')} COP` : 'Sin precio'}
              </div>
              {state.price != null && (
                <p className="text-[10px] text-[#2c2c2c]/40 mb-5">
                  Base ${state.price.toLocaleString('es-CO')} + 5% TELAR
                </p>
              )}

              {/* Disponibilidad */}
              {availabilityInfo && (
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="bg-[#2c2c2c] text-white px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold">
                    {availabilityInfo.label}
                  </span>
                  {availabilityInfo.note && (
                    <span className="text-xs text-[#2c2c2c]/50 italic">{availabilityInfo.note}</span>
                  )}
                </div>
              )}

              {/* Variantes (chips estáticos) */}
              {visibleVariants.length > 0 && (
                <div className="relative group/variants mb-5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#2c2c2c]/40 mb-2">
                    Opciones disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {visibleVariants.map(variant => (
                      <span
                        key={JSON.stringify(variant.optionValues)}
                        className="border border-[#2c2c2c]/15 bg-white px-3 py-1.5 rounded-full text-[11px] text-[#2c2c2c]/70"
                      >
                        {composeVariantName(variant.optionValues) || 'Variante'}
                        {' · '}${Math.round((variant.price ?? state.price ?? 0) * 1.05).toLocaleString('es-CO')}
                        {' · '}{variant.stock ?? 0} un.
                      </span>
                    ))}
                    {activeVariants.length > visibleVariants.length && (
                      <span className="px-3 py-1.5 text-[11px] text-[#2c2c2c]/40 italic">
                        +{activeVariants.length - visibleVariants.length} más
                      </span>
                    )}
                  </div>
                  <PreviewEditBadge step={4} onGoToStep={onGoToStep} />
                </div>
              )}

              {/* CTAs simulados */}
              <div className="space-y-2.5 mb-5 pointer-events-none select-none" aria-hidden="true">
                <div className="w-full bg-[#ec6d13] text-white font-bold py-3.5 uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 rounded-md opacity-90">
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al carrito
                </div>
                <div className="w-full border border-[#2c2c2c]/20 text-[#2c2c2c] font-bold py-3.5 uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  Guardar
                </div>
              </div>

              <p className="text-xs text-[#2c2c2c]/60 leading-relaxed italic border-l border-[#ec6d13]/30 pl-4">
                "Las piezas hechas a mano pueden tener tiempos de preparación diferentes dependiendo
                del proceso artesanal."
              </p>
            </div>
          </div>

          {/* ═══ DESCRIPCIÓN ═══ */}
          {state.shortDescription && (
            <section className="relative group max-w-3xl mx-auto text-center mb-10 py-6 border-y border-[#2c2c2c]/5">
              <PreviewEditBadge step={1} onGoToStep={onGoToStep} />
              <span className="inline-flex items-center gap-2 text-[#ec6d13] font-bold uppercase text-[10px] tracking-[0.3em] mb-3">
                <Quote className="w-4 h-4" />
                Descripción
              </span>
              <blockquote className="font-serif text-lg sm:text-xl text-[#2c2c2c] leading-relaxed italic px-4">
                {state.shortDescription}
              </blockquote>
            </section>
          )}

          {/* ═══ HISTORIA DE LA PIEZA ═══ */}
          {state.artisanalHistory && (
            <section className="relative group grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 items-center bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <PreviewEditBadge step={2} onGoToStep={onGoToStep} />
              <div>
                <span className="inline-flex items-center gap-2 text-[#ec6d13] font-bold uppercase text-[10px] tracking-[0.3em] mb-2">
                  <BookOpen className="w-4 h-4" />
                  Historia
                </span>
                <h3 className="text-2xl font-serif mb-4 text-[#2c2c2c]">Historia de la pieza</h3>
                <p className="text-[#2c2c2c]/70 leading-relaxed text-sm font-light italic whitespace-pre-line line-clamp-4">
                  {state.artisanalHistory}
                </p>
              </div>
              {imagePreviews[1] && (
                <div className="hidden md:block aspect-[4/3] bg-[#e5e1d8] rounded-xl overflow-hidden">
                  <img src={imagePreviews[1]} alt="Detalle artesanal" className="w-full h-full object-cover" />
                </div>
              )}
            </section>
          )}

          {/* ═══ PROCESO + FICHA TÉCNICA ═══ */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4 border-y border-[#2c2c2c]/10 py-8">
            {/* Proceso artesanal */}
            <div className="relative group space-y-4">
              <PreviewEditBadge step={3} onGoToStep={onGoToStep} />
              <h5 className="flex items-center gap-2 text-lg font-serif italic text-[#2c2c2c]">
                <Hammer className="w-5 h-5 text-[#ec6d13]" />
                Proceso artesanal
              </h5>
              <ul className="space-y-4 text-sm text-[#2c2c2c]/70">
                {names.materialNames.length > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ec6d13]/10">
                      <Layers className="w-3.5 h-3.5 text-[#ec6d13]" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Materiales</span>
                      <span className="italic">{names.materialNames.join(', ')}</span>
                    </span>
                  </li>
                )}
                {(state.tools?.length ?? 0) > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ec6d13]/10">
                      <Wrench className="w-3.5 h-3.5 text-[#ec6d13]" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Herramientas</span>
                      <span className="italic">{state.tools!.join(', ')}</span>
                    </span>
                  </li>
                )}
                {(names.primaryTechniqueName || names.craftName) && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ec6d13]/10">
                      <Scissors className="w-3.5 h-3.5 text-[#ec6d13]" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Técnica</span>
                      <span className="italic">
                        {[names.primaryTechniqueName, names.secondaryTechniqueName]
                          .filter(Boolean)
                          .join(', ') || names.craftName}
                      </span>
                    </span>
                  </li>
                )}
                {state.elaborationTime && (
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ec6d13]/10">
                      <Clock className="w-3.5 h-3.5 text-[#ec6d13]" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                        Tiempo de elaboración
                      </span>
                      <span className="italic">{state.elaborationTime}</span>
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Ficha técnica */}
            <div className="relative group space-y-4 bg-white rounded-2xl border border-[#2c2c2c]/10 shadow-sm p-6">
              <PreviewEditBadge step={4} onGoToStep={onGoToStep} />
              <h5 className="flex items-center gap-2 text-lg font-serif italic text-[#2c2c2c]">
                <Ruler className="w-5 h-5 text-[#ec6d13]" />
                Ficha técnica
              </h5>
              <ul className="space-y-3 text-sm text-[#2c2c2c]/70">
                {dimensionParts.length > 0 && (
                  <li className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Dimensiones</span>
                    <span className="italic">{dimensionParts.join(' × ')} cm</span>
                  </li>
                )}
                {state.weightKg != null && state.weightKg > 0 && (
                  <li className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Peso</span>
                    <span className="italic">{state.weightKg} kg</span>
                  </li>
                )}
                {state.monthlyCapacity != null && (
                  <li className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Capacidad mensual
                    </span>
                    <span className="italic">
                      {state.monthlyCapacity} unidad{state.monthlyCapacity !== 1 ? 'es' : ''}/mes
                    </span>
                  </li>
                )}
                {dimensionParts.length === 0 && !state.weightKg && state.monthlyCapacity == null && (
                  <li className="italic text-[#2c2c2c]/40">Sin datos técnicos registrados.</li>
                )}
              </ul>
            </div>

            {/* Cuidados y uso */}
            {(careLines.length > 0 || usageLines.length > 0) && (
              <div className="relative group md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl border border-[#2c2c2c]/10 shadow-sm p-6">
                <PreviewEditBadge step={3} onGoToStep={onGoToStep} />
                {careLines.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                        Para que dure toda la vida
                      </span>
                      <h5 className="flex items-center gap-2 text-lg font-serif italic text-[#2c2c2c] mt-1">
                        <Droplets className="w-5 h-5 text-[#ec6d13]" />
                        Cuidados
                      </h5>
                    </div>
                    <ul className="space-y-2 text-sm text-[#2c2c2c]/70">
                      {careLines.slice(0, 3).map(line => (
                        <li key={line} className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ec6d13]/10">
                            <Droplets className="w-3.5 h-3.5 text-[#ec6d13]" />
                          </span>
                          <span className="italic pt-1">{line}</span>
                        </li>
                      ))}
                      {careLines.length > 3 && (
                        <li className="italic text-[#2c2c2c]/40 pl-10">+{careLines.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}
                {usageLines.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                        Cómo disfrutarla
                      </span>
                      <h5 className="flex items-center gap-2 text-lg font-serif italic text-[#2c2c2c] mt-1">
                        <Sparkles className="w-5 h-5 text-[#ec6d13]" />
                        Sugerencias de uso
                      </h5>
                    </div>
                    <ul className="space-y-2 text-sm text-[#2c2c2c]/70">
                      {usageLines.slice(0, 3).map(line => (
                        <li key={line} className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ec6d13]/10">
                            <Sparkles className="w-3.5 h-3.5 text-[#ec6d13]" />
                          </span>
                          <span className="italic pt-1">{line}</span>
                        </li>
                      ))}
                      {usageLines.length > 3 && (
                        <li className="italic text-[#2c2c2c]/40 pl-10">+{usageLines.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Así se hizo esta pieza */}
            {(state.processDescription || (state.processEvidenceUrls?.length ?? 0) > 0) && (
              <div className="relative group md:col-span-2 space-y-4 pt-6 border-t border-[#2c2c2c]/10">
                <PreviewEditBadge step={3} onGoToStep={onGoToStep} />
                <h5 className="text-lg font-serif italic text-[#2c2c2c]">Así se hizo esta pieza</h5>
                {state.processDescription && (
                  <p className="text-sm text-[#2c2c2c]/70 leading-relaxed italic max-w-3xl whitespace-pre-line line-clamp-3">
                    {state.processDescription}
                  </p>
                )}
                {(state.processEvidenceUrls?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {state.processEvidenceUrls!.slice(0, 4).map(url => (
                      <div key={url} className="aspect-square bg-[#e5e1d8] rounded-xl overflow-hidden">
                        <img src={url} alt="Proceso de elaboración" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Envío consciente */}
          <p className="text-xs text-[#2c2c2c]/50 italic text-center max-w-2xl mx-auto mb-10">
            Envío consciente: las piezas se preparan cuidadosamente respetando tanto la integridad de
            la creación como el impacto ambiental del proceso.
          </p>

          {/* ═══ HUELLA DIGITAL ═══ */}
          <section className="bg-[#2c2c2c] text-white py-6 px-5 rounded-2xl">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 max-w-4xl mx-auto text-sm">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">
                Huella digital de la pieza
              </span>
              <span className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-[#ec6d13]" />
                {originText}
              </span>
              {state.workshopName && (
                <span className="flex items-center gap-2 text-white/80">
                  <Hammer className="w-4 h-4 text-[#ec6d13]" />
                  {state.workshopName}
                </span>
              )}
              {names.craftName && (
                <span className="flex items-center gap-2 text-white/80">
                  <Sparkles className="w-4 h-4 text-[#ec6d13]" />
                  {names.craftName}
                </span>
              )}
              <button
                onClick={() => onGoToStep(5)}
                className="flex items-center gap-1 text-[#ec6d13] text-[11px] font-bold uppercase tracking-widest hover:underline"
              >
                Ver pasaporte digital
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>east</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Nota de la vista simplificada */}
      <p className="text-[10px] text-[#54433e]/45 italic text-center mt-2 font-['Manrope']">
        Vista simplificada — el mapa, el perfil del taller y las piezas relacionadas no se muestran en
        esta previsualización.
      </p>
    </div>
  );
};
