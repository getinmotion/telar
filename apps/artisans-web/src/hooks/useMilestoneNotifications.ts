import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EventBus } from '@/utils/eventBus';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

/**
 * FASE 4: Unified Milestone Notifications - SOLO EventBus
 * 
 * Hook centralizado para notificaciones de milestones.
 * TODAS las notificaciones vienen EXCLUSIVAMENTE de EventBus.
 * 
 * NO monitorea unifiedProgress directamente (evita duplicados).
 * Los publishers deben emitir eventos vía EventBus cuando detecten cambios.
 */
export const useMilestoneNotifications = () => {
  const { toast } = useToast();

  // Subscribe to EventBus milestone events and unlock badges
  useEffect(() => {
    const unsubscribers = [
      EventBus.subscribe('milestone.completed', async (data) => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        // Award milestone badge achievement
        const badgeId = `milestone_${data.milestoneId}`;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Check if badge already exists
          const { data: existing } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', user.id)
            .eq('achievement_id', badgeId)
            .single();

          if (!existing) {
            // Get badge info from catalog
            const { data: catalogBadge } = await supabase
              .from('achievements_catalog')
              .select('*')
              .eq('id', badgeId)
              .single();

            if (catalogBadge) {
              // Unlock badge
              await supabase
                .from('user_achievements')
                .insert({
                  user_id: user.id,
                  achievement_id: badgeId,
                  title: catalogBadge.title,
                  description: catalogBadge.description,
                  icon: catalogBadge.icon
                });

              // Show badge unlock notification
              toast({
                title: `🏆 ¡Badge Desbloqueado!`,
                description: catalogBadge.title,
                duration: 6000
              });
            }
          }
        } catch (error) {
          console.error('Error unlocking milestone badge:', error);
        }
      }),

      EventBus.subscribe('milestone.unlocked', (data) => {
        console.log('🔓 Milestone unlocked via EventBus:', data);
      }),

      EventBus.subscribe('milestone.almost.complete', (data) => {
        console.log('🔥 Milestone almost complete via EventBus:', data);
      }),

      EventBus.subscribe('milestone.tasks.generated', (data) => {
        toast({
          title: `✨ Nuevas Tareas Disponibles`,
          description: `${data.count} tareas generadas para ${data.milestoneName}`,
        });
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [toast]);
};
