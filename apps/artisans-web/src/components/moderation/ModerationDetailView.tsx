import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModerationStatusBadge } from './ModerationStatusBadge';
import { ModerationHistory } from './ModerationHistory';
import { 
  CheckCircle, 
  Edit, 
  AlertCircle, 
  XCircle,
  Store,
  MapPin,
  Palette,
  DollarSign,
  Package,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ModerationProduct, ModerationHistory as ModerationHistoryType } from '@/hooks/useProductModeration';

interface ModerationDetailViewProps {
  product: ModerationProduct;
  history: ModerationHistoryType[];
  onModerate: (
    action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
    comment?: string,
    edits?: Record<string, any>
  ) => Promise<void>;
  moderating: boolean;
}

export const ModerationDetailView: React.FC<ModerationDetailViewProps> = ({
  product,
  history,
  onModerate,
  moderating,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [comment, setComment] = useState('');
  const [edits, setEdits] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
  });

  useEffect(() => {
    setEdits({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
    });
    setComment('');
    setEditMode(false);
  }, [product.id]);

  const handleAction = async (action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject') => {
    const requiresComment = action === 'request_changes' || action === 'reject';
    if (requiresComment && !comment.trim()) {
      return;
    }

    const hasEdits = editMode && (
      edits.name !== product.name ||
      edits.description !== product.description ||
      edits.price !== product.price ||
      edits.category !== product.category
    );

    await onModerate(
      hasEdits ? 'approve_with_edits' : action,
      comment || undefined,
      hasEdits ? edits : undefined
    );
  };

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4 pr-4">
        {/* Images */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {images.length > 0 ? images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              )) : (
                <div className="col-span-4 flex items-center justify-center h-32 bg-muted rounded-lg">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Info */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Información del Producto</CardTitle>
              <ModerationStatusBadge status={product.moderation_status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={edits.name}
                    onChange={(e) => setEdits(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={edits.description}
                    onChange={(e) => setEdits(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Precio</Label>
                    <Input
                      type="number"
                      value={edits.price}
                      onChange={(e) => setEdits(prev => ({ ...prev, price: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Input
                      value={edits.category}
                      onChange={(e) => setEdits(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${product.price.toLocaleString()}
                  </Badge>
                  <Badge variant="outline">{product.category}</Badge>
                  {product.subcategory && (
                    <Badge variant="outline">{product.subcategory}</Badge>
                  )}
                  <Badge variant="secondary">
                    <Package className="w-3 h-3 mr-1" />
                    Stock: {product.inventory}
                  </Badge>
                </div>
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Artisan Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-4 h-4" />
              Información del Artesano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {product.artisan_shops?.logo_url && (
                <img
                  src={product.artisan_shops.logo_url}
                  alt={product.artisan_shops.shop_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h4 className="font-medium">{product.artisan_shops?.shop_name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {product.artisan_shops?.region && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {product.artisan_shops.region}
                    </span>
                  )}
                  {product.artisan_shops?.craft_type && (
                    <span className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      {product.artisan_shops.craft_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moderation History */}
        {history.length > 0 && (
          <ModerationHistory history={history} />
        )}

        <Separator />

        {/* Moderation Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Acciones de Moderación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Comentario para el artesano</Label>
              <Textarea
                placeholder="Escribe un comentario (obligatorio para pedir cambios o rechazar)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit className="w-4 h-4 mr-1" />
                {editMode ? 'Cancelar edición' : 'Editar producto'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAction('approve')}
                disabled={moderating || editMode}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {moderating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                Aprobar
              </Button>
              <Button
                onClick={() => handleAction('approve_with_edits')}
                disabled={moderating || !editMode}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {moderating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Edit className="w-4 h-4 mr-1" />}
                Aprobar con edición
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('request_changes')}
                disabled={moderating || !comment.trim()}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                {moderating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                Pedir cambios
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction('reject')}
                disabled={moderating || !comment.trim()}
              >
                {moderating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                Rechazar
              </Button>
            </div>
            {(!comment.trim() && (product.moderation_status === 'pending_moderation')) && (
              <p className="text-xs text-muted-foreground">
                * Para pedir cambios o rechazar, debes escribir un comentario explicativo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};