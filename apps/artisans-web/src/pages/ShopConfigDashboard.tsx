import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Wand2, Plus, X, GripVertical, ChevronDown, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ShopPreview } from '@/components/shop/ShopPreview';
import { HeroSlideUploader } from '@/components/shop/HeroSlideUploader';
import { syncBrandToShop } from '@/utils/syncBrandToShop';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useAutoHeroGeneration } from '@/hooks/useAutoHeroGeneration';
import { BrandValidationModal } from '@/components/shop/BrandValidationModal';
import { getArtisanShopByUserId, updateArtisanShop } from '@/services/artisanShops.actions';

const ShopConfigDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandValidation, setBrandValidation] = useState<any>(null);
  
  const { generateHeroSlides, isGenerating: isGeneratingHero } = useAutoHeroGeneration();
  
  // Hero config state
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [showManualHero, setShowManualHero] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    image: '',
    ctaText: '',
    ctaLink: ''
  });

  // About config state
  const [aboutContent, setAboutContent] = useState({
    title: '',
    story: '',
    mission: '',
    vision: '',
    values: []
  });
  const [showManualAbout, setShowManualAbout] = useState(false);

  // Contact config state
  const [contactConfig, setContactConfig] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    hours: '',
    map_embed: '',
    welcomeMessage: '',
    formIntroText: ''
  });

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await getArtisanShopByUserId(user.id);
      if (!data) throw new Error('Shop not found');

      setShop(data);
      const heroConfig = data.heroConfig as any;
      setHeroSlides(heroConfig?.slides || []);
      
      const aboutData = data.aboutContent as any;
      setAboutContent(aboutData || {
        title: '',
        story: data.story || '',
        mission: '',
        vision: '',
        values: []
      });
      
      const contactData = data.contactConfig as any;
      const contactInfo = data.contact_info as any;
      setContactConfig(contactData || {
        email: contactInfo?.email || '',
        phone: contactInfo?.phone || '',
        whatsapp: contactInfo?.whatsapp || '',
        address: contactInfo?.address || '',
        hours: '',
        map_embed: '',
        welcomeMessage: '',
        formIntroText: ''
      });
    } catch (error: any) {
      console.error('Error fetching shop:', error);
      toast.error('Error al cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const saveHeroConfig = async () => {
    setSaving(true);
    try {
      await updateArtisanShop(shop.id, {
        heroConfig: {
          slides: heroSlides,
          autoplay: true,
          duration: 5000
        }
      });

      toast.success('Configuración del hero guardada');
    } catch (error: any) {
      console.error('Error saving hero:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const saveAboutContent = async () => {
    setSaving(true);
    try {
      await updateArtisanShop(shop.id, { 
        aboutContent: aboutContent 
      });

      toast.success('Contenido de "Nosotros" guardado');
    } catch (error: any) {
      console.error('Error saving about:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const saveContactConfig = async () => {
    setSaving(true);
    try {
      await updateArtisanShop(shop.id, { 
        contactConfig: contactConfig 
      });

      toast.success('Configuración de contacto guardada');
    } catch (error: any) {
      console.error('Error saving contact:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const generateCompleteHeroWithAI = async () => {
    if (!shop?.id) return;
    
    const result = await generateHeroSlides(shop.id, { autoSave: false });
    
    if (result.needsBrandInfo) {
      setBrandValidation({
        missingFields: result.missingFields || [],
        completionPercentage: result.completionPercentage || 0
      });
      setShowBrandModal(true);
      return;
    }
    
    if (result.success && result.slides) {
      const formattedSlides = result.slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        ctaText: slide.ctaText,
        ctaLink: slide.ctaLink,
        image: slide.imageUrl
      }));
      setHeroSlides(formattedSlides);
      toast.success('✨ Hero slider generado con IA');
    }
  };

  const generateAboutWithAI = async () => {
    setSaving(true);
    try {
      toast.info('Generando contenido "Nosotros" con IA...');
      
      const { data, error } = await supabase.functions.invoke('generate-shop-about', {
        body: {
          shopName: shop.shop_name,
          craftType: shop.craft_type,
          region: shop.region,
          currentStory: shop.story,
          brandClaim: shop.brand_claim || '',
          brandColors: shop.primary_colors || []
        }
      });

      if (error) throw error;

      setAboutContent(data);
      toast.success('✨ Contenido generado con IA');
    } catch (error: any) {
      console.error('Error generating about:', error);
      toast.error('Error al generar contenido');
    } finally {
      setSaving(false);
    }
  };

  const generateContactWithAI = async () => {
    setSaving(true);
    try {
      toast.info('Generando textos de contacto con IA...');
      
      const { data, error } = await supabase.functions.invoke('generate-shop-contact', {
        body: {
          shopName: shop.shop_name,
          craftType: shop.craft_type,
          region: shop.region,
          brandClaim: shop.brand_claim || ''
        }
      });

      if (error) throw error;

      setContactConfig({
        ...contactConfig,
        welcomeMessage: data.welcomeMessage,
        formIntroText: data.formIntroText,
        hours: data.suggestedHours
      });
      
      toast.success('✨ Textos de contacto generados con IA');
    } catch (error: any) {
      console.error('Error generating contact:', error);
      toast.error('Error al generar textos de contacto');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncFromBrandWizard = async () => {
    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await syncBrandToShop(user.id);
      
      if (result.success) {
        toast.success(result.message);
        await fetchShop(); // Recargar tienda
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error syncing:', error);
      toast.error('Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const addSlide = () => {
    if (!newSlide.title || !newSlide.subtitle) {
      toast.error('Completa título y subtítulo');
      return;
    }

    setHeroSlides([...heroSlides, { ...newSlide, id: Date.now().toString() }]);
    setNewSlide({ title: '', subtitle: '', image: '', ctaText: '', ctaLink: '' });
  };

  const removeSlide = (id: string) => {
    setHeroSlides(heroSlides.filter(slide => slide.id !== id));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(heroSlides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setHeroSlides(items);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!shop) {
    return <div className="min-h-screen flex items-center justify-center">Tienda no encontrada</div>;
  }

  const publicShopUrl = `/tienda/${shop.slug}`;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <Helmet>
        <title>Configurar Tienda - {shop.shop_name}</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/mi-tienda')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Taller Digital
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">✨ Configurar Tienda con IA</h1>
          <Button
            variant="outline"
            onClick={() => window.open(publicShopUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Tienda Pública
          </Button>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero">Hero Slider</TabsTrigger>
            <TabsTrigger value="about">Nosotros</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
            <TabsTrigger value="brand">Marca & Preview</TabsTrigger>
          </TabsList>

          {/* Hero Configuration - IA FIRST */}
          <TabsContent value="hero" className="space-y-6">
            <Card className="p-6">
              <div className="text-center space-y-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-2xl font-bold">Hero Slider Inteligente</h2>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Genera automáticamente un hero slider completo con 3 slides profesionales basados en tu tienda y marca
                </p>
                <Button 
                  size="lg"
                  onClick={generateCompleteHeroWithAI} 
                  disabled={saving}
                  className="w-full max-w-md mx-auto"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  {heroSlides.length > 0 ? 'Regenerar Hero Slider con IA' : 'Generar Hero Slider con IA'}
                </Button>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-4 my-8">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">O agrega slides individualmente</span>
                <Separator className="flex-1" />
              </div>

              {/* Hero Slide Uploader */}
              <HeroSlideUploader
                onSlideCreated={(slide) => setHeroSlides([...heroSlides, slide])}
                shopContext={{
                  shopName: shop.shop_name,
                  craftType: shop.craft_type || 'artesanía',
                  brandClaim: shop.brand_claim || '',
                  brandColors: shop.primary_colors || []
                }}
              />

              {heroSlides.length > 0 && (
                <div className="mb-6 space-y-4">
                  <h3 className="font-semibold text-lg">Slides Actuales:</h3>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="slides">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {heroSlides.map((slide, index) => (
                            <Draggable key={slide.id} draggableId={slide.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="bg-muted p-4 rounded-lg flex items-start gap-4"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold">{slide.title}</h3>
                                    <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                                    {slide.ctaText && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        CTA: {slide.ctaText}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSlide(slide.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  
                  <Button onClick={saveHeroConfig} disabled={saving} className="w-full">
                    Guardar Configuración
                  </Button>
                </div>
              )}

              <Collapsible open={showManualHero} onOpenChange={setShowManualHero}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span>⚙️ Configuración Manual Avanzada</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showManualHero ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Agregar Slide Manualmente</h3>
                    <Input
                      placeholder="Título"
                      value={newSlide.title}
                      onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                    />
                    <Input
                      placeholder="Subtítulo"
                      value={newSlide.subtitle}
                      onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    />
                    <Input
                      placeholder="URL de imagen"
                      value={newSlide.image}
                      onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                    />
                    <Input
                      placeholder="Texto del botón (opcional)"
                      value={newSlide.ctaText}
                      onChange={(e) => setNewSlide({ ...newSlide, ctaText: e.target.value })}
                    />
                    <Input
                      placeholder="Enlace del botón (opcional)"
                      value={newSlide.ctaLink}
                      onChange={(e) => setNewSlide({ ...newSlide, ctaLink: e.target.value })}
                    />
                    <Button onClick={addSlide}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Slide
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </TabsContent>

          {/* About Configuration - IA FIRST */}
          <TabsContent value="about" className="space-y-6">
            <Card className="p-6">
              <div className="text-center space-y-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-2xl font-bold">Sección "Nosotros" Inteligente</h2>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Genera automáticamente contenido profesional para tu sección Nosotros: historia, misión, visión y valores
                </p>
                <Button 
                  size="lg"
                  onClick={generateAboutWithAI} 
                  disabled={saving}
                  className="w-full max-w-md mx-auto"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  {aboutContent.story ? 'Regenerar Contenido con IA' : 'Generar Contenido con IA'}
                </Button>
              </div>

              {aboutContent.story && (
                <div className="space-y-4 mb-6">
                  <Card className="p-6 bg-muted/50">
                    <h3 className="font-semibold text-lg mb-3">{aboutContent.title || 'Sobre Nosotros'}</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Historia:</h4>
                        <p className="text-sm">{aboutContent.story}</p>
                      </div>
                      {aboutContent.mission && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Misión:</h4>
                          <p className="text-sm">{aboutContent.mission}</p>
                        </div>
                      )}
                      {aboutContent.vision && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Visión:</h4>
                          <p className="text-sm">{aboutContent.vision}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                  
                  <Button onClick={saveAboutContent} disabled={saving} className="w-full">
                    Guardar Contenido
                  </Button>
                </div>
              )}

              <Collapsible open={showManualAbout} onOpenChange={setShowManualAbout}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span>✏️ Editar Manualmente</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showManualAbout ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <Input
                        value={aboutContent.title}
                        onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Historia</label>
                      <Textarea
                        value={aboutContent.story}
                        onChange={(e) => setAboutContent({ ...aboutContent, story: e.target.value })}
                        rows={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Misión</label>
                      <Textarea
                        value={aboutContent.mission}
                        onChange={(e) => setAboutContent({ ...aboutContent, mission: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Visión</label>
                      <Textarea
                        value={aboutContent.vision}
                        onChange={(e) => setAboutContent({ ...aboutContent, vision: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </TabsContent>

          {/* Contact Configuration - CON IA */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="p-6">
              <div className="text-center space-y-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-2xl font-bold">Sección de Contacto Inteligente</h2>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Genera textos de bienvenida y formulario personalizados para tu página de contacto
                </p>
                <Button 
                  size="lg"
                  onClick={generateContactWithAI} 
                  disabled={saving}
                  className="w-full max-w-md mx-auto"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generar Textos de Contacto con IA
                </Button>
              </div>

              {contactConfig.welcomeMessage && (
                <Card className="p-6 bg-muted/50 mb-6">
                  <h3 className="font-semibold mb-3">Vista Previa:</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Mensaje de Bienvenida:</span>
                      <p className="text-sm mt-1">{contactConfig.welcomeMessage}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Intro del Formulario:</span>
                      <p className="text-sm mt-1">{contactConfig.formIntroText}</p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Información de Contacto</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={contactConfig.email}
                    onChange={(e) => setContactConfig({ ...contactConfig, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <Input
                    value={contactConfig.phone}
                    onChange={(e) => setContactConfig({ ...contactConfig, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp</label>
                  <Input
                    value={contactConfig.whatsapp}
                    onChange={(e) => setContactConfig({ ...contactConfig, whatsapp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dirección</label>
                  <Input
                    value={contactConfig.address}
                    onChange={(e) => setContactConfig({ ...contactConfig, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Horario</label>
                  <Input
                    value={contactConfig.hours}
                    onChange={(e) => setContactConfig({ ...contactConfig, hours: e.target.value })}
                    placeholder="Lun-Vie 9:00-18:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Google Maps Embed</label>
                  <Textarea
                    value={contactConfig.map_embed}
                    onChange={(e) => setContactConfig({ ...contactConfig, map_embed: e.target.value })}
                    placeholder="Pega el código embed de Google Maps"
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={saveContactConfig} disabled={saving} className="mt-6 w-full">
                Guardar Configuración
              </Button>
            </Card>
          </TabsContent>

          {/* Brand & Preview Tab */}
          <TabsContent value="brand" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Configuración de Marca</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu identidad de marca y visualiza cómo se verá en la tienda
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/brand-wizard')}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ir al Brand Wizard Completo
                </Button>

                <Separator />

                <Button
                  variant="outline"
                  onClick={handleSyncFromBrandWizard}
                  disabled={syncing}
                  className="w-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Sincronizar desde Brand Wizard
                </Button>

                <Separator />

                {/* Logo Section */}
                <div>
                  <h3 className="font-medium mb-3">Logo</h3>
                  {shop.logo_url ? (
                    <div className="flex items-center gap-4">
                      <img 
                        src={shop.logo_url} 
                        alt="Logo" 
                        className="h-20 w-20 object-contain border rounded-lg p-2"
                      />
                      <div className="text-sm text-muted-foreground">
                        Logo configurado desde Brand Wizard
                      </div>
                    </div>
                  ) : (
                    <Card className="p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-3">
                        No hay logo configurado. Completa el Brand Wizard para establecer tu logo.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/dashboard/brand-wizard')}
                      >
                        Ir al Brand Wizard
                      </Button>
                    </Card>
                  )}
                </div>

                {/* Claim Section */}
                {shop.brand_claim && (
                  <div>
                    <h3 className="font-medium mb-3">Claim de Marca</h3>
                    <Card className="p-4 bg-muted/50">
                      <p className="italic">"{shop.brand_claim}"</p>
                    </Card>
                  </div>
                )}

                {/* Colors Section */}
                <div>
                  <h3 className="font-medium mb-3">Paleta de Colores</h3>
                  {(shop.primary_colors?.length > 0 || shop.secondary_colors?.length > 0) ? (
                    <div className="space-y-4">
                      {shop.primary_colors?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Colores Primarios</h4>
                          <div className="flex gap-3">
                            {shop.primary_colors.map((color: string, index: number) => (
                              <div key={index} className="text-center">
                                <div
                                  className="w-16 h-16 rounded-lg shadow-md mb-2"
                                  style={{ backgroundColor: color }}
                                />
                                <p className="text-xs font-mono">{color}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {shop.secondary_colors?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Colores Secundarios</h4>
                          <div className="flex gap-3">
                            {shop.secondary_colors.map((color: string, index: number) => (
                              <div key={index} className="text-center">
                                <div
                                  className="w-16 h-16 rounded-lg shadow-md mb-2"
                                  style={{ backgroundColor: color }}
                                />
                                <p className="text-xs font-mono">{color}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card className="p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-3">
                        No hay colores configurados. Completa el Brand Wizard para establecer tu paleta.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/dashboard/brand-wizard')}
                      >
                        Ir al Brand Wizard
                      </Button>
                    </Card>
                  )}
                </div>

                {/* Shop Preview */}
                <div>
                  <h3 className="font-medium mb-4">Vista Previa de Tu Tienda</h3>
                  <ShopPreview
                    primaryColors={shop.primary_colors}
                    secondaryColors={shop.secondary_colors}
                    logoUrl={shop.logo_url}
                    brandClaim={shop.brand_claim}
                    shopName={shop.shop_name}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Brand Validation Modal */}
      <BrandValidationModal
        open={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        missingFields={brandValidation?.missingFields || []}
        completionPercentage={brandValidation?.completionPercentage || 0}
      />
    </div>
  );
};

export default ShopConfigDashboard;
