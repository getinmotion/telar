/**
 * Mission Discovery Hook
 * Analyzes user state and suggests next missions
 * Combines Fixed Tasks + Dynamic AI suggestions
 */

import { useState, useCallback } from 'react';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FIXED_TASKS } from '@/config/fixedTasks';
import { FixedTask, FixedTaskId } from '@/types/fixedTask';

interface MissionSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  type: 'fixed' | 'dynamic';
  estimatedMinutes?: number;
  reason: string; // Why this mission is suggested
}

export const useMissionDiscovery = () => {
  const { user } = useAuth();
  const { masterState } = useMasterAgent();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [suggestions, setSuggestions] = useState<MissionSuggestion[]>([]);

  const discoverMissions = useCallback(async () => {
    if (!user) return;

    setIsDiscovering(true);
    try {
      const allSuggestions: MissionSuggestion[] = [];

      // 1. Get completed Fixed Tasks
      const { data: completedTasks } = await supabase
        .from('agent_tasks')
        .select('agent_id, title')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const completedIds = new Set<FixedTaskId>(
        completedTasks?.map(t => t.agent_id as FixedTaskId) || []
      );

      // 2. Load shop details from database
      const { data: shopData } = await supabase
        .from('artisan_shops')
        .select('hero_config, story, about_content')
        .eq('user_id', user.id)
        .maybeSingle();

      const hasHeroSlider = !!(shopData?.hero_config as any)?.slides?.length;
      const hasStory = !!(shopData?.story || (shopData?.about_content as any)?.story);

      // 3. Analyze user state
      const userState = {
        hasShop: masterState.tienda.has_shop,
        hasBrand: masterState.marca.score >= 80,
        productCount: masterState.inventario.productos.length,
        hasRUT: !!masterState.perfil.nit && !masterState.perfil.nit_pendiente,
        hasHeroSlider,
        hasStory
      };

      // 4. Find available Fixed Tasks
      const availableFixedTasks = FIXED_TASKS.filter(task => {
        // Already completed
        if (completedIds.has(task.id)) return false;

        // Check requirements
        if (task.requirements?.mustComplete) {
          const allPrereqsComplete = task.requirements.mustComplete.every(
            id => completedIds.has(id)
          );
          if (!allPrereqsComplete) return false;
        }

        if (task.requirements?.mustHave) {
          const { shop, brand, products } = task.requirements.mustHave;
          if (shop && !userState.hasShop) return false;
          if (brand && !userState.hasBrand) return false;
          if (products && userState.productCount < products.min) return false;
        }

        return true;
      });

      // 5. Convert Fixed Tasks to suggestions
      availableFixedTasks.forEach(task => {
        let reason = 'Paso fundamental en tu camino artesanal';
        
        if (task.id === 'first_product') {
          reason = 'Tu tienda está lista. ¡Es hora de agregar tu primer producto!';
        } else if (task.id === 'customize_shop') {
          reason = 'Dale personalidad a tu tienda con un hero slider impactante';
        } else if (task.id === 'create_story') {
          reason = 'Conecta emocionalmente con tus clientes compartiendo tu historia';
        } else if (task.id === 'five_products') {
          reason = 'Un catálogo de 5 productos aumenta tus ventas significativamente';
        } else if (task.id === 'complete_rut') {
          reason = 'Formaliza tu negocio para acceder a más oportunidades';
        }

        allSuggestions.push({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority <= 3 ? 'high' : task.priority <= 6 ? 'medium' : 'low',
          category: task.milestone,
          type: 'fixed',
          estimatedMinutes: task.estimatedMinutes,
          reason
        });
      });

      // 6. Add dynamic suggestions based on gaps
      if (userState.productCount >= 3 && !userState.hasHeroSlider) {
        allSuggestions.push({
          id: 'dynamic_hero',
          title: 'Destaca tus mejores productos',
          description: 'Crea un hero slider con fotos de tus 3 productos más populares',
          priority: 'high',
          category: 'shop',
          type: 'dynamic',
          estimatedMinutes: 15,
          reason: 'Tienes productos excelentes que merecen destacarse en tu página principal'
        });
      }

      if (userState.productCount >= 5 && userState.hasShop && !userState.hasStory) {
        allSuggestions.push({
          id: 'dynamic_story',
          title: 'Diferénciate con tu historia',
          description: 'Los clientes compran historias, no solo productos',
          priority: 'high',
          category: 'brand',
          type: 'dynamic',
          estimatedMinutes: 20,
          reason: 'Tu catálogo está creciendo. Ahora diferénciate contando tu historia'
        });
      }

      if (userState.productCount >= 1 && userState.productCount < 3) {
        allSuggestions.push({
          id: 'dynamic_more_products',
          title: 'Amplía tu catálogo',
          description: 'Sube 2 productos más para aumentar tus oportunidades de venta',
          priority: 'medium',
          category: 'shop',
          type: 'dynamic',
          estimatedMinutes: 20,
          reason: 'Los clientes prefieren tiendas con variedad de productos'
        });
      }

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      allSuggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setSuggestions(allSuggestions.slice(0, 5)); // Top 5 suggestions
    } catch (error) {
      console.error('Error discovering missions:', error);
    } finally {
      setIsDiscovering(false);
    }
  }, [user, masterState]);

  return {
    suggestions,
    isDiscovering,
    discoverMissions
  };
};
