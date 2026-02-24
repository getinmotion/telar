/**
 * Hook para auto-actualizar respuestas mutables del test de madurez
 * basado en el progreso real del negocio del usuario
 */

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventBus } from '@/utils/eventBus';

export const useMaturityAutoUpdater = () => {
  const { user } = useAuth();
  const { context, updateProfile } = useUnifiedUserData();

  useEffect(() => {
    if (!user || !context?.businessProfile) return;

    // Escuchar eventos que puedan disparar actualizaciones
    const handleTaskCompleted = async (data: any) => {
      console.log('🔄 [AUTO-UPDATE] Task completed, checking for profile updates...', data);
      await checkAndUpdateProfile();
    };

    const handleProductAdded = async (data: any) => {
      console.log('🔄 [AUTO-UPDATE] Product added, checking for profile updates...', data);
      await checkAndUpdateProfile();
    };

    // ✅ Usar subscribe en vez de on
    const unsubTaskCompleted = EventBus.subscribe('task.completed.check.generation', handleTaskCompleted);
    const unsubProductAdded = EventBus.subscribe('business.updated', handleProductAdded);

    return () => {
      unsubTaskCompleted();
      unsubProductAdded();
    };
  }, [user, context]);

  const checkAndUpdateProfile = async () => {
    if (!user || !context?.businessProfile) return;

    try {
      const profile = context.businessProfile;
      let updated = false;
      const updates: any = {};

      // 1. Actualizar salesStatus si cambió
      if (profile.salesStatus === 'not_yet') {
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .limit(1);

        if (orders && orders.length > 0) {
          updates.salesStatus = 'first_sales';
          updated = true;
          console.log('✅ [AUTO-UPDATE] Detected first sales!');
        }
      }

      // 2. Actualizar hasOnlinePresence si creó tienda
      if (profile.hasOnlinePresence === 'no' || profile.hasOnlinePresence === 'planning') {
        const { data: shop } = await supabase
          .from('artisan_shops')
          .select('id, active')
          .eq('user_id', user.id)
          .single();

        if (shop && shop.active) {
          updates.hasOnlinePresence = 'yes';
          updated = true;
          console.log('✅ [AUTO-UPDATE] Detected online presence!');
        }
      }

      // 3. Actualizar productCount si agregó productos
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .in('shop_id', [
          ...(await supabase
            .from('artisan_shops')
            .select('id')
            .eq('user_id', user.id)
            .then(res => res.data?.map(s => s.id) || []))
        ]);

      if (productCount && productCount > (profile.productCount || 0)) {
        updates.productCount = productCount;
        updated = true;
        console.log('✅ [AUTO-UPDATE] Product count updated:', productCount);
      }

      // Si hay actualizaciones, guardar
      if (updated && Object.keys(updates).length > 0) {
        console.log('💾 [AUTO-UPDATE] Saving profile updates:', updates);
        await updateProfile(updates);

        toast.success('✨ Tu perfil se actualizó automáticamente', {
          description: 'Detectamos tu progreso y lo reflejamos en tu evaluación'
        });
      }
    } catch (error) {
      console.error('❌ [AUTO-UPDATE] Error checking for updates:', error);
    }
  };

  return {
    checkAndUpdateProfile
  };
};
