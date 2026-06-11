import React, { useRef, useState } from 'react';
import { SpeechTextarea } from '@/components/ui/speech-textarea';
import { UploadFolder, uploadImage } from '@/services/fileUpload.actions';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';
import { ArtisanProfileData } from '@/types/artisanProfile';
import { ToolPicker } from '@/components/shop/new-product-wizard/components/TaxonomyPicker';

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
  userId?: string;
}

const inputBg = { background: 'rgba(247,244,239,0.4)' };
const textareaClass = "w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70";
const labelClass = "font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2";
const sectionTitle = "font-['Manrope'] text-[11px] font-[800] uppercase tracking-widest text-[#ec6d13] mb-4";

const WORKSHOP_SLOTS = [
  { icon: 'storefront',    label: 'Tu taller',      hint: 'Vista general del espacio', required: true },
  { icon: 'engineering',   label: 'Tú trabajando',  hint: 'En plena faena' },
  { icon: 'construction',  label: 'Herramientas',   hint: 'Tus instrumentos de oficio' },
  { icon: 'category',      label: 'Materiales',     hint: 'Materia prima en proceso' },
  { icon: 'photo_camera',  label: 'Otro ángulo',    hint: 'Vista adicional del taller' },
] as const;

interface WorkshopImageSlotProps {
  icon: string;
  label: string;
  hint: string;
  required?: boolean;
  value?: string;
  onChange: (url: string) => void;
  height: string;
  small?: boolean;
}

