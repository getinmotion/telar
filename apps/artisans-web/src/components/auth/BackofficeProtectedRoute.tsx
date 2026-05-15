/**
 * BackofficeProtectedRoute
 *
 * Guard unificado para el panel de backoffice.
 * Reemplaza AdminProtectedRoute y ModeratorProtectedRoute.
 *
 * Características:
 * - Lee roles desde el JWT (authStore) — sin llamadas extra a la API
 * - Soporte para roles granulares por sección vía `requiredRoles`
 * - Muestra una página 403 si el usuario está autenticado pero sin permisos
 *   (no redirige al login para evitar confusión)
 * - Timeout de sesión de 30 minutos por inactividad
 */

import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBackofficeAccess, BackofficeSection } from '@/hooks/useBackofficeAccess';

interface BackofficeProtectedRouteProps {
  /** Sección específica requerida. Si se omite, cualquier rol de backoffice es suficiente. */
  section?: BackofficeSection;
  /**
   * Children opcionales. Si se pasan, los renderiza en lugar del <Outlet />.
   * Permite usar el componente tanto como layout route guard como element wrapper.
   */
  children?: React.ReactNode;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

export const BackofficeProtectedRoute: React.FC<BackofficeProtectedRouteProps> = ({
  section,
  children,
}) => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { hasAnyBackofficeRole, canAccess } = useBackofficeAccess();
  const location = useLocation();
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Timeout de sesión por inactividad
  useEffect(() => {
    const checkTimeout = setInterval(() => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        clearAuth();
      }
    }, 60_000);
    return () => clearInterval(checkTimeout);
  }, [lastActivity, clearAuth]);

  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  // 1. No autenticado → al login del backoffice
  if (!isAuthenticated || !user) {
    return (
      <Navigate to="/backoffice/login" state={{ from: location }} replace />
    );
  }

  // 2. Sin rol de backoffice en absoluto → al dashboard de artesano
  if (!hasAnyBackofficeRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Sin permiso para la sección específica → 403
  if (section && !canAccess(section)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Acceso denegado
          </h1>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección del backoffice.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-sm text-primary underline"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  // Si se pasan children (uso como element wrapper), los renderiza.
  // Si no (uso como layout route guard), renderiza el <Outlet /> de React Router.
  return children ? <>{children}</> : <Outlet />;
};
