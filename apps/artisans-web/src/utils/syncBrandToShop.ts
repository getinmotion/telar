import { supabase } from '@/integrations/supabase/client';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { getUserMasterContextByUserId } from '@/services/userMasterContext.actions';
import { getArtisanShopByUserId, createArtisanShop, updateArtisanShop } from '@/services/artisanShops.actions';

interface SyncResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Sincroniza los datos de marca (logo, claim, colores) desde user_profiles
 * hacia artisan_shops. Si no existe tienda, la crea automáticamente.
 * Los datos de marca se guardan en user_profiles como business_description (claim)
 * y necesitamos acceder a los colores que están guardados en algún lugar del contexto.
 */
export async function syncBrandToShop(userId: string, forceSync: boolean = false): Promise<SyncResult> {
  try {
    console.log('[syncBrandToShop] Starting sync for user:', userId, 'forceSync:', forceSync);

    // 1. Obtener datos de marca desde user_master_context
    const contextData = await getUserMasterContextByUserId(userId);

    if (!contextData) {
      console.error('[syncBrandToShop] Error fetching context: context not found');
      return {
        success: false,
        message: 'No se pudo obtener el contexto del usuario',
        error: 'Context not found'
      };
    }

    // Buscar en ambos lugares (conversationInsights primero, luego businessContext por compatibilidad)
    const brandEvaluation = (contextData?.conversationInsights as any)?.brand_evaluation || 
                           (contextData?.businessContext as any)?.brand_evaluation;
    
    if (!brandEvaluation || !brandEvaluation.has_logo || !brandEvaluation.has_colors) {
      console.log('[syncBrandToShop] No brand data found in context');
      return {
        success: false,
        message: 'Completa el Brand Wizard para configurar tu logo y colores de marca.'
      };
    }

    // 2. Verificar si hay tienda
    const shopData = await getArtisanShopByUserId(userId).catch((error) => {
      console.error('[syncBrandToShop] Error querying shop:', error);
      return null;
    });

    // 3. Si no existe tienda, crearla primero
    if (!shopData) {
      console.log('[syncBrandToShop] No shop exists, creating one...');
      
      // ✅ Obtener perfil desde NestJS backend
      const profileData = await getUserProfileByUserId(userId).catch(() => null);

      const shopName = profileData?.brandName || 'Mi Tienda Artesanal';
      const description = profileData?.businessDescription || 'Productos artesanales únicos';
      const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now();
      
      try {
        const newShop = await createArtisanShop({
          userId,
          shopName,
          shopSlug: slug,
          description,
          craftType: 'other',
          active: true,
          logoUrl: brandEvaluation.logo_url,
          brandClaim: brandEvaluation.claim,
          primaryColors: brandEvaluation.primary_colors || [],
          secondaryColors: brandEvaluation.secondary_colors || []
        });

        console.log('[syncBrandToShop] Shop created with brand data:', newShop.id);
        return {
          success: true,
          message: '¡Tienda creada con tu identidad de marca aplicada!'
        };
      } catch (insertError: any) {
        console.error('[syncBrandToShop] Error creating shop:', insertError);
        return {
          success: false,
          message: 'Error al crear la tienda',
          error: insertError.message || 'Unknown error'
        };
      }
    }

    // 4. Si existe la tienda, verificar si necesita sincronización
    const primaryColors = shopData.primaryColors as string[] | null;
    const hasShopBrandData = shopData.logoUrl && shopData.brandClaim && 
                             primaryColors && primaryColors.length > 0;

    if (hasShopBrandData && !forceSync) {
      console.log('[syncBrandToShop] Shop already has brand data and forceSync is false');
      return {
        success: true,
        message: 'Tu tienda ya tiene la marca aplicada.'
      };
    }

    // 5. Sincronizar datos de marca a la tienda
    console.log('[syncBrandToShop] Syncing brand data to shop:', shopData.id);
    
    try {
      await updateArtisanShop(shopData.id, {
        logoUrl: brandEvaluation.logo_url,
        brandClaim: brandEvaluation.claim,
        primaryColors: brandEvaluation.primary_colors || [],
        secondaryColors: brandEvaluation.secondary_colors || []
      });

      console.log('[syncBrandToShop] Brand data synced successfully to shop:', shopData.shopName);
      return {
        success: true,
        message: `✅ Marca aplicada exitosamente a "${shopData.shopName}"`
      };
    } catch (updateError: any) {
      console.error('[syncBrandToShop] Error updating shop:', updateError);
      return {
        success: false,
        message: 'Error al actualizar la tienda',
        error: updateError.message || 'Unknown error'
      };
    }

  } catch (error: any) {
    console.error('[syncBrandToShop] Unexpected error:', error);
    return {
      success: false,
      message: 'Error inesperado al sincronizar',
      error: error.message
    };
  }
}
