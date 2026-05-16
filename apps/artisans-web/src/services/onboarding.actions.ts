import { telarApi } from '@/integrations/api/telarApi';
import { OnboardingAnswers, OnboardingApiResponse } from '@/types/telarData.types';

const BASE = 'artisan-onboarding';

/**
 * Fetch all 16 onboarding fields for a user.
 * Returns each field with value + source + lastUpdated.
 */
export async function getOnboardingAnswers(userId: string): Promise<OnboardingApiResponse> {
  const { data } = await telarApi.get<OnboardingApiResponse>(`/${BASE}/${userId}`);
  return data;
}

/**
 * Persist onboarding answers.
 * The API distributes fields to the correct DB entities automatically.
 */
export async function upsertOnboardingAnswers(
  userId: string,
  answers: OnboardingAnswers & { source?: 'onboarding' | 'profile' | 'product' | 'manual' },
): Promise<OnboardingApiResponse> {
  const { data } = await telarApi.patch<OnboardingApiResponse>(`/${BASE}/${userId}`, answers);
  return data;
}
