/**
 * UserRolesAdminPage — super-admin only page to list users and manage their
 * roles (admin/moderator/artisan/user) and the boolean is_super_admin flag.
 *
 * Layout mirrors CmsAdminPage: header + search + paginated table.
 */
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, ShieldCheck, ShieldOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserRolesAdmin } from '@/hooks/useUserRolesAdmin';
import { APP_ROLES, type AppRole } from '@/services/users-admin.actions';

const PAGE_SIZE = 50;

export default function UserRolesAdminPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);

  const { users, total, loading, saving, fetchUsers, toggleSuperAdmin, toggleRole } =
    useUserRolesAdmin();

  // Debounce search 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchUsers({ search: debouncedSearch, limit: PAGE_SIZE, offset });
  }, [debouncedSearch, offset, fetchUsers]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-7 h-7" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra roles y permisos. Solo visible para super-admins. Los
            cambios se aplican al instante.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            {loading ? 'Cargando…' : `${total} usuario${total === 1 ? '' : 's'}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center text-muted-foreground">
              No se encontraron usuarios.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[240px]">Email</TableHead>
                    <TableHead className="w-[140px]">Super Admin</TableHead>
                    {APP_ROLES.map((r) => (
                      <TableHead key={r.value} className="text-center w-[110px]">
                        {r.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-[160px]">Roles asignados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.email ?? '—'}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {u.id.slice(0, 8)}…
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!!u.isSuperAdmin}
                            disabled={saving}
                            onCheckedChange={(v) => toggleSuperAdmin(u.id, v)}
                            id={`sa-${u.id}`}
                          />
                          {u.isSuperAdmin ? (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              <ShieldOff className="w-3 h-3" />
                              Off
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {APP_ROLES.map((r) => {
                        const has = u.roles.includes(r.value);
                        return (
                          <TableCell key={r.value} className="text-center">
                            <Switch
                              checked={has}
                              disabled={saving}
                              onCheckedChange={() =>
                                toggleRole(u.id, r.value as AppRole, has)
                              }
                              id={`role-${r.value}-${u.id}`}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            u.roles.map((r) => (
                              <Badge key={r} variant="secondary" className="text-[10px]">
                                {r}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages} · mostrando{' '}
            {Math.min(offset + 1, total)}–{Math.min(offset + PAGE_SIZE, total)}{' '}
            de {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0 || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              ← Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
