import React from 'react';
import { ImageUploader } from '@/components/shop/ai-upload/ImageUploader';
import { UploadFolder } from '@/services/fileUpload.actions';
import { ArtisanProfileData } from '@/types/artisanProfile';

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
}

type BadgeVariant = 'required' | 'recommended' | 'optional';

const BADGE: Record<BadgeVariant, { cls: string; label: string }> = {
  required:    { cls: 'bg-[#ef4444]/8 text-[#ef4444]',    label: 'OBLIGATORIO' },
  recommended: { cls: 'bg-[#ec6d13]/10 text-[#ec6d13]',   label: 'RECOMENDADO' },
  optional:    { cls: 'bg-[#54433e]/6 text-[#54433e]/50', label: 'OPCIONAL' },
};

interface GalleryCardProps {
  title: string;
  description: string;
  badge: BadgeVariant;
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ title, description, badge, value, onChange, maxFiles = 1 }) => {
  const b = BADGE[badge];
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-[#e2d5cf]/20 h-full" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
      <div className="flex items-start justify-between">
        <p className="font-['Manrope'] text-[13px] font-[700] text-[#151b2d]">{title}</p>
        <span className={`font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest px-2 py-0.5 rounded ${b.cls}`}>{b.label}</span>
      </div>
      <ImageUploader
        value={value}
        onChange={onChange}
        maxFiles={maxFiles}
        uploadFolder={UploadFolder.PROFILES}
        aspectRatio="square"
        placeholder="Subir"
      />
      <p className="font-['Manrope'] text-[11px] text-[#54433e]/50 leading-snug">{description}</p>
    </div>
  );
};

export const Step6HumanGallery: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-['Manrope'] text-[13px] text-[#54433e]/60 leading-relaxed">
        Suma imágenes que ayuden a contar quién sostiene el oficio: tus manos, tus maestros, tu comunidad y tu entorno.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Tú trabajando — ocupa 2 filas */}
        <div className="row-span-2">
          <GalleryCard
            title="Tú trabajando"
            description="Una imagen tuya en acción, creando, preparando materiales o trabajando una pieza."
            badge="required"
            value={data.workingPhotos}
            onChange={(urls) => onChange({ workingPhotos: urls })}
            maxFiles={3}
          />
        </div>

        {/* Maestros */}
        <GalleryCard
          title="Tus maestros o referentes"
          description="Personas que te enseñaron o inspiraron."
          badge="recommended"
          value={data.maestrosPhotos}
          onChange={(urls) => onChange({ maestrosPhotos: urls })}
          maxFiles={2}
        />

        {/* Comunidad y entorno */}
        <div className="grid grid-cols-2 gap-4">
          <GalleryCard
            title="Comunidad o familia"
            description="Quienes comparten o heredan el oficio."
            badge="optional"
            value={data.communityPhotos}
            onChange={(urls) => onChange({ communityPhotos: urls })}
            maxFiles={2}
          />
          <GalleryCard
            title="Entorno cultural"
            description="El territorio que da vida a tu trabajo."
            badge="optional"
            value={data.environmentPhotos}
            onChange={(urls) => onChange({ environmentPhotos: urls })}
            maxFiles={2}
          />
        </div>
      </div>
    </div>
  );
};
