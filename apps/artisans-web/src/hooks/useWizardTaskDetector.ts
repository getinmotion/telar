/**
 * Wizard Task Detector Hook
 * 
 * Detecta automáticamente cuando un wizard se completa y marca
 * las tareas relacionadas como completadas.
 * 
 * Escucha eventos de finalización de wizards:
 * - brand.wizard.completed
 * - product.wizard.completed
 * - shop.wizard.completed
 */

import { useEffect } from 'react';
import { EventBus } from '@/utils/eventBus';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useWizardTaskDetector = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('[WizardTaskDetector] 🎯 Monitoring wizard completions...');

    // Handler para wizards completados
    const handleWizardCompleted = async (data: { 
      userId: string; 
      taskId?: string;
      wizardType: 'brand' | 'product' | 'shop';
    }) => {
      console.log('[WizardTaskDetector] 🎉 Wizard completed:', data);

      if (data.userId !== user.id) {
        console.log('[WizardTaskDetector] ⚠️ Event not for current user, ignoring');
        return;
      }

      // Si viene con un taskId específico, ya fue manejado por el wizard
      if (data.taskId) {
        console.log('[WizardTaskDetector] ✅ Task already handled by wizard');
        return;
      }

      // Buscar tareas relacionadas con este tipo de wizard que estén pendientes
      try {
        const taskKeywords = {
          brand: ['marca', 'brand', 'identidad', 'logo', 'colores'],
          product: ['producto', 'product', 'inventario', 'inventory', 'catálogo'],
          shop: ['tienda', 'shop', 'publicar', 'publish']
        };

        const keywords = taskKeywords[data.wizardType];
        
        console.log(`[WizardTaskDetector] 🔍 Searching for ${data.wizardType} tasks with keywords:`, keywords);

        // Buscar tareas activas que coincidan con las keywords
        const { data: tasks, error } = await supabase
          .from('agent_tasks')
          .select('id, title, description, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress']);

        if (error) {
          console.error('[WizardTaskDetector] ❌ Error fetching tasks:', error);
          return;
        }

        if (!tasks || tasks.length === 0) {
          console.log('[WizardTaskDetector] ℹ️ No active tasks found');
          return;
        }

        // Filtrar tareas que coincidan con las keywords
        const matchingTasks = tasks.filter(task => {
          const searchText = `${task.title} ${task.description}`.toLowerCase();
          return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
        });

        console.log(`[WizardTaskDetector] 📋 Found ${matchingTasks.length} matching tasks:`, 
          matchingTasks.map(t => ({ id: t.id, title: t.title }))
        );

        // Marcar todas las tareas coincidentes como completadas
        for (const task of matchingTasks) {
          console.log(`[WizardTaskDetector] 🎯 Marking task as completed: ${task.id} - ${task.title}`);
          
          const { error: updateError } = await supabase
            .from('agent_tasks')
            .update({
              status: 'completed',
              progress_percentage: 100,
              completed_at: new Date().toISOString()
            })
            .eq('id', task.id)
            .eq('user_id', user.id);

          if (updateError) {
            console.error(`[WizardTaskDetector] ❌ Error updating task ${task.id}:`, updateError);
          } else {
            console.log(`[WizardTaskDetector] ✅ Task ${task.id} marked as completed`);
          }
        }

        // Trigger full sync to update dashboard
        EventBus.publish('master.full.sync', { 
          source: 'wizard_task_detector',
          wizardType: data.wizardType 
        });

      } catch (error) {
        console.error('[WizardTaskDetector] ❌ Error processing wizard completion:', error);
      }
    };

    // Suscribirse a eventos de wizards completados
    const unsubscribeBrand = EventBus.subscribe('brand.wizard.completed', (data) => {
      handleWizardCompleted({ ...data, wizardType: 'brand' });
    });

    const unsubscribeProduct = EventBus.subscribe('product.wizard.completed', (data) => {
      handleWizardCompleted({ ...data, wizardType: 'product' });
    });

    const unsubscribeShop = EventBus.subscribe('shop.wizard.completed', (data) => {
      handleWizardCompleted({ ...data, wizardType: 'shop' });
    });

    console.log('[WizardTaskDetector] ✅ Subscribed to wizard completion events');

    return () => {
      unsubscribeBrand();
      unsubscribeProduct();
      unsubscribeShop();
      console.log('[WizardTaskDetector] 🧹 Unsubscribed from wizard completion events');
    };
  }, [user]);

  return {
    // Hook is mostly passive, just listens for events
    isActive: !!user
  };
};
