/**
 * User-related hooks
 * Centralized exports for all user, profile, and authentication-related hooks
 */

// ✨ NEW: Unified data management (Phase 2) - RECOMMENDED
export { useUnifiedUserData } from './useUnifiedUserData';

// Legacy hooks (still supported, backward compatible)
export { useUserLocalStorage } from './useUserLocalStorage';
export { useUserBusinessContext } from './useUserBusinessContext';
export { useUserProgress } from './useUserProgress';
export { useUserBusinessProfile } from './useUserBusinessProfile';
export { useProfileSync } from './useProfileSync';

export type { 
  BusinessProfile, 
  TaskGenerationContext, 
  UserMasterContext 
} from './useUserBusinessContext';

export type {
  UnifiedUserProfile,
  UnifiedUserContext,
  UnifiedUserData
} from './useUnifiedUserData';
