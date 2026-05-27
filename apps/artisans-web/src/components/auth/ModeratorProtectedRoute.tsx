import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useIsModerator } from '@/hooks/useIsModerator';
import { useSubdomain } from '@/hooks/useSubdomain';

interface ModeratorProtectedRouteProps {
  children: React.ReactNode;
}

export const ModeratorProtectedRoute: React.FC<ModeratorProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { isModerator, loading: checking } = useIsModerator();
  const { isModerationSubdomain } = useSubdomain();

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Verificando permisos...</div>
      </div>
    );
  }

  if (!user) {
    // Sin sesión → manda al login de admin para que regrese aquí.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isModerator) {
    // Logueado pero sin permisos → al dashboard de su tienda.
    const redirectPath = isModerationSubdomain ? '/admin/login' : '/dashboard';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};