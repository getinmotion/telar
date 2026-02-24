import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sparkles, ImageIcon, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ManualSlideContent {
  title: string;
  subtitle: string;
  ctaText: string;
  imageFile: File;
}

interface AIGenerationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    mode: 'ai' | 'upload', 
    references?: { text?: string; imageFile?: File },
    manualContent?: ManualSlideContent
  ) => void;
  slideTitle: string;
  slideSubtitle: string;
}

export const AIGenerationConfirmModal: React.FC<AIGenerationConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  slideTitle,
  slideSubtitle
}) => {
  // AI mode state
  const [referenceText, setReferenceText] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);

  // Upload mode state
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [uploadImagePreview, setUploadImagePreview] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubtitle, setManualSubtitle] = useState('');
  const [manualCtaText, setManualCtaText] = useState('Ver más');

  const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIConfirm = () => {
    onConfirm('ai', {
      text: referenceText || undefined,
      imageFile: referenceImage || undefined
    });
    resetState();
  };

  const handleUploadConfirm = () => {
    if (!uploadImage || !manualTitle.trim()) return;
    
    onConfirm('upload', undefined, {
      title: manualTitle.trim(),
      subtitle: manualSubtitle.trim(),
      ctaText: manualCtaText.trim() || 'Ver más',
      imageFile: uploadImage
    });
    resetState();
  };

  const resetState = () => {
    setReferenceText('');
    setReferenceImage(null);
    setReferenceImagePreview(null);
    setUploadImage(null);
    setUploadImagePreview(null);
    setManualTitle('');
    setManualSubtitle('');
    setManualCtaText('Ver más');
  };

  const canSubmitUpload = uploadImage && manualTitle.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Crear Slide para Hero
          </DialogTitle>
          <DialogDescription>
            Slide: "{slideTitle}" - "{slideSubtitle}"
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generar con IA
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Subir mi imagen
            </TabsTrigger>
          </TabsList>

          {/* AI Generation Tab */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm text-muted-foreground">
                La IA generará una imagen y contenido para tu hero slider basándose en la información de tu tienda.
                Puedes agregar referencias opcionales para guiar mejor el resultado.
              </p>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference-text">
                  Descripción de referencia (opcional)
                </Label>
                <Textarea
                  id="reference-text"
                  placeholder="Ej: Quiero una imagen con cerámica azul, ambiente cálido, iluminación natural..."
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference-image">
                  Imagen de referencia (opcional)
                </Label>
                <Input
                  id="reference-image"
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageChange}
                />
                {referenceImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={referenceImagePreview} 
                      alt="Vista previa" 
                      className="max-h-32 rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleAIConfirm}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generar con IA
              </Button>
            </div>
          </TabsContent>

          {/* Manual Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <Card className="p-4 bg-accent/10 border-accent/20">
              <p className="text-sm text-muted-foreground">
                Sube tu propia imagen y escribe el contenido manualmente. No se usará inteligencia artificial.
              </p>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-image">
                  Tu imagen *
                </Label>
                <Input
                  id="upload-image"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImageChange}
                />
                {uploadImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={uploadImagePreview} 
                      alt="Vista previa" 
                      className="max-h-40 rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-title">
                  Título *
                </Label>
                <Input
                  id="manual-title"
                  placeholder="Ej: Artesanía hecha con amor"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-subtitle">
                  Subtítulo (opcional)
                </Label>
                <Input
                  id="manual-subtitle"
                  placeholder="Ej: Piezas únicas para tu hogar"
                  value={manualSubtitle}
                  onChange={(e) => setManualSubtitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-cta">
                  Texto del botón
                </Label>
                <Input
                  id="manual-cta"
                  placeholder="Ver más"
                  value={manualCtaText}
                  onChange={(e) => setManualCtaText(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUploadConfirm}
                disabled={!canSubmitUpload}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Slide
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
