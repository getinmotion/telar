/**
 * Fixed Task System Types
 * Defines the structure for fixed, progressive tasks
 */

export type FixedTaskId = 
  | 'create_shop'
  | 'create_brand'
  | 'first_product'
  | 'five_products'
  | 'ten_products'
  | 'customize_shop'
  | 'create_story'
  | 'create_artisan_profile'
  | 'add_contact'
  | 'complete_rut'
  | 'review_brand'
  | 'add_social_links'
  | 'complete_bank_data'
  | 'maturity_block_1'
  | 'maturity_block_2'
  | 'maturity_block_3'
  | 'maturity_block_4'
  | 'maturity_block_5'
  | 'maturity_block_6';

export type FixedTaskMilestone = 'formalization' | 'brand' | 'shop' | 'sales' | 'community';

export interface FixedTaskRequirements {
  mustComplete?: FixedTaskId[];
  mustHave?: {
    shop?: boolean;
    brand?: boolean;
    products?: { min: number };
    rut?: boolean;
    maturityBlock?: number;
  };
}

export interface FixedTaskAction {
  type: 'wizard' | 'route' | 'modal';
  destination: string;
}

export interface FixedTaskStep {
  id: string;
  title: string;
  description: string;
}

export interface FixedTask {
  id: FixedTaskId;
  title: string;
  description: string;
  action: FixedTaskAction;
  requirements?: FixedTaskRequirements;
  milestone: FixedTaskMilestone;
  priority: number;
  icon: string;
  steps?: FixedTaskStep[];
  deliverable?: string;
  estimatedMinutes?: number;
}

export interface UserTaskState {
  hasShop: boolean;
  hasBrand: boolean;
  productCount: number;
  hasRUT: boolean;
  hasHeroSlider?: boolean;
  hasStory?: boolean;
  hasArtisanProfile?: boolean;
  hasSocialLinks?: boolean;
  hasContactInfo?: boolean;
  hasBankData?: boolean;
  completedMaturityBlocks: number[];
  completedTaskIds: FixedTaskId[];
}
