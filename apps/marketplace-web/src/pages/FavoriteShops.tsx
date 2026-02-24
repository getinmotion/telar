import { useState, useEffect } from "react";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Store, Heart, Package, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Shop {
  id: string;
  shopName: string;
  shopSlug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  craftType?: string;
  region?: string;
  productCount: number;
}

const FavoriteShops = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { shops: contextShops, fetchShops: fetchShopsContext } = useArtisanShops();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const { wishlistItems, isShopInWishlist, toggleWishlist, loading: wishlistLoading } = useShopWishlist();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: '/tiendas-favoritas' } });
      return;
    }

    if (wishlistItems.size > 0) {
      fetchFavoriteShops();
    } else {
      setLoading(false);
    }
  }, [user, wishlistItems]);

  useEffect(() => {
    if (contextShops.length > 0 && wishlistItems.size > 0) {
      const shopIds = Array.from(wishlistItems);
      const favoriteShops = contextShops
        .filter(shop => shopIds.includes(shop.id))
        .map(shop => ({
          id: shop.id,
          shopName: shop.shopName,
          shopSlug: shop.shopSlug,
          description: shop.description,
          logoUrl: shop.logoUrl,
          bannerUrl: shop.bannerUrl,
          craftType: shop.craftType,
          region: shop.region,
          productCount: 0,
        }));
      setShops(favoriteShops);
      setLoading(false);
    }
  }, [contextShops, wishlistItems]);

  const fetchFavoriteShops = async () => {
    try {
      const shopIds = Array.from(wishlistItems);

      if (shopIds.length === 0) {
        setShops([]);
        setLoading(false);
        return;
      }

      await fetchShopsContext({
        active: true,
        publishStatus: 'published',
        marketplaceApproved: true,
        hasApprovedProducts: true,
      });
    } catch (error) {
      setLoading(false);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, shopId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(shopId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar searchQuery="" onSearchChange={() => {}} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <Link 
              to="/tiendas"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver todos los artesanos
            </Link>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Mis Tiendas Favoritas
              </h1>
            </div>
            <p className="text-muted-foreground mt-2">
              Los artesanos que has guardado para seguir explorando
            </p>
          </div>
        </section>

        {/* Shops Grid */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="h-[340px]">
                    <Skeleton className="h-40 w-full rounded-t-xl" />
                    <CardContent className="pt-12 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">
                  Aún no tienes tiendas favoritas
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Explora nuestros artesanos y guarda tus favoritos haciendo clic en el corazón
                </p>
                <Button asChild>
                  <Link to="/tiendas">Explorar Artesanos</Link>
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {shops.length} {shops.length === 1 ? 'tienda favorita' : 'tiendas favoritas'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {shops.map((shop) => (
                    <Link key={shop.id} to={`/tienda/${shop.shopSlug}`}>
                      <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-0 shadow-sm rounded-xl overflow-visible">
                        {/* Banner/Logo */}
                        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden rounded-t-xl">
                          {shop.bannerUrl ? (
                            <img
                              src={shop.bannerUrl}
                              alt={shop.shopName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
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
                          
                          {/* Favorite Button */}
                          <button
                            onClick={(e) => handleFavoriteClick(e, shop.id)}
                            disabled={wishlistLoading}
                            className={cn(
                              "absolute top-3 right-3 p-2 rounded-full bg-background/90 backdrop-blur-sm shadow-md transition-all hover:scale-110",
                              isShopInWishlist(shop.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                            )}
                          >
                            <Heart 
                              className={cn("w-5 h-5", isShopInWishlist(shop.id) && "fill-current")} 
                            />
                          </button>

                          {/* Product Count Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-sm">
                              <Package className="w-3 h-3 mr-1" />
                              {shop.productCount} {shop.productCount === 1 ? 'producto' : 'productos'}
                            </Badge>
                          </div>
                          
                          {/* Logo Overlay */}
                          {shop.logoUrl && (
                            <div className="absolute -bottom-10 left-4">
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
                        </div>

                        <CardContent className="pt-12 pb-6">
                          <div className="space-y-3">
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {shop.shopName}
                            </h3>
                            
                            {shop.craftType && (
                              <Badge variant="outline" className="text-xs">
                                {shop.craftType}
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
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FavoriteShops;
