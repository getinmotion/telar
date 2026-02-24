import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ClasificacionOficial } from '@/types/artisan';
import { Loader2, Sparkles, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useArtisanClassifier } from '@/hooks/useArtisanClassifier';
import { useAuth } from '@/context/AuthContext';

interface ArtisanClassificationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classification: ClasificacionOficial | null;
  onSave: (classification: ClasificacionOficial) => void;
}

export const ArtisanClassificationEditDialog: React.FC<ArtisanClassificationEditDialogProps> = ({
  open,
  onOpenChange,
  classification,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { classifyArtisan, isClassifying } = useArtisanClassifier();
  
  const [businessDescription, setBusinessDescription] = useState('');
  const [manualClassification, setManualClassification] = useState<Partial<ClasificacionOficial>>(
    classification || {}
  );
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  const handleAutoClassify = async () => {
    if (!businessDescription.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Por favor describe tu negocio para clasificarlo automáticamente",
        variant: "destructive"
      });
      return;
    }

    const result = await classifyArtisan(businessDescription, user?.id);
    
    if (result) {
      toast({
        title: "✨ Clasificación completada",
        description: "Tu oficio ha sido clasificado según el catálogo oficial",
      });
      onSave(result);
      onOpenChange(false);
    }
  };

  const handleManualSave = () => {
    if (!manualClassification.oficio || !manualClassification.materiaPrima) {
      toast({
        title: "Campos requeridos",
        description: "Debes completar al menos el oficio y la materia prima",
        variant: "destructive"
      });
      return;
    }

    const fullClassification: ClasificacionOficial = {
      oficio: manualClassification.oficio || '',
      codigoOficioCUOC: manualClassification.codigoOficioCUOC || '',
      codigoOficioAdeC: manualClassification.codigoOficioAdeC || '',
      materiaPrima: manualClassification.materiaPrima || '',
      codigoMateriaPrimaCUOC: manualClassification.codigoMateriaPrimaCUOC || '',
      codigoMateriaPrimaAdeC: manualClassification.codigoMateriaPrimaAdeC || '',
      tecnicas: manualClassification.tecnicas || [],
      confianza: 1.0,
      justificacion: manualClassification.justificacion,
      fechaClasificacion: new Date(),
      clasificadoAutomaticamente: false,
      clasificadoPorUsuario: true
    };

    onSave(fullClassification);
    onOpenChange(false);
    toast({
      title: "Clasificación guardada",
      description: "Tu clasificación manual ha sido guardada exitosamente",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {classification ? 'Editar Clasificación' : 'Agregar Clasificación Oficial'}
          </DialogTitle>
        <DialogDescription>
            Clasifica tu oficio según el catálogo oficial de artesanía colombiana
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de Modo */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'auto' ? 'default' : 'outline'}
              onClick={() => setMode('auto')}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Clasificación Automática
            </Button>
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className="flex-1"
            >
              Manual
            </Button>
          </div>

          {mode === 'auto' ? (
            /* Modo Automático */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Describe tu negocio artesanal</Label>
                <Textarea
                  placeholder="Ejemplo: Soy un artesano que trabaja la greda para crear vasijas y ceramios decorativos utilizando técnicas tradicionales de alfarería..."
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Incluye información sobre los materiales que usas, técnicas y tipos de productos que creas
                </p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Clasificación Inteligente
                </h4>
              <p className="text-sm text-muted-foreground">
                  Nuestro sistema analizará tu descripción y la clasificará según el Registro Nacional de Artesanías de Colombia (RNA).
                </p>
              </div>
            </div>
          ) : (
            /* Modo Manual */
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="oficio">Oficio *</Label>
                  <Input
                    id="oficio"
                    placeholder="Ej: Alfarero/a"
                    value={manualClassification.oficio || ''}
                    onChange={(e) => setManualClassification({
                      ...manualClassification,
                      oficio: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="materiaPrima">Materia Prima *</Label>
                  <Input
                    id="materiaPrima"
                    placeholder="Ej: Greda"
                    value={manualClassification.materiaPrima || ''}
                    onChange={(e) => setManualClassification({
                      ...manualClassification,
                      materiaPrima: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codigoOficioCUOC">Código CUOC Oficio</Label>
                  <Input
                    id="codigoOficioCUOC"
                    placeholder="Ej: 7313"
                    value={manualClassification.codigoOficioCUOC || ''}
                    onChange={(e) => setManualClassification({
                      ...manualClassification,
                      codigoOficioCUOC: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoOficioAdeC">Código AdeC Oficio</Label>
                  <Input
                    id="codigoOficioAdeC"
                    placeholder="Ej: ALF-01"
                    value={manualClassification.codigoOficioAdeC || ''}
                    onChange={(e) => setManualClassification({
                      ...manualClassification,
                      codigoOficioAdeC: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codigoMateriaPrimaCUOC">Código CUOC Materia</Label>
                  <Input
                    id="codigoMateriaPrimaCUOC"
                    placeholder="Ej: GRE-01"
                    value={manualClassification.codigoMateriaPrimaCUOC || ''}
                    onChange={(e) => setManualClassification({
                      ...manualClassification,
                      codigoMateriaPrimaCUOC: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoMateriaPrimaAdeC">Código AdeC Materia</Label>
                  <Input
                    id="codigoMateriaPrimaAdeC"
                    placeholder="Ej: GRE-01"
                    value={manualClassification.codigoMateriaPrimaAdeC || ''}
                    onChange={(e) => setManualClassification({
                      ...manualClassification,
                      codigoMateriaPrimaAdeC: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justificacion">Justificación (opcional)</Label>
                <Textarea
                  id="justificacion"
                  placeholder="Explica brevemente por qué esta clasificación se ajusta a tu oficio..."
                  value={manualClassification.justificacion || ''}
                  onChange={(e) => setManualClassification({
                    ...manualClassification,
                    justificacion: e.target.value
                  })}
                  rows={3}
                />
              </div>

              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                <p>💡 Los campos con * son obligatorios. Los códigos CUOC y AdeC son opcionales pero recomendados para una clasificación más precisa.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClassifying}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          {mode === 'auto' ? (
            <Button
              onClick={handleAutoClassify}
              disabled={isClassifying || !businessDescription.trim()}
            >
              {isClassifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clasificando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Clasificar Automáticamente
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleManualSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Clasificación
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
