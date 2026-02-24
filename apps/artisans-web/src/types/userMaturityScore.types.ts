/**
 * Types for User Maturity Scores
 * Based on NestJS entity: UserMaturityScore
 */

// ============= Main Interface =============

export interface UserMaturityScore {
  id: string;
  userId: string;
  ideaValidation: number;      // 0-100
  userExperience: number;      // 0-100
  marketFit: number;           // 0-100
  monetization: number;        // 0-100
  profileData: Record<string, any> | null;
  createdAt: string;           // ISO timestamp
  totalScore?: number;         // Calculated field (average)
}

// ============= Payloads =============

export interface CreateUserMaturityScorePayload {
  userId: string;
  ideaValidation: number;
  userExperience: number;
  marketFit: number;
  monetization: number;
  profileData?: Record<string, any> | null;
}

// ============= Response Types =============

export interface GetUserMaturityScoresSuccessResponse {
  data: UserMaturityScore[];
}

export interface CreateUserMaturityScoreSuccessResponse {
  data: UserMaturityScore;
}

export interface UserMaturityScoreErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}
