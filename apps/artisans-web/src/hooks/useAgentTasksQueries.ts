
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AgentTask, PaginatedTasks } from './types/agentTaskTypes';
import {
  getActiveTasksByUserId,
  getArchivedTasksByUserId,
  getTasksByUserIdAndStatus,
  AgentTask as NestJSAgentTask,
} from '@/services/agentTasks.actions';

// Helper: Convert NestJS camelCase response to frontend snake_case format
const mapNestJSTaskToAgentTask = (task: NestJSAgentTask): AgentTask => ({
  id: task.id,
  user_id: task.userId,
  agent_id: task.agentId,
  conversation_id: null,
  title: task.title,
  description: task.description,
  relevance: task.relevance as 'low' | 'medium' | 'high',
  progress_percentage: task.progressPercentage,
  status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
  priority: task.priority,
  due_date: task.dueDate,
  completed_at: task.completedAt,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  subtasks: [],
  notes: '',
  steps_completed: {},
  resources: [],
  time_spent: 0,
  is_archived: false,
  milestone_category: task.milestoneCategory || undefined,
});

export function useAgentTasksQueries(user: any, agentId?: string) {
  const { toast } = useToast();

  // ✅ MIGRATED: Fetch tasks from NestJS
  // Endpoints: GET /agent-tasks/user/:userId/active or /archived
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
      // Fetch from NestJS based on archived status
      let data = includeArchived
        ? await getArchivedTasksByUserId(user.id)
        : await getActiveTasksByUserId(user.id);

      // Filter by agentId if provided (client-side filter)
      if (agentId) {
        data = data.filter(task => task.agentId === agentId);
      }

      // Convert from NestJS camelCase to frontend snake_case format
      const mappedTasks = data.map(mapNestJSTaskToAgentTask);

      // Sort by creation date (newest first)
      const sortedTasks = [...mappedTasks].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTasks(sortedTasks);
      setTotalCount(sortedTasks.length);
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

  // ✅ MIGRATED: Fetch paginated tasks from NestJS
  // Endpoints: GET /agent-tasks/user/:userId/active, /archived, or /status/:status
  const fetchPaginatedTasks = useCallback(async (
    page: number = 1,
    pageSize: number = 10,
    filter: 'all' | 'pending' | 'in_progress' | 'completed' | 'archived' = 'all'
  ): Promise<PaginatedTasks> => {
    if (!user) {
      return { tasks: [], totalCount: 0, totalPages: 0, currentPage: page };
    }

    try {
      let data: NestJSAgentTask[];

      // Fetch from appropriate endpoint based on filter
      if (filter === 'archived') {
        data = await getArchivedTasksByUserId(user.id);
      } else if (filter === 'pending' || filter === 'in_progress' || filter === 'completed') {
        data = await getTasksByUserIdAndStatus(user.id, filter);
      } else {
        // filter === 'all' - get active tasks
        data = await getActiveTasksByUserId(user.id);
      }

      // Filter by agentId if provided (client-side filter)
      if (agentId) {
        data = data.filter(task => task.agentId === agentId);
      }

      // Convert from NestJS camelCase to frontend snake_case
      const mappedTasks = data.map(mapNestJSTaskToAgentTask);

      // Sort by creation date (newest first)
      const sortedTasks = [...mappedTasks].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Apply client-side pagination
      const totalCount = sortedTasks.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      const paginatedTasks = sortedTasks.slice(from, to);

      return {
        tasks: paginatedTasks,
        totalCount,
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
