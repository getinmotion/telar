/**
 * CraftPicker / TechniquePicker
 *
 * Componentes de selección de oficio y técnica en estilo tarjeta.
 * Mismo patrón visual que MaterialPicker (TaxonomyPicker.tsx).
 *
 * CraftPicker  — single-select, filtrado por categoría del producto.
 * TechniquePicker — single-select, aparece solo cuando hay oficio seleccionado.
 */

import React, { useEffect, useState } from 'react';
import { getAllCrafts, getTechniquesByCraftId, type Craft, type Technique } from '@/services/crafts.actions';

// ── Icon mapping ──────────────────────────────────────────────────────────────

const CRAFT_ICON_MAP: { keywords: string[]; icon: string }[] = [
  { keywords: ['tejer', 'tejido', 'tejedor', 'crochet', 'tricot', 'ganchillo', 'calceta'], icon: 'texture' },
  { keywords: ['bordar', 'bordado', 'bordaduría', 'zurcir'], icon: 'texture' },
  { keywords: ['orfebrería', 'platería', 'filigrana', 'joyería', 'repujado', 'fundición', 'soldadura'], icon: 'diamond' },
  { keywords: ['alfarería', 'cerámica', 'torno', 'barro', 'arcilla', 'loza', 'porcelana', 'greda'], icon: 'water_drop' },
  { keywords: ['carpintería', 'ebanistería', 'madera', 'marquetería', 'lutería', 'tallado', 'talla'], icon: 'forest' },
  { keywords: ['cuero', 'marroquinería', 'talabartería', 'peletería'], icon: 'pets' },
  { keywords: ['vidrio', 'vitrería', 'vitral', 'soplado'], icon: 'light_mode' },
  { keywords: ['forja', 'herrería', 'metalurgia', 'metal'], icon: 'hardware' },
  { keywords: ['macramé', 'trenzado', 'cestería', 'canastería', 'esparto', 'mimbre', 'fique'], icon: 'grass' },
  { keywords: ['pintura', 'ilustración', 'grabado', 'serigrafía'], icon: 'palette' },
  { keywords: ['chaquira', 'mostacilla', 'bisutería', 'abalorios'], icon: 'scatter_plot' },
  { keywords: ['tinte', 'teñido', 'batik', 'serigrafía'], icon: 'colorize' },
  { keywords: ['papel', 'origami', 'papelería', 'encuadernación'], icon: 'description' },
  { keywords: ['jabonería', 'cosmética', 'aromaterapia', 'velas'], icon: 'spa' },
  { keywords: ['escultura', 'modelado', 'moldeado'], icon: 'category' },
  { keywords: ['tapicería', 'tapizado', 'relleno'], icon: 'chair' },
  { keywords: ['hilar', 'hilado', 'hilatura'], icon: 'sync_alt' },
];

function getCraftIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const { keywords, icon } of CRAFT_ICON_MAP) {
    if (keywords.some(kw => lower.includes(kw))) return icon;
  }
  return 'construction';
}

// ── Category → craft keyword filter ──────────────────────────────────────────
// Mapea el nombre de la categoría TELAR a palabras clave de oficios relevantes.
// Si la categoría no tiene match, se muestran todos los oficios.

