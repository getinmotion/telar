/**
 * Master Coordinator Context Types
 * Tipos para el contexto del coordinador maestro
 */

// ============= Nested Types =============

export interface CoordinatorUser {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIMemoryEntry {
  timestamp: string;
  message: string;
  response?: string;
  context: string;
  sentiment?: string;
  taskId?: string;
  type?: string;
  tags?: string[];
}

export interface ContextSnapshot {
  currentGoals?: string[];
  businessStage?: string;
  lastMilestone?: string;
  completedTasks?: string[];
  pendingTasks?: string[];
  userPreferences?: {
    notificationsEnabled?: boolean;
    language?: string;
    timezone?: string;
  };
  businessInfo?: {
    name?: string;
    type?: string;
    location?: string;
    yearsInBusiness?: number;
    employeeCount?: number;
  };
  aiPersonality?: string;
  communicationStyle?: string;
  [key: string]: any; // Para flexibilidad con otros campos
}

// ============= Main Types =============

export interface MasterCoordinatorContext {
  id: string;
  userId: string;
  contextVersion: number;
  contextSnapshot: ContextSnapshot;
  aiMemory: AIMemoryEntry[];
  lastInteractionAt: string;
  createdAt: string;
  updatedAt: string;
  user?: CoordinatorUser;
}

// ============= Request Types =============

export interface CreateMasterCoordinatorContextPayload {
  userId: string;
  contextSnapshot?: ContextSnapshot;
  lastInteraction?: string;
  aiMemory?: AIMemoryEntry[];
  contextVersion?: number;
}

export interface UpdateMasterCoordinatorContextPayload {
  contextSnapshot?: ContextSnapshot;
  aiMemory?: AIMemoryEntry[];
  lastInteractionAt?: string;
}

// ============= Response Types =============

export interface GetMasterCoordinatorContextResponse {
  success: true;
  data: MasterCoordinatorContext;
}

export interface CreateMasterCoordinatorContextResponse {
  id: string;
  userId: string;
  contextSnapshot: ContextSnapshot;
  lastInteraction: string;
  aiMemory: AIMemoryEntry[];
  contextVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMasterCoordinatorContextResponse {
  success: true;
  data: MasterCoordinatorContext;
}

// ============= Error Types =============

export interface MasterCoordinatorContextErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// ============= Union Types =============

export type MasterCoordinatorContextResponse = 
  | GetMasterCoordinatorContextResponse 
  | UpdateMasterCoordinatorContextResponse
  | MasterCoordinatorContextErrorResponse;
