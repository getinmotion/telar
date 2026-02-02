/**
 * @deprecated Use '@/hooks/user/useUnifiedUserData' instead
 * This hook is deprecated and maintained only for backward compatibility.
 * It now proxies to useUnifiedUserData for better performance and consistency.
 * 
 * Migration guide:
 * ```typescript
 * // OLD:
 * const { profile, projects, agents, loading } = useOptimizedUserData();
 * 
 * // NEW:
 * const { profile, loading } = useUnifiedUserData();
 * // Note: projects and agents should be fetched separately if needed
 * ```
 */

import { useUnifiedUserData } from './user/useUnifiedUserData';

export const useOptimizedUserData = () => {
  console.warn('⚠️ useOptimizedUserData is deprecated. Use useUnifiedUserData instead.');
  
  const { profile, loading, error } = useUnifiedUserData();
  
  // Map to old interface for backward compatibility
  return {
    profile: profile ? {
      id: profile.userId,
      user_id: profile.userId,
      full_name: profile.fullName || null,
      avatar_url: profile.avatarUrl || null,
      created_at: profile.createdAt || new Date().toISOString(),
      updated_at: profile.updatedAt || new Date().toISOString()
    } : null,
    projects: [], // No longer fetching projects automatically
    agents: [], // No longer fetching agents automatically
    loading,
    error,
    hasOnboarding: false // Deprecated
  };
};
