import React, { useState, useRef } from 'react';
import { ArtisanProfileData, LEARNED_FROM_OPTIONS, ETHNIC_RELATION_OPTIONS } from '@/types/artisanProfile';
import { SpeechTextarea } from '@/components/ui/speech-textarea';

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

// Chips de "cuándo" con su mapeo a edad aproximada
const WHEN_OPTIONS: { label: string; age: number }[] = [
  { label: 'Desde niño/a',             age: 8  },
  { label: 'En mi juventud',            age: 17 },
  { label: 'Hace algunos años',         age: 30 },
  { label: 'Lo descubrí recientemente', age: 40 },
];

// Compat: artesanos existentes con 'parents' o 'grandparents' se muestran
// como si hubieran elegido 'family'
function normalizeLearnedFrom(value: string): string {
  if (value === 'parents' || value === 'grandparents') return 'family';
  return value;
}

// Badge pequeño para campos reconocidos desde el registro
const FromRegistryBadge: React.FC = () => (
  <span
    className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded-full font-['Manrope'] text-[8px] font-[800] uppercase tracking-widest"
    style={{ background: 'rgba(236,109,19,0.1)', color: '#ec6d13' }}
  >
    <span className="material-symbols-outlined" style={{ fontSize: 9 }}>location_on</span>
    Desde tu registro
  </span>
);

