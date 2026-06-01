// ─── Onboarding Business Context ───────────────────────────────────────────
// Typed schema for the onboarding slice of user_master_context.business_context.
// ONLY keys defined here may be written by the artisan-onboarding module.

export type OnboardingSource = 'onboarding' | 'profile' | 'product' | 'manual';

export interface OnboardingFieldMeta {
  source: OnboardingSource;
  lastUpdated: string; // ISO 8601
}

// 13 commercial/operational fields stored in business_context
export interface OnboardingBusinessContext {
  years_experience?: '0-2' | '2-4' | '4+';
  product_category?: string[];
  price_range?: '<20k' | '20-80k' | '80-200k' | '>200k' | 'undefined';
  knows_costs?: boolean;
  pricing_method?: 'copy_others' | 'gut_feeling' | 'unclear' | 'other';
  feels_profitable?: boolean;
  target_customer?: 'tourists' | 'handmade_lovers' | 'gift_buyers' | 'designers' | 'unclear';
  digital_presence?: 'none' | 'inactive' | 'occasional' | 'active';
  current_channels?: string[];
  sales_frequency?: 'none' | 'occasional' | 'irregular' | 'constant';
  monthly_capacity?: '<10' | '10-30' | '30-100' | '>100' | 'unknown';
  main_limitation?: 'time' | 'money' | 'materials' | 'sales' | 'knowledge' | 'unclear';
  work_structure?: 'solo' | 'family' | 'small_team' | 'collective';
  // Provenance metadata for all 19 fields (including those in other tables)
  _meta?: Record<string, OnboardingFieldMeta>;
}

// goals_and_objectives slice
export interface OnboardingGoalsContext {
  primary_goal?: 'better_showcase' | 'pricing' | 'more_sales' | 'organization' | 'lost';
}
