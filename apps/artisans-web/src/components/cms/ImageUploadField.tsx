import { useRef, useState } from 'react';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  uploadImage,
  UploadFolder,
} from '@/services/fileUpload.actions';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder?: UploadFolder;
  altValue?: string;
  onAltChange?: (alt: string) => void;
  label?: string;
  previewAspect?: string;
  maxSizeBytes?: number;
  accept?: string;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
const VALID_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fieldLabel = "font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-1.5";
const fieldInput = [
  'w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2',
  'text-[12px] font-[500] text-[#151b2d]/60 placeholder:text-[#151b2d]/25 font-mono',
  'focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10',
  'hover:border-[#e2d5cf]/70 transition-all',
].join(' ');

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
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error subiendo imagen';
      toast.error(typeof msg === 'string' ? msg : 'Error subiendo imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className={fieldLabel}>{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {/* Preview / upload zone */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-[#e2d5cf]/40" style={{ aspectRatio: previewAspect }}>
          <img
            src={value}
            alt={altValue ?? ''}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#151b2d]/0 group-hover:bg-[#151b2d]/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-[700] bg-white/90 text-[#151b2d] hover:bg-white transition-all"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Reemplazar
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-[700] bg-red-500/90 text-white hover:bg-red-500 transition-all"
            >
              <X className="w-3 h-3" /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full rounded-xl border border-dashed border-[#e2d5cf]/60 hover:border-[#ec6d13]/40 hover:bg-[#ec6d13]/[0.02] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 py-6"
          style={{ aspectRatio: previewAspect, maxHeight: 180 }}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-[#ec6d13] animate-spin" />
          ) : (
            <ImageIcon className="w-5 h-5 text-[#54433e]/25" />
          )}
          <span className="text-[11px] font-[600] text-[#54433e]/40">
            {uploading ? 'Subiendo…' : 'Subir imagen'}
          </span>
          {!uploading && (
            <span className="text-[10px] text-[#54433e]/25">JPG, PNG, WEBP · máx 10MB</span>
          )}
        </button>
      )}

      {/* URL manual */}
      <input
        type="text"
        placeholder="o pega URL pública…"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={fieldInput}
        style={{ background: 'rgba(247,244,239,0.4)' }}
      />

      {/* Alt text */}
      {onAltChange && (
        <input
          type="text"
          placeholder="Texto alternativo (accesibilidad)"
          value={altValue ?? ''}
          disabled={disabled}
          onChange={(e) => onAltChange(e.target.value)}
          className={fieldInput}
          style={{ background: 'rgba(247,244,239,0.4)' }}
        />
      )}
    </div>
  );
}
