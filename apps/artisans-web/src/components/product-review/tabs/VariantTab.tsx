/**
 * VariantTab — Edit variant (SKU, price, stock) and production info
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import type {
  ProductResponse,
  AvailabilityType,
  CreateProductVariantDto,
  CreateProductProductionDto,
} from '@/services/products-new.types';

interface VariantTabProps {
  product: ProductResponse;
  saving: boolean;
  onSave: (updates: {
    variants: CreateProductVariantDto[];
    production?: CreateProductProductionDto;
  }) => void;
}

const AVAILABILITY_OPTIONS: { value: AvailabilityType; label: string }[] = [
  { value: 'en_stock', label: 'En Stock' },
  { value: 'bajo_pedido', label: 'Bajo Pedido' },
  { value: 'edicion_limitada', label: 'Edición Limitada' },
];

export const VariantTab: React.FC<VariantTabProps> = ({
  product,
  saving,
  onSave,
}) => {
  const variant = product.variants?.[0];
  const production = product.production;

  // Variant state
  const [sku, setSku] = useState(variant?.sku || '');
  const [priceMinor, setPriceMinor] = useState(
    variant?.basePriceMinor ? parseInt(String(variant.basePriceMinor), 10) / 100 : 0
  );
  const [stock, setStock] = useState(variant?.stockQuantity || 0);
  const [isActive, setIsActive] = useState(variant?.isActive ?? true);

  // Production state
  const [availabilityType, setAvailabilityType] = useState<AvailabilityType>(
    (production?.availabilityType as AvailabilityType) || 'en_stock'
  );
  const [productionDays, setProductionDays] = useState(production?.productionTimeDays || 0);
  const [monthlyCapacity, setMonthlyCapacity] = useState(production?.monthlyCapacity || 0);

  useEffect(() => {
    const v = product.variants?.[0];
    const p = product.production;
    setSku(v?.sku || '');
    setPriceMinor(v?.basePriceMinor ? parseInt(String(v.basePriceMinor), 10) / 100 : 0);
    setStock(v?.stockQuantity || 0);
    setIsActive(v?.isActive ?? true);
    setAvailabilityType((p?.availabilityType as AvailabilityType) || 'en_stock');
    setProductionDays(p?.productionTimeDays || 0);
    setMonthlyCapacity(p?.monthlyCapacity || 0);
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      variants: [
        {
          sku: sku.trim() || undefined,
          basePriceMinor: String(Math.round(priceMinor * 100)),
          stockQuantity: stock,
          currency: 'COP',
          isActive,
        },
      ],
      production: {
        availabilityType,
        productionTimeDays: productionDays || undefined,
        monthlyCapacity: monthlyCapacity || undefined,
      },
    });
  };

  if (!variant) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No hay variante base para este producto.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variante Base</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="var-sku">SKU</Label>
            <Input
              id="var-sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Código único..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="var-price">Precio Base (COP)</Label>
            <Input
              id="var-price"
              type="number"
              min={0}
              step={1000}
              value={priceMinor}
              onChange={(e) => setPriceMinor(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="var-stock">Stock</Label>
            <Input
              id="var-stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="var-active"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked === true)}
          />
          <Label htmlFor="var-active">Variante Activa</Label>
        </div>
      </div>

      {/* Production */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Producción</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="prod-avail">Disponibilidad</Label>
            <select
              id="prod-avail"
              value={availabilityType}
              onChange={(e) => setAvailabilityType(e.target.value as AvailabilityType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-days">Días de Producción</Label>
            <Input
              id="prod-days"
              type="number"
              min={0}
              value={productionDays}
              onChange={(e) => setProductionDays(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-capacity">Capacidad Mensual</Label>
            <Input
              id="prod-capacity"
              type="number"
              min={0}
              value={monthlyCapacity}
              onChange={(e) => setMonthlyCapacity(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Guardar Variante & Producción
      </Button>
    </form>
  );
};
