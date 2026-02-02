import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { telarClient } from "@/lib/telarClient";
import { mapProductToMarketplace } from "@/lib/productMapper";
import { type MarketplaceProduct } from "@/lib/mapTelarData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CraftBadge } from "@/components/CraftBadge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { MapPin, Store, ChevronLeft, Mail, Phone, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

export default function ShopDetail() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopSlug) {
      fetchShopData();
    }
  }, [shopSlug]);

  const fetchShopData = async () => {
    try {
      // Fetch shop details - only needed fields
      const { data: shopData, error: shopError } = await telarClient
        .from('artisan_shops')
        .select('id, shop_name, shop_slug, description, story, logo_url, banner_url, craft_type, region, contact_info')
        .eq('shop_slug', shopSlug)
        .eq('active', true)
        .eq('publish_status', 'published')
        .eq('marketplace_approved', true)
        .maybeSingle();

      if (shopError) throw shopError;
      
      if (!shopData) {
        toast.error('Tienda no encontrada');
        return;
      }

      setShop(shopData);

      // Fetch shop products - only needed fields
      const { data: productsData, error: productsError } = await telarClient
        .from('marketplace_products')
        .select('id, name, description, price, image_url, images, store_name, store_slug, craft, materials, techniques, rating, reviews_count, is_new, free_shipping, category, created_at')
        .eq('shop_id', shopData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      
      setProducts((productsData || []).map(mapProductToMarketplace));
    } catch (error) {
      console.error('Error fetching shop:', error);
      toast.error('Error al cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  // Build hero images array: banner_url + product images
  const heroImages = useMemo(() => {
    const images: string[] = [];
    
    // Add banner if exists
    if (shop?.banner_url) {
      images.push(shop.banner_url);
    }
    
    // Add first 5 product images that exist
    products.forEach(p => {
      const imageUrl = p.image_url || (Array.isArray((p as any).images) ? (p as any).images[0] : undefined);
      if (imageUrl && images.length < 6) {
        images.push(imageUrl);
      }
    });
    
    return images;
  }, [shop, products]);

  // Extract unique crafts, materials, and techniques from shop products
  const uniqueCrafts = useMemo(() => {
    const crafts = new Set<string>();
    products.forEach(p => {
      if (p.craft) crafts.add(p.craft);
    });
    return Array.from(crafts);
  }, [products]);

  const uniqueMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(p => {
      if (p.materials) {
        p.materials.forEach((m: string) => materials.add(m));
      }
    });
    return Array.from(materials);
  }, [products]);

  const uniqueTechniques = useMemo(() => {
    const techniques = new Set<string>();
    products.forEach(p => {
      if (p.techniques) {
        p.techniques.forEach((t: string) => techniques.add(t));
      }
    });
    return Array.from(techniques);
  }, [products]);

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
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a tiendas
        </Link>
      </div>

      {/* Hero Section - Banner or Product Carousel */}
      <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {heroImages.length > 1 ? (
          // Carousel with multiple images
          <Carousel
            opts={{ loop: true }}
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
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
          // Single static image
          <img
            src={heroImages[0]}
            alt={shop.shop_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const placeholder = e.currentTarget.nextElementSibling;
              if (placeholder) placeholder.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback when no images */}
        {heroImages.length === 0 && (
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
        
        {/* Hidden fallback for single image error */}
        <div className="hidden w-full h-full flex flex-col items-center justify-center gap-4 absolute inset-0">
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
      </div>

      {/* Overlapping Card + Description Section */}
      <div className="container mx-auto px-6">
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 md:pt-12">
          {/* Floating Info Card */}
          <div className="md:col-span-5 lg:col-span-4 -mt-24 md:-mt-28">
            <div className="bg-card/95 backdrop-blur-md rounded-lg shadow-2xl border border-border/50 p-8">
              <div className="flex gap-6">
                {/* Logo - Left Side */}
                {shop.logo_url && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shadow-lg border border-border shrink-0">
                    <img
                      src={shop.logo_url}
                      alt={shop.shop_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Info - Right Side */}
                <div className="flex-1 min-w-0">
                  {/* Shop Name */}
                  <h1 className="text-xl md:text-2xl font-bold mb-2 truncate">{shop.shop_name}</h1>
                  
                  {/* Craft Badge */}
                  {shop.craft_type && (
                    <Badge variant="default" className="mb-2">{shop.craft_type}</Badge>
                  )}
                  
                  {/* Location */}
                  {shop.region && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{shop.region}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats - Horizontal */}
              <div className="flex gap-6 mt-6">
                <div>
                  <p className="text-lg font-bold">{products.length}</p>
                  <p className="text-xs text-muted-foreground">Productos</p>
                </div>
                {shop.craft_type && (
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold truncate">{shop.craft_type}</p>
                    <p className="text-xs text-muted-foreground">Especialidad</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description - Right Side */}
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
          <h2 className="text-2xl font-bold mb-2">Productos de {shop.shop_name}</h2>
          <p className="text-sm text-muted-foreground mb-8">
            {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
          </p>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const imageUrl = product.image_url || (Array.isArray((product as any).images) ? (product as any).images[0] : undefined);
                return (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    image_url={imageUrl}
                    store_name={product.store_name}
                    rating={product.rating}
                    reviews_count={product.reviews_count}
                    is_new={product.is_new}
                    free_shipping={product.free_shipping}
                    materials={product.materials}
                    techniques={product.techniques}
                    craft={product.craft}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No hay productos disponibles
              </h3>
              <p className="text-muted-foreground">
                Esta tienda aún no tiene productos publicados.
              </p>
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
