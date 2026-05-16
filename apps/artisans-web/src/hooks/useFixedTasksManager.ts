/**
 * Fixed Tasks Manager Hook - OPTIMIZED
 * - Parallel DB queries with Promise.all
 * - No circular dependencies
 * - Debounced EventBus handling
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FIXED_TASKS } from '@/config/fixedTasks';
import { FixedTask, FixedTaskId, UserTaskState } from '@/types/fixedTask';
import { EventBus } from '@/utils/eventBus';
import { NotificationTemplates } from '@/services/notificationService';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';
import { getUserProgressByUserId } from '@/services/userProgress.actions';
import { getAgentTasksByUserId, createAgentTask, updateAgentTask } from '@/services/agentTasks.actions';
import { getProductsByUserId } from '@/services/products.actions';
import { getUserMasterContextByUserId } from '@/services/userMasterContext.actions';

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

  // Load all data in parallel
  const loadAllData = useCallback(async () => {
    if (!user || isLoadingRef.current) return;

    isLoadingRef.current = true;

    try {
      const [shopData, profileData, progressData, allTasks, masterContext] = await Promise.all([
        getArtisanShopByUserId(user.id).catch(() => null),
        getUserProfileByUserId(user.id).catch(() => null),
        getUserProgressByUserId(user.id).catch(() => null),
        getAgentTasksByUserId(user.id).catch(() => []),
        getUserMasterContextByUserId(user.id).catch(() => null),
      ]);

      // Filtrar solo tareas completadas y ordenar por fecha
      const completedAgentTasks = (allTasks || [])
        .filter(task => task.status === 'completed')
        .sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return dateB - dateA;
        });

      let productCount = 0;
      if (shopData?.id) {
        try {
          const products = await getProductsByUserId(user.id);
          productCount = products.length;
        } catch {
          productCount = 0;
        }
      }

      const hasShop = !!shopData?.id;
      const brandEval = (masterContext?.businessContext as Record<string, unknown> | undefined)
        ?.brand_evaluation as Record<string, unknown> | undefined;
      const hasBrand = !!(brandEval?.logo_url || shopData?.logoUrl || profileData?.avatarUrl);
      const hasArtisanProfile = !!(shopData as any)?.artisanProfileCompleted;

      // Process completed tasks with deduplication
      const taskMap = new Map<string, any>();
      completedAgentTasks.forEach(task => {
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
        else if (task.agent_id === 'create_artisan_profile' || task.title?.includes('Perfil Artesanal')) taskId = 'create_artisan_profile';
        else if (task.agent_id === 'review_brand' || task.title?.includes('diagnóstico de marca')) taskId = 'review_brand';

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
      if (hasShop && !completed.has('create_shop')) {
        completed.add('create_shop');
        const shopTask = FIXED_TASKS.find(t => t.id === 'create_shop');
        if (shopTask) {
          completedWithData.push({ ...shopTask, completedAt: new Date().toISOString() });
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

      if (hasBrand && !completed.has('create_brand')) {
        completed.add('create_brand');
        const task = FIXED_TASKS.find(t => t.id === 'create_brand');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      if (hasArtisanProfile && !completed.has('create_artisan_profile')) {
        completed.add('create_artisan_profile');
        const task = FIXED_TASKS.find(t => t.id === 'create_artisan_profile');
        if (task) completedWithData.push({ ...task, completedAt: new Date().toISOString() });
      }

      setCompletedTaskIds(completed);
      setCompletedTasksData(completedWithData);
      setUserState({
        hasShop,
        hasBrand,
        productCount,
        hasArtisanProfile,
        completedTaskIds: Array.from(completed)
      });

    } catch {
      // silent fail
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [user]);

  const completeTask = useCallback(async (taskId: FixedTaskId) => {
    if (!user || completedTaskIds.has(taskId)) return;

    try {
      const task = FIXED_TASKS.find(t => t.id === taskId);
      if (!task) return;

      const allUserTasks = await getAgentTasksByUserId(user.id);

      const existingTasks = allUserTasks
        .filter(t => t.agentId === taskId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const existing = existingTasks[0];

      if (existing?.status === 'completed') {
        setCompletedTaskIds(prev => new Set([...prev, taskId]));
        return;
      }

      if (existing) {
        await updateAgentTask(existing.id, {
          status: 'completed',
          progressPercentage: 100
        });
      } else {
        await createAgentTask({
          userId: user.id,
          agentId: taskId,
          title: task.title,
          description: task.description || '',
          status: 'completed',
          progressPercentage: 100,
          priority: task.priority,
          relevance: 'high',
          environment: 'production'
        });
      }

      setCompletedTaskIds(prev => new Set([...prev, taskId]));

      const milestoneTaskIds: FixedTaskId[] = [
        'create_shop', 'create_brand', 'first_product', 'five_products', 'create_artisan_profile'
      ];

      if (milestoneTaskIds.includes(taskId)) {
        await NotificationTemplates.milestoneCompleted(user.id, task.title, taskId);
      }

    } catch {
      // silent fail
    }
  }, [user, completedTaskIds]);

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
          const { shop, brand, products } = task.requirements.mustHave;
          if (shop && !userState.hasShop) return false;
          if (brand && !userState.hasBrand) return false;
          if (products && userState.productCount < products.min) return false;
        }
      }

      return true;
    });
  }, [userState, completedTaskIds]);

  const debouncedReload = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      loadAllData();
    }, 500);
  }, [loadAllData]);

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

  useEffect(() => {
    if (!user) return;

    const handlers: Array<() => void> = [
      EventBus.subscribe('shop.created', debouncedReload),
      EventBus.subscribe('brand.wizard.completed', debouncedReload),
      EventBus.subscribe('product.created', debouncedReload),
      EventBus.subscribe('task.updated', debouncedReload),
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
