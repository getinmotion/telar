export interface ShopData {
  shop_name: string;
  description: string;
  story: string;
  craft_type: CraftType;
  region: string;
  shop_slug: string;
  contact_info?: ContactInfo;
  social_links?: SocialLinks;
}

export type CraftType =
  | 'textiles'
  | 'ceramics'
  | 'jewelry'
  | 'leather'
  | 'woodwork'
  | 'metalwork'
  | 'glasswork'
  | 'painting'
  | 'sculpture'
  | 'other';

export interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface ProductSuggestion {
  name: string;
  description: string;
  suggested_price: number;
  category: string;
  tags: string[];
}

export interface ConversationState {
  currentQuestion: 'business_name' | 'business_products' | 'business_location';
  conversationHistory: ConversationMessage[];
  shopData: Partial<ShopData>;
}

export interface ConversationMessage {
  question: string;
  answer: string;
  timestamp: Date;
}

export interface UserContext {
  hasExistingData: boolean;
  detectedCraft: string;
  maturityLevel: number;
}

export interface PreConfigurateResponse {
  shopData: Partial<ShopData>;
  coordinatorMessage: string;
  userContext: UserContext;
}

export interface AnalyzeProfileResponse {
  needsMoreInfo: boolean;
  coordinatorMessage: string;
  nextQuestion?: 'business_name' | 'business_products' | 'business_location';
  missingInfo: string[];
  shopData: Partial<ShopData>;
  userContext: UserContext;
}

export interface ProcessConversationResponse {
  message: string;
  nextQuestion?: string;
  updatedShopData: Partial<ShopData>;
  readyToCreate: boolean;
  finalShopData?: ShopData;
}

export interface ProductSuggestionsResponse {
  productSuggestions: {
    products: ProductSuggestion[];
  };
  shopContext: {
    craftType: string;
    region: string;
    description: string;
  };
}
