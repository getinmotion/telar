import { useState, useCallback } from 'react';
import { useImageUpload } from '@/components/shop/ai-upload/hooks/useImageUpload';
import { useProductPublish } from './useProductPublish';
import { useAIRefinement } from '@/components/shop/ai-upload/hooks/useAIRefinement';
import { toast } from 'sonner';

interface BatchItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'analyzing' | 'uploading' | 'completed' | 'error';
  aiData?: {
    name: string;
    description: string;
    category: string;
    price: number;
  };
  error?: string;
  progress: number;
}

type UpdateItemCallback = (
  id: string,
  status: BatchItem['status'],
  progress: number,
  aiData?: any,
  error?: string,
  productId?: string
) => void;

export const useBatchUpload = () => {
  const [batchProgress, setBatchProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const { uploadImages } = useImageUpload();
  const { publishProduct } = useProductPublish();
  const { analyzeImages } = useAIRefinement();

  const processItem = async (
    item: BatchItem,
    updateCallback: UpdateItemCallback
  ): Promise<void> => {
    try {
      // Step 1: Analyze with AI
      updateCallback(item.id, 'analyzing', 10);
      
      const analysis = await analyzeImages([item.file]);
      const aiData = {
        name: analysis.suggestedName || `Producto ${item.id.split('_')[1]}`,
        description: analysis.suggestedDescription || 'Hermoso producto artesanal hecho a mano',
        category: analysis.detectedCategory || 'General',
        price: 50000 // Default price
      };

      updateCallback(item.id, 'analyzing', 30, aiData);

      // Step 2: Upload image
      updateCallback(item.id, 'uploading', 40);
      
      const imageUrls = await uploadImages([item.file]);
      
      updateCallback(item.id, 'uploading', 70);

      // Step 3: Publish product
      const productData = {
        name: aiData.name,
        description: aiData.description,
        price: aiData.price,
        category: aiData.category,
        images: imageUrls,
        tags: analysis.suggestedTags || ['artesanal'],
        shortDescription: aiData.description.substring(0, 100),
        inventory: 1,
        productionTime: '3-5 días hábiles'
      };

      updateCallback(item.id, 'uploading', 90);

      const result = await publishProduct(productData, {
        showToasts: false,
        skipValidation: false
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al publicar producto');
      }

      updateCallback(item.id, 'completed', 100, aiData, undefined, result.productId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      updateCallback(item.id, 'error', 0, undefined, errorMessage);
      throw error;
    }
  };

  const processBatch = useCallback(async (
    items: BatchItem[],
    updateCallback: UpdateItemCallback
  ) => {
    if (items.length === 0) return;

    setIsRunning(true);
    setBatchProgress(0);
    setCompletedCount(0);
    setErrorCount(0);

    const pendingItems = items.filter(item => item.status === 'pending');
    const totalItems = pendingItems.length;
    
    if (totalItems === 0) {
      setIsRunning(false);
      return;
    }

    let completed = 0;
    let errors = 0;

    // Process items in batches of 3 to avoid overwhelming the system
    const BATCH_SIZE = 3;
    const batches = [];
    
    for (let i = 0; i < pendingItems.length; i += BATCH_SIZE) {
      batches.push(pendingItems.slice(i, i + BATCH_SIZE));
    }

    try {
      for (const batch of batches) {
        const promises = batch.map(async (item) => {
          try {
            await processItem(item, updateCallback);
            completed++;
            setCompletedCount(completed);
          } catch (error) {
            errors++;
            setErrorCount(errors);
          }
          
          // Update overall progress
          const progress = ((completed + errors) / totalItems) * 100;
          setBatchProgress(progress);
        });

        await Promise.all(promises);
        
        // Small delay between batches to prevent rate limiting
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Final results
      const successCount = completed;
      const failCount = errors;

      if (successCount > 0) {
        toast.success(`¡Lote completado!`, {
          description: `${successCount} productos publicados exitosamente${failCount > 0 ? `, ${failCount} fallaron` : ''}`
        });
      }

      if (failCount > 0 && successCount === 0) {
        toast.error('Error en el lote', {
          description: `Todos los productos fallaron. Revisa las imágenes y vuelve a intentar.`
        });
      }

    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error('Error procesando lote', {
        description: 'Ocurrió un error inesperado durante el procesamiento'
      });
    } finally {
      setIsRunning(false);
    }
  }, [uploadImages, publishProduct, analyzeImages]);

  const resetBatch = useCallback(() => {
    setBatchProgress(0);
    setCompletedCount(0);
    setErrorCount(0);
    setIsRunning(false);
  }, []);

  return {
    processBatch,
    batchProgress,
    completedCount,
    errorCount,
    isRunning,
    resetBatch
  };
};