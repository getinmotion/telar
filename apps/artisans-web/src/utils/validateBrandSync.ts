import { syncBrandToShop } from './syncBrandToShop';
import { getUserMasterContextByUserId } from '@/services/userMasterContext.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';

interface ValidationResult {
  needsSync: boolean;
  syncPerformed: boolean;
  message: string;
  details?: {
    logoMismatch?: boolean;
    claimMismatch?: boolean;
    colorsMismatch?: boolean;
  };
}

/**
 * Valida si los datos de marca en user_master_context están sincronizados
 * con artisan_shops. Si detecta desincronización, la corrige automáticamente.
 */
export async function validateAndSyncBrandData(userId: string): Promise<ValidationResult> {
  try {

    // ✅ Migrado a NestJS - GET /telar/server/user-master-context/user/{user_id}
    const contextData = await getUserMasterContextByUserId(userId);

    if (!contextData) {
      return {
        needsSync: false,
        syncPerformed: false,
        message: 'No hay datos de marca para validar'
      };
    }

    // Buscar brand_evaluation en conversationInsights o businessContext
    const brandEvaluation = (contextData?.conversationInsights as any)?.brand_evaluation ||
      (contextData?.businessContext as any)?.brand_evaluation;

    if (!brandEvaluation || !brandEvaluation.has_logo || !brandEvaluation.has_colors) {
      return {
        needsSync: false,
        syncPerformed: false,
        message: 'Datos de marca incompletos en el contexto'
      };
    }

    // ✅ Migrado a NestJS - GET /telar/server/artisan-shops/user/{user_id}
    const shopData = await getArtisanShopByUserId(userId).catch((error) => {
      console.error('[validateBrandSync] Error getting shop:', error);
      return null;
    });

    if (!shopData) {
      return {
        needsSync: false,
        syncPerformed: false,
        message: 'No hay tienda para sincronizar'
      };
    }

    // 3. Comparar datos de marca con tienda
    const logoMismatch = shopData.logoUrl !== brandEvaluation.logo_url;
    const claimMismatch = shopData.brandClaim !== brandEvaluation.claim;

    const shopPrimaryColors = shopData.primaryColors as string[] || [];
    const brandPrimaryColors = brandEvaluation.primary_colors || [];
    const colorsMismatch = JSON.stringify(shopPrimaryColors) !== JSON.stringify(brandPrimaryColors);

    const needsSync = logoMismatch || claimMismatch || colorsMismatch;

    if (!needsSync) {
      return {
        needsSync: false,
        syncPerformed: false,
        message: 'Datos de marca sincronizados correctamente'
      };
    }

    // 4. Hay desincronización, sincronizar automáticamente


    const syncResult = await syncBrandToShop(userId, true); // forceSync = true

    return {
      needsSync: true,
      syncPerformed: syncResult.success,
      message: syncResult.success
        ? '✅ Datos de marca sincronizados automáticamente'
        : `❌ Error al sincronizar: ${syncResult.error}`,
      details: {
        logoMismatch,
        claimMismatch,
        colorsMismatch
      }
    };

  } catch (error: any) {
    console.error('[validateBrandSync] Unexpected error:', error);
    return {
      needsSync: false,
      syncPerformed: false,
      message: 'Error al validar sincronización',
      details: undefined
    };
  }
}
