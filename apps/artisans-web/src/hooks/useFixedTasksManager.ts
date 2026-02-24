/**
 * Fixed Tasks Manager Hook - OPTIMIZED
 * - Parallel DB queries with Promise.all
 * - No circular dependencies
 * - Debounced EventBus handling
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FIXED_TASKS } from '@/config/fixedTasks';
import { FixedTask, FixedTaskId, UserTaskState } from '@/types/fixedTask';
import { EventBus } from '@/utils/eventBus';
import { NotificationTemplates } from '@/services/notificationService';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { getUserMasterContextByUserId } from '@/services/userMasterContext.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';
import { getUserProgressByUserId } from '@/services/userProgress.actions';
import { getAgentTasksByUserId, createAgentTask, updateAgentTask } from '@/services/agentTasks.actions';
import { getProductsByUserId } from '@/services/products.actions';

export interface CompletedFixedTask extends FixedTask {
  completedAt: string;
}

export const useFixedTasksManager = () => {
  const { user } = useAuth();

  const [completedTaskIds, setCompletedTaskIds] = useState<Set<FixedTaskId>>(new Set());
  const [completedTasksData, setCompletedTasksData] = useState<CompletedFixedTask[]>([]);
  const [userState, setUserState] = useState<UserTaskState | null>(null);
  const [loading, setLoading] = useState(true);

  // Refs for preventing duplicate calls
  const isInitializedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load all data in parallel - OPTIMIZED
  const loadAllData = useCallback(async () => {
    if (!user || isLoadingRef.current) return;

    isLoadingRef.current = true;

    try {
      // Execute ALL queries in parallel
      // Execute ALL queries in parallel - now checking id_contraparty from artisan_shops
      const [shopData, profileData, progressData, allTasks, masterContextResult] = await Promise.all([
        getArtisanShopByUserId(user.id).catch(() => null),
        getUserProfileByUserId(user.id).catch(() => null),
        getUserProgressByUserId(user.id).catch(() => null),
        getAgentTasksByUserId(user.id).catch(() => []),
        getUserMasterContextByUserId(user.id).catch(() => null)
      ]);

      // Filtrar solo tareas completadas y ordenar por fecha de completado
      const completedTasks = (allTasks || [])
        .filter(task => task.status === 'completed')
        .sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return dateB - dateA; // Orden descendente (más reciente primero)
        });
      const masterContext = masterContextResult;

      // ✅ Migrado a NestJS - GET /telar/server/products/user/{user_id}
      let productCount = 0;
      if (shopData?.id) {
        try {
          const products = await getProductsByUserId(user.id);
          productCount = products.length;
        } catch (error) {
          console.error('[useFixedTasksManager] Error fetching products:', error);
          productCount = 0;
        }
      }

      // Process user state
      const hasShop = !!shopData?.id;
      const hasBrand = !!(shopData?.logoUrl);
      const hasHeroSlider = !!(shopData?.heroConfig as any)?.slides?.length;
      const hasStory = !!(shopData?.story || (shopData?.aboutContent as any)?.story);
      const hasArtisanProfile = !!(shopData as any)?.artisanProfileCompleted;
      const hasSocialLinks = !!(shopData?.socialLinks && Object.keys(shopData.socialLinks as object).length > 0);
      const contactInfo = (shopData?.contactInfo as any) || {};
      const hasContactInfo = !!(contactInfo?.email || contactInfo?.phone);
      const hasRUT = !!(profileData?.rut && !profileData?.rutPendiente);
      // Check id_contraparty from artisan_shops instead of artisan_bank_data
      const hasBankData = !!(shopData?.idContraparty);

      // Process maturity blocks from master context
      const completedBlocks: number[] = [];
      const taskGenContext = (masterContext?.taskGenerationContext as any) || {};
      const maturityProgress = taskGenContext.maturity_test_progress || {};
      const totalAnswered = maturityProgress.total_answered || 0;

      // Cada 5 preguntas = 1 bloque completado
      const completedBlockCount = Math.floor(totalAnswered / 5);
      for (let i = 1; i <= Math.min(completedBlockCount, 6); i++) {
        completedBlocks.push(i);
      }

      // Process completed tasks with deduplication
      const taskMap = new Map<string, any>();
      completedTasks.forEach(task => {
        const existing = taskMap.get(task.agent_id);
        if (!existing || new Date(task.completed_at || task.created_at) > new Date(existing.completed_at || existing.created_at)) {
          taskMap.set(task.agent_id, task);
        }
      });

      const completed = new Set<FixedTaskId>();
      const completedWithData: CompletedFixedTask[] = [];

      taskMap.forEach(task => {
        let taskId: FixedTaskId | null = null;

        if (task.agent_id === 'create_shop' || task.title?.includes('tienda')) taskId = 'create_shop';
        else if (task.agent_id === 'create_brand' || task.title?.includes('marca')) taskId = 'create_brand';
        else if (task.agent_id === 'first_product' || task.title?.includes('primer producto')) taskId = 'first_product';
        else if (task.agent_id === 'five_products' || task.title?.includes('5 productos')) taskId = 'five_products';
        else if (task.agent_id === 'ten_products' || task.title?.includes('10 productos')) taskId = 'ten_products';
        else if (task.agent_id === 'customize_shop' || task.title?.includes('Personaliza')) taskId = 'customize_shop';
        else if (task.agent_id === 'create_story' || task.title?.includes('historia') || task.title?.includes('About')) taskId = 'create_story';
        else if (task.agent_id === 'create_artisan_profile' || task.title?.includes('Perfil Artesanal')) taskId = 'create_artisan_profile';
        else if (task.agent_id === 'complete_rut' || task.title?.includes('RUT')) taskId = 'complete_rut';
        else if (task.agent_id === 'add_contact') taskId = 'add_contact';
        else if (task.agent_id === 'add_social_links') taskId = 'add_social_links';
        else if (task.agent_id === 'complete_bank_data' || task.title?.includes('datos bancarios')) taskId = 'complete_bank_data';
        else if (task.agent_id === 'maturity_block_1' || task.title?.includes('Bloque 1')) taskId = 'maturity_block_1';
        else if (task.agent_id === 'maturity_block_2' || task.title?.includes('Bloque 2')) taskId = 'maturity_block_2';
        else if (task.agent_id === 'maturity_block_3' || task.title?.includes('Bloque 3')) taskId = 'maturity_block_3';
        else if (task.agent_id === 'maturity_block_4' || task.title?.includes('Bloque 4')) taskId = 'maturity_block_4';
        else if (task.agent_id === 'maturity_block_5' || task.title?.includes('Bloque 5')) taskId = 'maturity_block_5';
        else if (task.agent_id === 'maturity_block_6' || task.title?.includes('Bloque 6')) taskId = 'maturity_block_6';

        if (taskId) {
          completed.add(taskId);
          const fixedTask = FIXED_TASKS.find(t => t.id === taskId);
          if (fixedTask) {
            completedWithData.push({
              ...fixedTask,
              completedAt: task.completed_at || task.created_at
            });
          }
        }
      });

      // Auto-detect completed tasks based on real user state
      // This ensures tasks reflect actual data even if agent_tasks is out of sync
      if (hasRUT && !completed.has('complete_rut')) {
        completed.add('complete_rut');
        const rutTask = FIXED_TASKS.find(t => t.id === 'complete_rut');
        if (rutTask) {
          completedWithData.push({
            ...rutTask,
            completedAt: new Date().toISOString()
          });
        }
      }

      if (hasShop && !completed.has('create_shop')) {
        completed.add('create_shop');
        const shopTask = FIXED_TASKS.find(t => t.id === 'create_shop');
        if (shopTask) {
          completedWithData.push({
            ...shopTask,
            completedAt: new Date().toISOString()
          });
        }
      }

      if (productCount >= 1 && !completed.has('first_product')) {
        completed.add('first_product');
        const task = FIXED_TASKS.find(t => t.id === 'first_product');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      if (productCount >= 5 && !completed.has('five_products')) {
        completed.add('five_products');
        const task = FIXED_TASKS.find(t => t.id === 'five_products');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      if (productCount >= 10 && !completed.has('ten_products')) {
        completed.add('ten_products');
        const task = FIXED_TASKS.find(t => t.id === 'ten_products');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      if (hasHeroSlider && !completed.has('customize_shop')) {
        completed.add('customize_shop');
        const task = FIXED_TASKS.find(t => t.id === 'customize_shop');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      if (hasStory && !completed.has('create_story')) {
        completed.add('create_story');
        const task = FIXED_TASKS.find(t => t.id === 'create_story');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      if (hasContactInfo && !completed.has('add_contact')) {
        completed.add('add_contact');
        const task = FIXED_TASKS.find(t => t.id === 'add_contact');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      if (hasSocialLinks && !completed.has('add_social_links')) {
        completed.add('add_social_links');
        const task = FIXED_TASKS.find(t => t.id === 'add_social_links');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      if (hasBankData && !completed.has('complete_bank_data')) {
        completed.add('complete_bank_data');
        const task = FIXED_TASKS.find(t => t.id === 'complete_bank_data');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      // Auto-detect artisan profile completed
      if (hasArtisanProfile && !completed.has('create_artisan_profile')) {
        completed.add('create_artisan_profile');
        const task = FIXED_TASKS.find(t => t.id === 'create_artisan_profile');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      // Auto-detect maturity blocks
      for (let i = 1; i <= 6; i++) {
        const blockId = `maturity_block_${i}` as FixedTaskId;
        if (completedBlocks.includes(i) && !completed.has(blockId)) {
          completed.add(blockId);
          const task = FIXED_TASKS.find(t => t.id === blockId);
          if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
        }
      }

      // Update state
      setCompletedTaskIds(completed);
      setCompletedTasksData(completedWithData);
      setUserState({
        hasShop,
        hasBrand,
        productCount,
        hasRUT,
        hasHeroSlider,
        hasStory,
        hasArtisanProfile,
        hasSocialLinks,
        hasContactInfo,
        hasBankData,
        completedMaturityBlocks: completedBlocks,
        completedTaskIds: Array.from(completed)
      });

      console.log('📋 [FixedTasks] Data loaded:', {
        completed: Array.from(completed).length,
        hasShop,
        productCount
      });

    } catch (error) {
      console.error('❌ [FixedTasks] Error loading data:', error);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [user]);

  // Complete a task
  const completeTask = useCallback(async (taskId: FixedTaskId) => {
    if (!user || completedTaskIds.has(taskId)) return;

    try {
      const task = FIXED_TASKS.find(t => t.id === taskId);
      if (!task) return;

      // ✅ Migrado a NestJS - GET /telar/server/agent-tasks/user/{user_id}
      const allUserTasks = await getAgentTasksByUserId(user.id);

      // Buscar si existe una tarea con este agent_id
      const existingTasks = allUserTasks
        .filter(t => t.agentId === taskId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const existing = existingTasks[0];

      if (existing?.status === 'completed') {
        setCompletedTaskIds(prev => new Set([...prev, taskId]));
        return;
      }

      if (existing) {
        // ✅ Migrado a NestJS - PATCH /telar/server/agent-tasks/{id}
        await updateAgentTask(existing.id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          progressPercentage: 100
        });
      } else {
        // ✅ Migrado a NestJS - POST /telar/server/agent-tasks
        await createAgentTask({
          userId: user.id,
          agentId: taskId,
          title: task.title,
          description: task.description || '',
          status: 'completed',
          completedAt: new Date().toISOString(),
          progressPercentage: 100,
          priority: task.priority,
          relevance: 'high',
          environment: 'production'
        });
      }

      setCompletedTaskIds(prev => new Set([...prev, taskId]));

      // 🔔 Crear notificación de milestone completado (solo para tareas importantes)
      const milestoneTaskIds: FixedTaskId[] = [
        'create_shop', 'create_brand', 'first_product', 'five_products',
        'customize_shop', 'complete_rut', 'complete_bank_data'
      ];

      if (milestoneTaskIds.includes(taskId)) {
        await NotificationTemplates.milestoneCompleted(user.id, task.title, taskId);
      }

      console.log('✅ [FixedTasks] Task completed:', taskId);
    } catch (error) {
      console.error('❌ [FixedTasks] Error completing task:', error);
    }
  }, [user, completedTaskIds]);

  // Calculate available tasks - memoized
  const availableTasks = useMemo(() => {
    if (!userState) return [];

    return FIXED_TASKS.filter(task => {
      if (completedTaskIds.has(task.id)) return false;

      if (task.requirements) {
        if (task.requirements.mustComplete) {
          const allCompleted = task.requirements.mustComplete.every(
            id => completedTaskIds.has(id)
          );
          if (!allCompleted) return false;
        }

        if (task.requirements.mustHave) {
          const { shop, brand, products, rut, maturityBlock } = task.requirements.mustHave;
          if (shop && !userState.hasShop) return false;
          if (brand && !userState.hasBrand) return false;
          if (products && userState.productCount < products.min) return false;
          if (rut && !userState.hasRUT) return false;
          if (maturityBlock && !userState.completedMaturityBlocks.includes(maturityBlock)) return false;
        }
      }

      return true;
    });
  }, [userState, completedTaskIds]);

  // Debounced reload for EventBus
  const debouncedReload = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      loadAllData();
    }, 500);
  }, [loadAllData]);

  // Initialize on mount - SINGLE useEffect
  useEffect(() => {
    if (!user || isInitializedRef.current) return;

    isInitializedRef.current = true;
    loadAllData();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [user, loadAllData]);

  // EventBus subscriptions
  useEffect(() => {
    if (!user) return;

    const handlers: Array<() => void> = [
      EventBus.subscribe('shop.created', debouncedReload),
      EventBus.subscribe('brand.wizard.completed', debouncedReload),
      EventBus.subscribe('product.created', debouncedReload),
      EventBus.subscribe('shop.customized', debouncedReload),
      EventBus.subscribe('shop.story.created', debouncedReload),
      EventBus.subscribe('shop.contact.added', debouncedReload),
      EventBus.subscribe('legal.nit.completed', debouncedReload),
      EventBus.subscribe('shop.social_links.added', debouncedReload),
      EventBus.subscribe('task.updated', debouncedReload),
      EventBus.subscribe('bank.data.completed', debouncedReload),
      EventBus.subscribe('maturity.block.completed', debouncedReload),
      EventBus.subscribe('artisan.profile.completed', debouncedReload),
    ];

    return () => handlers.forEach(unsub => unsub());
  }, [user, debouncedReload]);

  return {
    tasks: availableTasks,
    completedTasks: completedTasksData,
    completedTaskIds: Array.from(completedTaskIds),
    loading,
    completeTask,
    refresh: loadAllData
  };
};
