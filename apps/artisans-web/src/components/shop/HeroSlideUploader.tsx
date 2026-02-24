import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Wand2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSlideUploaderProps {
  onSlideCreated: (slide: HeroSlide) => void;
  shopContext: {
    shopName: string;
    craftType: string;
    brandClaim: string;
    brandColors: string[];
  };
}

export const HeroSlideUploader: React.FC<HeroSlideUploaderProps> = ({
  onSlideCreated,
  shopContext
}) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [mode, setMode] = useState<'ai-full' | 'ai-refine' | 'manual'>('ai-full');
  const [manualInputs, setManualInputs] = useState({
    title: '',
    subtitle: '',
    ctaText: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Imagen muy grande',
        description: 'La imagen debe ser menor a 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    disabled: isUploading || isGenerating
  });

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreviewUrl('');
    setManualInputs({ title: '', subtitle: '', ctaText: '' });
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Optimize image before upload
    const optimizedFile = await optimizeImage(file, ImageOptimizePresets.hero);
    console.log(`[HeroSlideUploader] Optimized: ${Math.round(file.size / 1024)}KB → ${Math.round(optimizedFile.size / 1024)}KB`);

    const fileExt = optimizedFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('hero-images')
      .upload(fileName, optimizedFile, {
        contentType: optimizedFile.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('hero-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleGenerateWithAI = async () => {
    if (!uploadedImage) {
      toast({
        title: 'Imagen requerida',
        description: 'Por favor sube una imagen primero',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setIsGenerating(true);

    try {
      // Upload image to storage
      const imageUrl = await uploadImageToStorage(uploadedImage);

      // Call edge function to generate content
      const { data, error } = await supabase.functions.invoke('generate-hero-slide-from-image', {
        body: {
          imageUrl,
          shopName: shopContext.shopName,
          craftType: shopContext.craftType,
          brandClaim: shopContext.brandClaim,
          brandColors: shopContext.brandColors,
          mode: mode === 'ai-full' ? 'full' : 'refine',
          ...(mode === 'ai-refine' && { manualInputs })
        }
      });

      if (error) throw error;

      const newSlide: HeroSlide = {
        id: `slide-${Date.now()}`,
        image: imageUrl,
        title: data.title,
        subtitle: data.subtitle,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink
      };

      onSlideCreated(newSlide);

      toast({
        title: '¡Slide creado!',
        description: 'El slide se agregó exitosamente con contenido generado por IA',
      });

      // Reset form
      handleRemoveImage();

    } catch (error) {
      console.error('Error creating hero slide:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el slide',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  };

  const handleManualUpload = async () => {
    if (!uploadedImage) {
      toast({
        title: 'Imagen requerida',
        description: 'Por favor sube una imagen primero',
        variant: 'destructive'
      });
      return;
    }

    if (!manualInputs.title.trim() || !manualInputs.subtitle.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa el título y subtítulo',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadImageToStorage(uploadedImage);

      const newSlide: HeroSlide = {
        id: `slide-${Date.now()}`,
        image: imageUrl,
        title: manualInputs.title.trim(),
        subtitle: manualInputs.subtitle.trim(),
        ctaText: manualInputs.ctaText.trim() || 'Ver productos'
      };

      onSlideCreated(newSlide);

      toast({
        title: '¡Slide creado!',
        description: 'El slide se agregó exitosamente',
      });

      handleRemoveImage();

    } catch (error) {
      console.error('Error creating hero slide:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el slide',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Agregar Slide</h3>

      {!uploadedImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-muted-foreground">Suelta la imagen aquí...</p>
          ) : (
            <>
              <p className="text-sm font-medium mb-2">
                Arrastra una imagen o haz click para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG o WEBP (máx. 5MB)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-lg overflow-hidden bg-muted">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={isUploading || isGenerating}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Mode Selection */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className="flex-1"
              disabled={isUploading || isGenerating}
            >
              <Upload className="w-4 h-4 mr-2" />
              Solo subir
            </Button>
            <Button
              variant={mode === 'ai-full' ? 'default' : 'outline'}
              onClick={() => setMode('ai-full')}
              className="flex-1"
              disabled={isUploading || isGenerating}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              IA genera
            </Button>
            <Button
              variant={mode === 'ai-refine' ? 'default' : 'outline'}
              onClick={() => setMode('ai-refine')}
              className="flex-1"
              disabled={isUploading || isGenerating}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Refinar con IA
            </Button>
          </div>

          {/* Manual Inputs (for manual and refine modes) */}
          {(mode === 'manual' || mode === 'ai-refine') && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título {mode === 'manual' && <span className="text-destructive">*</span>}</Label>
                <Input
                  id="title"
                  placeholder="Ej: Descubre nuestra colección"
                  value={manualInputs.title}
                  onChange={(e) => setManualInputs({ ...manualInputs, title: e.target.value })}
                  disabled={isUploading || isGenerating}
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtítulo {mode === 'manual' && <span className="text-destructive">*</span>}</Label>
                <Textarea
                  id="subtitle"
                  placeholder="Ej: Productos artesanales hechos a mano"
                  value={manualInputs.subtitle}
                  onChange={(e) => setManualInputs({ ...manualInputs, subtitle: e.target.value })}
                  disabled={isUploading || isGenerating}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="ctaText">Texto del botón</Label>
                <Input
                  id="ctaText"
                  placeholder="Ej: Ver productos (opcional)"
                  value={manualInputs.ctaText}
                  onChange={(e) => setManualInputs({ ...manualInputs, ctaText: e.target.value })}
                  disabled={isUploading || isGenerating}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          {mode === 'manual' ? (
            <Button
              onClick={handleManualUpload}
              className="w-full"
              disabled={isUploading || !manualInputs.title.trim() || !manualInputs.subtitle.trim()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo imagen...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir slide
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleGenerateWithAI}
              className="w-full"
              disabled={isUploading || isGenerating || (mode === 'ai-refine' && !manualInputs.title)}
            >
              {isUploading || isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? 'Subiendo imagen...' : 'Generando contenido...'}
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {mode === 'ai-full' ? 'Generar slide con IA' : 'Refinar y crear slide'}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
