import { useState } from "react";
import { X, LayoutGrid, Grid3X3 } from "lucide-react";
import { Product } from "@/types/products.types";
import CategoryProductCard from "./CategoryProductCard";
import { cn } from "@/lib/utils";

interface ActiveFilter {
  key: string;
  label: string;
}

interface CategoryProductGridProps {
  products: Product[];
  totalProducts: number;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  onClearFilters?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function CategoryProductGrid({
  products,
  totalProducts,
  activeFilters = [],
  onRemoveFilter,
  onClearFilters,
  onLoadMore,
  hasMore = false,
}: CategoryProductGridProps) {
  const [viewMode, setViewMode] = useState<"large" | "compact">("large");

  return (
    <div className="flex-1">
      <div className="flex flex-col gap-8 mb-12">
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 border-b border-charcoal/5 pb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">
              Filtros activos:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="bg-charcoal text-white text-[9px] px-3 py-1 flex items-center gap-2 rounded-full font-bold uppercase tracking-wider"
                >
                  {filter.label}
                  <button onClick={() => onRemoveFilter?.(filter.key)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={onClearFilters}
                className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary hover:opacity-70 transition-opacity ml-2"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        )}

        {/* Sort & View Bar */}
        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-[0.2em] text-charcoal/50 font-sans">
            Mostrando {products.length} de {totalProducts} piezas artesanales
          </span>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 border-r border-charcoal/10 pr-8">
              <button
                onClick={() => setViewMode("compact")}
                className={cn(
                  "transition-colors",
                  viewMode === "compact"
                    ? "text-charcoal"
                    : "text-charcoal/30 hover:text-charcoal"
                )}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("large")}
                className={cn(
                  "transition-colors",
                  viewMode === "large"
                    ? "text-charcoal"
                    : "text-charcoal/30 hover:text-charcoal"
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] font-sans hover:text-primary transition-colors">
              Ordenar por
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div
        className={cn(
          "grid gap-x-10 gap-y-24",
          viewMode === "large"
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {products.map((product, index) => {
          // Stagger effect: offset every other item in the second column
          const isStaggered =
            viewMode === "large" && index % 3 === 1;
          return (
            <CategoryProductCard
              key={product.id}
              product={product}
              className={isStaggered ? "md:mt-16" : ""}
            />
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-32 flex justify-center">
          <button
            onClick={onLoadMore}
            className="border border-primary text-primary px-16 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all font-sans rounded-sm"
          >
            Explorar mas piezas ({totalProducts} totales)
          </button>
        </div>
      )}
    </div>
  );
}
