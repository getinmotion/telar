/**
 * Utility functions for user-namespaced localStorage
 * These are pure functions that don't use React hooks
 * Use these when you need localStorage access outside of React components
 */

interface UserLocalStorageInterface {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

/**
 * Creates a user-namespaced localStorage interface for use in utility functions
 * @param userId - The user ID to namespace the localStorage keys
 */
export const createUserLocalStorage = (userId: string): UserLocalStorageInterface => {
  const getUserKey = (key: string): string => {
    if (!userId) {
      console.warn(`[UserLocalStorage] No user ID available for key: ${key}`);
      return key;
    }
    return `user_${userId}_${key}`;
  };

  return {
    getItem: (key: string): string | null => {
      const namespacedKey = getUserKey(key);
      return localStorage.getItem(namespacedKey);
    },

    setItem: (key: string, value: string): void => {
      const namespacedKey = getUserKey(key);
      localStorage.setItem(namespacedKey, value);
    },

    removeItem: (key: string): void => {
      const namespacedKey = getUserKey(key);
      localStorage.removeItem(namespacedKey);
    },

    clear: (): void => {
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
    }
  };
};
