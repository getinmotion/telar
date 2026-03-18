import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserRolesByUserId } from '@/services/userRoles.actions';

interface ModeratorStatus {
  isModerator: boolean;
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Verifica si el usuario autenticado tiene rol de moderador o admin
 * consultando la tabla user_roles via la API.
 */
export const useIsModerator = (): ModeratorStatus => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ModeratorStatus>({
    isModerator: false,
    isAdmin: false,
    loading: true,
  });

  const checkedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setStatus({ isModerator: false, isAdmin: false, loading: false });
      checkedUserIdRef.current = null;
      return;
    }

    // Evitar consultas duplicadas para el mismo usuario
    if (checkedUserIdRef.current === user.id) return;
    checkedUserIdRef.current = user.id;

    const checkRoles = async () => {
      try {
        const roles = await getUserRolesByUserId(user.id);
        const isAdmin = roles.some(r => r.role === 'admin');
        const isModerator = isAdmin || roles.some(r => r.role === 'moderator');
        setStatus({ isModerator, isAdmin, loading: false });
      } catch {
        setStatus({ isModerator: false, isAdmin: false, loading: false });
      }
    };

    checkRoles();
  }, [user?.id]);

  return status;
};
