// DEPRECATED: Task step types - moved to deprecated folder
// These types are no longer used in the main application
// All task step functionality has been consolidated into the Master Coordinator

export interface TaskStep {
  id: string;
  task_id: string;
  step_number: number;
  title: string;
  description: string;
  input_type: 'text' | 'calculation' | 'checklist' | 'file_upload' | 'url';
  expected_output?: string;
  ai_context_prompt: string;
  completion_status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  user_input_data: any;
  validation_notes?: string | null;
  validation_criteria: any;
  ai_assistance_log: any;
  created_at: string;
  updated_at: string;
}

export interface StepValidation {
  id: string;
  step_id: string;
  validation_type: 'automatic' | 'ai_assisted' | 'manual';
  validation_result: 'passed' | 'failed' | 'pending';
  feedback: string | null;
  user_confirmation: string | null;
  created_at: string;
}

export interface TaskStepValidation extends StepValidation {}

export interface StepInputData {
  [key: string]: any;
}