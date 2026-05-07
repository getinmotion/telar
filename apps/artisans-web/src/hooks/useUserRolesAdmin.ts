/**
 * useUserRolesAdmin — fetch users with their roles, toggle super_admin and roles.
 * Backend endpoints require super_admin (ForbiddenException otherwise).
 */
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  listUsers,
  setSuperAdmin,
  assignRole,
  removeRole,
  type AdminUser,
  type AppRole,
} from '@/services/users-admin.actions';

export const useUserRolesAdmin = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(
    async (params: { search?: string; limit?: number; offset?: number } = {}) => {
      setLoading(true);
      try {
        const res = await listUsers(params);
        setUsers(res.data);
        setTotal(res.total);
        return res;
      } catch (err) {
        console.error('[useUserRolesAdmin] fetchUsers error', err);
        toast.error('No se pudieron cargar los usuarios');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const toggleSuperAdmin = useCallback(
    async (userId: string, value: boolean) => {
      setSaving(true);
      // optimistic
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isSuperAdmin: value } : u)),
      );
      try {
        await setSuperAdmin(userId, value);
        toast.success(
          value ? 'Super-admin habilitado' : 'Super-admin deshabilitado',
        );
      } catch (err) {
        console.error('[useUserRolesAdmin] toggleSuperAdmin error', err);
        toast.error('No se pudo actualizar super-admin');
        // revert
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isSuperAdmin: !value } : u)),
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const toggleRole = useCallback(
    async (userId: string, role: AppRole, hasRole: boolean) => {
      setSaving(true);
      // optimistic
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                roles: hasRole
                  ? u.roles.filter((r) => r !== role)
                  : Array.from(new Set([...u.roles, role])),
              }
            : u,
        ),
      );
      try {
        if (hasRole) {
          await removeRole(userId, role);
        } else {
          await assignRole(userId, role);
        }
        toast.success(hasRole ? `Rol "${role}" removido` : `Rol "${role}" asignado`);
      } catch (err) {
        console.error('[useUserRolesAdmin] toggleRole error', err);
        toast.error('No se pudo actualizar el rol');
        // revert
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  roles: hasRole
                    ? Array.from(new Set([...u.roles, role]))
                    : u.roles.filter((r) => r !== role),
                }
              : u,
          ),
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return {
    users,
    total,
    loading,
    saving,
    fetchUsers,
    toggleSuperAdmin,
    toggleRole,
  };
};
