/**
 * CategoriesMegaMenu Component
 * Mega dropdown for Categorías in the navbar.
 * Left: parent categories list
 * Center: subcategories of the hovered category
 * Right: featured products from that category
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import {
  getProductsNew,
  getPrimaryImageUrl,
  getProductPrice,
  getTechniqueName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import type { CategoryWithChildren } from "@/services/taxonomy.actions";
import {
  Gem,
  Home,
  ShoppingBag,
  Shirt,
  Armchair,
  UtensilsCrossed,
  Palette,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

// ── Icon mapping per category slug ──────────────────
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "joyeria-y-accesorios": Gem,
  "decoracion-del-hogar": Home,
  "textiles-y-moda": Shirt,
  "bolsos-y-carteras": ShoppingBag,
  "muebles": Armchair,
  "vajillas-y-cocina": UtensilsCrossed,
  "arte-y-esculturas": Palette,
};

const EXCLUDED_SLUGS = ["cuidado-personal"];

interface CategoriesMegaMenuProps {
  onClose: () => void;
}

export const CategoriesMegaMenu = ({ onClose }: CategoriesMegaMenuProps) => {
  const { categoryHierarchy, loading } = useTaxonomy();
  const [activeCategory, setActiveCategory] = useState<CategoryWithChildren | null>(null);
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductNewCore[]>([]);

  const categories = categoryHierarchy.filter(
    (c) => c.isActive && !EXCLUDED_SLUGS.includes(c.slug)
  );

  // Pre-fetch products once
  useEffect(() => {
    let cancelled = false;
    getProductsNew({ page: 1, limit: 500 })
      .then((res) => {
        if (!cancelled) setAllProducts(res.data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Set first category as active on load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  // Filter products when active category changes
  useEffect(() => {
    if (!activeCategory || allProducts.length === 0) return;
    const catIds = new Set([activeCategory.id, ...activeCategory.subcategories.map((s) => s.id)]);
    const filtered = allProducts.filter((p) => catIds.has(p.categoryId)).slice(0, 2);
    setProducts(filtered);
  }, [activeCategory, allProducts]);

  if (loading || categories.length === 0) return null;

  return (
    <div
      className="absolute top-full left-0 w-full bg-white shadow-[0_30px_60px_rgba(0,0,0,0.08)] z-50 border-b border-border/10 animate-in fade-in slide-in-from-top-2 duration-200"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-[560px]">
        {/* Left Column: Categories List */}
        <aside className="w-full lg:w-80 bg-[#f9f7f2]/30 border-r border-border/10 p-10 flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold mb-2">
                Explora por categoria
              </p>
              <h2 className="font-serif text-3xl mb-1">Categorias</h2>
              <p className="text-[9px] text-foreground/30 uppercase tracking-[0.1em] font-medium">
                Artesania Colombiana Curada
              </p>
            </div>
            <ul className="space-y-1">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] || Palette;
                const isActive = activeCategory?.id === cat.id;
                return (
                  <li key={cat.id}>
                    <button
                      className={`flex items-center space-x-4 p-3 -mx-3 rounded-sm w-full text-left transition-all ${
                        isActive
                          ? "bg-[#f2eee4] text-[#ec6d13]"
                          : "text-foreground/60 hover:text-[#ec6d13] hover:bg-[#f2eee4]/50"
                      }`}
                      onMouseEnter={() => setActiveCategory(cat)}
                      onClick={() => {
                        onClose();
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span
                        className={`text-sm tracking-wide ${
                          isActive ? "font-serif font-bold" : "font-medium"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="pt-8 border-t border-border/10">
            <Link
              to="/categorias"
              onClick={onClose}
              className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-foreground hover:text-[#ec6d13] transition-all group"
            >
              <span>Ver todas las categorias</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </aside>

        {/* Main Content: Subcategories + Products */}
        <div className="flex-1 grid grid-cols-12 gap-0">
          {/* Center Panel: Subcategories */}
          <div className="col-span-12 lg:col-span-4 p-12 border-r border-border/10 flex flex-col">
            {activeCategory && (
              <>
                <div className="mb-10 pb-6 border-b border-border/10">
                  <h3 className="font-serif text-3xl italic tracking-tight mb-2">
                    {activeCategory.name}
                  </h3>
                  <p className="text-[9px] uppercase tracking-widest text-foreground/40">
                    Subcategorias disponibles
                  </p>
                </div>
                <ul className="space-y-6">
                  {activeCategory.subcategories.slice(0, 7).map((sub, i) => (
                    <li key={sub.id}>
                      <Link
                        to={`/productos?categoria=${sub.slug}`}
                        onClick={onClose}
                        className={`flex items-center justify-between group transition-colors ${
                          i < 3
                            ? "text-base font-bold text-foreground hover:text-[#ec6d13]"
                            : "text-sm font-medium text-foreground/60 hover:text-[#ec6d13]"
                        }`}
                      >
                        {sub.name}
                        {i < 3 && (
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-10">
                  <Link
                    to={`/productos?categoria=${activeCategory.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec6d13] border-b border-[#ec6d13]/30 pb-1 hover:border-[#ec6d13] transition-all group"
                  >
                    Explorar todo {activeCategory.name}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Right Panel: Featured Products */}
          <div className="col-span-12 lg:col-span-8 p-12 flex flex-col bg-[#f9f7f2]/10">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/10">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/30">
                Popular en esta categoria
              </span>
            </div>
            <div className="grid grid-cols-2 gap-10">
              {products.map((product) => {
                const imageUrl = getPrimaryImageUrl(product);
                const price = getProductPrice(product);
                const technique = getTechniqueName(product);
                const department = product.artisanShop?.department;

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[4/5] mb-6 overflow-hidden relative shadow-sm bg-[#e5e1d8] rounded-sm">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-serif text-2xl leading-tight group-hover:text-[#ec6d13] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/40 italic">
                          {product.artisanShop?.shopName}
                        </p>
                        <div className="flex gap-1.5 items-center">
                          {technique && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#ec6d13]">
                              {technique}
                            </span>
                          )}
                          {technique && department && (
                            <span className="text-[10px] text-foreground/20">·</span>
                          )}
                          {department && (
                            <span className="text-[9px] font-medium uppercase tracking-widest text-foreground/40">
                              {department}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-foreground/5">
                        <p className="text-lg font-bold tracking-tight">
                          {price ? formatCurrency(price) : "Consultar"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {products.length === 0 && (
                <p className="text-sm text-foreground/40 col-span-2">
                  No hay productos disponibles en esta categoria.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
