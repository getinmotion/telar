import { useState, useEffect, useMemo } from "react";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, Store, Heart, Package, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { cn } from "@/lib/utils";
import { normalizeCraft } from "@/lib/normalizationUtils";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MobileColumnsToggle, MobileColumns } from "@/components/MobileColumnsToggle";
import { useIsMobile } from "@/hooks/use-mobile";

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
  productCount: number;
}

type SortOption = 'recent' | 'name_asc' | 'name_desc' | 'products_desc';
type LimitOption = 20 | 50 | 100;

const Shops = () => {
  const isMobile = useIsMobile();
  const { shops: contextShops, fetchShops: fetchShopsContext } = useArtisanShops();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCraft, setSelectedCraft] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [limit, setLimit] = useState<LimitOption>(20);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileColumns, setMobileColumns] = useState<MobileColumns>(() => {
    const saved = localStorage.getItem('shopsMobileColumns');
    return saved === '1' ? 1 : 2;
  });

  const { isShopInWishlist, toggleWishlist, loading: wishlistLoading } = useShopWishlist();

  useEffect(() => {
    localStorage.setItem('shopsMobileColumns', String(mobileColumns));
  }, [mobileColumns]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchShops();
  }, []);

  useEffect(() => {
    if (contextShops.length > 0) {
      const mappedShops = contextShops.map(shop => ({
        id: shop.id,
        shopName: shop.shopName,
        shopSlug: shop.shopSlug,
        description: shop.description,
        logoUrl: shop.logoUrl,
        bannerUrl: shop.bannerUrl,
        craftType: shop.craftType,
        region: shop.region,
        featured: shop.featured,
        productCount: 0,
      }));
      setShops(mappedShops);
      setLoading(false);
    }
  }, [contextShops]);

  const fetchShops = async () => {
    try {
      await fetchShopsContext({
        active: true,
        publishStatus: 'published',
        marketplaceApproved: true,
        hasApprovedProducts: true,
        sortBy: 'created_at',
        order: 'DESC',
        limit: limit,
      });
    } catch (error) {
      setLoading(false);
    }
  };

  // Extract unique values for filters
  const regions = useMemo(() => 
    Array.from(new Set(shops.map(s => s.region).filter(Boolean))).sort(),
    [shops]
  );
  
  const craftTypes = useMemo(() => 
    Array.from(new Set(
      shops
        .map(s => normalizeCraft(s.craftType))
        .filter(craft => craft && craft !== 'Sin especificar')
    )).sort(),
    [shops]
  );

  // Filter and sort shops
  const filteredAndSortedShops = useMemo(() => {
    let result = shops.filter(shop => {
      const matchesSearch = 
        shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.craftType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = selectedRegion === "all" || shop.region === selectedRegion;
      const matchesCraft = selectedCraft === "all" || normalizeCraft(shop.craftType) === selectedCraft;

      return matchesSearch && matchesRegion && matchesCraft;
    });

    // Sort
    switch (sortBy) {
      case 'name_asc':
        result = result.sort((a, b) => a.shopName.localeCompare(b.shopName));
        break;
      case 'name_desc':
        result = result.sort((a, b) => b.shopName.localeCompare(a.shopName));
        break;
      case 'products_desc':
        result = result.sort((a, b) => b.productCount - a.productCount);
        break;
      case 'recent':
      default:
        // Keep original order (featured first, then recent)
        result = result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [shops, searchQuery, selectedRegion, selectedCraft, sortBy]);

  // Reset page when filters or limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRegion, selectedCraft, sortBy, limit]);

  // Refetch when limit changes
  useEffect(() => {
    if (limit) {
      fetchShops();
    }
  }, [limit]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedShops.length / limit);
  const paginatedShops = filteredAndSortedShops.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, filteredAndSortedShops.length);

  const handleFavoriteClick = (e: React.MouseEvent, shopId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(shopId);
  };

  const clearFilters = () => {
    setSelectedRegion("all");
    setSelectedCraft("all");
    setSortBy("recent");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedRegion !== "all" || selectedCraft !== "all" || searchQuery !== "";
  const activeFiltersCount = (selectedRegion !== "all" ? 1 : 0) + (selectedCraft !== "all" ? 1 : 0);

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
        <section className="py-4 px-6 border-b border-border/40 bg-background sticky top-0 z-10">
          <div className="container mx-auto max-w-7xl">
            
            {/* Desktop Filters */}
            <div className="hidden md:flex gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Región" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Regiones</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region as string}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCraft} onValueChange={setSelectedCraft}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Oficio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Oficios</SelectItem>
                    {craftTypes.map((craft) => (
                      <SelectItem key={craft} value={craft as string}>
                        {craft}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Destacados</SelectItem>
                    <SelectItem value="name_asc">Nombre (A-Z)</SelectItem>
                    <SelectItem value="name_desc">Nombre (Z-A)</SelectItem>
                    <SelectItem value="products_desc">Más productos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v) as LimitOption)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Mostrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 por página</SelectItem>
                    <SelectItem value="50">50 por página</SelectItem>
                    <SelectItem value="100">100 por página</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {filteredAndSortedShops.length > 0
                  ? `Mostrando ${startItem}-${endItem} de ${filteredAndSortedShops.length} artesanos`
                  : '0 artesanos'}
              </p>
            </div>

            {/* Mobile Filters - Collapsible */}
            <div className="md:hidden">
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", filtersOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-2">
                    <MobileColumnsToggle columns={mobileColumns} onColumnsChange={setMobileColumns} />
                    <p className="text-sm text-muted-foreground">
                      {filteredAndSortedShops.length > 0 
                        ? `${startItem}-${endItem} de ${filteredAndSortedShops.length}`
                        : '0 artesanos'}
                    </p>
                  </div>
                </div>
                
                <CollapsibleContent className="pt-4">
                  <div className="space-y-3">
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Región" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las Regiones</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region as string}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedCraft} onValueChange={setSelectedCraft}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Oficio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los Oficios</SelectItem>
                        {craftTypes.map((craft) => (
                          <SelectItem key={craft} value={craft as string}>
                            {craft}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Ordenar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Destacados</SelectItem>
                        <SelectItem value="name_asc">Nombre (A-Z)</SelectItem>
                        <SelectItem value="name_desc">Nombre (Z-A)</SelectItem>
                        <SelectItem value="products_desc">Más productos</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v) as LimitOption)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Mostrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 por página</SelectItem>
                        <SelectItem value="50">50 por página</SelectItem>
                        <SelectItem value="100">100 por página</SelectItem>
                      </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-muted-foreground">
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

          </div>
        </section>

        {/* Shops Grid */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
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
            ) : filteredAndSortedShops.length === 0 ? (
              <div className="text-center py-16">
                <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">
                  {hasActiveFilters ? 'No se encontraron artesanos con estos filtros' : 'No hay artesanos publicados aún'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Nuestros artesanos están preparando sus talleres. Vuelve pronto.'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
              <div className={cn(
                "grid gap-6",
                isMobile 
                  ? mobileColumns === 1 ? "grid-cols-1" : "grid-cols-2"
                  : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              )}>
                {paginatedShops.map((shop) => (
                  <Link key={shop.id} to={`/tienda/${shop.shopSlug}`}>
                    <Card className="group h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-0 shadow-sm rounded-xl overflow-visible relative">
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
                          <Badge className="bg-primary text-primary-foreground shadow-sm">
                            <Package className="w-3 h-3 mr-1" />
                            {shop.productCount} {shop.productCount === 1 ? 'producto' : 'productos'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Logo Overlay - OUTSIDE overflow-hidden */}
                      {shop.logoUrl && (
                        <div className="absolute top-[120px] left-4 z-10">
                          <div className="w-20 h-20 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
                            <img
                              src={shop.logoUrl}
                              alt={shop.shopName}
                              className="w-full h-full object-contain"
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
                            <Badge variant="outline" className="text-xs">
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalPages <= 5) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, idx, arr) => (
                          <PaginationItem key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
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
