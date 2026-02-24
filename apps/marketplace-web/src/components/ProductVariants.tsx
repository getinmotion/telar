import { useEffect, useState } from 'react';
import { telarClient } from '@/lib/telarClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currencyUtils';

interface Variant {
  id: string;
  name: string;
  price_adjustment: number;
  stock: number;
  attributes: Record<string, any>;
}

interface ProductVariantsProps {
  productId: string;
  basePrice: number;
  onVariantSelect: (variant: Variant | null) => void;
}

export const ProductVariants = ({ productId, basePrice, onVariantSelect }: ProductVariantsProps) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      const { data, error } = await telarClient
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) {
        // Silenciar error - variantes son opcionales
        setVariants([]);
        return;
      }

      // Filtrar variantes activas en el cliente si el campo existe
      const activeVariants = (data || []).filter((v: any) => v.active !== false);
      setVariants(activeVariants);
    } catch (error) {
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariant = (variant: Variant) => {
    const newVariant = selectedVariant?.id === variant.id ? null : variant;
    setSelectedVariant(newVariant);
    onVariantSelect(newVariant);
  };

  if (loading) {
    return null;
  }

  if (variants.length === 0) {
    return null;
  }

  const hasMeaningfulOptions = variants.some((v) => {
    const anyV = v as any;
    const options = anyV.attributes ?? anyV.option_values;
    const hasOptions =
      options && typeof options === 'object' && Object.keys(options).length > 0;

    const label = String(anyV.name ?? anyV.sku ?? '').trim();
    const isDefaultish = !label || /default/i.test(label);

    return hasOptions || !isDefaultish;
  });

  // Si no hay opciones reales para escoger, no mostramos el selector.
  if (!hasMeaningfulOptions) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Variantes disponibles</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const priceAdjustment = variant.price_adjustment ?? 0;
          const finalPrice = basePrice + priceAdjustment;
          const isOutOfStock = (variant.stock ?? 0) <= 0;

          return (
            <Button
              key={variant.id}
              variant={isSelected ? 'default' : 'outline'}
              className="h-auto flex-col items-start p-4 relative"
              onClick={() => handleSelectVariant(variant)}
              disabled={isOutOfStock}
            >
              <span className="font-semibold">{variant.name}</span>
              <span className="text-sm text-primary">
                {formatCurrency(finalPrice)}
              </span>

              {priceAdjustment !== 0 && (
                <span className="text-xs text-muted-foreground">
                  {priceAdjustment > 0 ? '+' : ''}
                  {formatCurrency(priceAdjustment)}
                </span>
              )}

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
          Precio final: {formatCurrency(basePrice + (selectedVariant.price_adjustment ?? 0))}
        </div>
      )}
    </div>
  );
};
