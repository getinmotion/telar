/**
 * StudioProductEditor — Edita un ProductResponse con el lenguaje visual del wizard.
 * Pasos: Nueva Pieza · Identidad Artesanal · Proceso y Tiempo · Precio y Logística · Datos Legado
 * Campos de sistema (id, storeId, timestamps) → sólo lectura, griseados.
 */
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { telarApi } from '@/integrations/api/telarApi';
import type {
  ProductResponse,
  CreateProductsNewDto,
  AvailabilityType,
} from '@/services/products-new.types';
import type { StudioTaxonomy } from '@/hooks/useProductStudio';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const NAVY   = '#151b2d';
const ORANGE = '#ec6d13';
const WARM   = '#54433e';

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 8px 24px -6px rgba(0,0,0,0.06)',
};

const inputCls =
  'w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all resize-none';

const disabledCls =
  'w-full rounded-lg border border-[#e2d5cf]/20 px-3 py-2.5 text-[13px] font-[500] text-[#54433e]/40 bg-[#f8f5f3] cursor-not-allowed select-none';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function FieldLabel({ label, system }: { label: string; system?: boolean }) {
  return (
    <label className="block font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest mb-2"
      style={{ color: system ? `${WARM}50` : `${WARM}80` }}>
      {label}
      {system && (
        <span className="ml-1.5 normal-case tracking-normal font-[500] text-[10px]"
          style={{ color: `${WARM}40` }}>
          (sistema)
        </span>
      )}
    </label>
  );
}

function ReadonlyChip({ value }: { value: string }) {
  return (
    <span
      className="inline-block font-['Manrope'] text-[11px] font-[600] px-2.5 py-1 rounded-full"
      style={{ background: `${WARM}08`, color: `${WARM}60` }}
    >
      {value}
    </span>
  );
}

function formatCOP(minor: string | number | undefined): string {
  if (!minor) return '—';
  const num = typeof minor === 'string' ? parseInt(minor, 10) : minor;
  const pesos = Math.round(num / 100);
  return `$${pesos.toLocaleString('es-CO')}`;
}

// ─── Legacy data section ───────────────────────────────────────────────────────

interface LegacyProduct {
  id: string; name: string; description?: string; shortDescription?: string;
  price?: number; comparePrice?: number; category?: string; subcategory?: string;
  tags?: string[]; materials?: string[]; techniques?: string[]; sku?: string;
  inventory?: number; active?: boolean; featured?: boolean; moderationStatus?: string;
  images?: string[];
}

