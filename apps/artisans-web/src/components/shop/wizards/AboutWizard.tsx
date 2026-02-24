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
import { Sparkles, Loader2, Rocket, ArrowLeft, ArrowRight, Wand2, Plus, X } from 'lucide-react';
import { VoiceInput } from '@/components/ui/voice-input';
import { EventBus } from '@/utils/eventBus';
import { useAIRefinement } from '@/components/shop/ai-upload/hooks/useAIRefinement';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';

type WizardStep = 'generate' | 'edit' | 'publish';

interface AboutContent {
  title: string;
  story: string;
  mission: string;
  vision: string;
  values: string[];
}

interface AboutWizardProps {
  shopId: string;
  existingContent?: AboutContent;
  onComplete?: () => void;
}

export const AboutWizard: React.FC<AboutWizardProps> = ({
  shopId,
  existingContent,
  onComplete
}) => {
  const [step, setStep] = useState<WizardStep>(existingContent ? 'edit' : 'generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<AboutContent>(
    existingContent || {
      title: 'Sobre Nosotros',
      story: '',
      mission: '',
      vision: '',
      values: []
    }
  );
  const [shop, setShop] = useState<any>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const { refineContent, isRefining } = useAIRefinement();

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
      
      // Si tiene contenido existente, cargar
      if (data.about_content && typeof data.about_content === 'object' && 'story' in data.about_content) {
        const aboutContent = data.about_content as any;
        setContent({
          title: aboutContent.title || 'Sobre Nosotros',
          story: aboutContent.story || '',
          mission: aboutContent.mission || '',
          vision: aboutContent.vision || '',
          values: aboutContent.values || []
        });
        setStep('edit');
      }
    }
  };

  const handleGenerate = async () => {
    if (!shop) return;
    
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-shop-about', {
        body: {
          shopName: shop.shop_name,
          craftType: shop.craft_type,
          description: shop.description || '',
          story: shop.story || '',
          brandClaim: shop.brand_claim || ''
        }
      });

      if (error) throw error;

      if (data) {
        setContent({
          title: data.title || 'Sobre Nosotros',
          story: data.story || '',
          mission: data.mission || '',
          vision: data.vision || '',
          values: data.values || []
        });
        setStep('edit');
        toast({
          title: '✨ Contenido Generado',
          description: 'Se creó el contenido "Nosotros" con IA',
        });
      }
    } catch (error) {
      console.error('Error generating about content:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el contenido. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddValue = () => {
    setContent({
      ...content,
      values: [...content.values, '']
    });
  };

  const handleRemoveValue = (index: number) => {
    setContent({
      ...content,
      values: content.values.filter((_, i) => i !== index)
    });
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...content.values];
    newValues[index] = value;
    setContent({ ...content, values: newValues });
  };

  const refineStory = async () => {
    if (!content.story) return;
    const refined = await refineContent({
      context: 'shop_story',
      currentValue: content.story,
      userPrompt: 'Corrige errores ortográficos y gramaticales manteniendo la esencia y autenticidad del texto'
    });
    if (refined) {
      setContent({ ...content, story: refined });
      toast({ title: '✨ Historia refinada', description: 'Ortografía y redacción mejoradas' });
    }
  };

  const refineMission = async () => {
    if (!content.mission) return;
    const refined = await refineContent({
      context: 'shop_mission',
      currentValue: content.mission,
      userPrompt: 'Corrige errores ortográficos y gramaticales manteniendo los objetivos originales'
    });
    if (refined) {
      setContent({ ...content, mission: refined });
      toast({ title: '✨ Misión refinada', description: 'Ortografía y redacción mejoradas' });
    }
  };

  const refineVision = async () => {
    if (!content.vision) return;
    const refined = await refineContent({
      context: 'shop_vision',
      currentValue: content.vision,
      userPrompt: 'Corrige errores ortográficos y gramaticales manteniendo las aspiraciones originales'
    });
    if (refined) {
      setContent({ ...content, vision: refined });
      toast({ title: '✨ Visión refinada', description: 'Ortografía y redacción mejoradas' });
    }
  };

  const handlePublish = async () => {
    try {
      // Refinar automáticamente antes de publicar
      const refinedContent = { ...content };
      
      if (content.story) {
        const refinedStory = await refineContent({
          context: 'shop_story',
          currentValue: content.story,
          userPrompt: 'Corrige errores ortográficos y gramaticales'
        });
        if (refinedStory) refinedContent.story = refinedStory;
      }
      
      if (content.mission) {
        const refinedMission = await refineContent({
          context: 'shop_mission',
          currentValue: content.mission,
          userPrompt: 'Corrige errores ortográficos y gramaticales'
        });
        if (refinedMission) refinedContent.mission = refinedMission;
      }
      
      if (content.vision) {
        const refinedVision = await refineContent({
          context: 'shop_vision',
          currentValue: content.vision,
          userPrompt: 'Corrige errores ortográficos y gramaticales'
        });
        if (refinedVision) refinedContent.vision = refinedVision;
      }

      const { error } = await supabase
        .from('artisan_shops')
        .update({
          about_content: refinedContent as any
        })
        .eq('id', shopId);

      if (error) throw error;

      EventBus.publish('shop.story.created', { shopId });
      
      toast({
        title: '🚀 Sección Nosotros Publicada',
        description: 'Tu página "Nosotros" está activa'
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error publishing about:', error);
      toast({
        title: 'Error',
        description: 'No se pudo publicar la sección',
        variant: 'destructive'
      });
    }
  };

  const stepProgress = {
    generate: 33,
    edit: 66,
    publish: 100
  };

  const stepTitles = {
    generate: 'Generar Contenido',
    edit: 'Personalizar',
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
              {step === 'generate' && 'Historia, misión, visión y valores con IA'}
              {step === 'edit' && 'Ajusta el contenido a tu voz y estilo'}
              {step === 'publish' && 'Activa tu sección "Nosotros"'}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {Object.keys(stepTitles).indexOf(step) + 1} / 3
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
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h3 className="text-xl font-bold mb-3">Genera tu sección "Nosotros" con IA</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            La IA creará una narrativa completa sobre tu historia, misión, visión y valores
          </p>
          <AIDisclaimer variant="banner" context="generate" className="mb-6" />
          <Button 
            size="lg" 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="min-w-[200px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generando historia...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generar Contenido
              </>
            )}
          </Button>
        </Card>
      )}

      {step === 'edit' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <Label htmlFor="title">Título de la Sección</Label>
              <Input
                id="title"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="story">Nuestra Historia</Label>
              <div className="space-y-2">
                <Textarea
                  id="story"
                  value={content.story}
                  onChange={(e) => setContent({ ...content, story: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <VoiceInput
                    onTranscript={(transcript) => {
                      setContent({ 
                        ...content, 
                        story: content.story + (content.story ? ' ' : '') + transcript 
                      });
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={refineStory}
                    disabled={isRefining || !content.story}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isRefining ? 'Refinando...' : 'Refinar texto'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="mission">Nuestra Misión</Label>
              <div className="space-y-2">
                <Textarea
                  id="mission"
                  value={content.mission}
                  onChange={(e) => setContent({ ...content, mission: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <VoiceInput
                    onTranscript={(transcript) => {
                      setContent({ 
                        ...content, 
                        mission: content.mission + (content.mission ? ' ' : '') + transcript 
                      });
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={refineMission}
                    disabled={isRefining || !content.mission}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isRefining ? 'Refinando...' : 'Refinar texto'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="vision">Nuestra Visión</Label>
              <div className="space-y-2">
                <Textarea
                  id="vision"
                  value={content.vision}
                  onChange={(e) => setContent({ ...content, vision: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <VoiceInput
                    onTranscript={(transcript) => {
                      setContent({ 
                        ...content, 
                        vision: content.vision + (content.vision ? ' ' : '') + transcript 
                      });
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={refineVision}
                    disabled={isRefining || !content.vision}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isRefining ? 'Refinando...' : 'Refinar texto'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Nuestros Valores</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddValue}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Valor
                </Button>
              </div>
              <div className="space-y-2">
                {content.values.map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      placeholder={`Valor ${index + 1}`}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveValue(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? 'Regenerando...' : 'Regenerar con IA'}
            </Button>
            <Button className="flex-1" onClick={() => setStep('publish')}>
              Guardar y continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 'publish' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Vista Previa</h3>
            <div className="prose max-w-none space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-3">{content.title}</h2>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Nuestra Historia</h3>
                <p className="text-muted-foreground whitespace-pre-line">{content.story}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Misión</h3>
                  <p className="text-muted-foreground">{content.mission}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Visión</h3>
                  <p className="text-muted-foreground">{content.vision}</p>
                </div>
              </div>

              {content.values.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Valores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {content.values.map((value, index) => (
                      <Badge key={index} variant="secondary" className="justify-center py-2">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('edit')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a editar
            </Button>
            <Button size="lg" className="flex-1" onClick={handlePublish}>
              <Rocket className="w-5 h-5 mr-2" />
              Publicar Sección Nosotros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
