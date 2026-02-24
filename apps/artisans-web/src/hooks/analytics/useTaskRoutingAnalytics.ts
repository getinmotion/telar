import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AgentTask } from '@/hooks/types/agentTaskTypes';
import { WizardRoute } from '@/utils/taskWizardRouter';

type MatchedBy = 'task_id' | 'deliverable_type' | 'agent_keyword' | 'fallback';
type CompletionMethod = 'wizard' | 'generic' | 'abandoned' | 'error';

interface LogRoutingParams {
  task: AgentTask;
  wizardRoute: WizardRoute;
  matchedBy: MatchedBy;
  matchedValue?: string;
}

interface UpdateRoutingParams {
  taskId: string;
  wasSuccessful: boolean;
  completionMethod: CompletionMethod;
  errorMessage?: string;
}

export const useTaskRoutingAnalytics = () => {
  const { user } = useAuth();

  /**
   * Log cuando una tarea es enrutada (a wizard o flujo genérico)
   */
  const logTaskRouting = async ({
    task,
    wizardRoute,
    matchedBy,
    matchedValue
  }: LogRoutingParams): Promise<string | null> => {
    if (!user?.id) {
      console.warn('⚠️ Cannot log routing: user not authenticated');
      return null;
    }

    try {
      const analyticsData = {
        user_id: user.id,
        task_id: task.id,
        route_type: wizardRoute.type,
        destination: wizardRoute.destination || null,
        wizard_name: wizardRoute.destination 
          ? (wizardRoute.destination.includes('brand-wizard') ? 'Brand Wizard' : 
             wizardRoute.destination.includes('productos/subir') ? 'Product Upload Wizard' : 
             'Unknown Wizard')
          : null,
        task_title: task.title,
        task_agent_id: task.agent_id,
        task_deliverable_type: task.deliverableType || (task as any).deliverable_type || null,
        matched_by: matchedBy,
        matched_value: matchedValue || null,
        user_agent: navigator.userAgent,
        session_id: sessionStorage.getItem('session_id') || generateSessionId()
      };

      console.log('📊 Logging task routing:', {
        taskId: task.id,
        title: task.title,
        routeType: wizardRoute.type,
        destination: wizardRoute.destination,
        matchedBy,
        matchedValue
      });

      const { data, error } = await supabase
        .from('task_routing_analytics')
        .insert(analyticsData)
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error logging task routing:', error);
        return null;
      }

      console.log('✅ Task routing logged successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Unexpected error logging task routing:', error);
      return null;
    }
  };

  /**
   * Actualizar el estado de completación de una ruta
   */
  const updateRoutingCompletion = async ({
    taskId,
    wasSuccessful,
    completionMethod,
    errorMessage
  }: UpdateRoutingParams): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      console.log('📊 Updating routing completion:', {
        taskId,
        wasSuccessful,
        completionMethod
      });

      const { error } = await supabase
        .from('task_routing_analytics')
        .update({
          completed_at: new Date().toISOString(),
          was_successful: wasSuccessful,
          completion_method: completionMethod,
          error_message: errorMessage || null
        })
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .order('routed_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error updating routing completion:', error);
        return false;
      }

      console.log('✅ Routing completion updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Unexpected error updating routing completion:', error);
      return false;
    }
  };

  /**
   * Obtener resumen de analytics de routing del usuario
   */
  const getRoutingSummary = async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('task_routing_summary')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching routing summary:', error);
      return null;
    }
  };

  /**
   * Obtener historial detallado de routing del usuario
   */
  const getRoutingHistory = async (limit: number = 50) => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('task_routing_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('routed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching routing history:', error);
      return [];
    }
  };

  return {
    logTaskRouting,
    updateRoutingCompletion,
    getRoutingSummary,
    getRoutingHistory
  };
};

// Helper para generar session ID único
function generateSessionId(): string {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', sessionId);
  return sessionId;
}
