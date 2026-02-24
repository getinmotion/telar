export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
  // For hierarchical display
  children?: ProductCategory[];
  parent?: ProductCategory;
  level?: number;
}

export interface CategoryFilters {
  categoryId?: string;
  subcategoryId?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  inStock?: boolean;
}