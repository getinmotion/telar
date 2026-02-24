/**
 * Utility to clear user data cache from localStorage
 * Use this when you need to force a refresh of user data after database changes
 */

export const clearUserDataCache = (userId?: string) => {
  try {
    // Clear unified user data cache
    if (userId) {
      const cacheKey = `unified_user_data_${userId}`;
      const timestampKey = `unified_user_data_timestamp_${userId}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      console.log('✅ Cleared user data cache for user:', userId);
    } else {
      // Clear all unified user data caches if no userId specified
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('unified_user_data_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('✅ Cleared all user data caches');
    }
    
    // Also clear deprecated cache keys
    localStorage.removeItem('optimized_user_data');
    localStorage.removeItem('last_user_data_sync');
  } catch (error) {
    console.error('❌ Error clearing user data cache:', error);
  }
};

// Auto-clear cache when this module is imported (run once on app load)
const AUTO_CLEAR_VERSION = '1.0.0';
const LAST_CLEAR_KEY = 'last_cache_clear_version';

const lastClearVersion = localStorage.getItem(LAST_CLEAR_KEY);
if (lastClearVersion !== AUTO_CLEAR_VERSION) {
  console.log('🔄 Detected cache version mismatch, clearing all user caches...');
  clearUserDataCache();
  localStorage.setItem(LAST_CLEAR_KEY, AUTO_CLEAR_VERSION);
}
