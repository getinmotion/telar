import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getCurrentUser } from '@/pages/auth/actions/login.actions';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';

interface CachedData<T> {
  data: T | null;
  timestamp: number;
  loading: boolean;
}

interface DataCacheContextType {
  getCurrentUserCached: () => Promise<any>;
  getUserProfileCached: (userId: string) => Promise<any>;
  invalidateCache: (keys?: string[]) => void;
  clearAllCache: () => void;
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(undefined);

// Cache TTL: 5 minutos
const CACHE_TTL = 5 * 60 * 1000;

export const DataCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserCache, setCurrentUserCache] = useState<CachedData<any>>({
    data: null,
    timestamp: 0,
    loading: false,
  });

  const [userProfileCache, setUserProfileCache] = useState<Map<string, CachedData<any>>>(new Map());

  // Refs para evitar llamadas simultáneas
  const currentUserPromiseRef = useRef<Promise<any> | null>(null);
  const userProfilePromisesRef = useRef<Map<string, Promise<any>>>(new Map());

  // ✅ FIX: Usar función estable sin dependencias de estado
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_TTL;
  }, []);

  // ✅ FIX: No incluir estados en las dependencias - usar refs y callbacks
  const getCurrentUserCached = useCallback(async () => {
    // Si ya hay una petición en curso, esperar a que termine
    if (currentUserPromiseRef.current) {
      return currentUserPromiseRef.current;
    }

    // Verificar cache usando la función de setState con callback
    let shouldFetch = false;
    let cachedData: any = null;

    setCurrentUserCache(prev => {
      if (prev.data && isCacheValid(prev.timestamp)) {
        cachedData = prev.data;
        return prev; // No change, return from cache
      } else {
        shouldFetch = true;
        return { ...prev, loading: true };
      }
    });

    // Si tenemos data en cache, retornarla
    if (cachedData) {
      return cachedData;
    }

    // Si no debe hacer fetch, retornar null
    if (!shouldFetch) {
      return null;
    }

    // Crear nueva promesa
    const promise = getCurrentUser()
      .then(user => {
        setCurrentUserCache({
          data: user,
          timestamp: Date.now(),
          loading: false,
        });
        currentUserPromiseRef.current = null;
        return user;
      })
      .catch(error => {
        console.error('[DataCache] Error fetching current user:', error);
        setCurrentUserCache(prev => ({ ...prev, loading: false }));
        currentUserPromiseRef.current = null;
        throw error;
      });

    currentUserPromiseRef.current = promise;
    return promise;
  }, [isCacheValid]); // ✅ Solo isCacheValid como dependencia

  // ✅ FIX: No incluir estados en las dependencias
  const getUserProfileCached = useCallback(async (userId: string) => {
    // Si ya hay una petición en curso para este usuario, esperar a que termine
    const existingPromise = userProfilePromisesRef.current.get(userId);
    if (existingPromise) {
      return existingPromise;
    }

    // Verificar cache usando la función de setState con callback
    let shouldFetch = false;
    let cachedData: any = null;

    setUserProfileCache(prev => {
      const cached = prev.get(userId);
      if (cached?.data && isCacheValid(cached.timestamp)) {
        cachedData = cached.data;
        return prev; // No change, return from cache
      } else {
        shouldFetch = true;
        const newMap = new Map(prev);
        newMap.set(userId, {
          data: cached?.data || null,
          timestamp: cached?.timestamp || 0,
          loading: true,
        });
        return newMap;
      }
    });

    // Si tenemos data en cache, retornarla
    if (cachedData) {
      return cachedData;
    }

    // Si no debe hacer fetch, retornar null
    if (!shouldFetch) {
      return null;
    }

    // Crear nueva promesa
    const promise = getUserProfileByUserId(userId)
      .then(profile => {
        setUserProfileCache(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, {
            data: profile,
            timestamp: Date.now(),
            loading: false,
          });
          return newMap;
        });
        userProfilePromisesRef.current.delete(userId);
        return profile;
      })
      .catch(error => {
        console.error(`[DataCache] Error fetching user profile for ${userId}:`, error);
        setUserProfileCache(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(userId);
          if (current) {
            newMap.set(userId, { ...current, loading: false });
          }
          return newMap;
        });
        userProfilePromisesRef.current.delete(userId);
        throw error;
      });

    userProfilePromisesRef.current.set(userId, promise);
    return promise;
  }, [isCacheValid]); // ✅ Solo isCacheValid como dependencia

  const invalidateCache = useCallback((keys?: string[]) => {
    if (!keys || keys.includes('currentUser')) {
      setCurrentUserCache({
        data: null,
        timestamp: 0,
        loading: false,
      });
      currentUserPromiseRef.current = null;
    }

    if (!keys || keys.includes('userProfile')) {
      setUserProfileCache(new Map());
      userProfilePromisesRef.current.clear();
    }
  }, []);

  const clearAllCache = useCallback(() => {
    invalidateCache();
  }, [invalidateCache]);

  // ✅ FIX: Memoizar el value para evitar recreaciones innecesarias
  const contextValue = React.useMemo(() => ({
    getCurrentUserCached,
    getUserProfileCached,
    invalidateCache,
    clearAllCache,
  }), [getCurrentUserCached, getUserProfileCached, invalidateCache, clearAllCache]);

  return (
    <DataCacheContext.Provider value={contextValue}>
      {children}
    </DataCacheContext.Provider>
  );
};

export const useDataCache = () => {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within DataCacheProvider');
  }
  return context;
};
