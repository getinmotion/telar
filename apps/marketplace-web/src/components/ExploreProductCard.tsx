import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { formatCurrency } from "@/lib/currencyUtils";
import {
  getPrimaryImageUrl,
  getProductPrice,
  getCraftName,
  getTechniqueName,
  getProductStock,
  type ProductNewCore,
} from "@/services/products-new.actions";

// ── Product Card — Card Logic Engine v2.1 ────────────
// L0: State badges (Agotado > Últimas piezas > Nuevo)
// L1: Identity (Name, Workshop, Technique · Origin)
// L2: Material attribute pill
// L3: Logistics micro-state
// L4: Meta signals (trust / service icons)
export function ExploreProductCard({
  product,
  className = "",
}: {
  product: ProductNewCore;
  className?: string;
}) {
  const imageUrl = getPrimaryImageUrl(product);
  const price = getProductPrice(product);
  const craft = getCraftName(product);
  const technique = getTechniqueName(product);
  const stock = getProductStock(product);
  const shopName = product.artisanShop?.shopName;
  const department = product.artisanShop?.department;
  const materialNames = (product.materials ?? [])
    .map((m) => m.material?.name)
    .filter(Boolean);
  const primaryMaterial = materialNames[0];

  const isNew =
    new Date(product.createdAt) >
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const isLowStock = stock > 0 && stock <= 3;
  const isOutOfStock = stock === 0;

  return (
    <article className={`group relative ${className}`}>
      <Link to={`/product/${product.id}`} className="block">
        {/* ── Image + L0 Badge ── */}
        <div
          className={`relative aspect-[3/4] bg-[#e5e1d8] mb-6 rounded-sm overflow-hidden ${isOutOfStock ? "grayscale" : ""}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal/20 text-sm font-sans">
              Sin imagen
            </div>
          )}

          {/* L0: State badge — priority: Agotado > Últimas piezas > Nuevo */}
          <div className="absolute top-4 left-0 z-10 flex flex-col gap-0.5">
            {isOutOfStock ? (
              <span className="bg-charcoal text-white text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 shadow-sm">
                Agotado
              </span>
            ) : isLowStock ? (
              <span className="bg-primary text-white text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 shadow-sm">
                Últimas piezas
              </span>
            ) : isNew ? (
              <span className="bg-primary text-white text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 shadow-sm">
                Nuevo
              </span>
            ) : null}
          </div>

          {/* Wishlist */}
          <button
            className="absolute top-4 right-4 z-10 text-charcoal opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* ── Card Info ── */}
        <div className="space-y-4">
          {/* L1: Identity */}
          <div className="space-y-1">
            <h3 className="text-2xl font-serif leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {shopName && (
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-charcoal/40 italic font-sans">
                {shopName}
              </p>
            )}
            {(technique || craft || department) && (
              <div className="flex gap-1.5 items-center">
                {(technique || craft) && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary font-sans">
                    {technique || craft}
                  </span>
                )}
                {(technique || craft) && department && (
                  <span className="text-[10px] text-charcoal/20">·</span>
                )}
                {department && (
                  <span className="text-[9px] font-medium uppercase tracking-widest text-charcoal/40 font-sans">
                    {department}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* L2 + L3 + Price — below separator */}
          <div className="pt-4 border-t border-charcoal/5 space-y-3">
            <p
              className={`text-lg font-bold font-sans tracking-tight ${isOutOfStock ? "text-charcoal/30" : "text-charcoal"}`}
            >
              {price != null ? formatCurrency(price) : "Consultar"}
            </p>

            <div className="flex flex-col gap-2">
              {/* L2: Material pill */}
              {primaryMaterial && (
                <span className="text-[8px] px-2 py-0.5 uppercase tracking-widest font-bold inline-block w-fit bg-[#e2e9e1] text-charcoal/60 font-sans">
                  {primaryMaterial}
                </span>
              )}

              {/* L3: Logistics micro-state */}
              {isLowStock && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/60 italic font-sans">
                  Últimas piezas ({stock})
                </p>
              )}
              {isOutOfStock && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/60 italic font-sans">
                  Sin disponibilidad
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
