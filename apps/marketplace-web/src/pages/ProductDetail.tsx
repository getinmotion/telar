import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useProducts } from "@/contexts/ProductsContext";
import { telarClient } from "@/lib/telarClient";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingCart, Share2, Compass, Settings, Leaf, MapPin, Users, Calendar, X, Sparkles } from "lucide-react";
import { ProductVariants } from "@/components/ProductVariants";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductPurchaseButton } from "@/components/ProductPurchaseButton";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currencyUtils";
import { mapArtisanCategory } from "@/lib/productMapper";
import { Product } from "@/types/products.types";
import { ArtisanShop } from "@/types/artisan-shops.types";



const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Use state from Link, or fallback to sessionStorage
  const returnUrl = (location.state as { returnUrl?: string })?.returnUrl 
    || sessionStorage.getItem('productsReturnUrl') 
    || '';
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<ArtisanShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingShop, setLoadingShop] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { fetchShopById } = useArtisanShops();
  const isFavorite = product ? isInWishlist(product.id) : false;
  const [showComingSoon, setShowComingSoon] = useState(false);

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

        const finalProduct = {
         ...productData,
         stock: realStock,
         canPurchase: realCanPurchase,
        };

        setProduct(finalProduct);

        // Fetch shop information if shopId exists
        if (productData.shopId) {
          fetchShopInfo(productData.shopId);
        }
      }
    } catch (error) {
      // Error already handled by context with toast
    } finally {
      setLoading(false);
    }
  };

  const fetchShopInfo = async (shopId: string) => {
    setLoadingShop(true);
    try {
      const shopData = await fetchShopById(shopId);
      if (shopData) {
        setShop(shopData);
      }
    } catch (error) {
      // Error already handled by context with toast
      console.error('Error fetching shop:', error);
    } finally {
      setLoadingShop(false);
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
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
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
      {/* Breadcrumb */}
      {/* <div className="border-b bg-muted/20">
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
      </div> */}

      <div className="container mx-auto px-4 py-8">
        {/* Main Product Section - 2 Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 mx-[10%]">
          {/* Left Column - Image Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery
              images={productImages}
              productName={product.name}
            />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Taller Link */}
            {product.storeName && product.storeSlug && (
              <Link
                to={`/tienda/${product.storeSlug}`}
                className="inline-block text-xs md:text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-wide"
              >
                TALLER: {product.storeName}
              </Link>
            )}

            {/* Product Title & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-serif italic text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Subtitle - Hecho a mano */}
              {(shop?.region || product.storeName) && (
                <p className="text-base md:text-base text-muted-foreground italic">
                  Hecho a mano en {shop?.region || 'Colombia'} por el taller {product.storeName}
                </p>
              )}
            </div>

            {/* Authenticity Labels */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowComingSoon(true)}
                className="p-3 bg-foreground text-background uppercase text-[10px] font-semibold tracking-wide rounded-md hover:bg-foreground/90 transition-colors cursor-pointer text-left"
              >
                Huella Digital Registrada
              </button>
              <button
                onClick={() => setShowComingSoon(true)}
                className="p-3 border-2 border-orange-600 text-orange-600 bg-transparent uppercase text-[10px] font-semibold tracking-wide rounded-md hover:bg-orange-600/10 transition-colors cursor-pointer text-left"
              >
                Certificado de Autenticidad Telar
              </button>
            </div>

            {/* Certificate Link */}
            <button
              onClick={() => setShowComingSoon(true)}
              className="text-foreground hover:text-foreground/80 underline transition-colors text-sm font-medium w-fit"
            >
              Ver certificado de autenticidad
            </button>

            {/* Coming Soon Card */}
            {showComingSoon && (
              <div className="relative border border-orange-600/30 bg-orange-50 rounded-lg p-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="absolute top-3 right-3 text-foreground/40 hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <h4 className="font-serif italic text-lg">Próximamente</h4>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Estamos construyendo un sistema de certificados digitales que permitirá verificar
                  la autenticidad, el origen y la trazabilidad de cada pieza artesanal.
                  Cada objeto tendrá una huella digital única que documenta su historia.
                </p>
                <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">
                  Lanzamiento próximo · 2026
                </p>
              </div>
            )}

            {/* Location & Category Info */}
            {(shop?.region || product.category) && (
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                {shop?.region && (
                  <>
                    {shop.region} — COLOMBIA
                    {product.category && <span className="mx-2">•</span>}
                  </>
                )}
                {product.category}
              </div>
            )}

            {/* Feature Badges — built from real product data */}
            <div className="flex flex-wrap gap-3">
              {product.category && (
                <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full">
                  {product.category}
                </Badge>
              )}
              {product.craft && (
                <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full">
                  {product.craft}
                </Badge>
              )}
              {product.techniques && product.techniques.length > 0 && product.techniques[0] !== product.craft && (
                <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full">
                  {product.techniques[0]}
                </Badge>
              )}
              {product.materials && product.materials.length > 0 && (
                <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full">
                  {product.materials.slice(0, 2).join(' · ')}
                </Badge>
              )}
              {(product.department || product.region) && (
                <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full">
                  {product.department || product.region}, Colombia
                </Badge>
              )}
              {product.isNew && (
                <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full border-primary text-primary">
                  Nuevo
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

            {/* Handmade Notice */}
            <p className="text-sm text-muted-foreground italic">
              Las piezas hechas a mano pueden tener tiempos de preparación diferentes dependiendo del proceso artesanal.
            </p>
          </div>
        </div>

        {/* Product Description Section */}
        <section className="w-full bg-[#f5f3f0] py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-6">
              {/* Decorative Quotes */}
              <div className="text-orange-400 text-4xl">"</div>

              {/* Description Text */}
              <p className="text-xl md:text-2xl font-serif italic text-foreground leading-relaxed px-8">
                {product.shortDescription || product.description || 'Este producto artesanal ha sido elaborado con dedicación y maestría por artesanos colombianos. Cada pieza es única y refleja la riqueza cultural de nuestra tradición artesanal.'}
              </p>
            </div>
          </div>
        </section>

        {/* Product Details - 3 Columns */}
        <section className="w-full bg-background py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8">

              {/* Column 1: Proceso artesanal */}
              <div className="flex flex-col items-start space-y-6">
                <Compass className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-serif italic text-foreground">
                  Proceso artesanal
                </h3>

                <div className="w-full space-y-4 text-left">
                  {/* Materiales */}
                  {(product.materials?.length > 0 || product.material) && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        MATERIALES
                      </p>
                      <p className="text-base italic text-foreground">
                        {product.materials?.join(', ') || product.material}
                      </p>
                    </div>
                  )}

                  {/* Técnica */}
                  {(product.craft || product.techniques?.length > 0) && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        TÉCNICA
                      </p>
                      <p className="text-base italic text-foreground">
                        {product.craft || product.techniques?.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Tiempo de elaboración */}
                  {(product.leadTimeDays || product.productionTime) && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        TIEMPO DE ELABORACIÓN
                      </p>
                      <p className="text-base italic text-foreground">
                        {product.leadTimeDays
                          ? `De ${product.leadTimeDays} a ${product.leadTimeDays + 3} días`
                          : product.productionTime
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Detalles técnicos */}
              <div className="flex flex-col items-start space-y-6">
                <Settings className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-serif italic text-foreground">
                  Detalles técnicos
                </h3>

                <div className="w-full space-y-4 text-left">
                  {/* Dimensiones */}
                  {product.dimensions && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        DIMENSIONES
                      </p>
                      <p className="text-base italic text-foreground">
                        {typeof product.dimensions === 'object' && 'width' in product.dimensions
                          ? `${product.dimensions.width} × ${product.dimensions.height} cm`
                          : product.dimensions
                        }
                      </p>
                    </div>
                  )}

                  {/* Peso */}
                  {product.weight && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        PESO
                      </p>
                      <p className="text-base italic text-foreground">
                        {product.weight} g
                      </p>
                    </div>
                  )}

                  {/* Cuidados — from careNotes */}
                  {product.careNotes && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        CUIDADOS
                      </p>
                      <p className="text-base italic text-foreground">
                        {product.careNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Envío consciente */}
              <div className="flex flex-col items-start space-y-6">
                <Leaf className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-serif italic text-foreground">
                  Envío consciente
                </h3>

                <p className="text-base italic text-foreground leading-relaxed text-left">
                  Las piezas se preparan cuidadosamente para su envío respetando tanto la integridad de la creación como el impacto ambiental del proceso.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Digital Registry Section */}
        <section className="w-full px-4 md:px-8 py-8">
          <div className="bg-[#2a2a2a] rounded-xl py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              {/* Header Text */}
              <div className="text-center mb-12 space-y-6">
                <p className="text-xs md:text-sm text-gray-300 italic max-w-3xl mx-auto">
                  Cada pieza en TELAR cuenta con una huella digital que preserva su origen, su proceso artesanal y el taller que la creó.
                </p>
                <h2 className="text-2xl md:text-3xl font-serif italic text-white">
                  Registro digital de la pieza
                </h2>
              </div>

              {/* Three Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">

                {/* Column 1: Origen */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-orange-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-serif italic text-white">
                    Origen
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300 italic leading-relaxed">
                    {product.material
                      ? `${product.material} ${product.region ? `recolectado y procesado en ${product.region}` : 'procesado localmente'}`
                      : 'Fibras naturales recolectadas y procesadas localmente'
                    }
                  </p>
                </div>

                {/* Column 2: Taller */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-orange-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-serif italic text-white">
                    Taller
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300 italic leading-relaxed">
                    {product.storeName
                      ? `Elaborado en el taller ${product.storeName} bajo principios de comercio justo`
                      : 'Elaborado en el taller bajo principios de comercio justo'
                    }
                  </p>
                </div>

                {/* Column 3: Proceso */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-orange-600 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-serif italic text-white">
                    Proceso
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300 italic leading-relaxed">
                    {product.craft
                      ? `Cada etapa del ${product.craft.toLowerCase()} se realiza manualmente y forma parte del registro histórico de la pieza`
                      : 'Cada etapa del tejido se realiza manualmente y forma parte del registro histórico de la pieza'
                    }
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Cultural Registry Section */}
        {(shop?.region || shop?.municipality) && (
          <section className="w-full bg-background py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                {/* Left Column - Cultural Information */}
                <div className="space-y-8">
                  {/* Label */}
                  <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold">
                    REGISTRO CULTURAL
                  </p>

                  {/* Title - Municipality/Region */}
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground">
                    {shop?.municipality || shop?.region || 'Región Artesanal'}
                    {shop?.department && `, ${shop.department}`}
                  </h2>

                  {/* Description */}
                  <p className="text-base md:text-lg text-muted-foreground italic leading-relaxed">
                    {shop?.description ||
                      `Ubicado en el corazón de Colombia, esta región es reconocida por su tradición artesanal. Durante generaciones, artesanos de la zona han trabajado ${product.craft || 'la artesanía'} como una forma de preservar su identidad cultural.`
                    }
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    {/* Tradición */}
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        TRADICIÓN
                      </p>
                      <p className="text-base md:text-lg italic text-foreground">
                        {product.craft || product.craftType || 'Artesanía tradicional'}
                      </p>
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        UBICACIÓN
                      </p>
                      <p className="text-base md:text-lg italic text-foreground">
                        {shop?.department || shop?.region || 'Colombia'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Map Image */}
                <div className="relative h-[400px] md:h-[500px] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                  {/* Map Placeholder with Pin Icon */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="relative">
                      {/* Diagonal Lines Background */}
                      <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id="diagonal-lines" patternUnits="userSpaceOnUse" width="20" height="20">
                              <path d="M 0,20 l 20,-20 M -5,5 l 10,-10 M 15,25 l 10,-10"
                                    stroke="#9ca3af"
                                    strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
                        </svg>
                      </div>

                      {/* Map Pin Icon */}
                      <MapPin className="w-16 h-16 text-orange-600 relative z-10" />
                    </div>
                  </div>

                  {/* Location Label */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
                    <p className="text-sm font-semibold text-foreground">
                      {shop?.municipality || shop?.region || 'Colombia'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Origen artesanal
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}
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
