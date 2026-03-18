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
import { Heart, ShoppingCart, Share2, Compass, Settings, Leaf } from "lucide-react";
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
          <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[600px]">
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
              <div className="p-3 bg-foreground text-background uppercase text-[10px] font-semibold tracking-wide rounded-md">
                Huella Digital Registrada
              </div>
              <div className="p-3 border-2 border-orange-600 text-orange-600 bg-transparent uppercase text-[10px] font-semibold tracking-wide rounded-md">
                Certificado de Autenticidad Telar
              </div>
            </div>

            {/* Certificate Link */}
            <Link
              to="#"
              className="text-foreground hover:text-foreground/80 underline transition-colors text-sm font-medium w-fit"
            >
              Ver certificado de autenticidad
            </Link>

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

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full">
                Hecho a mano en Colombia
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full">
                Taller Artesanal
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-xs uppercase tracking-wide rounded-full">
                Pieza con Historia
              </Badge>
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

                  {/* Cuidados */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      CUIDADOS
                    </p>
                    <p className="text-base italic text-foreground">
                      Lavado suave a mano
                    </p>
                  </div>

                  {/* Embalaje */}
                  {product.craftType && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        EMBALAJE
                      </p>
                      <p className="text-base italic text-foreground">
                        Empaque textil protector para transporte seguro
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
