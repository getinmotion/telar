import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Heart, Sparkles, Users, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { ShopThemeProvider } from '@/contexts/ShopThemeContext';
import { ShopNavbar } from '@/components/shop/ShopNavbar';
import { ShopFooter } from '@/components/shop/ShopFooter';
import { ArtisanProfileData, LEARNED_FROM_OPTIONS } from '@/types/artisanProfile';

export const PublicArtisanProfile: React.FC = () => {
  const { shopSlug } = useParams();
  const location = useLocation();
  const [shop, setShop] = useState<any>(null);
  const [profile, setProfile] = useState<ArtisanProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const previewParam = new URLSearchParams(location.search).get('preview') === 'true' ? '?preview=true' : '';

  useEffect(() => {
    const fetchShop = async () => {
      if (!shopSlug) return;

      const data = await getArtisanShopBySlug(shopSlug);

      if (data) {
        setShop(data);
        const shopAny = data as any;
        if (shopAny.artisanProfile) {
          setProfile(shopAny.artisan_profile as ArtisanProfileData);
        }
      }
      setLoading(false);
    };

    fetchShop();
  }, [shopSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!shop || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground mb-4">Perfil no encontrado</p>
        <Link to={`/tienda/${shopSlug}${previewParam}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Button>
        </Link>
      </div>
    );
  }

  const learnedFromLabel = LEARNED_FROM_OPTIONS.find(o => o.value === profile.learnedFrom)?.label || profile.learnedFrom;
  const story = profile.generatedStory;

  return (
    <ShopThemeProvider theme={shop}>
      <div className="min-h-screen bg-background">
        <ShopNavbar 
          shopName={shop.shop_name} 
          logoUrl={shop.logo_url}
          shopSlug={shop.shop_slug}
        />

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            {profile.artisanPhoto && (
              <img 
                src={profile.artisanPhoto}
                alt={profile.artisanName}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur">
              Perfil Artesanal
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              {story?.heroTitle || profile.artisticName || profile.artisanName}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6">
              {story?.heroSubtitle || `Artesano desde los ${profile.startAge} años`}
            </p>
            {profile.artisanVideo && (
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="w-5 h-5" />
                Ver presentación
              </Button>
            )}
          </motion.div>
        </section>

        {/* Origin Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-accent" />
                  <span className="text-sm font-medium text-accent uppercase tracking-wider">Mi Origen</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">De dónde vengo</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {story?.originNarrative || profile.culturalMeaning}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Aprendí de: {learnedFromLabel}</span>
                </div>
                {profile.learnedFromDetail && (
                  <p className="mt-4 text-muted-foreground italic border-l-2 border-accent pl-4">
                    "{profile.learnedFromDetail}"
                  </p>
                )}
              </div>
              {profile.familyPhotos.length > 0 && (
                <div className="relative">
                  <img 
                    src={profile.familyPhotos[0]}
                    alt="Mi origen"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Cultural History Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-golden" />
                <span className="text-sm font-medium text-golden uppercase tracking-wider">Mi Cultura</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Tradición y Raíces</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl p-6 shadow-lg"
              >
                <h3 className="font-semibold mb-3">Historia de mi tradición</h3>
                <p className="text-muted-foreground">{profile.culturalHistory}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl p-6 shadow-lg"
              >
                <h3 className="font-semibold mb-3">Mi conexión cultural</h3>
                <p className="text-muted-foreground">{profile.ethnicRelation}</p>
              </motion.div>

              {profile.ancestralKnowledge && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 bg-gradient-to-r from-golden/10 to-accent/10 rounded-2xl p-6"
                >
                  <h3 className="font-semibold mb-3">Conocimientos ancestrales</h3>
                  <p className="text-muted-foreground">{profile.ancestralKnowledge}</p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Workshop Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">Mi Taller</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Donde nace el arte</h2>
              {profile.workshopAddress && (
                <p className="text-muted-foreground">{profile.workshopAddress}</p>
              )}
            </motion.div>

            <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {profile.workshopDescription}
            </p>

            {profile.workshopPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.workshopPhotos.map((photo, i) => (
                  <motion.img
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    src={photo}
                    alt={`Taller ${i + 1}`}
                    className="w-full h-48 md:h-64 object-cover rounded-xl"
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Craft Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-accent/5">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Mi Arte</h2>
              <p className="text-lg text-muted-foreground">{profile.uniqueness}</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="text-center p-6 bg-background rounded-2xl shadow">
                <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-3">Técnicas</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {profile.techniques.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </div>

              <div className="text-center p-6 bg-background rounded-2xl shadow">
                <Heart className="w-8 h-8 text-golden mx-auto mb-3" />
                <h3 className="font-semibold mb-3">Materiales</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {profile.materials.map((m) => (
                    <Badge key={m} variant="outline">{m}</Badge>
                  ))}
                </div>
              </div>

              <div className="text-center p-6 bg-background rounded-2xl shadow">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-3">Tiempo</h3>
                <p className="text-muted-foreground">{profile.averageTime}</p>
              </div>
            </div>

            {profile.craftMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-background rounded-2xl shadow-lg border-t-4 border-accent"
              >
                <p className="text-xl italic text-foreground">"{profile.craftMessage}"</p>
                <p className="mt-4 text-muted-foreground">— {profile.artisanName}</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Human Gallery */}
        {profile.workingPhotos.length > 0 && (
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-4">Galería</h2>
                <p className="text-muted-foreground">El arte en proceso</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...profile.workingPhotos, ...profile.communityPhotos].map((photo, i) => (
                  <motion.img
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    src={photo}
                    alt={`Galería ${i + 1}`}
                    className="w-full h-40 md:h-56 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 px-4 bg-primary/5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Conoce mis creaciones</h2>
            <p className="text-muted-foreground mb-6">
              Cada pieza lleva mi historia y mi tradición
            </p>
            <Link to={`/tienda/${shopSlug}${previewParam}`}>
              <Button size="lg">
                Ver productos
              </Button>
            </Link>
          </div>
        </section>

        <ShopFooter shopName={shop.shop_name} />
      </div>
    </ShopThemeProvider>
  );
};

export default PublicArtisanProfile;
