
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UseRealtimeAgentsProps {
  onAgentChange: () => void;
}

export const useRealtimeAgents = ({ onAgentChange }: UseRealtimeAgentsProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-agents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_agents',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time agent change:', payload);
          onAgentChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_usage_metrics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time usage change:', payload);
          onAgentChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onAgentChange]);
};
