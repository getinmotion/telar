/**
 * Task Step Types
 * 
 * Tipos para los pasos de tareas (task_steps) del sistema.
 */

// ============= Core Types =============

export interface TaskStepTask {
  id: string;
  userId: string;
  agentId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIAssistanceLogEntry {
  timestamp: string;
  message: string;
  aiResponse: string;
}

export interface TaskStep {
  id: string;
  taskId: string;
  stepNumber: number;
  title: string;
  description: string | null;
  inputType: string | null;
  validationCriteria: Record<string, any> | null;
  aiContextPrompt: string | null;
  completionStatus: string;
  userInputData: Record<string, any> | null;
  aiAssistanceLog: AIAssistanceLogEntry[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  task: TaskStepTask;
}

// ============= API Response Types =============

export interface GetTaskStepsByUserIdResponse {
  success: true;
  data: TaskStep[];
}

export interface TaskStepErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
}

// ============= Payload Types =============

export interface CreateTaskStepPayload {
  taskId: string;
  stepNumber: number;
  title: string;
  description?: string;
  inputType?: string;
  validationCriteria?: Record<string, any>;
  aiContextPrompt?: string;
  completionStatus?: string;
  userInputData?: Record<string, any>;
  aiAssistanceLog?: AIAssistanceLogEntry[];
}

export interface UpdateTaskStepPayload {
  stepNumber?: number;
  title?: string;
  description?: string;
  inputType?: string;
  validationCriteria?: Record<string, any>;
  aiContextPrompt?: string;
  completionStatus?: string;
  userInputData?: Record<string, any>;
  aiAssistanceLog?: AIAssistanceLogEntry[];
}
