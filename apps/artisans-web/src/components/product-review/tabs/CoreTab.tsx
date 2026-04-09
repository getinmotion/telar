/**
 * CoreTab — Edit product core fields: name, description, history, care notes, category, status
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save } from 'lucide-react';
import type { ProductResponse, ProductStatus } from '@/services/products-new.types';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

interface CoreTabProps {
  product: ProductResponse;
  categories: Category[];
  saving: boolean;
  onSave: (updates: {
    name: string;
    shortDescription: string;
    history?: string;
    careNotes?: string;
    categoryId?: string;
    status?: ProductStatus;
  }) => void;
}

const STATUS_OPTIONS: { value: ProductStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Borrador', color: 'bg-yellow-500' },
  { value: 'pending_moderation', label: 'Pendiente Moderación', color: 'bg-orange-500' },
  { value: 'changes_requested', label: 'Cambios Solicitados', color: 'bg-blue-500' },
  { value: 'approved', label: 'Aprobado', color: 'bg-emerald-500' },
  { value: 'approved_with_edits', label: 'Aprobado con Ediciones', color: 'bg-green-500' },
  { value: 'rejected', label: 'Rechazado', color: 'bg-red-500' },
];

export const CoreTab: React.FC<CoreTabProps> = ({
  product,
  categories,
  saving,
  onSave,
}) => {
  const [name, setName] = useState(product.name);
  const [shortDescription, setShortDescription] = useState(product.shortDescription || '');
  const [history, setHistory] = useState(product.history || '');
  const [careNotes, setCareNotes] = useState(product.careNotes || '');
  const [categoryId, setCategoryId] = useState(product.categoryId || '');
  const [status, setStatus] = useState<ProductStatus>(product.status as ProductStatus);

  // Reset form when product changes
  useEffect(() => {
    setName(product.name);
    setShortDescription(product.shortDescription || '');
    setHistory(product.history || '');
    setCareNotes(product.careNotes || '');
    setCategoryId(product.categoryId || '');
    setStatus(product.status as ProductStatus);
  }, [product]);

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === product.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      shortDescription,
      history: history || undefined,
      careNotes: careNotes || undefined,
      categoryId: categoryId || undefined,
      status,
    });
  };

  // Group categories: parents first, then children
  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = categories.filter((c) => c.parentId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Estado actual:</span>
        <Badge variant="outline" className="gap-1.5">
          <span className={`h-2 w-2 rounded-full ${currentStatus?.color || 'bg-gray-400'}`} />
          {currentStatus?.label || product.status}
        </Badge>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="core-name">Nombre</Label>
        <Input
          id="core-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="core-short-desc">Descripción Corta</Label>
        <Textarea
          id="core-short-desc"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* History */}
      <div className="space-y-2">
        <Label htmlFor="core-history">Historia</Label>
        <Textarea
          id="core-history"
          value={history}
          onChange={(e) => setHistory(e.target.value)}
          rows={4}
          placeholder="La historia detrás de este producto..."
        />
      </div>

      {/* Care Notes */}
      <div className="space-y-2">
        <Label htmlFor="core-care">Notas de Cuidado</Label>
        <Textarea
          id="core-care"
          value={careNotes}
          onChange={(e) => setCareNotes(e.target.value)}
          rows={3}
          placeholder="Instrucciones de cuidado y mantenimiento..."
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="core-category">Categoría de Producto</Label>
        <select
          id="core-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Sin categoría</option>
          {parentCategories.map((cat) => (
            <optgroup key={cat.id} label={cat.name}>
              <option value={cat.id}>{cat.name}</option>
              {childCategories
                .filter((child) => child.parentId === cat.id)
                .map((child) => (
                  <option key={child.id} value={child.id}>
                    &nbsp;&nbsp;↳ {child.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="core-status">Cambiar Estado</Label>
        <select
          id="core-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Guardar Core
      </Button>
    </form>
  );
};
