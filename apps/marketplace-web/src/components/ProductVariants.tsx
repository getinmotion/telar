import { useEffect, useState } from 'react';
import { telarClient } from '@/lib/telarClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        .eq('active', true)
        .order('created_at', { ascending: true});

      if (error) throw error;

      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
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
    return <div className="text-sm text-muted-foreground">Cargando variantes...</div>;
  }

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Variantes disponibles</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const finalPrice = basePrice + variant.price_adjustment;
          const isOutOfStock = variant.stock <= 0;

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
                ${finalPrice.toLocaleString('es-MX')}
              </span>
              
              {variant.price_adjustment !== 0 && (
                <span className="text-xs text-muted-foreground">
                  {variant.price_adjustment > 0 ? '+' : ''}
                  ${variant.price_adjustment.toLocaleString('es-MX')}
                </span>
              )}

              {isOutOfStock && (
                <Badge variant="destructive" className="absolute top-2 right-2">
                  Agotado
                </Badge>
              )}
              
              {!isOutOfStock && variant.stock < 5 && (
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
          Precio final: ${(basePrice + selectedVariant.price_adjustment).toLocaleString('es-MX')}
        </div>
      )}
    </div>
  );
};
