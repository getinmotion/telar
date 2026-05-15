import { useEffect } from 'react';
import { EventBus } from '@/utils/eventBus';
import { useTelarDataStore } from '@/stores/telarDataStore';
import { useAuthStore } from '@/stores/authStore';
import { upsertOnboardingAnswers } from '@/services/onboarding.actions';

/**
 * Listens to platform events and keeps useTelarData in sync with
 * edits made outside of the onboarding form (profile wizard, product upload).
 *
 * Mount once at the top of the authenticated layout.
 */
export function useTelarSync() {
  const userId = useAuthStore((s) => s.user?.id);
  const { setField } = useTelarDataStore();

  useEffect(() => {
    if (!userId) return;

    const unsubs: Array<() => void> = [];

    // ── Artisan profile wizard saved ────────────────────────────────────────
    unsubs.push(
      EventBus.subscribe('artisan.profile.completed', (data: Record<string, unknown>) => {
        const now = new Date().toISOString();
        if (data.uniqueness !== undefined) {
          setField('differentiator', data.uniqueness as string, 'profile');
        }
        if (data.learnedFrom !== undefined) {
          setField('learning_origin', data.learnedFrom as string, 'profile');
        }
        if (data.mainStory !== undefined) {
          setField('story', data.mainStory as string, 'profile');
        }
        if (data.culturalMeaning !== undefined) {
          setField('meaning', data.culturalMeaning as string, 'profile');
        }
        if (data.fullName !== undefined) {
          setField('name', data.fullName as string, 'profile');
        }
      }),
    );

    // ── Product created / updated ────────────────────────────────────────────
    unsubs.push(
      EventBus.subscribe('product.created', (data: Record<string, unknown>) => {
        if (!Array.isArray(data.categories) || data.categories.length === 0) return;

        const store = useTelarDataStore.getState();
        const existing = store.product_category.value ?? [];
        const merged = Array.from(new Set([...existing, ...(data.categories as string[])]));
        setField('product_category', merged as typeof store.product_category.value, 'product');
      }),
    );

    // ── Profile updated (general) ────────────────────────────────────────────
    unsubs.push(
      EventBus.subscribe('profile.updated', (data: Record<string, unknown>) => {
        if (data.fullName !== undefined) {
          setField('name', data.fullName as string, 'profile');
        }
      }),
    );

    return () => unsubs.forEach((fn) => fn());
  }, [userId, setField]);
}
