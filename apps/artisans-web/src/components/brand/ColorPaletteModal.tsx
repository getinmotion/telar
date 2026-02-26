import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { generateColorPalette, diagnoseBrandIdentity } from '@/services/brandAiAssistant.actions';
import { getUserMasterContextByUserId, updateUserMasterContext } from '@/services/userMasterContext.actions';
import { Loader2, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';

interface ColorPaletteModalProps {
  currentColors: {
    primary_colors: string[];
    secondary_colors: string[];
  };
  brandName: string;
  logoUrl: string | null;
  onClose: () => void;
  onSave: (newColors: any, newDiagnosis: any) => void;
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
  currentColors,
  brandName,
  logoUrl,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [primaryColors, setPrimaryColors] = useState<string[]>(currentColors.primary_colors);
  const [secondaryColors, setSecondaryColors] = useState<string[]>(currentColors.secondary_colors);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scoreDiff, setScoreDiff] = useState<{ before: number; after: number } | null>(null);

  const handleColorChange = (index: number, value: string, isPrimary: boolean) => {
    if (isPrimary) {
      const newColors = [...primaryColors];
      newColors[index] = value;
      setPrimaryColors(newColors);
    } else {
      const newColors = [...secondaryColors];
      newColors[index] = value;
      setSecondaryColors(newColors);
    }
  };

  const handleGenerateWithAI = async () => {
    setIsProcessing(true);
    try {
      const { secondary_colors } = await generateColorPalette(primaryColors);
      if (secondary_colors?.length) {
        setSecondaryColors(secondary_colors);
        toast({
          title: '✨ Colores Generados',
          description: 'La IA creó una paleta complementaria',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron generar colores',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // 1. Obtener contexto actual
      const contextData = await getUserMasterContextByUserId(user.id);

      const conversationInsights = contextData?.conversationInsights as Record<string, any> | undefined;
      const businessProfile = contextData?.businessProfile as Record<string, any> | undefined;
      const oldDiagnosis = conversationInsights?.brand_diagnosis;

      // 2. Re-diagnosticar con nuevos colores
      const { diagnosis: newDiagnosis } = await diagnoseBrandIdentity({
        logoUrl,
        colors: { primary: primaryColors, secondary: secondaryColors },
        brandName,
        businessDescription: businessProfile?.businessDescription || businessProfile?.business_description || '',
        perception: conversationInsights?.brand_perception || {},
      });

      // 3. Calcular diff de scores usando variables locales para el toast
      const colorScoreBefore = oldDiagnosis?.scores?.color?.score || 0;
      const colorScoreAfter = newDiagnosis?.scores?.color?.score || 0;
      if (oldDiagnosis && newDiagnosis) {
        setScoreDiff({ before: colorScoreBefore, after: colorScoreAfter });
      }

      // 4. Actualizar context
      await updateUserMasterContext(user.id, {
        conversationInsights: {
          ...conversationInsights,
          brand_evaluation: {
            ...conversationInsights?.brand_evaluation,
            primary_colors: primaryColors,
            secondary_colors: secondaryColors,
            has_colors: true,
          },
          brand_diagnosis: {
            ...newDiagnosis,
            evaluated_at: new Date().toISOString(),
            changed_element: 'colors',
          },
        },
      });

      toast({
        title: '✅ Colores Actualizados',
        description: (oldDiagnosis && newDiagnosis)
          ? `Tu score de color cambió de ${colorScoreBefore.toFixed(1)} a ${colorScoreAfter.toFixed(1)}`
          : 'Tu paleta ha sido actualizada y re-diagnosticada',
      });

      onSave({ primary_colors: primaryColors, secondary_colors: secondaryColors }, newDiagnosis);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los colores',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajustar Paleta de Colores de {brandName}</DialogTitle>
          <DialogDescription>
            Modifica los colores de tu marca. La IA re-evaluará automáticamente la armonía y coherencia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Colores Primarios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="font-semibold">Colores Primarios</Label>
              <span className="text-xs text-muted-foreground">{primaryColors.length} colores</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {primaryColors.map((color, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className="w-full h-20 rounded-lg border-2 border-border shadow-sm cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const input = document.getElementById(`primary-${idx}`) as HTMLInputElement;
                      input?.click();
                    }}
                  />
                  <Input
                    id={`primary-${idx}`}
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(idx, e.target.value, true)}
                    className="h-8"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(idx, e.target.value, true)}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Colores Secundarios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="font-semibold">Colores Secundarios</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateWithAI}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Generar con IA
                </Button>
                <AIDisclaimer variant="tooltip" context="generate" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {secondaryColors.map((color, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className="w-full h-20 rounded-lg border-2 border-border shadow-sm cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const input = document.getElementById(`secondary-${idx}`) as HTMLInputElement;
                      input?.click();
                    }}
                  />
                  <Input
                    id={`secondary-${idx}`}
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(idx, e.target.value, false)}
                    className="h-8"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(idx, e.target.value, false)}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Score Diff Display */}
          {scoreDiff && (
            <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{scoreDiff.before.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Antes</div>
              </div>
              <div>
                {scoreDiff.after > scoreDiff.before ? (
                  <TrendingUp className="w-6 h-6 text-success" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-destructive" />
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{scoreDiff.after.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Después</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                'Guardar y Re-diagnosticar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
