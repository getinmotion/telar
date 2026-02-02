import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useArtisanDetection } from '@/hooks/useArtisanDetection';
import { useMasterCoordinator } from '@/hooks/useMasterCoordinator';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Store, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ColombiaLocationSelect, formatRegionFromLocation } from '@/components/ui/colombia-location-select';

interface ShopFormData {
  shop_name: string;
  description: string;
  story: string;
  craft_type: string;
  region: string;
  department: string;
  municipality: string;
  contact_info: {
    phone: string;
    email: string;
    whatsapp: string;
  };
  social_links: {
    instagram: string;
    facebook: string;
    website: string;
  };
}

interface IntelligentShopCreationWizardProps {
  language?: 'en' | 'es';
  existingShop?: any;
}

export const IntelligentShopCreationWizard: React.FC<IntelligentShopCreationWizardProps> = ({ 
  language = 'es',
  existingShop
}) => {
  const [step, setStep] = useState<'loading' | 'preconfigured' | 'review' | 'creating' | 'complete'>('loading');
  const [formData, setFormData] = useState<ShopFormData>({
    shop_name: '',
    description: '',
    story: '',
    craft_type: '',
    region: '',
    department: '',
    municipality: '',
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
  });
  const [isPrefillingData, setIsPrefillingData] = useState(true);
  const [coordinatorMessage, setCoordinatorMessage] = useState('');

  const { user } = useAuth();
  const { isArtisan, craftType } = useArtisanDetection();
  const { createShop, loading: shopLoading } = useArtisanShop();
  const { coordinatorMessage: masterMessage } = useMasterCoordinator();
  const { profile, context, loading: unifiedLoading } = useUnifiedUserData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Create Your Digital Shop',
      subtitle: 'AI-powered shop creation using your existing profile',
      prefillingData: 'Analyzing your profile and pre-configuring shop...',
      reviewing: 'Review and adjust your shop information',
      creating: 'Creating your digital shop...',
      complete: 'Shop created successfully!',
      shopName: 'Shop Name',
      description: 'Description',
      story: 'Your Story',
      contactInfo: 'Contact Information',
      socialLinks: 'Social Media',
      createShop: 'Create Shop',
      continue: 'Continue',
      goToShop: 'Go to My Shop'
    },
    es: {
      title: 'Crear tu Tienda Digital',
      subtitle: 'Creación de tienda potenciada por IA usando tu perfil existente',
      prefillingData: 'Analizando tu perfil y preconfigurando la tienda...',
      reviewing: 'Revisa y ajusta la información de tu tienda',
      creating: 'Creando tu tienda digital...',
      complete: '¡Tienda creada exitosamente!',
      shopName: 'Nombre de la Tienda',
      description: 'Descripción',
      story: 'Tu Historia',
      contactInfo: 'Información de Contacto',
      socialLinks: 'Redes Sociales',
      createShop: 'Crear Tienda',
      continue: 'Continuar',
      goToShop: 'Ir a Mi Tienda'
    }
  };

  const t = translations[language];

  // Pre-fill data from unified profile
  useEffect(() => {
    const prefillShopData = async () => {
      if (!user || unifiedLoading) return;

      try {
        setCoordinatorMessage('🔍 Verificando tu información existente...');

        // ✅ Use unified profile data (already in camelCase format)
        let businessProfile: any = {};
        
        if (profile?.brandName || profile?.businessDescription) {
          businessProfile = {
            brandName: profile.brandName,
            businessDescription: profile.businessDescription,
            craftType: profile.businessType,
            businessLocation: profile.businessLocation || profile.city,
            email: profile.email,
            whatsapp_e164: profile.whatsappE164,
          };
          
          console.log('✅ [SHOP] Using unified profile data:', {
            brandName: businessProfile.brandName,
            businessDescription: businessProfile.businessDescription?.substring(0, 50),
            craftType: businessProfile.craftType,
            businessLocation: businessProfile.businessLocation
          });
        }

        // Fallback to context.businessProfile if profile doesn't have data
        if (!businessProfile.brandName && !businessProfile.businessDescription && context?.businessProfile) {
          console.log('🔍 [SHOP] Using context.businessProfile...');
          const bp = context.businessProfile;
          businessProfile = {
            brandName: bp.brand_name || bp.brandName,
            businessDescription: bp.business_description || bp.businessDescription,
            craftType: bp.craft_type || bp.craftType || bp.business_type,
            businessLocation: bp.business_location || bp.businessLocation || bp.ubicacion,
          };
          console.log('✅ [SHOP] Mapped context data:', {
            brandName: businessProfile.brandName,
            businessDescription: businessProfile.businessDescription?.substring(0, 50)
          });
        }

        // 3. Mapeo FLEXIBLE: aceptar múltiples fuentes de datos
        const shopName = 
          businessProfile.brandName || 
          businessProfile.brand_name || 
          businessProfile.business_name || 
          businessProfile.businessName ||
          `Tienda de ${businessProfile.craft_type || businessProfile.business_type || 'Artesanías'}`;
        
        const description = 
          businessProfile.businessDescription || 
          businessProfile.business_description || 
          businessProfile.description ||
          businessProfile.unique_value || 
          '';

        const story = businessProfile.uniqueValue || businessProfile.unique_value || description || '';

        console.log('✅ [SHOP] Final mapped data:', { 
          shopName, 
          description: description ? description.substring(0, 50) + '...' : 'NONE',
          craft_type: businessProfile.craftType || businessProfile.business_type || craftType,
          region: businessProfile.businessLocation || businessProfile.business_location,
          hasDescription: !!description 
        });

        // Si hay DESCRIPCIÓN (de cualquier campo), podemos crear tienda
        if (description) {
          setFormData({
            shop_name: shopName,
            description: description,
            story: story,
            craft_type: businessProfile.craftType || businessProfile.business_type || craftType || 'other',
            region: businessProfile.businessLocation || businessProfile.business_location || '',
            department: '',
            municipality: '',
            contact_info: {
              phone: profile?.whatsappE164 || '',
              email: profile?.email || user.email || '',
              whatsapp: profile?.whatsappE164 || '',
            },
            social_links: {
              instagram: '',
              facebook: '',
              website: '',
            },
          });

          setCoordinatorMessage('✅ Tu tienda está lista con tu información existente. Solo confirma para crearla.');
          setStep('review'); // ✅ Saltar directo a revisión
        } else {
          // Si NO hay descripción, mostrar formulario (no redirigir)
          setCoordinatorMessage('📝 Completa algunos datos para crear tu tienda.');
          setStep('preconfigured');
        }
      } catch (error) {
        console.error('Error prefilling shop data:', error);
        setCoordinatorMessage('⚠️ Hubo un problema al cargar tus datos.');
        setStep('preconfigured');
      } finally {
        setIsPrefillingData(false);
      }
    };

    if (step === 'loading') {
      prefillShopData();
    }
  }, [user, profile, context, unifiedLoading, step, craftType, language, navigate, toast]);

  const handleCreateShop = async () => {
    setStep('creating');
    
    try {
      await createShop({
        shop_name: formData.shop_name.trim(),
        description: formData.description,
        story: formData.story,
        craft_type: formData.craft_type,
        region: formData.region,
        contact_info: formData.contact_info,
        social_links: formData.social_links,
      });

      setStep('complete');
      toast({
        title: "¡Tienda creada!",
        description: "Tu tienda digital ha sido creada exitosamente.",
      });
    } catch (error) {
      console.error('Error creating shop:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear tu tienda. Intenta de nuevo.",
        variant: "destructive"
      });
      setStep('review');
    }
  };

  const renderLoadingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mx-auto w-16 h-16 mb-6"
      >
        <Sparkles className="w-16 h-16 text-emerald-500" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">{t.prefillingData}</h3>
      <p className="text-muted-foreground">{coordinatorMessage}</p>
    </motion.div>
  );

  const renderPreconfiguredStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <p className="text-emerald-800 dark:text-emerald-200 font-medium">
          🤖 Coordinador Maestro: {coordinatorMessage}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="shop_name">{t.shopName}</Label>
          <Input
            id="shop_name"
            value={formData.shop_name}
            onChange={(e) => {
              const value = e.target.value;
              const genericNames = [
                'Tu Negocio', 'Tu Emprendimiento', 'Tu Empresa', 'Tu Proyecto',
                'Tu Startup', 'Tu Taller Artesanal'
              ];
              
              // Advertir si el usuario está escribiendo un nombre genérico
              if (genericNames.some(generic => value.toLowerCase().includes(generic.toLowerCase()))) {
                e.target.setCustomValidity('Por favor, ingresa el nombre real de tu negocio');
              } else {
                e.target.setCustomValidity('');
              }
              
              setFormData(prev => ({ ...prev, shop_name: value }));
            }}
            placeholder="Ej: Artesanías Doña María, Café de la Montaña"
            required
            minLength={3}
          />
        </div>

        <div>
          <Label htmlFor="description">{t.description}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe lo que haces..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="story">{t.story}</Label>
          <Textarea
            id="story"
            value={formData.story}
            onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
            placeholder="Cuéntanos tu historia..."
            rows={4}
          />
        </div>

        <div>
          <Label>Ubicación</Label>
          <ColombiaLocationSelect
            department={formData.department}
            municipality={formData.municipality}
            onDepartmentChange={(dept) => setFormData(prev => ({ 
              ...prev, 
              department: dept, 
              municipality: '',
              region: dept
            }))}
            onMunicipalityChange={(muni) => setFormData(prev => ({ 
              ...prev, 
              municipality: muni,
              region: formatRegionFromLocation(prev.department, muni)
            }))}
            compact
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
          <div>
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
        </div>
      </div>

      <Button
        onClick={() => setStep('review')}
        className="w-full"
        size="lg"
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        {t.continue}
      </Button>
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <h3 className="font-semibold text-primary mb-2">
          {t.reviewing}
        </h3>
        <p className="text-primary/80 text-sm">
          Revisa toda la información antes de crear tu tienda.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Información Básica</h4>
          <p><strong>Tienda:</strong> {formData.shop_name}</p>
          <p><strong>Descripción:</strong> {formData.description}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Contacto</h4>
          <p><strong>Teléfono:</strong> {formData.contact_info.phone}</p>
          <p><strong>Instagram:</strong> {formData.social_links.instagram}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setStep('preconfigured')}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          onClick={handleCreateShop}
          disabled={shopLoading}
          className="flex-1"
        >
          {shopLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Store className="w-4 h-4 mr-2" />
          {t.createShop}
        </Button>
      </div>
    </motion.div>
  );

  const renderCreatingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
      <h3 className="text-xl font-semibold mb-2">{t.creating}</h3>
      <p className="text-muted-foreground">Esto tomará solo unos segundos...</p>
    </motion.div>
  );

  const renderCompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
      <h3 className="text-xl font-semibold mb-2">{t.complete}</h3>
      <p className="text-muted-foreground mb-6">
        Tu tienda digital está lista. ¡Ahora puedes empezar a cargar productos!
      </p>
      <Button
        onClick={() => navigate('/dashboard/artisan')}
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Store className="w-4 h-4 mr-2" />
        {t.goToShop}
      </Button>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard/home')}
        className="mb-4"
      >
        ← Volver al Taller Digital
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            {step === 'loading' && 'Analizando Perfil'}
            {step === 'preconfigured' && 'Configuración Inteligente'}
            {step === 'review' && 'Revisión Final'}
            {step === 'creating' && 'Creando Tienda'}
            {step === 'complete' && 'Tienda Creada'}
          </CardTitle>
          <CardDescription>
            {step === 'loading' && 'El Coordinador Maestro está analizando tu información...'}
            {step === 'preconfigured' && 'Revisa y ajusta los datos pre-llenados'}
            {step === 'review' && 'Última revisión antes de crear tu tienda'}
            {step === 'creating' && 'Configurando tu tienda digital...'}
            {step === 'complete' && '¡Tu tienda digital está lista!'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'loading' && renderLoadingStep()}
          {step === 'preconfigured' && renderPreconfiguredStep()}
          {step === 'review' && renderReviewStep()}
          {step === 'creating' && renderCreatingStep()}
          {step === 'complete' && renderCompleteStep()}
        </CardContent>
      </Card>
    </div>
  );
};