const CATEGORY_CRAFT_KEYWORDS: { catKeywords: string[]; craftKeywords: string[] }[] = [
  {
    catKeywords: ['textiles', 'moda'],
    craftKeywords: ['tejer', 'bordar', 'hilar', 'teñir', 'batik', 'macramé', 'crochet', 'ganchillo', 'costura', 'confección', 'tejido'],
  },
  {
    catKeywords: ['bolsos', 'carteras'],
    craftKeywords: ['tejer', 'cuero', 'trenzado', 'macramé', 'cestería', 'marroquinería', 'bordado'],
  },
  {
    catKeywords: ['joyería', 'accesorios'],
    craftKeywords: ['orfebrería', 'filigrana', 'platería', 'chaquira', 'bisutería', 'repujado', 'fundición', 'joyería'],
  },
  {
    catKeywords: ['decoración', 'hogar'],
    craftKeywords: ['cerámica', 'alfarería', 'talla', 'ebanistería', 'vidrio', 'cestería', 'macramé', 'loza'],
  },
  {
    catKeywords: ['muebles'],
    craftKeywords: ['ebanistería', 'carpintería', 'talla', 'forja', 'tapicería', 'marquetería', 'tallado'],
  },
  {
    catKeywords: ['vajillas', 'cocina'],
    craftKeywords: ['cerámica', 'alfarería', 'torno', 'vidrio', 'talla', 'loza', 'porcelana'],
  },
  {
    catKeywords: ['arte', 'esculturas'],
    craftKeywords: ['talla', 'cerámica', 'pintura', 'grabado', 'escultura', 'forja', 'modelado', 'ilustración'],
  },
  {
    catKeywords: ['juguetes', 'instrumentos'],
    craftKeywords: ['talla', 'carpintería', 'torno', 'lutería', 'ebanistería'],
  },
  {
    catKeywords: ['cuidado', 'personal'],
    craftKeywords: ['jabonería', 'cosmética', 'aromaterapia', 'velas'],
  },
];

function getCraftKeywordsForCategory(categoryName?: string): string[] | null {
  if (!categoryName) return null;
  const lower = categoryName.toLowerCase();
  for (const { catKeywords, craftKeywords } of CATEGORY_CRAFT_KEYWORDS) {
    if (catKeywords.some(kw => lower.includes(kw))) return craftKeywords;
  }
  return null;
}

