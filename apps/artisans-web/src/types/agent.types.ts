/**
 * Agent Types
 * Types for the agent onboarding service
 */

export interface OnboardingMetadata {
  artisan_id: string;
  processed_at: string;
  form_version: string;
}

export interface OnboardingStatus {
  code: string;
  onboarding_complete: boolean;
}

export interface OnboardingMessage {
  title: string;
  body: string;
}

export interface NextPriorityAction {
  based_on_q16: string;
  recommendations: string[];
}

export interface OnboardingResponseData {
  metadata: OnboardingMetadata;
  status: OnboardingStatus;
  maturity_level: 'emergente' | 'en_desarrollo' | 'consolidado';
  message: OnboardingMessage;
  next_priority_action: NextPriorityAction;
}

export interface OnboardingResponse {
  onboarding_response: OnboardingResponseData;
}

/**
 * Error response from API
 */
export interface AgentErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}
