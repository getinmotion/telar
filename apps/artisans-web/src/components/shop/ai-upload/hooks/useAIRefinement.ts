import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AIRefinementOptions {
  context: string;
  currentValue: string;
  userPrompt: string;
  additionalContext?: Record<string, any>;
}

export const useAIRefinement = () => {
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refineContent = useCallback(async ({
    context,
    currentValue,
    userPrompt,
    additionalContext = {}
  }: AIRefinementOptions): Promise<string | null> => {
    setIsRefining(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-refiner', {
        body: {
          context,
          currentValue,
          userPrompt,
          additionalContext
        }
      });

      if (error) {
        throw new Error(error.message);
      }

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

      // Compress images first (max 800x800, 70% quality)
      console.log('🗜️ Compressing images...');
      const compressedImages = await Promise.all(
        imagesToAnalyze.map(async (image, index) => {
          console.log(`📷 Compressing image ${index + 1}:`, image.name, 'Original size:', image.size);
          const compressed = await compressImage(image);
          console.log(`✅ Image ${index + 1} compressed from ${image.size} to ~${Math.round(compressed.length * 0.75)} bytes`);
          return compressed;
        })
      );
      
      console.log(`✅ Successfully compressed ${compressedImages.length} images`);

      console.log('📤 Sending compressed images to AI analyzer...');

      // Add 45s timeout for the entire operation
      const analysisPromise = supabase.functions.invoke('ai-image-analyzer', {
        body: {
          images: compressedImages
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: El análisis está tomando más de 45 segundos')), 45000)
      );

      const { data, error } = await Promise.race([analysisPromise, timeoutPromise]) as any;

      console.log('📥 AI analyzer response:', { data, error });

      if (error) {
        console.error('🚨 Service error:', error);
        throw new Error(error.message);
      }

      if (data?.error) {
        console.error('🚨 Data error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.analysis) {
        console.error('🚨 No analysis data received:', data);
        throw new Error('No analysis data received from AI service');
      }

      console.log('✅ Analysis completed successfully:', data.analysis);
      return data.analysis;
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