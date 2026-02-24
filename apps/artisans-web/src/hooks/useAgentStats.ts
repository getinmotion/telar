
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AgentStats {
  totalConversations: number;
  totalMessages: number;
  activeTasks: number;
  completedTasks: number;
  deliverables: number;
  avgSessionTime: number;
  recentActivity: {
    id: string;
    type: 'message' | 'task' | 'deliverable';
    title: string;
    timestamp: string;
  }[];
}

export const useAgentStats = (agentId: string) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgentStats>({
    totalConversations: 0,
    totalMessages: 0,
    activeTasks: 0,
    completedTasks: 0,
    deliverables: 0,
    avgSessionTime: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !agentId) return;

      try {
        // Fetch conversations count
        const { count: conversationsCount } = await supabase
          .from('agent_chat_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .eq('is_archived', false);

        // Fetch messages count
        const { data: conversations } = await supabase
          .from('agent_chat_conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('agent_id', agentId);

        let messagesCount = 0;
        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id);
          const { count } = await supabase
            .from('agent_messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds);
          messagesCount = count || 0;
        }

        // Fetch tasks
        const { data: tasks } = await supabase
          .from('agent_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('agent_id', agentId);

        const activeTasks = tasks?.filter(t => t.status !== 'completed').length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;

        // Fetch deliverables count
        const { count: deliverablesCount } = await supabase
          .from('agent_deliverables')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('agent_id', agentId);

        // Fetch usage metrics for avg session time
        const { data: metrics } = await supabase
          .from('agent_usage_metrics')
          .select('session_duration')
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .not('session_duration', 'is', null);

        const avgSessionTime = metrics && metrics.length > 0
          ? metrics.reduce((sum, m) => sum + (m.session_duration || 0), 0) / metrics.length
          : 0;

        // Create recent activity from available data
        const recentActivity = [];
        
        if (conversations && conversations.length > 0) {
          const { data: recentMessages } = await supabase
            .from('agent_messages')
            .select('content, created_at, conversation_id')
            .in('conversation_id', conversations.map(c => c.id))
            .order('created_at', { ascending: false })
            .limit(3);

          recentMessages?.forEach(msg => {
            recentActivity.push({
              id: `msg-${Math.random()}`,
              type: 'message' as const,
              title: msg.content.substring(0, 50) + '...',
              timestamp: msg.created_at
            });
          });
        }

        if (tasks && tasks.length > 0) {
          tasks.slice(0, 2).forEach(task => {
            recentActivity.push({
              id: `task-${task.id}`,
              type: 'task' as const,
              title: task.title,
              timestamp: task.updated_at
            });
          });
        }

        // Sort by timestamp
        recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setStats({
          totalConversations: conversationsCount || 0,
          totalMessages: messagesCount,
          activeTasks,
          completedTasks,
          deliverables: deliverablesCount || 0,
          avgSessionTime: Math.round(avgSessionTime / 60), // Convert to minutes
          recentActivity: recentActivity.slice(0, 5)
        });

      } catch (error) {
        console.error('Error fetching agent stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, agentId]);

  return { stats, loading };
};
