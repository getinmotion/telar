export interface TaskStep {
  id: string;
  task_id: string;
  step_number: number;
  title: string;
  description: string;
  input_type: string;
  validation_criteria: any;
  ai_context_prompt?: string;
  completion_status: string;
  user_input_data: any;
  ai_assistance_log: any;
  created_at: string;
  updated_at: string;
}

export interface StepValidation {
  id: string;
  step_id: string;
  user_id: string;
  validation_type: 'automatic' | 'ai_assisted' | 'manual';
  validation_result: 'passed' | 'failed' | 'pending';
  validation_data: Record<string, any>;
  ai_feedback?: string;
  user_confirmation?: string;
  created_at: string;
}

export interface StepInputData {
  text?: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
  selection?: string | string[];
  calculation?: {
    formula: string;
    result: number;
    variables: Record<string, number>;
  };
  url?: string;
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
}