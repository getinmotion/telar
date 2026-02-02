import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Store } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  store_name?: string;
  store_logo_url?: string;
  store_slug?: string;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  free_shipping?: boolean;
  materials?: string[];
  techniques?: string[];
  craft?: string;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  image_url,
  store_name,
  store_logo_url,
  store_slug,
  rating = 0,
  reviews_count = 0,
  is_new = false,
  free_shipping = false,
  materials,
  techniques,
  craft,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();
  const isFavorite = isInWishlist(id);

  return (
    <Link to={`/product/${id}`}>
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/40">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                console.error(`[ProductCard] Error cargando imagen:`, {
                  productId: id,
                  productName: name,
                  imageUrl: image_url,
                  error: e
                });
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.nextElementSibling;
                if (placeholder) placeholder.classList.remove('hidden');
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Store className="w-16 h-16 text-primary/30" />
              {craft && (
                <p className="text-sm font-medium text-muted-foreground/60">{craft}</p>
              )}
            </div>
          )}
          {/* Hidden placeholder for error fallback */}
          <div className="hidden w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
            <Store className="w-16 h-16 text-primary/30" />
            {craft && (
              <p className="text-sm font-medium text-muted-foreground/60">{craft}</p>
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
        <CardContent className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="text-base font-medium text-foreground line-clamp-2 leading-snug min-h-[2.75rem]">
            {name}
          </h3>

          {/* Store Name - Clickable */}
          {store_name && (
            <button 
              type="button"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group/store text-left"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (store_slug) navigate(`/tienda/${store_slug}`);
              }}
            >
              {store_logo_url ? (
                <img 
                  src={store_logo_url} 
                  alt={store_name}
                  className="w-4 h-4 rounded-full object-cover border border-border"
                />
              ) : (
                <Store className="h-3 w-3" />
              )}
              <span className="line-clamp-1 group-hover/store:underline">{store_name}</span>
            </button>
          )}

          {/* Rating - Simplified */}
          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
              {reviews_count > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({reviews_count})
                </span>
              )}
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xl font-bold text-foreground">
              ${price.toLocaleString('es-CO')}
            </p>
            
            <Button
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                addToCart(id, 1);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          {/* Materiales y Técnicas */}
          {(materials?.length || techniques?.length) ? (
            <div className="flex flex-wrap gap-1 mt-3">
              {materials?.slice(0, 2).map((material) => (
                <Badge key={material} variant="outline" className="text-[10px] px-1.5 py-0.5">
                  🌿 {material}
                </Badge>
              ))}
              {techniques?.slice(0, 1).map((technique) => (
                <Badge key={technique} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  ✨ {technique}
                </Badge>
              ))}
              {((materials?.length || 0) > 2 || (techniques?.length || 0) > 1) && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 opacity-60">
                  +{Math.max(0, (materials?.length || 0) - 2) + Math.max(0, (techniques?.length || 0) - 1)} más
                </Badge>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
};
