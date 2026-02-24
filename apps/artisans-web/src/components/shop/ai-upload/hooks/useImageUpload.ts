import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

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

      // Check authentication first (before any uploads)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado - por favor inicia sesión');
      }
      console.log(`✅ User authenticated: ${user.id}`);

      // Upload images with progress tracking and retry logic
      const uploadPromises = images.map(async (image, index) => {
        // Update progress to optimizing
        setUploadProgress(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'optimizing', progress: 5 } : item
        ));

        // Optimize image before upload
        let optimizedImage: File;
        try {
          optimizedImage = await optimizeImage(image, ImageOptimizePresets.product);
          console.log(`📦 Image ${index + 1} optimized: ${Math.round(image.size / 1024)}KB → ${Math.round(optimizedImage.size / 1024)}KB`);
        } catch (optError) {
          console.warn(`⚠️ Optimization failed for ${image.name}, using original:`, optError);
          optimizedImage = image;
        }

        const fileName = createSafeFileName(optimizedImage, index);

        // Update progress to uploading
        setUploadProgress(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'uploading', progress: 15 } : item
        ));

        const attemptUpload = async (retryCount = 0): Promise<string> => {
          try {
            console.log(`🔄 Uploading image ${index + 1}: ${fileName} (attempt ${retryCount + 1})`);
            console.log(`📊 Image details:`, {
              originalSize: Math.round(image.size / 1024) + 'KB',
              optimizedSize: Math.round(optimizedImage.size / 1024) + 'KB',
              type: optimizedImage.type,
              name: optimizedImage.name,
              fileName: fileName,
            });

            // Upload directly to root path to avoid subfolder permission issues
            const uploadResponse = await supabase.storage
              .from('images')
              .upload(fileName, optimizedImage, {
                contentType: optimizedImage.type,
                cacheControl: '3600',
                upsert: false
              });

            console.log(`📥 Upload response for ${fileName}:`, {
              hasData: !!uploadResponse.data,
              hasError: !!uploadResponse.error,
              dataPath: uploadResponse.data?.path
            });

            // Enhanced error handling with response validation
            if (uploadResponse.error) {
              console.error(`❌ Storage upload error for ${fileName}:`, uploadResponse.error);
              
              // Check if error message contains JSON parsing issues
              if (uploadResponse.error.message?.includes('mime type application/json')) {
                console.error(`🚨 JSON MIME type error detected - this indicates Supabase returned an error response instead of accepting the file`);
                console.error(`🔍 Full error context:`, {
                  message: uploadResponse.error.message,
                  bucket: 'images',
                  path: fileName,
                  userId: user.id,
                  fileType: image.type,
                  fileSize: image.size,
                  retryCount
                });
                
                // If first attempt, try with different approach
                if (retryCount === 0) {
                  console.log(`🔄 Retrying upload with different configuration...`);
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                  return attemptUpload(1);
                }
              }
              
              throw new Error(`Error subiendo ${image.name}: ${uploadResponse.error.message}`);
            }

            // Validate response data
            if (!uploadResponse.data || !uploadResponse.data.path) {
              throw new Error(`Respuesta inválida del servidor para ${image.name}`);
            }

            // Update progress to 70%
            setUploadProgress(prev => prev.map((item, i) => 
              i === index ? { ...item, progress: 70 } : item
            ));

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(uploadResponse.data.path);

            // Validate public URL
            if (!publicUrl || !publicUrl.includes(fileName)) {
              throw new Error(`URL pública inválida para ${image.name}`);
            }

            // Update progress to completed
            setUploadProgress(prev => prev.map((item, i) => 
              i === index ? { ...item, status: 'completed', progress: 100 } : item
            ));

            console.log(`✅ Image ${index + 1} uploaded successfully:`, publicUrl);
            return publicUrl;

          } catch (uploadError) {
            console.error(`💥 Upload attempt ${retryCount + 1} failed for ${fileName}:`, uploadError);
            
            // If it's the first attempt and not a JSON mime type error, retry once
            if (retryCount === 0 && !uploadError.message?.includes('mime type application/json')) {
              console.log(`🔄 Retrying upload for ${fileName}...`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
              return attemptUpload(1);
            }
            
            throw uploadError;
          }
        };

        try {
          return await attemptUpload();
        } catch (uploadError) {
          // Update progress to error
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