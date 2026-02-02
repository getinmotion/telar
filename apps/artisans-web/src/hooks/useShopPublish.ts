import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
      // Verificar productos aprobados
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, moderation_status')
        .eq('shop_id', shopId)
        .in('moderation_status', ['approved', 'approved_with_edits']);

      if (productsError) throw productsError;

      const approvedProductsCount = products?.length || 0;
      const hasApprovedProducts = approvedProductsCount >= 1;

      // Verificar datos bancarios directamente por shopId
      const { data: shopData, error: bankError } = await supabase
        .from('artisan_shops')
        .select('id_contraparty, bank_data_status')
        .eq('id', shopId)
        .single();

      if (bankError && bankError.code !== 'PGRST116') {
        console.error('Error fetching bank data:', bankError);
      }

      // Usar el nuevo campo bank_data_status si existe, sino fallback a id_contraparty
      const bankDataStatus = shopData?.bank_data_status || 
        (shopData?.id_contraparty ? 'complete' : 'not_set');
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

      // Actualizar estado de la tienda
      const { error } = await supabase
        .from('artisan_shops')
        .update({
          publish_status: 'published',
          active: true,
        })
        .eq('id', shopId);

      if (error) throw error;

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
