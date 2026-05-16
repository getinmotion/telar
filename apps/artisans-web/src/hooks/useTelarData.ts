import { useEffect, useRef } from 'react';
import { useTelarDataStore } from '@/stores/telarDataStore';
import { getOnboardingAnswers } from '@/services/onboarding.actions';
import { useAuthStore } from '@/stores/authStore';

/**
 * Public hook for the connected data layer.
 * On first mount (when not yet hydrated), fetches the 16 answers from the API
 * and populates the store. Returns the full store.
 */
export function useTelarData() {
  const store = useTelarDataStore();
  const userId = useAuthStore((s) => s.user?.id);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!userId || store.hydrated || fetchedRef.current) return;
    fetchedRef.current = true;

    getOnboardingAnswers(userId)
      .then((response) => {
        store.hydrateFromDB(response);
      })
      .catch(() => {
        // No answers yet — mark hydrated so we don't keep retrying this session
        useTelarDataStore.setState({ hydrated: true });
      });
  }, [userId, store.hydrated]);

  return store;
}

// Re-export store accessor for non-component use
export { useTelarDataStore };
