import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currencyUtils';
import type { MarketplaceVariant } from '@/types/products.types';

interface ProductVariantsProps {
  variants: MarketplaceVariant[];
  onVariantSelect: (variant: MarketplaceVariant | null) => void;
}

export const ProductVariants = ({ variants, onVariantSelect }: ProductVariantsProps) => {
  const [selectedVariant, setSelectedVariant] = useState<MarketplaceVariant | null>(null);

  const activeVariants = variants.filter((v) => v.isActive);

  if (activeVariants.length === 0) {
    return null;
  }

  const hasMeaningfulOptions = activeVariants.some((v) => {
    const hasOptions =
      v.optionValues && Object.keys(v.optionValues).length > 0;
    const label = String(v.variantName ?? v.sku ?? '').trim();
    const isDefaultish = !label || /default/i.test(label);

    return hasOptions || !isDefaultish;
  });

  // Si no hay opciones reales para escoger, no mostramos el selector.
  if (!hasMeaningfulOptions) {
    return null;
  }

  const handleSelectVariant = (variant: MarketplaceVariant) => {
    const newVariant = selectedVariant?.id === variant.id ? null : variant;
    setSelectedVariant(newVariant);
    onVariantSelect(newVariant);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Variantes disponibles</h3>

      <div className="grid grid-cols-2 gap-3">
        {activeVariants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = (variant.stock ?? 0) <= 0;
          const label =
            variant.variantName ||
            Object.values(variant.optionValues ?? {}).join(' · ') ||
            variant.sku ||
            'Opción';

          return (
            <Button
              key={variant.id}
              variant={isSelected ? 'default' : 'outline'}
              className="h-auto flex-col items-start p-4 relative"
              onClick={() => handleSelectVariant(variant)}
              disabled={isOutOfStock}
            >
              <span className="font-semibold">{label}</span>
              <span className="text-sm text-primary">
                {formatCurrency(variant.price)}
              </span>

              {isOutOfStock && (
                <Badge variant="destructive" className="absolute top-2 right-2">
                  Agotado
                </Badge>
              )}

              {!isOutOfStock && (variant.stock ?? 0) < 5 && (
                <span className="text-xs text-destructive">
                  Solo {variant.stock} disponibles
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {selectedVariant && (
        <div className="text-sm text-muted-foreground">
          Precio: {formatCurrency(selectedVariant.price)}
        </div>
      )}
    </div>
  );
};
