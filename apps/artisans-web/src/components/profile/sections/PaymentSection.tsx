import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentSectionProps {
  hasBankData: boolean;
  bankStatus?: 'incomplete' | 'complete' | 'pending_review' | 'rejected';
  bankName?: string;
  accountType?: string;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  hasBankData,
  bankStatus,
  bankName,
  accountType,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (bankStatus) {
      case 'complete':
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Configurado
          </Badge>
        );
      case 'pending_review':
        return (
          <Badge variant="secondary">
            En revisión
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            Rechazado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-1" />
            Sin configurar
          </Badge>
        );
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
        <div>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Métodos de Pago
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configura tus datos bancarios para recibir pagos
          </CardDescription>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        {hasBankData && bankStatus === 'complete' ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Bank Info Display */}
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="p-1.5 sm:p-2 bg-background rounded-lg shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">{bankName || 'Banco configurado'}</p>
                <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                  {accountType?.replace(/_/g, ' ') || 'Cuenta bancaria'}
                </p>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => navigate('/mi-cuenta/datos-bancarios')}
              className="w-full sm:w-auto"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Datos Bancarios
            </Button>

            <p className="text-xs text-muted-foreground">
              Para modificar tus datos bancarios, contacta a soporte.
            </p>
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-muted/50 rounded-full w-fit mx-auto">
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">
                Configura tus datos bancarios para poder recibir pagos de tus ventas
              </p>
              <Button onClick={() => navigate('/mi-cuenta/datos-bancarios')} size="sm" className="w-full sm:w-auto">
                <CreditCard className="h-4 w-4 mr-2" />
                Agregar Datos Bancarios
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
