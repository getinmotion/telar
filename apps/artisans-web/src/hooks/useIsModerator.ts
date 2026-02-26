import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ModeratorStatus {
  isModerator: boolean;
  isAdmin: boolean;
  loading: boolean;
}

export const useIsModerator = (): ModeratorStatus => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ModeratorStatus>({
    isModerator: false,
    isAdmin: false,
    loading: true,
  });

  // ✅ FIX: Usar ref para user para evitar recreaciones
  const userIdRef = useRef<string | undefined>(user?.id);
  const userEmailRef = useRef<string | undefined>(user?.email);

  useEffect(() => {
    userIdRef.current = user?.id;
    userEmailRef.current = user?.email;
  }, [user?.id, user?.email]);

  // ✅ FIX: Guard para ejecutar solo una vez por usuario
  const hasCheckedRef = useRef<string | null>(null);

  const checkModeratorStatus = useCallback(async () => {
    const userId = userIdRef.current;
    const userEmail = userEmailRef.current;

    if (!userId) {
      setStatus({ isModerator: false, isAdmin: false, loading: false });
      return;
    }

    // ✅ FIX: Si ya checkeamos este usuario, no volver a chequear
    if (hasCheckedRef.current === userId) {
      return;
    }
    hasCheckedRef.current = userId;

    let isModerator = false;
    let isAdmin = false;

    // Method 1: Check user_roles table directly
    try {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!rolesError && roles && roles.length > 0) {
        isAdmin = roles.some(r => r.role === 'admin');
        isModerator = isAdmin || roles.some(r => r.role === 'moderator');
      }
    } catch (error) {
      console.warn('[useIsModerator] Exception checking user_roles:', error);
    }

    // Method 2: Check admin_users table as fallback
    if (!isModerator && !isAdmin && userEmail) {
      try {
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', userEmail)
          .eq('is_active', true)
          .maybeSingle();

        if (adminUser) {
          isModerator = true;
          isAdmin = true;
        }
      } catch (error) {
        console.error('[useIsModerator] Exception checking admin_users:', error);
      }
    }

    // Method 3: Use RPC function as final fallback (bypasses RLS)
    if (!isModerator && !isAdmin) {
      try {
        const { data: hasModRole, error: rpcError } = await supabase
          .rpc('has_role', { _user_id: userId, _role: 'moderator' });

        if (!rpcError && hasModRole === true) {
          isModerator = true;
        }

        // Also check admin role
        const { data: hasAdminRole } = await supabase
          .rpc('has_role', { _user_id: userId, _role: 'admin' });

        if (hasAdminRole === true) {
          isAdmin = true;
          isModerator = true;
        }
      } catch (error) {
        console.error('[useIsModerator] Exception in RPC check:', error);
      }
    }

    setStatus({ isModerator, isAdmin, loading: false });
  }, []); // ✅ FIX: Sin dependencias - usa refs

  // ✅ FIX: Solo ejecutar cuando cambia el userId
  useEffect(() => {
    if (!user?.id) {
      setStatus({ isModerator: false, isAdmin: false, loading: false });
      hasCheckedRef.current = null;
      return;
    }

    // Si ya checkeamos este usuario, no ejecutar de nuevo
    if (hasCheckedRef.current === user.id) {
      return;
    }

    checkModeratorStatus();
  }, [user?.id, checkModeratorStatus]); // ✅ Solo cuando cambia el ID

  return status;
};
