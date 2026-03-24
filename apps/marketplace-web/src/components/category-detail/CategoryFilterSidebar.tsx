import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSection {
  title: string;
  items: { label: string; count?: number }[];
  defaultOpen?: boolean;
}

interface CategoryFilterSidebarProps {
  categories: string[];
  activeCategory: string;
  techniques?: { label: string; count: number }[];
  regions?: { label: string; count: number }[];
  materials?: { label: string; count: number }[];
  onCategoryChange?: (category: string) => void;
  onTechniqueChange?: (technique: string) => void;
  onRegionChange?: (region: string) => void;
  onMaterialChange?: (material: string) => void;
  priceRange?: [number, number];
  onPriceChange?: (value: number) => void;
  currentPrice?: number;
}

function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-primary/20 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full cursor-pointer py-2"
      >
        <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold font-sans">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && <div className="pt-4">{children}</div>}
    </div>
  );
}

export default function CategoryFilterSidebar({
  categories,
  activeCategory,
  techniques = [],
  regions = [],
  materials = [],
  onCategoryChange,
  onTechniqueChange,
  onRegionChange,
  onMaterialChange,
  priceRange = [0, 2000000],
  onPriceChange,
  currentPrice = 500000,
}: CategoryFilterSidebarProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="sticky top-32 space-y-8">
        {/* Categorias */}
        <FilterGroup title="Categorias" defaultOpen>
          <ul className="space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
            {categories.map((cat) => (
              <li
                key={cat}
                onClick={() => onCategoryChange?.(cat)}
                className={cn(
                  "cursor-pointer transition-colors",
                  cat === activeCategory
                    ? "text-primary font-bold flex items-center gap-2"
                    : "hover:text-primary"
                )}
              >
                {cat === activeCategory && (
                  <span className="w-1 h-1 bg-primary rounded-full" />
                )}
                {cat}
              </li>
            ))}
          </ul>
        </FilterGroup>

        {/* Tecnica artesanal */}
        {techniques.length > 0 && (
          <FilterGroup title="Tecnica artesanal" defaultOpen>
            <ul className="space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
              {techniques.map((tech) => (
                <li
                  key={tech.label}
                  onClick={() => {
                    const next = selectedTechnique === tech.label ? null : tech.label;
                    setSelectedTechnique(next);
                    onTechniqueChange?.(tech.label);
                  }}
                  className={cn(
                    "hover:text-primary cursor-pointer transition-colors flex justify-between",
                    selectedTechnique === tech.label &&
                      "font-bold text-charcoal"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {selectedTechnique === tech.label && (
                      <span className="w-1 h-1 bg-primary rounded-full" />
                    )}
                    {tech.label}
                  </span>
                  <span>({tech.count})</span>
                </li>
              ))}
            </ul>
          </FilterGroup>
        )}

        {/* Region */}
        {regions.length > 0 && (
          <FilterGroup title="Region">
            <ul className="space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
              {regions.map((reg) => (
                <li
                  key={reg.label}
                  onClick={() => {
                    const next = selectedRegion === reg.label ? null : reg.label;
                    setSelectedRegion(next);
                    onRegionChange?.(reg.label);
                  }}
                  className={cn(
                    "hover:text-primary cursor-pointer transition-colors flex justify-between",
                    selectedRegion === reg.label && "font-bold text-charcoal"
                  )}
                >
                  {reg.label} <span>({reg.count})</span>
                </li>
              ))}
            </ul>
          </FilterGroup>
        )}

        {/* Material */}
        {materials.length > 0 && (
          <FilterGroup title="Material">
            <ul className="space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
              {materials.map((mat) => (
                <li
                  key={mat.label}
                  onClick={() => {
                    const next = selectedMaterial === mat.label ? null : mat.label;
                    setSelectedMaterial(next);
                    onMaterialChange?.(mat.label);
                  }}
                  className={cn(
                    "hover:text-primary cursor-pointer transition-colors flex justify-between",
                    selectedMaterial === mat.label && "font-bold text-charcoal"
                  )}
                >
                  {mat.label} <span>({mat.count})</span>
                </li>
              ))}
            </ul>
          </FilterGroup>
        )}

        {/* Disponibilidad */}
        <FilterGroup title="Disponibilidad">
          <ul className="space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
            <li className="hover:text-primary cursor-pointer transition-colors flex justify-between">
              En stock <span>(--)</span>
            </li>
            <li className="hover:text-primary cursor-pointer transition-colors flex justify-between">
              Bajo pedido <span>(--)</span>
            </li>
          </ul>
        </FilterGroup>

        {/* Precio */}
        <FilterGroup title="Precio">
          <div className="px-1">
            <input
              className="w-full h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              step={50000}
              value={currentPrice}
              onChange={(e) => onPriceChange?.(Number(e.target.value))}
            />
            <div className="flex justify-between mt-4 text-[10px] font-bold font-sans uppercase">
              <span>$0</span>
              <span>$2.000.000+</span>
            </div>
          </div>
        </FilterGroup>
      </div>
    </aside>
  );
}
