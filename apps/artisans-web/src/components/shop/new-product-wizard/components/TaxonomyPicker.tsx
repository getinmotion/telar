/**
 * TaxonomyPicker — componente reutilizable de selección bidireccional de taxonomías.
 *
 * Muestra los ítems del perfil artesanal como tarjetas con icono.
 * Permite buscar ítems aprobados del catálogo y agregar nuevos por moderación.
 *
 * Patrón de referencia: se usa primero para materiales.
 * El mismo diseño aplica para herramientas, estilos, oficios y técnicas
 * una vez que esos endpoints de perfil estén disponibles.
 */

import React, { useEffect, useState } from 'react';
import {
  getArtisanMaterials,
  addArtisanMaterial,
  type ArtisanMaterialItem,
} from '@/services/artisan-materials.actions';
import { getApprovedMaterials, type Material } from '@/services/materials.actions';
import { searchTaxonomy, suggestTaxonomyItem, type TaxonomyItem } from '@/services/taxonomy.actions';
import {
  getArtisanMaestros,
  addArtisanMaestro,
  removeArtisanMaestro,
  type ArtisanMaestroItem,
} from '@/services/artisan-maestros.actions';

// ── Icon mapping ──────────────────────────────────────────────────────────────

const ICON_MAP: { keywords: string[]; icon: string }[] = [
  { keywords: ['fique', 'cabuya', 'fibra vegetal', 'esparto'], icon: 'grass' },
  { keywords: ['algodón', 'lana', 'seda', 'hilo', 'lino', 'yute', 'cáñamo', 'tejido', 'textil', 'rafia'], icon: 'texture' },
  { keywords: ['oro', 'plata', 'cobre', 'bronce', 'metal', 'hierro', 'acero', 'platino', 'latón', 'aluminio'], icon: 'diamond' },
  { keywords: ['barro', 'arcilla', 'cerámica', 'porcelana', 'terracota', 'greda'], icon: 'water_drop' },
  { keywords: ['madera', 'guadua', 'bambú', 'caña', 'palma', 'mimbre', 'ratán', 'totumo', 'balsa'], icon: 'forest' },
  { keywords: ['cuero', 'piel', 'gamuza', 'ante'], icon: 'pets' },
  { keywords: ['vidrio', 'cristal', 'vitral'], icon: 'light_mode' },
  { keywords: ['piedra', 'mármol', 'granito', 'roca', 'mineral', 'concha', 'coral'], icon: 'landscape' },
  { keywords: ['resina', 'plástico', 'acrílico', 'polímero'], icon: 'science' },
  { keywords: ['papel', 'cartón', 'cartulina', 'papiro'], icon: 'description' },
  { keywords: ['chaquira', 'mostacilla', 'abalorios', 'mostacita', 'pepita'], icon: 'scatter_plot' },
  { keywords: ['semilla', 'tagua', 'coco', 'iraca', 'plumas', 'hueso'], icon: 'eco' },
  { keywords: ['pintura', 'pigmento', 'tinte', 'anilina', 'óxido'], icon: 'palette' },
];

function getIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const { keywords, icon } of ICON_MAP) {
    if (keywords.some(kw => lower.includes(kw))) return icon;
  }
  return 'texture';
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface MaterialPickerProps {
  /** ID del artesano (UserProfile.id). Necesario para leer/escribir perfil. */
  artisanId: string;
  /** ID del usuario autenticado. Se usa como suggestedBy en nuevas sugerencias. */
  userId: string;
  /** IDs de materiales seleccionados para este producto. */
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const MaterialPicker: React.FC<MaterialPickerProps> = ({
  artisanId,
  userId,
  selectedIds,
  onChange,
}) => {
  const [profileItems, setProfileItems] = useState<ArtisanMaterialItem[]>([]);
  const [approvedCatalog, setApprovedCatalog] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const profileIds = profileItems.map(p => p.materialId);

  const searchResults = searchQuery.trim().length >= 2
    ? approvedCatalog
        .filter(m =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !profileIds.includes(m.id),
        )
        .slice(0, 14)
    : [];

  // ── Load data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    // El catálogo aprobado siempre carga (necesario para el buscador).
    getApprovedMaterials().then(setApprovedCatalog).catch(() => {});

    if (!artisanId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getArtisanMaterials(artisanId)
      .then(setProfileItems)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [artisanId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleSelected = (materialId: string) => {
    onChange(
      selectedIds.includes(materialId)
        ? selectedIds.filter(id => id !== materialId)
        : [...selectedIds, materialId],
    );
  };

  const handleAddFromSearch = async (mat: Material) => {
    setAddingId(mat.id);

    // Representación local para mostrar el ítem en el grid inmediatamente.
    const localEntry: ArtisanMaterialItem = {
      id: `local-${mat.id}`,
      artisanId,
      materialId: mat.id,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      material: { id: mat.id, name: mat.name, status: 'approved' },
    };

    // Optimistic UI: agrega al grid y a la selección del producto de inmediato.
    setProfileItems(prev => {
      if (prev.some(p => p.materialId === mat.id)) return prev;
      return [...prev, localEntry];
    });
    onChange(selectedIds.includes(mat.id) ? selectedIds : [...selectedIds, mat.id]);
    setSearchQuery('');

    // Persiste al perfil artesanal en background (si hay artisanId).
    if (artisanId) {
      try {
        const saved = await addArtisanMaterial(artisanId, mat.id);
        // Reemplaza la entrada local por la real del servidor.
        setProfileItems(prev =>
          prev.map(p => (p.id === localEntry.id ? saved : p)),
        );
      } catch {
        // 409 = ya existía en el perfil → ok.
        // Otros errores → el ítem queda en el grid con la entrada local.
      }
    }

    setAddingId(null);
  };

  const handleSuggest = async () => {
    const name = suggestName.trim();
    if (!name) return;
    setIsSuggesting(true);
    try {
      // 1. Crear ítem pendiente en la taxonomía.
      const newItem = await suggestTaxonomyItem('materials', name, userId);

      // 2. Entrada local optimista (status pending) para mostrar en el grid.
      const localEntry: ArtisanMaterialItem = {
        id: `local-${newItem.id}`,
        artisanId,
        materialId: newItem.id,
        isPrimary: false,
        createdAt: new Date().toISOString(),
        material: { id: newItem.id, name: newItem.name, status: 'pending' },
      };
      setProfileItems(prev => [...prev, localEntry]);
      onChange([...selectedIds, newItem.id]);
      setSuggestName('');
      setShowSuggest(false);

      // 3. Enlazar al perfil artesanal en background.
      if (artisanId) {
        try {
          const saved = await addArtisanMaterial(artisanId, newItem.id);
          setProfileItems(prev =>
            prev.map(p => (p.id === localEntry.id ? saved : p)),
          );
        } catch { /* ya vinculado o sin perfil */ }
      }
    } catch {
      // El toast de error lo muestra el interceptor de telarApi.
    } finally {
      setIsSuggesting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-[12px] text-[#54433e]/40">
        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
        Cargando materiales...
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Perfil: materiales guardados ────────────────────────────────────── */}
      {profileItems.length > 0 && (
        <div>
          <p className="text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/40 mb-3">
            Tus materiales
          </p>
          <div className="flex flex-wrap gap-2.5">
            {profileItems.map(pm => {
              const matName = pm.material?.name ?? '—';
              return (
                <MaterialCard
                  key={pm.id}
                  name={matName}
                  icon={getIcon(matName)}
                  isSelected={selectedIds.includes(pm.materialId)}
                  isPending={pm.material?.status === 'pending'}
                  onClick={() => toggleSelected(pm.materialId)}
                />
              );
            })}
          </div>
        </div>
      )}

      {profileItems.length === 0 && (
        <p className="text-[12px] text-[#54433e]/40 italic py-2">
          Aún no tienes materiales en tu perfil. Busca uno abajo o sugiérelo.
        </p>
      )}

      {/* ── Agregar desde catálogo ────────────────────────────────────────── */}
      <div
        className="pt-4 space-y-3"
        style={{ borderTop: profileItems.length > 0 ? '1px solid rgba(226,213,207,0.25)' : 'none' }}
      >
        {profileItems.length > 0 && (
          <p className="text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/40">
            Agregar más
          </p>
        )}

        {/* Search box */}
        <div className="relative">
          <span className="material-symbols-outlined text-[15px] text-[#54433e]/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar material en el catálogo..."
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

        {/* Search results */}
        {searchQuery.trim().length >= 2 && (
          <div>
            {searchResults.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {searchResults.map(mat => (
                  <button
                    key={mat.id}
                    onClick={() => handleAddFromSearch(mat)}
                    disabled={addingId === mat.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2d5cf]/50 bg-white hover:border-[#ec6d13]/40 hover:bg-[#ec6d13]/5 text-[12px] text-[#54433e] font-[500] transition-all group disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[14px] text-[#54433e]/35 group-hover:text-[#ec6d13] transition-colors ${addingId === mat.id ? 'animate-spin' : ''}`}>
                      {addingId === mat.id ? 'progress_activity' : getIcon(mat.name)}
                    </span>
                    {mat.name}
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
                  onClick={() => {
                    setSuggestName(searchQuery);
                    setSearchQuery('');
                    setShowSuggest(true);
                  }}
                  className="text-[11px] font-[700] text-[#ec6d13] hover:underline shrink-0 ml-3"
                >
                  Sugerir nuevo →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Suggest new */}
        {!showSuggest ? (
          <button
            onClick={() => setShowSuggest(true)}
            className="flex items-center gap-1.5 text-[11px] font-[700] text-[#54433e]/40 hover:text-[#ec6d13] transition-colors mt-1"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            ¿No encuentras tu material? Sugerirlo al equipo TELAR
          </button>
        ) : (
          <div
            className="p-4 rounded-xl space-y-3"
            style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.15)' }}
          >
            <div>
              <p className="text-[10px] font-[800] uppercase tracking-widest text-[#ec6d13]/80 mb-1">
                Sugerir nuevo material
              </p>
              <p className="text-[11px] text-[#54433e]/55 leading-snug">
                Quedará en revisión hasta que el equipo TELAR lo apruebe.{' '}
                <span className="font-[600]">Solo tú lo verás</span> mientras está pendiente; una vez aprobado aparecerá en el catálogo para todos.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={suggestName}
                onChange={e => setSuggestName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isSuggesting && handleSuggest()}
                placeholder="Nombre del material..."
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

// ── MaterialCard ──────────────────────────────────────────────────────────────

interface MaterialCardProps {
  name: string;
  icon: string;
  isSelected: boolean;
  isPending: boolean;
  onClick: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ name, icon, isSelected, isPending, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={isPending ? `${name} — En revisión por el equipo TELAR` : name}
    className={`relative flex flex-col items-center justify-center gap-1.5 w-[96px] h-[82px] rounded-xl border-2 transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ec6d13]/40 ${
      isSelected
        ? 'border-[#ec6d13] shadow-sm'
        : 'border-[#e2d5cf]/40 bg-white hover:border-[#ec6d13]/35 hover:shadow-sm'
    }`}
    style={isSelected ? { background: 'rgba(236,109,19,0.06)' } : { background: '#ffffff' }}
  >
    {/* Checkmark badge */}
    {isSelected && (
      <div className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-[#ec6d13] flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-white" style={{ fontSize: 11 }}>check</span>
      </div>
    )}

    {/* Pending badge */}
    {isPending && (
      <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span className="text-[8px] font-[800] text-amber-600 uppercase tracking-wide leading-none">
          Rev.
        </span>
      </div>
    )}

    {/* Icon */}
    <span
      className={`material-symbols-outlined transition-colors`}
      style={{
        fontSize: 22,
        color: isSelected ? '#ec6d13' : 'rgba(84,67,62,0.38)',
      }}
    >
      {icon}
    </span>

    {/* Name */}
    <span
      className="text-center leading-tight px-1.5 font-[700] transition-colors"
      style={{
        fontSize: 10,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        color: isSelected ? '#ec6d13' : 'rgba(84,67,62,0.65)',
      }}
    >
      {name}
    </span>
  </button>
);

// ── ToolPicker ────────────────────────────────────────────────────────────────

const TOOL_ICON_MAP: { keywords: string[]; icon: string }[] = [
  { keywords: ['telar', 'lanzadera', 'urdimbre', 'urdido'], icon: 'grid_on' },
  { keywords: ['aguja', 'punzón', 'alfiler', 'alfileres'], icon: 'push_pin' },
  { keywords: ['crochet', 'ganchillo'], icon: 'loop' },
  { keywords: ['torno'], icon: 'rotate_right' },
  { keywords: ['horno', 'kiln'], icon: 'local_fire_department' },
  { keywords: ['pincel', 'brocha', 'pintura'], icon: 'brush' },
  { keywords: ['tijera', 'cutter', 'cortador'], icon: 'content_cut' },
  { keywords: ['molde', 'plantilla', 'patrón'], icon: 'category' },
  { keywords: ['soplete', 'soldador', 'llama'], icon: 'whatshot' },
  { keywords: ['machete', 'cuchillo', 'navaja', 'bisturí'], icon: 'agriculture' },
  { keywords: ['martillo', 'mazo', 'maza'], icon: 'hardware' },
  { keywords: ['formón', 'gubia', 'cincel', 'escoplo'], icon: 'carpenter' },
  { keywords: ['lija', 'lijadora', 'esmeril'], icon: 'layers' },
  { keywords: ['sierra', 'serrucho', 'segueta'], icon: 'handyman' },
];

function getToolIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const { keywords, icon } of TOOL_ICON_MAP) {
    if (keywords.some(kw => lower.includes(kw))) return icon;
  }
  return 'build';
}

interface ToolPickerProps {
  userId?: string;
  selected: string[];
  onChange: (names: string[]) => void;
}

export const ToolPicker: React.FC<ToolPickerProps> = ({ userId, selected, onChange }) => {
  const [catalog, setCatalog] = useState<TaxonomyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    searchTaxonomy('herramientas', undefined, 'approved')
      .then(setCatalog)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const searchResults = searchQuery.trim().length >= 2
    ? catalog
        .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !selected.includes(t.name))
        .slice(0, 14)
    : [];

  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name]);

  const handleAddFromSearch = (item: TaxonomyItem) => {
    if (!selected.includes(item.name)) onChange([...selected, item.name]);
    setSearchQuery('');
  };

  const handleSuggest = async () => {
    const name = suggestName.trim();
    if (!name) return;
    setIsSuggesting(true);
    try {
      await suggestTaxonomyItem('herramientas', name, userId);
      if (!selected.includes(name)) onChange([...selected, name]);
      setSuggestName('');
      setShowSuggest(false);
    } catch {
      // el interceptor muestra el toast
    } finally {
      setIsSuggesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-[12px] text-[#54433e]/40">
        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
        Cargando herramientas...
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Seleccionadas */}
      {selected.length > 0 && (
        <div>
          <p className="text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/40 mb-3">
            Tus herramientas
          </p>
          <div className="flex flex-wrap gap-2.5">
            {selected.map(name => (
              <MaterialCard
                key={name}
                name={name}
                icon={getToolIcon(name)}
                isSelected
                isPending={false}
                onClick={() => toggle(name)}
              />
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-[12px] text-[#54433e]/40 italic py-2">
          Aún no has agregado herramientas. Busca una abajo o sugiérela.
        </p>
      )}

      {/* Catálogo / búsqueda */}
      <div
        className="pt-4 space-y-3"
        style={{ borderTop: selected.length > 0 ? '1px solid rgba(226,213,207,0.25)' : 'none' }}
      >
        {selected.length > 0 && (
          <p className="text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/40">
            Agregar más
          </p>
        )}

        <div className="relative">
          <span className="material-symbols-outlined text-[15px] text-[#54433e]/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar herramienta en el catálogo..."
            className="w-full border border-[#e2d5cf]/40 rounded-xl px-4 pl-9 py-2.5 text-[13px] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/40 focus:ring-2 focus:ring-[#ec6d13]/8 transition-all hover:border-[#e2d5cf]/70"
            style={{ background: 'rgba(247,244,239,0.4)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#54433e]/30 hover:text-[#54433e]/60 transition-colors">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {searchQuery.trim().length >= 2 && (
          <div>
            {searchResults.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddFromSearch(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2d5cf]/50 bg-white hover:border-[#ec6d13]/40 hover:bg-[#ec6d13]/5 text-[12px] text-[#54433e] font-[500] transition-all group"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#54433e]/35 group-hover:text-[#ec6d13] transition-colors">
                      {getToolIcon(item.name)}
                    </span>
                    {item.name}
                    <span className="material-symbols-outlined text-[11px] text-[#54433e]/25 group-hover:text-[#ec6d13] transition-colors">add</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between py-1.5 px-1">
                <p className="text-[12px] text-[#54433e]/40 italic">"{searchQuery}" no está en el catálogo</p>
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

        {!showSuggest ? (
          <button
            onClick={() => setShowSuggest(true)}
            className="flex items-center gap-1.5 text-[11px] font-[700] text-[#54433e]/40 hover:text-[#ec6d13] transition-colors mt-1"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            ¿No encuentras tu herramienta? Sugerirla al equipo TELAR
          </button>
        ) : (
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.15)' }}>
            <div>
              <p className="text-[10px] font-[800] uppercase tracking-widest text-[#ec6d13]/80 mb-1">Sugerir nueva herramienta</p>
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
                placeholder="Nombre de la herramienta..."
                autoFocus
                className="flex-1 border border-[#ec6d13]/20 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#ec6d13]/50 transition-all"
              />
              <button
                onClick={handleSuggest}
                disabled={!suggestName.trim() || isSuggesting}
                className="px-4 py-2 rounded-lg bg-[#ec6d13] text-white text-[10px] font-[800] uppercase tracking-widest hover:bg-[#d4600f] disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
              >
                {isSuggesting && <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>}
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

// ─────────────────────────────────────────────────────────────────────────────
// MaestroPicker
// ─────────────────────────────────────────────────────────────────────────────

interface MaestroPickerProps {
  artisanId: string;
  localMaestros: { id?: string; name: string; description?: string }[];
  onChange: (maestros: { id?: string; name: string; description?: string }[]) => void;
}

export const MaestroPicker: React.FC<MaestroPickerProps> = ({ artisanId, localMaestros, onChange }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!artisanId) return;
    getArtisanMaestros(artisanId)
      .then(items => {
        if (items.length > 0) {
          onChange(items.map(i => ({ id: i.id, name: i.name, description: i.description ?? undefined })));
        }
      })
      .catch(() => {});
  }, [artisanId]);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsAdding(true);
    try {
      const local = { name: trimmed, description: description.trim() || undefined };
      onChange([...localMaestros, local]);
      setName('');
      setDescription('');
      if (artisanId) {
        const saved = await addArtisanMaestro(artisanId, local.name, local.description);
        onChange([
          ...localMaestros.filter(m => m.id),
          { id: saved.id, name: saved.name, description: saved.description ?? undefined },
        ]);
      }
    } catch { /* toast shown by interceptor */ } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (index: number, id?: string) => {
    if (id) setRemovingId(id);
    onChange(localMaestros.filter((_, i) => i !== index));
    if (id) {
      try { await removeArtisanMaestro(id); } catch { /* toast shown */ } finally { setRemovingId(null); }
    }
  };

  return (
    <div className="space-y-4">
      {localMaestros.length > 0 && (
        <div className="flex flex-col gap-2">
          {localMaestros.map((m, i) => (
            <div
              key={m.id ?? i}
              className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(236,109,19,0.05)', border: '1px solid rgba(236,109,19,0.15)' }}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-[#ec6d13] text-[18px] mt-0.5 shrink-0">
                  person_celebrate
                </span>
                <div className="min-w-0">
                  <p className="font-['Manrope'] text-[13px] font-[700] text-[#151b2d] leading-snug">
                    {m.name}
                  </p>
                  {m.description && (
                    <p className="font-['Manrope'] text-[11px] text-[#54433e]/55 mt-0.5 leading-snug">
                      {m.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemove(i, m.id)}
                disabled={removingId === m.id}
                className="shrink-0 text-[#54433e]/25 hover:text-[#ef4444]/60 transition-colors mt-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {removingId === m.id ? 'progress_activity' : 'close'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Nombre del maestro o mentora..."
            className="flex-1 rounded-xl border border-[#e2d5cf]/50 px-4 py-2.5 text-[13px] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 transition-all"
            style={{ background: 'rgba(247,244,239,0.4)' }}
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim() || isAdding}
            className="px-4 py-2.5 rounded-xl text-[12px] font-[800] uppercase tracking-widest transition-all disabled:opacity-40"
            style={{ background: name.trim() ? '#ec6d13' : 'rgba(84,67,62,0.08)', color: name.trim() ? 'white' : '#54433e80' }}
          >
            {isAdding
              ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              : 'Agregar'}
          </button>
        </div>

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="¿Cómo te enseñó? ¿Qué recuerdas de ese aprendizaje? ¿Qué te enseñaron que no está en ningún libro?"
          rows={2}
          className="w-full rounded-xl border border-[#e2d5cf]/50 px-4 py-2.5 text-[12px] text-[#54433e] resize-none focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 transition-all"
          style={{ background: 'rgba(247,244,239,0.4)' }}
        />
      </div>

      {localMaestros.length === 0 && (
        <p className="text-[11px] text-[#54433e]/35 italic">
          Cada nombre que registres traza la cadena viva de transmisión de tu oficio.
        </p>
      )}
    </div>
  );
};
