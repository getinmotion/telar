/**
 * ImageUploadField — input reutilizable para imágenes del CMS.
 *
 * Combina:
 *  - Botón "Subir imagen" (S3 vía /file-upload/image, optimización + validación)
 *  - Preview con botón "Quitar"
 *  - Input de URL manual (para pegar links existentes)
 *  - Input opcional de alt text para accesibilidad
 *
 * El valor se persiste como un string URL público (cdn / s3). Reusa
 * `useImageUpload` cuando la carpeta es PRODUCTS; para cualquier otra carpeta
 * usa `uploadImage` directamente.
 */
import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  uploadImage,
  UploadFolder,
} from '@/services/fileUpload.actions';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface ImageUploadFieldProps {
  /** Current URL value. Empty string when nothing is set. */
  value: string;
  /** Called whenever the URL changes (upload, paste, or clear). */
  onChange: (url: string) => void;
  /** S3 folder. Defaults to CMS. */
  folder?: UploadFolder;
  /** Optional alt-text value (for accessibility) — pass through if you also persist alt. */
  altValue?: string;
  /** Called whenever alt changes. Omit to hide the alt input. */
  onAltChange?: (alt: string) => void;
  /** Visible label above the field. */
  label?: string;
  /** Aspect ratio for the preview thumb. Default '16/9'. */
  previewAspect?: string;
  /** Max file size in bytes. Default 10MB. */
  maxSizeBytes?: number;
  /** Accept attribute on the file input. */
  accept?: string;
  /** Disable when parent is saving. */
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ImageUploadField({
  value,
  onChange,
  folder = UploadFolder.CMS,
  altValue,
  onAltChange,
  label = 'Imagen',
  previewAspect = '16/9',
  maxSizeBytes = DEFAULT_MAX_SIZE,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  disabled,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Client-side validation
    if (file.size > maxSizeBytes) {
      toast.error(`Imagen muy grande (máx ${Math.round(maxSizeBytes / 1024 / 1024)}MB)`);
      return;
    }
    if (!VALID_MIME.includes(file.type)) {
      toast.error('Formato no válido. Usa JPG, PNG o WEBP.');
      return;
    }

    setUploading(true);
    try {
      // Optimize on client to reduce payload
      let toUpload: File;
      try {
        toUpload = await optimizeImage(file, ImageOptimizePresets.product);
      } catch {
        toUpload = file;
      }
      const result = await uploadImage(toUpload, folder);
      onChange(result.url);
      toast.success('Imagen subida');
    } catch (err: any) {
      console.error('[ImageUploadField] upload error', err);
      const msg =
        err?.response?.data?.message ?? err?.message ?? 'Error subiendo imagen';
      toast.error(typeof msg === 'string' ? msg : 'Error subiendo imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-xs uppercase tracking-widest">{label}</Label>
      )}

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt={altValue ?? ''}
            className="w-full object-cover rounded-md border bg-muted"
            style={{ aspectRatio: previewAspect }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0.3';
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => onChange('')}
            className="absolute top-2 right-2 gap-1"
          >
            <X className="w-3 h-3" /> Quitar
          </Button>
        </div>
      ) : (
        <div
          className="flex items-center justify-center border border-dashed rounded-md text-muted-foreground text-xs bg-muted/30"
          style={{ aspectRatio: previewAspect }}
        >
          Sin imagen
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || disabled}
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {value ? 'Reemplazar' : 'Subir imagen'}
        </Button>
        <span className="text-[10px] text-muted-foreground">
          o pega URL pública abajo
        </span>
      </div>

      <Input
        placeholder="https://..."
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-xs"
      />

      {onAltChange && (
        <Input
          placeholder="Alt text (accesibilidad)"
          value={altValue ?? ''}
          disabled={disabled}
          onChange={(e) => onAltChange(e.target.value)}
        />
      )}
    </div>
  );
}
