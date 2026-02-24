import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const checkModeratorStatus = async () => {
      if (!user) {
        setStatus({ isModerator: false, isAdmin: false, loading: false });
        return;
      }

      console.log('[useIsModerator] Checking roles for user:', user.id, user.email);

      let isModerator = false;
      let isAdmin = false;

      // Method 1: Check user_roles table directly
      try {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        console.log('[useIsModerator] user_roles query result:', { roles, error: rolesError });

        if (!rolesError && roles && roles.length > 0) {
          isAdmin = roles.some(r => r.role === 'admin');
          isModerator = isAdmin || roles.some(r => r.role === 'moderator');
          console.log('[useIsModerator] Roles found:', { isAdmin, isModerator, roles });
        }
      } catch (error) {
        console.warn('[useIsModerator] Exception checking user_roles:', error);
      }

      // Method 2: Check admin_users table as fallback
      if (!isModerator && !isAdmin && user.email) {
        try {
          const { data: adminUser, error: adminError } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', user.email)
            .eq('is_active', true)
            .maybeSingle();

          console.log('[useIsModerator] admin_users query result:', { adminUser, error: adminError });

          if (adminUser) {
            isModerator = true;
            isAdmin = true;
            console.log('[useIsModerator] User is admin via admin_users table');
          }
        } catch (error) {
          console.error('[useIsModerator] Exception checking admin_users:', error);
        }
      }

      // Method 3: Use RPC function as final fallback (bypasses RLS)
      if (!isModerator && !isAdmin) {
        try {
          const { data: hasModRole, error: rpcError } = await supabase
            .rpc('has_role', { _user_id: user.id, _role: 'moderator' });

          console.log('[useIsModerator] has_role RPC result:', { hasModRole, error: rpcError });

          if (!rpcError && hasModRole === true) {
            isModerator = true;
            console.log('[useIsModerator] User has moderator role via RPC');
          }

          // Also check admin role
          const { data: hasAdminRole } = await supabase
            .rpc('has_role', { _user_id: user.id, _role: 'admin' });
          
          if (hasAdminRole === true) {
            isAdmin = true;
            isModerator = true;
          }
        } catch (error) {
          console.error('[useIsModerator] Exception in RPC check:', error);
        }
      }

      console.log('[useIsModerator] Final result:', { isModerator, isAdmin });
      setStatus({ isModerator, isAdmin, loading: false });
    };

    checkModeratorStatus();
  }, [user]);

  return status;
};
