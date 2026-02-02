import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { telarClient } from "@/lib/telarClient";
import { mapProductToMarketplace } from "@/lib/productMapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, ChevronLeft, Star, Store, MapPin, Share2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductVariants } from "@/components/ProductVariants";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ProductSpecs } from "@/components/ProductSpecs";
import { ProductTags } from "@/components/ProductTags";
import { CraftBadge } from "@/components/CraftBadge";
import { RelatedProducts } from "@/components/RelatedProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  images?: string[];
  store_name?: string;
  shop_slug?: string;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  free_shipping?: boolean;
  stock?: number;
  category?: string;
  tags?: string[];
  materials?: string[];
  techniques?: string[];
  craft?: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await telarClient
        .from('marketplace_products')
        .select('id, name, description, price, image_url, images, store_name, store_slug, rating, reviews_count, is_new, free_shipping, stock, category, tags, materials, techniques, craft')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProduct(mapProductToMarketplace(data));
      }
    } catch (error) {
      toast.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };
  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity, selectedVariant?.id);
    }
  };

  const getFinalPrice = () => {
    if (!product) return 0;
    return product.price + (selectedVariant?.price_adjustment || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Link to="/"><Button>Volver al inicio</Button></Link>
        </div>
      </div>
    );
  }

  // Obtener imágenes del producto (si es array de telar.co)
  const productImages = product.images && product.images.length > 0
    ? product.images
    : product.image_url 
      ? [product.image_url] 
      : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      {/* Breadcrumb */}
      <div className="border-b bg-muted/20">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="hover:bg-transparent">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver a productos
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Product Section - 2 Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Image Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery 
              images={productImages}
              productName={product.name}
            />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Store Info */}
              {product.store_name && (
                <Link 
                  to={product.shop_slug ? `/tienda/${product.shop_slug}` : '#'}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group",
                    !product.shop_slug && "cursor-not-allowed opacity-60"
                  )}
                  onClick={(e) => {
                    if (!product.shop_slug) e.preventDefault();
                  }}
                >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Artesano</p>
                  <p className="font-semibold group-hover:text-primary transition-colors">
                    {product.store_name}
                  </p>
                </div>
              </Link>
            )}

            {/* Product Title & Rating */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              
              {/* Rating */}
              {/* {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating?.toFixed(1)} ({product.reviews_count || 0} reseñas)
                  </span>
                </div>
              )} */}
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {product.is_new && (
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Nuevo
                </Badge>
              )}
              {product.free_shipping && (
                <Badge variant="secondary" className="px-3 py-1">
                  Envío gratis
                </Badge>
              )}
              {product.category && (
                <Badge variant="outline" className="px-3 py-1">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-foreground">
                ${getFinalPrice().toLocaleString('es-CO')}
              </div>
              {selectedVariant && (
                <p className="text-sm text-muted-foreground">
                  Precio base: ${product.price.toLocaleString('es-CO')} + 
                  ${selectedVariant.price_adjustment.toLocaleString('es-CO')} (variante)
                </p>
              )}
            </div>

            <Separator />

            {/* Variants */}
            {id && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Opciones disponibles</h3>
                <ProductVariants 
                  productId={id} 
                  basePrice={product.price} 
                  onVariantSelect={setSelectedVariant} 
                />
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Cantidad</h3>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <div className="w-20 h-12 flex items-center justify-center border rounded-md bg-muted">
                  <span className="text-lg font-semibold">{quantity}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full h-14 text-lg" 
                size="lg" 
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Agregar al carrito
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
                  Favoritos
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Enlace copiado');
                  }}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Product Highlights */}
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-lg mb-4">Detalles del producto</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Hecho a mano por artesanos colombianos</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Materiales de alta calidad</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Diseño único y original</span>
                  </p>
                  {product.free_shipping && (
                    <p className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Envío gratis a todo el país</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section - Full Width */}
        <div className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
              <TabsTrigger value="description" className="text-base">
                Descripción
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-base">
                Especificaciones
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-base">
                Reseñas ({product.reviews_count || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Descripción del producto</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                      {product.description || 'Este producto artesanal ha sido elaborado con dedicación y maestría por artesanos colombianos. Cada pieza es única y refleja la riqueza cultural de nuestra tradición artesanal.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Características Artesanales */}
              {(product.craft || product.materials?.length || product.techniques?.length) && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="p-8 space-y-5">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                      Características Artesanales
                    </h3>
                    
                    {/* Oficio */}
                    {product.craft && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Oficio Artesanal</p>
                        <CraftBadge craft={product.craft} size="lg" />
                      </div>
                    )}

                    {/* Materiales */}
                    {product.materials && product.materials.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Materiales</p>
                        <div className="flex flex-wrap gap-2">
                          {product.materials.map((material) => (
                            <Badge key={material} variant="outline" className="text-sm px-3 py-1">
                              🌿 {material}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Técnicas */}
                    {product.techniques && product.techniques.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Técnicas Utilizadas</p>
                        <div className="flex flex-wrap gap-2">
                          {product.techniques.map((technique) => (
                            <Badge key={technique} variant="secondary" className="text-sm px-3 py-1">
                              ✨ {technique}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <ProductTags tags={product.tags} />
            </TabsContent>

            <TabsContent value="specs">
              <ProductSpecs 
                stock={product.stock}
                freeShipping={product.free_shipping}
                category={product.category}
                sku={product.id.slice(0, 8).toUpperCase()}
              />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              {id && <ProductReviews productId={id} />}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts 
        currentProductId={product.id}
        category={product.category}
        storeName={product.store_name}
      />
    </div>
  );
};

export default ProductDetail;
