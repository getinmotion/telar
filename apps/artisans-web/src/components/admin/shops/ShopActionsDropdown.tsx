import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MoreHorizontal, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Package,
  CreditCard,
  Trash2,
  Loader2
} from 'lucide-react';
import { ShopWithMetrics } from '@/hooks/useAdminShops';

interface ShopActionsDropdownProps {
  shop: ShopWithMetrics;
  onApprove: (shopId: string) => Promise<void>;
  onReject: (shopId: string, reason?: string) => Promise<void>;
  onTogglePublish: (shopId: string, publish: boolean) => Promise<void>;
  onDelete: (shopId: string, reason: string) => Promise<void>;
  onCreateCobre: (shopId: string) => Promise<void>;
  loading?: boolean;
}

export const ShopActionsDropdown: React.FC<ShopActionsDropdownProps> = ({
  shop,
  onApprove,
  onReject,
  onTogglePublish,
  onDelete,
  onCreateCobre,
  loading,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleDelete = async () => {
    if (!deleteReason.trim()) return;
    await onDelete(shop.id, deleteReason);
    setShowDeleteDialog(false);
    setDeleteReason('');
  };

  const handleReject = async () => {
    await onReject(shop.id, rejectReason || undefined);
    setShowRejectDialog(false);
    setRejectReason('');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* View actions */}
          <DropdownMenuItem asChild>
            <a 
              href={`/tienda/${shop.shop_slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              Ver tienda
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href={`/admin/products?shop=${shop.id}`} 
              className="flex items-center gap-2 cursor-pointer"
            >
              <Package className="h-4 w-4" />
              Ver productos ({shop.total_products})
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Marketplace actions */}
          {!shop.marketplace_approved ? (
            <DropdownMenuItem 
              onClick={() => onApprove(shop.id)}
              className="text-emerald-600 focus:text-emerald-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobar en Marketplace
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowRejectDialog(true)}
              className="text-amber-600 focus:text-amber-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Remover del Marketplace
            </DropdownMenuItem>
          )}
          
          {/* Publish actions */}
          {shop.active ? (
            <DropdownMenuItem onClick={() => onTogglePublish(shop.id, false)}>
              <EyeOff className="h-4 w-4 mr-2" />
              Despublicar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onTogglePublish(shop.id, true)}>
              <Eye className="h-4 w-4 mr-2" />
              Publicar
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Cobre action */}
          {!shop.id_contraparty && (
            <DropdownMenuItem onClick={() => onCreateCobre(shop.id)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Crear cuenta Cobre
            </DropdownMenuItem>
          )}
          
          {/* Delete action */}
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar tienda
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tienda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la tienda <strong>{shop.shop_name}</strong> y todos sus productos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="delete-reason">Razón de eliminación (requerido)</Label>
            <Input
              id="delete-reason"
              placeholder="Ej: Solicitud del artesano, contenido inapropiado..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={!deleteReason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Remover del marketplace?</AlertDialogTitle>
            <AlertDialogDescription>
              La tienda <strong>{shop.shop_name}</strong> dejará de ser visible en el marketplace público.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Razón (opcional)</Label>
            <Input
              id="reject-reason"
              placeholder="Ej: Productos no cumplen con calidad..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
