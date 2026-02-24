/**
 * Task Reconciliation Hook
 * Sincroniza tareas en DB con el estado real del usuario
 * Se ejecuta UNA VEZ al cargar el dashboard
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { markTaskAsCompleted } from './utils/taskCompletionHelpers';
import { EventBus } from '@/utils/eventBus';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';

export const useTaskReconciliation = () => {
  const { user } = useAuth();
  const hasReconciled = useRef(false);

  useEffect(() => {
    if (!user || hasReconciled.current) return;

    const reconcileTasks = async () => {
      try {
        console.log('🔄 [Reconciliation] Iniciando sincronización de tareas...');
        
        // Obtener estado real del usuario
        const [shop, profile] = await Promise.all([
          getArtisanShopByUserId(user.id).catch(() => null),
          getUserProfileByUserId(user.id).catch(() => null)
        ]);

        let productCount = 0;
        if (shop?.id) {
          const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('shop_id', shop.id);
          productCount = count || 0;
        }

        // Calcular qué debería estar completado
        const hasShop = !!shop;
        const hasLogo = !!shop?.logoUrl;
        const hasHeroSlider = !!(shop?.heroConfig as any)?.slides?.length;
        const hasStory = !!(shop?.story || (shop?.aboutContent as any)?.story);
        const hasSocialLinks = !!(shop?.socialLinks && Object.keys(shop.socialLinks as object).length > 0);
        const contactInfo = (shop?.contactInfo as any) || {};
        const hasContactInfo = !!(contactInfo?.email || contactInfo?.phone);
        const hasRUT = !!(profile?.rut && !profile?.rutPendiente);

        console.log('🔍 [Reconciliation] Estado del usuario:', {
          hasShop,
          hasLogo,
          hasHeroSlider,
          hasStory,
          hasSocialLinks,
          hasContactInfo,
          hasRUT,
          productCount
        });

        // Obtener tareas pendientes o en progreso
        const { data: tasks } = await supabase
          .from('agent_tasks')
          .select('id, title, description, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress']);

        if (!tasks || tasks.length === 0) {
          console.log('ℹ️ [Reconciliation] No hay tareas para reconciliar');
          hasReconciled.current = true;
          return;
        }

        console.log(`📋 [Reconciliation] Encontradas ${tasks.length} tareas para revisar`);

        let completedCount = 0;

        // Revisar cada tarea y completar si corresponde
        for (const task of tasks) {
          const titleLower = task.title.toLowerCase();
          const descLower = (task.description || '').toLowerCase();
          let shouldComplete = false;

          // Crear tienda
          if ((titleLower.includes('crear') && titleLower.includes('tienda')) || 
              titleLower.includes('tienda online') || 
              titleLower.includes('create_shop')) {
            shouldComplete = hasShop;
          }
          // Primer producto
          else if ((titleLower.includes('primer producto') || 
                    titleLower.includes('first_product') ||
                    titleLower.includes('sube') || 
                    titleLower.includes('añade un producto')) && productCount > 0) {
            shouldComplete = true;
          }
          // 5 productos
          else if ((titleLower.includes('5 productos') || 
                    titleLower.includes('five_products') ||
                    titleLower.includes('cinco productos')) && productCount >= 5) {
            shouldComplete = true;
          }
          // 10 productos
          else if ((titleLower.includes('10 productos') || 
                    titleLower.includes('ten_products') ||
                    titleLower.includes('diez productos')) && productCount >= 10) {
            shouldComplete = true;
          }
          // Marca / Logo
          else if ((titleLower.includes('marca') || 
                    titleLower.includes('logo') || 
                    titleLower.includes('create_brand') ||
                    titleLower.includes('identidad') ||
                    descLower.includes('logo')) && hasLogo) {
            shouldComplete = true;
          }
          // Hero Slider / Personalizar tienda
          else if ((titleLower.includes('hero') || 
                    titleLower.includes('personaliza') ||
                    titleLower.includes('customize_shop') ||
                    titleLower.includes('slider')) && hasHeroSlider) {
            shouldComplete = true;
          }
          // Historia / About / Nosotros
          else if ((titleLower.includes('historia') || 
                    titleLower.includes('about') || 
                    titleLower.includes('nosotros') ||
                    titleLower.includes('create_story') ||
                    descLower.includes('historia')) && hasStory) {
            shouldComplete = true;
          }
          // Contacto
          else if ((titleLower.includes('contacto') || 
                    titleLower.includes('contact')) && hasContactInfo) {
            shouldComplete = true;
          }
          // Redes Sociales
          else if ((titleLower.includes('redes sociales') || 
                    titleLower.includes('social') ||
                    titleLower.includes('instagram') ||
                    titleLower.includes('facebook')) && hasSocialLinks) {
            shouldComplete = true;
          }
          // RUT / NIT
          else if ((titleLower.includes('rut') || 
                    titleLower.includes('nit') ||
                    titleLower.includes('complete_rut')) && hasRUT) {
            shouldComplete = true;
          }

          if (shouldComplete) {
            console.log(`✅ [Reconciliation] Completando: "${task.title}"`);
            await markTaskAsCompleted(task.id, user.id);
            completedCount++;
          }
        }

        if (completedCount > 0) {
          console.log(`🎉 [Reconciliation] ${completedCount} tareas sincronizadas como completadas`);
          // Publicar evento para refrescar el sistema
          EventBus.publish('master.context.updated', {});
        } else {
          console.log('ℹ️ [Reconciliation] No se encontraron tareas para completar automáticamente');
        }

        hasReconciled.current = true;
        
      } catch (error) {
        console.error('❌ [Reconciliation] Error en reconciliación:', error);
      }
    };

    reconcileTasks();
  }, [user]);
};
