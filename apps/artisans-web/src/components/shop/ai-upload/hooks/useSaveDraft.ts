import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from './useImageUpload';
import { WizardState } from './useWizardState';
import { toast } from 'sonner';

interface SaveDraftOptions {
  redirectToInventory?: boolean;
}

export const useSaveDraft = () => {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { uploadImages } = useImageUpload();
  const navigate = useNavigate();

  const saveDraft = async (
    wizardState: WizardState, 
    options: SaveDraftOptions = { redirectToInventory: true }
  ): Promise<boolean> => {
    // Minimum validation: at least 1 image
    if (!wizardState.images || wizardState.images.length === 0) {
      toast.error('Sube al menos una imagen para guardar el borrador');
      return false;
    }

    setIsSavingDraft(true);
    let uploadedImageUrls: string[] = [];

    try {
      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Get shop
      const { data: shopData, error: shopError } = await supabase
        .from('artisan_shops')
        .select('id, shop_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (shopError || !shopData) {
        throw new Error('No tienes una tienda activa');
      }

      // Upload images
      toast.info('Subiendo imágenes...', { description: `Procesando ${wizardState.images.length} imagen(es)` });
      uploadedImageUrls = await uploadImages(wizardState.images);
      
      if (uploadedImageUrls.length === 0) {
        throw new Error('No se pudieron subir las imágenes');
      }

      // Generate a placeholder name if not provided
      const productName = wizardState.name?.trim() || `Producto sin nombre - ${new Date().toLocaleDateString()}`;

      // Insert product as draft
      const { data: draftProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          shop_id: shopData.id,
          name: productName,
          description: wizardState.description?.trim() || '',
          short_description: wizardState.shortDescription?.trim() || wizardState.description?.trim().substring(0, 150) || '',
          price: Number(wizardState.price) || 0,
          category: wizardState.category?.trim() || '',
          tags: wizardState.tags || [],
          images: uploadedImageUrls,
          inventory: wizardState.inventory || 1,
          weight: wizardState.weight || null,
          dimensions: wizardState.dimensions || null,
          materials: wizardState.materials || [],
          production_time: wizardState.productionTime || null,
          compare_price: wizardState.comparePrice || null,
          sku: wizardState.sku || `DRAFT-${Date.now()}`,
          customizable: wizardState.customizable || false,
          made_to_order: wizardState.madeToOrder || false,
          lead_time_days: wizardState.leadTimeDays || 7,
          production_time_hours: wizardState.productionTimeHours || null,
          requires_customization: wizardState.requiresCustomization || false,
          active: false,
          featured: false,
          moderation_status: 'draft'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error details:', insertError);
        if (insertError.code === '42501' || insertError.message?.includes('policy')) {
          throw new Error('No tienes permisos para crear productos. Verifica que tu tienda esté configurada correctamente.');
        }
        throw new Error(`Error guardando borrador: ${insertError.message}`);
      }

      console.log('✅ BORRADOR GUARDADO:', draftProduct.id);
      
      toast.success('Borrador guardado', {
        description: 'Puedes completar los datos desde tu inventario',
        action: {
          label: 'Ver inventario',
          onClick: () => navigate('/dashboard/inventory')
        }
      });
      
      if (options.redirectToInventory) {
        navigate('/dashboard/inventory');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ ERROR GUARDANDO BORRADOR:', error);
      
      // Rollback images if needed
      if (uploadedImageUrls.length > 0) {
        try {
          const imageNames = uploadedImageUrls.map(url => {
            const parts = url.split('/');
            return parts[parts.length - 1];
          });
          
          await supabase.storage
            .from('images')
            .remove(imageNames.map(name => `products/${name}`));
        } catch (cleanupError) {
          console.error('Error en rollback:', cleanupError);
        }
      }
      
      toast.error('Error al guardar borrador', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  return {
    saveDraft,
    isSavingDraft
  };
};
