import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isAuthorized, loading, checkAuthorization, signOut } = useAuth();
  const location = useLocation();
  const [authChecking, setAuthChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Session validation and timeout check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        await signOut();
        return;
      }

      // Check if session is expired
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        console.log('Session timeout - auto logout');
        await signOut();
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastActivity, signOut]);

  // Update last activity on any user interaction
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

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (user) {
        setAuthChecking(true);
        const result = await checkAuthorization();
        if (!mounted) return;
        setAllowed(result);
        setAuthChecking(false);
        setChecked(true);
      } else {
        setAllowed(false);
        setChecked(true);
      }
    };
    run();
    return () => { mounted = false };
  }, [user?.id]);
  if (loading || authChecking || allowed === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (checked && user && allowed === false) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
