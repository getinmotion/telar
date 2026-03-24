import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { formatCurrency } from "@/lib/currencyUtils";
import { Product } from "@/types/products.types";
import { cn } from "@/lib/utils";

interface ArtisanProductsGridProps {
  products: Product[];
  shopSlug?: string;
}

export default function ArtisanProductsGrid({
  products,
  shopSlug,
}: ArtisanProductsGridProps) {
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();

  return (
    <section className="py-24 md:py-32 px-8 bg-white">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] mb-3">
              Catalogo Editorial
            </p>
            <h3 className="font-serif text-5xl md:text-6xl italic">
              Piezas creadas por este taller
            </h3>
          </div>
          {shopSlug && (
            <Link
              to={`/tienda/${shopSlug}`}
              className="group inline-flex items-center gap-3 text-xs font-bold tracking-widest uppercase pb-1 hover:text-primary transition-colors"
            >
              <span>Ver coleccion completa</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => {
            const isFavorite = isInWishlist(product.id);

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] bg-slate-100 mb-5 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-sm">
                      {product.name}
                    </div>
                  )}
                  <button
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    disabled={wishlistLoading}
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4",
                        isFavorite && "fill-primary text-primary"
                      )}
                    />
                  </button>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                    {product.category || product.craft}
                    {(product.city || product.department) && (
                      <> &bull; {[product.city, product.department].filter(Boolean).join(", ")}</>
                    )}
                  </p>
                  <h4 className="font-bold text-base group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-primary font-black tracking-tight text-sm">
                    {formatCurrency(parseFloat(product.price))}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 font-light text-lg italic">
              Proximamente piezas disponibles de este taller.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
