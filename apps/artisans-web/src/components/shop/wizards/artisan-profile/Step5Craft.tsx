import React, { useState, useEffect } from 'react';
import { ArtisanProfileData } from '@/types/artisanProfile';
import { getAllCrafts, getTechniquesByCraftId, Craft, Technique } from '@/services/crafts.actions';
import { suggestTaxonomyItem } from '@/services/taxonomy.actions';
import { useAuth } from '@/context/AuthContext';
import { MaterialPicker } from '../../new-product-wizard/components/TaxonomyPicker';

const CRAFT_STYLES: { id: string; label: string; desc: string }[] = [
  { id: 'Tradicional',   label: 'Tradicional',   desc: 'Sigue métodos y estéticas ancestrales fieles a su origen' },
  { id: 'Contemporáneo', label: 'Contemporáneo', desc: 'Incorpora lenguajes actuales sin abandonar la técnica artesanal' },
  { id: 'Fusión',        label: 'Fusión',        desc: 'Mezcla tradición con influencias modernas o de otras culturas' },
];

const TIME_OPTIONS = [
  { value: '1-3 días',  icon: 'filter_3',           label: '1–3 días' },
  { value: '1 semana',  icon: 'date_range',          label: '1 semana' },
  { value: '15 días',   icon: 'calendar_view_week',  label: '15 días' },
  { value: '1 mes',     icon: 'calendar_month',      label: '1 mes' },
  { value: '__custom',  icon: 'edit_calendar',       label: 'Más...' },
] as const;

// ── Technique icon mapping ────────────────────────────────────────────────────

const TECHNIQUE_ICON_MAP: { keywords: string[]; icon: string }[] = [
  { keywords: ['tejido', 'telar', 'urdimbre', 'trama'], icon: 'grid_on' },
  { keywords: ['bordado', 'costura', 'puntada', 'aguja'], icon: 'push_pin' },
  { keywords: ['cerámica', 'alfarería', 'torneado', 'modelado', 'arcilla'], icon: 'water_drop' },
  { keywords: ['tallado', 'escultura', 'talla', 'gubia'], icon: 'carpenter' },
  { keywords: ['pintura', 'serigrafía', 'teñido', 'tintura', 'batik'], icon: 'brush' },
  { keywords: ['cestería', 'trenzado', 'palma', 'mimbre', 'junco'], icon: 'forest' },
  { keywords: ['joyería', 'filigrana', 'orfebrería', 'soldadura', 'repujado'], icon: 'diamond' },
  { keywords: ['macramé', 'nudo', 'anudado'], icon: 'loop' },
  { keywords: ['crochet', 'ganchillo', 'punto'], icon: 'scatter_plot' },
  { keywords: ['corte', 'troquelado', 'grabado'], icon: 'content_cut' },
  { keywords: ['esmalte', 'vitrificado', 'horno', 'cocción'], icon: 'local_fire_department' },
  { keywords: ['fundición', 'forja', 'metal', 'cincelado'], icon: 'hardware' },
];

function getTechniqueIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const { keywords, icon } of TECHNIQUE_ICON_MAP) {
    if (keywords.some(kw => lower.includes(kw))) return icon;
  }
  return 'auto_fix_high';
}

// ── TechniqueCard ─────────────────────────────────────────────────────────────

interface TechniqueCardProps {
  name: string;
  isSelected: boolean;
  isPending?: boolean;
  onClick: () => void;
}

