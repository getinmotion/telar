/**
 * Data Repair Utilities
 * FASE 6: Sistema de auto-reparación de datos desincronizados
 * 
 * Intenta fusionar y sincronizar datos de múltiples fuentes cuando se detecta
 * desincronización entre user_profiles, user_master_context y artisan_shops
 */

import { supabase } from '@/integrations/supabase/client';
import { getUserProfileByUserId, updateUserProfile } from '@/services/userProfiles.actions';

interface RepairResult {
  success: boolean;
  changes: string[];
  errors: string[];
}

/**
 * Intenta reparar datos desincronizados del usuario
 */
export const attemptDataRepair = async (userId: string): Promise<RepairResult> => {
  console.log('🔧 [DATA REPAIR] Starting repair for user:', userId);
  
  const changes: string[] = [];
  const errors: string[] = [];

  try {
    // PASO 1: Buscar datos en todas las fuentes
    // ✅ Obtener perfil desde NestJS backend
    const profile = await getUserProfileByUserId(userId).catch(() => null);
    
    const [contextResult, shopResult] = await Promise.all([
      supabase
        .from('user_master_context')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('artisan_shops')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    const context = contextResult.data;
    const shop = shopResult.data;

    console.log('🔧 [DATA REPAIR] Sources found:', {
      hasProfile: !!profile,
      hasContext: !!context,
      hasShop: !!shop
    });

    // PASO 2: Determinar la fuente más completa de brand name
    const brandSources = {
      profile: profile?.brandName,
      contextBrand: (context?.business_profile as any)?.brandName || (context?.business_profile as any)?.brand_name,
      insights: (context?.conversation_insights as any)?.nombre_marca,
      shop: shop?.shop_name
    };

    console.log('🔧 [DATA REPAIR] Brand sources:', brandSources);

    // Priorizar: conversation_insights > business_profile > shop_name > profile
    const correctBrandName = 
      brandSources.insights || 
      brandSources.contextBrand || 
      brandSources.shop || 
      brandSources.profile;

    if (!correctBrandName) {
      errors.push('No se encontró nombre de marca en ninguna fuente');
      return { success: false, changes, errors };
    }

    // PASO 3: Actualizar user_profiles si está desincronizado
    if (profile && profile.brandName !== correctBrandName) {
      console.log('🔧 [DATA REPAIR] Updating user_profiles.brand_name:', correctBrandName);
      
      // ✅ Migrado a endpoint NestJS (PATCH /telar/server/user-profiles/:userId)
      try {
        await updateUserProfile(userId, { brandName: correctBrandName });
        changes.push(`Actualizado user_profiles.brand_name a "${correctBrandName}"`);
      } catch (profileError: any) {
        errors.push(`Error actualizando user_profiles: ${profileError.message || profileError}`);
      }
    }

    // PASO 4: Sincronizar business_profile en user_master_context
    const businessProfile = (context?.business_profile as any) || {};
    const conversationInsights = (context?.conversation_insights as any) || {};

    const mergedBusinessProfile = {
      ...(typeof businessProfile === 'object' ? businessProfile : {}),
      brandName: correctBrandName,
      brand_name: correctBrandName,
      businessDescription: 
        businessProfile.businessDescription || 
        businessProfile.business_description || 
        profile?.business_description,
      craftType: 
        businessProfile.craftType || 
        businessProfile.craft_type || 
        shop?.craft_type,
      businessLocation: 
        businessProfile.businessLocation || 
        businessProfile.business_location || 
        shop?.region
    };

    const mergedInsights = {
      ...(typeof conversationInsights === 'object' ? conversationInsights : {}),
      nombre_marca: correctBrandName
    };

    console.log('🔧 [DATA REPAIR] Updating user_master_context with merged data');

    const { error: contextError } = await supabase
      .from('user_master_context')
      .upsert({
        user_id: userId,
        business_profile: mergedBusinessProfile,
        conversation_insights: mergedInsights,
        task_generation_context: context?.task_generation_context || {},
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (contextError) {
      errors.push(`Error actualizando user_master_context: ${contextError.message}`);
    } else {
      changes.push('Sincronizado user_master_context.business_profile');
      changes.push('Sincronizado user_master_context.conversation_insights');
    }

    // PASO 5: Verificar resultado
    console.log('🔧 [DATA REPAIR] Repair completed', {
      success: errors.length === 0,
      changes: changes.length,
      errors: errors.length
    });

    return {
      success: errors.length === 0,
      changes,
      errors
    };

  } catch (error: any) {
    console.error('🔧 [DATA REPAIR] Fatal error:', error);
    errors.push(`Error fatal: ${error.message}`);
    return { success: false, changes, errors };
  }
};

/**
 * Verifica si el nombre de marca es genérico/placeholder
 */
export const isGenericBrandName = (name: string | null | undefined): boolean => {
  if (!name) return true;
  
  const generic = [
    'tu negocio',
    'tu empresa',
    'tu emprendimiento',
    'tu marca',
    'tu taller',
    'mi negocio',
    'mi empresa',
    'mi marca',
    'your business',
    'your company',
    'your brand'
  ];

  const normalized = name.toLowerCase().trim();
  return generic.some(g => normalized.includes(g));
};
