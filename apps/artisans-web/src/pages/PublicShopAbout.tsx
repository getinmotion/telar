import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { ShopThemeProvider } from '@/contexts/ShopThemeContext';
import { ShopNavbar } from '@/components/shop/ShopNavbar';
import { ShopFooter } from '@/components/shop/ShopFooter';
import { ShopSection } from '@/components/shop/ShopSection';
import { motion } from 'framer-motion';
import { useShopTheme } from '@/contexts/ShopThemeContext';
import { Heart, Target, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface AboutContent {
  title: string;
  story: string;
  mission: string;
  vision: string;
  values: Array<{ name: string; description: string }>;
}

const AboutPageContent: React.FC<{ aboutContent: AboutContent; shopName: string }> = ({
  aboutContent,
  shopName
}) => {
  const { getPrimaryColor } = useShopTheme();

  const iconMap: { [key: string]: any } = {
    heart: Heart,
    target: Target,
    sparkles: Sparkles
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <ShopSection background="gradient" className="pt-24">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {aboutContent.title || `Sobre ${shopName}`}
          </h1>
        </motion.div>
      </ShopSection>

      {/* Story Section */}
      {aboutContent.story && (
        <ShopSection>
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Nuestra Historia</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                {aboutContent.story}
              </p>
            </div>
          </motion.div>
        </ShopSection>
      )}

      {/* Mission & Vision */}
      <ShopSection background="subtle">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {aboutContent.mission && (
            <motion.div
              className="bg-card/80 backdrop-blur-md rounded-2xl p-8 shadow-[var(--shadow-elegant)] border border-border"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${getPrimaryColor(0)}20` }}
              >
                <Target className="w-6 h-6" style={{ color: getPrimaryColor(0) }} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
              <p className="text-muted-foreground leading-relaxed">{aboutContent.mission}</p>
            </motion.div>
          )}

          {aboutContent.vision && (
            <motion.div
              className="bg-card/80 backdrop-blur-md rounded-2xl p-8 shadow-[var(--shadow-elegant)] border border-border"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${getPrimaryColor(0)}20` }}
              >
                <Sparkles className="w-6 h-6" style={{ color: getPrimaryColor(0) }} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Nuestra Visión</h3>
              <p className="text-muted-foreground leading-relaxed">{aboutContent.vision}</p>
            </motion.div>
          )}
        </div>
      </ShopSection>

      {/* Values Section */}
      {aboutContent.values && aboutContent.values.length > 0 && (
        <ShopSection>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Nuestros Valores</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {aboutContent.values.map((value, index) => {
                const IconComponent = iconMap[value.name.toLowerCase()] || Heart;
                return (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${getPrimaryColor(0)}15` }}
                    >
                      <IconComponent className="w-8 h-8" style={{ color: getPrimaryColor(0) }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.name}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ShopSection>
      )}
    </div>
  );
};

const PublicShopAbout: React.FC = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Preview mode detection
  const urlParams = new URLSearchParams(window.location.search);
  const isPreviewMode = urlParams.get('preview') === 'true';
  
  // Auth state for ownership verification
  const [authLoaded, setAuthLoaded] = useState(!isPreviewMode);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const authLoadedRef = useRef(false);

  // Auth listener for preview mode
  useEffect(() => {
    if (!isPreviewMode) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' && !authLoadedRef.current) {
        authLoadedRef.current = true;
        setCurrentUser(session?.user ?? null);
        setAuthLoaded(true);
      }
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!authLoadedRef.current) {
        authLoadedRef.current = true;
        setAuthLoaded(true);
      }
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [isPreviewMode]);

  // Fetch shop data
  useEffect(() => {
    const fetchShop = async () => {
      if (!shopSlug || !authLoaded) return;

      let query = supabase
        .from('artisan_shops')
        .select('*')
        .eq('shop_slug', shopSlug);

      // Only filter by active if NOT in preview mode or not owner
      if (!isPreviewMode) {
        query = query.eq('active', true);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching shop:', error);
        setLoading(false);
        return;
      }

      // Check ownership in preview mode
      if (isPreviewMode && currentUser) {
        const ownerCheck = data?.user_id === currentUser.id;
        setIsOwner(ownerCheck);
        
        // If preview mode but not owner, redirect
        if (!ownerCheck && data?.publish_status !== 'published') {
          navigate('/tiendas');
          return;
        }
      }

      setShop(data);
      setLoading(false);
    };

    fetchShop();
  }, [shopSlug, authLoaded, currentUser, isPreviewMode, navigate]);

  if (loading || !authLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!shop) {
    return <div className="min-h-screen flex items-center justify-center">Tienda no encontrada</div>;
  }

  const theme = {
    primaryColors: shop.primary_colors || [],
    secondaryColors: shop.secondary_colors || [],
    brandClaim: shop.brand_claim,
    logoUrl: shop.logo_url
  };

  const aboutContent: AboutContent = shop.about_content || {
    title: '',
    story: shop.story || '',
    mission: '',
    vision: '',
    values: []
  };

  return (
    <ShopThemeProvider theme={theme}>
      <Helmet>
        <title>Sobre Nosotros - {shop.shop_name}</title>
        <meta name="description" content={aboutContent.story || shop.description} />
      </Helmet>

      {/* Preview Mode Header */}
      {isPreviewMode && isOwner && (
        <div className="sticky top-0 z-[60] bg-foreground text-background py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Vista Previa</span>
              <span className="text-xs opacity-70">Esta tienda aún no está publicada</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10"
              onClick={() => navigate('/mi-tienda')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
        </div>
      )}

      <ShopNavbar
        shopName={shop.shop_name}
        logoUrl={shop.logo_url}
        shopSlug={shop.shop_slug}
      />
      
      <AboutPageContent aboutContent={aboutContent} shopName={shop.shop_name} />
      
      <ShopFooter
        shopName={shop.shop_name}
        contactEmail={shop.contact_info?.email}
        contactPhone={shop.contact_info?.phone}
        address={shop.contact_info?.address}
        socialLinks={shop.social_links}
      />
    </ShopThemeProvider>
  );
};

export default PublicShopAbout;
