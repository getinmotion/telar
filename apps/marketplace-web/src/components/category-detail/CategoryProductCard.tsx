import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { formatCurrency } from "@/lib/currencyUtils";
import { Product } from "@/types/products.types";
import { cn } from "@/lib/utils";

interface CategoryProductCardProps {
  product: Product;
  className?: string;
}

function getStockBadge(stock?: number) {
  if (stock === 0)
    return {
      label: "Agotado",
      className: "bg-charcoal text-white",
    };
  if (stock !== undefined && stock <= 3)
    return {
      label: stock === 1 ? "Ultima pieza" : `${stock} disponibles`,
      className: "bg-primary/10 text-primary",
    };
  return null;
}

export default function CategoryProductCard({
  product,
  className,
}: CategoryProductCardProps) {
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();
  const isFavorite = isInWishlist(product.id);
  const badge = getStockBadge(product.stock);

  return (
    <div className={cn("group relative", className)}>
      <Link to={`/product/${product.id}`}>
        {/* Image */}
        <div className="bg-[#e5e1d8] aspect-[3/4] mb-6 overflow-hidden relative rounded-sm">
          {badge && (
            <div
              className={cn(
                "absolute top-4 left-0 z-10 text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 font-sans",
                badge.className
              )}
            >
              {badge.label}
            </div>
          )}

          {product.isNew && !badge && (
            <div className="absolute top-4 left-0 z-10 bg-primary text-white text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 font-sans">
              Nuevo
            </div>
          )}

          <button
            className="absolute top-4 right-4 z-10 text-charcoal hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            disabled={wishlistLoading}
          >
            <Heart
              className={cn(
                "w-5 h-5",
                isFavorite && "fill-primary text-primary"
              )}
            />
          </button>

          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#d1cdc3] to-transparent opacity-50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h4 className="text-2xl font-serif text-charcoal">{product.name}</h4>
          {product.storeName && (
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary font-sans cursor-pointer hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.storeSlug) navigate(`/tienda/${product.storeSlug}`);
              }}
            >
              {product.storeName}
            </p>
          )}
          {(product.city || product.department) && (
            <p className="text-[10px] uppercase tracking-widest text-charcoal/50 font-sans">
              {[product.city, product.department].filter(Boolean).join(", ")}
            </p>
          )}
          <div className="pt-3">
            <p className="text-lg font-bold font-sans text-charcoal">
              {formatCurrency(parseFloat(product.price))}
            </p>
            {(product.materials?.length || product.techniques?.length) ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.materials?.slice(0, 2).map((m) => (
                  <span
                    key={m}
                    className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter font-semibold font-sans"
                  >
                    {m}
                  </span>
                ))}
                {product.techniques?.slice(0, 1).map((t) => (
                  <span
                    key={t}
                    className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter font-semibold font-sans"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
              <p className="text-[9px] uppercase tracking-[0.15em] text-charcoal/40 italic mt-2 font-sans">
                {product.stock} disponibles
              </p>
            )}
            {product.stock === 0 && (
              <p className="text-[9px] uppercase tracking-[0.15em] text-charcoal/40 italic mt-2 font-sans">
                Bajo pedido
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
