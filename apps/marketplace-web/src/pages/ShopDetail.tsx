import { useParams, Link } from "react-router-dom";
import { normalizeCraft } from "@/lib/normalizationUtils";
import { useEffect, useState, useMemo } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Autoplay from "embla-carousel-autoplay";
import { MapPin, Store, ArrowLeft, SlidersHorizontal, Heart } from "lucide-react";
import { toast } from "sonner";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { cn } from "@/lib/utils";
import { Product } from "@/types/products.types";

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  description?: string;
  story?: string;
  logo_url?: string;
  banner_url?: string;
  craft_type?: string;
  region?: string;
  contact_info?: any;
}

const PRODUCTS_PER_PAGE = 12;

export default function ShopDetail() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const { products: contextProducts, fetchProductsByShop } = useProducts();
  const { fetchShopBySlug } = useArtisanShops();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  // Filter and pagination state
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { isShopInWishlist, toggleWishlist, loading: wishlistLoading } = useShopWishlist();

  useEffect(() => {
    if (shopSlug) {
      fetchShopData();
    }
  }, [shopSlug]);

  useEffect(() => {
    if (contextProducts?.length > 0 && !productsLoading) {
      // Convertir price de string a number para cálculos
      const mappedProducts: Product[] = contextProducts.map(p => ({
        ...p,
        price: p.price,
        stock: p.stock || p.inventory || 0,
      }));

      setProducts(mappedProducts);
    }
  }, [contextProducts, productsLoading]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedMaterial, sortBy]);

  const fetchShopData = async () => {
    if (!shopSlug) return;

    try {
      const shopData = await fetchShopBySlug(shopSlug);

      if (!shopData) {
        toast.error('Tienda no encontrada');
        setLoading(false);
        return;
      }

      const mappedShop = {
        id: shopData.id,
        shop_name: shopData.shopName,
        shop_slug: shopData.shopSlug,
        description: shopData.description,
        story: shopData.story,
        logo_url: shopData.logoUrl,
        banner_url: shopData.bannerUrl,
        craft_type: shopData.craftType,
        region: shopData.region,
        contact_info: shopData.contactInfo,
      };

      setShop(mappedShop);
      setLoading(false);

      setProductsLoading(true);
      try {
        await fetchProductsByShop(shopData.id);
      } catch (error) {
        toast.error('Error al cargar productos de la tienda');
      } finally {
        setProductsLoading(false);
      }
    } catch (error) {
      toast.error('Error al cargar la tienda');
      setLoading(false);
    }
  };

  // Build hero images array - only product gallery images, no banner
  const heroImages = useMemo(() => {
    const images: string[] = [];
    products.forEach(p => {
      // Use gallery images (high resolution) only
      const productImages = (p as any).images;
      const galleryImage = Array.isArray(productImages) && productImages.length > 0 
        ? productImages[0] 
        : null;
      
      if (galleryImage && images.length < 6) {
        images.push(galleryImage);
      }
    });
    return images;
  }, [products]);

  // Extract unique categories from products
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach(p => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }, [products]);

  // Extract unique materials from products
  const uniqueMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(p => {
      if (p.materials) {
        p.materials.forEach((m: string) => materials.add(m));
      }
    });
    return Array.from(materials).sort();
  }, [products]);

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Filter by material
    if (selectedMaterial && selectedMaterial !== 'all') {
      result = result.filter(p => p.materials?.includes(selectedMaterial));
    }
    
    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        // Already sorted by newest from API
        break;
    }
    
    return result;
  }, [products, selectedCategory, selectedMaterial, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const startItem = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredAndSortedProducts.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-16 text-center">
          <Store className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-4">Tienda no encontrada</h1>
          <p className="text-muted-foreground mb-8">
            La tienda que buscas no existe o ha sido desactivada.
          </p>
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery="" onSearchChange={() => {}} />

      {/* Back Navigation */}
      <div className="container mx-auto px-6 py-4">
        <Link 
          to="/tiendas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a tiendas
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {heroImages.length > 1 ? (
          <Carousel
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
            className="w-full h-full"
          >
            <CarouselContent className="h-full">
              {heroImages.map((imageUrl, index) => (
                <CarouselItem key={index} className="h-full">
                  <img
                    src={imageUrl}
                    alt={`${shop.shop_name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        ) : heroImages.length === 1 ? (
          <img
            src={heroImages[0]}
            alt={shop.shop_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            {shop.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt={shop.shop_name}
                className="w-32 h-32 object-contain rounded-lg shadow-xl"
              />
            ) : (
              <Store className="w-32 h-32 text-primary/40" />
            )}
            <h2 className="text-2xl font-bold text-foreground">{shop.shop_name}</h2>
          </div>
        )}
      </div>

      {/* Overlapping Card + Description Section */}
      <div className="container mx-auto px-6">
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 md:pt-12">
          {/* Floating Info Card */}
          <div className="md:col-span-5 lg:col-span-4 -mt-24 md:-mt-28">
            <div className="bg-card/95 backdrop-blur-md rounded-lg shadow-2xl border border-border/50 p-8">
              <div className="flex gap-6">
              {shop.logo_url && (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shadow-lg border border-border/60 shrink-0 bg-card p-3 ring-1 ring-border/40">
                  <img
                    src={shop.logo_url}
                    alt={shop.shop_name}
                    className="w-full h-full object-contain"
                  />
                </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold mb-2 truncate">{shop.shop_name}</h1>
                  {shop.craft_type && normalizeCraft(shop.craft_type) !== 'Sin especificar' && (
                    <Badge variant="default" className="mb-2">{normalizeCraft(shop.craft_type)}</Badge>
                  )}
                  {shop.region && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{shop.region}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-6 mt-6">
                <div>
                  <p className="text-lg font-bold">{products.length}</p>
                  <p className="text-xs text-muted-foreground">Productos</p>
                </div>
                {shop.craft_type && normalizeCraft(shop.craft_type) !== 'Sin especificar' && (
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold truncate">{normalizeCraft(shop.craft_type)}</p>
                    <p className="text-xs text-muted-foreground">Especialidad</p>
                  </div>
                )}
              </div>
              
              {/* Favorite Button */}
              <Button
                variant={isShopInWishlist(shop.id) ? "default" : "outline"}
                size="sm"
                className={cn(
                  "mt-6 w-full",
                  isShopInWishlist(shop.id) && "bg-red-500 hover:bg-red-600 text-white"
                )}
                onClick={() => toggleWishlist(shop.id)}
                disabled={wishlistLoading}
              >
                <Heart className={cn("w-4 h-4 mr-2", isShopInWishlist(shop.id) && "fill-current")} />
                {isShopInWishlist(shop.id) ? "Guardado en favoritos" : "Guardar en favoritos"}
              </Button>
            </div>
          </div>
          
          {shop.description && (
            <div className="md:col-span-7 lg:col-span-8 flex items-start">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {shop.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-6">
        <div className="py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Productos de {shop.shop_name}</h2>
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedProducts.length > 0 
                  ? `Mostrando ${startItem}-${endItem} de ${filteredAndSortedProducts.length} productos`
                  : 'Sin productos'}
              </p>
            </div>
            
            {/* Filter Controls */}
            {products.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground hidden md:block" />
                
                {/* Category Filter */}
                {uniqueCategories.length > 1 && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[160px] bg-card">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {uniqueCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Material Filter */}
                {uniqueMaterials.length > 1 && (
                  <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                    <SelectTrigger className="w-[160px] bg-card">
                      <SelectValue placeholder="Material" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      <SelectItem value="all">Todos los materiales</SelectItem>
                      {uniqueMaterials.map((mat) => (
                        <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] bg-card">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                    <SelectItem value="name">Nombre A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => {
                  const imageUrl = product.imageUrl || (Array.isArray(product.images) ? product.images[0] : undefined);
                  return (
                  <ProductCard
                      {...product}
                      imageUrl={imageUrl}
                    />
                  );
                })}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first, last, current, and adjacent pages
                          return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
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
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {products.length > 0 ? 'No hay productos con estos filtros' : 'No hay productos disponibles'}
              </h3>
              <p className="text-muted-foreground">
                {products.length > 0 
                  ? 'Intenta ajustar los filtros para ver más productos.'
                  : 'Esta tienda aún no tiene productos publicados.'}
              </p>
              {products.length > 0 && (selectedCategory !== 'all' || selectedMaterial !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedMaterial('all');
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>

        {/* History Section */}
        {shop.story && (
          <div className="pb-16">
            <Card className="bg-muted/30 border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Nuestra Historia</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{shop.story}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
