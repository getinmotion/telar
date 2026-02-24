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
import { Sparkles, Loader2, Rocket, ArrowLeft, ArrowRight, Wand2, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { VoiceInput } from '@/components/ui/voice-input';
import { EventBus } from '@/utils/eventBus';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';

type WizardStep = 'generate' | 'configure' | 'publish';

interface ContactConfig {
  welcomeMessage: string;
  formIntroText: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  mapEmbedUrl: string;
}

interface ContactWizardProps {
  shopId: string;
  existingConfig?: ContactConfig;
  onComplete?: () => void;
}

export const ContactWizard: React.FC<ContactWizardProps> = ({
  shopId,
  existingConfig,
  onComplete
}) => {
  const [step, setStep] = useState<WizardStep>(existingConfig ? 'configure' : 'generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<ContactConfig>(
    existingConfig || {
      welcomeMessage: '',
      formIntroText: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      hours: '',
      mapEmbedUrl: ''
    }
  );
  const [shop, setShop] = useState<any>(null);

  const { user } = useAuth();
  const { toast } = useToast();

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
      
      // Si tiene config existente, cargar
      if (data.contact_config && typeof data.contact_config === 'object' && 'welcomeMessage' in data.contact_config) {
        setConfig(data.contact_config as unknown as ContactConfig);
        setStep('configure');
      } else if (data.contact_info && typeof data.contact_info === 'object') {
        // Pre-fill con datos básicos si existen
        const contactInfo = data.contact_info as any;
        setConfig(prev => ({
          ...prev,
          email: contactInfo.email || '',
          phone: contactInfo.phone || '',
          whatsapp: contactInfo.whatsapp || ''
        }));
      }
    }
  };

  const handleGenerate = async () => {
    if (!shop) return;
    
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-shop-contact', {
        body: {
          shopName: shop.shop_name,
          craftType: shop.craft_type,
          description: shop.description || '',
          brandClaim: shop.brand_claim || ''
        }
      });

      if (error) throw error;

      if (data) {
        setConfig(prev => ({
          ...prev,
          welcomeMessage: data.welcomeMessage || '',
          formIntroText: data.formIntroText || '',
          hours: data.suggestedHours || prev.hours
        }));
        setStep('configure');
        toast({
          title: '✨ Textos Generados',
          description: 'Se crearon los textos de contacto con IA',
        });
      }
    } catch (error) {
      console.error('Error generating contact content:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron generar los textos. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    try {
      const { error } = await supabase
        .from('artisan_shops')
        .update({
          contact_config: config as any,
          contact_info: {
            email: config.email,
            phone: config.phone,
            whatsapp: config.whatsapp
          } as any
        })
        .eq('id', shopId);

      if (error) throw error;

      EventBus.publish('shop.contact.added', { shopId });
      
      toast({
        title: '🚀 Página de Contacto Publicada',
        description: 'Tu página de contacto está activa'
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error publishing contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo publicar la página de contacto',
        variant: 'destructive'
      });
    }
  };

  const stepProgress = {
    generate: 33,
    configure: 66,
    publish: 100
  };

  const stepTitles = {
    generate: 'Generar Textos',
    configure: 'Configurar Datos',
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
              {step === 'generate' && 'Mensajes de bienvenida y formulario con IA'}
              {step === 'configure' && 'Email, teléfono, dirección y horarios'}
              {step === 'publish' && 'Activa tu página de contacto'}
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
          <h3 className="text-xl font-bold mb-3">Genera textos de contacto con IA</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            La IA creará mensajes de bienvenida y textos para tu formulario de contacto
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
                Generando textos...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generar Textos
              </>
            )}
          </Button>
        </Card>
      )}

      {step === 'configure' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Textos Generados por IA (editables)</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="welcome">Mensaje de Bienvenida</Label>
                  <div className="space-y-2">
                    <Textarea
                      id="welcome"
                      value={config.welcomeMessage}
                      onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                    <VoiceInput
                      onTranscript={(transcript) => {
                        setConfig({ 
                          ...config, 
                          welcomeMessage: config.welcomeMessage + (config.welcomeMessage ? ' ' : '') + transcript 
                        });
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="formIntro">Texto Introducción del Formulario</Label>
                  <div className="space-y-2">
                    <Textarea
                      id="formIntro"
                      value={config.formIntroText}
                      onChange={(e) => setConfig({ ...config, formIntroText: e.target.value })}
                      rows={2}
                      className="resize-none"
                    />
                    <VoiceInput
                      onTranscript={(transcript) => {
                        setConfig({ 
                          ...config, 
                          formIntroText: config.formIntroText + (config.formIntroText ? ' ' : '') + transcript 
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Datos de Contacto</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    placeholder="contacto@mitienda.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={config.phone}
                      onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={config.whatsapp}
                      onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Dirección Física (opcional)
                  </Label>
                  <Textarea
                    id="address"
                    value={config.address}
                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    rows={2}
                    placeholder="Calle 123 #45-67, Bogotá, Colombia"
                  />
                </div>

                <div>
                  <Label htmlFor="hours" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horarios de Atención
                  </Label>
                  <Textarea
                    id="hours"
                    value={config.hours}
                    onChange={(e) => setConfig({ ...config, hours: e.target.value })}
                    rows={2}
                    placeholder="Lunes a Viernes: 9am - 6pm"
                  />
                </div>

                <div>
                  <Label htmlFor="map">Google Maps Embed URL (opcional)</Label>
                  <Input
                    id="map"
                    value={config.mapEmbedUrl}
                    onChange={(e) => setConfig({ ...config, mapEmbedUrl: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Pega la URL de embed de Google Maps
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? 'Regenerando...' : 'Regenerar Textos'}
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
            <div className="space-y-6">
              <div>
                <p className="text-lg mb-4">{config.welcomeMessage}</p>
                <p className="text-sm text-muted-foreground mb-6">{config.formIntroText}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Información de Contacto</h4>
                  <div className="space-y-3 text-sm">
                    {config.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{config.email}</span>
                      </div>
                    )}
                    {config.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{config.phone}</span>
                      </div>
                    )}
                    {config.whatsapp && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>WhatsApp: {config.whatsapp}</span>
                      </div>
                    )}
                    {config.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span>{config.address}</span>
                      </div>
                    )}
                    {config.hours && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="whitespace-pre-line">{config.hours}</span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Formulario de Contacto</h4>
                  <div className="space-y-3">
                    <Input placeholder="Tu nombre" disabled />
                    <Input placeholder="Tu email" type="email" disabled />
                    <Textarea placeholder="Tu mensaje" rows={3} disabled />
                    <Button className="w-full" disabled>Enviar Mensaje</Button>
                  </div>
                </Card>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('configure')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a editar
            </Button>
            <Button size="lg" className="flex-1" onClick={handlePublish}>
              <Rocket className="w-5 h-5 mr-2" />
              Publicar Página de Contacto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
