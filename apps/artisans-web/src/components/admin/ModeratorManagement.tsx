import React, { useEffect, useState } from 'react';
import { useModeratorManagement, Moderator } from '@/hooks/useModeratorManagement';
import { AddModeratorDialog } from './AddModeratorDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Trash2,
  Loader2,
  Users,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ModeratorManagement: React.FC = () => {
  const {
    moderators,
    isLoading,
    isAdding,
    isRemoving,
    counts,
    fetchModerators,
    addModerator,
    removeModerator,
  } = useModeratorManagement();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [moderatorToRemove, setModeratorToRemove] = useState<Moderator | null>(null);

  useEffect(() => {
    fetchModerators();
  }, [fetchModerators]);

  const handleRemoveConfirm = async () => {
    if (moderatorToRemove) {
      await removeModerator(moderatorToRemove.id);
      setModeratorToRemove(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gestión de Moderadores
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra quién puede moderar productos en la plataforma
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            {counts.moderators} Moderadores
          </Badge>
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            {counts.admins} Admins
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchModerators()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Actualizar
        </Button>

        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Moderador
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead className="w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Cargando moderadores...</p>
                </TableCell>
              </TableRow>
            ) : moderators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">
                    No hay moderadores configurados
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              moderators.map((mod) => (
                <TableRow key={`${mod.source}-${mod.id}`}>
                  <TableCell className="font-medium">{mod.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {mod.full_name || '-'}
                  </TableCell>
                  <TableCell>
                    {mod.role === 'admin' ? (
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Moderador
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {mod.source === 'admin_users' ? 'admin_users' : 'user_roles'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(mod.created_at), "d MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {mod.role === 'moderator' && mod.source === 'user_roles' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setModeratorToRemove(mod)}
                        disabled={isRemoving === mod.id}
                      >
                        {isRemoving === mod.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-muted-foreground">
          Los usuarios con rol <strong>Admin</strong> (de la tabla admin_users) tienen permisos de moderación automáticamente y no pueden ser eliminados desde aquí. Solo los moderadores asignados específicamente pueden ser revocados.
        </p>
      </div>

      {/* Add Dialog */}
      <AddModeratorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={addModerator}
        isAdding={isAdding}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog 
        open={!!moderatorToRemove} 
        onOpenChange={(open) => !open && setModeratorToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar acceso de moderador?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario <strong>{moderatorToRemove?.email}</strong> perderá sus permisos de moderación. Esta acción se puede revertir agregándolo nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revocar Acceso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
