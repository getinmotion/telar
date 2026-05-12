import React, { useState, KeyboardEvent } from 'react';
import { ImageUploader } from '@/components/shop/ai-upload/ImageUploader';
import { UploadFolder } from '@/services/fileUpload.actions';
import { ArtisanProfileData } from '@/types/artisanProfile';

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
}

const inputBg = { background: 'rgba(247,244,239,0.4)' };
const textareaClass = "w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70";
const labelClass = "font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2";
const sectionTitle = "font-['Manrope'] text-[11px] font-[800] uppercase tracking-widest text-[#ec6d13] mb-4";

interface ImageSlotProps { label: string; badge: string; value?: string; onChange: (url: string) => void; }

const ImageSlot: React.FC<ImageSlotProps> = ({ label, badge, value, onChange }) => {
  const badgeColor = badge === 'Obligatorio'
    ? 'bg-[#ef4444]/8 text-[#ef4444]'
    : badge === 'Recomendado'
    ? 'bg-[#ec6d13]/10 text-[#ec6d13]'
    : 'text-[#54433e]/40';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-['Manrope'] text-[13px] font-[700] text-[#151b2d]">{label}</span>
        <span className={`font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest px-2 py-0.5 rounded ${badgeColor}`}>{badge}</span>
      </div>
      <ImageUploader
        value={value ? [value] : []}
        onChange={(urls) => onChange(urls[0] || '')}
        maxFiles={1}
        uploadFolder={UploadFolder.PROFILES}
        aspectRatio="square"
        placeholder="Subir"
      />
    </div>
  );
};

export const Step4Workshop: React.FC<Props> = ({ data, onChange }) => {
  const [toolInput, setToolInput] = useState('');

  const addTool = () => {
    const t = toolInput.trim();
    if (!t || data.workshopTools.includes(t)) return;
    onChange({ workshopTools: [...data.workshopTools, t] });
    setToolInput('');
  };
  const removeTool = (tool: string) => onChange({ workshopTools: data.workshopTools.filter((t) => t !== tool) });
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addTool(); } };

  return (
    <div className="flex flex-col gap-6">

      {/* Registro visual */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>Registro visual del taller</p>
        <div className="grid grid-cols-3 gap-4">
          <ImageSlot label="Tu taller" badge="Obligatorio" value={data.workshopPhoto} onChange={(url) => onChange({ workshopPhoto: url })} />
          <ImageSlot label="Tú trabajando" badge="Recomendado" value={data.workshopActionPhoto} onChange={(url) => onChange({ workshopActionPhoto: url })} />
          <ImageSlot label="Herramientas" badge="Opcional" value={data.workshopToolsPhoto} onChange={(url) => onChange({ workshopToolsPhoto: url })} />
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
            <textarea
              rows={4}
              value={data.workshopDescription}
              onChange={(e) => onChange({ workshopDescription: e.target.value })}
              placeholder="Describe el espacio donde trabajas, su atmósfera, su historia o por qué es el lugar ideal para tu arte..."
              className={textareaClass} style={inputBg}
            />
          </div>
          <div>
            <label className={labelClass}>Proceso de creación <span className="font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#ec6d13] ml-1 px-1.5 py-0.5 bg-[#ec6d13]/10 rounded">Recomendado</span></label>
            <textarea
              rows={3}
              value={data.creationProcess || ''}
              onChange={(e) => onChange({ creationProcess: e.target.value })}
              placeholder="Cuéntanos cómo suele nacer una pieza en tu taller. Pasos, tiempos, rituales..."
              className={textareaClass} style={inputBg}
            />
          </div>
        </div>
      </section>

      {/* Herramientas */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>Herramientas del taller <span className="normal-case tracking-normal font-[500] text-[11px] text-[#54433e]/30 ml-1">— Opcional</span></p>
        {data.workshopTools.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.workshopTools.map((tool) => (
              <span key={tool} className="flex items-center gap-1 bg-[#ec6d13]/10 border border-[#ec6d13]/20 text-[#ec6d13] px-3 py-1 rounded-full text-[11px] font-[600]">
                {tool}
                <button onClick={() => removeTool(tool)} className="hover:text-[#ef4444] transition-colors ml-0.5">
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          value={toolInput}
          onChange={(e) => setToolInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={addTool}
          placeholder="Escribe una herramienta y presiona Enter..."
          className="w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 transition-all"
          style={inputBg}
        />
      </section>
    </div>
  );
};
