import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  TelarData,
  TelarDataKey,
  TelarField,
  FieldSource,
  OnboardingAnswers,
  OnboardingApiResponse,
  ONBOARDING_FIELDS,
} from '@/types/telarData.types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeField<T>(
  value: T | null,
  source: FieldSource = 'onboarding',
): TelarField<T> {
  return { value, source, lastUpdated: new Date().toISOString() };
}

function emptyField<T>(): TelarField<T> {
  return { value: null, source: 'onboarding', lastUpdated: '' };
}

// ─── Initial state ───────────────────────────────────────────────────────────

const EMPTY_STATE: TelarData = {
  name:             emptyField(),
  years_experience: emptyField(),
  story:            emptyField(),
  meaning:          emptyField(),
  product_category: emptyField(),
  differentiator:   emptyField(),
  learning_origin:  emptyField(),
  price_range:      emptyField(),
  knows_costs:      emptyField(),
  pricing_method:   emptyField(),
  feels_profitable: emptyField(),
  target_customer:  emptyField(),
  digital_presence: emptyField(),
  current_channels: emptyField(),
  sales_frequency:  emptyField(),
  monthly_capacity: emptyField(),
  main_limitation:  emptyField(),
  work_structure:   emptyField(),
  primary_goal:     emptyField(),
};

// ─── Store interface ─────────────────────────────────────────────────────────

interface TelarDataStoreState extends TelarData {
  hydrated: boolean;

  setField<K extends TelarDataKey>(
    key: K,
    value: TelarData[K]['value'],
    source: FieldSource,
  ): void;

  setFromOnboarding(answers: OnboardingAnswers): void;

  hydrateFromDB(apiResponse: OnboardingApiResponse): void;

  resetField(key: TelarDataKey): void;

  getCompletedCount(): number;

  isOnboardingComplete(): boolean;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useTelarDataStore = create<TelarDataStoreState>()(
  persist(
    (set, get) => ({
      ...EMPTY_STATE,
      hydrated: false,

      setField(key, value, source) {
        const existing = get()[key] as TelarField<unknown>;
        const now = new Date().toISOString();
        // Last valid edit wins; if incoming is same source/time, still update
        if (existing.lastUpdated && existing.lastUpdated > now) return;

        set({ [key]: { value, source, lastUpdated: now } } as Partial<TelarDataStoreState>);
      },

      setFromOnboarding(answers: OnboardingAnswers) {
        const now = new Date().toISOString();
        const updates: Partial<TelarData> = {};

        for (const key of ONBOARDING_FIELDS) {
          const raw = (answers as Record<string, unknown>)[key];
          if (raw !== undefined && raw !== null) {
            updates[key] = {
              value: raw,
              source: 'onboarding' as FieldSource,
              lastUpdated: now,
            } as TelarField<unknown>;
          }
        }

        set(updates as Partial<TelarDataStoreState>);
      },

      hydrateFromDB(apiResponse: OnboardingApiResponse) {
        const updates: Partial<TelarData> = {};

        for (const key of ONBOARDING_FIELDS) {
          const field = apiResponse[key as keyof OnboardingApiResponse];
          if (field && field.value !== null && field.value !== undefined) {
            updates[key as TelarDataKey] = {
              value: field.value,
              source: (field.source ?? 'onboarding') as FieldSource,
              lastUpdated: field.lastUpdated ?? new Date().toISOString(),
            } as TelarField<unknown>;
          }
        }

        set({ ...updates, hydrated: true } as Partial<TelarDataStoreState>);
      },

      resetField(key: TelarDataKey) {
        set({ [key]: emptyField() } as Partial<TelarDataStoreState>);
      },

      getCompletedCount() {
        return ONBOARDING_FIELDS.filter(
          (k) => (get()[k] as TelarField<unknown>).value !== null,
        ).length;
      },

      isOnboardingComplete() {
        return get().getCompletedCount() === ONBOARDING_FIELDS.length;
      },
    }),
    {
      name: 'telar-data-store',
      partialize: (state) => {
        const partial: Partial<TelarData & { hydrated: boolean }> = { hydrated: state.hydrated };
        for (const key of ONBOARDING_FIELDS) {
          (partial as Record<string, unknown>)[key] = state[key as TelarDataKey];
        }
        return partial;
      },
    },
  ),
);
