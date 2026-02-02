import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Palette, ExternalLink, ImageIcon, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArtisanShop } from '@/types/artisan';
import { ArtisanProfileCards } from '@/components/cultural/conversational/components/ArtisanProfileCards';
import { useArtisanClassifier } from '@/hooks/useArtisanClassifier';
import { useAuth } from '@/context/AuthContext';

interface ShopInfoSectionProps {
  shop: ArtisanShop | null;
  isLoading?: boolean;
}

export const ShopInfoSection: React.FC<ShopInfoSectionProps> = ({
  shop,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getClassification } = useArtisanClassifier();
  const [officialClassification, setOfficialClassification] = React.useState<string | undefined>();
  
  // Cargar clasificación oficial si existe
  React.useEffect(() => {
    const loadClassification = async () => {
      if (user?.id) {
        const classification = await getClassification(user.id);
        if (classification) {
          setOfficialClassification(`${classification.oficio} - ${classification.materiaPrima}`);
        }
      }
    };
    loadClassification();
  }, [user?.id, getClassification]);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando información...</div>
        </CardContent>
      </Card>
    );
  }

  if (!shop) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Mi Taller
          </CardTitle>
          <CardDescription>
            Información de tu taller o tienda artesanal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground mb-4">
                Aún no has creado tu tienda artesanal
              </p>
              <Button onClick={() => navigate('/crear-tienda')}>
                <Store className="h-4 w-4 mr-2" />
                Crear Mi Tienda
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (shop.publish_status === 'published') {
      return <Badge variant="default" className="bg-success text-success-foreground">Publicada</Badge>;
    }
    return <Badge variant="secondary">Pendiente de publicación</Badge>;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
        <div>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Store className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Mi Taller
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Información de tu taller o tienda artesanal
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/mi-tienda')} className="w-full sm:w-auto">
          <ExternalLink className="h-4 w-4 mr-2" />
          Gestionar
        </Button>
      </CardHeader>
      <CardContent className="space-y-0">
        {/* Shop Logo & Name */}
        <div className="flex items-start gap-3 sm:gap-4 py-3 sm:py-4 border-b border-border">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
            {shop.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt={shop.shop_name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg truncate">{shop.shop_name}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
              {shop.description || 'Sin descripción'}
            </p>
          </div>
        </div>

        {/* Craft Type */}
        <div className="flex items-start gap-3 sm:gap-4 py-3 sm:py-4 border-b border-border">
          <div className="p-1.5 sm:p-2 bg-muted rounded-lg shrink-0">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Tipo de Artesanía</p>
            <p className="text-sm sm:text-base text-foreground capitalize">{shop.craft_type || 'No especificado'}</p>
          </div>
        </div>

        {/* Region */}
        <div className="flex items-start gap-3 sm:gap-4 py-3 sm:py-4 border-b border-border">
          <div className="p-1.5 sm:p-2 bg-muted rounded-lg shrink-0">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Región</p>
            <p className="text-sm sm:text-base text-foreground">{shop.region || 'No especificada'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/tienda/${shop.shop_slug}?preview=true`)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            Ver Vista Previa
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/mi-tienda')}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            Editar Tienda
          </Button>
        </div>

        {/* Tarjetas de Perfil Artesanal - Solo se muestran en el perfil */}
        {shop.craft_type && (
          <div className="pt-6 border-t border-border mt-4">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Tu Perfil Artesanal
            </h4>
            <ArtisanProfileCards
              craftType={shop.craft_type}
              officialClassification={officialClassification}
              language="es"
              onAddClassification={() => navigate('/onboarding?step=classification')}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
