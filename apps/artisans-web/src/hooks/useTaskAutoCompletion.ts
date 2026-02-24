/**
 * Task Auto-Completion Hook
 * Listens to system events and auto-completes tasks
 */

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { EventBus } from '@/utils/eventBus';
import { supabase } from '@/integrations/supabase/client';
import { FixedTaskId } from '@/types/fixedTask';
import { FIXED_TASKS } from '@/config/fixedTasks';
import { toast } from 'sonner';


export const useTaskAutoCompletion = () => {
  const { user } = useAuth();

  const completeTask = async (taskId: FixedTaskId) => {
    if (!user) return;

    try {
      const task = FIXED_TASKS.find(t => t.id === taskId);
      if (!task) return;

      // Check if task exists (get most recent one)
      const { data: existing } = await supabase
        .from('agent_tasks')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('agent_id', taskId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Already completed
      if (existing?.status === 'completed') {
        console.log('✅ [Auto-Completion] Task already completed:', taskId);
        return;
      }

      if (existing) {
        // UPDATE existing task
        const { error } = await supabase
          .from('agent_tasks')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            progress_percentage: 100
          })
          .eq('id', existing.id);

        if (error) throw error;
        console.log('✅ [Auto-Completion] Task updated to completed:', taskId);
      } else {
        // INSERT new task as completed
        const { error } = await supabase
          .from('agent_tasks')
          .insert({
            user_id: user.id,
            agent_id: taskId,
            title: task.title,
            description: task.description,
            status: 'completed',
            completed_at: new Date().toISOString(),
            progress_percentage: 100,
            priority: task.priority,
            relevance: 'high',
            environment: 'production'
          });

        if (error) throw error;
        console.log('✅ [Auto-Completion] Task created as completed:', taskId);
      }

      // Emit update event
      EventBus.publish('task.updated', { taskId, status: 'completed' });
    } catch (error) {
      console.error('❌ [Auto-Completion] Error completing task:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribers = [
      // Onboarding completed - create initial tasks with retry and duplicate prevention
      EventBus.subscribe('onboarding.completed', async ({ userId }) => {
        console.log('🎯 [TaskAutoCompletion] Onboarding completed, checking for existing tasks');
        
        // 🔧 PREVENT DUPLICATES: Check if tasks already exist
        const { data: existingTasks } = await supabase
          .from('agent_tasks')
          .select('agent_id')
          .eq('user_id', userId)
          .in('agent_id', ['create_shop', 'create_brand']);
        
        if (existingTasks && existingTasks.length > 0) {
          console.log('📋 [TaskAutoCompletion] Tasks already exist for user, skipping creation:', 
            existingTasks.map(t => t.agent_id));
          toast.info('¡Tus misiones ya están listas!', { duration: 2000 });
          EventBus.publish('tasks.initialized', { userId });
          return;
        }

        console.log('🎯 [TaskAutoCompletion] No existing tasks found, creating initial tasks');
        
        const initialTasks = [
          {
            user_id: userId,
            title: 'Crea tu tienda online',
            description: 'Configura tu tienda en 3 pasos simples',
            agent_id: 'create_shop',
            status: 'pending',
            priority: 1,
            environment: 'production',
            relevance: 'high'
          },
          {
            user_id: userId,
            title: 'Define tu identidad de marca',
            description: 'Logo, colores y claim de tu marca',
            agent_id: 'create_brand',
            status: 'pending',
            priority: 2,
            environment: 'production',
            relevance: 'high'
          }
        ];
        
        // ✅ Retry automático con feedback al usuario
        let attempt = 1;
        const maxAttempts = 3;
        let success = false;
        
        while (attempt <= maxAttempts && !success) {
          console.log(`📋 [TASKS] Creating initial tasks (attempt ${attempt}/${maxAttempts})`);
          
          const { error } = await supabase
            .from('agent_tasks')
            .insert(initialTasks);
          
          if (!error) {
            success = true;
            console.log('✅ [TaskAutoCompletion] Initial tasks created successfully');
            
            // Publicar evento de éxito
            EventBus.publish('tasks.initialized', { userId });
            
            // Notificar al usuario
            toast.success('🎉 ¡Tus primeras misiones están listas!', {
              duration: 3000
            });
            break;
          }
          
          console.error(`❌ [TASKS] Attempt ${attempt} failed:`, error);
          attempt++;
          
          // Si falla el último intento
          if (attempt > maxAttempts) {
            console.error('❌ [TASKS] All attempts failed');
            
            // Notificar al usuario del error
            toast.error(
              '⚠️ Hubo un problema al crear tus misiones. Recarga la página para intentarlo de nuevo.',
              { duration: 5000 }
            );
            
            // Programar retry posterior (5 segundos)
            setTimeout(() => {
              console.log('🔄 [TASKS] Retrying task creation after delay...');
              EventBus.publish('onboarding.completed', { userId });
            }, 5000);
          } else {
            // Esperar antes de reintentar (backoff exponencial)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }),
      
      // Shop created
      EventBus.subscribe('shop.created', () => {
        console.log('🏪 Shop created event detected');
        completeTask('create_shop');
      }),
      
      // Brand wizard completed
      EventBus.subscribe('brand.wizard.completed', () => {
        console.log('🎨 Brand wizard completed');
        completeTask('create_brand');
      }),
      
      // Product uploaded - will be auto-detected by manager
      EventBus.subscribe('product.created', () => {
        console.log('📦 Product created - task manager will auto-detect count');
        completeTask('first_product');
      }),
      
      // RUT completed
      EventBus.subscribe('legal.nit.completed', () => {
        console.log('📄 RUT completed');
        completeTask('complete_rut');
      }),
      
      // Maturity block completed
      EventBus.subscribe('maturity.block.completed', ({ blockNumber }: { blockNumber: number }) => {
        console.log('🎯 Maturity block completed:', blockNumber);
        completeTask(`maturity_block_${blockNumber}` as FixedTaskId);
      }),

      // Shop customized (hero/banner updated)
      EventBus.subscribe('shop.customized', () => {
        console.log('🎨 Shop customized');
        completeTask('customize_shop');
      }),

      // Story created (about section)
      EventBus.subscribe('shop.story.created', () => {
        console.log('📖 Shop story created');
        completeTask('create_story');
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user]);

  return { completeTask };
};

