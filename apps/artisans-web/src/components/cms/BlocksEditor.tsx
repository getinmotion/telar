/**
 * BlocksEditor — composable block list editor for the Collections CMS.
 *
 * Soporta 6 tipos de bloques: text, image, gallery, product_grid, manifest, quote.
 * Cada bloque se reordena con flechas y se elimina con X.
 */
import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
  Image as ImageIcon,
  Type,
  Images,
  ShoppingBag,
  Quote,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploadField } from './ImageUploadField';
import { ProductPicker } from './ProductPicker';
import type { CollectionBlock, CollectionBlockType } from '@/services/collections-admin.actions';

interface BlocksEditorProps {
  value: CollectionBlock[];
  onChange: (next: CollectionBlock[]) => void;
}

const TYPE_LABELS: Record<CollectionBlockType, { label: string; icon: React.ElementType }> = {
  text: { label: 'Texto', icon: Type },
  image: { label: 'Imagen', icon: ImageIcon },
  gallery: { label: 'Galería', icon: Images },
  product_grid: { label: 'Grid de productos', icon: ShoppingBag },
  manifest: { label: 'Manifiesto', icon: ListChecks },
  quote: { label: 'Cita', icon: Quote },
};

const blank = (type: CollectionBlockType): CollectionBlock => {
  switch (type) {
    case 'text':
      return { type, payload: { kicker: '', title: '', body: '' } };
    case 'image':
      return { type, payload: { url: '', alt: '', caption: '', fullWidth: false } };
    case 'gallery':
      return { type, payload: { images: [], columns: 3 } };
    case 'product_grid':
      return { type, payload: { kicker: '', title: '', productIds: [], columns: 3 } };
    case 'manifest':
      return { type, payload: { kicker: '', sections: [] } };
    case 'quote':
      return { type, payload: { body: '', attribution: '' } };
  }
};

