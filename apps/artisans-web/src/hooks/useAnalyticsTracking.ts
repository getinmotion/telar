import { useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { getScoresForAnalytics } from '@/services/userMaturityScores.actions';
import { logAnalyticsEvent } from '@/services/analyticsEvents.actions';

export type AnalyticsEventType = 
  | 'task_started'
  | 'task_completed'
  | 'task_abandoned'
  | 'task_step_started'
  | 'task_step_completed'
  | 'task_step_viewed'
  | 'question_answered'
  | 'onboarding_step_completed'
  | 'onboarding_block_completed'
  | 'onboarding_started'
  | 'dashboard_refresh'
  | 'chat_opened'
  | 'mission_completed'
  | 'deliverable_downloaded'
  | 'onboarding_assessment_started'
  | 'onboarding_assessment_completed'
  | 'onboarding_assessment_failed'
  | 'conversation_started'
  | 'conversation_message_sent'
  | 'deliverable_generated'
  | 'deliverable_downloaded'
  | 'profile_updated'
  | 'agent_enabled'
  | 'agent_analysis_completed'
  | 'agent_analysis_failed'
  | 'tasks_generated'
  | 'tasks_generation_failed'
  | 'task_validated'
  | 'task_validation_failed'
  | 'mission_started'
  | 'mission_completed'
  | 'dashboard_refresh'
  | 'chat_opened'
  | 'page_view';

interface TrackEventParams {
  eventType: AnalyticsEventType;
  eventData?: Record<string, any>;
  success?: boolean;
  durationSeconds?: number;
  agentId?: string;
  taskId?: string;
}

export const useAnalyticsTracking = () => {
  const { user } = useAuth();
  const authStore = useAuthStore();

  // ✅ FALLBACK: Intentar obtener userId de múltiples fuentes
  const userId = useMemo((): string | null => {
    // 1. AuthContext (preferido)
    if (user?.id) return user.id;
    
    // 2. Zustand store
    if (authStore.user?.id) return authStore.user.id;
    
    // 3. localStorage directo (último recurso)
    try {
      const storedUser = localStorage.getItem('telar_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) return parsed.id;
      }
    } catch (error) {
      console.error('[Analytics] Error parsing stored user:', error);
    }
    
    return null;
  }, [user?.id, authStore.user?.id]);

  const trackEvent = useCallback(async (params: TrackEventParams) => {
    if (!userId) {
      console.warn('[Analytics] Cannot track event: no authenticated user');
      return;
    }

    const {
      eventType,
      eventData = {},
      success = true,
      durationSeconds,
      agentId,
      taskId
    } = params;

    try {
      // Get user's maturity level from latest scores
      // ✅ Migrado a endpoint NestJS (GET /user-maturity-scores/user/{user_id})
      const maturityData = await getScoresForAnalytics(userId);

      let maturityLevel = 'unknown';
      if (maturityData) {
        const avgScore = (
          maturityData.ideaValidation +
          maturityData.userExperience +
          maturityData.marketFit +
          maturityData.monetization
        ) / 4;

        if (avgScore >= 80) maturityLevel = 'advanced';
        else if (avgScore >= 60) maturityLevel = 'intermediate';
        else if (avgScore >= 40) maturityLevel = 'basic';
        else maturityLevel = 'beginner';
      }

      // ✅ Log to persistent analytics via NestJS backend
      const analyticsEvent = await logAnalyticsEvent({
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.pathname,
          maturity_level: maturityLevel,
          agent_id: agentId,
          task_id: taskId
        },
        session_id: `session_${Date.now()}`,
        success,
        duration_ms: durationSeconds ? durationSeconds * 1000 : undefined
      });

      console.log('✅ Event tracked:', eventType, analyticsEvent.id);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, [userId]);

  const trackTaskStart = useCallback((taskId: string, agentId: string, taskData?: Record<string, any>) => {
    trackEvent({
      eventType: 'task_started',
      eventData: { task_id: taskId, agent_id: agentId, ...taskData },
      agentId,
      taskId
    });
  }, [trackEvent]);

  const trackTaskComplete = useCallback((
    taskId: string, 
    agentId: string, 
    durationSeconds?: number,
    taskData?: Record<string, any>
  ) => {
    trackEvent({
      eventType: 'task_completed',
      eventData: { task_id: taskId, agent_id: agentId, ...taskData },
      success: true,
      durationSeconds,
      agentId,
      taskId
    });
  }, [trackEvent]);

  const trackTaskAbandon = useCallback((
    taskId: string, 
    agentId: string,
    reason?: string,
    taskData?: Record<string, any>
  ) => {
    trackEvent({
      eventType: 'task_abandoned',
      eventData: { task_id: taskId, agent_id: agentId, reason, ...taskData },
      success: false,
      agentId,
      taskId
    });
  }, [trackEvent]);

  const trackPageView = useCallback((page: string, metadata?: Record<string, any>) => {
    trackEvent({
      eventType: 'page_view',
      eventData: { page, ...metadata }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackTaskStart,
    trackTaskComplete,
    trackTaskAbandon,
    trackPageView
  };
};
