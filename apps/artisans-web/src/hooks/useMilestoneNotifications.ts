import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EventBus } from '@/utils/eventBus';
import { supabase } from '@/integrations/supabase/client';
import { getAchievementCatalogById } from '@/services/achievementsCatalog.actions';
import { createUserAchievement } from '@/services/userAchievements.actions';
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

          // ✅ MIGRATED: Get badge info from NestJS catalog
          // Endpoint: GET /achievements-catalog/:id
          try {
            const catalogBadge = await getAchievementCatalogById(badgeId);

            // ✅ MIGRATED: Create user achievement via NestJS
            // Endpoint: POST /user-achievements
            await createUserAchievement({
              userId: user.id,
              achievementId: badgeId,
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
          } catch (achievementError: any) {
            // Si el badge no existe en el catálogo o ya está desbloqueado, ignorar
            if (achievementError.response?.status === 404 || achievementError.response?.status === 409) {
              return;
            }
            throw achievementError;
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
