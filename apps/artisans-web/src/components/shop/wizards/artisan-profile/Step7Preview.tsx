import React from 'react';
import { ArtisanProfileData } from '@/types/artisanProfile';

interface Props {
  data: ArtisanProfileData;
  generatedStory?: any;
  isGenerating?: boolean;
  onEditStep?: (step: number) => void;
}

const glassCard = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 2px 8px -2px rgba(0,0,0,0.04)',
};

const SectionCard: React.FC<{ title: string; step: number; onEdit?: (step: number) => void; children: React.ReactNode }> = ({ title, step, onEdit, children }) => (
  <div className="relative rounded-xl p-5 group" style={glassCard}>
    <div className="flex items-center justify-between mb-4">
      <p className="font-['Noto_Serif'] text-[16px] font-[700] text-[#151b2d]">{title}</p>
      {onEdit && (
        <button
          onClick={() => onEdit(step)}
          className="flex items-center gap-1 font-['Manrope'] text-[10px] font-[700] text-[#ec6d13] opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
        >
          <span className="material-symbols-outlined text-[13px]">edit</span>
          Editar
        </button>
      )}
    </div>
    {children}
  </div>
);

const Val: React.FC<{ v?: string | null }> = ({ v }) =>
  v?.trim()
    ? <span className="font-['Manrope'] text-[13px] font-[500] text-[#151b2d] leading-relaxed">{v}</span>
    : <span className="font-['Manrope'] text-[13px] text-[#54433e]/30 italic">Pendiente por completar</span>;

