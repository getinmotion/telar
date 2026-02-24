import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface LogoEditModalProps {
  currentLogoUrl: string | null;
  brandName: string;
  onClose: () => void;
  onSave: (newLogoUrl: string, newDiagnosis: any) => void;
}

export const LogoEditModal: React.FC<LogoEditModalProps> = ({
  currentLogoUrl,
  brandName,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scoreDiff, setScoreDiff] = useState<{ before: number; after: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!newLogoFile || !user) return;

    setIsUploading(true);

    try {
      // Optimize logo before upload
      const optimizedFile = await optimizeImage(newLogoFile, ImageOptimizePresets.logo);
      console.log(`[LogoEditModal] Optimized: ${Math.round(newLogoFile.size / 1024)}KB → ${Math.round(optimizedFile.size / 1024)}KB`);

      // 1. Upload nuevo logo
      const fileName = `${user.id}/logo_${Date.now()}.${optimizedFile.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, optimizedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      // 2. Extraer colores del nuevo logo
      const { data: colorsData } = await supabase.functions.invoke('brand-ai-assistant', {
        body: { action: 'extract_colors', logoUrl: publicUrl }
      });

      // 3. Re-diagnosticar automáticamente
      const { data: contextData } = await supabase
        .from('user_master_context')
        .select('conversation_insights, business_profile')
        .eq('user_id', user.id)
        .single();

      const oldDiagnosis = (contextData?.conversation_insights as any)?.brand_diagnosis;
      const businessProfile = contextData?.business_profile as any;
      const conversationInsights = contextData?.conversation_insights as any;

      const { data: diagnosisData } = await supabase.functions.invoke('brand-ai-assistant', {
        body: {
          action: 'diagnose_brand_identity',
          logo_url: publicUrl,
          colors: {
            primary: colorsData?.colors || [],
            secondary: conversationInsights?.brand_evaluation?.secondary_colors || []
          },
          brand_name: brandName,
          business_description: businessProfile?.business_description || '',
          perception: conversationInsights?.brand_perception || {}
        }
      });

      const newDiagnosis = diagnosisData?.diagnosis;

      // 4. Calcular diff de scores
      if (oldDiagnosis && newDiagnosis) {
        const oldLogoScore = oldDiagnosis.scores?.logo?.score || 0;
        const newLogoScore = newDiagnosis.scores?.logo?.score || 0;
        setScoreDiff({ before: oldLogoScore, after: newLogoScore });
      }

      // 5. Actualizar context
      await supabase
        .from('user_master_context')
        .update({
          conversation_insights: {
            ...conversationInsights,
            brand_evaluation: {
              ...conversationInsights?.brand_evaluation,
              logo_url: publicUrl,
              has_logo: true,
              primary_colors: colorsData?.colors || []
            },
            brand_diagnosis: {
              ...newDiagnosis,
              evaluated_at: new Date().toISOString(),
              changed_element: 'logo'
            }
          }
        })
        .eq('user_id', user.id);

      toast({
        title: '✅ Logo Actualizado',
        description: scoreDiff 
          ? `Tu score de logo cambió de ${scoreDiff.before.toFixed(1)} a ${scoreDiff.after.toFixed(1)}`
          : 'Tu logo ha sido actualizado y re-diagnosticado',
      });

      onSave(publicUrl, newDiagnosis);
    } catch (error) {
      console.error('[LogoEditModal] Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el logo',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Logo de {brandName}</DialogTitle>
          <DialogDescription>
            Sube un nuevo logo. La IA lo analizará automáticamente y actualizará tu diagnóstico.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Comparación lado a lado */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Logo Actual</Label>
              <div className="border-2 border-dashed rounded-lg p-4 h-48 flex items-center justify-center bg-muted/20">
                {currentLogoUrl ? (
                  <img src={currentLogoUrl} alt="Logo actual" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-muted-foreground">Sin logo</span>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Nuevo Logo</Label>
              <div className="border-2 border-dashed border-primary rounded-lg p-4 h-48 flex items-center justify-center bg-primary/5">
                {previewUrl ? (
                  <img src={previewUrl} alt="Nuevo logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Vista previa</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Input */}
          <div>
            <Label htmlFor="new-logo-upload">Seleccionar Nuevo Logo</Label>
            <Input
              id="new-logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
            />
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
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isUploading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!newLogoFile || isUploading}
              className="flex-1"
            >
              {isUploading ? (
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
