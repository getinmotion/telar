import { useEffect, useState } from "react";
import { telarClient } from "@/lib/telarClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  craft_type?: string;
  region?: string;
  featured: boolean;
}

export const FeaturedShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedShops();
  }, []);

  const fetchFeaturedShops = async () => {
    try {
      const { data: shopsData, error } = await telarClient
        .from('artisan_shops')
        .select('id, shop_name, shop_slug, description, logo_url, banner_url, craft_type, region, featured')
        .eq('active', true)
        .eq('publish_status', 'published')
        .eq('marketplace_approved', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      setShops(shopsData || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
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
            <Link key={shop.id} to={`/tienda/${shop.shop_slug}`}>
              <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-0 shadow-sm rounded-xl">
                {/* Banner/Logo */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                  {shop.banner_url ? (
                    <>
                      <img
                        src={shop.banner_url}
                        alt={shop.shop_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.error(`[FeaturedShops] Error cargando banner:`, {
                            shopId: shop.id,
                            shopName: shop.shop_name,
                            bannerUrl: shop.banner_url,
                            error: e
                          });
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling;
                          if (placeholder) placeholder.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt={shop.shop_name} className="w-24 h-24 object-contain rounded-lg shadow-lg" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Store className="w-16 h-16 text-primary/40" />
                            <p className="text-sm font-medium text-foreground/80">{shop.shop_name}</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {shop.logo_url ? (
                        <img src={shop.logo_url} alt={shop.shop_name} className="w-24 h-24 object-contain rounded-lg shadow-lg" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Store className="w-16 h-16 text-primary/40" />
                          <p className="text-sm font-medium text-foreground/80">{shop.shop_name}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Logo Overlay */}
                  {shop.logo_url && (
                    <div className="absolute -bottom-10 left-4">
                      <div className="w-20 h-20 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
                        <img
                          src={shop.logo_url}
                          alt={shop.shop_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`[FeaturedShops] Error cargando logo:`, {
                              shopId: shop.id,
                              shopName: shop.shop_name,
                              logoUrl: shop.logo_url,
                              error: e
                            });
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="pt-10 pb-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {shop.shop_name}
                    </h3>
                    
                    {shop.craft_type && (
                      <Badge variant="secondary" className="text-xs">
                        {shop.craft_type}
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
                    
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      Ver Tienda
                    </Button>
                  </div>
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
