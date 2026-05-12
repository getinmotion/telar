import React, { useState, KeyboardEvent } from 'react';
import { ArtisanProfileData, CRAFT_STYLE_OPTIONS } from '@/types/artisanProfile';

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
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/50 mb-3">Puedes elegir más de uno si tu trabajo mezcla lenguajes.</p>
        <div className="flex flex-wrap gap-2">
          {CRAFT_STYLE_OPTIONS.map((s) => {
            const active = data.craftStyle.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleItem('craftStyle', s)}
                className={`px-4 py-2 rounded-lg text-[13px] font-[600] border transition-all ${
                  active
                    ? 'bg-[#ec6d13] border-[#ec6d13] text-white shadow-sm'
                    : 'bg-white border-[#e2d5cf]/40 text-[#151b2d] hover:border-[#ec6d13]/30'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
