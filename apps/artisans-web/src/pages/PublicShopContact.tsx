import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { ShopThemeProvider } from '@/contexts/ShopThemeContext';
import { ShopNavbar } from '@/components/shop/ShopNavbar';
import { ShopFooter } from '@/components/shop/ShopFooter';
import { ShopSection } from '@/components/shop/ShopSection';
import { CTAButton } from '@/components/shop/CTAButton';
import { motion } from 'framer-motion';
import { useShopTheme } from '@/contexts/ShopThemeContext';
import { Mail, Phone, MapPin, Clock, MessageCircle, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface ContactConfig {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  map_embed: string;
}

const ContactPageContent: React.FC<{ contactConfig: ContactConfig; shopName: string }> = ({
  contactConfig,
  shopName
}) => {
  const { getPrimaryColor } = useShopTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Mensaje enviado correctamente');
    setFormData({ name: '', email: '', message: '' });
  };

  const contactItems = [
    {
      icon: Mail,
      label: 'Email',
      value: contactConfig.email,
      link: `mailto:${contactConfig.email}`
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: contactConfig.phone,
      link: `tel:${contactConfig.phone}`
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: contactConfig.whatsapp,
      link: `https://wa.me/${contactConfig.whatsapp?.replace(/\D/g, '')}`
    },
    {
      icon: MapPin,
      label: 'Dirección',
      value: contactConfig.address,
      link: null
    },
    {
      icon: Clock,
      label: 'Horario',
      value: contactConfig.hours,
      link: null
    }
  ].filter(item => item.value);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <ShopSection background="gradient" className="pt-24">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Contáctanos</h1>
          <p className="text-xl text-muted-foreground">
            Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.
          </p>
        </motion.div>
      </ShopSection>

      {/* Contact Info & Form */}
      <ShopSection>
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8">Información de Contacto</h2>
            <div className="space-y-6">
              {contactItems.map((item, index) => {
                const IconComponent = item.icon;
                const content = (
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${getPrimaryColor(0)}15` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: getPrimaryColor(0) }} />
                    </div>
                    <div>
                      <p className="font-medium mb-1">{item.label}</p>
                      <p className="text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                );

                return item.link ? (
                  <a key={index} href={item.link} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="bg-card/80 backdrop-blur-md rounded-2xl p-8 shadow-[var(--shadow-elegant)] border border-border"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Envíanos un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mensaje</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <CTAButton type="submit" variant="primary" size="lg" className="w-full">
                Enviar Mensaje
              </CTAButton>
            </form>
          </motion.div>
        </div>
      </ShopSection>

      {/* Map Section */}
      {contactConfig.map_embed && (
        <ShopSection background="subtle">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Encuéntranos</h2>
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: '400px' }}>
              <iframe
                src={contactConfig.map_embed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </ShopSection>
      )}
    </div>
  );
};

const PublicShopContact: React.FC = () => {
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

      // Only filter by active if NOT in preview mode
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

  const contactConfig: ContactConfig = shop.contact_config || {
    email: shop.contact_info?.email || '',
    phone: shop.contact_info?.phone || '',
    whatsapp: shop.contact_info?.whatsapp || '',
    address: shop.contact_info?.address || '',
    hours: '',
    map_embed: ''
  };

  return (
    <ShopThemeProvider theme={theme}>
      <Helmet>
        <title>Contacto - {shop.shop_name}</title>
        <meta name="description" content={`Contáctanos en ${shop.shop_name}`} />
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
      
      <ContactPageContent contactConfig={contactConfig} shopName={shop.shop_name} />
      
      <ShopFooter
        shopName={shop.shop_name}
        contactEmail={contactConfig.email}
        contactPhone={contactConfig.phone}
        address={contactConfig.address}
        socialLinks={shop.social_links}
      />
    </ShopThemeProvider>
  );
};

export default PublicShopContact;
