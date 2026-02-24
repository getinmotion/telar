/**
 * AI Master Coordinator Types
 * 
 * Tipos para las invocaciones al coordinador maestro de IA.
 */

// ============= Request Types =============

export interface MaturityScores {
  ideaValidation: number;
  userExperience: number;
  marketFit: number;
  monetization: number;
}

export interface UserProfileContext {
  [key: string]: any;
}

export interface BusinessProfileContext {
  [key: string]: any;
}

export interface AnalyzeAndGenerateTasksRequest {
  action: 'analyze_and_generate_tasks';
  userId: string;
  businessDescription?: string;
  maturityScores?: MaturityScores | null;
  userProfile?: UserProfileContext;
  businessProfile?: BusinessProfileContext | null;
}

export interface MasterCoordinatorRequest {
  action: string;
  userId?: string;
  [key: string]: any;
}

// ============= Response Types =============

export interface GeneratedTask {
  id?: string;
  user_id?: string;
  agent_id: string;
  title: string;
  description: string;
  status?: string;
  priority?: string | number;
  relevance?: string;
  estimated_time?: string;
  prerequisites?: string[];
  expected_outcome?: string;
  resources?: any[];
  metadata?: Record<string, any>;
}

export interface AnalyzeAndGenerateTasksResponse {
  success: boolean;
  tasks: GeneratedTask[];
  analysis?: {
    maturityLevel?: string;
    recommendations?: string[];
    priorityAreas?: string[];
  };
  message?: string;
}

export interface MasterCoordinatorErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}
