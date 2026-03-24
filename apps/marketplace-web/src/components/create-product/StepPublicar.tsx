import type { CreateProductV2Data } from './types';
import { MOCK_CATEGORIES, MOCK_CERTIFICATION_BADGES } from './types';

interface StepPublicarProps {
  data: CreateProductV2Data;
  isSubmitting: boolean;
  onSubmit: () => void;
  onSaveDraft: () => void;
}

export function StepPublicar({ data, isSubmitting, onSubmit, onSaveDraft }: StepPublicarProps) {
  const identity = data.artisanalIdentity;
  const production = data.production;
  const specs = data.physicalSpecs;
  const careTags = data.careTags ?? [];
  const proposals = data.taxonomyProposals ?? [];
  const curatorial = data.curatorialRequest;
  const category = MOCK_CATEGORIES.find((c) => c.id === data.categoryId);

  const formatPrice = (value: number | undefined) => {
    if (!value) return '$0';
    return `$${new Intl.NumberFormat('es-CO').format(value)}`;
  };

  const canPublish = data.name && data.shortDescription && data.price;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <span className="text-primary font-bold uppercase text-[10px] tracking-[0.3em] mb-3 block">
          Paso 4 de 4
        </span>
        <h2 className="text-4xl lg:text-5xl font-serif italic text-charcoal mb-4">
          Revisar y Publicar
        </h2>
        <p className="text-charcoal/50 text-sm italic max-w-md mx-auto">
          Así se verá tu pieza en el marketplace. Revisa que todo esté correcto antes de publicar.
        </p>
      </div>

      {/* Preview card - editorial style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
        {/* Image preview */}
        <div className="space-y-4">
          <div className="aspect-square bg-charcoal/5 rounded-xl overflow-hidden relative">
            {data.images.length > 0 ? (
              <img
                src={data.images[0]}
                alt={data.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-charcoal/20">
                <span className="material-symbols-outlined text-6xl">image</span>
                <span className="text-xs mt-2 italic">Sin imágenes</span>
              </div>
            )}
          </div>
          {data.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {data.images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-charcoal/5 rounded-lg overflow-hidden"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info preview */}
        <div className="flex flex-col justify-center">
          {category && (
            <div className="mb-2 text-primary font-bold tracking-widest text-[10px] uppercase">
              {category.name}
            </div>
          )}

          <h2 className="text-4xl font-serif italic text-charcoal mb-4">
            {data.name || 'Nombre de la pieza'}
          </h2>

          <p className="text-sm text-charcoal/70 italic mb-6">
            {data.shortDescription || 'Descripción corta de la pieza'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {identity?.craft && (
              <span className="border border-charcoal/10 text-charcoal/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                {identity.craft}
              </span>
            )}
            {identity?.primaryTechnique && (
              <span className="border border-charcoal/10 text-charcoal/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                {identity.primaryTechnique}
              </span>
            )}
            {identity?.processType && (
              <span className="border border-charcoal/10 text-charcoal/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                {identity.processType === 'manual'
                  ? '100% Manual'
                  : identity.processType === 'mixto'
                  ? 'Proceso Mixto'
                  : 'Asistido'}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-4xl font-serif mb-8 text-charcoal">
            {formatPrice(data.price)} <span className="text-lg text-charcoal/40">COP</span>
          </div>

          {/* Availability badge */}
          {production?.availabilityType && (
            <div className="flex items-center gap-2 mb-8">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  production.availabilityType === 'en_stock'
                    ? 'bg-green-500'
                    : production.availabilityType === 'bajo_pedido'
                    ? 'bg-amber-500'
                    : 'bg-purple-500'
                }`}
              />
              <span className="text-[10px] uppercase tracking-widest font-bold text-charcoal/50">
                {production.availabilityType === 'en_stock'
                  ? `En stock${data.variants?.[0]?.stockQuantity ? ` (${data.variants[0].stockQuantity} disponibles)` : ''}`
                  : production.availabilityType === 'bajo_pedido'
                  ? `Bajo pedido${production.productionTimeDays ? ` — ${production.productionTimeDays} días` : ''}`
                  : `Edición limitada${data.variants?.[0]?.stockQuantity ? ` — ${data.variants[0].stockQuantity} piezas` : ''}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detail sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-charcoal/10 py-12 mb-16">
        {/* Artisanal process */}
        <div className="space-y-4">
          <span className="material-symbols-outlined text-primary text-2xl">architecture</span>
          <h5 className="text-lg font-serif italic text-charcoal">Proceso artesanal</h5>
          <ul className="space-y-3 text-sm text-charcoal/60">
            {(data.materials ?? []).length > 0 && (
              <li className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-charcoal/30">
                  Materiales
                </span>
                <span className="italic">
                  {data.materials!.map((m) => m.name).join(', ')}
                </span>
              </li>
            )}
            {identity?.primaryTechnique && (
              <li className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-charcoal/30">
                  Técnica
                </span>
                <span className="italic">{identity.primaryTechnique}</span>
              </li>
            )}
            {identity?.estimatedElaborationTime && (
              <li className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-charcoal/30">
                  Tiempo de elaboración
                </span>
                <span className="italic">{identity.estimatedElaborationTime}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Technical details */}
        <div className="space-y-4">
          <span className="material-symbols-outlined text-primary text-2xl">settings_suggest</span>
          <h5 className="text-lg font-serif italic text-charcoal">Detalles técnicos</h5>
          <ul className="space-y-3 text-sm text-charcoal/60">
            {(specs?.heightCm || specs?.widthCm) && (
              <li className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-charcoal/30">
                  Dimensiones
                </span>
                <span className="italic">
                  {[
                    specs.heightCm && `${specs.heightCm}cm alto`,
                    specs.widthCm && `${specs.widthCm}cm ancho`,
                    specs.lengthOrDiameterCm && `${specs.lengthOrDiameterCm}cm largo`,
                  ]
                    .filter(Boolean)
                    .join(' x ')}
                </span>
              </li>
            )}
            {specs?.realWeightKg && (
              <li className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-charcoal/30">
                  Peso
                </span>
                <span className="italic">{specs.realWeightKg} kg</span>
              </li>
            )}
            {identity?.pieceType && (
              <li className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-charcoal/30">
                  Tipo de pieza
                </span>
                <span className="italic capitalize">{identity.pieceType}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Story preview */}
        <div className="space-y-4">
          <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
          <h5 className="text-lg font-serif italic text-charcoal">Historia</h5>
          {data.history ? (
            <p className="text-sm text-charcoal/60 italic leading-relaxed line-clamp-5">
              {data.history}
            </p>
          ) : (
            <p className="text-sm text-charcoal/30 italic">Sin historia agregada</p>
          )}
        </div>
      </div>

      {/* Care tags */}
      {careTags.length > 0 && (
        <div className="mb-16">
          <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40 mb-4">
            Instrucciones de cuidado
          </h5>
          <div className="flex flex-wrap gap-2">
            {careTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 border border-charcoal/10 px-4 py-2 text-[11px] text-charcoal/60"
              >
                <span className="material-symbols-outlined text-sm text-primary/60">check_circle</span>
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Proposals + Curatorial */}
      {(proposals.length > 0 || curatorial?.badgeCodes.length || curatorial?.categoryName) && (
        <div className="mb-16 bg-charcoal text-white py-10 px-8 rounded-2xl space-y-8">
          <h5 className="text-center text-lg font-serif italic">Solicitudes curatoriales</h5>

          {/* Proposals */}
          {proposals.length > 0 && (
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                Propuestas de catálogo pendientes
              </span>
              <div className="flex flex-wrap gap-2">
                {proposals.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 text-[11px] text-white/80"
                  >
                    <span className="material-symbols-outlined text-sm text-amber-400">pending</span>
                    <span className="text-[9px] uppercase tracking-wider text-white/40">
                      {p.type === 'craft' ? 'Oficio' : p.type === 'technique' ? 'Técnica' : 'Material'}:
                    </span>
                    <span className="italic">{p.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {curatorial && curatorial.badgeCodes.length > 0 && (
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                Certificaciones solicitadas
              </span>
              <div className="flex flex-wrap gap-3">
                {curatorial.badgeCodes.map((code) => {
                  const badge = MOCK_CERTIFICATION_BADGES.find((b) => b.code === code);
                  if (!badge) return null;
                  return (
                    <span
                      key={code}
                      className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 py-2 text-[10px] uppercase tracking-widest text-white"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">{badge.icon}</span>
                      {badge.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Curatorial category */}
          {curatorial?.categoryName && (
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                Categoría curatorial
              </span>
              <p className="text-sm italic text-white/70">{curatorial.categoryName}</p>
            </div>
          )}

          {curatorial?.notes && (
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                Notas para el equipo
              </span>
              <p className="text-sm italic text-white/50 border-l border-primary/30 pl-4">{curatorial.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-4 max-w-md mx-auto">
        <button
          onClick={onSubmit}
          disabled={!canPublish || isSubmitting}
          className={`w-full py-5 uppercase text-[11px] tracking-[0.2em] font-bold transition-all ${
            canPublish && !isSubmitting
              ? 'bg-charcoal text-white hover:bg-primary'
              : 'bg-charcoal/20 text-charcoal/40 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Publicando...' : 'Publicar pieza'}
        </button>
        <button
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="w-full border border-charcoal/20 text-charcoal py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:border-charcoal transition-all"
        >
          Guardar como borrador
        </button>

        {!canPublish && (
          <p className="text-center text-[10px] text-charcoal/40 italic">
            Completa al menos el nombre, descripción y precio para publicar.
          </p>
        )}
      </div>
    </div>
  );
}
