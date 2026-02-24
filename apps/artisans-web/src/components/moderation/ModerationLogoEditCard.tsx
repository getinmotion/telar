import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ImageIcon, 
  Upload, 
  Save, 
  X,
  CheckCircle,
  XCircle,
  Pencil
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface ModerationLogoEditCardProps {
  shopId: string;
  shopName: string;
  currentLogoUrl: string | null;
  onLogoUpdated?: () => void;
}

export const ModerationLogoEditCard: React.FC<ModerationLogoEditCardProps> = ({
  shopId,
  shopName,
  currentLogoUrl,
  onLogoUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe superar 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Optimize image before upload
      console.log('[ModerationLogoEditCard] Optimizing logo...');
      const optimizedFile = await optimizeImage(selectedFile, ImageOptimizePresets.logo);
      
      // Upload to storage
      const fileName = `${shopId}-${Date.now()}.${optimizedFile.name.split('.').pop()}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, optimizedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error('Error al subir la imagen');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);

      const newLogoUrl = urlData.publicUrl;

      // Call edge function to update
      const { data, error: updateError } = await supabase.functions.invoke(
        'update-shop-logo-admin',
        { body: { shopId, newLogoUrl } }
      );

      if (updateError) {
        throw new Error(updateError.message || 'Error al actualizar el logo');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Logo actualizado exitosamente');
      handleCancel();
      onLogoUpdated?.();
    } catch (err: any) {
      console.error('Error updating logo:', err);
      toast.error(err.message || 'Error al actualizar el logo');
    } finally {
      setUploading(false);
    }
  };

  const hasLogo = !!currentLogoUrl;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo de la Tienda
          </CardTitle>
          <Badge variant={hasLogo ? "default" : "secondary"} className="gap-1">
            {hasLogo ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Configurado
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Sin logo
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          {/* Current or Preview Logo */}
          <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 border-2 border-dashed border-border">
            {(previewUrl || currentLogoUrl) ? (
              <img
                src={previewUrl || currentLogoUrl || ''}
                alt={shopName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 space-y-3">
            {isEditing ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!selectedFile ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar imagen
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={uploading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {hasLogo 
                    ? 'Puedes cambiar el logo de esta tienda.'
                    : 'Esta tienda no tiene logo configurado.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  {hasLogo ? 'Cambiar logo' : 'Agregar logo'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
