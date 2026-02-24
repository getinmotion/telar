import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { useCallback, useMemo } from 'react';

/**
 * Hook for user-namespaced localStorage operations
 * Prevents data leakage between different users
 * 
 * OPTIMIZATION: Returns memoized object to prevent re-renders
 * 
 * MULTIPLE SOURCES: Obtiene el userId de:
 * 1. AuthContext (React Context)
 * 2. Zustand store
 * 3. localStorage directo (fallback)
 */
export const useUserLocalStorage = () => {
  const { user } = useAuth();
  const authStore = useAuthStore();
  
  // ✅ FALLBACK: Intentar obtener userId de múltiples fuentes
  const userId = useMemo((): string | null => {
    // 1. AuthContext (preferido)
    if (user?.id) return user.id;
    
    // 2. Zustand store
    if (authStore.user?.id) return authStore.user.id;
    
    // 3. localStorage directo (último recurso)
    try {
      const storedUser = localStorage.getItem('telar_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) return parsed.id;
      }
    } catch (error) {
      console.error('[UserLocalStorage] Error parsing stored user:', error);
    }
    
    return null;
  }, [user?.id, authStore.user?.id]);

  const getUserKey = useCallback((key: string): string => {
    if (!userId) {
      console.warn(`[UserLocalStorage] No user ID available for key: ${key}. Using non-namespaced key as fallback.`);
      return key; // Fallback to non-namespaced key if no user
    }
    return `user_${userId}_${key}`;
  }, [userId]);

  const getItem = useCallback((key: string): string | null => {
    const namespacedKey = getUserKey(key);
    return localStorage.getItem(namespacedKey);
  }, [getUserKey]);

  const setItem = useCallback((key: string, value: string): void => {
    const namespacedKey = getUserKey(key);
    localStorage.setItem(namespacedKey, value);
  }, [getUserKey]);

  const removeItem = useCallback((key: string): void => {
    const namespacedKey = getUserKey(key);
    localStorage.removeItem(namespacedKey);
  }, [getUserKey]);

  const clear = useCallback((): void => {
    if (!userId) return;

    const prefix = `user_${userId}_`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[UserLocalStorage] Cleared ${keysToRemove.length} items for user ${userId}`);
  }, [userId]);

  // ✅ OPTIMIZATION: Return memoized object to prevent infinite loops
  return useMemo(() => ({
    getItem,
    setItem,
    removeItem,
    clear,
    userId
  }), [getItem, setItem, removeItem, clear, userId]);
};
