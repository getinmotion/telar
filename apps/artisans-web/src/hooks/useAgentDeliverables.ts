
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AgentDeliverable {
  id: string;
  user_id: string;
  agent_id: string;
  conversation_id: string | null;
  task_id: string | null;
  title: string;
  description: string | null;
  file_type: string;
  content: string | null;
  file_url: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function useAgentDeliverables(agentId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliverables, setDeliverables] = useState<AgentDeliverable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliverables = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('agent_deliverables')
        .select('*')
        .eq('user_id', user.id);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDeliverables(data || []);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los deliverables',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createDeliverable = async (deliverableData: Partial<AgentDeliverable>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('agent_deliverables')
        .insert({
          user_id: user.id,
          agent_id: deliverableData.agent_id,
          conversation_id: deliverableData.conversation_id,
          task_id: deliverableData.task_id,
          title: deliverableData.title,
          description: deliverableData.description,
          file_type: deliverableData.file_type || 'text',
          content: deliverableData.content,
          file_url: deliverableData.file_url,
          metadata: deliverableData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      
      setDeliverables(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating deliverable:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el deliverable',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateDeliverable = async (deliverableId: string, updates: Partial<AgentDeliverable>) => {
    try {
      const { data, error } = await supabase
        .from('agent_deliverables')
        .update(updates)
        .eq('id', deliverableId)
        .select()
        .single();

      if (error) throw error;
      
      setDeliverables(prev => prev.map(deliverable => 
        deliverable.id === deliverableId ? data : deliverable
      ));
      return data;
    } catch (error) {
      console.error('Error updating deliverable:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el deliverable',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteDeliverable = async (deliverableId: string) => {
    try {
      const { error } = await supabase
        .from('agent_deliverables')
        .delete()
        .eq('id', deliverableId);

      if (error) throw error;
      
      setDeliverables(prev => prev.filter(deliverable => deliverable.id !== deliverableId));
    } catch (error) {
      console.error('Error deleting deliverable:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el deliverable',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchDeliverables();
  }, [user, agentId]);

  return {
    deliverables,
    loading,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    refreshDeliverables: fetchDeliverables
  };
}