const WorkshopImageSlot: React.FC<WorkshopImageSlotProps> = ({
  icon, label, hint, required, value, onChange, height, small,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const optimized = await optimizeImage(file, ImageOptimizePresets.product);
      const result = await uploadImage(optimized, UploadFolder.PROFILES);
      onChange(result.url);
    } catch {
      // upload error handled by interceptor
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center border border-[#e2d5cf]/40 cursor-pointer overflow-hidden rounded-lg ${height} group transition-all hover:border-[#ec6d13]/30 hover:shadow-sm`}
      style={{ background: '#ffffff' }}
    >
      {uploading ? (
        <span className="material-symbols-outlined text-2xl text-[#ec6d13] animate-spin">progress_activity</span>
      ) : value ? (
        <>
          <img src={value} className="w-full h-full object-cover" alt={label} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleDelete}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-[#ef4444] hover:text-white text-[#54433e] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
            <span className="text-white text-[10px] font-[700] uppercase tracking-widest">Cambiar foto</span>
          </div>
        </>
      ) : (
        <>
          <span className={`material-symbols-outlined ${small ? 'text-2xl' : 'text-4xl'} text-[#54433e]/25 mb-1.5 group-hover:scale-110 group-hover:text-[#ec6d13] transition-all`}>
            {icon}
          </span>
          <span className={`${small ? 'text-[10px]' : 'text-[13px]'} font-[800] uppercase tracking-widest text-[#54433e]/60 mb-0.5 text-center px-2`}>
            {label}
          </span>
          <span className={`${small ? 'text-[10px]' : 'text-[11px]'} text-[#54433e]/35 leading-tight text-center px-3`}>
            {hint}
          </span>
          {required && (
            <div className="absolute bottom-3 left-0 w-full flex justify-center">
              <span className="text-[10px] font-[800] uppercase tracking-widest text-[#ef4444]/70">Obligatoria</span>
            </div>
          )}
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
};

// ── MobileWorkshopSlot ───────────────────────────────────────────────────────

interface MobileWorkshopSlotProps {
  icon: string;
  label: string;
  required?: boolean;
  value?: string;
  onChange: (url: string) => void;
}

const MobileWorkshopSlot: React.FC<MobileWorkshopSlotProps> = ({ icon, label, required, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const optimized = await optimizeImage(file, ImageOptimizePresets.product);
      const result = await uploadImage(optimized, UploadFolder.PROFILES);
      onChange(result.url);
    } catch {
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-[80px] h-[80px] rounded-xl border border-[#e2d5cf]/50 cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all active:border-[#ec6d13]/50 active:scale-95"
        style={{ background: value ? undefined : 'rgba(255,255,255,0.8)' }}
      >
        {uploading ? (
          <span className="material-symbols-outlined text-[24px] text-[#ec6d13] animate-spin">progress_activity</span>
        ) : value ? (
          <>
            <img src={value} className="w-full h-full object-cover" alt={label} />
            <button
              type="button"
              onClick={handleDelete}
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)' }}
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>close</span>
            </button>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[26px]" style={{ color: 'rgba(84,67,62,0.28)' }}>
              {icon}
            </span>
            {required && (
              <div className="absolute bottom-1 left-0 w-full flex justify-center">
                <span className="text-[8px] font-[800] uppercase tracking-wider text-[#ef4444]/70">Req.</span>
              </div>
            )}
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
      <span
        className="text-[9px] font-['Manrope'] font-[800] uppercase tracking-wider text-center leading-tight"
        style={{ color: 'rgba(84,67,62,0.5)', width: 80 }}
      >
        {label}
      </span>
    </div>
  );
};

export const Step4Workshop: React.FC<Props> = ({ data, onChange, userId }) => {

  return (
    <div className="flex flex-col gap-6">

      {/* Registro visual */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>Registro visual del taller</p>

        {/* Mobile: tira horizontal scrollable */}
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' as any }}>
            {WORKSHOP_SLOTS.map((slot, i) => {
              const value = i === 0 ? data.workshopPhoto : (data.workshopPhotos ?? [])[i - 1];
              return (
                <MobileWorkshopSlot
                  key={slot.label}
                  icon={slot.icon}
                  label={slot.label}
                  required={'required' in slot ? slot.required : false}
                  value={value}
                  onChange={(url) => {
                    if (i === 0) {
                      onChange({ workshopPhoto: url });
                    } else {
                      const next = [...(data.workshopPhotos ?? [])];
                      next[i - 1] = url;
                      onChange({ workshopPhotos: next });
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Desktop: foto principal grande + 2×2 */}
        <div className="hidden md:flex gap-3">
          <div className="flex-1 min-w-0">
            <WorkshopImageSlot
              {...WORKSHOP_SLOTS[0]}
              value={data.workshopPhoto}
              onChange={(url) => onChange({ workshopPhoto: url })}
              height="h-full min-h-[270px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 w-[45%] shrink-0">
            {WORKSHOP_SLOTS.slice(1).map((slot, i) => {
              const photos = data.workshopPhotos ?? [];
              return (
                <WorkshopImageSlot
                  key={slot.label}
                  {...slot}
                  value={photos[i]}
                  onChange={(url) => {
                    const next = [...(data.workshopPhotos ?? [])];
                    next[i] = url;
                    onChange({ workshopPhotos: next });
                  }}
                  height="h-[130px]"
                  small
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Descripción */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>Descripción del taller</p>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={labelClass + ' mb-0'}>Describe tu espacio de trabajo <span className="text-[#ef4444]">*</span></label>
              <span className="font-['Manrope'] text-[9px] font-[800] text-[#54433e]/40 uppercase tracking-widest">
                {data.workshopDescription.length} / 150
              </span>
            </div>
            <SpeechTextarea
              rows={4}
              value={data.workshopDescription}
              onChange={(v) => onChange({ workshopDescription: v })}
              placeholder="Describe el espacio donde trabajas, su atmósfera, su historia o por qué es el lugar ideal para tu arte..."
              className={textareaClass} style={inputBg}
            />
          </div>
          <div>
            <label className={labelClass}>Proceso de creación <span className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#ec6d13] ml-1 px-1.5 py-0.5 bg-[#ec6d13]/10 rounded">Recomendado</span></label>
            <SpeechTextarea
              rows={3}
              value={data.creationProcess || ''}
              onChange={(v) => onChange({ creationProcess: v })}
              placeholder="Cuéntanos cómo suele nacer una pieza en tu taller. Pasos, tiempos, rituales..."
              className={textareaClass} style={inputBg}
            />
          </div>
        </div>
      </section>

      {/* Herramientas */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>Herramientas del taller <span className="normal-case tracking-normal font-[500] text-[11px] text-[#54433e]/30 ml-1">— Opcional</span></p>
        <ToolPicker
          userId={userId}
          selected={data.workshopTools}
          onChange={(names) => onChange({ workshopTools: names })}
          suggestFromCraftIds={data.craftIds?.length ? data.craftIds : (data.craftId ? [data.craftId] : [])}
        />
      </section>
    </div>
  );
};
