import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Store, Clock, Leaf, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductPurchaseButton } from "./ProductPurchaseButton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currencyUtils";
import { Product } from "@/types/products.types";


export const ProductCard = ({
  id,
  name,
  description,
  price,
  imageUrl,
  storeName,
  logoUrl,
  storeSlug,
  rating = 0,
  reviewsCount = 0,
  isNew = false,
  freeShipping = false,
  materials,
  techniques,
  craft,
  canPurchase = false,
  stock,
  compactMode = false,
}: Product) => {
  const { addToCart } = useCart();
  const {
    isInWishlist,
    toggleWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const navigate = useNavigate();
  const isFavorite = isInWishlist(id);

  return (
    
    <Link to={`/product/${id}`} state={{ returnUrl: window.location.search }}>

      <Card className="group overflow-hidden h-full rounded-sm border-foreground/10 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted border-b border-foreground/10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
              loading="lazy"
              onError={(e) => {
                console.error(`[ProductCard] Error cargando imagen:`, {
                  productId: id,
                  productName: name,
                  imageUrl: imageUrl,
                  error: e,
                });
                e.currentTarget.style.display = "none";
                const placeholder = e.currentTarget.nextElementSibling;
                if (placeholder) placeholder.classList.remove("hidden");
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Store className="w-16 h-16 text-primary/30" />
              {craft && (
                <p className="text-sm font-medium text-muted-foreground/60">
                  {craft}
                </p>
              )}
            </div>
          )}
          {/* Hidden placeholder for error fallback */}
          <div className="hidden w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center absolute inset-0 bg-muted">
            <Store className="w-16 h-16 text-primary/30" />
            {craft && (
              <p className="text-sm font-medium text-muted-foreground/60">
                {craft}
              </p>
            )}
          </div>

          {/* Stock Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {stock === 0 && (
              <Badge className="bg-charcoal hover:bg-charcoal text-white border-0 rounded-none text-[10px] uppercase tracking-widest">
                Agotado
              </Badge>
            )}
            {stock !== undefined && stock > 0 && stock <= 3 && (
              <Badge className="bg-primary hover:bg-primary text-primary-foreground border-0 rounded-none text-[10px] uppercase tracking-widest">
                {stock === 1
                  ? "¡Última unidad!"
                  : `¡Últimas ${stock} unidades!`}
              </Badge>
            )}
          </div>

          {/* Favorite Button - Only visible element on image */}
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-background/90 hover:bg-background hover:text-primary backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(id);
              }}
              disabled={wishlistLoading}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? "fill-primary text-primary" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className={cn("space-y-3", compactMode ? "p-3" : "p-4")}>
          {/* Product Name */}
          <h3
            className={cn(
              "font-serif tracking-tight text-foreground line-clamp-2 leading-snug",
              compactMode
                ? "text-sm min-h-[2.5rem]"
                : "text-lg min-h-[2.75rem]",
            )}
          >
            {name}
          </h3>

          {/* Store Name - Clickable */}
          {storeName && (
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group/store text-left"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (storeSlug) navigate(`/tienda/${storeSlug}`);
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="w-4 h-4 rounded-full object-cover border border-border"
                />
              ) : (
                <Store className="h-3 w-3" />
              )}
              <span className="line-clamp-1 group-hover/store:underline">
                {storeName}
              </span>
            </button>
          )}

          {/* Rating - Simplified */}
          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">
                {rating.toFixed(1)}
              </span>
              {reviewsCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({reviewsCount})
                </span>
              )}
            </div>
          )}

          {/* Price and Add to Cart */}
          <div
            className={cn(
              "pt-2",
              compactMode
                ? "flex flex-col gap-2"
                : "flex items-center justify-between",
            )}
          >
            <p
              className={cn(
                "font-bold text-foreground",
                compactMode ? "text-lg" : "text-xl",
              )}
            >
              {formatCurrency(parseFloat(price))}
            </p>

            <ProductPurchaseButton
              productId={id}
              productName={name}
              canPurchase={canPurchase}
              stock={stock}
              variant="card"
              className={compactMode ? "w-full" : ""}
            />
          </div>

          {/* Materiales y Técnicas */}
          {materials?.length || techniques?.length ? (
            <div className="flex flex-wrap gap-1 mt-3">
              {materials?.slice(0, 2).map((material) => (
                <Badge
                  key={material}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 gap-1 rounded-none"
                >
                  <Leaf className="h-2.5 w-2.5" /> {material}
                </Badge>
              ))}
              {techniques?.slice(0, 1).map((technique) => (
                <Badge
                  key={technique}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 gap-1 rounded-none"
                >
                  <Sparkles className="h-2.5 w-2.5" /> {technique}
                </Badge>
              ))}
              {((materials?.length || 0) > 2 ||
                (techniques?.length || 0) > 1) && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 opacity-60"
                >
                  +
                  {Math.max(0, (materials?.length || 0) - 2) +
                    Math.max(0, (techniques?.length || 0) - 1)}{" "}
                  más
                </Badge>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
};