const Chip: React.FC<{ label: string; color?: 'orange' | 'green' | 'neutral' }> = ({ label, color = 'orange' }) => {
  const cls = {
    orange:  'bg-[#ec6d13]/10 text-[#ec6d13] border-[#ec6d13]/20',
    green:   'bg-[#166534]/10 text-[#166534] border-[#166534]/20',
    neutral: 'bg-[#54433e]/6 text-[#54433e] border-[#54433e]/10',
  }[color];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-[700] uppercase tracking-wider border ${cls}`}>
      {label}
    </span>
  );
};

export const Step7Preview: React.FC<Props> = ({ data, isGenerating, onEditStep }) => {
  const requiredChecks = [
    { label: 'Nombre del artesano',       done: !!data.artisanName?.trim() },
    { label: 'Nombre artístico / taller', done: !!data.artisticName?.trim() },
    { label: 'Foto de perfil',            done: !!data.artisanPhoto },
    { label: 'Historia del aprendizaje',  done: !!data.learnedFromDetail?.trim() },
    { label: 'Técnicas',                  done: data.techniques.length > 0 },
    { label: 'Materiales',                done: data.materials.length > 0 },
  ];
  const totalDone = requiredChecks.filter((c) => c.done).length;
  const pct = Math.round((totalDone / requiredChecks.length) * 100);
  const allDone = pct === 100;

  return (
    <div className="flex flex-col gap-4">
      {isGenerating && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#ec6d13]/5 border border-[#ec6d13]/20">
          <div className="w-4 h-4 border-2 border-[#ec6d13]/20 border-t-[#ec6d13] rounded-full animate-spin shrink-0" />
          <p className="font-['Manrope'] text-[13px] text-[#ec6d13] font-[600]">Generando narrativa con IA...</p>
        </div>
      )}

      {/* Quality bar */}
      <div className="p-4 rounded-xl border border-[#e2d5cf]/20" style={{ background: '#ffffff' }}>
        <div className="flex justify-between items-center mb-2">
          <span className={`font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest ${allDone ? 'text-[#166534]' : 'text-[#ef4444]'}`}>
            {allDone ? 'Listo para publicar' : 'Perfil incompleto'}
          </span>
          <span className="font-['Manrope'] text-[14px] font-[700] text-[#ec6d13]">{pct}%</span>
        </div>
        <div className="h-1.5 bg-[#e2d5cf]/30 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-[#ec6d13] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {requiredChecks.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[15px]" style={{ color: c.done ? '#166534' : '#ef4444', fontVariationSettings: c.done ? "'FILL' 1" : "'FILL' 0" }}>
                {c.done ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-['Manrope'] text-[12px] font-[500] ${c.done ? 'text-[#151b2d]' : 'text-[#54433e]/40'}`}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Identidad */}
      <SectionCard title="Identidad" step={1} onEdit={onEditStep}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full shrink-0 overflow-hidden border-2 border-[#e2d5cf]/30 flex items-center justify-center bg-[#54433e]/5">
            {data.artisanPhoto
              ? <img src={data.artisanPhoto} className="w-full h-full object-cover" alt="" />
              : <span className="material-symbols-outlined text-[28px] text-[#54433e]/20">account_circle</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-['Noto_Serif'] text-[20px] font-[700] text-[#151b2d] leading-tight">
              {data.artisanName || <span className="text-[#54433e]/25">Nombre Pendiente</span>}
            </p>
            {data.artisticName && <p className="font-['Manrope'] text-[14px] font-[700] text-[#ec6d13] italic mt-0.5">{data.artisticName}</p>}
            {data.shortBio && <p className="font-['Manrope'] text-[12px] text-[#54433e]/70 mt-2 leading-relaxed">{data.shortBio}</p>}
          </div>
        </div>
      </SectionCard>

      {/* 2. Historia */}
      <SectionCard title="Historia y tradición" step={2} onEdit={onEditStep}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/40 mb-1">Maestro iniciador</p>
              <Val v={data.learnedFrom} />
            </div>
            <div>
              <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/40 mb-1">Historia del aprendizaje</p>
              <Val v={data.learnedFromDetail} />
            </div>
          </div>
          <div className="space-y-3 border-l border-[#e2d5cf]/30 pl-4">
            <div>
              <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/40 mb-1">Significado del oficio</p>
              <Val v={data.culturalMeaning} />
            </div>
            {(data.department || data.municipality) && (
              <div>
                <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/40 mb-1">Territorio</p>
                <span className="font-['Manrope'] text-[13px] font-[500] text-[#151b2d]">
                  {[data.municipality, data.department, data.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* 3. Taller */}
      <SectionCard title="Taller y proceso" step={3} onEdit={onEditStep}>
        <div className="grid grid-cols-3 gap-2 mb-4 h-20">
          {[data.workshopPhoto, data.workshopActionPhoto, data.workshopToolsPhoto].map((photo, i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-[#e2d5cf]/30 flex items-center justify-center bg-[#54433e]/3">
              {photo
                ? <img src={photo} className="w-full h-full object-cover" alt="" />
                : <span className="material-symbols-outlined text-[22px] text-[#54433e]/15">{['factory', 'front_hand', 'construction'][i]}</span>
              }
            </div>
          ))}
        </div>
        <Val v={data.workshopDescription} />
        {data.workshopTools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.workshopTools.map((t) => <Chip key={t} label={t} color="neutral" />)}
          </div>
        )}
      </SectionCard>

      {/* 4. Arte */}
      <SectionCard title="Arte y estilo" step={4} onEdit={onEditStep}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/40 mb-2">Técnicas</p>
            <div className="flex flex-wrap gap-1.5">
              {data.techniques.length > 0
                ? data.techniques.map((t) => <Chip key={t} label={t} color="green" />)
                : <Chip label="POR DEFINIR" color="orange" />
              }
            </div>
          </div>
          <div>
            <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/40 mb-2">Materiales</p>
            <div className="flex flex-wrap gap-1.5">
              {data.materials.length > 0
                ? data.materials.map((m) => <Chip key={m} label={m} color="orange" />)
                : <Chip label="SIN MATERIALES" color="neutral" />
              }
            </div>
          </div>
        </div>
        {data.uniqueness && (
          <div className="mt-3 pt-3 border-t border-[#e2d5cf]/30">
            <p className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#54433e]/40 mb-1">Qué lo hace especial</p>
            <Val v={data.uniqueness} />
          </div>
        )}
      </SectionCard>

    </div>
  );
};
