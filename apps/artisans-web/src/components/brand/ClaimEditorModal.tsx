import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ClaimEditorModalProps {
  currentClaim: string;
  brandName: string;
  onClose: () => void;
  onSave: (newClaim: string, newDiagnosis: any) => void;
}

export const ClaimEditorModal: React.FC<ClaimEditorModalProps> = ({
  currentClaim,
  brandName,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claim, setClaim] = useState(currentClaim);
  const [aiOptions, setAiOptions] = useState<Array<{ text: string; reasoning: string }>>([]);
  const [selectedAiClaim, setSelectedAiClaim] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scoreDiff, setScoreDiff] = useState<{ before: number; after: number } | null>(null);

  const handleGenerateWithAI = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const { data } = await supabase.functions.invoke('brand-ai-assistant', {
        body: {
          action: 'generate_claim',
          brandName,
          businessDescription: '',
          userId: user.id
        }
      });

      if (data?.claims) {
        setAiOptions(data.claims);
        toast({
          title: '✨ Claims Generados',
          description: `La IA creó ${data.claims.length} opciones`,
        });
      }
    } catch (error) {
      console.error('[ClaimEditorModal] Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron generar claims',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const finalClaim = selectedAiClaim || claim;
    if (!finalClaim.trim()) {
      toast({
        title: 'Campo vacío',
        description: 'Por favor ingresa o selecciona un claim',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Obtener diagnóstico actual
      const { data: contextData } = await supabase
        .from('user_master_context')
        .select('conversation_insights, business_profile')
        .eq('user_id', user.id)
        .single();

      const oldDiagnosis = (contextData?.conversation_insights as any)?.brand_diagnosis;
      const businessProfile = contextData?.business_profile as any;
      const conversationInsights = contextData?.conversation_insights as any;

      // 2. Re-diagnosticar con nuevo claim
      const { data: diagnosisData } = await supabase.functions.invoke('brand-ai-assistant', {
        body: {
          action: 'diagnose_brand_identity',
          logo_url: conversationInsights?.brand_evaluation?.logo_url,
          colors: {
            primary: conversationInsights?.brand_evaluation?.primary_colors || [],
            secondary: conversationInsights?.brand_evaluation?.secondary_colors || []
          },
          brand_name: brandName,
          business_description: businessProfile?.business_description || '',
          perception: conversationInsights?.brand_perception || {},
          claim: finalClaim
        }
      });

      const newDiagnosis = diagnosisData?.diagnosis;

      // 3. Calcular diff de scores
      if (oldDiagnosis && newDiagnosis) {
        const oldClaimScore = oldDiagnosis.scores?.claim?.score || 0;
        const newClaimScore = newDiagnosis.scores?.claim?.score || 0;
        setScoreDiff({ before: oldClaimScore, after: newClaimScore });
      }

      // 4. Actualizar context
      await supabase
        .from('user_master_context')
        .update({
          conversation_insights: {
            ...conversationInsights,
            brand_evaluation: {
              ...conversationInsights?.brand_evaluation,
              claim: finalClaim,
              has_claim: true
            },
            brand_diagnosis: {
              ...newDiagnosis,
              evaluated_at: new Date().toISOString(),
              changed_element: 'claim'
            }
          }
        })
        .eq('user_id', user.id);

      toast({
        title: '✅ Claim Actualizado',
        description: scoreDiff 
          ? `Tu score de claim cambió de ${scoreDiff.before.toFixed(1)} a ${scoreDiff.after.toFixed(1)}`
          : 'Tu claim ha sido actualizado y re-diagnosticado',
      });

      onSave(finalClaim, newDiagnosis);
    } catch (error) {
      console.error('[ClaimEditorModal] Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el claim',
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
          <DialogTitle>Mejorar Claim de {brandName}</DialogTitle>
          <DialogDescription>
            Edita tu claim o genera nuevas opciones con IA. El sistema re-evaluará automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Editor Manual */}
          <div>
            <Label className="mb-2 block">Editar Manualmente</Label>
            <Textarea
              value={claim}
              onChange={(e) => {
                setClaim(e.target.value);
                setSelectedAiClaim('');
              }}
              placeholder="Ej: Artesanía que cuenta historias"
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Claim actual: "{currentClaim}"
            </p>
          </div>

          {/* Generar con IA */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>O Generar con IA</Label>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generar 3 Opciones
                  </>
                )}
              </Button>
            </div>

            {aiOptions.length > 0 && (
              <RadioGroup value={selectedAiClaim} onValueChange={(value) => {
                setSelectedAiClaim(value);
                setClaim('');
              }}>
                <div className="space-y-3">
                  {aiOptions.map((option, idx) => (
                    <div key={idx} className="border rounded-lg p-4 cursor-pointer hover:border-primary transition">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={option.text} id={`ai-claim-${idx}`} />
                        <Label htmlFor={`ai-claim-${idx}`} className="flex-1 cursor-pointer">
                          <p className="font-semibold mb-1">"{option.text}"</p>
                          <p className="text-xs text-muted-foreground">{option.reasoning}</p>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
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
              disabled={(!claim.trim() && !selectedAiClaim) || isProcessing}
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
