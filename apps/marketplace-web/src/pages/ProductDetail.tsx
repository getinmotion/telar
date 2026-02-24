import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useProducts } from "@/contexts/ProductsContext";
import { telarClient } from "@/lib/telarClient";
import { supabase } from "@/integrations/supabase/client";
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
import { ProductPurchaseButton } from "@/components/ProductPurchaseButton";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currencyUtils";
import { mapArtisanCategory } from "@/lib/productMapper";
import { Product } from "@/types/products.types";



const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Use state from Link, or fallback to sessionStorage
  const returnUrl = (location.state as { returnUrl?: string })?.returnUrl 
    || sessionStorage.getItem('productsReturnUrl') 
    || '';
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


  const { fetchProductById } = useProducts();

  const fetchProduct = async () => {
    if (!id) return;

    try {
      const productData = await fetchProductById(id);


      if (productData) {
        const realStock = productData?.stock || productData.inventory || 0;
        const storeReadyToPurchase = productData.canPurchase ?? false;
        const realCanPurchase = storeReadyToPurchase && realStock > 0;

        setProduct({
         ...productData,
         stock: realStock,
         canPurchase: realCanPurchase,
        });
      }
    } catch (error) {
      // Error already handled by context with toast
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
    return parseFloat(product.price) + (selectedVariant?.price_adjustment || 0);
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
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      {/* Breadcrumb */}
      <div className="border-b bg-muted/20">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-transparent"
            onClick={() => navigate(`/productos${returnUrl}`)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
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
              {product.storeName && (
                <Link 
                  to={product.storeSlug ? `/tienda/${product.storeSlug}` : '#'}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group",
                    !product.storeSlug && "cursor-not-allowed opacity-60"
                  )}
                  onClick={(e) => {
                    if (!product.storeSlug) e.preventDefault();
                  }}
                >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Artesano</p>
                  <p className="font-semibold group-hover:text-primary transition-colors">
                    {product.storeName}
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
              {product.isNew && (
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Nuevo
                </Badge>
              )}
              {product.freeShipping && (
                <Badge variant="secondary" className="px-3 py-1">
                  Envío gratis
                </Badge>
              )}
              {product.allowsLocalPickup && (
                <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-800 border-green-200">
                  <MapPin className="h-3 w-3 mr-1" />
                  Retiro en local disponible
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
                {formatCurrency(getFinalPrice())}
              </div>
              {selectedVariant && selectedVariant.price_adjustment != null && (
                <p className="text-sm text-muted-foreground">
                  Precio base: {formatCurrency(parseFloat(product.price))} +
                  {formatCurrency(selectedVariant.price_adjustment || 0)} (variante)
                </p>
              )}
            </div>

            <Separator />

            {/* Variants - El componente maneja su propio título y retorna null si no hay variantes */}
            {id && (
              <ProductVariants 
                productId={id} 
                basePrice={parseFloat(product.price)} 
                onVariantSelect={(variant) => {
                  setSelectedVariant(variant);
                  setQuantity(1);
                }} 
              />
            )}

            {/* Quantity Selector - Solo mostrar si hay stock */}
            {(() => {
              const maxStock = selectedVariant?.stock ?? product.stock ?? 0;
              if (maxStock === 0) return null;
              
              return (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Cantidad</h3>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
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
                      onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                      disabled={quantity >= maxStock}
                    >
                      +
                    </Button>
                  </div>
                  {/* Stock indicator */}
                  <div className="text-sm">
                    {maxStock > 10 ? (
                      <span className="text-green-600">+10 disponibles</span>
                    ) : maxStock <= 3 ? (
                      <span className="text-orange-500 font-medium">¡Solo {maxStock} disponible{maxStock > 1 ? 's' : ''}!</span>
                    ) : (
                      <span className="text-muted-foreground">{maxStock} disponibles</span>
                    )}
                  </div>
                </div>
              );
            })()}

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <ProductPurchaseButton
                productId={product.id}
                productName={product.name}
                canPurchase={product.canPurchase ?? true}
                stock={product.stock}
                quantity={quantity}
                variantId={selectedVariant?.id}
                variant="detail"
              />
              
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
                  {product.freeShipping && (
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
                Reseñas ({product.reviewsCount || 0})
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
                freeShipping={product.freeShipping}
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
        storeName={product.storeName}
      />
    </div>
  );
};

export default ProductDetail;
