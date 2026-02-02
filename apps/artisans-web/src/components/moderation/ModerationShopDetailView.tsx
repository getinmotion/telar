import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Store, 
  CheckCircle, 
  XCircle, 
  Package, 
  Calendar,
  ExternalLink,
  AlertTriangle,
  Info,
  Trash2,
  ShieldAlert,
  Loader2,
  Globe,
  EyeOff,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { ModerationShop } from '@/hooks/useShopModeration';
import { ModerationBankDataCard } from './ModerationBankDataCard';
import { ModerationLogoEditCard } from './ModerationLogoEditCard';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ModerationShopDetailViewProps {
  shop: ModerationShop;
  onApprovalChange: (shopId: string, approved: boolean, comment?: string) => Promise<void>;
  onPublishChange?: (shopId: string, action: 'publish' | 'unpublish', comment?: string) => Promise<boolean>;
  updating: boolean;
  isAdmin?: boolean;
  onDeleteShop?: (shopId: string, reason: string) => Promise<void>;
  onRefresh?: () => void;
}

export const ModerationShopDetailView: React.FC<ModerationShopDetailViewProps> = ({
  shop,
  onApprovalChange,
  onPublishChange,
  updating,
  isAdmin = false,
  onDeleteShop,
  onRefresh,
}) => {
  const [comment, setComment] = useState('');
  const [publishComment, setPublishComment] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprovalChange(shop.id, true, comment);
      setComment('');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onApprovalChange(shop.id, false, comment);
      setComment('');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteShop || deleteReason.trim().length < 10) return;
    setIsDeleting(true);
    try {
      await onDeleteShop(shop.id, deleteReason);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
      setDeleteReason('');
    }
  };

  const handlePublish = async () => {
    if (!onPublishChange) return;
    setIsPublishing(true);
    try {
      const success = await onPublishChange(shop.id, 'publish', publishComment);
      if (success) {
        setPublishComment('');
        onRefresh?.();
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!onPublishChange) return;
    setIsUnpublishing(true);
    try {
      const success = await onPublishChange(shop.id, 'unpublish', publishComment);
      if (success) {
        setPublishComment('');
        onRefresh?.();
      }
    } finally {
      setIsUnpublishing(false);
    }
  };

  const canPublish = (shop.product_counts?.approved || 0) > 0;
  const isPublished = shop.publish_status === 'published';
  const isApproved = shop.marketplace_approved === true;

  return (
    <div className="space-y-4">
      {/* Header con info básica */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {shop.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={shop.shop_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-1">{shop.shop_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">
                    @{shop.shop_slug}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {shop.region && (
                      <Badge variant="secondary">📍 {shop.region}</Badge>
                    )}
                    {shop.craft_type && (
                      <Badge variant="secondary">🎨 {shop.craft_type}</Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={`https://${shop.shop_slug}.telar.co`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver tienda
                  </a>
                </Button>
              </div>

              {shop.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {shop.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Productos</span>
            </div>
            <p className="text-2xl font-bold">{shop.product_counts?.total || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Aprobados</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {shop.product_counts?.approved || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Creada</span>
            </div>
            <p className="text-sm">
              {formatDistanceToNow(new Date(shop.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shop.contact_info?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a 
                  href={`tel:${shop.contact_info.phone}`} 
                  className="text-primary hover:underline"
                >
                  {shop.contact_info.phone}
                </a>
              </div>
            )}
            {shop.contact_info?.whatsapp && (
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-success" />
                <a 
                  href={`https://wa.me/57${shop.contact_info.whatsapp.replace(/\D/g, '')}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  WhatsApp: {shop.contact_info.whatsapp}
                </a>
              </div>
            )}
            {shop.contact_info?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a 
                  href={`mailto:${shop.contact_info.email}`} 
                  className="text-primary hover:underline"
                >
                  {shop.contact_info.email}
                </a>
              </div>
            )}
            {!shop.contact_info?.phone && !shop.contact_info?.whatsapp && !shop.contact_info?.email && (
              <p className="text-muted-foreground text-sm">Sin información de contacto configurada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logo Edit Card */}
      <ModerationLogoEditCard
        shopId={shop.id}
        shopName={shop.shop_name}
        currentLogoUrl={shop.logo_url || null}
        onLogoUpdated={onRefresh}
      />

      {/* Bank Data Card */}
      <ModerationBankDataCard
        shopId={shop.id}
        idContraparty={shop.id_contraparty || null}
        onBankDataCreated={onRefresh}
      />

      {/* Estado de Publicación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Estado de Publicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado actual */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium mb-1">Estado actual</p>
              <div className="flex items-center gap-2">
                {isPublished ? (
                  <>
                    <Globe className="w-5 h-5 text-success" />
                    <span className="text-success font-medium">Publicada</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-5 h-5 text-warning" />
                    <span className="text-warning font-medium">No publicada</span>
                  </>
                )}
              </div>
            </div>
            <Badge variant={isPublished ? 'default' : 'secondary'}>
              {shop.publish_status || 'pending_publish'}
            </Badge>
          </div>

          {/* Alertas */}
          {!canPublish && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                La tienda debe tener al menos un producto aprobado para poder ser publicada.
              </AlertDescription>
            </Alert>
          )}

          {canPublish && !isPublished && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{shop.product_counts?.approved} producto(s) aprobado(s).</strong> Al publicar, la tienda será visible en su subdominio ({shop.shop_slug}.telar.co).
              </AlertDescription>
            </Alert>
          )}

          {/* Comentario opcional */}
          <div className="space-y-2">
            <Label htmlFor="publish-comment">Comentario (opcional)</Label>
            <Textarea
              id="publish-comment"
              placeholder="Agrega un comentario sobre la decisión..."
              value={publishComment}
              onChange={(e) => setPublishComment(e.target.value)}
              rows={2}
            />
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={handlePublish}
              disabled={!canPublish || updating || isPublishing || isPublished || !onPublishChange}
              className="gap-2"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              {isPublished ? 'Ya publicada' : 'Publicar Tienda'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleUnpublish}
              disabled={updating || isUnpublishing || !isPublished || !onPublishChange}
              className="gap-2"
            >
              {isUnpublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              Despublicar Tienda
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Panel de aprobación para Marketplace - Simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="w-5 h-5" />
            Aprobación para Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado actual */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium mb-1">Estado en Marketplace</p>
              <div className="flex items-center gap-2">
                {isApproved ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-success font-medium">Aprobada</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">No aprobada</span>
                  </>
                )}
              </div>
              {shop.marketplace_approved_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(shop.marketplace_approved_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Alertas */}
          {!canPublish && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                La tienda debe tener al menos un producto aprobado para poder ser publicada en el marketplace.
              </AlertDescription>
            </Alert>
          )}

          {canPublish && !isApproved && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Al aprobar esta tienda, sus productos aprobados aparecerán en el marketplace central (telar.co).
              </AlertDescription>
            </Alert>
          )}

          {/* Comentario opcional */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Agrega un comentario sobre la decisión..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>

          {/* Botones de acción directa */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={handleApprove}
              disabled={!canPublish || updating || isApproving || isApproved}
              className="gap-2"
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isApproved ? 'Ya aprobada' : 'Aprobar para Marketplace'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleRemove}
              disabled={updating || isRemoving || !isApproved}
              className="gap-2"
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Remover del Marketplace
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Zone - Solo visible para admins */}
      {isAdmin && onDeleteShop && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Zona de Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta acción eliminará permanentemente la tienda, todos sus productos, 
                analytics y datos relacionados. Esta acción no se puede deshacer.
              </AlertDescription>
            </Alert>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" size="lg">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Tienda Permanentemente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ¿Eliminar "{shop.shop_name}"?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      Esta acción eliminará permanentemente:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>La tienda y toda su configuración</li>
                      <li>{shop.product_counts?.total || 0} productos</li>
                      <li>Analytics e historial</li>
                      <li>Todos los datos relacionados</li>
                    </ul>
                    <p className="font-medium text-destructive">
                      Esta acción NO se puede deshacer.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 py-4">
                  <Label htmlFor="delete-reason" className="font-medium">
                    Razón de eliminación (obligatorio, mín. 10 caracteres)
                  </Label>
                  <Textarea
                    id="delete-reason"
                    placeholder="Explica por qué eliminas esta tienda (ej: tienda de prueba, duplicada, solicitud del usuario...)"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  {deleteReason.length > 0 && deleteReason.length < 10 && (
                    <p className="text-xs text-destructive">
                      Mínimo 10 caracteres ({deleteReason.length}/10)
                    </p>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    disabled={deleteReason.trim().length < 10 || isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Tienda'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
