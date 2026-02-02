import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Rocket, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopPublish, PublishRequirements } from '@/hooks/useShopPublish';
import { ArtisanShop } from '@/types/artisan';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ShopPublishStatusBannerProps {
  shop: ArtisanShop;
  onPublish?: () => void;
}

export const ShopPublishStatusBanner: React.FC<ShopPublishStatusBannerProps> = ({ shop, onPublish }) => {
  const navigate = useNavigate();
  const { checkPublishRequirements, publishShop, loading } = useShopPublish(shop.id);
  const [requirements, setRequirements] = useState<PublishRequirements | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const loadRequirements = async () => {
      const reqs = await checkPublishRequirements();
      setRequirements(reqs);
    };
    loadRequirements();
  }, [checkPublishRequirements, shop.id]);

  const handlePublishClick = () => {
    if (requirements?.canPublish) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmPublish = async () => {
    const success = await publishShop();
    if (success) {
      setShowConfirmDialog(false);
      onPublish?.();
      window.location.reload();
    }
  };

  // Si ya está publicada - solo mostrar una vez después de publicar
  if (shop.publish_status === 'published') {
    const bannerKey = `shop_published_banner_shown_${shop.id}`;
    const alreadyShown = localStorage.getItem(bannerKey);
    
    // Si ya se mostró, no renderizar nada
    if (alreadyShown) {
      return null;
    }
    
    // Marcar como mostrado para la próxima vez
    localStorage.setItem(bannerKey, 'true');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Alert className="border-success/20 bg-success/10">
          <CheckCircle className="w-4 h-4 text-success" />
          <AlertDescription>
            <span className="text-success font-medium">
              ¡Tu tienda está publicada y visible en el marketplace!
            </span>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  // Si está pendiente de publicación
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Alert className="border-warning/20 bg-warning/10">
          <AlertDescription>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span className="font-medium text-warning text-sm">En preparación</span>
              </div>
              
              {/* Requisitos como chips inline */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Chip Productos - OBLIGATORIO */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  requirements?.hasApprovedProducts 
                    ? 'bg-success/20 text-success' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {requirements?.hasApprovedProducts ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {requirements?.approvedProductsCount || 0}/1 productos
                </div>
                
                {/* Chip Datos Bancarios - INFORMATIVO (no bloquea publicación) */}
                {requirements?.hasBankData ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                    <CheckCircle className="w-3 h-3" />
                    Datos bancarios
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate('/mi-cuenta/datos-bancarios')}
                    title="Opcional para publicar, necesario para recibir pagos"
                  >
                    <Info className="w-3 h-3" />
                    Datos bancarios (para pagos)
                  </div>
                )}
              </div>
              
              {/* Botón Publicar */}
              <Button 
                size="sm" 
                disabled={!requirements?.canPublish || loading} 
                onClick={handlePublishClick}
                className="h-8"
              >
                <Rocket className="w-4 h-4 mr-1" />
                Publicar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Publicar tu tienda?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu tienda será visible en el marketplace público y los clientes podrán encontrarla.
              {!requirements?.hasBankData && (
                <>
                  <br /><br />
                  <span className="text-warning">
                    ⚠️ Nota: Aún no has configurado tus datos bancarios. Podrás publicar tu tienda, 
                    pero necesitarás completar esta información para poder recibir pagos de tus ventas.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPublish} disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar Ahora'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