function matchesCategoryFilter(craftName: string, keywords: string[]): boolean {
  const lower = craftName.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

// ── CraftPicker ───────────────────────────────────────────────────────────────

interface CraftPickerProps {
  /** Nombre de la categoría seleccionada para filtrar oficios relevantes. */
  categoryName?: string;
  selectedCraftId?: string;
  onChange: (craftId: string | undefined) => void;
}

export const CraftPicker: React.FC<CraftPickerProps> = ({
  categoryName,
  selectedCraftId,
  onChange,
}) => {
  const [allCrafts, setAllCrafts] = useState<Craft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAllCrafts()
      .then(setAllCrafts)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const categoryKeywords = getCraftKeywordsForCategory(categoryName);

  // Crafts visibles según filtro de categoría o búsqueda
  const visibleCrafts: Craft[] = (() => {
    if (searchQuery.trim().length >= 2) {
      return allCrafts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (!categoryKeywords || showAll) return allCrafts;
    return allCrafts.filter(c => matchesCategoryFilter(c.name, categoryKeywords));
  })();

  const hiddenCount = categoryKeywords && !showAll && !searchQuery
    ? allCrafts.length - visibleCrafts.length
    : 0;

  const selectedCraft = allCrafts.find(c => c.id === selectedCraftId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-[12px] text-[#54433e]/40">
        <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
        Cargando oficios...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined text-[15px] text-[#54433e]/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setShowAll(false); }}
          placeholder="Buscar oficio..."
          className="w-full border border-[#e2d5cf]/40 rounded-xl px-4 pl-9 py-2 text-[13px] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/40 focus:ring-2 focus:ring-[#ec6d13]/8 transition-all hover:border-[#e2d5cf]/70"
          style={{ background: 'rgba(247,244,239,0.4)' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#54433e]/30 hover:text-[#54433e]/60"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Category label */}
      {categoryKeywords && !searchQuery && (
        <p className="text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/40">
          {showAll ? 'Todos los oficios' : `Oficios para ${categoryName}`}
        </p>
      )}

      {/* Cards grid */}
      {visibleCrafts.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {visibleCrafts.map(craft => {
            const isSelected = craft.id === selectedCraftId;
            return (
              <TaxonomyCard
                key={craft.id}
                name={craft.name}
                icon={getCraftIcon(craft.name)}
                isSelected={isSelected}
                onClick={() => onChange(isSelected ? undefined : craft.id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-[12px] text-[#54433e]/40 italic py-1">
          {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay oficios disponibles.'}
        </p>
      )}

      {/* Show all / show less toggle */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center gap-1.5 text-[11px] font-[700] text-[#54433e]/40 hover:text-[#ec6d13] transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">expand_more</span>
          Ver los {hiddenCount} oficios restantes
        </button>
      )}
      {showAll && !searchQuery && categoryKeywords && (
        <button
          onClick={() => setShowAll(false)}
          className="flex items-center gap-1.5 text-[11px] font-[700] text-[#54433e]/40 hover:text-[#ec6d13] transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">expand_less</span>
          Ver solo los de {categoryName}
        </button>
      )}

      {/* Selected label */}
      {selectedCraft && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="material-symbols-outlined text-[14px] text-[#ec6d13]">check_circle</span>
          <span className="text-[11px] font-[700] text-[#ec6d13]">{selectedCraft.name}</span>
        </div>
      )}
    </div>
  );
};

// ── TechniquePicker ───────────────────────────────────────────────────────────

interface TechniquePickerProps {
  craftId?: string;
  craftName?: string;
  selectedTechniqueId?: string;
  onChange: (techniqueId: string | undefined) => void;
}

export const TechniquePicker: React.FC<TechniquePickerProps> = ({
  craftId,
  craftName,
  selectedTechniqueId,
  onChange,
}) => {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!craftId) { setTechniques([]); return; }
    setIsLoading(true);
    getTechniquesByCraftId(craftId)
      .then(setTechniques)
      .catch(() => setTechniques([]))
      .finally(() => setIsLoading(false));
  }, [craftId]);

  if (!craftId) {
    return (
      <div className="flex items-center gap-2 py-3 text-[12px] text-[#54433e]/30 italic">
        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
        Selecciona un oficio para ver sus técnicas
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-[12px] text-[#54433e]/40">
        <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
        Cargando técnicas de {craftName}...
      </div>
    );
  }

  if (techniques.length === 0) {
    return (
      <p className="text-[12px] text-[#54433e]/35 italic py-2">
        No hay subtécnicas registradas para {craftName ?? 'este oficio'}.
      </p>
    );
  }

  const selectedTechnique = techniques.find(t => t.id === selectedTechniqueId);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {techniques.map(tech => {
          const isSelected = tech.id === selectedTechniqueId;
          return (
            <TaxonomyCard
              key={tech.id}
              name={tech.name}
              icon={getCraftIcon(tech.name)}
              isSelected={isSelected}
              onClick={() => onChange(isSelected ? undefined : tech.id)}
              small
            />
          );
        })}
      </div>
      {selectedTechnique && (
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-[#ec6d13]">check_circle</span>
          <span className="text-[11px] font-[700] text-[#ec6d13]">{selectedTechnique.name}</span>
          <span className="text-[10px] text-[#54433e]/40">— Opcional</span>
        </div>
      )}
    </div>
  );
};

// ── TaxonomyCard ──────────────────────────────────────────────────────────────
// Tarjeta genérica reutilizable (igual que MaterialCard en TaxonomyPicker.tsx).

interface TaxonomyCardProps {
  name: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
  small?: boolean;
}

const TaxonomyCard: React.FC<TaxonomyCardProps> = ({ name, icon, isSelected, onClick, small }) => (
  <button
    type="button"
    onClick={onClick}
    title={name}
    className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ec6d13]/40 ${
      small ? 'w-[82px] h-[70px]' : 'w-[96px] h-[82px]'
    } ${
      isSelected
        ? 'border-[#ec6d13] shadow-sm'
        : 'border-[#e2d5cf]/40 bg-white hover:border-[#ec6d13]/35 hover:shadow-sm'
    }`}
    style={isSelected ? { background: 'rgba(236,109,19,0.06)' } : { background: '#ffffff' }}
  >
    {/* Checkmark */}
    {isSelected && (
      <div className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-[#ec6d13] flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-white" style={{ fontSize: 11 }}>check</span>
      </div>
    )}

    {/* Icon */}
    <span
      className="material-symbols-outlined transition-colors"
      style={{
        fontSize: small ? 18 : 22,
        color: isSelected ? '#ec6d13' : 'rgba(84,67,62,0.38)',
      }}
    >
      {icon}
    </span>

    {/* Name */}
    <span
      className="text-center leading-tight px-1.5 font-[700] transition-colors"
      style={{
        fontSize: small ? 9 : 10,
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
