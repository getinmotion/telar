import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AboutWizard } from '@/components/shop/wizards/AboutWizard';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { Navigate } from 'react-router-dom';

const AboutWizardPage: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <Helmet>
        <title>Configurar Sección Nosotros - {shop.shop_name}</title>
        <meta name="description" content="Crea la historia de tu marca con asistencia de IA" />
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

        <AboutWizard
          shopId={shop.id}
          existingContent={(shop as any).about_content}
          onComplete={() => {
            navigate(`/tienda/${shop.shop_slug}/nosotros`);
          }}
        />
      </div>
    </div>
  );
};

export default AboutWizardPage;
