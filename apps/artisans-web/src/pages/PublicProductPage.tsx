import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { ArtisanShop, Product } from '@/types/artisan';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Package, Timer, ShoppingBag, AlertTriangle, Truck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { ShopThemeProvider, useShopTheme } from '@/contexts/ShopThemeContext';
import { convertLegacyToNewPalette } from '@/utils/colorUtils';
import { ShoppingCartProvider, useCart } from '@/contexts/ShoppingCartContext';
import { ShopNavbar } from '@/components/shop/ShopNavbar';
import { ShopFooter } from '@/components/shop/ShopFooter';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

// Bruvi components
import { PromoBanner } from '@/components/shop/bruvi/PromoBanner';
import { ProductAboutSection } from '@/components/shop/bruvi/ProductAboutSection';
import { ProductReviewsSection } from '@/components/shop/bruvi/ProductReviewsSection';

export const PublicProductPage: React.FC = () => {
  const { shopSlug, productId } = useParams<{ shopSlug: string; productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<ArtisanShop | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isPreviewMode = searchParams.get('preview') === 'true';
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const authLoadedRef = useRef(false);

  useEffect(() => {
    if (!isPreviewMode) {
      authLoadedRef.current = true;
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setCurrentUser(session?.user || null);
        authLoadedRef.current = true;
      }
    });

    const timeout = setTimeout(() => {
      authLoadedRef.current = true;
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [isPreviewMode]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!shopSlug || !productId) return;
      
      if (isPreviewMode && !authLoadedRef.current) {
        return;
      }

      try {
        const shopData = await getArtisanShopBySlug(shopSlug);

        if (!shopData) {
          toast.error('Tienda no encontrada');
          navigate('/tiendas');
          return;
        }

        const ownerCheck = currentUser?.id === shopData.userId;
        setIsOwner(ownerCheck);

        if (!shopData.active && !ownerCheck) {
          toast.error('Tienda no disponible');
          navigate('/tiendas');
          return;
        }

        setShop(shopData);

        let productQuery = supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('shop_id', shopData.id);

        if (!ownerCheck) {
          productQuery = productQuery.eq('active', true);
        }

        const { data: productData, error: productError } = await productQuery.maybeSingle();

        if (productError || !productData) {
          toast.error('Producto no encontrado');
          navigate(`/tienda/${shopSlug}${isPreviewMode ? '?preview=true' : ''}`);
          return;
        }

        setProduct(productData);

        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .eq('active', true)
          .neq('id', productId)
          .limit(6);

        setRelatedProducts(relatedData || []);

      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [shopSlug, productId, navigate, currentUser, isPreviewMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <ShoppingBag className="w-16 h-16 mx-auto text-primary/60 mb-4" />
          <div className="text-xl font-medium text-foreground">Cargando producto...</div>
        </div>
      </div>
    );
  }

  if (!shop || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-background">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <Button onClick={() => navigate('/tiendas')}>Ver todas las tiendas</Button>
      </div>
    );
  }

  const shopData = shop as any;
  const theme = {
    palette: shopData.primary_colors && shopData.secondary_colors 
      ? convertLegacyToNewPalette(shopData.primary_colors, shopData.secondary_colors)
      : convertLegacyToNewPalette(),
    brandClaim: shopData.brand_claim,
    logoUrl: shopData.logo_url,
  };

  return (
    <ShoppingCartProvider>
      <ShopThemeProvider theme={theme}>
        <ProductPageContent 
          shop={shop} 
          product={product} 
          relatedProducts={relatedProducts}
          isOwner={isOwner}
          isPreviewMode={isPreviewMode}
        />
      </ShopThemeProvider>
    </ShoppingCartProvider>
  );
};

interface ProductPageContentProps {
  shop: ArtisanShop;
  product: Product;
  relatedProducts: Product[];
  isOwner: boolean;
  isPreviewMode: boolean;
}

const ProductPageContent: React.FC<ProductPageContentProps> = ({ 
  shop, product, relatedProducts, isOwner, isPreviewMode 
}) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  
  const productData = product as any;
  const moderationStatus = productData?.moderation_status;
  const showModerationBadge = isOwner && isPreviewMode && moderationStatus && moderationStatus !== 'approved';
  
  const getModerationLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending_moderation': 'Pendiente de Aprobación',
      'changes_requested': 'Cambios Solicitados',
      'rejected': 'Rechazado',
      'draft': 'Borrador'
    };
    return labels[status] || status;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1, product.price);
      toast.success('Producto agregado al carrito', {
        description: product.name,
      });
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  const images = (product.images as any) || [];
  const materials = (product.materials as any) || [];
  const techniques = (product.techniques as any) || [];
  const dimensions = (product.dimensions as any) || {};

  // Calculate free shipping threshold
  const freeShippingThreshold = 150000;
  const remaining = freeShippingThreshold - product.price;

  return (
    <>
      <Helmet>
        <title>{product.name} - {shop.shop_name}</title>
        <meta name="description" content={product.description || `${product.name} - Artesanía de ${shop.shop_name}`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description || `Artesanía de ${shop.shop_name}`} />
        <meta property="og:image" content={images[0]} />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="COP" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Preview Header */}
        {isPreviewMode && isOwner && (
          <div className="sticky top-0 z-50 bg-foreground text-background px-4 py-3">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">Vista Previa</span>
                <span className="text-sm opacity-80">Esta tienda aún no está publicada</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/mi-tienda')}>
                ← Volver al Dashboard
              </Button>
            </div>
          </div>
        )}
        
        {/* Moderation Banner */}
        {showModerationBadge && (
          <div className="bg-warning/20 border-b border-warning px-4 py-2">
            <div className="container mx-auto flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">
                Estado de moderación: {getModerationLabel(moderationStatus)}
              </span>
            </div>
          </div>
        )}

        {/* Promo Banner */}
        <PromoBanner 
          region={shop.region?.replace(/_/g, ' ')} 
          craftType={shop.craft_type?.replace(/-/g, ' ')}
        />
        
        {/* Navbar */}
        <ShopNavbar 
          shopName={shop.shop_name} 
          logoUrl={shop.logo_url || undefined}
          shopSlug={shop.shop_slug}
        />
        
        {/* Breadcrumb */}
        <div className="border-b border-border/50 bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/tienda/${shop.shop_slug}${isPreviewMode ? '?preview=true' : ''}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a la tienda
              </Button>
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                {product.category || shop.craft_type?.replace(/-/g, ' ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Product Section - Bruvi Layout */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              
              {/* Gallery - Left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Main Image */}
                <div className="aspect-square rounded-3xl overflow-hidden bg-cream-200 shadow-elegant mb-4">
                  {images.length > 0 ? (
                    <img 
                      src={images[selectedImage] || images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-20 h-20 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.slice(0, 4).map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Product Info - Right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Header */}
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                    {techniques[0] || 'Artesanía'} · {product.category || 'Pieza única'}
                    {product.inventory && product.inventory <= 5 && ' · Serie limitada'}
                  </p>
                  
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                    {product.name}
                  </h1>
                  
                  {/* Rating placeholder */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(12 reseñas)</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.compare_price)}
                    </span>
                  )}
                </div>

                {/* Purchase Options */}
                <div className="space-y-3 p-4 bg-card rounded-xl border border-border/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="purchase" defaultChecked className="w-4 h-4 text-primary" />
                    <span className="font-medium">Compra única</span>
                  </label>
                  {product.customizable && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="purchase" className="w-4 h-4 text-primary" />
                      <span className="font-medium">Pedido personalizado</span>
                    </label>
                  )}
                </div>

                {/* Production Time */}
                {product.production_time && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm">Tiempo estimado de elaboración: {product.production_time}</span>
                  </div>
                )}

                {/* Add to Cart */}
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.inventory === 0}
                  size="lg"
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                >
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  {product.inventory === 0 ? 'Agotado' : 'Agregar al carrito'}
                </Button>

                {/* Shipping Progress */}
                {remaining > 0 && (
                  <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-secondary" />
                      <span>Te faltan <strong>{formatPrice(remaining)}</strong> para obtener envío gratuito</span>
                    </div>
                    <div className="mt-2 h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full transition-all"
                        style={{ width: `${Math.min((product.price / freeShippingThreshold) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Inventory Badge */}
                {product.inventory && product.inventory > 0 && product.inventory <= 10 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Solo quedan {product.inventory} disponibles</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <ProductAboutSection
          description={product.description}
          technique={techniques[0]}
          materials={materials}
          productionTime={product.production_time}
          dimensions={dimensions}
          weight={product.weight}
        />

        {/* Storytelling Extended */}
        <section className="py-16 bg-cream-200/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                Hecha con tradición
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Cada pieza nace en el taller de {shop.shop_name}, donde la técnica y la tradición 
                se mezclan para crear algo verdaderamente único. No es producción industrial: 
                es un oficio que ha pasado por generaciones.
              </p>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-10">
                También te puede interesar
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/tienda/${shop.shop_slug}/producto/${relatedProduct.id}${isPreviewMode ? '?preview=true' : ''}`)}
                  >
                    <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all border border-border/30">
                      <div className="aspect-square overflow-hidden bg-cream-200">
                        {(relatedProduct.images as any)?.[0] ? (
                          <img 
                            src={(relatedProduct.images as any)[0]}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <span className="font-bold text-primary">
                          {formatPrice(relatedProduct.price)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        <ProductReviewsSection 
          averageRating={4.8}
          totalReviews={12}
          onWriteReview={() => toast.info('Función de reseñas próximamente')}
        />

        {/* Footer */}
        <ShopFooter 
          shopName={shop.shop_name}
          contactEmail={(shop.contact_info as any)?.email}
          contactPhone={(shop.contact_info as any)?.phone}
          address={(shop.contact_info as any)?.address}
          socialLinks={shop.social_links as any}
        />
      </div>
    </>
  );
};
