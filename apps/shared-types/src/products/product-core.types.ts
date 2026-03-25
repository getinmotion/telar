/**
 * Product Core Types - Nueva arquitectura multicapa
 * Tipos para shop.products_core (tabla núcleo)
 */

export interface ProductCore {
  id: string;
  storeId: string;
  categoryId: string | null;
  legacyProductId?: string; // Link a shop.products (legacy)
  name: string;
  shortDescription: string;
  history: string | null;
  careNotes: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_MODERATION = 'pending_moderation',
  CHANGES_REQUESTED = 'changes_requested',
  APPROVED = 'approved',
  APPROVED_WITH_EDITS = 'approved_with_edits',
  REJECTED = 'rejected',
}
