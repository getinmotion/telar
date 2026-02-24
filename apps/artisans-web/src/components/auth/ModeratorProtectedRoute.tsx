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
    // Redirigir al login correcto según el subdominio
    const loginPath = isModerationSubdomain ? '/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!isModerator) {
    // Si no es moderador, redirigir según el contexto
    const redirectPath = isModerationSubdomain ? '/login' : '/dashboard';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};