import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventBus } from '@/utils/eventBus';

export type MaturityCategory = 'ideaValidation' | 'userExperience' | 'marketFit' | 'monetization';
export type ActionType = 'sale' | 'agent_use' | 'task_completed' | 'customer_interaction' | 'milestone';

export interface MaturityAction {
  type: ActionType;
  category: MaturityCategory;
  points: number;
  description: string;
  metadata?: any;
}

export interface MaturityScores {
  ideaValidation: number;
  userExperience: number;
  marketFit: number;
  monetization: number;
}

const getCategoryName = (category: MaturityCategory, lang: 'es' | 'en' = 'es'): string => {
  const names = {
    es: {
      ideaValidation: 'Validación de Idea',
      userExperience: 'Experiencia de Usuario',
      marketFit: 'Ajuste al Mercado',
      monetization: 'Monetización'
    },
    en: {
      ideaValidation: 'Idea Validation',
      userExperience: 'User Experience',
      marketFit: 'Market Fit',
      monetization: 'Monetization'
    }
  };
  return names[lang][category];
};

export const useMaturityTracker = () => {
  const { user } = useAuth();
  const [tracking, setTracking] = useState(false);

  const trackAction = useCallback(async (action: MaturityAction): Promise<MaturityScores | null> => {
    if (!user?.id) {
      console.warn('No authenticated user for maturity tracking');
      return null;
    }

    try {
      setTracking(true);

      console.log(`🎯 Tracking maturity action:`, {
        userId: user.id,
        category: action.category,
        points: action.points,
        description: action.description
      });

      // Call the increment_maturity_score RPC function
      const { data, error } = await supabase.rpc('increment_maturity_score', {
        user_uuid: user.id,
        score_category: action.category,
        increment_points: action.points,
        action_description: action.description,
        action_metadata: action.metadata || {}
      });

      if (error) {
        console.error('Error tracking maturity action:', error);
        toast.error('Error al actualizar tu nivel de madurez');
        return null;
      }

      if (data && data.length > 0) {
        const scores: MaturityScores = {
          ideaValidation: data[0].idea_validation,
          userExperience: data[0].user_experience,
          marketFit: data[0].market_fit,
          monetization: data[0].monetization
        };

        // Show success notification
        const categoryName = getCategoryName(action.category);
        toast.success(`🎯 +${action.points}% en ${categoryName}`, {
          description: action.description,
          duration: 5000
        });

        console.log('✅ Maturity score updated:', scores);

        // Publish event for progress recalculation
        EventBus.publish('maturity.score_updated', { scores, category: action.category });
        EventBus.publish('master.full.sync', { source: 'maturity_score_update' });

        return scores;
      }

      return null;
    } catch (err) {
      console.error('Unexpected error tracking maturity action:', err);
      toast.error('Error inesperado al actualizar nivel de madurez');
      return null;
    } finally {
      setTracking(false);
    }
  }, [user]);

  return {
    trackAction,
    tracking
  };
};
