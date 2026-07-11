import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  composeVariantName,
  MAX_VARIANTS_PER_PRODUCT,
  type VariantAxisConfig,
} from '@telar/shared-types/products';
import type { NewWizardState, WizardVariant } from '../../hooks/useNewWizardState';
import { useVariantAxes } from '../../hooks/useVariantAxes';
import { FieldErrorMessage } from '../../components/FieldValidation';

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  /** Muestra el error de "genera al menos una variante" tras intentar avanzar */
  showError?: boolean;
}

const cardStyle = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
};

const inputClass =
  'w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all';

/** Clave estable de una combinación de opciones (independiente del orden) */
const keyOf = (optionValues: Record<string, string>) =>
  JSON.stringify(Object.entries(optionValues).sort(([a], [b]) => a.localeCompare(b)));

/**
 * Genera las filas de variantes como producto cartesiano de los valores
 * elegidos, conservando ids/precios/stocks de filas existentes (merge por
 * combinación). Filas con id de backend que salen de la matriz quedan
 * pausadas (isActive: false) — nunca se eliminan, protege referencias de carrito.
 */
export const buildVariants = (
  axes: string[],
  axisValues: Record<string, string[]>,
  existing: WizardVariant[],
  primaryVariantId?: string,
): WizardVariant[] => {
  const activeAxes = axes.filter(a => (axisValues[a]?.length ?? 0) > 0);
  let combos: Record<string, string>[] = activeAxes.length > 0 ? [{}] : [];
  for (const axis of activeAxes) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const value of axisValues[axis]) {
        next.push({ ...combo, [axis]: value });
      }
    }
    combos = next;
  }

  const existingByKey = new Map(existing.map(v => [keyOf(v.optionValues), v]));
  const rows: WizardVariant[] = combos.map(optionValues => {
    const prev = existingByKey.get(keyOf(optionValues));
    return prev
      ? { ...prev, isActive: true }
      : { optionValues, isActive: true };
  });

  // Reasignar el id de la variante única original a la primera fila nueva
  if (primaryVariantId && rows.length > 0 && !rows.some(r => r.id)) {
    rows[0] = { ...rows[0], id: primaryVariantId };
  }

  const comboKeys = new Set(combos.map(keyOf));
  const paused = existing
    .filter(v => v.id && !comboKeys.has(keyOf(v.optionValues)))
    .map(v => ({ ...v, isActive: false }));

  return [...rows, ...paused];
};

