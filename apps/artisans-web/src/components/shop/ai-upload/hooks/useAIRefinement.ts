import { useState, useCallback } from 'react';
import { refineContent as refineContentAPI, analyzeImage as analyzeImageAPI } from '@/services/ai.actions';
import { uploadImage, UploadFolder } from '@/services/fileUpload.actions';
import type { ContentContext } from '@/services/ai.actions';

interface AIRefinementOptions {
  context: ContentContext;
  currentValue: string;
  userPrompt: string;
  additionalContext?: Record<string, any>;
}

export const useAIRefinement = () => {
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ MIGRATED: POST /ai/refine-content
  const refineContent = useCallback(async ({
    context,
    currentValue,
    userPrompt,
    additionalContext = {}
  }: AIRefinementOptions): Promise<string | null> => {
    setIsRefining(true);
    setError(null);

    try {
      const data = await refineContentAPI({
        context,
        currentValue,
        userPrompt,
        additionalContext
      });

      return data.refinedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error refinando contenido';
      setError(errorMessage);
      console.error('AI Refinement error:', err);
      return null;
    } finally {
      setIsRefining(false);
    }
  }, []);

  // Helper: Compress image before analysis
  const compressImage = useCallback(async (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxWidth) / height;
              height = maxWidth;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // ✅ MIGRATED: POST /ai/analyze-image
  const analyzeImages = useCallback(async (images: File[]): Promise<{
    suggestedName: string;
    suggestedDescription: string;
    detectedCategory: string;
    suggestedTags: string[];
  } | null> => {
    setIsRefining(true);
    setError(null);

    try {
      console.log('🔄 Starting image analysis for', images.length, 'images');

      // Validate files
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        console.log(`🔍 Validating image ${i + 1}:`, file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error(`La imagen "${file.name}" es muy grande (máx. 10MB)`);
        }
        if (!file.type.startsWith('image/')) {
          throw new Error(`El archivo "${file.name}" no es una imagen válida`);
        }
      }

      const imagesToAnalyze = images.slice(0, 3);
      if (images.length > 3) {
        console.log(`⚠️ Only analyzing first 3 of ${images.length} images`);
      }

      // Compress and upload images to S3 first (NestJS endpoint requires URLs)
      console.log('🗜️ Compressing and uploading images...');
      const imageUrls = await Promise.all(
        imagesToAnalyze.map(async (image, index) => {
          console.log(`📷 Processing image ${index + 1}:`, image.name, 'Original size:', image.size);

          // Compress image
          const compressedBase64 = await compressImage(image);

          // Convert base64 to Blob
          const base64Data = compressedBase64.split(',')[1] || compressedBase64;
          const blob = new Blob(
            [Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))],
            { type: 'image/jpeg' }
          );

          // Upload to S3
          const uploadResult = await uploadImage(blob, UploadFolder.PRODUCTS, `temp-analysis-${Date.now()}-${index}.jpg`);
          console.log(`✅ Image ${index + 1} uploaded:`, uploadResult.url);

          return uploadResult.url;
        })
      );

      console.log(`✅ Successfully uploaded ${imageUrls.length} images`);

      console.log('📤 Sending image URLs to AI analyzer...');

      // Add 45s timeout for the entire operation
      const analysisPromise = analyzeImageAPI({ images: imageUrls });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: El análisis está tomando más de 45 segundos')), 45000)
      );

      const data = await Promise.race([analysisPromise, timeoutPromise]);

      console.log('📥 AI analyzer response:', data);

      if (!data) {
        console.error('🚨 No analysis data received');
        throw new Error('No analysis data received from AI service');
      }

      console.log('✅ Analysis completed successfully:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error analizando imágenes';
      setError(errorMessage);
      console.error('❌ AI Image Analysis error:', err);
      return null;
    } finally {
      setIsRefining(false);
    }
  }, [compressImage]);

  return {
    refineContent,
    analyzeImages,
    isRefining,
    error,
  };
};