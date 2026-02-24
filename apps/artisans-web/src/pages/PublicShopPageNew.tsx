import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { ShopThemeProvider } from '@/contexts/ShopThemeContext';
import { ShopNavbar } from '@/components/shop/ShopNavbar';
import { ShopFooter } from '@/components/shop/ShopFooter';
import { ShoppingCartProvider } from '@/contexts/ShoppingCartContext';
import { Button } from '@/components/ui/button';
import { Eye, ArrowLeft } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

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
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [authLoaded, setAuthLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const authLoadedRef = useRef(false);

  const urlParams = new URLSearchParams(window.location.search);
  const isPreviewRequest = urlParams.get('preview') === 'true';

  useEffect(() => {
    if (!isPreviewRequest) {
      setAuthLoaded(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') {
          authLoadedRef.current = true;
          setCurrentUser(session?.user || null);
          setAuthLoaded(true);
        } else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          authLoadedRef.current = true;
          setCurrentUser(session?.user || null);
          setAuthLoaded(true);
        }
      }
    );

    const timeout = setTimeout(() => {
      if (!authLoadedRef.current) {
        setAuthLoaded(true);
      }
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!authLoaded) return;

    const fetchShopData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const previewMode = urlParams.get('preview') === 'true';
        setIsPreviewMode(previewMode);
        
        const shopData = await getArtisanShopBySlug(shopSlug!);

        if (!shopData) {
          setLoading(false);
          return;
        }

        const ownerCheck = currentUser && shopData.userId === currentUser.id;
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

        let productsQuery = supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id);

        if (!ownerCheck) {
          productsQuery = productsQuery.in('moderation_status', ['approved', 'approved_with_edits']);
        }

        const { data: productsData } = await productsQuery;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching shop:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopSlug) {
      fetchShopData();
    }
  }, [shopSlug, navigate, authLoaded, currentUser]);

  // Calculate categories from products
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    products.forEach(product => {
      const cat = product.category || shop?.craft_type || 'artesanías';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      icon: '✨',
      count
    }));
  }, [products, shop?.craft_type]);

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
      primary: { '500': shop.primary_colors?.[0] || '#142239' },
      secondary: { '500': shop.secondary_colors?.[0] || '#ffc716' },
      accent: { '500': '#f48c5f' },
      neutral: { '500': '#78716c', '50': '#fafaf9', '900': '#1c1917' },
      success: { '500': '#3AA76D' },
      warning: { '500': '#E9B64F' },
      error: { '500': '#E04F5F' },
      info: { '500': '#4D8DE3' }
    }
  };

  const heroImage = shop.hero_config?.slides?.[0]?.imageUrl || 
                    shop.hero_config?.slides?.[0]?.image || 
                    shop.banner_url || 
                    shop.logo_url;

  return (
    <ShoppingCartProvider>
      <ShopThemeProvider theme={theme}>
        <div className="min-h-screen bg-background">
          <Helmet>
            <title>{shop.shop_name} - Tienda Artesanal</title>
            <meta name="description" content={shop.description} />
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
            craftType={shop.craft_type?.replace(/-/g, ' ')}
          />

          {/* 2. Navbar */}
          <ShopNavbar 
            shopName={shop.shop_name}
            logoUrl={shop.logo_url}
            shopSlug={shopSlug}
            artisanProfileCompleted={shop.artisan_profile_completed}
          />

          {/* 3. Hero Principal - Bruvi Style */}
          <BruviStyleHero
            shopName={shop.shop_name}
            description={shop.description || shop.brand_claim}
            heroImage={heroImage}
            logoUrl={shop.logo_url}
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
              shopName={shop.shop_name}
              story={shop.story || shop.about_content?.story}
              imageUrl={shop.banner_url || shop.logo_url}
              onKnowMore={() => {
                const preview = isPreviewMode ? '?preview=true' : '';
                navigate(`/tienda/${shopSlug}/${shop.artisan_profile_completed ? 'perfil-artesanal' : 'nosotros'}${preview}`);
              }}
            />
          </section>

          {/* 8. Testimonials */}
          <TestimonialsSection shopName={shop.shop_name} />

          {/* 9. Impact Section */}
          <ImpactSection />

          {/* 10. Footer */}
          <ShopFooter 
            shopName={shop.shop_name}
            contactEmail={shop.contact_info?.email}
            contactPhone={shop.contact_info?.phone}
            address={shop.contact_info?.address}
            socialLinks={shop.social_links}
          />
        </div>
      </ShopThemeProvider>
    </ShoppingCartProvider>
  );
}
