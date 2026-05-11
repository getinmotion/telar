import React, { useEffect, useRef, useState } from 'react';
import type { NewWizardState, PiecePurpose, PieceStyle, ProductionType } from '../hooks/useNewWizardState';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { AiBadge, aiSelectClass } from '../components/AiBadge';
import { getAllCrafts, getTechniquesByCraftId, type Craft, type Technique } from '@/services/crafts.actions';
import { getAllCategories, type Category } from '@/services/categories.actions';
import { getAllProductCategories, getProductCategoryChildren, type ProductCategory } from '@/services/product-categories.actions';

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  step: number;
  totalSteps: number;
}

// Taxonomy categories — matched by exact name to avoid false substring matches
const TELAR_CATEGORY_DEFS: { name: string; icon: string }[] = [
  { name: 'Textiles y Moda', icon: 'apparel' },
  { name: 'Bolsos y Carteras', icon: 'shopping_bag' },
  { name: 'Joyería y Accesorios', icon: 'diamond' },
  { name: 'Decoración del Hogar', icon: 'home' },
  { name: 'Muebles', icon: 'chair' },
  { name: 'Vajillas y Cocina', icon: 'restaurant' },
  { name: 'Arte y Esculturas', icon: 'palette' },
  { name: 'Juguetes e Instrumentos Musicales', icon: 'piano' },
  { name: 'Cuidado Personal', icon: 'spa' },
];

const PURPOSES: { id: PiecePurpose; label: string; icon: string; desc: string }[] = [
  { id: 'funcional', label: 'Funcional', icon: 'handyman', desc: 'Tiene un uso práctico en el día a día' },
  { id: 'decorativa', label: 'Decorativa', icon: 'star', desc: 'Su propósito es embellecer espacios' },
  { id: 'ritual', label: 'Ritual', icon: 'auto_awesome', desc: 'Uso ceremonial, espiritual o simbólico' },
  { id: 'coleccionable', label: 'Coleccionable', icon: 'category', desc: 'Valor cultural o artístico para coleccionar' },
];

const STYLES: { id: PieceStyle; label: string; desc: string }[] = [
  { id: 'tradicional', label: 'Tradicional', desc: 'Sigue métodos y estéticas ancestrales fieles a su origen' },
  { id: 'contemporaneo', label: 'Contemporáneo', desc: 'Incorpora lenguajes actuales sin abandonar la técnica artesanal' },
  { id: 'fusion', label: 'Fusión', desc: 'Mezcla tradición con influencias modernas o de otras culturas' },
];

const PRODUCTION_TYPES: { id: ProductionType; label: string; icon: string; desc: string }[] = [
  { id: 'unica', label: 'Única', icon: 'fiber_manual_record', desc: 'Pieza exclusiva, solo existe una' },
  { id: 'limitada', label: 'Serie limitada', icon: 'layers', desc: 'Un número definido de unidades idénticas' },
  { id: 'continua', label: 'Continua', icon: 'autorenew', desc: 'Se produce de forma regular y permanente' },
  { id: 'bajo_pedido', label: 'Bajo pedido', icon: 'assignment', desc: 'Se fabrica cuando hay un encargo específico' },
];

const ETHNIC_GROUPS = ['Ninguno', 'Indígena', 'Afrodescendiente', 'Campesina', 'Raizal', 'Palenquera', 'Rrom', 'Otra'];

