import React, { useState, KeyboardEvent } from 'react';
import { ArtisanProfileData } from '@/types/artisanProfile';

const CRAFT_STYLES: { id: string; label: string; desc: string }[] = [
  { id: 'Tradicional',    label: 'Tradicional',    desc: 'Sigue métodos y estéticas ancestrales fieles a su origen' },
  { id: 'Contemporáneo',  label: 'Contemporáneo',  desc: 'Incorpora lenguajes actuales sin abandonar la técnica artesanal' },
  { id: 'Fusión',         label: 'Fusión',         desc: 'Mezcla tradición con influencias modernas o de otras culturas' },
  { id: 'Minimalista',    label: 'Minimalista',    desc: 'Formas simples, materiales puros y ausencia de decoración superflua' },
  { id: 'Colorido',       label: 'Colorido',       desc: 'Paletas vivas que celebran la identidad visual de la comunidad' },
  { id: 'Experimental',   label: 'Experimental',   desc: 'Explora materiales o procesos no convencionales en el oficio' },
  { id: 'Funcional',      label: 'Funcional',      desc: 'Diseño orientado al uso cotidiano sin renunciar a la calidad artesanal' },
  { id: 'Decorativo',     label: 'Decorativo',     desc: 'Primacía de la belleza y el detalle como fin en sí mismo' },
];

const TIME_OPTIONS = [
  { value: 'Horas',      icon: 'bolt',                 label: 'Horas' },
  { value: '1 a 3 días', icon: 'hourglass_top',        label: '1 a 3 días' },
  { value: '1 semana',   icon: 'calendar_view_week',   label: '1 semana' },
  { value: '2 semanas',  icon: 'date_range',           label: '2 semanas' },
  { value: '1 mes',      icon: 'calendar_month',       label: '1 mes' },
] as const;

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
}

const PRESET_TECHNIQUES = [
  'Telar de cintura', 'Brocado', 'Teñido natural', 'Urdido',
  'Bordado', 'Tejido', 'Cerámica', 'Talla en madera',
  'Cestería', 'Orfebrería', 'Sombrerería', 'Encaje de bolillos',
];

const PRESET_MATERIALS = [
  'Algodón', 'Seda', 'Lana', 'Fibras naturales',
  'Arcilla', 'Madera', 'Chaquira', 'Cuero',
  'Caña flecha', 'Barro', 'Piedra', 'Metal',
];

interface ChipGroupProps {
  label: string;
  required?: boolean;
  selected: string[];
  presets: string[];
  onToggle: (v: string) => void;
  onAdd: (v: string) => void;
}

