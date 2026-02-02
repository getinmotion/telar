/**
 * Agent Deliverable Types
 * Tipos para entregables de agentes
 */

// ============= Nested Types =============

export interface DeliverableUser {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableTask {
  id: string;
  userId: string;
  agentId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  completedAt: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============= Main Types =============

export interface AgentDeliverable {
  id: string;
  userId: string;
  agentId: string;
  conversationId: string | null;
  taskId: string | null;
  title: string;
  description: string;
  fileType: string;
  content: string | null;
  fileUrl: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: DeliverableUser;
  task?: DeliverableTask | null;
}

// ============= Request Types =============

export interface CreateAgentDeliverablePayload {
  userId: string;
  agentId: string;
  conversationId?: string;
  taskId?: string;
  title: string;
  description?: string;
  fileType: string;
  content?: string;
  fileUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateAgentDeliverablePayload {
  title?: string;
  description?: string;
  fileType?: string;
  content?: string;
  fileUrl?: string;
  metadata?: Record<string, any>;
}

// ============= Response Types =============

export interface GetAgentDeliverablesResponse {
  success: true;
  data: AgentDeliverable[];
}

export interface GetAgentDeliverableByIdResponse {
  success: true;
  data: AgentDeliverable;
}

export interface CreateAgentDeliverableResponse {
  success: true;
  data: AgentDeliverable;
}

export interface UpdateAgentDeliverableResponse {
  success: true;
  data: AgentDeliverable;
}

// ============= Error Types =============

export interface AgentDeliverableErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// ============= Union Types =============

export type AgentDeliverableResponse = 
  | GetAgentDeliverablesResponse 
  | GetAgentDeliverableByIdResponse
  | CreateAgentDeliverableResponse
  | UpdateAgentDeliverableResponse
  | AgentDeliverableErrorResponse;