export const Step2Origin: React.FC<Props> = ({ data, onChange }) => {
  const [showPreciseAge, setShowPreciseAge] = useState(false);

  // Captura los valores que llegaron pre-llenados desde el wizard (registro/shop)
  // al momento de montar el componente. Usado solo para mostrar badges — no bloquea edición.
  const initialRef = useRef({
    country:      data.country      || '',
    department:   data.department   || '',
    municipality: data.municipality || '',
  });
  const initial = initialRef.current;
  const hasLocationFromRegistry = !!(initial.department || initial.municipality);

  // El chip activo de "cuándo" se determina comparando startAge con los valores mapeados
  const activeWhen = WHEN_OPTIONS.find(o => o.age === data.startAge) ?? null;

  const handleLearnedFromSelect = (value: string) => {
    const normalized = normalizeLearnedFrom(data.learnedFrom);
    onChange({ learnedFrom: normalized === value ? '' : value });
  };

  const handleWhenSelect = (opt: { label: string; age: number }) => {
    onChange({ startAge: activeWhen?.age === opt.age ? 0 : opt.age });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── MÓDULO 1: El origen del oficio ───────────────── */}
      <section
        className="p-6 rounded-xl"
        style={{ background: '#ffffff', border: '1px solid rgba(226,213,207,0.2)', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}
      >
        {/* Encabezado editorial */}
        <div className="mb-6">
          <p className={sectionTitle}>El origen del oficio</p>
          <p className="font-['Manrope'] text-[13px] text-[#54433e]/55 leading-relaxed max-w-xl">
            Queremos entender cómo comenzó tu camino artesanal, qué personas o experiencias marcaron tu aprendizaje y cómo llegaste a lo que haces hoy.
          </p>
        </div>

        <div className="flex flex-col gap-8">

          {/* ── Parte 1: ¿Qué marcó el inicio? ─────────── */}
          <div>
            <p className="font-['Manrope'] text-[12px] font-[700] text-[#151b2d] mb-1">
              ¿Qué marcó el inicio de tu oficio?
              <span className="text-[#ef4444] ml-1">*</span>
            </p>
            <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-4 leading-snug">
              Elige la opción que mejor describe cómo llegaste a este camino.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEARNED_FROM_OPTIONS.map((opt) => {
                const normalized = normalizeLearnedFrom(data.learnedFrom);
                const isActive = normalized === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleLearnedFromSelect(opt.value)}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: isActive ? 'rgba(236,109,19,0.06)' : 'rgba(247,244,239,0.5)',
                      border: isActive ? '1.5px solid rgba(236,109,19,0.45)' : '1px solid rgba(226,213,207,0.5)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-[20px] shrink-0 mt-0.5"
                      style={{ color: isActive ? '#ec6d13' : 'rgba(84,67,62,0.35)' }}
                    >
                      {opt.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span
                        className="font-['Manrope'] text-[13px] font-[700] block leading-tight mb-0.5"
                        style={{ color: isActive ? '#ec6d13' : '#151b2d' }}
                      >
                        {opt.label}
                      </span>
                      <span className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug">
                        {opt.desc}
                      </span>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                      style={{ borderColor: isActive ? '#ec6d13' : 'rgba(84,67,62,0.2)' }}
                    >
                      {isActive && <div className="w-2 h-2 rounded-full bg-[#ec6d13]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Parte 2: ¿Cuándo empezó? ────────────────── */}
          <div>
            <p className="font-['Manrope'] text-[12px] font-[700] text-[#151b2d] mb-1">
              ¿Cuándo empezó este camino para ti?
              <span className="text-[#ef4444] ml-1">*</span>
            </p>
            <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-4 leading-snug">
              No necesitas ser exacto. Elige lo que más se acerque a tu historia.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {WHEN_OPTIONS.map((opt) => {
                const isActive = activeWhen?.age === opt.age;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleWhenSelect(opt)}
                    className="px-4 py-2 rounded-full font-['Manrope'] text-[12px] font-[600] transition-all"
                    style={{
                      background: isActive ? '#ec6d13' : 'rgba(236,109,19,0.06)',
                      color: isActive ? '#ffffff' : '#ec6d13',
                      border: isActive ? '1.5px solid #ec6d13' : '1px solid rgba(236,109,19,0.3)',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {!showPreciseAge ? (
              <button
                type="button"
                onClick={() => setShowPreciseAge(true)}
                className="font-['Manrope'] text-[11px] text-[#54433e]/35 hover:text-[#ec6d13] transition-colors underline-offset-2 hover:underline"
              >
                Quiero añadir una edad aproximada
              </button>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <label className="font-['Manrope'] text-[11px] text-[#54433e]/50 whitespace-nowrap">
                  Edad aproximada:
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={data.startAge || ''}
                  onChange={(e) => onChange({ startAge: parseInt(e.target.value) || 0 })}
                  placeholder="Ej. 12"
                  className="w-24 rounded-lg px-3 py-2 font-['Manrope'] text-[13px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 transition-all"
                  style={inputBg}
                />
                <button
                  type="button"
                  onClick={() => setShowPreciseAge(false)}
                  className="text-[#54433e]/30 hover:text-[#54433e]/60 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}
          </div>

          {/* ── Parte 3: Historia unificada ─────────────── */}
          <div>
            <p className="font-['Manrope'] text-[12px] font-[700] text-[#151b2d] mb-1">
              Cuéntanos cómo comenzó este camino
            </p>
            <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-3 leading-snug">
              Puedes contarnos quién influyó en ti, cómo aprendiste y qué hizo que este oficio se volviera importante para ti.
            </p>
            <SpeechTextarea
              rows={5}
              value={data.learnedFromDetail}
              onChange={(v) => onChange({ learnedFromDetail: v })}
              placeholder="Mi abuelo tejía desde que yo era pequeño y crecí viendo el telar en la casa. Años después decidí retomarlo y convertirlo en mi oficio…"
              className={textareaClass}
              style={inputBg}
            />
          </div>

        </div>
      </section>

      {/* ── MÓDULO 2: Territorio de origen ───────────────── */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <p className={sectionTitle}>Territorio de origen</p>

        {/* Banner de reconocimiento — solo si llegaron datos del registro */}
        {hasLocationFromRegistry && (
          <div
            className="flex items-start gap-3 p-3 rounded-xl mb-5"
            style={{ background: 'rgba(236,109,19,0.05)', border: '1px solid rgba(236,109,19,0.15)' }}
          >
            <span className="material-symbols-outlined text-[18px] text-[#ec6d13] shrink-0 mt-0.5">location_on</span>
            <div>
              <p className="font-['Manrope'] text-[12px] font-[700] text-[#ec6d13] mb-0.5">
                Reconocimos tu ubicación desde tu registro
              </p>
              <p className="font-['Manrope'] text-[11px] text-[#54433e]/55 leading-snug">
                Confirma que los datos son correctos o ajústalos si es necesario.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* País | Departamento | Municipio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>
                País
                {initial.country && <FromRegistryBadge />}
              </label>
              <input
                type="text"
                value={data.country}
                onChange={(e) => onChange({ country: e.target.value })}
                placeholder="Colombia"
                className={inputClass}
                style={inputBg}
              />
            </div>
            <div>
              <label className={labelClass}>
                Departamento
                {initial.department && <FromRegistryBadge />}
              </label>
              <input
                type="text"
                value={data.department || ''}
                onChange={(e) => onChange({ department: e.target.value })}
                placeholder="Ej. Nariño"
                className={inputClass}
                style={inputBg}
              />
            </div>
            <div>
              <label className={labelClass}>
                Municipio
                {initial.municipality && <FromRegistryBadge />}
              </label>
              <input
                type="text"
                value={data.municipality || ''}
                onChange={(e) => onChange({ municipality: e.target.value })}
                placeholder="Ej. Pasto"
                className={inputClass}
                style={inputBg}
              />
            </div>
          </div>

          {/* Separador — datos complementarios */}
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-1">
              <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/40">
                Cuéntanos un poco más
              </p>
              <div className="flex-1 h-px" style={{ background: 'rgba(226,213,207,0.4)' }} />
            </div>
            <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug mb-4">
              Esta información sitúa culturalmente tu trabajo en TELAR. Nos ayuda a conectarte con tu patrimonio y con compradores que valoran el origen.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={labelClass}>Comunidad o vereda</label>
                <input
                  type="text"
                  value={data.communityVillage || ''}
                  onChange={(e) => onChange({ communityVillage: e.target.value })}
                  placeholder="Ej. Resguardo Zenú, Vereda El Carmen…"
                  className={inputClass}
                  style={inputBg}
                />
              </div>
              <div>
                <label className={labelClass}>Relación étnica o comunitaria</label>
                <select
                  value={data.ethnicRelation || ''}
                  onChange={(e) => onChange({ ethnicRelation: e.target.value })}
                  className={inputClass}
                  style={inputBg}
                >
                  <option value="">Ninguna / No aplica</option>
                  {ETHNIC_RELATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Historia regional */}
          <div>
            <label className={labelClass}>Historia regional del oficio</label>
            <SpeechTextarea
              rows={3}
              value={data.regionalHistory || ''}
              onChange={(v) => onChange({ regionalHistory: v })}
              placeholder="¿Tiene tu región una tradición en este oficio? ¿Cómo se relaciona tu trabajo con esa historia?"
              className={textareaClass}
              style={inputBg}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
