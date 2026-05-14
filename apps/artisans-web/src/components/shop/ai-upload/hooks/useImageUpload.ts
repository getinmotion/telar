import { useState, useCallback } from 'react';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';
import { uploadImage, UploadFolder } from '@/services/fileUpload.actions';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'optimizing' | 'completed' | 'error';
  error?: string;
}

export const useImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateImage = (file: File): string | null => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return `El archivo ${file.name} es muy grande (máx 10MB)`;
    }

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return `El formato de ${file.name} no es válido. Usa JPG, PNG o WEBP`;
    }

    return null;
  };

  const createSafeFileName = (file: File, index: number): string => {
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    return `${Date.now()}_${index}_${sanitizedName}.${extension}`;
  };

  const uploadImages = useCallback(async (images: File[]): Promise<string[]> => {
    if (images.length === 0) {
      throw new Error('No hay imágenes para subir');
    }

    setIsUploading(true);

    // Initialize progress tracking
    const initialProgress: UploadProgress[] = images.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: 'pending'
    }));
    setUploadProgress(initialProgress);

    try {
      // Validate all images first
      for (const image of images) {
        const validation = validateImage(image);
        if (validation) {
          throw new Error(validation);
        }
      }

      // Upload images with progress tracking
      const uploadPromises = images.map(async (image, index) => {
        setUploadProgress(prev => prev.map((item, i) =>
          i === index ? { ...item, status: 'optimizing', progress: 5 } : item
        ));

        let optimizedImage: File;
        try {
          optimizedImage = await optimizeImage(image, ImageOptimizePresets.product);
          console.log(`📦 Image ${index + 1} optimized: ${Math.round(image.size / 1024)}KB → ${Math.round(optimizedImage.size / 1024)}KB`);
        } catch (optError) {
          console.warn(`⚠️ Optimization failed for ${image.name}, using original:`, optError);
          optimizedImage = image;
        }

        setUploadProgress(prev => prev.map((item, i) =>
          i === index ? { ...item, status: 'uploading', progress: 15 } : item
        ));

        try {
          console.log(`🔄 Uploading image ${index + 1}: ${optimizedImage.name}`);
          const result = await uploadImage(optimizedImage, UploadFolder.PRODUCTS, undefined, { suppressToast: true });

          setUploadProgress(prev => prev.map((item, i) =>
            i === index ? { ...item, status: 'completed', progress: 100 } : item
          ));

          console.log(`✅ Image ${index + 1} uploaded successfully:`, result.url);
          return result.url;
        } catch (uploadError) {
          console.error(`💥 Upload failed for ${optimizedImage.name}:`, uploadError);
          setUploadProgress(prev => prev.map((item, i) =>
            i === index ? {
              ...item,
              status: 'error',
              error: uploadError instanceof Error ? uploadError.message : 'Error desconocido'
            } : item
          ));
          throw uploadError;
        }
      });

      const urls = await Promise.all(uploadPromises);
      console.log(`🎉 All ${urls.length} images uploaded successfully:`, urls);
      return urls;

    } catch (error) {
      console.error('💥 Upload process failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress([]), 3000);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setUploadProgress([]);
    setIsUploading(false);
  }, []);

  return {
    uploadImages,
    uploadProgress,
    isUploading,
    resetProgress,
  };
};