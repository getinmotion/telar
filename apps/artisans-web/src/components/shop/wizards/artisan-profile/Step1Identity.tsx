import React from 'react';
import { ImageUploader } from '@/components/shop/ai-upload/ImageUploader';
import { UploadFolder } from '@/services/fileUpload.actions';
import { ArtisanProfileData } from '@/types/artisanProfile';

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
}

export const Step1Identity: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="flex flex-col gap-8">
      {/* Nombre del artesano */}
      <div className="space-y-2">
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
          Nombre del artesano <span className="text-[#ef4444]">*</span>
        </label>
        <input
          type="text"
          value={data.artisanName}
          onChange={(e) => onChange({ artisanName: e.target.value })}
          placeholder="Nombre completo como aparecerá en tu perfil"
          className="w-full rounded-lg px-4 py-3 font-['Noto_Serif'] text-[22px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 transition-all hover:border-[#e2d5cf]/70"
          style={{ background: 'rgba(247,244,239,0.4)' }}
        />
      </div>

      {/* Nombre artístico */}
      <div className="space-y-2">
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
          Nombre artístico o del taller <span className="text-[#ef4444]">*</span>
        </label>
        <input
          type="text"
          value={data.artisticName}
          onChange={(e) => onChange({ artisticName: e.target.value })}
          placeholder="Ej. Tejidos Zenú, Taller del Barro..."
          className="w-full rounded-lg px-4 py-3 font-['Manrope'] text-[16px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 transition-all hover:border-[#e2d5cf]/70"
          style={{ background: 'rgba(247,244,239,0.4)' }}
        />
      </div>

      {/* Foto de perfil */}
      <div className="space-y-2">
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
          Foto de perfil
        </label>
        <div className="flex items-start gap-5">
          <div className="w-28 h-28 shrink-0">
            <ImageUploader
              value={data.artisanPhoto ? [data.artisanPhoto] : []}
              onChange={(urls) => onChange({ artisanPhoto: urls[0] || '' })}
              maxFiles={1}
              uploadFolder={UploadFolder.PROFILES}
              aspectRatio="square"
              placeholder="Subir"
            />
          </div>
          <p className="font-['Manrope'] text-[12px] text-[#54433e]/50 leading-relaxed mt-2">
            Foto tuya en contexto de trabajo. Evita fondos distractores. Una buena foto genera confianza y conexión con los compradores.
          </p>
        </div>
      </div>

      {/* Bio breve */}
      <div className="space-y-2">
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
          Presentación breve
        </label>
        <textarea
          rows={4}
          value={data.shortBio || ''}
          onChange={(e) => onChange({ shortBio: e.target.value })}
          placeholder="Quién eres, qué haces y qué hace especial tu oficio. Máximo 2-3 oraciones."
          className="w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70"
          style={{ background: 'rgba(247,244,239,0.4)' }}
        />
      </div>

      {/* Video opcional */}
      <div className="space-y-2">
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
          Video de presentación
          <span className="ml-2 text-[#54433e]/30 normal-case tracking-normal font-[500] text-[11px]">— Opcional</span>
        </label>
        <input
          type="url"
          value={data.artisanVideo || ''}
          onChange={(e) => onChange({ artisanVideo: e.target.value })}
          placeholder="https://youtube.com/... o https://vimeo.com/..."
          className="w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 transition-all hover:border-[#e2d5cf]/70"
          style={{ background: 'rgba(247,244,239,0.4)' }}
        />
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/40 italic">
          Un video corto aumenta significativamente la conexión con compradores.
        </p>
      </div>
    </div>
  );
};