const ChipGroup: React.FC<ChipGroupProps> = ({ label, required, selected, presets, onToggle, onAdd }) => {
  const [custom, setCustom] = useState('');

  const handleAdd = () => {
    const t = custom.trim();
    if (!t) return;
    onAdd(t);
    setCustom('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  return (
    <div>
      <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-3">
        {label}
        {required && <span className="text-[#ef4444] ml-1">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const active = selected.includes(p);
          return (
            <button
              key={p}
              onClick={() => onToggle(p)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-[600] border transition-all ${
                active
                  ? 'bg-[#ec6d13] border-[#ec6d13] text-white'
                  : 'bg-[#ec6d13]/5 border-[#ec6d13]/20 text-[#ec6d13] hover:bg-[#ec6d13]/10'
              }`}
            >
              {p}
            </button>
          );
        })}
        {selected.filter((s) => !presets.includes(s)).map((s) => (
          <button
            key={s}
            onClick={() => onToggle(s)}
            className="px-3 py-1.5 rounded-full text-[12px] font-[600] bg-[#ec6d13] border border-[#ec6d13] text-white"
          >
            {s}
          </button>
        ))}
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={handleAdd}
          placeholder="+ Añadir"
          className="px-3 py-1.5 rounded-full text-[12px] font-[600] border border-dashed border-[#ec6d13]/40 text-[#ec6d13] placeholder:text-[#ec6d13]/40 bg-transparent focus:outline-none focus:border-[#ec6d13] w-28"
        />
      </div>
    </div>
  );
};

export const Step5Craft: React.FC<Props> = ({ data, onChange }) => {
  const isPreset = TIME_OPTIONS.some(o => o.value === data.averageTime);
  const [customTime, setCustomTime] = useState(
    data.averageTime && !isPreset ? data.averageTime : '',
  );
  const [showCustom, setShowCustom] = useState(data.averageTime !== undefined && !isPreset);

  const selectTime = (value: string) => {
    setShowCustom(false);
    onChange({ averageTime: value });
  };

  const openCustom = () => {
    setShowCustom(true);
    onChange({ averageTime: customTime || undefined });
  };

  const toggleItem = (field: 'techniques' | 'materials' | 'craftStyle', value: string) => {
    const arr = data[field] as string[];
    onChange({ [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  };

  const addItem = (field: 'techniques' | 'materials', value: string) => {
    if (!(data[field] as string[]).includes(value))
      onChange({ [field]: [...(data[field] as string[]), value] });
  };

  return (
    <div className="flex flex-col gap-8">

      {/* Técnicas */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <ChipGroup
          label="Técnicas artesanales"
          required
          selected={data.techniques}
          presets={PRESET_TECHNIQUES}
          onToggle={(v) => toggleItem('techniques', v)}
          onAdd={(v) => addItem('techniques', v)}
        />
      </section>

      {/* Materiales */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <ChipGroup
          label="Materiales principales"
          required
          selected={data.materials}
          presets={PRESET_MATERIALS}
          onToggle={(v) => toggleItem('materials', v)}
          onAdd={(v) => addItem('materials', v)}
        />
      </section>

      {/* Tiempo de elaboración */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-4">
          Tiempo promedio de elaboración
          <span className="ml-2 font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#ec6d13] px-1.5 py-0.5 bg-[#ec6d13]/10 rounded">Recomendado</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {TIME_OPTIONS.map(opt => {
            const active = data.averageTime === opt.value && !showCustom;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectTime(opt.value)}
                className={`flex flex-col items-center justify-center gap-1.5 w-[88px] h-[76px] rounded-xl border-2 transition-all ${
                  active
                    ? 'border-[#ec6d13] shadow-sm'
                    : 'border-[#e2d5cf]/40 bg-white hover:border-[#ec6d13]/35 hover:shadow-sm'
                }`}
                style={active ? { background: 'rgba(236,109,19,0.06)' } : { background: '#ffffff' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22, color: active ? '#ec6d13' : 'rgba(84,67,62,0.38)' }}
                >
                  {opt.icon}
                </span>
                <span
                  className="text-center font-[700] leading-tight px-1"
                  style={{ fontSize: 10, color: active ? '#ec6d13' : 'rgba(84,67,62,0.65)' }}
                >
                  {opt.label}
                </span>
                {active && (
                  <div className="absolute" style={{ display: 'none' }} />
                )}
              </button>
            );
          })}

          {/* Personalizado */}
          <button
            type="button"
            onClick={openCustom}
            className={`flex flex-col items-center justify-center gap-1.5 w-[88px] h-[76px] rounded-xl border-2 transition-all ${
              showCustom
                ? 'border-[#ec6d13] shadow-sm'
                : 'border-dashed border-[#e2d5cf]/60 bg-white hover:border-[#ec6d13]/35'
            }`}
            style={showCustom ? { background: 'rgba(236,109,19,0.06)' } : { background: '#ffffff' }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: showCustom ? '#ec6d13' : 'rgba(84,67,62,0.38)' }}
            >
              edit_note
            </span>
            <span
              className="text-center font-[700] leading-tight px-1"
              style={{ fontSize: 10, color: showCustom ? '#ec6d13' : 'rgba(84,67,62,0.65)' }}
            >
              Personalizado
            </span>
          </button>
        </div>

        {showCustom && (
          <input
            type="text"
            autoFocus
            value={customTime}
            onChange={e => {
              setCustomTime(e.target.value);
              onChange({ averageTime: e.target.value || undefined });
            }}
            placeholder="Ej. 3 a 4 semanas, 6 meses..."
            className="mt-3 w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#ec6d13]/30 focus:outline-none focus:border-[#ec6d13]/60 focus:ring-2 focus:ring-[#ec6d13]/10 transition-all"
            style={{ background: 'rgba(247,244,239,0.4)' }}
          />
        )}
      </section>

      {/* Diferenciación */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-3">
          ¿Qué hace especial tu trabajo? <span className="text-[#ef4444]">*</span>
        </label>
        <textarea
          rows={5}
          value={data.uniqueness}
          onChange={(e) => onChange({ uniqueness: e.target.value })}
          placeholder="Describe qué diferencia tu forma de crear: técnica, acabado, intención, detalle, tradición o mezcla de estilos."
          className="w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70"
          style={{ background: 'rgba(247,244,239,0.4)' }}
        />
      </section>

      {/* Estilo artesanal */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-1">
          Estilo artesanal
          <span className="ml-2 font-['Manrope'] text-[8px] font-[900] uppercase tracking-widest text-[#ec6d13] px-1.5 py-0.5 bg-[#ec6d13]/10 rounded">Recomendado</span>
        </label>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/50 mb-4">Puedes elegir más de uno si tu trabajo mezcla lenguajes.</p>
        <div className="flex flex-col gap-2">
          {CRAFT_STYLES.map((s) => {
            const active = data.craftStyle.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleItem('craftStyle', s.id)}
                style={{
                  background: active ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.6)',
                  border: active ? '1.5px solid rgba(236,109,19,0.4)' : '1px solid rgba(226,213,207,0.35)',
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:border-[#ec6d13]/30"
              >
                <div
                  className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                  style={{ borderColor: active ? '#ec6d13' : 'rgba(84,67,62,0.25)' }}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className="font-['Manrope'] text-[13px] font-[700] block"
                    style={{ color: active ? '#ec6d13' : '#54433e' }}
                  >
                    {s.label}
                  </span>
                  <span className="text-[10px] font-['Manrope'] text-[#54433e]/50 leading-snug">{s.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
