import { telarApi } from '@/integrations/api/telarApi';

export interface CreateAgentTaskPayload {
  userId: string;
  agentId: string;
  title: string;
  description?: string;
  milestoneCategory?: 'formalization' | 'brand' | 'shop' | 'sales' | 'community';
  priority?: number;
  relevance?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progressPercentage?: number;
  environment?: 'production' | 'staging';
  deliverableType?: string;
  dueDate?: string;
  notes?: string;
}

// completedAt se omite del payload — el backend lo asigna automáticamente al pasar status: 'completed'
export interface UpdateAgentTaskPayload {
  title?: string;
  description?: string;
  milestoneCategory?: 'formalization' | 'brand' | 'shop' | 'sales' | 'community';
  priority?: number;
  relevance?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progressPercentage?: number;
  environment?: 'production' | 'staging';
  deliverableType?: string;
  dueDate?: string;
  notes?: string;
  timeSpent?: number;
  isArchived?: boolean;
}

export interface AgentTask {
  id: string;
  userId: string;
  agentId: string;
  title: string;
  description: string | null;
  milestoneCategory: string | null;
  priority: number;
  relevance: string;
  status: string;
  progressPercentage: number;
  environment: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  dueDate: string | null;
}

export async function getAgentTasksByUserId(userId: string): Promise<AgentTask[]> {
  const response = await telarApi.get<AgentTask[]>(
    `/agent-tasks/user/${userId}`
  );
  return response.data;
}

export async function createAgentTask(payload: CreateAgentTaskPayload): Promise<AgentTask> {
  const response = await telarApi.post<AgentTask>('/agent-tasks', payload);
  return response.data;
}

export async function updateAgentTask(
  id: string,
  payload: UpdateAgentTaskPayload
): Promise<AgentTask> {
  const response = await telarApi.patch<AgentTask>(
    `/agent-tasks/${id}`,
    payload
  );
  return response.data;
}

export async function createAgentTasksBulk(
  tasks: CreateAgentTaskPayload[]
): Promise<AgentTask[]> {
  return Promise.all(tasks.map(task => createAgentTask(task)));
}
