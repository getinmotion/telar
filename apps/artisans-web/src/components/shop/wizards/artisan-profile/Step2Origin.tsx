import React from 'react';
import { ArtisanProfileData, ETHNIC_RELATION_OPTIONS } from '@/types/artisanProfile';
import { SpeechTextarea } from '@/components/ui/speech-textarea';
import { MaestroPicker } from '@/components/shop/new-product-wizard/components/TaxonomyPicker';
import { removeArtisanMaestro } from '@/services/artisan-maestros.actions';

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
  artisanId?: string;
}

const inputClass = "w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 transition-all hover:border-[#e2d5cf]/70";
const inputBg = { background: 'rgba(247,244,239,0.4)' };
const textareaClass = "w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70";
const labelClass = "font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2";
const sectionTitle = "font-['Manrope'] text-[11px] font-[800] uppercase tracking-widest text-[#ec6d13] mb-4";

export const Step2Origin: React.FC<Props> = ({ data, onChange, artisanId = '' }) => {
  const handleNoMaestroToggle = async () => {
    const next = !data.noMaestro;
    if (next && data.maestros.length > 0) {
      // Remove all saved maestros from DB before toggling off
      await Promise.allSettled(data.maestros.filter(m => m.id).map(m => removeArtisanMaestro(m.id!)));
      onChange({ noMaestro: true, maestros: [] });
    } else {
      onChange({ noMaestro: next });
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Módulo 1: La cadena de transmisión */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className={sectionTitle} style={{ marginBottom: 0 }}>La cadena de transmisión</p>
          <button
            type="button"
            onClick={handleNoMaestroToggle}
            className="flex items-center gap-1.5 shrink-0 transition-colors"
            style={{ color: data.noMaestro ? '#ec6d13' : 'rgba(84,67,62,0.35)' }}
          >
            <span
              className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0"
              style={{
                borderColor: data.noMaestro ? '#ec6d13' : 'rgba(84,67,62,0.25)',
                background: data.noMaestro ? '#ec6d13' : 'transparent',
              }}
            >
              {data.noMaestro && <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>check</span>}
            </span>
            <span className="font-['Manrope'] text-[10px] font-[700] uppercase tracking-widest whitespace-nowrap">
              No tuve maestro
            </span>
          </button>
        </div>

        {data.noMaestro ? (
          <p className="font-['Manrope'] text-[12px] text-[#54433e]/45 italic leading-relaxed">
            Esta sección no se mostrará en tu perfil público. Puedes desactivar esta opción si deseas agregar maestros más adelante.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-3 leading-snug">
                ¿Quiénes te transmitieron este saber? Abuelas, maestros artesanos, comunidades, o el camino mismo.
                Cada nombre que registres da autenticidad a cada pieza que creas.
              </p>
              <MaestroPicker
                artisanId={artisanId}
                localMaestros={data.maestros ?? []}
                onChange={maestros => onChange({ maestros })}
              />
            </div>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-[#e2d5cf]/20 flex flex-col gap-5">
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

          <div>
            <label className={labelClass}>Mensaje o filosofía del taller</label>
            <SpeechTextarea
              rows={2}
              value={data.craftMessage || ''}
              onChange={(v) => onChange({ craftMessage: v })}
              placeholder="Si tuvieras que resumir la esencia de tu trabajo en una frase, ¿cuál sería?"
              className={textareaClass} style={inputBg}
            />
          </div>
        </div>
      </section>

      {/* Módulo 2: Territorio */}
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
            <SpeechTextarea
              rows={3}
              value={data.regionalHistory || ''}
              onChange={(v) => onChange({ regionalHistory: v })}
              placeholder="¿Tiene tu región una tradición en este oficio? ¿Cómo se relaciona tu trabajo con esa historia?"
              className={textareaClass} style={inputBg}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
