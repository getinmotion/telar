/**
 * TypeScript interfaces for User Master Context (NestJS Backend)
 */

// ============= Core Types =============

export interface BusinessContext {
  industry?: string;
  businessSize?: string;
  yearsInBusiness?: number;
  [key: string]: unknown;
}

export interface Preferences {
  theme?: string;
  notifications?: boolean;
  emailFrequency?: string;
  [key: string]: unknown;
}

export interface ConversationInsights {
  commonTopics?: string[];
  sentiment?: string;
  [key: string]: unknown;
}

export interface TechnicalDetails {
  hasWebsite?: boolean;
  usesSocialMedia?: string[];
  [key: string]: unknown;
}

export interface GoalsAndObjectives {
  shortTerm?: string;
  longTerm?: string;
  [key: string]: unknown;
}

export interface BusinessProfile {
  targetMarket?: string;
  productCategories?: string[];
  [key: string]: unknown;
}

export interface TaskGenerationContext {
  priorityAreas?: string[];
  currentChallenges?: string[];
  [key: string]: unknown;
}

// ============= Main Entity =============

export interface UserMasterContext {
  id: string;
  userId: string;
  businessContext: BusinessContext;
  preferences: Preferences;
  conversationInsights: ConversationInsights;
  technicalDetails: TechnicalDetails;
  goalsAndObjectives: GoalsAndObjectives;
  contextVersion: number | null;
  lastUpdated: string;
  createdAt: string;
  businessProfile: BusinessProfile;
  taskGenerationContext: TaskGenerationContext;
  languagePreference: string | null;
  lastAssessmentDate: string | null;
}

// ============= Request Payloads =============

export interface UpdateUserMasterContextPayload {
  userId?: string; // Optional in payload, required in URL
  businessContext?: BusinessContext;
  preferences?: Preferences;
  conversationInsights?: ConversationInsights;
  technicalDetails?: TechnicalDetails;
  goalsAndObjectives?: GoalsAndObjectives;
  contextVersion?: number;
  businessProfile?: BusinessProfile;
  taskGenerationContext?: TaskGenerationContext;
  languagePreference?: string;
}

export interface CreateUserMasterContextPayload extends UpdateUserMasterContextPayload {
  userId: string; // Required for creation
}

// ============= Response Types =============

export type GetUserMasterContextSuccessResponse = UserMasterContext;

export interface UserMasterContextErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: {
    response: {
      message: string;
      error: string;
      statusCode: number;
    };
    status: number;
    options: Record<string, any>;
    message: string;
    name: string;
  };
}
