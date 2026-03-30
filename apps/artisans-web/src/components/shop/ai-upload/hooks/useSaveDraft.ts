import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImageUpload } from './useImageUpload';
import { WizardState } from './useWizardState';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';
import { createProductNew, mapWizardStateToCreateDto } from '@/services/products-new.actions';
import { deleteUploadedFile } from '@/services/fileUpload.actions';

interface SaveDraftOptions {
  redirectToInventory?: boolean;
}

export const useSaveDraft = () => {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { uploadImages } = useImageUpload();
  const navigate = useNavigate();
  const { user } = useAuth();

  const saveDraft = async (
    wizardState: WizardState,
    productId?: string,
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
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Get shop using NestJS API
      const shopData = await getArtisanShopByUserId(user.id);
      if (!shopData) {
        throw new Error('No tienes una tienda activa');
      }

      // Upload images (solo las nuevas - tipo File)
      const imagesToUpload = wizardState.images.filter((img): img is File => typeof img !== 'string');
      const existingImageUrls = wizardState.images.filter((img): img is string => typeof img === 'string');

      if (imagesToUpload.length > 0) {
        toast.info('Subiendo imágenes...', { description: `Procesando ${imagesToUpload.length} imagen(es)` });
        const newUploadedUrls = await uploadImages(imagesToUpload);
        uploadedImageUrls = [...existingImageUrls, ...newUploadedUrls];
      } else {
        // Solo usar las imágenes existentes
        uploadedImageUrls = existingImageUrls;
      }

      if (uploadedImageUrls.length === 0) {
        throw new Error('No se pudieron subir las imágenes');
      }

      // Create DTO using products-new architecture (multicapa)
      const createDto = mapWizardStateToCreateDto(
        wizardState,
        shopData.id,
        uploadedImageUrls
      );

      // Si estamos editando, agregar productId al DTO para hacer update
      if (productId) {
        createDto.productId = productId;
        console.log('📝 Actualizando borrador del producto:', productId);
      }

      // Status is already 'draft' by default in mapWizardStateToCreateDto
      console.log('📋 DTO generado para borrador:', createDto);

      // Create/Update product using products-new endpoint (upsert)
      const draftProduct = await createProductNew(createDto);
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
        await Promise.allSettled(
          uploadedImageUrls.map((url) =>
            deleteUploadedFile(url).catch((err) =>
              console.error('Error en rollback de imagen:', url, err)
            )
          )
        );
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
