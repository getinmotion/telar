import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currencyUtils';
/** Labels fijos para los ejes de variación conocidos */
const VARIANT_AXIS_LABELS: Record<string, string> = {
  talla: 'Talla',
  color: 'Color',
  material: 'Material',
};
import type { MarketplaceVariant } from '@/types/products.types';

interface ProductVariantsProps {
  variants: MarketplaceVariant[];
  onVariantSelect: (variant: MarketplaceVariant | null) => void;
}

/** Clave estable de una combinación de opciones */
const keyOf = (optionValues: Record<string, string>) =>
  JSON.stringify(Object.entries(optionValues).sort(([a], [b]) => a.localeCompare(b)));

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const ProductVariants = ({ variants, onVariantSelect }: ProductVariantsProps) => {
  const activeVariants = useMemo(
    () => variants.filter(v => v.isActive),
    [variants],
  );

  // Ejes presentes en las variantes, ordenados/etiquetados por la config compartida
  const axes = useMemo(() => {
    const present = new Set<string>();
    for (const v of activeVariants) {
      for (const [key, value] of Object.entries(v.optionValues)) {
        if (value) present.add(key);
      }
    }
    const order = ['talla', 'color', 'material'];
    return [...present]
      .sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .map(key => ({
        key,
        label: VARIANT_AXIS_LABELS[key] ?? capitalize(key),
        values: [...new Set(
          activeVariants.map(v => v.optionValues[key]).filter(Boolean),
        )],
      }));
  }, [activeVariants]);

  const [selection, setSelection] = useState<Record<string, string>>({});

  // Variante que coincide exactamente con la selección completa
  const selectedVariant = useMemo(() => {
    if (axes.some(axis => !selection[axis.key])) return null;
    return (
      activeVariants.find(
        v => keyOf(v.optionValues) === keyOf(selection),
      ) ?? null
    );
  }, [selection, axes, activeVariants]);

  useEffect(() => {
    onVariantSelect(selectedVariant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant]);

  // Producto de una sola variante: seleccionarla automáticamente
  useEffect(() => {
    if (activeVariants.length === 1) {
      onVariantSelect(activeVariants[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVariants]);

  // Sin opciones reales → no mostrar selector (productos existentes se ven igual)
  const hasMeaningfulOptions = axes.length > 0 && activeVariants.length > 1;
  if (!hasMeaningfulOptions) return null;

  /** ¿Existe alguna variante activa con stock compatible con elegir `value` en `axisKey`? */
  const isValueAvailable = (axisKey: string, value: string) => {
    return activeVariants.some(v => {
      if (v.optionValues[axisKey] !== value) return false;
      if ((v.stock ?? 0) <= 0) return false;
      // Compatible con lo ya seleccionado en los demás ejes
      return Object.entries(selection).every(
        ([k, sel]) => k === axisKey || !sel || v.optionValues[k] === sel,
      );
    });
  };

  const toggleValue = (axisKey: string, value: string) => {
    setSelection(prev => ({
      ...prev,
      [axisKey]: prev[axisKey] === value ? '' : value,
    }));
  };

  return (
    <div className="space-y-4">
      {axes.map(axis => (
        <div key={axis.key} className="space-y-2">
          <h3 className="text-sm font-semibold">
            {axis.label}
            {selection[axis.key] && (
              <span className="ml-2 font-normal text-muted-foreground">
                {selection[axis.key]}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {axis.values.map(value => {
              const isSelected = selection[axis.key] === value;
              const available = isValueAvailable(axis.key, value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => available && toggleValue(axis.key, value)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : available
                        ? 'bg-background border-input hover:border-primary'
                        : 'bg-muted text-muted-foreground border-input line-through cursor-not-allowed'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedVariant && (
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-primary">
            {formatCurrency(selectedVariant.price)}
          </span>
          {selectedVariant.stock <= 0 ? (
            <Badge variant="destructive">Agotado</Badge>
          ) : selectedVariant.stock < 5 ? (
            <span className="text-xs text-destructive">
              Solo {selectedVariant.stock} disponibles
            </span>
          ) : null}
        </div>
      )}

      {!selectedVariant && (
        <p className="text-xs text-muted-foreground">
          Selecciona {axes.map(a => a.label.toLowerCase()).join(' y ')} para continuar.
        </p>
      )}
    </div>
  );
};
