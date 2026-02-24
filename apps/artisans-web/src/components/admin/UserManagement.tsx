import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, UserCheck, UserX, RefreshCw, Shield, Users, Store, User, Settings, AlertTriangle, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CreateUserForm } from './CreateUserForm';
import { UserClassificationModal } from './UserClassificationModal';
import { useAdminUsers, AllUser } from '@/hooks/useAdminUsers';
import { AdminSyncIndicator } from './AdminSyncIndicator';
import { AdminErrorState } from './AdminErrorState';

export const UserManagement = () => {
  const { users, isLoading, isError, refetch, dataUpdatedAt, isFetching, stats } = useAdminUsers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classificationModalOpen, setClassificationModalOpen] = useState(false);
  const [selectedUserForClassification, setSelectedUserForClassification] = useState<AllUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleUserCreated = () => {
    setDialogOpen(false);
    refetch();
  };

  const handleClassifyUser = (user: AllUser) => {
    setSelectedUserForClassification(user);
    setClassificationModalOpen(true);
  };

  const handleClassificationSuccess = () => {
    setClassificationModalOpen(false);
    setSelectedUserForClassification(null);
    refetch();
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedUsers.size === 0) return;
    
    setDeleting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: 'Error de autenticación',
          description: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
          variant: 'destructive',
        });
        setDeleting(false);
        return;
      }

      const emailsToDelete = users
        .filter(u => selectedUsers.has(u.id))
        .map(u => u.email);

      const { data, error } = await supabase.functions.invoke('delete-dummy-users', {
        body: { emails: emailsToDelete }
      });

      if (error) throw error;

      if (data?.errors && data.errors.length > 0) {
        toast({
          title: 'Eliminación parcial',
          description: `${data.deletedUsers?.length || 0} usuario(s) eliminado(s), ${data.errors.length} error(es)`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Usuarios eliminados',
          description: `${data.deletedUsers?.length || 0} usuario(s) eliminado(s) exitosamente`,
        });
      }

      setSelectedUsers(new Set());
      setDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron eliminar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean, userType: string) => {
    try {
      if (userType === 'admin') {
        const { error } = await supabase
          .from('admin_users')
          .update({ is_active: !currentStatus } as any)
          .eq('id', userId as any);
          
        if (error) throw error;
        
        toast({
          title: 'Estado actualizado',
          description: `Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente.`,
        });
        
        refetch();
      } else {
        toast({
          title: 'Información',
          description: 'Gestión de estado para este tipo de usuario en desarrollo.',
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del usuario.',
        variant: 'destructive',
      });
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'shop_owner': return <Store className="w-4 h-4" />;
      case 'regular': return <User className="w-4 h-4" />;
      case 'unclassified': return <AlertTriangle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'admin': return 'Administrador';
      case 'shop_owner': return 'Propietario de Tienda';
      case 'regular': return 'Usuario Regular';
      case 'unclassified': return 'Sin Clasificar';
      default: return 'Usuario';
    }
  };

  const getUserTypeBadgeVariant = (userType: string) => {
    switch (userType) {
      case 'admin': return 'destructive' as const;
      case 'shop_owner': return 'secondary' as const;
      case 'regular': return 'outline' as const;
      case 'unclassified': return 'default' as const;
      default: return 'outline' as const;
    }
  };

  if (isError) {
    return (
      <AdminErrorState 
        title="Error al cargar usuarios"
        message="No se pudieron cargar los usuarios. Verifica tu conexión e intenta de nuevo."
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Gestión de Usuarios</CardTitle>
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {stats.total} Total
              </Badge>
              {stats.unclassified > 0 && (
                <Badge variant="default">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats.unclassified} Sin Clasificar
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <AdminSyncIndicator
              lastUpdated={dataUpdatedAt}
              isFetching={isFetching}
              isError={isError}
              onRefresh={() => refetch()}
            />
            {selectedUsers.size > 0 && (
              <Button 
                onClick={() => setDeleteDialogOpen(true)} 
                variant="destructive"
                size="sm"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar ({selectedUsers.size})
              </Button>
            )}
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <CreateUserForm 
                  onSuccess={handleUserCreated}
                  onCancel={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Cargando usuarios...
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getUserTypeBadgeVariant(user.user_type)}>
                        <span className="flex items-center gap-1">
                          {getUserTypeIcon(user.user_type)}
                          {getUserTypeLabel(user.user_type)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.user_type === 'unclassified' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClassifyUser(user)}
                            title="Clasificar usuario"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.is_active, user.user_type)}
                            title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                            disabled={user.user_type !== 'admin'}
                          >
                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="w-8 h-8" />
                        <p>No hay usuarios creados</p>
                        <p className="text-sm">Haz clic en "Crear Usuario" para añadir el primero</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedUserForClassification && (
        <UserClassificationModal
          isOpen={classificationModalOpen}
          onClose={() => {
            setClassificationModalOpen(false);
            setSelectedUserForClassification(null);
          }}
          user={selectedUserForClassification}
          onSuccess={handleClassificationSuccess}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente {selectedUsers.size} usuario(s) y todos sus datos asociados.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUsers}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
