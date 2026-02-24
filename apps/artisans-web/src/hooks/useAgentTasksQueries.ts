
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AgentTask, PaginatedTasks } from './types/agentTaskTypes';
import { convertToAgentTask } from './utils/agentTaskUtils';

export function useAgentTasksQueries(user: any, agentId?: string) {
  const { toast } = useToast();

  const fetchTasks = useCallback(async (
    setTasks: React.Dispatch<React.SetStateAction<AgentTask[]>>,
    setTotalCount: React.Dispatch<React.SetStateAction<number>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    includeArchived: boolean = false
  ) => {
    if (!user) {
      setTasks([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('agent_tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedTasks: AgentTask[] = (data || []).map(convertToAgentTask);
      
      setTasks(typedTasks);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tareas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, agentId, toast]);

  const fetchPaginatedTasks = useCallback(async (
    page: number = 1, 
    pageSize: number = 10, 
    filter: 'all' | 'pending' | 'in_progress' | 'completed' | 'archived' = 'all'
  ): Promise<PaginatedTasks> => {
    if (!user) {
      return { tasks: [], totalCount: 0, totalPages: 0, currentPage: page };
    }

    try {
      let query = supabase
        .from('agent_tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      if (filter === 'archived') {
        query = query.eq('is_archived', true);
      } else if (filter !== 'all') {
        query = query.eq('status', filter).eq('is_archived', false);
      } else {
        query = query.eq('is_archived', false);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      const typedTasks: AgentTask[] = (data || []).map(convertToAgentTask);
      
      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        tasks: typedTasks,
        totalCount: count || 0,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching paginated tasks:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tareas',
        variant: 'destructive',
      });
      return { tasks: [], totalCount: 0, totalPages: 0, currentPage: page };
    }
  }, [user, agentId, toast]);

  return {
    fetchTasks,
    fetchPaginatedTasks
  };
}
