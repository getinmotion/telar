/**
 * IdentityTab — Edit artisanal identity: craft, techniques, piece type, style, process, materials
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import type {
  ProductResponse,
  PieceType,
  StyleType,
  ProcessType,
  CreateProductArtisanalIdentityDto,
  CreateProductMaterialLinkDto,
} from '@/services/products-new.types';

interface TaxonomyItem {
  id: string;
  name: string;
}

interface IdentityTabProps {
  product: ProductResponse;
  crafts: TaxonomyItem[];
  techniques: TaxonomyItem[];
  curatorialCategories: TaxonomyItem[];
  materials: TaxonomyItem[];
  saving: boolean;
  onSave: (updates: {
    artisanalIdentity: CreateProductArtisanalIdentityDto;
    materials: CreateProductMaterialLinkDto[];
  }) => void;
}

const PIECE_TYPES: { value: PieceType; label: string }[] = [
  { value: 'funcional', label: 'Funcional' },
  { value: 'decorativa', label: 'Decorativa' },
  { value: 'mixta', label: 'Mixta' },
];

const STYLE_TYPES: { value: StyleType; label: string }[] = [
  { value: 'tradicional', label: 'Tradicional' },
  { value: 'contemporaneo', label: 'Contemporáneo' },
  { value: 'fusion', label: 'Fusión' },
];

const PROCESS_TYPES: { value: ProcessType; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'asistido', label: 'Asistido' },
];

export const IdentityTab: React.FC<IdentityTabProps> = ({
  product,
  crafts,
  techniques,
  curatorialCategories,
  materials,
  saving,
  onSave,
}) => {
  const identity = product.artisanalIdentity;

  const [craftId, setCraftId] = useState(identity?.primaryCraftId || '');
  const [primaryTechniqueId, setPrimaryTechniqueId] = useState(identity?.primaryTechniqueId || '');
  const [secondaryTechniqueId, setSecondaryTechniqueId] = useState(identity?.secondaryTechniqueId || '');
  const [curatorialCategoryId, setCuratorialCategoryId] = useState(identity?.curatorialCategoryId || '');
  const [pieceType, setPieceType] = useState<PieceType>((identity?.pieceType as PieceType) || 'funcional');
  const [style, setStyle] = useState<StyleType>((identity?.style as StyleType) || 'tradicional');
  const [processType, setProcessType] = useState<ProcessType>((identity?.processType as ProcessType) || 'manual');
  const [elaborationTime, setElaborationTime] = useState(identity?.estimatedElaborationTime || '');
  const [isCollaboration, setIsCollaboration] = useState(identity?.isCollaboration || false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    product.materials?.map((m) => m.materialId) || []
  );

  useEffect(() => {
    const id = product.artisanalIdentity;
    setCraftId(id?.primaryCraftId || '');
    setPrimaryTechniqueId(id?.primaryTechniqueId || '');
    setSecondaryTechniqueId(id?.secondaryTechniqueId || '');
    setCuratorialCategoryId(id?.curatorialCategoryId || '');
    setPieceType((id?.pieceType as PieceType) || 'funcional');
    setStyle((id?.style as StyleType) || 'tradicional');
    setProcessType((id?.processType as ProcessType) || 'manual');
    setElaborationTime(id?.estimatedElaborationTime || '');
    setIsCollaboration(id?.isCollaboration || false);
    setSelectedMaterials(product.materials?.map((m) => m.materialId) || []);
  }, [product]);

  const toggleMaterial = (materialId: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      artisanalIdentity: {
        primaryCraftId: craftId || undefined,
        primaryTechniqueId: primaryTechniqueId || undefined,
        secondaryTechniqueId: secondaryTechniqueId || undefined,
        curatorialCategoryId: curatorialCategoryId || undefined,
        pieceType,
        style,
        processType,
        estimatedElaborationTime: elaborationTime || undefined,
        isCollaboration,
      },
      materials: selectedMaterials.map((matId, idx) => ({
        materialId: matId,
        isPrimary: idx === 0,
      })),
    });
  };

  const renderSelect = (
    id: string,
    label: string,
    value: string,
    onChange: (val: string) => void,
    options: TaxonomyItem[],
    allowEmpty = true
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {allowEmpty && <option value="">— Ninguno —</option>}
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderEnumSelect = <T extends string>(
    id: string,
    label: string,
    value: T,
    onChange: (val: T) => void,
    options: { value: T; label: string }[]
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (!identity) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No hay registro de identidad artesanal para este producto.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold">Identidad Curatorial y Artesanal</h3>

      {/* Piece Type / Style / Process */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {renderEnumSelect('id-piece', 'Tipo de Pieza', pieceType, setPieceType, PIECE_TYPES)}
        {renderEnumSelect('id-style', 'Estilo', style, setStyle, STYLE_TYPES)}
        {renderEnumSelect('id-process', 'Proceso', processType, setProcessType, PROCESS_TYPES)}
      </div>

      {/* Elaboration Time & Collaboration */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="id-elab-time">Tiempo de Elaboración</Label>
          <Input
            id="id-elab-time"
            value={elaborationTime}
            onChange={(e) => setElaborationTime(e.target.value)}
            placeholder="ej: 3 días, 48 horas..."
          />
        </div>
        <div className="flex items-end pb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="id-collab"
              checked={isCollaboration}
              onCheckedChange={(checked) => setIsCollaboration(checked === true)}
            />
            <Label htmlFor="id-collab">¿Colaboración?</Label>
          </div>
        </div>
      </div>

      {/* Craft & Curatorial Category */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderSelect('id-craft', 'Oficio', craftId, setCraftId, crafts)}
        {renderSelect('id-curatorial', 'Categoría Curatorial', curatorialCategoryId, setCuratorialCategoryId, curatorialCategories)}
      </div>

      {/* Techniques */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderSelect('id-tech-primary', 'Técnica Principal', primaryTechniqueId, setPrimaryTechniqueId, techniques)}
        {renderSelect('id-tech-secondary', 'Técnica Secundaria', secondaryTechniqueId, setSecondaryTechniqueId, techniques)}
      </div>

      {/* Materials */}
      <div className="space-y-3">
        <Label>Materiales</Label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {materials.map((mat) => (
            <div key={mat.id} className="flex items-center gap-2">
              <Checkbox
                id={`mat-${mat.id}`}
                checked={selectedMaterials.includes(mat.id)}
                onCheckedChange={() => toggleMaterial(mat.id)}
              />
              <Label htmlFor={`mat-${mat.id}`} className="text-sm font-normal cursor-pointer">
                {mat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Guardar Identidad
      </Button>
    </form>
  );
};
