import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, X, ImageIcon, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WizardState } from '../hooks/useWizardState';
import { SaveDraftButton } from '../components/SaveDraftButton';

interface Step1ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  onNext: () => void;
  wizardState: WizardState;
}

export const Step1ImageUpload: React.FC<Step1ImageUploadProps> = ({
  images,
  onImagesChange,
  onNext,
  wizardState,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validImages = acceptedFiles.filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} es muy grande (máx 10MB)`);
        return false;
      }
      
      return true;
    });

    if (validImages.length > 0) {
      const newImages = [...images, ...validImages].slice(0, 5); // Max 5 images
      onImagesChange(newImages);
      toast.success(`${validImages.length} imagen(es) agregada(s)`);
    }
  }, [images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.info('Imagen eliminada');
  };

  const handleNext = () => {
    if (images.length === 0) {
      toast.error('Sube al menos una imagen para continuar');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${dragActive || isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`w-12 h-12 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {dragActive ? '¡Suelta las imágenes aquí!' : 'Sube las fotos de tu producto'}
            </p>
            <p className="text-sm text-muted-foreground">
              Arrastra y suelta o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo 5 imágenes • JPG, PNG, WEBP • Máx 10MB cada una
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Imágenes seleccionadas ({images.length}/5)</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Producto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Image info */}
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  <p className="truncate">{image.name}</p>
                  <p>{Math.round(image.size / 1024)}KB</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Consejos para mejores fotos
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Usa buena iluminación natural cuando sea posible</li>
          <li>• Incluye diferentes ángulos del producto</li>
          <li>• Muestra detalles importantes como texturas o acabados</li>
          <li>• Usa fondos simples y limpios</li>
          <li>• La primera imagen será la principal en tu tienda</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <SaveDraftButton 
          wizardState={wizardState}
          variant="outline"
        />

        <Button
          onClick={handleNext}
          disabled={images.length === 0}
          className="flex items-center gap-2"
        >
          Continuar con IA
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
