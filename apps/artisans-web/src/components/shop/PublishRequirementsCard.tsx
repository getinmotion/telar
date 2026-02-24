import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Package, CreditCard, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublishRequirements } from '@/hooks/useShopPublish';

interface PublishRequirementsCardProps {
  requirements: PublishRequirements;
}

export const PublishRequirementsCard: React.FC<PublishRequirementsCardProps> = ({ requirements }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 text-foreground">Requisitos para Publicar</h3>
      
      <div className="space-y-4">
        {/* Productos Aprobados - OBLIGATORIO */}
        <div className="flex items-start gap-3">
          {requirements.hasApprovedProducts ? (
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium text-foreground">
              Productos aprobados: {requirements.approvedProductsCount}/1 mínimo
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {requirements.hasApprovedProducts 
                ? 'Tienes productos aprobados por moderación' 
                : 'Necesitas al menos un producto aprobado para publicar tu tienda'}
            </p>
            {!requirements.hasApprovedProducts && (
              <Button
                variant="link"
                size="sm"
                className="px-0 h-auto mt-2"
                onClick={() => navigate('/productos/subir')}
              >
                <Package className="w-4 h-4 mr-2" />
                Subir producto
              </Button>
            )}
          </div>
        </div>

        {/* Datos Bancarios - INFORMATIVO (para recibir pagos, no bloquea publicación) */}
        <div className="flex items-start gap-3">
          {requirements.hasBankData ? (
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">
                Datos bancarios: {requirements.hasBankData ? 'Completos' : 'Pendientes'}
              </p>
              {!requirements.hasBankData && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  Para recibir pagos
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {requirements.hasBankData 
                ? 'Tu información bancaria está lista para recibir pagos' 
                : 'Configura tus datos bancarios para poder recibir el dinero de tus ventas'}
            </p>
            {!requirements.hasBankData && (
              <Button
                variant="link"
                size="sm"
                className="px-0 h-auto mt-2"
                onClick={() => navigate('/mi-cuenta/datos-bancarios')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Configurar datos bancarios
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
