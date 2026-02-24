import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit } from 'lucide-react';
import { LegalGuideModal } from '@/components/tasks/StepSpecificModals/LegalGuideModal';

interface RutSectionProps {
  rut?: string;
  rutPending?: boolean;
  onComplete?: () => void;
}

export const RutSection: React.FC<RutSectionProps> = ({
  rut,
  rutPending,
  onComplete,
}) => {
  const [showRutModal, setShowRutModal] = useState(false);

  const handleComplete = () => {
    setShowRutModal(false);
    onComplete?.();
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Información Fiscal
          </CardTitle>
          <CardDescription>
            Tu RUT o NIT para facturación y pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">RUT / NIT</p>
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-medium">
                    {rut || 'No registrado'}
                  </p>
                  {rutPending && (
                    <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning rounded-full">
                      Pendiente
                    </span>
                  )}
                  {rut && !rutPending && (
                    <span className="text-xs px-2 py-0.5 bg-success/20 text-success rounded-full">
                      Verificado
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRutModal(true)}
            >
              {rut ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar RUT
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Registrar RUT
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <LegalGuideModal
        open={showRutModal}
        onClose={() => setShowRutModal(false)}
        onComplete={handleComplete}
        stepTitle="Registrar RUT"
      />
    </>
  );
};
