/**
 * Service for User Maturity Scores API interactions
 * Handles all communication with NestJS backend for user_maturity_scores table
 */

import { telarApi } from '@/integrations/api/telarApi';
import {
  UserMaturityScore,
  CreateUserMaturityScorePayload,
  UserMaturityScoreErrorResponse
} from '@/types/userMaturityScore.types';

// ============= GET Operations =============

/**
 * Get all maturity scores for a user (ordered by created_at DESC)
 * @param userId - User ID
 * @returns Array of maturity scores (empty array if none found)
 */
export const getUserMaturityScoresByUserId = async (
  userId: string
): Promise<UserMaturityScore[]> => {
  try {
    const response = await telarApi.get<UserMaturityScore[]>(
      `/user-maturity-scores/user/${userId}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(
      error.response?.data?.message || 'Failed to fetch maturity scores'
    );
  }
};

/**
 * Get the latest (most recent) maturity score for a user
 * @param userId - User ID
 * @returns Latest maturity score or null if none found
 */
export const getLatestMaturityScore = async (
  userId: string
): Promise<UserMaturityScore | null> => {
  try {
    const scores = await getUserMaturityScoresByUserId(userId);
    return scores.length > 0 ? scores[0] : null;
  } catch (error: any) {
    return null;
  }
};

/**
 * Check if user has any maturity scores
 * @param userId - User ID
 * @returns true if user has at least one score
 */
export const hasMaturityScores = async (userId: string): Promise<boolean> => {
  try {
    const scores = await getUserMaturityScoresByUserId(userId);
    return scores.length > 0;
  } catch (error) {
    return false;
  }
};

// ============= CREATE Operations =============

/**
 * Create a new maturity score
 * POST /user-maturity-scores
 * 
 * @param payload - Maturity score data
 * @returns Created maturity score
 */
export const createUserMaturityScore = async (
  payload: CreateUserMaturityScorePayload
): Promise<UserMaturityScore> => {
  try {
    const response = await telarApi.post<UserMaturityScore>(
      '/user-maturity-scores',
      payload
    );
    return response.data;
  } catch (error: any) {
    const errorData: UserMaturityScoreErrorResponse = error.response?.data;
    throw new Error(
      errorData?.message || 'Failed to create maturity score'
    );
  }
};

// ============= DELETE Operations =============

/**
 * Delete all maturity scores for a user
 * DELETE /user-maturity-scores/user/{user_id}
 * 
 * NOTE: This endpoint might not exist yet. If it doesn't, you'll need to create it.
 * Used for debug/reset operations.
 * 
 * @param userId - User ID
 * @returns void
 */
export const deleteUserMaturityScores = async (
  userId: string
): Promise<void> => {
  try {
    await telarApi.delete(
      `/user-maturity-scores/user/${userId}`
    );
  } catch (error: any) {
    // Don't throw - this is for debug operations
    // If endpoint doesn't exist, log a TODO
    if (error.response?.status === 404) {
    }
  }
};

// ============= Utility Functions =============

/**
 * Calculate total score (average of all 4 categories)
 * @param score - Maturity score object
 * @returns Average score (0-100)
 */
export const calculateTotalScore = (score: UserMaturityScore): number => {
  return Math.round(
    (score.ideaValidation +
      score.userExperience +
      score.marketFit +
      score.monetization) / 4
  );
};

/**
 * Get scores for analytics (just the 4 main scores)
 * @param userId - User ID
 * @returns Object with 4 score categories or null
 */
export const getScoresForAnalytics = async (
  userId: string
): Promise<{
  ideaValidation: number;
  userExperience: number;
  marketFit: number;
  monetization: number;
} | null> => {
  try {
    const latestScore = await getLatestMaturityScore(userId);
    if (!latestScore) return null;

    return {
      ideaValidation: latestScore.ideaValidation,
      userExperience: latestScore.userExperience,
      marketFit: latestScore.marketFit,
      monetization: latestScore.monetization
    };
  } catch (error) {
    return null;
  }
};
