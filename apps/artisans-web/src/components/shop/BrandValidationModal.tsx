import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Palette, Image, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BrandValidationModalProps {
  open: boolean;
  onClose: () => void;
  missingFields: string[];
  completionPercentage: number;
}

export const BrandValidationModal: React.FC<BrandValidationModalProps> = ({
  open,
  onClose,
  missingFields,
  completionPercentage
}) => {
  const navigate = useNavigate();

  const handleGoToBrandWizard = () => {
    onClose();
    navigate('/dashboard/brand-wizard');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Completa tu Identidad de Marca
          </DialogTitle>
          <DialogDescription>
            Para generar hero slides automáticos para tu tienda, primero necesitamos completar tu identidad de marca.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">Progreso de marca</span>
            <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
          </div>

          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">Te falta:</p>
              <ul className="space-y-2">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    {field.includes('Logo') && <Image className="w-4 h-4" />}
                    {field.includes('Colores') && <Palette className="w-4 h-4" />}
                    {field.includes('Claim') && <MessageSquare className="w-4 h-4" />}
                    {field}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> El Wizard de Marca te ayudará a crear tu logo, elegir colores y generar un claim profesional con ayuda de IA.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Más tarde
          </Button>
          <Button onClick={handleGoToBrandWizard} className="flex items-center gap-2">
            Ir al Wizard de Marca
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
