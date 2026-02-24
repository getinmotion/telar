import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, Eye, Edit, Rocket, ArrowLeft, ArrowRight, Wand2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { ModernHeroSlider } from '@/components/shop/ModernHeroSlider';
import { HeroSlideUploader } from '@/components/shop/HeroSlideUploader';
import { useAutoHeroGeneration } from '@/hooks/useAutoHeroGeneration';
import { BrandValidationModal } from '@/components/shop/BrandValidationModal';
import { AIGenerationConfirmModal, ManualSlideContent } from '@/components/shop/AIGenerationConfirmModal';
import { EventBus } from '@/utils/eventBus';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

type WizardStep = 'generate' | 'preview' | 'edit' | 'publish';

interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSliderWizardProps {
  shopId: string;
  existingSlides?: HeroSlide[];
  onComplete?: () => void;
}

export const HeroSliderWizard: React.FC<HeroSliderWizardProps> = ({
  shopId,
  existingSlides,
  onComplete
}) => {
  const [step, setStep] = useState<WizardStep>('generate');
  const [slides, setSlides] = useState<HeroSlide[]>(existingSlides || []);
  const [autoplay, setAutoplay] = useState(true);
  const [duration, setDuration] = useState(5);
  const [showBrandValidation, setShowBrandValidation] = useState(false);
  const [brandValidation, setBrandValidation] = useState({ 
    completionPercentage: 0, 
    missingFields: [] as string[] 
  });
  const [shop, setShop] = useState<any>(null);
  const [showAIConfirmModal, setShowAIConfirmModal] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState<{
    isAddingNew: boolean;
    referenceText?: string;
    referenceImageFile?: File;
  } | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateHeroSlides, isGenerating } = useAutoHeroGeneration();

  // Guardar progreso en localStorage
  useEffect(() => {
    if (slides.length > 0) {
      localStorage.setItem(`hero_wizard_${shopId}`, JSON.stringify({
        step,
        slides,
        autoplay,
        duration,
        timestamp: Date.now()
      }));
    }
  }, [step, slides, autoplay, duration, shopId]);

  // Restaurar progreso al montar
  useEffect(() => {
    const saved = localStorage.getItem(`hero_wizard_${shopId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Solo restaurar si es reciente (menos de 24 horas)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          setSlides(data.slides);
          setStep(data.step);
          setAutoplay(data.autoplay);
          setDuration(data.duration);
        }
      } catch (e) {
        console.error('Error restaurando progreso:', e);
      }
    }
  }, [shopId]);

  useEffect(() => {
    loadShopData();
  }, [shopId]);

  const loadShopData = async () => {
    const { data, error } = await supabase
      .from('artisan_shops')
      .select('*')
      .eq('id', shopId)
      .single();

    if (!error && data) {
      setShop(data);
      
      // Si tiene slides existentes, ir directo a preview
      if (data.hero_config && typeof data.hero_config === 'object' && 'slides' in data.hero_config) {
        const heroConfig = data.hero_config as any;
        if (Array.isArray(heroConfig.slides) && heroConfig.slides.length > 0) {
          setSlides(heroConfig.slides);
          setAutoplay(heroConfig.autoplay ?? true);
          setDuration((heroConfig.duration || 5000) / 1000);
          setStep('preview');
        }
      }
    }
  };

  const handleGenerateClick = () => {
    // Abrir modal de confirmación antes de generar
    setPendingGeneration({ isAddingNew: false });
    setShowAIConfirmModal(true);
  };

  const handleAddSlideClick = () => {
    if (slides.length >= 3) {
      toast({
        title: 'Máximo alcanzado',
        description: 'Solo puedes tener hasta 3 slides',
        variant: 'destructive'
      });
      return;
    }
    
    setPendingGeneration({ isAddingNew: true });
    setShowAIConfirmModal(true);
  };

  const handleAIConfirm = async (
    mode: 'ai' | 'upload', 
    references?: { text?: string; imageFile?: File },
    manualContent?: ManualSlideContent
  ) => {
    setShowAIConfirmModal(false);
    
    const isAddingNew = pendingGeneration?.isAddingNew || false;

    // Handle manual upload mode (no AI)
    if (mode === 'upload' && manualContent) {
      try {
        // Optimize image before upload
        const file = manualContent.imageFile;
        console.log('[HeroSliderWizard] Optimizing manual upload image...');
        const optimizedFile = await optimizeImage(file, ImageOptimizePresets.hero);
        
        const fileName = `${shopId}/hero-manual-${Date.now()}.${optimizedFile.name.split('.').pop()}`;
        
        const { error: uploadError } = await supabase.storage
          .from('hero-images')
          .upload(fileName, optimizedFile, {
            contentType: optimizedFile.type,
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hero-images')
          .getPublicUrl(fileName);

        const newSlide: HeroSlide = {
          id: `slide-${Date.now()}`,
          imageUrl: publicUrl,
          title: manualContent.title,
          subtitle: manualContent.subtitle,
          ctaText: manualContent.ctaText || 'Ver más',
          ctaLink: '#productos'
        };

        if (isAddingNew) {
          setSlides([...slides, newSlide]);
          toast({
            title: '✅ Slide Agregado',
            description: 'Tu imagen ha sido subida exitosamente',
          });
        } else {
          setSlides([newSlide]);
          setStep('preview');
          toast({
            title: '✅ Slide Creado',
            description: 'Tu imagen ha sido subida exitosamente',
          });
        }
        
        setPendingGeneration(null);
        return;
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Error',
          description: 'No se pudo subir la imagen',
          variant: 'destructive'
        });
        setPendingGeneration(null);
        return;
      }
    }
    
    // AI generation mode
    const count = 1;
    
    console.log('[HeroWizard] Iniciando generación IA:', { 
      shopId, 
      count,
      mode,
      hasReferences: !!references
    });
    
    const result = await generateHeroSlides(shopId, { 
      autoSave: false,
      count,
      referenceText: references?.text,
      referenceImageFile: references?.imageFile
    });
    
    console.log('[HeroWizard] Resultado de generación:', {
      success: result.success,
      slideCount: result.slides?.length,
      needsBrandInfo: result.needsBrandInfo,
      missingFields: result.missingFields
    });
    
    if (result.needsBrandInfo) {
      setShowBrandValidation(true);
      setBrandValidation({
        completionPercentage: result.completionPercentage || 0,
        missingFields: result.missingFields || []
      });
      setPendingGeneration(null);
      return;
    }

    if (result.success && result.slides) {
      if (isAddingNew) {
        setSlides([...slides, ...result.slides]);
        toast({
          title: '✨ Slide Agregado',
          description: 'Nuevo slide generado exitosamente',
        });
      } else {
        setSlides(result.slides);
        setStep('preview');
        toast({
          title: '✨ Hero Slider Generado',
          description: '1 slide creado con IA',
        });
      }
    }
    
    setPendingGeneration(null);
  };


  const handleSlideUpdate = (index: number, field: keyof HeroSlide, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSlides(items);
  };

  const handleDeleteSlide = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    
    toast({
      title: 'Slide eliminado',
      description: newSlides.length === 0 
        ? 'Todos los slides han sido eliminados' 
        : 'El slide ha sido eliminado exitosamente'
    });
    
    // Si se eliminaron todos, volver al paso de generación
    if (newSlides.length === 0) {
      setStep('generate');
    }
  };

  const handleDeleteAllSlides = () => {
    setSlides([]);
    setStep('generate');
    localStorage.removeItem(`hero_wizard_${shopId}`);
    toast({
      title: 'Slides eliminados',
      description: 'Todos los slides han sido eliminados. Puedes comenzar de nuevo.'
    });
  };

  const handleRegenerateImage = async (index: number) => {
    toast({
      title: '🎨 Regenerando imagen...',
      description: 'Generando nueva imagen con IA'
    });

    try {
      const slide = slides[index];
      const { data: imageData, error } = await supabase.functions.invoke(
        'generate-hero-slide-image',
        {
          body: {
            title: slide.title,
            subtitle: slide.subtitle,
            shopName: shop.shop_name,
            craftType: shop.craft_type,
            brandColors: shop.primary_colors || [],
            brandClaim: shop.brand_claim || '',
            slideIndex: index
          }
        }
      );

      if (error) throw error;

      if (imageData?.imageBase64) {
        const base64Data = imageData.imageBase64.split(',')[1] || imageData.imageBase64;
        const fileName = `${shopId}/hero-regenerated-${Date.now()}-${index}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('hero-images')
          .upload(fileName, 
            Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)), 
            {
              contentType: 'image/png',
              upsert: true
            }
          );

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hero-images')
          .getPublicUrl(fileName);

        handleSlideUpdate(index, 'imageUrl', publicUrl);
        
        toast({
          title: '✅ Imagen Regenerada',
          description: 'Se generó una nueva imagen exitosamente'
        });
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo regenerar la imagen',
        variant: 'destructive'
      });
    }
  };

  const handlePublish = async () => {
    try {
      const { error } = await supabase
        .from('artisan_shops')
        .update({
          banner_url: slides[0]?.imageUrl || null,
          hero_config: {
            slides: slides.map(s => ({
              id: s.id,
              imageUrl: s.imageUrl,
              title: s.title,
              subtitle: s.subtitle,
              ctaText: s.ctaText || 'Ver productos',
              ctaLink: s.ctaLink || '#productos'
            })),
            autoplay,
            duration: duration * 1000
          }
        })
        .eq('id', shopId);

      if (error) throw error;

      // Limpiar localStorage después de publicar exitosamente
      localStorage.removeItem(`hero_wizard_${shopId}`);
      
      EventBus.publish('shop.customized', { shopId });
      
      toast({
        title: '🚀 Hero Slider Publicado',
        description: 'Tu hero slider está activo en tu tienda pública'
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error publishing hero:', error);
      toast({
        title: 'Error',
        description: 'No se pudo publicar el hero slider',
        variant: 'destructive'
      });
    }
  };

  const stepProgress = {
    generate: 25,
    preview: 50,
    edit: 75,
    publish: 100
  };

  const stepTitles = {
    generate: 'Generar Hero Slider',
    preview: 'Vista Previa',
    edit: 'Ajustes Finales',
    publish: 'Publicar'
  };

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{stepTitles[step]}</h2>
            <p className="text-muted-foreground">
              {step === 'generate' && '3 slides profesionales basados en tu marca y productos'}
              {step === 'preview' && 'Revisa cómo se verá tu hero slider'}
              {step === 'edit' && 'Una oportunidad para personalizar tus slides'}
              {step === 'publish' && 'Activa tu hero slider en la tienda pública'}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {Object.keys(stepTitles).indexOf(step) + 1} / 4
          </Badge>
        </div>
        
        <Progress value={stepProgress[step]} className="h-2" />
        
        <div className="flex gap-2 text-sm">
          {Object.entries(stepTitles).map(([key, title], index) => (
            <div key={key} className="flex items-center gap-2">
              <span className={step === key ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                {title}
              </span>
              {index < Object.keys(stepTitles).length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso */}
      {step === 'generate' && (
        <div className="space-y-6">
          <Card className="p-8">
            <div className="text-center mb-6">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Genera tu Primer Slide con IA</h3>
              <p className="text-muted-foreground">
                Genera un slide profesional basado en tu marca. Podrás agregar más después (máximo 3 slides).
              </p>
              <AIDisclaimer variant="banner" context="generate" className="mt-4" />
            </div>

            <Button 
              size="lg" 
              onClick={handleGenerateClick} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generar Primer Slide
                </>
              )}
            </Button>
          </Card>
        </div>
      )}

      {step === 'preview' && slides.length > 0 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Vista Previa</h3>
            <div className="rounded-lg overflow-hidden">
              <ModernHeroSlider
                slides={slides.map((s, idx) => ({
                  id: s.id || `slide-${idx}`,
                  image: s.imageUrl,
                  title: s.title,
                  subtitle: s.subtitle,
                  ctaText: s.ctaText,
                  ctaLink: s.ctaLink
                }))}
                autoplay={false}
                duration={5000}
                variant="compact"
              />
            </div>
          </Card>

          <div className="space-y-3">
            {slides.length < 3 && (
              <Button
                onClick={handleAddSlideClick}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Agregar otro slide ({slides.length}/3)
                  </>
                )}
              </Button>
            )}
            
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleGenerateClick}>
                <Wand2 className="w-4 h-4 mr-2" />
                Regenerar Todo
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setStep('edit')}>
                <Edit className="w-4 h-4 mr-2" />
                Quiero hacer ajustes
              </Button>
              <Button className="flex-1" onClick={() => setStep('publish')}>
                <Rocket className="w-4 h-4 mr-2" />
                Me gusta, publicar
              </Button>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllSlides}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar todos los slides
            </Button>
          </div>
        </div>
      )}

      {step === 'edit' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Editar Slides</h3>
              <Badge variant="outline">Arrastra para reordenar</Badge>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {slides.map((slide, index) => (
                      <Draggable key={slide.id} draggableId={slide.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-6 relative"
                          >
                            {/* Botón de eliminar */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteSlide(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>

                            <div className="grid md:grid-cols-[200px,1fr] gap-6">
                              <div className="space-y-2">
                                <img
                                  src={slide.imageUrl}
                                  alt={slide.title}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleRegenerateImage(index)}
                                >
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Regenerar
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label>Título</Label>
                                  <Input
                                    value={slide.title}
                                    onChange={(e) => handleSlideUpdate(index, 'title', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Subtítulo</Label>
                                  <Textarea
                                    value={slide.subtitle}
                                    onChange={(e) => handleSlideUpdate(index, 'subtitle', e.target.value)}
                                    rows={2}
                                  />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Texto CTA (opcional)</Label>
                                    <Input
                                      value={slide.ctaText || ''}
                                      onChange={(e) => handleSlideUpdate(index, 'ctaText', e.target.value)}
                                      placeholder="Ver productos"
                                    />
                                  </div>
                                  <div>
                                    <Label>Link CTA (opcional)</Label>
                                    <Input
                                      value={slide.ctaLink || ''}
                                      onChange={(e) => handleSlideUpdate(index, 'ctaLink', e.target.value)}
                                      placeholder="#productos"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Agregar slide adicional */}
            {shop && (
              <div className="mt-6">
                <HeroSlideUploader
                  onSlideCreated={(newSlide) => {
                    setSlides([...slides, {
                      id: newSlide.id,
                      imageUrl: newSlide.image,
                      title: newSlide.title,
                      subtitle: newSlide.subtitle,
                      ctaText: newSlide.ctaText,
                      ctaLink: newSlide.ctaLink
                    }]);
                  }}
                  shopContext={{
                    shopName: shop.shop_name,
                    craftType: shop.craft_type,
                    brandClaim: shop.brand_claim || '',
                    brandColors: shop.primary_colors || []
                  }}
                />
              </div>
            )}
          </Card>

          <div className="space-y-3">
            {slides.length < 3 && (
              <Button
                onClick={handleAddSlideClick}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Agregar otro slide ({slides.length}/3)
                  </>
                )}
              </Button>
            )}
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('preview')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button className="flex-1" onClick={() => setStep('publish')}>
                Guardar cambios y continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllSlides}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar todos los slides
            </Button>
          </div>
        </div>
      )}

      {step === 'publish' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Vista Previa Final</h3>
            <div className="rounded-lg overflow-hidden mb-6">
              <ModernHeroSlider
                slides={slides.map((s, idx) => ({
                  id: s.id || `slide-${idx}`,
                  image: s.imageUrl,
                  title: s.title,
                  subtitle: s.subtitle,
                  ctaText: s.ctaText,
                  ctaLink: s.ctaLink
                }))}
                autoplay={autoplay}
                duration={duration * 1000}
                variant="compact"
              />
            </div>

            <div className="space-y-4 max-w-md">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoplay"
                  checked={autoplay}
                  onCheckedChange={(checked) => setAutoplay(checked as boolean)}
                />
                <Label htmlFor="autoplay" className="cursor-pointer">
                  Activar autoplay (recomendado)
                </Label>
              </div>

              <div>
                <Label htmlFor="duration">Duración por slide (segundos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="3"
                  max="10"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('edit')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a editar
            </Button>
            <Button size="lg" className="flex-1" onClick={handlePublish}>
              <Rocket className="w-5 h-5 mr-2" />
              Publicar Hero Slider
            </Button>
          </div>
        </div>
      )}

      {/* Brand Validation Modal */}
      {showBrandValidation && shop && (
        <BrandValidationModal
          open={showBrandValidation}
          onClose={() => setShowBrandValidation(false)}
          completionPercentage={brandValidation.completionPercentage}
          missingFields={brandValidation.missingFields}
        />
      )}

      {/* AI Generation Confirmation Modal */}
      <AIGenerationConfirmModal
        isOpen={showAIConfirmModal}
        onClose={() => {
          setShowAIConfirmModal(false);
          setPendingGeneration(null);
        }}
        onConfirm={handleAIConfirm}
        slideTitle={pendingGeneration?.isAddingNew ? `Slide ${slides.length + 1}` : 'Primer Slide'}
        slideSubtitle={shop?.shop_name || ''}
      />
    </div>
  );
};
