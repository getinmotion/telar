/**
 * Artisans Knowledge Service
 * Handles API calls for the 4-step artisan knowledge wizard
 * Endpoint: /artisans-knowledge
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  ArtisansIdentityProfile,
  CreateArtisansIdentityOneDto,
  CreateArtisansCommercialTwoDto,
  CreateArtisansClientMarketThreeDto,
  CreateArtisansOperationGrowthFourDto,
  ProfileCompletionStatus,
  ArtisansKnowledgeErrorResponse,
} from '@/types/artisansKnowledge.types';

// ─── Get Profile ─────────────────────────────────────────────────────────────

/**
 * Get artisan knowledge profile by user ID
 * Returns the profile with all 4 steps eagerly loaded
 * Returns null if profile doesn't exist yet
 *
 * Endpoint: GET /artisans-knowledge/user/:userId
 */
export const getArtisansKnowledgeProfile = async (
  userId: string
): Promise<ArtisansIdentityProfile | null> => {
  try {
    const response = await telarApi.get<ArtisansIdentityProfile>(
      `/artisans-knowledge/user/${userId}`
    );
    return response.data;
  } catch (error: any) {
    // 404 means no profile exists yet (valid for new users)
    if (error.response?.status === 404) {
      return null;
    }

    if (error.response?.data) {
      throw error.response.data as ArtisansKnowledgeErrorResponse;
    }
    throw error;
  }
};

// ─── Step 1: Identity ────────────────────────────────────────────────────────

/**
 * Submit Step 1: Identity information
 * Creates or updates the identity step
 *
 * Endpoint: POST /artisans-knowledge/step-1/:userId
 */
export const submitStep1Identity = async (
  userId: string,
  data: Omit<CreateArtisansIdentityOneDto, 'createdBy'>
): Promise<ArtisansIdentityProfile> => {
  try {
    const response = await telarApi.post<ArtisansIdentityProfile>(
      `/artisans-knowledge/step-1/${userId}`,
      {
        ...data,
        createdBy: userId,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ArtisansKnowledgeErrorResponse;
    }
    throw error;
  }
};

// ─── Step 2: Commercial ──────────────────────────────────────────────────────

/**
 * Submit Step 2: Commercial information
 * Creates or updates the commercial step
 *
 * Endpoint: POST /artisans-knowledge/step-2/:userId
 */
export const submitStep2Commercial = async (
  userId: string,
  data: Omit<CreateArtisansCommercialTwoDto, 'createdBy'>
): Promise<ArtisansIdentityProfile> => {
  try {
    const response = await telarApi.post<ArtisansIdentityProfile>(
      `/artisans-knowledge/step-2/${userId}`,
      {
        ...data,
        createdBy: userId,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ArtisansKnowledgeErrorResponse;
    }
    throw error;
  }
};

// ─── Step 3: Client/Market ───────────────────────────────────────────────────

/**
 * Submit Step 3: Client and market information
 * Creates or updates the client/market step
 *
 * Endpoint: POST /artisans-knowledge/step-3/:userId
 */
export const submitStep3ClientMarket = async (
  userId: string,
  data: Omit<CreateArtisansClientMarketThreeDto, 'createdBy'>
): Promise<ArtisansIdentityProfile> => {
  try {
    const response = await telarApi.post<ArtisansIdentityProfile>(
      `/artisans-knowledge/step-3/${userId}`,
      {
        ...data,
        createdBy: userId,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ArtisansKnowledgeErrorResponse;
    }
    throw error;
  }
};

// ─── Step 4: Operation/Growth ────────────────────────────────────────────────

/**
 * Submit Step 4: Operation and growth information
 * Creates or updates the operation/growth step
 *
 * Endpoint: POST /artisans-knowledge/step-4/:userId
 */
export const submitStep4OperationGrowth = async (
  userId: string,
  data: Omit<CreateArtisansOperationGrowthFourDto, 'createdBy'>
): Promise<ArtisansIdentityProfile> => {
  try {
    const response = await telarApi.post<ArtisansIdentityProfile>(
      `/artisans-knowledge/step-4/${userId}`,
      {
        ...data,
        createdBy: userId,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ArtisansKnowledgeErrorResponse;
    }
    throw error;
  }
};

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Check profile completion status
 * Returns detailed information about which steps are complete
 */
export const checkProfileCompletion = (
  profile: ArtisansIdentityProfile | null
): ProfileCompletionStatus => {
  if (!profile) {
    return {
      isComplete: false,
      completedSteps: 0,
      missingSteps: [1, 2, 3, 4],
      step1Complete: false,
      step2Complete: false,
      step3Complete: false,
      step4Complete: false,
    };
  }

  const step1Complete = !!profile.artisansIdentityId;
  const step2Complete = !!profile.artisansCommercialId;
  const step3Complete = !!profile.artisansClientMarketId;
  const step4Complete = !!profile.artisansOperationGrowthId;

  const completedCount = [
    step1Complete,
    step2Complete,
    step3Complete,
    step4Complete,
  ].filter(Boolean).length;

  const missingSteps: number[] = [];
  if (!step1Complete) missingSteps.push(1);
  if (!step2Complete) missingSteps.push(2);
  if (!step3Complete) missingSteps.push(3);
  if (!step4Complete) missingSteps.push(4);

  return {
    isComplete: completedCount === 4,
    completedSteps: completedCount,
    missingSteps,
    step1Complete,
    step2Complete,
    step3Complete,
    step4Complete,
  };
};

/**
 * Check if user can create shop (all 4 steps complete)
 */
export const canCreateShop = async (userId: string): Promise<boolean> => {
  try {
    const profile = await getArtisansKnowledgeProfile(userId);
    const status = checkProfileCompletion(profile);
    return status.isComplete;
  } catch (error) {
    return false;
  }
};
