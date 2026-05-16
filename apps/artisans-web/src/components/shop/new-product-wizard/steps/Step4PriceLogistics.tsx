import React, { useEffect, useMemo, useState } from 'react';
import type { NewWizardState } from '../hooks/useNewWizardState';
import type { AvailabilityType } from '@/services/products-new.types';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { AiBadge } from '../components/AiBadge';

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  step: number;
  totalSteps: number;
}

const AVAILABILITY_OPTIONS: { id: AvailabilityType; label: string; icon: string; desc: string }[] = [
  { id: 'en_stock', label: 'Disponible ahora', icon: 'inventory_2', desc: 'Tienes unidades listas para despacho' },
  { id: 'bajo_pedido', label: 'Bajo pedido', icon: 'assignment', desc: 'Se fabrica cuando llega un encargo' },
  { id: 'edicion_limitada', label: 'Edición limitada', icon: 'layers', desc: 'Número fijo de unidades en total' },
];

const cardStyle = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
};

const inputClass =
  'w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all';

type WeightUnit = 'kg' | 'g';

const GRAMS_KEYWORDS = ['oro', 'plata', 'cobre', 'bronce', 'hilo', 'seda', 'alambre', 'bisutería', 'joyería', 'filigrana', 'metal precioso', 'plata fina'];

function suggestWeightUnit(materials: string[]): WeightUnit {
  const text = materials.join(' ').toLowerCase();
  return GRAMS_KEYWORDS.some(kw => text.includes(kw)) ? 'g' : 'kg';
}

const toKg = (val: number, unit: WeightUnit) => unit === 'g' ? val / 1000 : val;
const fromKg = (kgVal: number | undefined, unit: WeightUnit) =>
  kgVal !== undefined ? (unit === 'g' ? +(kgVal * 1000).toFixed(2) : kgVal) : undefined;

interface WeightFieldProps {
  label: string;
  valueKg: number | undefined;
  unit: WeightUnit;
  onUnitChange: (u: WeightUnit) => void;
  onChange: (kgVal: number | undefined) => void;
  className?: string;
}

