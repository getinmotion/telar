/**
 * PhysicalTab — Edit physical specs & logistics: dimensions, weight, packaging, fragility
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import type {
  ProductResponse,
  FragilityLevel,
  CreateProductPhysicalSpecsDto,
  CreateProductLogisticsDto,
} from '@/services/products-new.types';

interface PhysicalTabProps {
  product: ProductResponse;
  saving: boolean;
  onSave: (updates: {
    physicalSpecs: CreateProductPhysicalSpecsDto;
    logistics: CreateProductLogisticsDto;
  }) => void;
}

const PACKAGING_OPTIONS = ['Caja Rígida', 'Bolsa de Tela', 'Tubo', 'Huacal', 'Sobre'];
const FRAGILITY_OPTIONS: { value: FragilityLevel; label: string }[] = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
];

export const PhysicalTab: React.FC<PhysicalTabProps> = ({
  product,
  saving,
  onSave,
}) => {
  const specs = product.physicalSpecs;
  const logistics = product.logistics;

  // Physical specs state
  const [heightCm, setHeightCm] = useState(specs?.heightCm || 0);
  const [widthCm, setWidthCm] = useState(specs?.widthCm || 0);
  const [lengthCm, setLengthCm] = useState(specs?.lengthOrDiameterCm || 0);
  const [weightKg, setWeightKg] = useState(specs?.realWeightKg || 0);

  // Logistics state
  const [packagingType, setPackagingType] = useState(logistics?.packagingType || PACKAGING_OPTIONS[0]);
  const [fragility, setFragility] = useState<FragilityLevel>((logistics?.fragility as FragilityLevel) || 'medio');
  const [requiresAssembly, setRequiresAssembly] = useState(logistics?.requiresAssembly || false);
  const [packHeight, setPackHeight] = useState(logistics?.packHeightCm || 0);
  const [packWidth, setPackWidth] = useState(logistics?.packWidthCm || 0);
  const [packLength, setPackLength] = useState(logistics?.packLengthCm || 0);
  const [packWeight, setPackWeight] = useState(logistics?.packWeightKg || 0);
  const [specialNotes, setSpecialNotes] = useState(logistics?.specialProtectionNotes || '');

  useEffect(() => {
    const s = product.physicalSpecs;
    const l = product.logistics;
    setHeightCm(s?.heightCm || 0);
    setWidthCm(s?.widthCm || 0);
    setLengthCm(s?.lengthOrDiameterCm || 0);
    setWeightKg(s?.realWeightKg || 0);
    setPackagingType(l?.packagingType || PACKAGING_OPTIONS[0]);
    setFragility((l?.fragility as FragilityLevel) || 'medio');
    setRequiresAssembly(l?.requiresAssembly || false);
    setPackHeight(l?.packHeightCm || 0);
    setPackWidth(l?.packWidthCm || 0);
    setPackLength(l?.packLengthCm || 0);
    setPackWeight(l?.packWeightKg || 0);
    setSpecialNotes(l?.specialProtectionNotes || '');
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      physicalSpecs: {
        heightCm: heightCm || undefined,
        widthCm: widthCm || undefined,
        lengthOrDiameterCm: lengthCm || undefined,
        realWeightKg: weightKg || undefined,
      },
      logistics: {
        packagingType,
        packHeightCm: packHeight || undefined,
        packWidthCm: packWidth || undefined,
        packLengthCm: packLength || undefined,
        packWeightKg: packWeight || undefined,
        fragility,
        requiresAssembly,
        specialProtectionNotes: specialNotes || undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Physical Specs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Especificaciones Físicas</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="phys-height">Alto (cm)</Label>
            <Input
              id="phys-height"
              type="number"
              min={0}
              step={0.1}
              value={heightCm}
              onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phys-width">Ancho (cm)</Label>
            <Input
              id="phys-width"
              type="number"
              min={0}
              step={0.1}
              value={widthCm}
              onChange={(e) => setWidthCm(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phys-length">Largo (cm)</Label>
            <Input
              id="phys-length"
              type="number"
              min={0}
              step={0.1}
              value={lengthCm}
              onChange={(e) => setLengthCm(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phys-weight">Peso (kg)</Label>
            <Input
              id="phys-weight"
              type="number"
              min={0}
              step={0.01}
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Logistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Logística</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="log-packaging">Embalaje</Label>
            <select
              id="log-packaging"
              value={packagingType}
              onChange={(e) => setPackagingType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {PACKAGING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-fragility">Fragilidad</Label>
            <select
              id="log-fragility"
              value={fragility}
              onChange={(e) => setFragility(e.target.value as FragilityLevel)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {FRAGILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="log-assembly"
                checked={requiresAssembly}
                onCheckedChange={(checked) => setRequiresAssembly(checked === true)}
              />
              <Label htmlFor="log-assembly">Requiere Ensamblaje</Label>
            </div>
          </div>
        </div>

        {/* Pack dimensions */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="pack-height">Pack Alto (cm)</Label>
            <Input
              id="pack-height"
              type="number"
              min={0}
              step={0.1}
              value={packHeight}
              onChange={(e) => setPackHeight(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pack-width">Pack Ancho (cm)</Label>
            <Input
              id="pack-width"
              type="number"
              min={0}
              step={0.1}
              value={packWidth}
              onChange={(e) => setPackWidth(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pack-length">Pack Largo (cm)</Label>
            <Input
              id="pack-length"
              type="number"
              min={0}
              step={0.1}
              value={packLength}
              onChange={(e) => setPackLength(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pack-weight">Pack Peso (kg)</Label>
            <Input
              id="pack-weight"
              type="number"
              min={0}
              step={0.01}
              value={packWeight}
              onChange={(e) => setPackWeight(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Special Notes */}
        <div className="space-y-2">
          <Label htmlFor="log-notes">Notas de Protección Especial</Label>
          <Textarea
            id="log-notes"
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            rows={3}
            placeholder="Instrucciones especiales de empaque o manejo..."
          />
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Guardar Físico & Logística
      </Button>
    </form>
  );
};
