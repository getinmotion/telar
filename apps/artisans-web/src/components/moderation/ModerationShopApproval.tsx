import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Store, 
  MapPin, 
  Palette, 
  CheckCircle, 
  XCircle, 
  Globe,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ShopInfo {
  id: string;
  shop_name: string;
  shop_slug: string;
  region: string | null;
  craft_type: string | null;
  logo_url: string | null;
  marketplace_approved?: boolean;
}

interface ModerationShopApprovalProps {
  shop: ShopInfo;
  onApprovalChange: (shopId: string, approved: boolean, comment?: string) => Promise<void>;
}

export const ModerationShopApproval: React.FC<ModerationShopApprovalProps> = ({
  shop,
  onApprovalChange,
}) => {
  const [isApproved, setIsApproved] = useState(shop.marketplace_approved || false);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsApproved(checked);
    setHasChanges(checked !== shop.marketplace_approved);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onApprovalChange(shop.id, isApproved, comment || undefined);
      setHasChanges(false);
      setComment('');
      toast.success(
        isApproved 
          ? 'Tienda aprobada para marketplace' 
          : 'Tienda removida del marketplace'
      );
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Aprobación para Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shop Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt={shop.shop_name}
              className="w-12 h-12 rounded-full object-cover border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Store className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-medium">{shop.shop_name}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {shop.region && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {shop.region}
                </span>
              )}
              {shop.craft_type && (
                <span className="flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  {shop.craft_type}
                </span>
              )}
            </div>
          </div>
          <Badge variant={shop.marketplace_approved ? 'default' : 'secondary'}>
            {shop.marketplace_approved ? (
              <><CheckCircle className="w-3 h-3 mr-1" /> En Marketplace</>
            ) : (
              <><XCircle className="w-3 h-3 mr-1" /> No en Marketplace</>
            )}
          </Badge>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="marketplace-approved" className="font-medium">
              Aprobar para Marketplace
            </Label>
            <p className="text-xs text-muted-foreground">
              Los productos aprobados de esta tienda aparecerán en telar.co
            </p>
          </div>
          <Switch
            id="marketplace-approved"
            checked={isApproved}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* Info boxes */}
        {isApproved && !shop.marketplace_approved && (
          <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700 dark:text-emerald-400">
              Al aprobar, los productos aprobados de esta tienda serán visibles en el marketplace central.
            </AlertDescription>
          </Alert>
        )}

        {!isApproved && shop.marketplace_approved && (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Al remover, los productos de esta tienda dejarán de aparecer en el marketplace central.
            </AlertDescription>
          </Alert>
        )}

        {/* Comment */}
        {hasChanges && (
          <div className="space-y-2">
            <Label className="text-sm">Comentario (opcional)</Label>
            <Textarea
              placeholder="Razón del cambio..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {/* Save button */}
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
            variant={isApproved ? 'default' : 'destructive'}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isApproved ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {isApproved ? 'Aprobar para Marketplace' : 'Remover del Marketplace'}
          </Button>
        )}

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          💡 La tienda del artesano funciona independientemente en su URL propia ({shop.shop_slug}.telar.co)
        </p>
      </CardContent>
    </Card>
  );
};
