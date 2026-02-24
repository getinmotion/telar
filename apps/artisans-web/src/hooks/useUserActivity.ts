
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AgentConversation } from './useAgentConversations';

export function useUserActivity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recentConversations, setRecentConversations] = useState<AgentConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('agent_chat_conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (error) {
            throw error;
        }

        setRecentConversations(data || []);
      } catch (error) {
        console.error('Error fetching user activity:', error);
        toast({
            title: 'Error',
            description: 'Could not load recent activity.',
            variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user, toast]);

  return { recentConversations, loading };
}