function LegacySection({ product }: { product: ProductResponse }) {
  const [legacy, setLegacy] = useState<LegacyProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!product.legacyProductId) { setNotFound(true); return; }
    setLoading(true);
    telarApi
      .get<LegacyProduct>(`/products/${product.legacyProductId}`)
      .then((r) => setLegacy(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [product.legacyProductId]);

  if (!product.legacyProductId) {
    return (
      <div className="text-center py-10 font-['Manrope'] text-[13px]" style={{ color: `${WARM}50` }}>
        Este producto no tiene datos legado vinculados.
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: ORANGE }} />
    </div>
  );

  if (notFound || !legacy) return (
    <div className="text-center py-10 font-['Manrope'] text-[13px]" style={{ color: `${WARM}50` }}>
      No se encontraron datos del producto original.
    </div>
  );

  const rows: [string, string][] = [
    ['ID legado',        legacy.id],
    ['Nombre',           legacy.name],
    ['Descripción',      legacy.shortDescription ?? '—'],
    ['Historia',         legacy.description ?? '—'],
    ['Precio',           legacy.price ? `$${legacy.price.toLocaleString('es-CO')}` : '—'],
    ['Precio comparado', legacy.comparePrice ? `$${legacy.comparePrice.toLocaleString('es-CO')}` : '—'],
    ['Categoría',        legacy.category ?? '—'],
    ['Subcategoría',     legacy.subcategory ?? '—'],
    ['SKU',              legacy.sku ?? '—'],
    ['Inventario',       String(legacy.inventory ?? '—')],
    ['Estado mod.',      legacy.moderationStatus ?? '—'],
    ['Activo',           legacy.active ? 'Sí' : 'No'],
    ['Destacado',        legacy.featured ? 'Sí' : 'No'],
    ['Materiales',       legacy.materials?.join(', ') ?? '—'],
    ['Técnicas',         legacy.techniques?.join(', ') ?? '—'],
    ['Tags',             legacy.tags?.join(', ') ?? '—'],
  ];

  return (
    <div className="space-y-3">
      {legacy.images && legacy.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {legacy.images.map((url, i) => (
            <img key={i} src={url} alt="" className="h-16 w-16 rounded-lg object-cover border border-[#e2d5cf]/40" />
          ))}
        </div>
      )}
      <div className="rounded-xl overflow-hidden border border-[#e2d5cf]/40">
        {rows.map(([k, v], i) => (
          <div key={k} className={`flex gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-[#faf8f6]' : 'bg-white'}`}>
            <span className="w-36 shrink-0 font-['Manrope'] text-[11px] font-[700] uppercase tracking-wide"
              style={{ color: `${WARM}60` }}>{k}</span>
            <span className="font-['Manrope'] text-[12px] font-[500] break-all" style={{ color: NAVY }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'pieza',     icon: 'add_photo_alternate', label: 'Nueva Pieza',          subtitle: 'Nombre, imágenes e historia de la pieza' },
  { key: 'identidad', icon: 'category',             label: 'Identidad Artesanal',  subtitle: 'Categoría, oficio, técnica y características' },
  { key: 'proceso',   icon: 'history_edu',          label: 'Proceso y Tiempo',     subtitle: 'Tiempos y capacidad de producción' },
  { key: 'precio',    icon: 'sell',                 label: 'Precio y Logística',   subtitle: 'Valor, stock, dimensiones y empaque' },
  { key: 'legado',    icon: 'manage_search',        label: 'Datos Legado',         subtitle: 'Información antes de la migración' },
] as const;

type StepKey = typeof STEPS[number]['key'];

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  product: ProductResponse;
  taxonomy: StudioTaxonomy;
  saving: boolean;
  onUpdate: (dto: CreateProductsNewDto) => Promise<boolean>;
}

export const StudioProductEditor: React.FC<Props> = ({ product, taxonomy, saving, onUpdate }) => {
  const [activeStep, setActiveStep] = useState<StepKey>('pieza');

  const activeStepIndex = STEPS.findIndex((s) => s.key === activeStep);
  const activeStepData  = STEPS[activeStepIndex];
  const TOTAL = STEPS.length;

  const goPrev = () => { if (activeStepIndex > 0) setActiveStep(STEPS[activeStepIndex - 1].key); };
  const goNext = () => { if (activeStepIndex < TOTAL - 1) setActiveStep(STEPS[activeStepIndex + 1].key); };

  // ── Step 1: Pieza ────────────────────────────────────────────────────────────
  const [name, setName] = useState(product.name ?? '');
  const [shortDescription, setShortDescription] = useState(product.shortDescription ?? '');
  const [history, setHistory] = useState(product.history ?? '');
  const [careNotes, setCareNotes] = useState(product.careNotes ?? '');

  // ── Step 2: Identidad ────────────────────────────────────────────────────────
  const [categoryId, setCategoryId] = useState(product.categoryId ?? '');
  const ai = product.artisanalIdentity;
  const [craftId, setCraftId] = useState(ai?.primaryCraftId ?? '');
  const [techniqueId, setTechniqueId] = useState(ai?.primaryTechniqueId ?? '');
  const [style, setStyle] = useState(ai?.style ?? '');
  const [pieceType, setPieceType] = useState(ai?.pieceType ?? '');
  const [collab, setCollab] = useState(ai?.isCollaboration ?? false);
  const [elabTime, setElabTime] = useState(ai?.estimatedElaborationTime ?? '');

  // ── Step 3: Proceso y Tiempo ─────────────────────────────────────────────────
  const [monthlyCapacity, setMonthlyCapacity] = useState(String(product.production?.monthlyCapacity ?? ''));
  const [productionTimeDays, setProductionTimeDays] = useState(String(product.production?.productionTimeDays ?? ''));

  // ── Step 4: Precio & Logística ───────────────────────────────────────────────
  const variant = product.variants?.[0];
  const [priceMinor, setPriceMinor] = useState(
    variant?.basePriceMinor ? String(Math.round(parseInt(variant.basePriceMinor) / 100)) : '',
  );
  const [stock, setStock] = useState(String(variant?.stockQuantity ?? ''));
  const [sku, setSku] = useState(variant?.sku ?? '');
  const [availability, setAvailability] = useState<AvailabilityType>(
    (product.production?.availabilityType as AvailabilityType) ?? 'en_stock',
  );
  const ps = product.physicalSpecs;
  const lg = product.logistics;
  const [weightKg, setWeightKg] = useState(String(ps?.realWeightKg ?? ''));
  const [lengthCm, setLengthCm] = useState(String(ps?.lengthOrDiameterCm ?? ''));
  const [widthCm, setWidthCm] = useState(String(ps?.widthCm ?? ''));
  const [heightCm, setHeightCm] = useState(String(ps?.heightCm ?? ''));
  const [packWeight, setPackWeight] = useState(String(lg?.packWeightKg ?? ''));

  // Sync when product changes
  useEffect(() => {
    setName(product.name ?? '');
    setShortDescription(product.shortDescription ?? '');
    setHistory(product.history ?? '');
    setCareNotes(product.careNotes ?? '');
    setCategoryId(product.categoryId ?? '');
    const ai2 = product.artisanalIdentity;
    setCraftId(ai2?.primaryCraftId ?? '');
    setTechniqueId(ai2?.primaryTechniqueId ?? '');
    setStyle(ai2?.style ?? '');
    setPieceType(ai2?.pieceType ?? '');
    setCollab(ai2?.isCollaboration ?? false);
    setElabTime(ai2?.estimatedElaborationTime ?? '');
    const v = product.variants?.[0];
    setPriceMinor(v?.basePriceMinor ? String(Math.round(parseInt(v.basePriceMinor) / 100)) : '');
    setStock(String(v?.stockQuantity ?? ''));
    setSku(v?.sku ?? '');
    setAvailability((product.production?.availabilityType as AvailabilityType) ?? 'en_stock');
    setMonthlyCapacity(String(product.production?.monthlyCapacity ?? ''));
    setProductionTimeDays(String(product.production?.productionTimeDays ?? ''));
    const ps2 = product.physicalSpecs;
    const lg2 = product.logistics;
    setWeightKg(String(ps2?.realWeightKg ?? ''));
    setLengthCm(String(ps2?.lengthOrDiameterCm ?? ''));
    setWidthCm(String(ps2?.widthCm ?? ''));
    setHeightCm(String(ps2?.heightCm ?? ''));
    setPackWeight(String(lg2?.packWeightKg ?? ''));
  }, [product.id]);

  // ── Save per step ────────────────────────────────────────────────────────────

  const saveStep1 = async () => {
    await onUpdate({ productId: product.id, storeId: product.storeId, name, shortDescription, history, careNotes });
  };

  const saveStep2 = async () => {
    await onUpdate({
      productId: product.id, storeId: product.storeId,
      name: product.name, shortDescription: product.shortDescription ?? '',
      categoryId: categoryId || undefined,
      artisanalIdentity: {
        primaryCraftId: craftId || undefined,
        primaryTechniqueId: techniqueId || undefined,
        style: style as any || undefined,
        pieceType: pieceType as any || undefined,
        isCollaboration: collab,
        estimatedElaborationTime: elabTime || undefined,
      },
    });
  };

  const saveStep3 = async () => {
    await onUpdate({
      productId: product.id, storeId: product.storeId,
      name: product.name, shortDescription: product.shortDescription ?? '',
      production: {
        availabilityType: (product.production?.availabilityType as AvailabilityType) ?? 'en_stock',
        monthlyCapacity: monthlyCapacity ? parseInt(monthlyCapacity) : undefined,
        productionTimeDays: productionTimeDays ? parseInt(productionTimeDays) : undefined,
      },
    });
  };

  const saveStep4 = async () => {
    const basePrice = priceMinor ? String(Math.round(parseFloat(priceMinor) * 100)) : undefined;
    const dto: CreateProductsNewDto = {
      productId: product.id, storeId: product.storeId,
      name: product.name, shortDescription: product.shortDescription ?? '',
      physicalSpecs: {
        realWeightKg: weightKg ? parseFloat(weightKg) : undefined,
        lengthOrDiameterCm: lengthCm ? parseFloat(lengthCm) : undefined,
        widthCm: widthCm ? parseFloat(widthCm) : undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
      },
      logistics: { packWeightKg: packWeight ? parseFloat(packWeight) : undefined },
      production: { availabilityType: availability },
      variants: variant ? [{
        sku: sku || undefined,
        stockQuantity: stock ? parseInt(stock) : undefined,
        basePriceMinor: basePrice,
        isActive: true,
      }] : undefined,
    };
    await onUpdate(dto);
  };

  const saveCurrentStep = () => {
    if (activeStep === 'pieza')     return saveStep1();
    if (activeStep === 'identidad') return saveStep2();
    if (activeStep === 'proceso')   return saveStep3();
    if (activeStep === 'precio')    return saveStep4();
  };

  const canSave = activeStep !== 'legado';

  const images = product.media
    ?.filter((m) => m.mediaType === 'image')
    .sort((a, b) => a.displayOrder - b.displayOrder) ?? [];

  const categoryName  = taxonomy.categories.find((c) => c.id === product.categoryId)?.name;
  const craftName     = taxonomy.crafts.find((c) => c.id === ai?.primaryCraftId)?.name;
  const techniqueName = taxonomy.techniques.find((t) => t.id === ai?.primaryTechniqueId)?.name;

  const progress = Math.round(((activeStepIndex + 1) / TOTAL) * 100);

  // ── Warm input background (matches wizard) ────────────────────────────────────
  const inputStyle: React.CSSProperties = { background: 'rgba(247,244,239,0.5)' };

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Step nav ─────────────────────────────────────────────────────────── */}
      <nav className="w-52 shrink-0 flex flex-col border-r border-[#e2d5cf]/30 py-6 px-5"
        style={{ background: '#faf8f6' }}>

        {/* Steps */}
        <div className="flex-1">
          {STEPS.map((s, i) => {
            const isActive   = activeStep === s.key;
            const isPast     = i < activeStepIndex;
            return (
              <div key={s.key} className="relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-[19px] top-[44px] w-[1.5px] h-[28px]"
                    style={{ background: isPast || isActive ? `${ORANGE}40` : `${WARM}18` }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setActiveStep(s.key)}
                  className="w-full flex items-center gap-3 py-2 text-left group transition-opacity"
                >
                  {/* Circle with number */}
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-['Manrope'] text-[13px] font-[800] transition-all"
                    style={isActive
                      ? { background: ORANGE, color: '#fff', boxShadow: `0 4px 12px ${ORANGE}40` }
                      : isPast
                        ? { background: `${ORANGE}20`, color: ORANGE }
                        : { background: `${WARM}0d`, color: `${WARM}50` }
                    }
                  >
                    {isPast ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {/* Label */}
                  <div className="min-w-0">
                    <p
                      className="text-[11px] font-[700] leading-tight truncate transition-colors"
                      style={{ color: isActive ? ORANGE : isPast ? `${NAVY}90` : `${WARM}60` }}
                    >
                      {s.label}
                    </p>
                    <p className="text-[9px] font-[500] mt-0.5 truncate" style={{ color: `${WARM}40` }}>
                      {s.subtitle}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* System info */}
        <div className="pt-4 border-t border-[#e2d5cf]/30 space-y-2">
          <p className="text-[9px] font-[800] uppercase tracking-widest" style={{ color: `${WARM}40` }}>Sistema</p>
          <div>
            <p className="text-[9px]" style={{ color: `${WARM}40` }}>Creado</p>
            <p className="text-[10px] font-[600]" style={{ color: `${WARM}60` }}>
              {product.createdAt ? new Date(product.createdAt).toLocaleDateString('es-CO') : '—'}
            </p>
          </div>
          <div>
            <p className="text-[9px]" style={{ color: `${WARM}40` }}>ID</p>
            <p className="text-[9px] font-[500] break-all" style={{ color: `${WARM}40` }}>{product.id.slice(0, 8)}…</p>
          </div>
        </div>
      </nav>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Wizard-style step header */}
        <header className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 border-b border-[#e2d5cf]/40"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
          <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: ORANGE }}>
            {activeStepData.icon}
          </span>
          <h2 className="font-['Manrope'] text-[13px] font-[700] shrink-0" style={{ color: NAVY }}>
            {activeStepData.label}
          </h2>
          <span className="shrink-0 hidden sm:block" style={{ color: `${WARM}20` }}>·</span>
          <p className="font-['Manrope'] text-[12px] font-[500] truncate min-w-0 hidden sm:block"
            style={{ color: `${WARM}60` }}>
            {activeStepData.subtitle}
          </p>
          <span className="ml-auto shrink-0 font-['Manrope'] text-[10px] font-[800] px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap"
            style={{ background: `${ORANGE}10`, color: ORANGE }}>
            {activeStepIndex + 1}/{TOTAL}
          </span>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#f7f4ef' }}>
          <div className="max-w-2xl mx-auto px-6 py-8 pb-6 space-y-4">

            {/* ── 1. Nueva Pieza ─────────────────────────────────────────────── */}
            {activeStep === 'pieza' && (
              <>
                {/* Images */}
                {images.length > 0 && (
                  <div className="rounded-2xl p-5" style={glassCard}>
                    <FieldLabel label="Imágenes" />
                    <div className="flex flex-wrap gap-2">
                      {images.map((m) => (
                        <img key={m.id} src={m.mediaUrl} alt=""
                          className="h-20 w-20 rounded-xl object-cover border border-[#e2d5cf]/40" />
                      ))}
                    </div>
                    <p className="mt-2 text-[10px]" style={{ color: `${WARM}50` }}>
                      Para editar imágenes usa la sección Medios del producto.
                    </p>
                  </div>
                )}

                {/* Name */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <FieldLabel label="Nombre de la pieza" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-[#e2d5cf]/40 px-4 py-3 font-['Noto_Serif'] text-[22px] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all placeholder:text-[#151b2d]/20"
                    style={{ background: 'rgba(247,244,239,0.4)' }}
                    placeholder="Ej. Vasija de barro, bolso tejido…"
                  />
                </div>

                {/* Description */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <FieldLabel label="Descripción breve" />
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={3}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Una línea que capture la esencia de la pieza"
                  />
                </div>

                {/* History */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <FieldLabel label="Historia y contexto" />
                  <textarea
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                    rows={5}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Cómo se hizo, de dónde viene, qué significa…"
                  />
                </div>

                {/* Care */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <FieldLabel label="Instrucciones de cuidado" />
                  <textarea
                    value={careNotes}
                    onChange={(e) => setCareNotes(e.target.value)}
                    rows={2}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Cómo mantener la pieza en buen estado"
                  />
                </div>

                {/* System fields */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel label="Store ID" system />
                      <input readOnly value={product.storeId} className={disabledCls} />
                    </div>
                    <div>
                      <FieldLabel label="ID legado" system />
                      <input readOnly value={product.legacyProductId ?? '—'} className={disabledCls} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── 2. Identidad Artesanal ────────────────────────────────────── */}
            {activeStep === 'identidad' && (
              <>
                {/* Categoría */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <FieldLabel label="Categoría TELAR" />
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">— Sin categoría —</option>
                    {taxonomy.categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {categoryName && (
                    <p className="mt-1.5 text-[10px]" style={{ color: `${WARM}50` }}>Actual: {categoryName}</p>
                  )}
                </div>

                {/* Oficio + Técnica */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel label="Oficio" />
                      <select
                        value={craftId}
                        onChange={(e) => setCraftId(e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                      >
                        <option value="">— Selecciona —</option>
                        {taxonomy.crafts.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      {craftName && <p className="mt-1.5 text-[10px]" style={{ color: `${WARM}50` }}>Actual: {craftName}</p>}
                    </div>
                    <div>
                      <FieldLabel label="Técnica principal" />
                      <select
                        value={techniqueId}
                        onChange={(e) => setTechniqueId(e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                      >
                        <option value="">— Selecciona —</option>
                        {taxonomy.techniques.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {techniqueName && <p className="mt-1.5 text-[10px]" style={{ color: `${WARM}50` }}>Actual: {techniqueName}</p>}
                    </div>
                  </div>
                </div>

                {/* Tipo + Estilo */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel label="Propósito" />
                      <select value={pieceType} onChange={(e) => setPieceType(e.target.value)} className={inputCls} style={inputStyle}>
                        <option value="">—</option>
                        <option value="funcional">Funcional</option>
                        <option value="decorativa">Decorativa</option>
                        <option value="mixta">Mixta</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel label="Estilo" />
                      <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputCls} style={inputStyle}>
                        <option value="">—</option>
                        <option value="tradicional">Tradicional</option>
                        <option value="contemporaneo">Contemporáneo</option>
                        <option value="fusion">Fusión</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tiempo de elaboración + colaboración */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="Tiempo de elaboración" />
                      <input
                        value={elabTime}
                        onChange={(e) => setElabTime(e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                        placeholder="Ej: 2 semanas, 5 días…"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="collab"
                        checked={collab}
                        onChange={(e) => setCollab(e.target.checked)}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: ORANGE }}
                      />
                      <label htmlFor="collab" className="text-[13px] font-[500]" style={{ color: WARM }}>
                        Es una colaboración entre artesanos
                      </label>
                    </div>
                  </div>
                </div>

                {/* Materiales */}
                {product.materials && product.materials.length > 0 && (
                  <div className="rounded-2xl p-5" style={glassCard}>
                    <FieldLabel label="Materiales vinculados" />
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {product.materials.map((m) => {
                        const mat = taxonomy.materials.find((x) => x.id === m.materialId);
                        return <ReadonlyChip key={m.materialId} value={mat?.name ?? m.materialId} />;
                      })}
                    </div>
                    <p className="mt-2 text-[10px]" style={{ color: `${WARM}50` }}>
                      Edita materiales desde la tab Identidad del editor avanzado.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── 3. Proceso y Tiempo ──────────────────────────────────────────── */}
            {activeStep === 'proceso' && (
              <>
                {/* Editable: capacity + days */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel label="Capacidad mensual" />
                      <div className="relative">
                        <input
                          value={monthlyCapacity}
                          onChange={(e) => setMonthlyCapacity(e.target.value.replace(/\D/g, ''))}
                          className={inputCls}
                          style={inputStyle}
                          placeholder="0"
                          inputMode="numeric"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-[600]"
                          style={{ color: `${WARM}50` }}>pzas / mes</span>
                      </div>
                    </div>
                    <div>
                      <FieldLabel label="Días de producción" />
                      <div className="relative">
                        <input
                          value={productionTimeDays}
                          onChange={(e) => setProductionTimeDays(e.target.value.replace(/\D/g, ''))}
                          className={inputCls}
                          style={inputStyle}
                          placeholder="0"
                          inputMode="numeric"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-[600]"
                          style={{ color: `${WARM}50` }}>días</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Read-only references */}
                <div className="rounded-2xl p-5 space-y-4" style={glassCard}>
                  <div>
                    <FieldLabel label="Tiempo de elaboración" system />
                    <input readOnly value={ai?.estimatedElaborationTime ?? '—'} className={disabledCls} />
                    <p className="mt-1.5 text-[10px]" style={{ color: `${WARM}50` }}>Se edita en Identidad Artesanal.</p>
                  </div>
                  <div>
                    <FieldLabel label="Tipo de disponibilidad" system />
                    <input readOnly value={product.production?.availabilityType ?? '—'} className={disabledCls} />
                    <p className="mt-1.5 text-[10px]" style={{ color: `${WARM}50` }}>Se edita en Precio y Logística.</p>
                  </div>
                  <div>
                    <FieldLabel label="Instrucciones de cuidado" system />
                    <input readOnly value={product.careNotes ?? '—'} className={disabledCls} />
                    <p className="mt-1.5 text-[10px]" style={{ color: `${WARM}50` }}>Se edita en Nueva Pieza.</p>
                  </div>
                </div>
              </>
            )}

            {/* ── 4. Precio y Logística ─────────────────────────────────────── */}
            {activeStep === 'precio' && (
              <>
                {/* Precio + stock + SKU */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest mb-4"
                    style={{ color: `${WARM}60` }}>Precio y stock</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <FieldLabel label="Precio (COP)" />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-[600]"
                          style={{ color: `${WARM}60` }}>$</span>
                        <input
                          value={priceMinor}
                          onChange={(e) => setPriceMinor(e.target.value.replace(/\D/g, ''))}
                          className={`${inputCls} pl-6`}
                          style={inputStyle}
                          placeholder="0"
                          inputMode="numeric"
                        />
                      </div>
                      {variant?.basePriceMinor && (
                        <p className="mt-1.5 text-[10px]" style={{ color: `${WARM}50` }}>
                          Guardado: {formatCOP(variant.basePriceMinor)}
                        </p>
                      )}
                    </div>
                    <div>
                      <FieldLabel label="Stock" />
                      <input value={stock} onChange={(e) => setStock(e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="0" inputMode="numeric" />
                    </div>
                    <div>
                      <FieldLabel label="SKU" />
                      <input value={sku} onChange={(e) => setSku(e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="Opcional" />
                    </div>
                  </div>
                </div>

                {/* Disponibilidad */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <FieldLabel label="Disponibilidad comercial" />
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {([
                      { id: 'en_stock',         label: 'En stock',     icon: 'inventory_2' },
                      { id: 'bajo_pedido',      label: 'Bajo pedido',  icon: 'assignment' },
                      { id: 'edicion_limitada', label: 'Ed. limitada', icon: 'layers' },
                    ] as { id: AvailabilityType; label: string; icon: string }[]).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAvailability(opt.id)}
                        className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3.5 border-2 transition-all text-center"
                        style={availability === opt.id
                          ? { borderColor: ORANGE, background: `${ORANGE}10`, color: ORANGE }
                          : { borderColor: '#e2d5cf', background: 'rgba(247,244,239,0.5)', color: `${WARM}70` }}
                      >
                        <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                        <span className="text-[10px] font-[700]">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensiones */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest mb-4"
                    style={{ color: `${WARM}60` }}>Dimensiones de la pieza</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      ['Peso (kg)', weightKg, setWeightKg],
                      ['Largo (cm)', lengthCm, setLengthCm],
                      ['Ancho (cm)', widthCm, setWidthCm],
                      ['Alto (cm)', heightCm, setHeightCm],
                    ].map(([label, val, setter]) => (
                      <div key={label as string}>
                        <FieldLabel label={label as string} />
                        <input
                          value={val as string}
                          onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                          className={inputCls}
                          style={inputStyle}
                          placeholder="0"
                          inputMode="decimal"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empaque */}
                <div className="rounded-2xl p-5" style={glassCard}>
                  <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest mb-4"
                    style={{ color: `${WARM}60` }}>Empaque</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel label="Peso empacado (kg)" />
                      <input value={packWeight} onChange={(e) => setPackWeight(e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="0" inputMode="decimal" />
                    </div>
                    <div>
                      <FieldLabel label="Fragilidad" system />
                      <input readOnly value={lg?.fragility ?? '—'} className={disabledCls} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── 5. Datos Legado ───────────────────────────────────────────── */}
            {activeStep === 'legado' && (
              <div className="rounded-2xl p-5" style={glassCard}>
                <LegacySection product={product} />
              </div>
            )}

          </div>
        </div>

        {/* Wizard-style footer ────────────────────────────────────────────────── */}
        <footer className="flex-shrink-0 border-t border-[#e2d5cf]/40" style={{ background: '#fdfaf6' }}>
          {/* Progress bar */}
          <div className="h-[2px]" style={{ background: `${WARM}15` }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progress}%`, background: ORANGE }}
            />
          </div>

          <div className="px-6 py-3 flex items-center justify-between">
            {/* Back */}
            <button
              type="button"
              onClick={goPrev}
              className="flex items-center gap-1.5 transition-colors"
              style={{
                visibility: activeStepIndex === 0 ? 'hidden' : 'visible',
                color: `${WARM}60`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = WARM)}
              onMouseLeave={(e) => (e.currentTarget.style.color = `${WARM}60`)}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="font-['Manrope'] text-[10px] font-[700] uppercase tracking-widest">Atrás</span>
            </button>

            {/* Right: save + next */}
            <div className="flex items-center gap-3">
              {canSave && (
                <button
                  type="button"
                  onClick={saveCurrentStep}
                  disabled={saving}
                  className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest px-4 py-2 rounded-full transition-opacity disabled:opacity-40"
                  style={{ background: ORANGE, color: '#fff' }}
                >
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Guardando…
                    </span>
                  ) : 'Guardar'}
                </button>
              )}

              {activeStepIndex < TOTAL - 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-1.5 text-white px-5 py-2 rounded-full font-['Manrope'] font-[700] text-[10px] uppercase tracking-widest transition-colors"
                  style={{ background: NAVY }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = ORANGE)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = NAVY)}
                >
                  <span>Siguiente</span>
                  <span className="material-symbols-outlined text-[14px]">east</span>
                </button>
              )}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};
