import React, { useRef } from 'react';

const T = {
  dark:   '#151b2d',
  orange: '#ec6d13',
  muted:  '#54433e',
  sans:   "'Manrope', sans-serif",
};

const FieldLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <div style={{ marginBottom: 6 }}>
    <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: `${T.muted}80` }}>{children}</span>
    {hint && <span style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}40`, marginLeft: 6 }}>{hint}</span>}
  </div>
);

interface ImageUploadSlotProps {
  label: string;
  hint?: string;
  url: string;
  uploading: boolean;
  onFile: (f: File) => void;
  onRemove: () => void;
  aspect?: string;
  icon?: string;
}

export const ImageUploadSlot: React.FC<ImageUploadSlotProps> = ({
  label, hint, url, uploading, onFile, onRemove,
  aspect = 'aspect-video', icon = 'add_photo_alternate',
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div
        onClick={() => !uploading && ref.current?.click()}
        className={`relative ${aspect} rounded-xl overflow-hidden cursor-pointer group`}
        style={{ background: url ? 'transparent' : `${T.dark}05`, border: `2px dashed ${T.dark}12` }}
      >
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: 24, color: T.orange }}>progress_activity</span>
          </div>
        )}
        {url
          ? <img src={url} className="w-full h-full object-cover" alt={label} />
          : (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: `${T.muted}25` }}>{icon}</span>
              <span style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}40`, textAlign: 'center' }}>Subir imagen</span>
            </div>
          )
        }
        {url && !uploading && (
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: 'white' }}>Cambiar</span>
            <button
              onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'white', fontFamily: T.sans, fontSize: 10, fontWeight: 700 }}
            >
              Quitar
            </button>
          </div>
        )}
        <input
          ref={ref} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
        />
      </div>
    </div>
  );
};

export default ImageUploadSlot;
