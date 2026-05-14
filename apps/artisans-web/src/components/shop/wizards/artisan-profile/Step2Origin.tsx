import React from 'react';
import { ArtisanProfileData, LEARNED_FROM_OPTIONS, ETHNIC_RELATION_OPTIONS } from '@/types/artisanProfile';

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
}

const inputClass = "w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 transition-all hover:border-[#e2d5cf]/70";
const inputBg = { background: 'rgba(247,244,239,0.4)' };
const textareaClass = "w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70";
const labelClass = "font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2";
const sectionTitle = "font-['Manrope'] text-[11px] font-[800] uppercase tracking-widest text-[#ec6d13] mb-4";

export const Step2Origin: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="flex flex-col gap-6">

      {/* Módulo 1: El aprendizaje */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>El aprendizaje</p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>¿De quién aprendiste? <span className="text-[#ef4444]">*</span></label>
              <select value={data.learnedFrom} onChange={(e) => onChange({ learnedFrom: e.target.value })} className={inputClass} style={inputBg}>
                <option value="">Selecciona...</option>
                {LEARNED_FROM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>¿A qué edad empezaste? <span className="text-[#ef4444]">*</span></label>
              <input
                type="number" min={1} max={99}
                value={data.startAge || ''}
                onChange={(e) => onChange({ startAge: parseInt(e.target.value) || 0 })}
                placeholder="Ej. 12"
                className={inputClass} style={inputBg}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Historia del aprendizaje <span className="text-[#ef4444]">*</span></label>
            <textarea
              rows={4}
              value={data.learnedFromDetail}
              onChange={(e) => onChange({ learnedFromDetail: e.target.value })}
              placeholder="Cuéntanos cómo fue ese aprendizaje. ¿Quién te enseñó? ¿Dónde? ¿Qué recuerdas de esos primeros momentos?"
              className={textareaClass} style={inputBg}
            />
          </div>
        </div>
      </section>

      {/* Módulo 2: Significado y motivación */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>Significado y motivación</p>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>¿Qué significa este oficio para ti? <span className="text-[#ef4444]">*</span></label>
            <textarea rows={3} value={data.culturalMeaning} onChange={(e) => onChange({ culturalMeaning: e.target.value })}
              placeholder="Más allá del trabajo, ¿qué representa este oficio en tu vida y tu identidad?"
              className={textareaClass} style={inputBg} />
          </div>
          <div>
            <label className={labelClass}>¿Qué te motiva a seguir? <span className="text-[#ef4444]">*</span></label>
            <textarea rows={3} value={data.motivation} onChange={(e) => onChange({ motivation: e.target.value })}
              placeholder="¿Qué te hace levantarte a trabajar cada día en este oficio?"
              className={textareaClass} style={inputBg} />
          </div>
          <div>
            <label className={labelClass}>Mensaje o filosofía del taller</label>
            <textarea rows={2} value={data.craftMessage || ''} onChange={(e) => onChange({ craftMessage: e.target.value })}
              placeholder="Si tuvieras que resumir la esencia de tu trabajo en una frase, ¿cuál sería?"
              className={textareaClass} style={inputBg} />
          </div>
        </div>
      </section>

      {/* Módulo 3: Territorio */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>Territorio de origen</p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>País</label>
              <input type="text" value={data.country} onChange={(e) => onChange({ country: e.target.value })} placeholder="Colombia" className={inputClass} style={inputBg} />
            </div>
            <div>
              <label className={labelClass}>Departamento</label>
              <input type="text" value={data.department || ''} onChange={(e) => onChange({ department: e.target.value })} placeholder="Ej. Nariño" className={inputClass} style={inputBg} />
            </div>
            <div>
              <label className={labelClass}>Municipio</label>
              <input type="text" value={data.municipality || ''} onChange={(e) => onChange({ municipality: e.target.value })} placeholder="Ej. Pasto" className={inputClass} style={inputBg} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Comunidad o vereda</label>
              <input type="text" value={data.communityVillage || ''} onChange={(e) => onChange({ communityVillage: e.target.value })} placeholder="Opcional" className={inputClass} style={inputBg} />
            </div>
            <div>
              <label className={labelClass}>Relación étnica o comunitaria</label>
              <select value={data.ethnicRelation || ''} onChange={(e) => onChange({ ethnicRelation: e.target.value })} className={inputClass} style={inputBg}>
                <option value="">Ninguna / No aplica</option>
                {ETHNIC_RELATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Historia regional del oficio</label>
            <textarea rows={3} value={data.regionalHistory || ''} onChange={(e) => onChange({ regionalHistory: e.target.value })}
              placeholder="¿Tiene tu región una tradición en este oficio? ¿Cómo se relaciona tu trabajo con esa historia?"
              className={textareaClass} style={inputBg} />
          </div>
        </div>
      </section>
    </div>
  );
};
