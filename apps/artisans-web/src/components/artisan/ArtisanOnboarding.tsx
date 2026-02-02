import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { CraftType, Region } from '@/types/artisan';
import { Loader2, Store, Image, MapPin, Award } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const craftTypes: { value: CraftType; label: string }[] = [
  { value: 'textiles', label: 'Textiles y Tejidos' },
  { value: 'ceramics', label: 'Cerámica' },
  { value: 'jewelry', label: 'Joyería' },
  { value: 'woodwork', label: 'Trabajo en Madera' },
  { value: 'leather', label: 'Marroquinería' },
  { value: 'basketry', label: 'Cestería' },
  { value: 'metalwork', label: 'Metalurgia' },
  { value: 'glasswork', label: 'Vidrio' },
  { value: 'painting', label: 'Pintura' },
  { value: 'sculpture', label: 'Escultura' },
  { value: 'other', label: 'Otro' },
];

const regions: { value: Region; label: string }[] = [
  { value: 'antioquia', label: 'Antioquia' },
  { value: 'atlantico', label: 'Atlántico' },
  { value: 'bogota', label: 'Bogotá D.C.' },
  { value: 'bolivar', label: 'Bolívar' },
  { value: 'boyaca', label: 'Boyacá' },
  { value: 'caldas', label: 'Caldas' },
  { value: 'caqueta', label: 'Caquetá' },
  { value: 'casanare', label: 'Casanare' },
  { value: 'cauca', label: 'Cauca' },
  { value: 'cesar', label: 'Cesar' },
  { value: 'choco', label: 'Chocó' },
  { value: 'cordoba', label: 'Córdoba' },
  { value: 'cundinamarca', label: 'Cundinamarca' },
  { value: 'huila', label: 'Huila' },
  { value: 'la_guajira', label: 'La Guajira' },
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'meta', label: 'Meta' },
  { value: 'narino', label: 'Nariño' },
  { value: 'norte_santander', label: 'Norte de Santander' },
  { value: 'quindio', label: 'Quindío' },
  { value: 'risaralda', label: 'Risaralda' },
  { value: 'santander', label: 'Santander' },
  { value: 'sucre', label: 'Sucre' },
  { value: 'tolima', label: 'Tolima' },
  { value: 'valle_del_cauca', label: 'Valle del Cauca' },
];

interface ArtisanOnboardingProps {
  onComplete?: () => void;
}

export const ArtisanOnboarding: React.FC<ArtisanOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0); // Start with choice screen
  const [formData, setFormData] = useState({
    shop_name: '',
    description: '',
    story: '',
    craft_type: '',
    region: '',
    contact_info: {
      phone: '',
      email: '',
      whatsapp: '',
    },
    social_links: {
      instagram: '',
      facebook: '',
      website: '',
    },
    certifications: [] as string[],
  });

  const { createShop, loading } = useArtisanShop();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const shopData = {
        shop_name: formData.shop_name,
        description: formData.description,
        story: formData.story,
        craft_type: formData.craft_type,
        region: formData.region,
        contact_info: formData.contact_info,
        social_links: formData.social_links,
        certifications: formData.certifications,
      };

      await createShop(shopData);
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard/artisan');
      }
    } catch (error) {
      console.error('Error creating shop:', error);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.shop_name.trim() !== '';
      case 2:
        return formData.craft_type !== '' && formData.region !== '';
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Optional fields
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Creemos tu Espacio Digital
        </h1>
        <p className="text-muted-foreground">
          Un lugar para mostrar tus creaciones y conectar con clientes
        </p>
      </div>

      {/* Intelligent Creation Options */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-forest-green/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-forest-green">
              <Store className="w-5 h-5" />
              Creación Rápida con IA
            </CardTitle>
            <CardDescription>
              El Coordinador te ayuda a crear tu espacio automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/dashboard/create-shop?mode=conversational')}
              className="w-full bg-gradient-to-r from-forest-green to-olive-green hover:opacity-90"
            >
              ✨ Crear con Ayuda
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Lo hago yo mismo
            </CardTitle>
            <CardDescription>
              Llena el formulario a tu ritmo, paso a paso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setCurrentStep(1)}
              variant="outline"
              className="w-full"
            >
              📝 Crear Paso a Paso
            </Button>
          </CardContent>
        </Card>
      </div>

      {currentStep === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Elige cómo quieres empezar
          </p>
        </div>
      )}

      {/* Progress indicator - only show for manual mode */}
      {currentStep > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${
                  step < 4 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual creation form - only show when currentStep > 0 */}
      {currentStep > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <Store className="w-5 h-5" />}
              {currentStep === 2 && <MapPin className="w-5 h-5" />}
              {currentStep === 3 && <Image className="w-5 h-5" />}
              {currentStep === 4 && <Award className="w-5 h-5" />}
              {currentStep === 1 && 'Cuéntanos de ti'}
              {currentStep === 2 && 'Tu Oficio y Ubicación'}
              {currentStep === 3 && 'Cómo Contactarte'}
              {currentStep === 4 && 'Reconocimientos (opcional)'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Cuéntanos sobre tu tienda y productos'}
              {currentStep === 2 && 'Define tu especialidad artesanal'}
              {currentStep === 3 && 'Cómo pueden contactarte los clientes'}
              {currentStep === 4 && 'Certificaciones y reconocimientos'}
            </CardDescription>
          </CardHeader>

        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="shop_name">Nombre de tu Tienda *</Label>
                <Input
                  id="shop_name"
                  value={formData.shop_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
                  placeholder="Ej: Artesanías María Gómez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Corta</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe brevemente lo que haces..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">Tu Historia</Label>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                  placeholder="Cuéntanos la historia detrás de tu arte..."
                  rows={4}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="craft_type">Tipo de Artesanía *</Label>
                <Select
                  value={formData.craft_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, craft_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {craftTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Región *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu región" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.contact_info.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact_info: { ...prev.contact_info, phone: e.target.value }
                    }))}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact_info.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact_info: { ...prev.contact_info, email: e.target.value }
                    }))}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.contact_info.whatsapp}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact_info: { ...prev.contact_info, whatsapp: e.target.value }
                  }))}
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.social_links.instagram}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, instagram: e.target.value }
                    }))}
                    placeholder="@tu_usuario"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={formData.social_links.website}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, website: e.target.value }
                    }))}
                    placeholder="https://tu-sitio.com"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ¿Tienes alguna certificación o reconocimiento? (Opcional)
              </p>
              
              <div className="space-y-3">
                {[
                  'Artesanías de Colombia',
                  'Denominación de Origen',
                  'Sello de Calidad',
                  'Certificación Orgánica',
                  'Comercio Justo',
                ].map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      id={cert}
                      checked={formData.certifications.includes(cert)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            certifications: [...prev.certifications, cert]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            certifications: prev.certifications.filter(c => c !== cert)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={cert}>{cert}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons - only show for manual mode */}
      {currentStep > 0 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Tienda
            </Button>
          )}
        </div>
      )}
    </div>
  );
};