const TechniqueCard: React.FC<TechniqueCardProps> = ({ name, isSelected, isPending, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center gap-1.5 w-[96px] h-[82px] rounded-xl border-2 transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ec6d13]/40`}
    style={
      isSelected
        ? { background: 'rgba(236,109,19,0.06)', borderColor: '#ec6d13' }
        : { background: '#ffffff', borderColor: 'rgba(226,213,207,0.4)' }
    }
  >
    {isSelected && (
      <div className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-[#ec6d13] flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-white" style={{ fontSize: 11 }}>check</span>
      </div>
    )}
    {isPending && (
      <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span className="text-[8px] font-[800] text-amber-600 uppercase tracking-wide leading-none">Rev.</span>
      </div>
    )}
    <span
      className="material-symbols-outlined transition-colors"
      style={{ fontSize: 22, color: isSelected ? '#ec6d13' : 'rgba(84,67,62,0.38)' }}
    >
      {getTechniqueIcon(name)}
    </span>
    <span
      className="text-center leading-tight px-1.5 font-[700] transition-colors"
      style={{
        fontSize: 10,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
        color: isSelected ? '#ec6d13' : 'rgba(84,67,62,0.65)',
      }}
    >
      {name}
    </span>
  </button>
);

// ── TechniqueMultiPicker ──────────────────────────────────────────────────────
// Versión multi-oficio: recibe craftIds[] y agrupa técnicas por oficio.

interface TechniqueMultiPickerProps {
  craftIds: string[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onSelectedNamesChange?: (names: string[]) => void;
}

interface CraftGroup {
  craft: Craft;
  techniques: Technique[];
}

const TechniqueMultiPicker: React.FC<TechniqueMultiPickerProps> = ({ craftIds, selectedIds, onChange, onSelectedNamesChange }) => {
  const { user } = useAuth();
  const [craftGroups, setCraftGroups]   = useState<CraftGroup[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [showSuggest, setShowSuggest]   = useState(false);
  const [suggestName, setSuggestName]   = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [pendingIds, setPendingIds]     = useState<string[]>([]);
  // craftId used for suggest (first selected craft)
  const primaryCraftId = craftIds[0];

  const craftIdsKey = craftIds.join(',');

  useEffect(() => {
    if (!craftIds.length) { setCraftGroups([]); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([
      getAllCrafts(),
      ...craftIds.map(id => getTechniquesByCraftId(id).then(list => ({ id, list }))),
    ])
      .then(([allCrafts, ...techniqueResults]) => {
        if (cancelled) return;
        const craftMap = new Map((allCrafts as Craft[]).map(c => [c.id, c]));
        const groups: CraftGroup[] = (techniqueResults as { id: string; list: Technique[] }[])
          .map(({ id, list }) => ({ craft: craftMap.get(id)!, techniques: list }))
          .filter(g => g.craft);
        setCraftGroups(groups);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [craftIdsKey]);

  const allTechniques = craftGroups.flatMap(g => g.techniques);

  // Emit selected technique names whenever the catalog loads or selection changes
  useEffect(() => {
    if (onSelectedNamesChange && allTechniques.length > 0) {
      onSelectedNamesChange(allTechniques.filter(t => selectedIds.includes(t.id)).map(t => t.name));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [craftGroups]);

  const toggle = (id: string) => {
    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter(s => s !== id)
      : [...selectedIds, id];
    onChange(nextIds);
    if (onSelectedNamesChange) {
      onSelectedNamesChange(allTechniques.filter(t => nextIds.includes(t.id)).map(t => t.name));
    }
  };

  const handleSuggest = async () => {
    const name = suggestName.trim();
    if (!name) return;
    setIsSuggesting(true);
    try {
      const newItem = await suggestTaxonomyItem('techniques', name, user?.id);
      const fakeEntry: Technique = { id: newItem.id, craftId: primaryCraftId ?? '', name: newItem.name, isActive: false };
      setCraftGroups(prev => {
        const idx = prev.findIndex(g => g.craft.id === primaryCraftId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], techniques: [...updated[idx].techniques, fakeEntry] };
        return updated;
      });
      onChange([...selectedIds, newItem.id]);
      setPendingIds(prev => [...prev, newItem.id]);
      setSuggestName('');
      setShowSuggest(false);
    } catch {
      // el interceptor muestra el toast
    } finally {
      setIsSuggesting(false);
    }
  };

  const selectedTechniques = allTechniques.filter(t => selectedIds.includes(t.id));

  const searchResults = searchQuery.trim().length >= 2
    ? allTechniques
        .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedIds.includes(t.id))
        .slice(0, 14)
    : [];

  if (!craftIds.length) {
    return (
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(236,109,19,0.04)', border: '1px dashed rgba(236,109,19,0.25)' }}
      >
        <span className="material-symbols-outlined text-[20px] text-[#ec6d13]/50 shrink-0 mt-0.5">info</span>
        <div>
          <p className="font-['Manrope'] text-[13px] font-[700] text-[#54433e]/70 mb-0.5">
            Elige tus oficios primero
          </p>
          <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug">
            Para ver las técnicas disponibles, primero selecciona tus oficios en el paso 1.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-[12px] text-[#54433e]/40">
        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
        Cargando técnicas...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <span className="material-symbols-outlined text-[18px] text-[#ef4444] shrink-0">warning</span>
        <p className="font-['Manrope'] text-[12px] text-[#54433e]/60">
          No se pudieron cargar las técnicas. Intenta avanzar y volver a este paso.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Técnicas seleccionadas */}
      {selectedTechniques.length > 0 && (
        <div>
          <p className="text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/40 mb-3">
            Tus técnicas
          </p>
          <div className="flex flex-wrap gap-2.5">
            {selectedTechniques.map(t => (
              <TechniqueCard
                key={t.id}
                name={t.name}
                isSelected
                isPending={pendingIds.includes(t.id)}
                onClick={() => toggle(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTechniques.length === 0 && (
        <p className="text-[12px] text-[#54433e]/40 italic py-2">
          Aún no has seleccionado técnicas. Busca una abajo o sugiérela.
        </p>
      )}

      {/* Catálogo agrupado por oficio */}
      <div
        className="pt-4 space-y-5"
        style={{ borderTop: selectedTechniques.length > 0 ? '1px solid rgba(226,213,207,0.25)' : 'none' }}
      >
        {selectedTechniques.length > 0 && (
          <p className="text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/40">
            Agregar más
          </p>
        )}

        {/* Buscador */}
        <div className="relative">
          <span className="material-symbols-outlined text-[15px] text-[#54433e]/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar técnica en el catálogo..."
            className="w-full border border-[#e2d5cf]/40 rounded-xl px-4 pl-9 py-2.5 text-[13px] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/40 focus:ring-2 focus:ring-[#ec6d13]/8 transition-all hover:border-[#e2d5cf]/70"
            style={{ background: 'rgba(247,244,239,0.4)' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#54433e]/30 hover:text-[#54433e]/60 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {searchQuery.trim().length >= 2 && (
          <div>
            {searchResults.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {searchResults.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { toggle(t.id); setSearchQuery(''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2d5cf]/50 bg-white hover:border-[#ec6d13]/40 hover:bg-[#ec6d13]/5 text-[12px] text-[#54433e] font-[500] transition-all group"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#54433e]/35 group-hover:text-[#ec6d13] transition-colors">
                      {getTechniqueIcon(t.name)}
                    </span>
                    {t.name}
                    <span className="material-symbols-outlined text-[11px] text-[#54433e]/25 group-hover:text-[#ec6d13] transition-colors">
                      add
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between py-1.5 px-1">
                <p className="text-[12px] text-[#54433e]/40 italic">
                  "{searchQuery}" no está en el catálogo
                </p>
                <button
                  onClick={() => { setSuggestName(searchQuery); setSearchQuery(''); setShowSuggest(true); }}
                  className="text-[11px] font-[700] text-[#ec6d13] hover:underline shrink-0 ml-3"
                >
                  Sugerir nueva →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Grupos por oficio (solo si no hay búsqueda activa) */}
        {!searchQuery && craftGroups.map(group => {
          const unselected = group.techniques.filter(t => !selectedIds.includes(t.id));
          if (unselected.length === 0) return null;
          return (
            <div key={group.craft.id}>
              {craftGroups.length > 1 && (
                <p className="text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/35 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[12px]">construction</span>
                  {group.craft.name}
                </p>
              )}
              <div className="flex flex-wrap gap-2.5">
                {unselected.map(t => (
                  <TechniqueCard
                    key={t.id}
                    name={t.name}
                    isSelected={false}
                    isPending={pendingIds.includes(t.id)}
                    onClick={() => toggle(t.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Sugerir técnica */}
        {!showSuggest ? (
          <button
            onClick={() => setShowSuggest(true)}
            className="flex items-center gap-1.5 text-[11px] font-[700] text-[#54433e]/40 hover:text-[#ec6d13] transition-colors mt-1"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            ¿No encuentras tu técnica? Sugerirla al equipo TELAR
          </button>
        ) : (
          <div
            className="p-4 rounded-xl space-y-3"
            style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.15)' }}
          >
            <div>
              <p className="text-[10px] font-[800] uppercase tracking-widest text-[#ec6d13]/80 mb-1">
                Sugerir nueva técnica
              </p>
              <p className="text-[11px] text-[#54433e]/55 leading-snug">
                Quedará en revisión hasta que el equipo TELAR la apruebe.{' '}
                <span className="font-[600]">Solo tú la verás</span> mientras está pendiente.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={suggestName}
                onChange={e => setSuggestName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isSuggesting && handleSuggest()}
                placeholder="Nombre de la técnica..."
                autoFocus
                className="flex-1 border border-[#ec6d13]/20 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#ec6d13]/50 transition-all"
              />
              <button
                onClick={handleSuggest}
                disabled={!suggestName.trim() || isSuggesting}
                className="px-4 py-2 rounded-lg bg-[#ec6d13] text-white text-[10px] font-[800] uppercase tracking-widest hover:bg-[#d4600f] disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
              >
                {isSuggesting && (
                  <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>
                )}
                Enviar
              </button>
              <button
                onClick={() => { setShowSuggest(false); setSuggestName(''); }}
                className="px-3 py-2 rounded-lg border border-[#e2d5cf]/50 text-[#54433e]/50 text-[11px] hover:text-[#54433e] transition-colors shrink-0"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Step5Craft ────────────────────────────────────────────────────────────────

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
}

export const Step5Craft: React.FC<Props> = ({ data, onChange }) => {
  const { user } = useAuth();
  const [showCustomTime, setShowCustomTime] = useState(
    () => !!data.averageTime && !TIME_OPTIONS.some(o => o.value !== '__custom' && o.value === data.averageTime),
  );
  const [selectedTechniqueNames, setSelectedTechniqueNames] = useState<string[]>([]);

  const toggleItem = (field: 'craftStyle', value: string) => {
    const arr = data[field] as string[];
    onChange({ [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  };

  return (
    <div className="flex flex-col gap-8">

      {/* Técnicas — filtradas por oficio */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-1">
          Técnicas artesanales
          <span className="text-[#ef4444] ml-1">*</span>
        </label>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-4 leading-snug">
          Selecciona las técnicas que aplicas en tu oficio. Puedes elegir varias.
        </p>
        <TechniqueMultiPicker
          craftIds={data.craftIds?.length ? data.craftIds : (data.craftId ? [data.craftId] : [])}
          selectedIds={data.techniqueIds ?? []}
          onChange={(ids) => onChange({ techniqueIds: ids })}
          onSelectedNamesChange={setSelectedTechniqueNames}
        />
      </section>

      {/* Materiales */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <div className="flex justify-between items-center mb-1">
          <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60">
            Materiales principales
            <span className="text-[#ef4444] ml-1">*</span>
          </label>
          {(data.materialIds ?? []).length > 0 && (
            <span className="text-[10px] font-[600] text-[#ec6d13]">
              {(data.materialIds ?? []).length} seleccionado{(data.materialIds ?? []).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-4 leading-snug">
          Selecciona los materiales que usas en tu oficio. Los que elijas quedan guardados en tu perfil artesanal.
        </p>
        <MaterialPicker
          artisanId={user?.id ?? ''}
          userId={user?.id ?? ''}
          selectedIds={data.materialIds ?? []}
          onChange={ids => onChange({ materialIds: ids })}
          suggestFromTechniqueNames={selectedTechniqueNames}
        />
      </section>

      {/* Tiempo de elaboración */}
      <section className="p-5 rounded-lg border border-[#e2d5cf]/20" style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}>
        <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-3">
          Tiempo promedio de elaboración
        </label>
        <div className="grid grid-cols-5 gap-2">
          {TIME_OPTIONS.map(opt => {
            const isCustom = opt.value === '__custom';
            const isActive = isCustom
              ? showCustomTime
              : data.averageTime === opt.value && !showCustomTime;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (isCustom) {
                    setShowCustomTime(true);
                    onChange({ averageTime: '' });
                  } else {
                    setShowCustomTime(false);
                    onChange({ averageTime: opt.value });
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-[#ec6d13] shadow-sm'
                    : 'border-[#e2d5cf]/40 bg-white hover:border-[#ec6d13]/35 hover:shadow-sm'
                }`}
                style={isActive ? { background: 'rgba(236,109,19,0.06)' } : { background: '#ffffff' }}
              >
                <span
                  className="material-symbols-outlined text-[20px] transition-colors"
                  style={{ color: isActive ? '#ec6d13' : 'rgba(84,67,62,0.38)' }}
                >
                  {opt.icon}
                </span>
                <span
                  className="text-[9px] font-[800] uppercase tracking-wide leading-tight text-center transition-colors"
                  style={{ color: isActive ? '#ec6d13' : 'rgba(84,67,62,0.55)' }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
        {showCustomTime && (
          <input
            type="text"
            autoFocus
            value={data.averageTime ?? ''}
            onChange={e => onChange({ averageTime: e.target.value })}
            placeholder="Ej: 3 meses, 45 días..."
            className="mt-3 w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all"
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
        <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
          Estilo artesanal
        </label>
        <p className="text-[11px] text-[#54433e]/60 mb-3">
          ¿Cómo se relaciona tu trabajo con la tradición? Puedes elegir varios.
        </p>
        <div className="flex flex-col gap-2">
          {CRAFT_STYLES.map(s => {
            const active = data.craftStyle.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleItem('craftStyle', s.id)}
                className="flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                style={{
                  background: active ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.6)',
                  border: active ? '1.5px solid rgba(236,109,19,0.4)' : '1px solid rgba(226,213,207,0.35)',
                }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border-2 flex items-center justify-center transition-colors"
                  style={{ borderColor: active ? '#ec6d13' : 'rgba(84,67,62,0.25)' }}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />}
                </div>
                <div>
                  <span
                    className="text-[10px] font-[800] uppercase tracking-wider block mb-0.5"
                    style={{ color: active ? '#ec6d13' : '#54433e' }}
                  >
                    {s.label}
                  </span>
                  <span className="text-[10px] text-[#54433e]/50 leading-snug">{s.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
