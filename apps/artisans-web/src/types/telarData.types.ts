// ─── Telar Data — Connected Architecture ───────────────────────────────────
// Single source of truth for all 16 onboarding fields.
// Every field carries provenance: where it was last set and when.

export type FieldSource = 'onboarding' | 'profile' | 'product' | 'manual';

export interface TelarField<T> {
  value: T | null;
  source: FieldSource;
  lastUpdated: string; // ISO 8601
}

// ─── Enum literals ──────────────────────────────────────────────────────────

export type YearsExperience = '0-2' | '2-4' | '4+';

export type ProductCategory =
  | 'textiles'
  | 'jewelry'
  | 'home_decor'
  | 'furniture'
  | 'tableware'
  | 'art'
  | 'toys'
  | 'bags'
  | 'personal_care';

export type Differentiator =
  | 'technique'
  | 'design'
  | 'materials'
  | 'culture'
  | 'price'
  | 'unclear';

export type LearningOrigin =
  | 'family'
  | 'masters'
  | 'academic'
  | 'autodidact'
  | 'mixed';

export type PriceRange = '<20k' | '20-80k' | '80-200k' | '>200k' | 'undefined';

export type PricingMethod = 'copy_others' | 'gut_feeling' | 'unclear' | 'other';

export type TargetCustomer =
  | 'tourists'
  | 'handmade_lovers'
  | 'gift_buyers'
  | 'designers'
  | 'unclear';

export type DigitalPresence = 'none' | 'inactive' | 'occasional' | 'active';

export type SalesChannel =
  | 'none'
  | 'social'
  | 'whatsapp'
  | 'fairs'
  | 'own_store'
  | 'marketplace';

export type SalesFrequency = 'none' | 'occasional' | 'irregular' | 'constant';

export type MonthlyCapacity = '<10' | '10-30' | '30-100' | '>100' | 'unknown';

export type MainLimitation =
  | 'time'
  | 'money'
  | 'materials'
  | 'sales'
  | 'knowledge'
  | 'unclear';

export type WorkStructure = 'solo' | 'family' | 'small_team' | 'collective';

export type PrimaryGoal =
  | 'better_showcase'
  | 'pricing'
  | 'more_sales'
  | 'organization'
  | 'lost';

// ─── The 16 fields with provenance ─────────────────────────────────────────

export interface TelarData {
  // Block 1 — Artisan knowledge
  name: TelarField<string>;
  years_experience: TelarField<YearsExperience>;
  story: TelarField<string>;
  meaning: TelarField<string>;
  product_category: TelarField<ProductCategory[]>;
  differentiator: TelarField<Differentiator>;
  learning_origin: TelarField<LearningOrigin>;

  // Block 2 — Commercial reality
  price_range: TelarField<PriceRange>;
  knows_costs: TelarField<boolean>;
  pricing_method: TelarField<PricingMethod>;
  feels_profitable: TelarField<boolean>;

  // Block 3 — Clients & market
  target_customer: TelarField<TargetCustomer>;
  digital_presence: TelarField<DigitalPresence>;
  current_channels: TelarField<SalesChannel[]>;
  sales_frequency: TelarField<SalesFrequency>;

  // Block 4 — Operations
  monthly_capacity: TelarField<MonthlyCapacity>;
  main_limitation: TelarField<MainLimitation>;
  work_structure: TelarField<WorkStructure>;
  primary_goal: TelarField<PrimaryGoal>;
}

export type TelarDataKey = keyof TelarData;

// ─── Onboarding answers (raw input from the form) ──────────────────────────

export interface OnboardingAnswers {
  // Block 1
  name?: string;
  years_experience?: YearsExperience;
  story?: string;
  meaning?: string;
  product_category?: ProductCategory[];
  differentiator?: Differentiator;
  learning_origin?: LearningOrigin;
  // Block 2
  price_range?: PriceRange;
  knows_costs?: boolean;
  pricing_method?: PricingMethod;
  feels_profitable?: boolean;
  // Block 3
  target_customer?: TargetCustomer;
  digital_presence?: DigitalPresence;
  current_channels?: SalesChannel[];
  sales_frequency?: SalesFrequency;
  // Block 4
  monthly_capacity?: MonthlyCapacity;
  main_limitation?: MainLimitation;
  work_structure?: WorkStructure;
  primary_goal?: PrimaryGoal;
}

// ─── API response shape ─────────────────────────────────────────────────────

export interface OnboardingFieldResponse<T> {
  value: T | null;
  source: FieldSource | null;
  lastUpdated: string | null;
}

export interface OnboardingApiResponse {
  name: OnboardingFieldResponse<string>;
  years_experience: OnboardingFieldResponse<YearsExperience>;
  story: OnboardingFieldResponse<string>;
  meaning: OnboardingFieldResponse<string>;
  product_category: OnboardingFieldResponse<ProductCategory[]>;
  differentiator: OnboardingFieldResponse<Differentiator>;
  learning_origin: OnboardingFieldResponse<LearningOrigin>;
  price_range: OnboardingFieldResponse<PriceRange>;
  knows_costs: OnboardingFieldResponse<boolean>;
  pricing_method: OnboardingFieldResponse<PricingMethod>;
  feels_profitable: OnboardingFieldResponse<boolean>;
  target_customer: OnboardingFieldResponse<TargetCustomer>;
  digital_presence: OnboardingFieldResponse<DigitalPresence>;
  current_channels: OnboardingFieldResponse<SalesChannel[]>;
  sales_frequency: OnboardingFieldResponse<SalesFrequency>;
  monthly_capacity: OnboardingFieldResponse<MonthlyCapacity>;
  main_limitation: OnboardingFieldResponse<MainLimitation>;
  work_structure: OnboardingFieldResponse<WorkStructure>;
  primary_goal: OnboardingFieldResponse<PrimaryGoal>;
}

// ─── Onboarding completion status ──────────────────────────────────────────

export const ONBOARDING_FIELDS: TelarDataKey[] = [
  'name', 'years_experience', 'story', 'meaning', 'product_category',
  'differentiator', 'learning_origin', 'price_range', 'knows_costs',
  'pricing_method', 'feels_profitable', 'target_customer', 'digital_presence',
  'current_channels', 'sales_frequency', 'monthly_capacity', 'main_limitation',
  'work_structure', 'primary_goal',
];
