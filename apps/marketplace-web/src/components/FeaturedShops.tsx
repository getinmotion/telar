import { useEffect, useState } from "react";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { normalizeCraft } from "@/lib/normalizationUtils";

interface Shop {
  id: string;
  shopName: string;
  shopSlug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  craftType?: string;
  region?: string;
  featured: boolean;
}

export const FeaturedShops = () => {
  const { shops: contextShops, loading, fetchFeaturedShops } = useArtisanShops();
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    loadFeaturedShops();
  }, []);

  useEffect(() => {
    if (contextShops.length > 0) {
      const mappedShops = contextShops.map(s => ({
        id: s.id,
        shopName: s.shopName,
        shopSlug: s.shopSlug,
        description: s.description,
        logoUrl: s.logoUrl,
        bannerUrl: s.bannerUrl,
        craftType: s.craftType,
        region: s.region,
        featured: s.featured,
      }));
      setShops(mappedShops);
    }
  }, [contextShops]);

  const loadFeaturedShops = async () => {
    try {
      await fetchFeaturedShops(8);
    } catch (error) {
      // Error already handled by context with toast
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (shops.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Artesanos Destacados
          </h2>
          <p className="text-xl text-muted-foreground">
            Conoce a los maestros artesanos y sus talleres
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.map((shop) => (
            <Link key={shop.id} to={`/tienda/${shop.shopSlug}`}>
              <Card className="group h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-0 shadow-sm rounded-xl overflow-visible relative">
                {/* Banner/Logo */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden rounded-t-xl">
                  {shop.bannerUrl ? (
                    <>
                      <img
                        src={shop.bannerUrl}
                        alt={shop.shopName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling;
                          if (placeholder) placeholder.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20">
                        {shop.logoUrl ? (
                          <img src={shop.logoUrl} alt={shop.shopName} className="w-24 h-24 object-contain rounded-lg shadow-lg" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Store className="w-16 h-16 text-primary/40" />
                            <p className="text-sm font-medium text-foreground/80">{shop.shopName}</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {shop.logoUrl ? (
                        <img src={shop.logoUrl} alt={shop.shopName} className="w-24 h-24 object-contain rounded-lg shadow-lg" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Store className="w-16 h-16 text-primary/40" />
                          <p className="text-sm font-medium text-foreground/80">{shop.shopName}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Logo Overlay - OUTSIDE overflow-hidden */}
                {shop.logoUrl && (
                  <div className="absolute top-[120px] left-4 z-10">
                    <div className="w-20 h-20 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
                      <img
                        src={shop.logoUrl}
                        alt={shop.shopName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <CardContent className="pt-12 pb-6 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {shop.shopName}
                    </h3>

                    {shop.craftType && normalizeCraft(shop.craftType) !== 'Sin especificar' && (
                      <Badge variant="secondary" className="text-xs">
                        {normalizeCraft(shop.craftType)}
                      </Badge>
                    )}
                    
                    {shop.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {shop.description}
                      </p>
                    )}
                    
                    {shop.region && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{shop.region}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    Ver Tienda
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/tiendas">
            <Button size="lg" variant="outline">
              Ver Todos los Artesanos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