const WeightField: React.FC<WeightFieldProps> = ({ label, valueKg, unit, onUnitChange, onChange, className }) => (
  <div className={className}>
    <div className="flex items-center justify-between mb-1.5">
      <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex rounded-md overflow-hidden border border-[#e2d5cf]/40" style={{ background: 'rgba(247,244,239,0.3)' }}>
        {(['kg', 'g'] as WeightUnit[]).map(u => (
          <button
            key={u}
            type="button"
            onClick={() => onUnitChange(u)}
            className="px-2 py-0.5 text-[9px] font-[800] uppercase tracking-widest transition-all"
            style={{
              background: unit === u ? '#ec6d13' : 'transparent',
              color: unit === u ? 'white' : '#54433e80',
            }}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
    <input
      type="number"
      min={0}
      value={fromKg(valueKg, unit) ?? ''}
      onChange={e => onChange(e.target.value ? toKg(Number(e.target.value), unit) : undefined)}
      placeholder="—"
      className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all text-center"
      style={{ background: 'rgba(247,244,239,0.4)' }}
    />
  </div>
);

export const Step4PriceLogistics: React.FC<Props> = ({ state, update, onNext, onBack, onSaveDraft, isSavingDraft, step, totalSteps }) => {
  const canContinue = !!state.price && !!state.availabilityType;

  const suggestedUnit = useMemo(() => suggestWeightUnit(state.materials), [state.materials]);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(() => suggestWeightUnit(state.materials));
  const [pkgWeightUnit, setPkgWeightUnit] = useState<WeightUnit>(() => suggestWeightUnit(state.materials));

  useEffect(() => {
    setWeightUnit(suggestedUnit);
    setPkgWeightUnit(suggestedUnit);
  }, [suggestedUnit]);

  const formatCOP = (val: number | undefined) =>
    val ? val.toLocaleString('es-CO') : '';

  // Smart stock logic based on production type
  const stockHint = state.productionType === 'unica'
    ? 'Pieza única — stock fijo en 1'
    : state.productionType === 'bajo_pedido'
      ? 'Se fabrica por encargo. Define tu capacidad mensual.'
      : state.productionType === 'limitada'
        ? `Edición limitada${state.collectionName ? ` de "${state.collectionName}"` : ''}. Define las unidades totales.`
        : undefined;

  // Auto-set stock to 1 for unique pieces
  useEffect(() => {
    if (state.productionType === 'unica' && state.inventory !== 1) {
      update({ inventory: 1 });
    }
  }, [state.productionType, state.inventory, update]);

  // Clear any previously stored fake client-side SKU so the server generates the real one
  useEffect(() => {
    if (state.sku) update({ sku: undefined });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
          onBack={onBack}
          icon="payments"
          title="Precio y logística"
          subtitle="Define cómo se comercializa y despacha esta pieza"
        />

        <div className="grid grid-cols-12 gap-6 items-start">
          {/* AI Sidebar */}
          <aside className="col-span-12 lg:col-span-3 sticky top-8">
            <div className="p-5 text-white rounded-2xl" style={{ background: '#151b2d' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#ec6d13] text-lg">auto_awesome</span>
                <h3 className="font-['Manrope'] text-[10px] font-[800] tracking-widest uppercase">Sugerido por IA</h3>
              </div>
              <p className="text-[11px] text-white/50 mb-5">
                Basado en técnica, materiales y categoría.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Precio sugerido', value: 'COP 280.000' },
                  { label: 'Empaque', value: 'Reforzado' },
                  { label: 'Peso estimado', value: '2.5 kg' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[9px] font-[800] text-white/40 uppercase tracking-widest">{label}</p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-[800] uppercase tracking-widest bg-[#ec6d13]/20 text-[#ec6d13]">IA</span>
                    </div>
                    <p className="text-[13px] text-white/80 font-[500]">{value}</p>
                  </div>
                ))}
              </div>

              {/* Readiness */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                <p className="text-[9px] font-[800] text-white/40 uppercase tracking-widest mb-2">Estado de publicación</p>
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-[800] uppercase tracking-widest"
                  style={{
                    background: canContinue ? 'rgba(22,101,52,0.15)' : 'rgba(255,255,255,0.05)',
                    color: canContinue ? '#86efac' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {canContinue ? 'Lista para compra' : 'Faltan datos'}
                  <span className="material-symbols-outlined text-[16px]">
                    {canContinue ? 'check_circle' : 'pending'}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-9 space-y-5 pb-32">

            {/* 1. Pricing module */}
            <section className="p-6 rounded-2xl" style={cardStyle}>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#ec6d13] text-xl">payments</span>
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                  Precio de venta
                </label>
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                Define tu precio base. TELAR suma un cargo al comprador y descuenta comisiones al vendedor.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                    Tu precio (COP) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={state.price ? formatCOP(state.price) : ''}
                      onChange={e => {
                        const raw = e.target.value.replace(/\./g, '').replace(/,/g, '');
                        update({ price: raw ? Number(raw) : undefined });
                      }}
                      placeholder="0"
                      className={`${inputClass} text-lg font-bold pr-14`}
                      style={{ background: 'rgba(247,244,239,0.4)' }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-[800] text-[#54433e]/30 uppercase">
                      COP
                    </span>
                  </div>
                </div>

                {/* Commission breakdown */}
                {state.price && state.price > 0 && (
                  <div className="flex flex-col gap-2">
                    {/* What buyer pays */}
                    <div className="p-3 rounded-lg border border-[#e2d5cf]/30" style={{ background: 'rgba(247,244,239,0.4)' }}>
                      <p className="text-[9px] font-[800] text-[#54433e]/40 uppercase tracking-widest mb-1.5">El comprador paga</p>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#54433e]/60">Tu precio</span>
                        <span className="text-[#54433e]/80 font-[600]">${formatCOP(state.price)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#54433e]/60">Cargo de servicio TELAR (+5%)</span>
                        <span className="text-[#54433e]/80 font-[600]">+ ${formatCOP(Math.round(state.price * 0.05))}</span>
                      </div>
                      <div className="flex justify-between text-[12px] pt-1.5 border-t border-[#e2d5cf]/30 mt-1">
                        <span className="font-[700] text-[#151b2d]">Total al comprador</span>
                        <span className="font-[800] text-[#151b2d]">${formatCOP(Math.round(state.price * 1.05))} COP</span>
                      </div>
                    </div>

                    {/* What seller receives */}
                    <div className="p-3 rounded-lg border border-[#e2d5cf]/30" style={{ background: 'rgba(247,244,239,0.4)' }}>
                      <p className="text-[9px] font-[800] text-[#54433e]/40 uppercase tracking-widest mb-1.5">Tú recibes</p>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#54433e]/60">Comisión TELAR (−10%)</span>
                        <span className="text-[#54433e]/80 font-[600]">− ${formatCOP(Math.round(state.price * 0.10))}</span>
                      </div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#54433e]/60">Pasarela de pago (−3.5%)</span>
                        <span className="text-[#54433e]/80 font-[600]">− ${formatCOP(Math.round(state.price * 0.035))}</span>
                      </div>
                      <div className="flex justify-between text-[12px] pt-1.5 border-t border-[#e2d5cf]/30 mt-1">
                        <span className="font-[700] text-[#151b2d]">Recibes aprox.</span>
                        <span className="font-[800] text-[#ec6d13]">${formatCOP(Math.round(state.price * 0.865))} COP</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SKU info */}
              <div className="mt-4 pt-4 border-t border-[#e2d5cf]/30">
                <div className="flex items-center gap-2 mb-1">
                  <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider">
                    Código SKU
                  </label>
                  <AiBadge />
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-[#54433e]/40 font-[500]">
                  <span className="material-symbols-outlined text-[14px] shrink-0">info</span>
                  TELAR genera el SKU automáticamente al guardar, usando categoría, territorio y técnica de la pieza.
                </p>
              </div>
            </section>

            {/* 2. Availability + smart stock */}
            <section className="p-6 rounded-2xl" style={cardStyle}>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#54433e]/40 text-xl">storefront</span>
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                  Disponibilidad comercial *
                </label>
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                ¿Cómo se vende esta pieza?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {AVAILABILITY_OPTIONS.map(opt => {
                  const isSelected = state.availabilityType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => update({ availabilityType: opt.id })}
                      className="flex flex-col gap-1.5 p-4 rounded-xl text-left transition-all"
                      style={{
                        background: isSelected ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.6)',
                        border: isSelected ? '1.5px solid rgba(236,109,19,0.4)' : '1px solid rgba(226,213,207,0.35)',
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                      >
                        {opt.icon}
                      </span>
                      <span
                        className="text-[10px] font-[800] uppercase tracking-wider"
                        style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-[#54433e]/50 leading-snug">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Smart stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                    Stock disponible {state.productionType !== 'unica' ? '*' : ''}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={state.inventory ?? ''}
                    onChange={e => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      const updates: Partial<NewWizardState> = { inventory: val };
                      if (state.minimumStockAlert !== undefined && state.minimumStockAlert > val) {
                        updates.minimumStockAlert = val;
                      }
                      update(updates);
                    }}
                    placeholder={state.productionType === 'unica' ? '1' : '0'}
                    disabled={state.productionType === 'unica'}
                    className={`${inputClass} ${state.productionType === 'unica' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    style={{ background: 'rgba(247,244,239,0.4)' }}
                  />
                  {stockHint && (
                    <p className="text-[10px] text-[#ec6d13]/80 mt-1.5 font-[600]">{stockHint}</p>
                  )}
                </div>
                <div>
                  <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                    Alerta de stock mínimo
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={state.inventory ?? undefined}
                    value={state.minimumStockAlert ?? ''}
                    onChange={e => {
                      const raw = Math.max(0, Number(e.target.value) || 0);
                      const max = state.inventory ?? Infinity;
                      update({ minimumStockAlert: Math.min(raw, max) });
                    }}
                    placeholder="5"
                    className={inputClass}
                    style={{ background: 'rgba(247,244,239,0.4)' }}
                  />
                  {state.inventory !== undefined && state.minimumStockAlert !== undefined && state.minimumStockAlert > state.inventory && (
                    <p className="text-[10px] text-red-500 mt-1.5 font-[600]">La alerta no puede superar el stock disponible.</p>
                  )}
                </div>
              </div>

              {/* Bajo pedido: delivery time */}
              {state.availabilityType === 'bajo_pedido' && (
                <div className="mt-4 pt-4 border-t border-[#e2d5cf]/30">
                  <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                    Tiempo estimado de entrega
                  </label>
                  <select
                    value={state.elaborationTime ?? ''}
                    onChange={e => update({ elaborationTime: e.target.value })}
                    className={`${inputClass} cursor-pointer appearance-none`}
                    style={{ background: 'rgba(247,244,239,0.4)' }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1 semana">1 semana</option>
                    <option value="2 semanas">2 semanas</option>
                    <option value="1 mes">1 mes</option>
                    <option value="Más de 1 mes">Más de 1 mes</option>
                  </select>
                </div>
              )}
            </section>

            {/* 3. Product dimensions */}
            <section className="p-6 rounded-2xl" style={cardStyle}>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#54433e]/40 text-xl">straighten</span>
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                  Dimensiones de la pieza
                </label>
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                Medidas reales del producto sin empaque.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Alto (cm)', key: 'heightCm' as const },
                  { label: 'Ancho (cm)', key: 'widthCm' as const },
                  { label: 'Largo (cm)', key: 'lengthCm' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                      {label}
                    </label>
                    <input
                      type="number"
                      value={(state[key] as number | undefined) ?? ''}
                      onChange={e => update({ [key]: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="—"
                      className={`${inputClass} text-center`}
                      style={{ background: 'rgba(247,244,239,0.4)' }}
                    />
                  </div>
                ))}
                <WeightField
                  label="Peso"
                  valueKg={state.weightKg}
                  unit={weightUnit}
                  onUnitChange={setWeightUnit}
                  onChange={v => update({ weightKg: v })}
                />
              </div>
            </section>

            {/* 4. Package dimensions — clearly separate */}
            <section className="p-6 rounded-2xl" style={{ ...cardStyle, borderLeft: '3px solid #ec6d13' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#ec6d13] text-xl">local_shipping</span>
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                  Dimensiones del paquete
                </label>
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                Medidas logísticas con empaque incluido. Se usan para calcular el costo de envío.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Ancho (cm)', key: 'packagedWidthCm' as const },
                  { label: 'Alto (cm)', key: 'packagedHeightCm' as const },
                  { label: 'Largo (cm)', key: 'packagedLengthCm' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                      {label}
                    </label>
                    <input
                      type="number"
                      value={(state[key] as number | undefined) ?? ''}
                      onChange={e => update({ [key]: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="—"
                      className={`${inputClass} text-center`}
                      style={{ background: 'rgba(247,244,239,0.4)' }}
                    />
                  </div>
                ))}
                <WeightField
                  label="Peso"
                  valueKg={state.packagedWeightKg}
                  unit={pkgWeightUnit}
                  onUnitChange={setPkgWeightUnit}
                  onChange={v => update({ packagedWeightKg: v })}
                />
              </div>

              {/* Special handling */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider">
                    ¿Requiere manejo especial?
                  </label>
                  <p className="text-[10px] text-[#54433e]/40">Para piezas frágiles o delicadas</p>
                </div>
                <div className="flex p-1 rounded-lg border border-[#e2d5cf]/40" style={{ background: 'rgba(247,244,239,0.3)' }}>
                  {['Sí', 'No'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => update({ specialHandling: opt === 'Sí' })}
                      className="px-5 py-1.5 text-[10px] font-[800] uppercase tracking-widest rounded-md transition-all"
                      style={{
                        background: (state.specialHandling === true && opt === 'Sí') || (state.specialHandling === false && opt === 'No') ? '#ec6d13' : 'transparent',
                        color: (state.specialHandling === true && opt === 'Sí') || (state.specialHandling === false && opt === 'No') ? 'white' : '#54433e80',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {state.specialHandling === true && (
                <div className="mt-3">
                  <textarea
                    value={state.shippingRestrictions ?? ''}
                    onChange={e => update({ shippingRestrictions: e.target.value })}
                    placeholder="Notas sobre fragilidad, empaque especial..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                    style={{ background: 'rgba(247,244,239,0.4)' }}
                  />
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        isSavingDraft={isSavingDraft}
        nextDisabled={!canContinue}
        leftOffset={80}
      />
    </div>
  );
};
