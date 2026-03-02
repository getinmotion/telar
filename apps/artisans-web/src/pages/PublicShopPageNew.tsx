import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { getProductsByShopId, getMarketplaceProductsByShopId } from '@/services/products.actions';
import { ShopThemeProvider } from '@/contexts/ShopThemeContext';
import { ShopNavbar } from '@/components/shop/ShopNavbar';
import { ShopFooter } from '@/components/shop/ShopFooter';
import { ShoppingCartProvider } from '@/contexts/ShoppingCartContext';
import { Button } from '@/components/ui/button';
import { Eye, ArrowLeft } from 'lucide-react';

// Bruvi-style components
import { PromoBanner } from '@/components/shop/bruvi/PromoBanner';
import { BruviStyleHero } from '@/components/shop/bruvi/BruviStyleHero';
import { CategorySelector } from '@/components/shop/bruvi/CategorySelector';
import { BenefitsSection } from '@/components/shop/bruvi/BenefitsSection';
import { FeaturedProductsCarousel } from '@/components/shop/bruvi/FeaturedProductsCarousel';
import { StorytellingBlock } from '@/components/shop/bruvi/StorytellingBlock';
import { TestimonialsSection } from '@/components/shop/bruvi/TestimonialsSection';
import { ImpactSection } from '@/components/shop/bruvi/ImpactSection';

export default function PublicShopPageNew() {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const isPreviewRequest = new URLSearchParams(window.location.search).get('preview') === 'true';

  // Para modo preview esperamos que auth resuelva; en vista pública cargamos de inmediato
  const authLoaded = !isPreviewRequest || !authLoading;

  useEffect(() => {
    if (!authLoaded || !shopSlug) return;

    const fetchShopData = async () => {
      try {
        setIsPreviewMode(isPreviewRequest);

        const shopData = await getArtisanShopBySlug(shopSlug);

        if (!shopData) {
          setLoading(false);
          return;
        }

        // Solo el dueño en modo preview tiene vista completa (todos los productos)
        const ownerCheck = isPreviewRequest && !!currentUser && shopData.userId === currentUser.id;
        setIsOwner(ownerCheck);

        if (ownerCheck) {
          setShop(shopData);
        } else {
          if (shopData.publishStatus !== 'published') {
            navigate('/tiendas');
            return;
          }
          setShop(shopData);
        }

        // Dueño: todos los productos | Público: solo aprobados vía marketplace
        const productsData = ownerCheck
          ? await getProductsByShopId(shopData.id)
          : await getMarketplaceProductsByShopId(shopData.id);

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching shop:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopSlug, authLoaded, navigate]);

  // Calculate categories from products
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    products.forEach(product => {
      const cat = product.category || shop?.craftType || 'artesanías';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      icon: '✨',
      count
    }));
  }, [products, shop?.craftType]);

  const handleProductClick = (productId: string) => {
    const previewParam = isPreviewMode ? '?preview=true' : '';
    navigate(`/tienda/${shopSlug}/producto/${productId}${previewParam}`);
  };

  const scrollToProducts = () => {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStory = () => {
    document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando tienda...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tienda no encontrada</h2>
          <p className="text-muted-foreground">La tienda que buscas no existe o no está disponible</p>
        </div>
      </div>
    );
  }

  const theme = {
    palette: {
      primary: { '500': shop.primaryColors?.[0] || '#142239' },
      secondary: { '500': shop.secondaryColors?.[0] || '#ffc716' },
      accent: { '500': '#f48c5f' },
      neutral: { '500': '#78716c', '50': '#fafaf9', '900': '#1c1917' },
      success: { '500': '#3AA76D' },
      warning: { '500': '#E9B64F' },
      error: { '500': '#E04F5F' },
      info: { '500': '#4D8DE3' }
    }
  };

  const heroImage = shop.heroConfig?.slides?.[0]?.imageUrl ||
    shop.heroConfig?.slides?.[0]?.image ||
    shop.bannerUrl ||
    shop.logoUrl;

  return (
    <ShoppingCartProvider>
      <ShopThemeProvider theme={theme}>
        <div className="min-h-screen bg-background">
          <Helmet>
            <title>{`${shop.shopName} - Tienda Artesanal`}</title>
            <meta name="description" content={shop.description ?? ''} />
          </Helmet>

          {/* Preview Header */}
          {isPreviewMode && isOwner && (
            <div className="sticky top-0 z-50 bg-foreground text-background py-3 px-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Vista Previa</span>
                  <span className="text-sm opacity-80 hidden sm:inline">- Esta tienda aún no está publicada</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/mi-tienda')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* 1. Promo Banner */}
          <PromoBanner
            region={shop.region?.replace(/_/g, ' ')}
            craftType={shop.craftType?.replace(/-/g, ' ')}
          />

          {/* 2. Navbar */}
          <ShopNavbar
            shopName={shop.shopName}
            logoUrl={shop.logoUrl}
            shopSlug={shopSlug}
            artisanProfileCompleted={shop.artisanProfileCompleted}
          />

          {/* 3. Hero Principal - Bruvi Style */}
          <BruviStyleHero
            shopName={shop.shopName}
            description={shop.description || shop.brandClaim}
            heroImage={heroImage}
            logoUrl={shop.logoUrl}
            onViewProducts={scrollToProducts}
            onKnowArtisan={scrollToStory}
          />

          {/* 4. Category Selector */}
          {categories.length > 0 && (
            <CategorySelector
              categories={categories}
              onCategoryClick={(category) => {
                scrollToProducts();
              }}
            />
          )}

          {/* 5. Benefits Section */}
          <BenefitsSection />

          {/* 6. Featured Products Carousel */}
          <section id="productos">
            <FeaturedProductsCarousel
              products={products.slice(0, 8)}
              onProductClick={handleProductClick}
            />
          </section>

          {/* 7. Storytelling Block */}
          <section id="historia">
            <StorytellingBlock
              shopName={shop.shopName}
              story={shop.story || shop.aboutContent?.story}
              imageUrl={shop.bannerUrl || shop.logoUrl}
              onKnowMore={() => {
                const preview = isPreviewMode ? '?preview=true' : '';
                navigate(`/tienda/${shopSlug}/${shop.artisanProfileCompleted ? 'perfil-artesanal' : 'nosotros'}${preview}`);
              }}
            />
          </section>

          {/* 8. Testimonials */}
          <TestimonialsSection shopName={shop.shopName} />

          {/* 9. Impact Section */}
          <ImpactSection />

          {/* 10. Footer */}
          <ShopFooter
            shopName={shop.shopName}
            contactEmail={shop.contactConfig?.email}
            contactPhone={shop.contactConfig?.phone}
            address={shop.contactConfig?.address}
            socialLinks={shop.socialLinks}
          />
        </div>
      </ShopThemeProvider>
    </ShoppingCartProvider>
  );
}
