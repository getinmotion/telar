import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Languages, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { type Language, getLanguageConfig } from '@/types/language';

interface LanguageConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentLanguage: Language;
  newLanguage: Language;
  isLoading?: boolean;
}

export const LanguageConfirmationModal: React.FC<LanguageConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentLanguage,
  newLanguage,
  isLoading = false
}) => {
  const currentConfig = getLanguageConfig(currentLanguage);
  const newConfig = getLanguageConfig(newLanguage);

  const affectedAreas = [
    'Interfaz de usuario completa',
    'Coordinador Maestro',
    'Reportes y análisis', 
    'Notificaciones',
    'Contenido generado por IA'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Confirmar cambio de idioma
          </DialogTitle>
          <DialogDescription>
            Este cambio afectará toda tu experiencia en la plataforma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Language Change Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentConfig.flag}</span>
                  <div className="text-sm">
                    <p className="font-medium">{currentConfig.nativeName}</p>
                    <p className="text-muted-foreground">Actual</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 border-t border-muted-foreground"></div>
                  <div className="mx-2 text-muted-foreground">→</div>
                  <div className="w-8 border-t border-primary"></div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg">{newConfig.flag}</span>
                  <div className="text-sm">
                    <p className="font-medium">{newConfig.nativeName}</p>
                    <p className="text-muted-foreground">Nuevo</p>
                  </div>
                </div>
              </div>
              
              <Badge className="w-full justify-center bg-primary/10 text-primary hover:bg-primary/20">
                <Globe className="w-3 h-3 mr-1" />
                Incluye Coordinador Maestro
              </Badge>
            </CardContent>
          </Card>

          {/* Affected Areas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Áreas que se actualizarán:
            </div>
            <div className="ml-6 space-y-1">
              {affectedAreas.map((area, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  {area}
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Nota importante
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                El cambio puede tomar unos segundos en aplicarse completamente. 
                Se recargará la página para aplicar todos los cambios.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                Cambiando...
              </div>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};