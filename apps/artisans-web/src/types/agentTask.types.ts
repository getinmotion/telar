/**
 * Agent Task Types
 * 
 * Tipos para las tareas de agentes (agent_tasks) del sistema.
 */

// ============= Core Types =============

export interface AgentTaskSubtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface AgentTaskResource {
  type: string;
  url: string;
  title: string;
}

export interface AgentTask {
  id: string;
  userId: string;
  agentId: string;
  conversationId: string | null;
  title: string;
  description: string | null;
  relevance: string;
  progressPercentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: number | null;
  dueDate: string | null;
  subtasks: AgentTaskSubtask[];
  notes: string;
  stepsCompleted: Record<string, boolean>;
  resources: AgentTaskResource[];
  timeSpent: number;
  isArchived: boolean;
  environment: string;
  deliverableType: string | null;
  milestoneCategory: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  // Legacy fields for backward compatibility
  metadata?: Record<string, any> | null;
}

// ============= Request Payloads =============

export interface CreateAgentTaskPayload {
  userId: string;
  agentId: string;
  conversationId?: string;
  title: string;
  description?: string;
  relevance?: string;
  progressPercentage?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: number;
  dueDate?: string;
  subtasks?: AgentTaskSubtask[];
  notes?: string;
  stepsCompleted?: Record<string, any>;
  resources?: AgentTaskResource[];
  timeSpent?: number;
  isArchived?: boolean;
  environment?: string;
  deliverableType?: string;
  milestoneCategory?: string;
  completedAt?: string;
}

export interface UpdateAgentTaskPayload {
  agentId?: string;
  conversationId?: string;
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progressPercentage?: number;
  dueDate?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

// ============= Response Types =============

export type GetAgentTasksByUserIdResponse = AgentTask[];

export interface UpdateAgentTaskSuccessResponse {
  id: string;
  userId: string;
  agentId: string;
  conversationId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  progressPercentage: number;
  dueDate: string | null;
  completedAt: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTaskErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}
