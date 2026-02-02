import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentInsight {
  agent_id: string;
  agent_name: string;
  task_count: number;
  completed_tasks: number;
  latest_activity: string;
  progress_percentage: number;
  latest_deliverable?: {
    title: string;
    created_at: string;
    file_type: string;
  };
}

interface UserInsights {
  total_tasks: number;
  completed_tasks: number;
  active_conversations: number;
  total_deliverables: number;
  agent_insights: AgentInsight[];
  recent_activity: Array<{
    type: 'task' | 'conversation' | 'deliverable';
    title: string;
    agent_id: string;
    created_at: string;
    description?: string;
  }>;
}

export function useUserInsights() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch task statistics
      const { data: tasks, error: tasksError } = await supabase
        .from('agent_tasks')
        .select('agent_id, status, title, created_at')
        .eq('user_id', user.id)
        .eq('is_archived', false);

      if (tasksError) throw tasksError;

      // Fetch conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from('agent_chat_conversations')
        .select('agent_id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('is_archived', false);

      if (conversationsError) throw conversationsError;

      // Fetch deliverables
      const { data: deliverables, error: deliverablesError } = await supabase
        .from('agent_deliverables')
        .select('agent_id, title, created_at, file_type, task_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (deliverablesError) throw deliverablesError;

      // Process agent insights
      const agentMap = new Map<string, AgentInsight>();
      const agentNames: Record<string, string> = {
        'marketing-agent': 'Agente de Marketing',
        'financial-agent': 'Agente Financiero',
        'cultural-agent': 'Agente Cultural',
        'operations-agent': 'Agente de Operaciones',
        'strategy-agent': 'Agente Estratégico'
      };

      // Initialize agent insights
      tasks?.forEach(task => {
        if (!agentMap.has(task.agent_id)) {
          agentMap.set(task.agent_id, {
            agent_id: task.agent_id,
            agent_name: agentNames[task.agent_id] || task.agent_id,
            task_count: 0,
            completed_tasks: 0,
            latest_activity: task.created_at,
            progress_percentage: 0
          });
        }

        const insight = agentMap.get(task.agent_id)!;
        insight.task_count++;
        if (task.status === 'completed') {
          insight.completed_tasks++;
        }
        if (task.created_at > insight.latest_activity) {
          insight.latest_activity = task.created_at;
        }
      });

      // Add latest deliverables to agent insights
      deliverables?.forEach(deliverable => {
        const insight = agentMap.get(deliverable.agent_id);
        if (insight && !insight.latest_deliverable) {
          insight.latest_deliverable = {
            title: deliverable.title,
            created_at: deliverable.created_at,
            file_type: deliverable.file_type
          };
        }
      });

      // Calculate progress percentages
      agentMap.forEach(insight => {
        insight.progress_percentage = insight.task_count > 0 
          ? Math.round((insight.completed_tasks / insight.task_count) * 100)
          : 0;
      });

      // Create recent activity timeline
      const recentActivity = [
        ...(tasks?.slice(0, 5).map(task => ({
          type: 'task' as const,
          title: task.title,
          agent_id: task.agent_id,
          created_at: task.created_at,
          description: `Estado: ${task.status}`
        })) || []),
        ...(conversations?.slice(0, 3).map(conv => ({
          type: 'conversation' as const,
          title: conv.title || 'Conversación',
          agent_id: conv.agent_id,
          created_at: conv.updated_at,
          description: 'Conversación activa'
        })) || []),
        ...(deliverables?.slice(0, 3).map(deliv => ({
          type: 'deliverable' as const,
          title: deliv.title,
          agent_id: deliv.agent_id,
          created_at: deliv.created_at,
          description: `Entregable ${deliv.file_type}`
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 8);

      const processedInsights: UserInsights = {
        total_tasks: tasks?.length || 0,
        completed_tasks: tasks?.filter(t => t.status === 'completed').length || 0,
        active_conversations: conversations?.length || 0,
        total_deliverables: deliverables?.length || 0,
        agent_insights: Array.from(agentMap.values()),
        recent_activity: recentActivity
      };

      setInsights(processedInsights);

    } catch (error) {
      console.error('Error fetching user insights:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los insights del usuario.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user]);

  return {
    insights,
    loading,
    refreshInsights: fetchInsights
  };
}