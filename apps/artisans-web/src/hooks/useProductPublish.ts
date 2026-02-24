import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PublishData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  shortDescription?: string;
  comparePrice?: number;
  inventory?: number;
  weight?: number;
  sku?: string;
  dimensions?: any;
  tags?: string[];
  materials?: string[];
  techniques?: string[];
  productionTime?: string;
  subcategory?: string;
  customizable?: boolean;
  allowsLocalPickup?: boolean;
}

export interface PublishOptions {
  skipValidation?: boolean;
  showToasts?: boolean;
  retryAttempts?: number;
}

export const useProductPublish = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  const validatePublishData = (data: PublishData): string[] => {
    const errors: string[] = [];
    
    if (!data.name?.trim()) errors.push('El nombre del producto es obligatorio');
    if (!data.description?.trim()) errors.push('La descripción es obligatoria');
    if (!data.price || data.price <= 0) errors.push('El precio debe ser mayor a 0');
    if (!data.category?.trim()) errors.push('La categoría es obligatoria');
    if (!data.images || data.images.length === 0) errors.push('Se requiere al menos una imagen');
    
    return errors;
  };

  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Max retries reached');
  };

  const publishProduct = useCallback(async (
    data: PublishData, 
    options: PublishOptions = {}
  ): Promise<{ success: boolean; productId?: string; error?: string }> => {
    const { 
      skipValidation = false, 
      showToasts = true, 
      retryAttempts = 3 
    } = options;

    setIsPublishing(true);
    setPublishProgress(0);

    try {
      // Validation
      if (!skipValidation) {
        const errors = validatePublishData(data);
        if (errors.length > 0) {
          if (showToasts) {
            toast.error('Datos incompletos', {
              description: errors.join(', ')
            });
          }
          return { success: false, error: errors.join(', ') };
        }
      }
      setPublishProgress(20);

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      setPublishProgress(30);

      // Verify shop exists
      const shop = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('artisan_shops')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('❌ Error checking shop:', error);
          throw new Error(`Error verificando tienda: ${error.message}`);
        }
        
        if (!data) {
          console.error('❌ No active shop found for user:', user.id);
          throw new Error('No tienes una tienda activa. Crea una tienda primero.');
        }
        
        console.log('✅ Shop found:', data);
        return data;
      });
      setPublishProgress(50);

      // Prepare product data
      const productData = {
        shop_id: shop.id,
        name: data.name.trim(),
        description: data.description.trim(),
        short_description: data.shortDescription?.trim() || data.description.substring(0, 100),
        price: Number(data.price),
        compare_price: data.comparePrice ? Number(data.comparePrice) : null,
        category: data.category,
        subcategory: data.subcategory || null,
        images: Array.isArray(data.images) ? data.images : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        materials: Array.isArray(data.materials) ? data.materials : [],
        techniques: Array.isArray(data.techniques) ? data.techniques : [],
        production_time: data.productionTime || null,
        inventory: data.inventory || 0,
        weight: data.weight || null,
        sku: data.sku || null,
        dimensions: data.dimensions || null,
        customizable: data.customizable || false,
        allows_local_pickup: data.allowsLocalPickup || false,
        active: false, // Products start inactive until approved by moderator
        featured: false,
        moderation_status: 'pending_moderation' // Send to moderation queue
      };
      
      console.log('💾 Prepared product data:', {
        shop_id: productData.shop_id,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        images_count: productData.images.length,
        images: productData.images
      });
      setPublishProgress(70);

      // Insert product with retry
      const product = await retryOperation(async () => {
        console.log('💾 Inserting product data:', productData);
        
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .maybeSingle();

        if (error) {
          console.error('❌ Product insertion error:', error);
          throw new Error(`Error al guardar el producto: ${error.message}`);
        }

        if (!data) {
          console.error('❌ No product data returned after insertion');
          throw new Error('No se pudo crear el producto - sin datos retornados');
        }

        console.log('✅ Product inserted successfully:', data);
        return data;
      }, retryAttempts);
      setPublishProgress(90);

      // Verify insertion
      await retryOperation(async () => {
        console.log('🔍 Verifying product insertion for ID:', product.id);
        
        const { data: verification, error } = await supabase
          .from('products')
          .select('id')
          .eq('id', product.id)
          .maybeSingle();
        
        if (error) {
          console.error('❌ Verification error:', error);
          throw new Error(`Error en la verificación del producto: ${error.message}`);
        }
        
        if (!verification) {
          console.error('❌ Product not found during verification');
          throw new Error('Producto no encontrado tras la inserción');
        }
        
        console.log('✅ Product verification successful');
        return verification;
      });
      setPublishProgress(100);

      if (showToasts) {
        toast.success('¡Producto enviado a revisión!', {
          description: `${data.name} será revisado por un moderador antes de publicarse`
        });
      }

      return { success: true, productId: product.id };

    } catch (error) {
      console.error('❌ Error publicando producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (showToasts) {
        toast.error('Error al publicar producto', {
          description: errorMessage
        });
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsPublishing(false);
      setPublishProgress(0);
    }
  }, []);

  return {
    publishProduct,
    isPublishing,
    publishProgress,
    validatePublishData
  };
};