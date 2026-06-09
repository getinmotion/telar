/**
 * Artisans Knowledge Types
 * Types for the 4-step artisan knowledge wizard
 * Based on the artisans-knowledge resource in the NestJS backend
 */

// ─── Step 1: Identity ────────────────────────────────────────────────────────

export interface ArtisansIdentityOne {
  id: string;
  nameShop: string;
  artisanHistory: string;
  ageExperience: number;
  shopHistory: string;
  shopDescription: string;
  shopDefinition: string;
  shopCategoriesId: string;
  shopSpecialDefinitionOne: string;
  shopSpecialDefinitionTwo?: string | null;
  shopSpecialDefinitionThree?: string | null;
  shopBornSpecialDefinitionOne: string;
  shopBornSpecialDefinitionTwo?: string | null;
  shopBornSpecialDefinitionThree?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateArtisansIdentityOneDto {
  nameShop: string;
  artisanHistory: string;
  ageExperience: number;
  shopHistory: string;
  shopDescription: string;
  shopDefinition: string;
  shopCategoriesId: string;
  shopSpecialDefinitionOne: string;
  shopSpecialDefinitionTwo?: string | null;
  shopSpecialDefinitionThree?: string | null;
  shopBornSpecialDefinitionOne: string;
  shopBornSpecialDefinitionTwo?: string | null;
  shopBornSpecialDefinitionThree?: string | null;
  createdBy: string;
}

// ─── Step 2: Commercial ──────────────────────────────────────────────────────

export interface ArtisansCommercialTwo {
  id: string;
  shopRangePayment: string;
  shopKnowledgeCost: string;
  shopKnowledgeDefineCost: string;
  shopKnowledgeIsProfitable: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateArtisansCommercialTwoDto {
  shopRangePayment: string;
  shopKnowledgeCost: string;
  shopKnowledgeDefineCost: string;
  shopKnowledgeIsProfitable: string;
  createdBy: string;
}

// ─── Step 3: Client/Market ───────────────────────────────────────────────────

export interface ArtisansClientMarketThree {
  id: string;
  shopKnowledgeMainBuyerOne: string;
  shopKnowledgeMainBuyerTwo?: string | null;
  shopKnowledgeMainBuyerThree?: string | null;
  shopKnowledgeDigitalPresence: string;
  shopKnowledgeWhereSaleOne: string;
  shopKnowledgeWhereSaleTwo?: string | null;
  shopKnowledgeWhereSaleThree?: string | null;
  shopKnowledgeSalesActivity: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateArtisansClientMarketThreeDto {
  shopKnowledgeMainBuyerOne: string;
  shopKnowledgeMainBuyerTwo?: string | null;
  shopKnowledgeMainBuyerThree?: string | null;
  shopKnowledgeDigitalPresence: string;
  shopKnowledgeWhereSaleOne: string;
  shopKnowledgeWhereSaleTwo?: string | null;
  shopKnowledgeWhereSaleThree?: string | null;
  shopKnowledgeSalesActivity: string;
  createdBy: string;
}

// ─── Step 4: Operation/Growth ────────────────────────────────────────────────

export interface ArtisansOperationGrowthFour {
  id: string;
  shopKnowledgeProductsMakeMonth: string;
  shopKnowledgeLimitTodayOne: string;
  shopKnowledgeLimitTodayTwo?: string | null;
  shopKnowledgeLimitTodayThree?: string | null;
  shopManyWorkers: string;
  shopFirstSolvingTelar: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateArtisansOperationGrowthFourDto {
  shopKnowledgeProductsMakeMonth: string;
  shopKnowledgeLimitTodayOne: string;
  shopKnowledgeLimitTodayTwo?: string | null;
  shopKnowledgeLimitTodayThree?: string | null;
  shopManyWorkers: string;
  shopFirstSolvingTelar: string;
  createdBy: string;
}

// ─── Profile Hub ─────────────────────────────────────────────────────────────

/**
 * Central profile that links all 4 steps
 * Each step ID is nullable, allowing partial/draft completion
 */
export interface ArtisansIdentityProfile {
  id: string;
  userId: string;
  artisansIdentityId?: string | null;
  artisansCommercialId?: string | null;
  artisansClientMarketId?: string | null;
  artisansOperationGrowthId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  // Relations (eagerly loaded)
  identityOne?: ArtisansIdentityOne | null;
  commercialTwo?: ArtisansCommercialTwo | null;
  clientMarketThree?: ArtisansClientMarketThree | null;
  operationGrowthFour?: ArtisansOperationGrowthFour | null;
  // Set to true when data was pre-filled from Identidad Artesanal (not yet saved in knowledge tables)
  prefilled?: boolean;
}

// ─── Shop Category ───────────────────────────────────────────────────────────

export interface ShopCategory {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Helper Types ────────────────────────────────────────────────────────────

/**
 * Helper to check if profile is complete (all 4 steps submitted)
 */
export interface ProfileCompletionStatus {
  isComplete: boolean;
  completedSteps: number;
  missingSteps: number[];
  step1Complete: boolean;
  step2Complete: boolean;
  step3Complete: boolean;
  step4Complete: boolean;
}

/**
 * Error response from API
 */
export interface ArtisansKnowledgeErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}