export const VariantsSection: React.FC<Props> = ({ state, update, showError }) => {
  const { axes } = useVariantAxes(state.categoryId, state.materials ?? []);
  const [customValue, setCustomValue] = useState<Record<string, string>>({});

  // Pieza única: no aplican variantes
  if (state.productionType === 'unica') return null;

  const hasVariants = state.hasVariants ?? false;
  const enabledAxes = state.variantAxes ?? [];
  const axisValues = state.variantAxisValues ?? {};
  const variants = state.variants ?? [];
  const activeVariants = variants.filter(v => v.isActive);
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock ?? 0), 0);

  const applyMatrix = (
    nextAxes: string[],
    nextAxisValues: Record<string, string[]>,
  ) => {
    const nextVariants = buildVariants(
      nextAxes,
      nextAxisValues,
      variants,
      state.primaryVariantId,
    );
    const nextActive = nextVariants.filter(v => v.isActive);
    update({
      variantAxes: nextAxes,
      variantAxisValues: nextAxisValues,
      variants: nextVariants,
      inventory: nextActive.reduce((sum, v) => sum + (v.stock ?? 0), 0),
    });
  };

  const countCombos = (
    nextAxes: string[],
    nextAxisValues: Record<string, string[]>,
  ) => {
    const active = nextAxes.filter(a => (nextAxisValues[a]?.length ?? 0) > 0);
    if (active.length === 0) return 0;
    return active.reduce((acc, a) => acc * nextAxisValues[a].length, 1);
  };

  const toggleAxis = (axisKey: string) => {
    const next = enabledAxes.includes(axisKey)
      ? enabledAxes.filter(a => a !== axisKey)
      : [...enabledAxes, axisKey];
    applyMatrix(next, axisValues);
  };

  const toggleValue = (axisKey: string, value: string) => {
    const current = axisValues[axisKey] ?? [];
    const nextValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    const nextAxisValues = { ...axisValues, [axisKey]: nextValues };
    if (countCombos(enabledAxes, nextAxisValues) > MAX_VARIANTS_PER_PRODUCT) {
      toast.error(`Máximo ${MAX_VARIANTS_PER_PRODUCT} variantes por producto`);
      return;
    }
    applyMatrix(enabledAxes, nextAxisValues);
  };

  const addCustomValue = (axisKey: string) => {
    const value = (customValue[axisKey] ?? '').trim();
    if (!value) return;
    const current = axisValues[axisKey] ?? [];
    if (current.some(v => v.toLowerCase() === value.toLowerCase())) {
      setCustomValue(prev => ({ ...prev, [axisKey]: '' }));
      return;
    }
    const nextAxisValues = { ...axisValues, [axisKey]: [...current, value] };
    if (countCombos(enabledAxes, nextAxisValues) > MAX_VARIANTS_PER_PRODUCT) {
      toast.error(`Máximo ${MAX_VARIANTS_PER_PRODUCT} variantes por producto`);
      return;
    }
    setCustomValue(prev => ({ ...prev, [axisKey]: '' }));
    applyMatrix(enabledAxes, nextAxisValues);
  };

  const updateVariant = (index: number, patch: Partial<WizardVariant>) => {
    const next = variants.map((v, i) => (i === index ? { ...v, ...patch } : v));
    update({
      variants: next,
      inventory: next
        .filter(v => v.isActive)
        .reduce((sum, v) => sum + (v.stock ?? 0), 0),
    });
  };

  const setHasVariants = (value: boolean) => {
    if (value && enabledAxes.length === 0 && axes.length > 0) {
      // Pre-activar el primer eje para guiar a la artesana
      update({ hasVariants: true, variantAxes: [axes[0].key] });
    } else {
      update({ hasVariants: value });
    }
  };

  const formatCOP = (val: number | undefined) =>
    val ? val.toLocaleString('es-CO') : '';

  return (
    <section id="wizard-field-variants" className="p-6 rounded-2xl" style={cardStyle}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-[#54433e]/40 text-xl">style</span>
            <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
              Variantes
            </label>
          </div>
          <p className="text-[11px] text-[#54433e]/60">
            ¿Esta pieza viene en distintas tallas, colores o materiales?
          </p>
        </div>
        <div className="flex p-1 rounded-lg border border-[#e2d5cf]/40 shrink-0" style={{ background: 'rgba(247,244,239,0.3)' }}>
          {['Sí', 'No'].map(opt => {
            const selected = (hasVariants && opt === 'Sí') || (!hasVariants && opt === 'No');
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setHasVariants(opt === 'Sí')}
                className="px-5 py-1.5 text-[10px] font-[800] uppercase tracking-widest rounded-md transition-all"
                style={{
                  background: selected ? '#ec6d13' : 'transparent',
                  color: selected ? 'white' : '#54433e80',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {hasVariants && (
        <div className="mt-5 space-y-5">
          {/* Ejes disponibles */}
          <div>
            <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-2">
              ¿En qué varía?
            </label>
            <div className="flex flex-wrap gap-2">
              {axes.map(axis => {
                const enabled = enabledAxes.includes(axis.key);
                return (
                  <button
                    key={axis.key}
                    type="button"
                    onClick={() => toggleAxis(axis.key)}
                    className="px-4 py-2 rounded-full text-[11px] font-[700] transition-all"
                    style={{
                      background: enabled ? 'rgba(236,109,19,0.1)' : 'rgba(255,255,255,0.6)',
                      border: enabled ? '1.5px solid rgba(236,109,19,0.5)' : '1px solid rgba(226,213,207,0.4)',
                      color: enabled ? '#ec6d13' : '#54433e',
                    }}
                  >
                    {axis.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Valores por eje */}
          {axes
            .filter(axis => enabledAxes.includes(axis.key))
            .map((axis: VariantAxisConfig) => {
              const selectedValues = axisValues[axis.key] ?? [];
              const suggested = axis.suggestedValues ?? [];
              const allValues = [
                ...suggested,
                ...selectedValues.filter(v => !suggested.includes(v)),
              ];
              return (
                <div key={axis.key}>
                  <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-2">
                    {axis.label}
                  </label>
                  {axis.valuesFromProductMaterials && suggested.length === 0 && (
                    <p className="text-[10px] text-[#54433e]/40 mb-2">
                      Agrega materiales a tu pieza en el paso 2, o escribe uno abajo.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {allValues.map(value => {
                      const selected = selectedValues.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleValue(axis.key, value)}
                          className="px-3 py-1.5 rounded-full text-[11px] font-[600] transition-all"
                          style={{
                            background: selected ? '#ec6d13' : 'rgba(247,244,239,0.5)',
                            border: selected ? '1px solid #ec6d13' : '1px solid rgba(226,213,207,0.4)',
                            color: selected ? 'white' : '#54433e',
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={customValue[axis.key] ?? ''}
                        onChange={e =>
                          setCustomValue(prev => ({ ...prev, [axis.key]: e.target.value }))
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomValue(axis.key);
                          }
                        }}
                        placeholder="Otro..."
                        className="rounded-full border border-dashed border-[#e2d5cf]/60 px-3 py-1.5 text-[11px] font-[500] text-[#151b2d] w-24 focus:outline-none focus:border-[#ec6d13]/50"
                        style={{ background: 'rgba(247,244,239,0.3)' }}
                      />
                      {(customValue[axis.key] ?? '').trim() && (
                        <button
                          type="button"
                          onClick={() => addCustomValue(axis.key)}
                          className="w-6 h-6 rounded-full bg-[#ec6d13] text-white flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Filas de variantes */}
          {activeVariants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider">
                  Tus variantes ({activeVariants.length})
                </label>
                <span className="text-[10px] font-[700] text-[#54433e]/60">
                  Stock total: {totalStock} un.
                </span>
              </div>

              <div className="space-y-2">
                {variants.map((variant, index) => {
                  if (!variant.isActive) return null;
                  const effectivePrice = variant.price ?? state.price;
                  return (
                    <div
                      key={keyOf(variant.optionValues)}
                      className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl border border-[#e2d5cf]/30"
                      style={{ background: 'rgba(247,244,239,0.35)' }}
                    >
                      <div className="col-span-12 sm:col-span-4">
                        <p className="text-[12px] font-[700] text-[#151b2d]">
                          {composeVariantName(variant.optionValues) || 'Variante'}
                        </p>
                        {variant.sku && (
                          <p className="text-[9px] text-[#54433e]/40 font-mono mt-0.5">{variant.sku}</p>
                        )}
                        {effectivePrice ? (
                          <p className="text-[9px] text-[#54433e]/50 mt-0.5">
                            El comprador verá ${formatCOP(Math.round(effectivePrice * 1.05))}
                          </p>
                        ) : null}
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        <div className="relative">
                          <input
                            type="text"
                            value={variant.price !== undefined ? formatCOP(variant.price) : ''}
                            onChange={e => {
                              const raw = e.target.value.replace(/\./g, '').replace(/,/g, '');
                              updateVariant(index, { price: raw ? Number(raw) : undefined });
                            }}
                            placeholder={state.price ? formatCOP(state.price) : 'Precio'}
                            className={inputClass}
                          />
                          {variant.price === undefined && state.price ? (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-[800] uppercase tracking-wider text-[#ec6d13]/60 pointer-events-none">
                              = base
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <input
                          type="number"
                          min={0}
                          value={variant.stock ?? ''}
                          onChange={e =>
                            updateVariant(index, {
                              stock: e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
                            })
                          }
                          placeholder="Stock"
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <input
                          type="number"
                          min={0}
                          value={variant.minStock ?? ''}
                          onChange={e =>
                            updateVariant(index, {
                              minStock: e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
                            })
                          }
                          placeholder="Alerta"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-[#54433e]/40 mt-2">
                Precio vacío = usa el precio base. Columnas: precio (COP), stock y alerta de stock mínimo.
              </p>
            </div>
          )}

          {enabledAxes.length > 0 && activeVariants.length === 0 && (
            <p className="text-[11px] text-[#54433e]/50">
              Elige al menos un valor para generar las variantes.
            </p>
          )}
        </div>
      )}
      {showError && hasVariants && activeVariants.length === 0 && (
        <FieldErrorMessage message="Genera al menos una variante o desactiva las variantes" />
      )}
    </section>
  );
};
