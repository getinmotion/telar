import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getArtisanShopById, updateArtisanShop } from '@/services/artisanShops.actions';
import { getApprovedProductsCount } from '@/services/products.actions';

export interface PublishRequirements {
  hasApprovedProducts: boolean;
  approvedProductsCount: number;
  hasBankData: boolean;
  bankDataStatus: string;
  canPublish: boolean;
}

export const useShopPublish = (shopId?: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Verifica los requisitos para publicar la tienda
   */
  const checkPublishRequirements = useCallback(async (): Promise<PublishRequirements> => {
    if (!shopId) {
      return {
        hasApprovedProducts: false,
        approvedProductsCount: 0,
        hasBankData: false,
        bankDataStatus: 'incomplete',
        canPublish: false,
      };
    }

    try {
      // ✅ MIGRATED: NestJS endpoints
      // Obtener conteo de productos aprobados y datos de la tienda en paralelo
      const [approvedProductsCount, shopData] = await Promise.all([
        getApprovedProductsCount(shopId),
        getArtisanShopById(shopId)
      ]);

      const hasApprovedProducts = approvedProductsCount >= 1;

      // Usar el nuevo campo bank_data_status si existe, sino fallback a id_contraparty
      const bankDataStatus = shopData?.bankDataStatus ||
        (shopData?.idContraparty ? 'complete' : 'not_set');
      const hasBankData = bankDataStatus === 'complete';

      return {
        hasApprovedProducts,
        approvedProductsCount,
        hasBankData,
        bankDataStatus,
        // NUEVO: Publicación solo requiere productos aprobados, datos bancarios son informativos
        canPublish: hasApprovedProducts,
      };
    } catch (error) {
      console.error('Error checking publish requirements:', error);
      return {
        hasApprovedProducts: false,
        approvedProductsCount: 0,
        hasBankData: false,
        bankDataStatus: 'incomplete',
        canPublish: false,
      };
    }
  }, [shopId]);

  /**
   * Publica la tienda (cambia estado a published y active a true)
   */
  const publishShop = useCallback(async (): Promise<boolean> => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "No se encontró la tienda",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Verificar requisitos
      const requirements = await checkPublishRequirements();

      if (!requirements.canPublish) {
        toast({
          title: "Requisitos incompletos",
          description: "Debes cumplir todos los requisitos antes de publicar tu tienda",
          variant: "destructive",
        });
        return false;
      }

      // ✅ MIGRATED: NestJS endpoint - PATCH /artisan-shops/:id
      await updateArtisanShop(shopId, {
        publishStatus: 'published',
        active: true,
      });

      toast({
        title: "¡Tienda publicada!",
        description: "Tu tienda ahora es visible en el marketplace",
      });

      return true;
    } catch (error) {
      console.error('Error publishing shop:', error);
      toast({
        title: "Error al publicar",
        description: "No se pudo publicar la tienda. Intenta de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [shopId, checkPublishRequirements, toast]);

  return {
    checkPublishRequirements,
    publishShop,
    loading,
  };
};
