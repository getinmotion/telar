import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import type { TaxonomyType, TaxonomyItemAdmin } from '@/services/taxonomy.actions';
import type { Category } from '@/services/categories.actions';
import type { TaxonomyBadge } from '@/services/badges.actions';

type Variant = 'taxonomy' | 'category' | 'badge' | 'curatorial';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  mode: 'create' | 'edit';
  variant: Variant;
  taxonomyType?: TaxonomyType;
  initialData?: Partial<TaxonomyItemAdmin & TaxonomyBadge & Category & { isActive: boolean }>;
  crafts?: TaxonomyItemAdmin[];
  categories?: Category[];
  excludeCategoryIds?: string[];
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const TITLE: Record<Variant, { create: string; edit: string }> = {
  taxonomy: { create: 'Nuevo término', edit: 'Editar término' },
  category: { create: 'Nueva categoría', edit: 'Editar categoría' },
  badge: { create: 'Nuevo badge', edit: 'Editar badge' },
  curatorial: { create: 'Nueva categoría curatorial', edit: 'Editar categoría curatorial' },
};

export function TaxonomyItemFormModal({
  open,
  onClose,
  onSave,
  mode,
  variant,
  taxonomyType,
  initialData,
  crafts = [],
  categories = [],
  excludeCategoryIds = [],
}: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('approved');
  const [categoryId, setCategoryId] = useState<string>('');
  const [craftId, setCraftId] = useState<string>('');
  const [skuCode, setSkuCode] = useState('');
  const [isOrganic, setIsOrganic] = useState(false);
  const [isSustainable, setIsSustainable] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [parentId, setParentId] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [code, setCode] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [targetType, setTargetType] = useState<'shop' | 'product'>('shop');
  const [assignmentType, setAssignmentType] = useState<'curated' | 'automated'>('curated');
  const [saving, setSaving] = useState(false);
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initialData?.name ?? '');
    setSlug((initialData as Category)?.slug ?? '');
    setSlugManual(mode === 'edit' && !!( initialData as Category)?.slug);
    setDescription(initialData?.description ?? '');
    setStatus((initialData as TaxonomyItemAdmin)?.status ?? 'approved');
    setCategoryId((initialData as TaxonomyItemAdmin)?.categoryId ?? '');
    setCraftId((initialData as TaxonomyItemAdmin)?.craftId ?? '');
    setSkuCode((initialData as TaxonomyItemAdmin)?.skuCode ?? '');
    setIsOrganic((initialData as TaxonomyItemAdmin)?.isOrganic ?? false);
    setIsSustainable((initialData as TaxonomyItemAdmin)?.isSustainable ?? false);
    setIsActive(initialData?.isActive ?? true);
    setParentId((initialData as Category)?.parentId ?? '');
    setDisplayOrder((initialData as Category)?.displayOrder ?? 0);
    setCode((initialData as TaxonomyBadge)?.code ?? '');
    setIconUrl((initialData as TaxonomyBadge)?.iconUrl ?? '');
    setTargetType((initialData as TaxonomyBadge)?.targetType ?? 'shop');
    setAssignmentType((initialData as TaxonomyBadge)?.assignmentType ?? 'curated');
    setSaving(false);
    setCodeError('');
  }, [open, initialData, mode]);

  useEffect(() => {
    if (!slugManual) setSlug(slugify(name));
  }, [name, slugManual]);

  const availableCategories = categories.filter((c) => !excludeCategoryIds.includes(c.id));

  async function handleSave() {
    setSaving(true);
    setCodeError('');
    try {
      let payload: Record<string, unknown> = { name };
      if (variant === 'taxonomy') {
        payload = {
          name,
          description: description || undefined,
          status,
          ...(taxonomyType === 'crafts' ? { categoryId: categoryId || undefined } : {}),
          ...(taxonomyType === 'techniques' ? { craftId: craftId || undefined } : {}),
          ...(skuCode ? { skuCode } : {}),
          ...(taxonomyType === 'materials' ? { isOrganic, isSustainable } : {}),
        };
      } else if (variant === 'category') {
        payload = {
          name,
          slug: slug || slugify(name),
          description: description || undefined,
          parentId: parentId || null,
          displayOrder,
          isActive,
          ...(skuCode ? { skuCode } : {}),
        };
      } else if (variant === 'badge') {
        payload = {
          code,
          name,
          description: description || undefined,
          iconUrl: iconUrl || undefined,
          targetType,
          assignmentType,
          isActive,
        };
      } else if (variant === 'curatorial') {
        payload = { name, description: description || undefined };
      }
      await onSave(payload);
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setCodeError('Este código ya existe. Elige uno diferente.');
      }
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    name.trim().length > 0 &&
    (variant !== 'badge' || code.trim().length > 0) &&
    (variant !== 'taxonomy' || taxonomyType !== 'techniques' || craftId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent style={{ maxWidth: 480, borderRadius: 20 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 18 }}>
            {TITLE[variant][mode]}
          </DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          {/* Badge-only: code */}
          {variant === 'badge' && (
            <div>
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => { setCode(e.target.value); setCodeError(''); }}
                placeholder="ej. ECO_BADGE"
                style={{ marginTop: 4 }}
              />
              {codeError && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{codeError}</p>}
            </div>
          )}

          {/* Name */}
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del término"
              style={{ marginTop: 4 }}
            />
          </div>

          {/* Category: slug */}
          {variant === 'category' && (
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="slug-automatico"
                style={{ marginTop: 4 }}
              />
            </div>
          )}

          {/* Description */}
          {(variant !== 'taxonomy' || taxonomyType !== 'styles' && taxonomyType !== 'herramientas') && (
            <div>
              <Label htmlFor="desc">Descripción</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción opcional"
                rows={2}
                style={{ marginTop: 4 }}
              />
            </div>
          )}

          {/* Taxonomy: status */}
          {variant === 'taxonomy' && (
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" style={{ marginTop: 4 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Crafts: category */}
          {variant === 'taxonomy' && taxonomyType === 'crafts' && (
            <div>
              <Label htmlFor="catId">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="catId" style={{ marginTop: 4 }}>
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Techniques: craft (required) */}
          {variant === 'taxonomy' && taxonomyType === 'techniques' && (
            <div>
              <Label htmlFor="craftId">Oficio *</Label>
              <Select value={craftId} onValueChange={setCraftId}>
                <SelectTrigger id="craftId" style={{ marginTop: 4 }}>
                  <SelectValue placeholder="Selecciona un oficio" />
                </SelectTrigger>
                <SelectContent>
                  {crafts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Materials: organic + sustainable */}
          {variant === 'taxonomy' && taxonomyType === 'materials' && (
            <div style={{ display: 'flex', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <Checkbox checked={isOrganic} onCheckedChange={(v) => setIsOrganic(!!v)} />
                Orgánico
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <Checkbox checked={isSustainable} onCheckedChange={(v) => setIsSustainable(!!v)} />
                Sostenible
              </label>
            </div>
          )}

          {/* Category: parentId */}
          {variant === 'category' && (
            <div>
              <Label htmlFor="parentId">Categoría padre</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parentId" style={{ marginTop: 4 }}>
                  <SelectValue placeholder="Sin padre (raíz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin padre (raíz)</SelectItem>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category: displayOrder + skuCode */}
          {variant === 'category' && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  style={{ marginTop: 4 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label htmlFor="sku">SKU code</Label>
                <Input
                  id="sku"
                  value={skuCode}
                  onChange={(e) => setSkuCode(e.target.value)}
                  placeholder="ej. TEXT"
                  style={{ marginTop: 4 }}
                />
              </div>
            </div>
          )}

          {/* Badge: targetType + assignmentType */}
          {variant === 'badge' && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Label htmlFor="target">Destino</Label>
                <Select value={targetType} onValueChange={(v) => setTargetType(v as 'shop' | 'product')}>
                  <SelectTrigger id="target" style={{ marginTop: 4 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shop">Tienda</SelectItem>
                    <SelectItem value="product">Producto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ flex: 1 }}>
                <Label htmlFor="assign">Asignación</Label>
                <Select value={assignmentType} onValueChange={(v) => setAssignmentType(v as 'curated' | 'automated')}>
                  <SelectTrigger id="assign" style={{ marginTop: 4 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curated">Curada</SelectItem>
                    <SelectItem value="automated">Automática</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Badge: iconUrl */}
          {variant === 'badge' && (
            <div>
              <Label htmlFor="iconUrl">URL del ícono</Label>
              <Input
                id="iconUrl"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://..."
                style={{ marginTop: 4 }}
              />
            </div>
          )}

          {/* isActive toggle for category and badge */}
          {(variant === 'category' || variant === 'badge') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active">Activo</Label>
            </div>
          )}
        </div>

        <DialogFooter style={{ marginTop: 8 }}>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            disabled={!canSave || saving}
            onClick={handleSave}
            style={{ background: '#15803d', color: '#fff' }}
          >
            {saving ? 'Guardando…' : mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
