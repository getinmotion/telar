import { Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCategoryName } from "@/lib/categoryUtils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductPurchaseButton } from "./ProductPurchaseButton";
import { formatCurrency } from "@/lib/currencyUtils";
import { Product } from "@/types/products.types";


export const ProductListItem = ({
  id,
  name,
  price,
  imageUrl,
  storeName,
  rating,
  reviewsCount,
  isNew,
  freeShipping,
  description,
  category,
  materials,
  techniques,
  craft,
  canPurchase = true,
  stock,
}: Product) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const isFavorite = isInWishlist(id);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image */}
          <Link 
            to={`/product/${id}`} 
            state={{ returnUrl: window.location.search }}
            className="relative w-full sm:w-48 h-48 flex-shrink-0 overflow-hidden bg-muted"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-2">
              {stock === 0 && (
                <Badge className="bg-red-500 hover:bg-red-500 text-white border-0">
                  Agotado
                </Badge>
              )}
              {stock !== undefined && stock > 0 && stock <= 3 && (
                <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-0">
                  {stock === 1 ? '¡Última unidad!' : `¡Últimas ${stock}!`}
                </Badge>
              )}
              {isNew && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Nuevo
                </Badge>
              )}
              {freeShipping && (
                <Badge variant="secondary">
                  Envío gratis
                </Badge>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Category */}
              {category && (
                <p className="text-xs text-muted-foreground">
                  {formatCategoryName(category.split('/')[0])}
                </p>
              )}

              {/* Title */}
              <Link to={`/product/${id}`} state={{ returnUrl: window.location.search }}>
                <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
                  {name}
                </h3>
              </Link>

              {/* Store */}
              {storeName && (
                <p className="text-sm text-muted-foreground">
                  por {storeName}
                </p>
              )}

              {/* Description */}
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              )}

              {/* Materiales y Técnicas - Vista Lista */}
              {(materials?.length || techniques?.length || craft) ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {craft && (
                    <Badge variant="outline" className="text-xs">
                      🔨 {craft}
                    </Badge>
                  )}
                  {materials?.slice(0, 3).map((material) => (
                    <Badge key={material} variant="outline" className="text-xs">
                      🌿 {material}
                    </Badge>
                  ))}
                  {techniques?.slice(0, 2).map((technique) => (
                    <Badge key={technique} variant="secondary" className="text-xs">
                      ✨ {technique}
                    </Badge>
                  ))}
                  {((materials?.length || 0) > 3 || (techniques?.length || 0) > 2) && (
                    <Badge variant="secondary" className="text-xs opacity-60">
                      +{Math.max(0, (materials?.length || 0) - 3) + Math.max(0, (techniques?.length || 0) - 2)} más
                    </Badge>
                  )}
                </div>
              ) : null}

              {/* Rating */}
              {rating && rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(rating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  {reviewsCount && reviewsCount > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({reviewsCount})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(parseFloat(price))}
                </span>
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(id);
                  }}
                  disabled={wishlistLoading}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : ""}`} />
                </Button>
                <ProductPurchaseButton
                  productId={id}
                  productName={name}
                  canPurchase={canPurchase}
                  stock={stock}
                  variant="card"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
