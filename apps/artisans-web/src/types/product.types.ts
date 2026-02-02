/**
 * Product Types
 * Tipos para productos
 */

// ============= Nested Types =============

export interface ProductShop {
  id: string;
  userId: string;
  shopName: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

// ============= Main Types =============

export interface Product {
  id: string;
  shopId: string;
  name: string;
  price: number;
  active: boolean;
  shop?: ProductShop;
  category?: ProductCategory;
  description?: string;
  images?: string[];
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============= Response Types =============

export interface GetProductsByUserIdResponse {
  success: true;
  data: Product[];
}

// ============= Error Types =============

export interface ProductErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// ============= Union Types =============

export type ProductResponse = GetProductsByUserIdResponse | ProductErrorResponse;