export const Step2ArtisanalIdentity: React.FC<Props> = ({ state, update, onNext, onBack, onSaveDraft, isSavingDraft, step, totalSteps }) => {
  const [showCollaboration, setShowCollaboration] = useState(state.isCollaboration ?? false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allProductCategories, setAllProductCategories] = useState<ProductCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ProductCategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loadingTechniques, setLoadingTechniques] = useState(false);
  const [isRecordingHistory, setIsRecordingHistory] = useState(false);
  const recognitionRef = useRef<any>(null);

  const canContinue = !!state.categoryId && !!state.craftId;

  // Derived: match taxonomy categories by exact name
  const telarCategories = TELAR_CATEGORY_DEFS
    .map(def => {
      const match = allCategories.find(c => c.name === def.name);
      return match ? { ...def, id: match.id } : null;
    })
    .filter(Boolean) as (typeof TELAR_CATEGORY_DEFS[number] & { id: string })[];

  const selectedCategoryName = telarCategories.find(c => c.id === state.categoryId)?.name
    ?? allCategories.find(c => c.id === state.categoryId)?.name;
  const selectedSubcategoryName = subcategories.find(c => c.id === state.subcategoryId)?.name;
  const selectedCraftName = crafts.find(c => c.id === state.craftId)?.name;
  const selectedTechniqueName = techniques.find(t => t.id === state.primaryTechniqueId)?.name;

  useEffect(() => {
    getAllCategories().then(setAllCategories).catch(() => {});
    getAllProductCategories().then(setAllProductCategories).catch(() => {});
    getAllCrafts().then(setCrafts).catch(() => {});
  }, []);

  // Load subcategories: find the matching product_category root by name, then fetch its children
  useEffect(() => {
    if (!state.categoryId) { setSubcategories([]); return; }
    const taxonomyName = allCategories.find(c => c.id === state.categoryId)?.name;
    if (!taxonomyName) { setSubcategories([]); return; }
    const rootProductCat = allProductCategories.find(
      c => c.name.toLowerCase().includes(taxonomyName.split(' ')[0].toLowerCase()),
    );
    if (!rootProductCat) { setSubcategories([]); return; }
    setLoadingSubcategories(true);
    getProductCategoryChildren(rootProductCat.id)
      .then(setSubcategories)
      .catch(() => setSubcategories([]))
      .finally(() => setLoadingSubcategories(false));
  }, [state.categoryId, allCategories, allProductCategories]);

  useEffect(() => {
    if (!state.craftId) { setTechniques([]); return; }
    setLoadingTechniques(true);
    getTechniquesByCraftId(state.craftId)
      .then(setTechniques)
      .catch(() => setTechniques([]))
      .finally(() => setLoadingTechniques(false));
  }, [state.craftId]);

  const handleCategorySelect = (categoryId: string) => {
    update({ categoryId, subcategoryId: undefined });
  };

  const handleCraftChange = (craftId: string) => {
    update({ craftId, primaryTechniqueId: undefined, secondaryTechniqueId: undefined });
  };

  const toggleCollaboration = (val: boolean) => {
    setShowCollaboration(val);
    update({ isCollaboration: val });
  };

  const toggleRecordingHistory = () => {
    if (isRecordingHistory) {
      recognitionRef.current?.stop();
      setIsRecordingHistory(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('');
      update({ artisanalHistory: transcript });
    };
    recognition.onerror = () => setIsRecordingHistory(false);
    recognition.onend = () => setIsRecordingHistory(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecordingHistory(true);
  };

  const hasSpeechSupport = typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <main className="w-full max-w-[1200px] mx-auto pt-10 pb-32 px-6 md:px-10">
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
          icon="fingerprint"
          title="Identidad artesanal"
          subtitle="Señales culturales, técnicas y territoriales de tu pieza"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Sidebar */}
          <aside className="lg:col-span-3">
            <div
              className="p-5 sticky top-8 flex flex-col gap-4 rounded-2xl"
              style={{ background: '#151b2d' }}
            >
              <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ec6d13] text-lg">auto_awesome</span>
                  <h2 className="font-['Manrope'] text-[10px] font-[800] text-white tracking-widest uppercase">
                    Sugerido por IA
                  </h2>
                </div>
                <p className="text-[11px] text-white/50">
                  Esto lo sugirió el sistema. Tú decides qué confirmar.
                </p>
              </div>

              {[
                { label: 'Posible Categoría', value: 'Vajillas y Cocina' },
                { label: 'Posible Técnica', value: 'Modelado a mano' },
                { label: 'Posible Origen', value: 'Ráquira, Boyacá' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] text-white/40 font-[800] uppercase tracking-widest">{label}</p>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-[800] uppercase tracking-widest bg-[#ec6d13]/20 text-[#ec6d13]">
                      IA
                    </span>
                  </div>
                  <p className="text-[13px] text-white/80 font-[500] mb-2">{value}</p>
                  <div className="flex gap-1.5">
                    <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase">
                      Confirmar
                    </button>
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase">
                      Cambiar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main form */}
          <section className="lg:col-span-9 space-y-4">

            {/* ── Categories ──────────────────────────────── */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.65)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] tracking-widest uppercase">
                  Categoría TELAR
                </label>
                <AiBadge />
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                Las 8 categorías oficiales de la plataforma. Elige la que mejor describe tu pieza.
              </p>

              {allCategories.length === 0 ? (
                <p className="text-[12px] text-[#54433e]/40 italic py-2">Cargando categorías...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {telarCategories.map(cat => {
                    const isSelected = state.categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center gap-1"
                        style={{
                          background: isSelected ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.6)',
                          border: isSelected ? '1.5px solid rgba(236,109,19,0.5)' : '1px solid rgba(226,213,207,0.4)',
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[22px]"
                          style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                        >
                          {cat.icon}
                        </span>
                        <span
                          className="text-[9px] font-[800] uppercase tracking-wider leading-tight"
                          style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                        >
                          {cat.display}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Subcategories */}
              {state.categoryId && (
                <div className="mt-4 pt-4 border-t border-[#e2d5cf]/30">
                  <label className="font-['Manrope'] text-[9px] font-[800] text-[#54433e]/60 tracking-widest uppercase block mb-2">
                    Subcategoría
                    {selectedCategoryName && (
                      <span className="ml-1.5 text-[#ec6d13] normal-case font-[600] tracking-normal">
                        de {selectedCategoryName}
                      </span>
                    )}
                  </label>
                  {loadingSubcategories ? (
                    <p className="text-[11px] text-[#54433e]/40 italic">Cargando subcategorías...</p>
                  ) : subcategories.length === 0 ? (
                    <p className="text-[11px] text-[#54433e]/40 italic">Sin subcategorías disponibles</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subcategories.map(sub => {
                        const isSelected = state.subcategoryId === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => update({ subcategoryId: isSelected ? undefined : sub.id })}
                            className="px-3 py-1.5 rounded-full text-[11px] font-[600] transition-all"
                            style={{
                              background: isSelected ? '#ec6d13' : 'rgba(255,255,255,0.6)',
                              color: isSelected ? 'white' : '#54433e',
                              border: isSelected ? '1px solid #ec6d13' : '1px solid rgba(226,213,207,0.5)',
                            }}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedSubcategoryName && (
                    <p className="text-[10px] text-[#ec6d13] mt-2 font-[600]">
                      Subcategoría seleccionada: {selectedSubcategoryName}
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* ── Purpose + Style + Cultural + Collection ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Propósito + Estilo */}
              <div
                className="p-5 flex flex-col gap-5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.65)',
                }}
              >
                {/* Propósito */}
                <div>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
                    Propósito
                  </label>
                  <p className="text-[11px] text-[#54433e]/60 mb-3">
                    ¿Para qué fue creada esta pieza?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PURPOSES.map(p => {
                      const isSelected = state.purpose === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => update({ purpose: p.id })}
                          className="flex flex-col gap-1 p-3 rounded-xl text-left transition-all"
                          style={{
                            background: isSelected ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.6)',
                            border: isSelected ? '1.5px solid rgba(236,109,19,0.4)' : '1px solid rgba(226,213,207,0.35)',
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-[16px]"
                              style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                            >
                              {p.icon}
                            </span>
                            <span
                              className="text-[10px] font-[800] uppercase tracking-wider"
                              style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                            >
                              {p.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#54433e]/50 leading-snug">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Estilo */}
                <div>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
                    Estilo
                  </label>
                  <p className="text-[11px] text-[#54433e]/60 mb-3">
                    ¿Cómo se relaciona con la tradición?
                  </p>
                  <div className="flex flex-col gap-2">
                    {STYLES.map(s => {
                      const isSelected = state.style === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => update({ style: s.id })}
                          className="flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                          style={{
                            background: isSelected ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.6)',
                            border: isSelected ? '1.5px solid rgba(236,109,19,0.4)' : '1px solid rgba(226,213,207,0.35)',
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded-full mt-0.5 shrink-0 border-2 transition-colors"
                            style={{
                              borderColor: isSelected ? '#ec6d13' : '#54433e40',
                              background: isSelected ? '#ec6d13' : 'transparent',
                            }}
                          />
                          <div>
                            <span
                              className="text-[10px] font-[800] uppercase tracking-wider block mb-0.5"
                              style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                            >
                              {s.label}
                            </span>
                            <span className="text-[10px] text-[#54433e]/50 leading-snug">{s.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cultural denomination + Collection + Origin */}
              <div
                className="p-5 flex flex-col gap-5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.65)',
                }}
              >
                {/* Denominación cultural */}
                <div>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
                    Denominación cultural
                  </label>
                  <p className="text-[11px] text-[#54433e]/60 mb-2">
                    El nombre propio que le da su comunidad o tradición a esta técnica o pieza. Ej: "Mochila arhuaca", "Cerámica negra de Chamba".
                  </p>
                  <input
                    type="text"
                    value={state.culturalDenomination ?? ''}
                    onChange={e => update({ culturalDenomination: e.target.value })}
                    placeholder="Ej: Cerámica negra, Mochila wayuu..."
                    className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all"
                  />
                </div>

                {/* Colección / Línea */}
                <div>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
                    Colección / Línea
                  </label>
                  <p className="text-[11px] text-[#54433e]/60 mb-2">
                    ¿Esta pieza pertenece a una serie, familia de productos, edición especial o lanzamiento?
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['Serie', 'Familia', 'Edición', 'Lanzamiento'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const current = state.collectionName ?? '';
                          if (!current.startsWith(tag)) update({ collectionName: `${tag}: ` });
                        }}
                        className="px-2.5 py-1 rounded-full text-[10px] font-[700] border border-[#e2d5cf]/50 text-[#54433e]/60 hover:border-[#ec6d13]/30 hover:text-[#ec6d13] transition-colors"
                        style={{ background: 'rgba(255,255,255,0.5)' }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={state.collectionName ?? ''}
                    onChange={e => update({ collectionName: e.target.value })}
                    placeholder="Ej: Serie Tierra 2024, Edición Navidad..."
                    className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all"
                  />
                </div>

                {/* Origin */}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                      Origen geográfico
                    </label>
                    <AiBadge />
                  </div>
                  <p className="text-[11px] text-[#54433e]/60 mb-3">
                    Sugerido por IA según descripción, materiales e imagen.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Departamento', key: 'department' as const, value: state.department ?? '' },
                      { label: 'Municipio', key: 'municipality' as const, value: state.municipality ?? '' },
                    ].map(({ label, key, value }) => (
                      <div key={key}>
                        <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-1 uppercase tracking-wider">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={e => update({ [key]: e.target.value })}
                          className="w-full rounded-lg border border-[#151b2d]/30 px-3 py-1.5 text-[12px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#151b2d] focus:ring-2 focus:ring-[#151b2d]/8 hover:border-[#151b2d]/50 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-1 uppercase tracking-wider">
                      Grupo étnico (Opcional)
                    </label>
                    <select
                      value={state.ethnicGroup ?? 'Ninguno'}
                      onChange={e => update({ ethnicGroup: e.target.value })}
                      className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-1.5 text-[12px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all cursor-pointer appearance-none"
                    >
                      {ETHNIC_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Technique & Production ───────────────────── */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.65)',
              }}
            >
              <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-4 uppercase tracking-widest">
                Técnica y producción
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {/* Craft */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 uppercase tracking-wider">
                      Oficio *
                    </label>
                    <AiBadge />
                  </div>
                  {crafts.length === 0 ? (
                    <p className="text-[12px] text-[#54433e]/40 italic py-2">Cargando...</p>
                  ) : (
                    <select
                      value={state.craftId ?? ''}
                      onChange={e => handleCraftChange(e.target.value)}
                      className={aiSelectClass}
                    >
                      <option value="">Seleccionar oficio...</option>
                      {crafts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                  {selectedCraftName && (
                    <p className="text-[10px] text-[#ec6d13] mt-1 font-[600]">{selectedCraftName}</p>
                  )}
                </div>

                {/* Technique */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 uppercase tracking-wider">
                      Subtécnica
                    </label>
                    <AiBadge />
                  </div>
                  {!state.craftId ? (
                    <p className="text-[12px] text-[#54433e]/30 italic py-2">Selecciona un oficio primero</p>
                  ) : loadingTechniques ? (
                    <p className="text-[12px] text-[#54433e]/40 italic py-2">Cargando técnicas...</p>
                  ) : (
                    <select
                      value={state.primaryTechniqueId ?? ''}
                      onChange={e => update({ primaryTechniqueId: e.target.value || undefined })}
                      className={aiSelectClass}
                    >
                      <option value="">Sin subtécnica</option>
                      {techniques.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                  {selectedTechniqueName && (
                    <p className="text-[10px] text-[#54433e]/60 mt-1 font-[500]">{selectedTechniqueName}</p>
                  )}
                </div>
              </div>

              {/* Production type — with icons + descriptions */}
              <div>
                <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-2 uppercase tracking-wider">
                  Tipo de producción
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PRODUCTION_TYPES.map(pt => {
                    const isSelected = state.productionType === pt.id;
                    return (
                      <button
                        key={pt.id}
                        onClick={() => update({ productionType: pt.id })}
                        className="flex flex-col gap-1 p-3 rounded-xl text-left transition-all"
                        style={{
                          background: isSelected ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.6)',
                          border: isSelected ? '1.5px solid rgba(236,109,19,0.4)' : '1px solid rgba(226,213,207,0.35)',
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                        >
                          {pt.icon}
                        </span>
                        <span
                          className="text-[10px] font-[800] uppercase tracking-wider"
                          style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
                        >
                          {pt.label}
                        </span>
                        <span className="text-[10px] text-[#54433e]/50 leading-snug">{pt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manual intervention slider */}
              <div className="pt-4 mt-4 border-t border-[#151b2d]/5">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-0.5 uppercase tracking-wider">
                      Intervención manual
                    </label>
                    <span className="text-[11px] text-[#54433e]/60">
                      ¿Qué porcentaje del proceso fue hecho a mano?
                    </span>
                  </div>
                  <span className="text-[18px] font-[800] text-[#151b2d]">
                    {state.manualInterventionPercentage ?? 80}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={state.manualInterventionPercentage ?? 80}
                  onChange={e => update({ manualInterventionPercentage: Number(e.target.value) })}
                  className="w-full h-1 rounded-sm cursor-pointer"
                  style={{ accentColor: '#ec6d13' }}
                />
              </div>
            </div>

            {/* ── Collaboration ──────────────────────────────── */}
            <div
              className="p-5 space-y-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.65)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] block mb-0.5 uppercase tracking-widest">
                    ¿Creada en colaboración?
                  </label>
                  <p className="text-[11px] text-[#54433e]/60">
                    Actívalo solo si otra persona, marca o colectivo participó.
                  </p>
                </div>
                <div className="flex p-1 rounded-lg border border-[#151b2d]/5" style={{ background: 'rgba(255,255,255,0.5)' }}>
                  {['Sí', 'No'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleCollaboration(opt === 'Sí')}
                      className="px-4 py-1.5 text-[11px] font-[800] rounded-md transition-all uppercase"
                      style={{
                        background: (opt === 'Sí') === showCollaboration ? '#ec6d13' : 'transparent',
                        color: (opt === 'Sí') === showCollaboration ? 'white' : 'inherit',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {showCollaboration && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#151b2d]/5">
                  <div>
                    <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-1 uppercase tracking-wider">
                      Tipo
                    </label>
                    <select
                      value={state.collaboration?.type ?? ''}
                      onChange={e => update({ collaboration: { ...state.collaboration, type: e.target.value } })}
                      className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Seleccionar...</option>
                      {['Diseñador', 'Marca', 'Institución', 'Colectivo'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-1 uppercase tracking-wider">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={state.collaboration?.name ?? ''}
                      onChange={e => update({ collaboration: { ...state.collaboration, name: e.target.value } })}
                      placeholder="Nombre del colaborador"
                      className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-1 uppercase tracking-wider">
                      Rol
                    </label>
                    <select
                      value={state.collaboration?.role ?? ''}
                      onChange={e => update({ collaboration: { ...state.collaboration, role: e.target.value } })}
                      className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Seleccionar...</option>
                      {['Diseño', 'Producción', 'Comercialización'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="font-['Manrope'] text-[8px] font-[800] text-[#54433e]/60 block mb-1 uppercase tracking-wider">
                      Descripción
                    </label>
                    <textarea
                      value={state.collaboration?.description ?? ''}
                      onChange={e => update({ collaboration: { ...state.collaboration, description: e.target.value } })}
                      placeholder="Describe la participación..."
                      rows={2}
                      className="w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Historia y contexto ─────────────────────── */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.65)',
              }}
            >
              <p className="text-[10px] text-[#54433e]/50 font-[600] uppercase tracking-wider mb-2">
                Esta información construirá la huella digital TELAR de la pieza.
              </p>
              <div className="flex items-center justify-between mb-3">
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                  Historia y contexto
                </label>
                <div className="flex items-center gap-2">
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={toggleRecordingHistory}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-[700] uppercase tracking-widest transition-all ${
                        isRecordingHistory
                          ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 animate-pulse'
                          : 'bg-[#54433e]/5 text-[#54433e]/50 border border-[#54433e]/10 hover:text-[#ec6d13] hover:border-[#ec6d13]/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isRecordingHistory ? 'stop_circle' : 'mic'}
                      </span>
                      {isRecordingHistory ? 'Grabando...' : 'Dictar'}
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-[10px] font-[700] text-[#ec6d13] cursor-pointer hover:opacity-80 transition-opacity uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    Ayuda IA
                  </div>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={state.artisanalHistory ?? ''}
                  onChange={e => update({ artisanalHistory: e.target.value })}
                  placeholder="¿Qué historia guarda esta pieza? ¿Cómo llegó esta técnica a tus manos? ¿Qué representa para tu comunidad o para ti?"
                  rows={4}
                  className="w-full border border-[#e2d5cf]/30 p-4 text-[13px] text-[#151b2d] font-[500] resize-none focus:outline-none focus:ring-1 focus:ring-[#ec6d13]/30 focus:border-[#ec6d13]/20 rounded-lg transition-colors"
                  style={{ background: 'rgba(247,244,239,0.5)' }}
                />
                {isRecordingHistory && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                    <span className="text-[10px] text-[#ef4444] font-[700]">Escuchando</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        isSavingDraft={isSavingDraft}
        nextDisabled={!canContinue}
        nextLabel="Confirmar y continuar"
      />
    </div>
  );
};
