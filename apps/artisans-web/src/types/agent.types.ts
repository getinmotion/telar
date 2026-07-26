/**
 * Agent Types
 * Types for the agent onboarding service
 */

export interface OnboardingMetadata {
  artisan_id: string;
  processed_at: string;
  form_version: string;
}

export interface OnboardingStatus {
  code: string;
  onboarding_complete: boolean;
}

export interface OnboardingMessage {
  title: string;
  body: string;
}

export interface NextPriorityAction {
  based_on_q16: string;
  recommendations: string[];
}

export interface OnboardingResponseData {
  metadata: OnboardingMetadata;
  status: OnboardingStatus;
  maturity_level: 'emergente' | 'en_desarrollo' | 'consolidado';
  message: OnboardingMessage;
  next_priority_action: NextPriorityAction;
}

export interface OnboardingResponse {
  onboarding_response: OnboardingResponseData;
}

/**
 * Error response from API
 */
export interface AgentErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}

/**
 * Step 1 Initial Capture Types
 */
export interface MediaDto {
  mediaUrl: string;
  mediaType: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ArtisanalIdentityDto {
  primaryCraftId: string;
  isCollaboration: boolean;
}

export interface Step1InitialCaptureRequest {
  storeId: string;
  name: string;
  shortDescription: string;
  history: string;
  status: string;
  media: MediaDto[];
  artisanalIdentity: ArtisanalIdentityDto;
}

/**
 * Field source tracking for AI suggestions
 */
export type FieldSource = 'ia_accepted' | 'manual' | 'ia_modified';

export interface FieldMetadata {
  source: FieldSource;
  originalAiValue?: string;
  timestamp?: string;
}

export interface IdentityFieldMetadata {
  value: string;
  label: string;
  source: FieldSource;
}

export interface MaterialFieldMetadata {
  value: string;
  label: string;
  source: FieldSource;
}

/**
 * AI Content Improvements
 */
export interface ContentImprovement {
  value: string;
  source: 'ia_generated';
  changes_summary: string;
}

export interface PhotoQuality {
  quality: 'excelente' | 'buena' | 'necesita_mejora' | 'excellent' | 'good' | 'needs_improvement';
  highlights: string[];
  suggestions: string[];
}

export interface PhotoFeedback {
  main_photo?: PhotoQuality;
}

export interface ContentImprovements {
  improved_description?: ContentImprovement;
  improved_history?: ContentImprovement;
  photo_feedback?: PhotoFeedback;
}

/**
 * Oraculo Message
 */
export interface OraculoMessage {
  title: string;
  body: string;
  next_step_hint?: string;
}

/**
 * Step 1 Initial Capture Response
 */
export interface Step1InitialCaptureResponse {
  product_draft_id?: string;
  step?: string;
  status?: {
    code: string;
    agent_used?: string;
  };
  content_improvements?: ContentImprovements;
  identity_suggestions?: {
    category?: {
      value: string;
      label: string;
      confidence: number;
      reasoning: string;
    };
    oficio?: {
      value: string;
      label: string;
      confidence: number;
      reasoning: string;
    };
    materials?: Array<{
      value: string;
      label: string;
      confidence: number;
    }>;
  };
  variant_suggestions?: VariantSuggestions;
  oraculo?: OraculoMessage;
}

/**
 * Sugerencia de variantes detectadas por el oráculo en el paso 1
 * (ejes válidos: talla | color | material)
 */
export interface VariantSuggestions {
  has_variants: boolean;
  reasoning?: string;
  axes: Array<{
    axis: 'talla' | 'color' | 'material';
    values: string[];
    confidence: number;
  }>;
}

/**
 * Step 1 Confirm Types
 */
export interface Step1ConfirmRequest {
  userId: string;
  productDraftId: string;
  shortDescription: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  artisanalHistory: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  category: IdentityFieldMetadata;
  oficio: IdentityFieldMetadata;
  materials: MaterialFieldMetadata[];
}

export interface Step1ConfirmResponse {
  product_draft_id: string;
  step: string;
  status: {
    code: string;
    saved: boolean;
  };
  oraculo: OraculoMessage;
}

/**
 * Step 2 Capture Types (Process Registration)
 */
export interface Step2CaptureRequest {
  userId: string;
  productId: string;
  processDescription: string;
  processEvidenceUrls: string[];
}

export interface Step2CaptureResponse {
  product_draft_id: string;
  step: string;
  status: {
    code: string;
    agents_used: string[];
  };
  process_analysis: {
    production_method?: {
      value: string;
      label: string;
      source: string;
    };
    elaboration_time: {
      value: string;
      unit?: string;
      numeric_estimate?: number;
      source: string;
    };
    monthly_capacity?: {
      value: string;
      label: string;
      source: string;
    };
    structured_process: {
      format?: string;
      content: string;
      phases: string[];
      tools?: string[];
      care_instructions?: string;
      usage_suggestions?: string;
    };
  };
  pricing_suggestions: {
    suggested_price: {
      value: number;
      currency?: string;
      range?: {
        min: number;
        max: number;
      };
      reasoning?: string;
      source?: string;
    };
    packaging?: {
      value: string;
      label: string;
      reasoning?: string;
      source: string;
    };
    estimated_weight?: {
      value: number;
      unit: string;
      includes_packaging?: boolean;
      source: string;
    };
    dimensions_guidance?: {
      format: string;
      content: string;
    };
  };
  oraculo: OraculoMessage;
}

/**
 * Step 2 Confirm Types (Pricing & Logistics Confirmation)
 */
export interface Step2ConfirmRequest {
  userId: string;
  productId: string;
  artisanalHistory: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  shortDescription: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  careNotes: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  elaborationTime: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  monthlyCapacity: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  processDescription: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  price: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  weightKg: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
  /** Aceptación/rechazo de las variantes sugeridas por el oráculo */
  variants?: {
    source: FieldSource;
    originalAiValue: string;
    timestamp: string;
  };
}

export interface Step2ConfirmResponse {
  product_draft_id: string;
  step: string;
  status: {
    code: string;
    saved: boolean;
  };
  oraculo: OraculoMessage;
}