export const BlocksEditor: React.FC<BlocksEditorProps> = ({ value, onChange }) => {
  const [adding, setAdding] = useState(false);

  const add = (type: CollectionBlockType) => {
    onChange([...value, blank(type)]);
    setAdding(false);
  };

  const updateAt = (idx: number, next: CollectionBlock) => {
    const arr = [...value];
    arr[idx] = next;
    onChange(arr);
  };

  const updatePayload = (idx: number, patch: Record<string, any>) => {
    updateAt(idx, { ...value[idx], payload: { ...value[idx].payload, ...patch } });
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {value.map((block, idx) => {
        const meta = TYPE_LABELS[block.type];
        const Icon = meta.icon;
        return (
          <div key={idx} className="rounded-lg border bg-card">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                #{idx + 1} · {meta.label}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => move(idx, -1)} disabled={idx === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(idx, 1)}
                  disabled={idx === value.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 p-3">
              {block.type === 'text' && (
                <>
                  <div>
                    <Label>Kicker</Label>
                    <Input
                      value={block.payload.kicker ?? ''}
                      onChange={(e) => updatePayload(idx, { kicker: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={block.payload.title ?? ''}
                      onChange={(e) => updatePayload(idx, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cuerpo (Markdown)</Label>
                    <Textarea
                      rows={6}
                      value={block.payload.body ?? ''}
                      onChange={(e) => updatePayload(idx, { body: e.target.value })}
                    />
                  </div>
                </>
              )}

              {block.type === 'image' && (
                <>
                  <ImageUploadField
                    value={block.payload.url ?? ''}
                    onChange={(url) => updatePayload(idx, { url })}
                    altValue={block.payload.alt ?? ''}
                    onAltChange={(alt) => updatePayload(idx, { alt })}
                    label="Imagen"
                  />
                  <div>
                    <Label>Caption</Label>
                    <Input
                      value={block.payload.caption ?? ''}
                      onChange={(e) => updatePayload(idx, { caption: e.target.value })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!block.payload.fullWidth}
                      onChange={(e) => updatePayload(idx, { fullWidth: e.target.checked })}
                    />
                    Mostrar a ancho completo
                  </label>
                </>
              )}

              {block.type === 'gallery' && (
                <GalleryEditor
                  images={block.payload.images ?? []}
                  columns={block.payload.columns ?? 3}
                  onImages={(images) => updatePayload(idx, { images })}
                  onColumns={(columns) => updatePayload(idx, { columns })}
                />
              )}

              {block.type === 'product_grid' && (
                <>
                  <div>
                    <Label>Kicker</Label>
                    <Input
                      value={block.payload.kicker ?? ''}
                      onChange={(e) => updatePayload(idx, { kicker: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={block.payload.title ?? ''}
                      onChange={(e) => updatePayload(idx, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Columnas</Label>
                    <Select
                      value={String(block.payload.columns ?? 3)}
                      onValueChange={(v) => updatePayload(idx, { columns: Number(v) })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Productos</Label>
                    <ProductPicker
                      value={block.payload.productIds ?? []}
                      onChange={(productIds) => updatePayload(idx, { productIds })}
                    />
                  </div>
                </>
              )}

              {block.type === 'manifest' && (
                <ManifestEditor
                  kicker={block.payload.kicker ?? ''}
                  sections={block.payload.sections ?? []}
                  onKicker={(kicker) => updatePayload(idx, { kicker })}
                  onSections={(sections) => updatePayload(idx, { sections })}
                />
              )}

              {block.type === 'quote' && (
                <>
                  <div>
                    <Label>Cita</Label>
                    <Textarea
                      rows={3}
                      value={block.payload.body ?? ''}
                      onChange={(e) => updatePayload(idx, { body: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Atribución</Label>
                    <Input
                      value={block.payload.attribution ?? ''}
                      onChange={(e) => updatePayload(idx, { attribution: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Add new block */}
      {adding ? (
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-dashed p-3 sm:grid-cols-3">
          {(Object.keys(TYPE_LABELS) as CollectionBlockType[]).map((t) => {
            const m = TYPE_LABELS[t];
            const Icon = m.icon;
            return (
              <Button key={t} type="button" variant="outline" onClick={() => add(t)}>
                <Icon className="mr-2 h-4 w-4" />
                {m.label}
              </Button>
            );
          })}
          <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir bloque
        </Button>
      )}
    </div>
  );
};

interface GalleryImg {
  url: string;
  alt: string;
}

const GalleryEditor: React.FC<{
  images: GalleryImg[];
  columns: number;
  onImages: (img: GalleryImg[]) => void;
  onColumns: (n: number) => void;
}> = ({ images, columns, onImages, onColumns }) => {
  const update = (idx: number, patch: Partial<GalleryImg>) => {
    const next = [...images];
    next[idx] = { ...next[idx], ...patch };
    onImages(next);
  };
  const remove = (idx: number) => onImages(images.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...images];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onImages(next);
  };
  return (
    <div className="space-y-3">
      <div>
        <Label>Columnas</Label>
        <Select value={String(columns)} onValueChange={(v) => onColumns(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {images.map((img, i) => (
        <div key={i} className="rounded border p-2">
          <ImageUploadField
            value={img.url}
            onChange={(url) => update(i, { url })}
            altValue={img.alt}
            onAltChange={(alt) => update(i, { alt })}
            label={`Imagen ${i + 1}`}
          />
          <div className="mt-2 flex justify-end gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === images.length - 1}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onImages([...images, { url: '', alt: '' }])}>
        <Plus className="mr-2 h-4 w-4" />
        Añadir imagen
      </Button>
    </div>
  );
};

interface ManifestSection {
  title: string;
  body: string;
}

const ManifestEditor: React.FC<{
  kicker: string;
  sections: ManifestSection[];
  onKicker: (s: string) => void;
  onSections: (s: ManifestSection[]) => void;
}> = ({ kicker, sections, onKicker, onSections }) => {
  const update = (idx: number, patch: Partial<ManifestSection>) => {
    const next = [...sections];
    next[idx] = { ...next[idx], ...patch };
    onSections(next);
  };
  const remove = (idx: number) => onSections(sections.filter((_, i) => i !== idx));
  return (
    <div className="space-y-3">
      <div>
        <Label>Kicker</Label>
        <Input value={kicker} onChange={(e) => onKicker(e.target.value)} />
      </div>
      {sections.map((s, i) => (
        <div key={i} className="space-y-2 rounded border p-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Título"
              value={s.title}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <Textarea
            rows={3}
            placeholder="Cuerpo"
            value={s.body}
            onChange={(e) => update(i, { body: e.target.value })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onSections([...sections, { title: '', body: '' }])}
      >
        <Plus className="mr-2 h-4 w-4" />
        Añadir sección
      </Button>
    </div>
  );
};

export default BlocksEditor;
