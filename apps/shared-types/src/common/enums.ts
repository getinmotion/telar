/**
 * Common Enums - Enumeraciones compartidas
 */

// Currency
export enum Currency {
  COP = 'COP',
  USD = 'USD',
}

// Status genéricos
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Moderation status
export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
}
