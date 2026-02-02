import { useState, useEffect } from "react";
import { telarClient } from "@/lib/telarClient";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Store } from "lucide-react";
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

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const { data: shopsData, error } = await telarClient
        .from('artisan_shops')
        .select('id, shop_name, shop_slug, description, logo_url, banner_url, craft_type, region, featured')
        .eq('active', true)
        .eq('publish_status', 'published')
        .eq('marketplace_approved', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setShops(shopsData || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = 
      shop.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.craft_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === "all" || shop.region === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  const regions = Array.from(new Set(shops.map(s => s.region).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto max-w-7xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Nuestros Artesanos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre los talleres y maestros artesanos que crean cada pieza con dedicación
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 px-6 border-b border-border/40">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRegion === "all" ? "default" : "outline"}
                onClick={() => setSelectedRegion("all")}
                size="sm"
              >
                Todas las Regiones
              </Button>
              {regions.map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? "default" : "outline"}
                  onClick={() => setSelectedRegion(region as string)}
                  size="sm"
                >
                  {region}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Shops Grid */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            {loading ? (
              <div className="text-center py-16">
                <Skeleton className="h-8 w-64 mx-auto" />
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-16">
                <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">
                  No hay artesanos publicados aún
                </p>
                <p className="text-sm text-muted-foreground">
                  Nuestros artesanos están preparando sus talleres. Vuelve pronto.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-8">
                  {filteredShops.length} {filteredShops.length === 1 ? 'artesano' : 'artesanos'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredShops.map((shop) => (
                    <Link key={shop.id} to={`/tienda/${shop.shop_slug}`}>
                      <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-0 shadow-sm rounded-xl">
                        {/* Banner/Logo */}
                        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden rounded-t-xl">
                          {shop.banner_url ? (
                            <>
                              <img
                                src={shop.banner_url}
                                alt={shop.shop_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
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
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shops;
