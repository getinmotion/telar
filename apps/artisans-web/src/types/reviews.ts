export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  helpful_count: number;
  images?: any;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: number;
  };
}

export interface TrustBadge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  badge_type: 'security' | 'shipping' | 'quality' | 'guarantee';
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}