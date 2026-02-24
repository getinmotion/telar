import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { HeroSliderWizard } from '@/components/shop/wizards/HeroSliderWizard';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { Navigate } from 'react-router-dom';
import { ShopThemeProvider } from '@/contexts/ShopThemeContext';
import { convertLegacyToNewPalette } from '@/utils/colorUtils';

const HeroSliderWizardPage: React.FC = () => {
  const { shop, loading: isLoading } = useArtisanShop();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!shop) {
    return <Navigate to="/dashboard/create-shop" replace />;
  }

  // Crear tema desde la tienda
  const shopData = shop as any;
  const theme = {
    palette: shopData.primary_colors 
      ? convertLegacyToNewPalette(shopData.primary_colors)
      : {
          primary: { main: '#3b82f6', dark: '#2563eb', light: '#60a5fa' },
          secondary: { main: '#8b5cf6', dark: '#7c3aed', light: '#a78bfa' },
          accent: { main: '#f59e0b', dark: '#d97706', light: '#fbbf24' },
          neutral: { main: '#6b7280', dark: '#4b5563', light: '#9ca3af' },
          background: { main: '#ffffff', dark: '#f9fafb', light: '#ffffff' },
          success: { main: '#10b981', dark: '#059669', light: '#34d399' },
          warning: { main: '#f59e0b', dark: '#d97706', light: '#fbbf24' },
          error: { main: '#ef4444', dark: '#dc2626', light: '#f87171' },
          info: { main: '#3b82f6', dark: '#2563eb', light: '#60a5fa' }
        }
  };

  return (
    <ShopThemeProvider theme={theme}>
      <div className="min-h-screen bg-background py-8 px-4">
        <Helmet>
          <title>Configurar Hero Slider - {shop.shop_name}</title>
          <meta name="description" content="Configura el hero slider de tu tienda con asistencia de IA" />
        </Helmet>

        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/mi-tienda')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Mi Tienda
          </Button>

          <HeroSliderWizard
            shopId={shop.id}
            existingSlides={shopData.hero_config?.slides}
            onComplete={() => navigate('/mi-tienda')}
          />
        </div>
      </div>
    </ShopThemeProvider>
  );
};

export default HeroSliderWizardPage;
