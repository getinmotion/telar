
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user: authContextUser, loading } = useAuth();
  const { isAuthenticated, user: storeUser, isInitialized } = useAuthStore();
  const location = useLocation();

  // Use Zustand store data as source of truth, AuthContext as fallback
  const user = storeUser || authContextUser;
  const isUserAuthenticated = isAuthenticated || !!authContextUser;

  // ✅ Wait for Zustand to finish rehydrating from localStorage
  // loading = !isInitialized, so we wait until initialization completes
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // ✅ Only check authentication AFTER initialization is complete
  if (!isUserAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
