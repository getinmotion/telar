import { Star, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCategoryName } from "@/lib/categoryUtils";

interface ProductListItemProps {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  store_name?: string;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  free_shipping?: boolean;
  description?: string;
  category?: string;
  materials?: string[];
  techniques?: string[];
  craft?: string;
}

export const ProductListItem = ({
  id,
  name,
  price,
  image_url,
  store_name,
  rating,
  reviews_count,
  is_new,
  free_shipping,
  description,
  category,
  materials,
  techniques,
  craft,
}: ProductListItemProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image */}
          <Link 
            to={`/product/${id}`} 
            className="relative w-full sm:w-48 h-48 flex-shrink-0 overflow-hidden bg-muted"
          >
            {image_url ? (
              <img
                src={image_url}
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
              {is_new && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Nuevo
                </Badge>
              )}
              {free_shipping && (
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
              <Link to={`/product/${id}`}>
                <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
                  {name}
                </h3>
              </Link>

              {/* Store */}
              {store_name && (
                <p className="text-sm text-muted-foreground">
                  por {store_name}
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
                  {reviews_count && reviews_count > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({reviews_count})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">
                  ${price.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="default"
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
