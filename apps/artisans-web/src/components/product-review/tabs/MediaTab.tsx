/**
 * MediaTab — Edit product images: upload, delete, reorder, mark primary.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Loader2,
  Save,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useImageUpload } from '@/components/shop/ai-upload/hooks/useImageUpload';
import type {
  CreateProductMediaDto,
  ProductResponse,
} from '@/services/products-new.types';

interface MediaTabProps {
  product: ProductResponse;
  saving: boolean;
  onSave: (updates: { media: CreateProductMediaDto[] }) => void;
}

interface EditableMedia extends CreateProductMediaDto {
  _key: string;
}

const buildInitialMedia = (product: ProductResponse): EditableMedia[] =>
  (product.media || [])
    .filter((m) => m.mediaType === 'image')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m, idx) => ({
      _key: m.id,
      mediaUrl: m.mediaUrl,
      mediaType: 'image',
      isPrimary: m.isPrimary,
      displayOrder: idx,
    }));

const reindex = (items: EditableMedia[]): EditableMedia[] =>
  items.map((m, i) => ({ ...m, displayOrder: i }));

export const MediaTab: React.FC<MediaTabProps> = ({ product, saving, onSave }) => {
  const [items, setItems] = useState<EditableMedia[]>(() => buildInitialMedia(product));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImages, isUploading } = useImageUpload();

  useEffect(() => {
    setItems(buildInitialMedia(product));
  }, [product]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const urls = await uploadImages(Array.from(files));
      setItems((prev) => {
        const hasPrimary = prev.some((p) => p.isPrimary);
        const additions: EditableMedia[] = urls.map((url, idx) => ({
          _key: `new-${Date.now()}-${idx}`,
          mediaUrl: url,
          mediaType: 'image',
          isPrimary: !hasPrimary && prev.length === 0 && idx === 0,
          displayOrder: prev.length + idx,
        }));
        return reindex([...prev, ...additions]);
      });
      toast.success(`${urls.length} imagen(es) subida(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imágenes');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (key: string) => {
    setItems((prev) => {
      const removed = prev.find((m) => m._key === key);
      const next = reindex(prev.filter((m) => m._key !== key));
      if (removed?.isPrimary && next.length > 0 && !next.some((m) => m.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const handleSetPrimary = (key: string) => {
    setItems((prev) =>
      prev.map((m) => ({ ...m, isPrimary: m._key === key })),
    );
  };

  const handleMove = (key: string, direction: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((m) => m._key === key);
      if (idx === -1) return prev;
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return reindex(next);
    });
  };

  const handleSave = () => {
    if (items.length > 0 && !items.some((m) => m.isPrimary)) {
      toast.error('Marca al menos una imagen como principal');
      return;
    }
    onSave({
      media: items.map(({ _key, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
          Imágenes ({items.length})
        </h3>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || saving}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Cargar imágenes
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || isUploading}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar imágenes
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No hay imágenes. Usa "Cargar imágenes" para añadir.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((media, idx) => {
            const url = media.mediaUrl || '';
            const isExternal = url.startsWith('http');
            return (
              <div
                key={media._key}
                className="relative overflow-hidden rounded-lg border bg-muted"
              >
                {isExternal ? (
                  <img
                    src={url}
                    alt={`Imagen ${idx + 1}`}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center p-4 text-center">
                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <code className="break-all text-xs text-muted-foreground">
                      {url}
                    </code>
                    <span className="mt-1 text-xs text-muted-foreground">
                      (ruta local)
                    </span>
                  </div>
                )}

                <div className="absolute left-2 top-2 flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    #{idx + 1}
                  </Badge>
                  {media.isPrimary && (
                    <Badge className="text-xs">Principal</Badge>
                  )}
                </div>

                <div className="absolute inset-x-2 bottom-2 flex flex-wrap items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => handleMove(media._key, -1)}
                      disabled={idx === 0 || saving}
                      title="Mover arriba"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => handleMove(media._key, 1)}
                      disabled={idx === items.length - 1 || saving}
                      title="Mover abajo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant={media.isPrimary ? 'default' : 'secondary'}
                      className="h-7 w-7"
                      onClick={() => handleSetPrimary(media._key)}
                      disabled={saving}
                      title="Marcar como principal"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => handleDelete(media._key)}
                      disabled={saving}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
