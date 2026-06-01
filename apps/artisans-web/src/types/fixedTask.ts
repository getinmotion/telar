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
  | 'create_artisan_profile'
  | 'review_brand';

export type FixedTaskMilestone = 'brand' | 'shop' | 'sales';

export interface FixedTaskRequirements {
  mustComplete?: FixedTaskId[];
  mustHave?: {
    shop?: boolean;
    brand?: boolean;
    products?: { min: number };
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
  hasArtisanProfile?: boolean;
  completedTaskIds: FixedTaskId[];
}
