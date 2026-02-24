import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Check, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import { MarketplaceLinks, MarketplaceLink } from '@/hooks/useInventory';
import { 
  extractAmazonASIN, 
  extractMLItemId, 
  validateMarketplaceUrl,
  formatMarketplaceUrl,
  getMarketplaceIcon,
  getMarketplaceColor 
} from '@/utils/marketplaceUtils';
import { toast } from 'sonner';

interface MarketplaceLinksManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  initialLinks?: MarketplaceLinks;
  onSave: (links: MarketplaceLinks) => void;
}

export const MarketplaceLinksManager = ({
  open,
  onOpenChange,
  productName,
  initialLinks = {},
  onSave,
}: MarketplaceLinksManagerProps) => {
  const [links, setLinks] = useState<MarketplaceLinks>(initialLinks);
  const [amazonUrl, setAmazonUrl] = useState('');
  const [mlUrl, setMlUrl] = useState('');
  const [otherPlatform, setOtherPlatform] = useState('');
  const [otherUrl, setOtherUrl] = useState('');
  const [amazonValid, setAmazonValid] = useState<boolean | null>(null);
  const [mlValid, setMlValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      setLinks(initialLinks || {});
      setAmazonUrl(initialLinks?.amazon?.url || '');
      setMlUrl(initialLinks?.mercadolibre?.url || '');
    }
  }, [open, initialLinks]);

  const handleAmazonUrlChange = (url: string) => {
    setAmazonUrl(url);
    if (url.trim()) {
      const isValid = validateMarketplaceUrl('amazon', url);
      setAmazonValid(isValid);
      
      if (isValid) {
        const asin = extractAmazonASIN(url);
        setLinks(prev => ({
          ...prev,
          amazon: {
            url,
            asin: asin || undefined,
            sync_enabled: prev.amazon?.sync_enabled || false,
          }
        }));
      }
    } else {
      setAmazonValid(null);
      setLinks(prev => {
        const { amazon, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleMLUrlChange = (url: string) => {
    setMlUrl(url);
    if (url.trim()) {
      const isValid = validateMarketplaceUrl('mercadolibre', url);
      setMlValid(isValid);
      
      if (isValid) {
        const itemId = extractMLItemId(url);
        setLinks(prev => ({
          ...prev,
          mercadolibre: {
            url,
            item_id: itemId || undefined,
            sync_enabled: prev.mercadolibre?.sync_enabled || false,
          }
        }));
      }
    } else {
      setMlValid(null);
      setLinks(prev => {
        const { mercadolibre, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleToggleSync = (platform: 'amazon' | 'mercadolibre', enabled: boolean) => {
    setLinks(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        sync_enabled: enabled,
      } as MarketplaceLink,
    }));
  };

  const handleAddOther = () => {
    if (!otherPlatform.trim() || !otherUrl.trim()) {
      toast.error('Ingresa el nombre de la plataforma y la URL');
      return;
    }

    try {
      new URL(otherUrl);
    } catch {
      toast.error('URL inválida');
      return;
    }

    setLinks(prev => ({
      ...prev,
      other: [
        ...(prev.other || []),
        {
          platform: otherPlatform,
          url: otherUrl,
        }
      ]
    }));

    setOtherPlatform('');
    setOtherUrl('');
    toast.success('Marketplace agregado');
  };

  const handleRemoveOther = (index: number) => {
    setLinks(prev => ({
      ...prev,
      other: prev.other?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSave = () => {
    if (amazonUrl && !amazonValid) {
      toast.error('La URL de Amazon no es válida');
      return;
    }
    if (mlUrl && !mlValid) {
      toast.error('La URL de MercadoLibre no es válida');
      return;
    }

    onSave(links);
    toast.success('Enlaces guardados correctamente');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vincular con Marketplaces</DialogTitle>
          <DialogDescription>
            Vincula "{productName}" con tus listados en otras plataformas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amazon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {getMarketplaceIcon('amazon')} Amazon
              </CardTitle>
              <CardDescription>
                Vincula tu producto con Amazon usando la URL del listado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amazon-url">URL de Amazon</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="amazon-url"
                      placeholder="https://www.amazon.com/dp/B08N5WRWNW"
                      value={amazonUrl}
                      onChange={(e) => handleAmazonUrlChange(e.target.value)}
                      className={
                        amazonValid === true ? 'border-green-500' :
                        amazonValid === false ? 'border-red-500' : ''
                      }
                    />
                    {amazonValid === true && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                    {amazonValid === false && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {amazonUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={amazonUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
                {links.amazon?.asin && (
                  <Badge variant="outline" className="text-xs">
                    ASIN: {links.amazon.asin}
                  </Badge>
                )}
              </div>

              {amazonValid && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="amazon-sync" className="text-sm font-medium">
                      Sincronizar precio y stock
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Actualizar automáticamente desde Amazon (próximamente)
                    </p>
                  </div>
                  <Switch
                    id="amazon-sync"
                    checked={links.amazon?.sync_enabled || false}
                    onCheckedChange={(checked) => handleToggleSync('amazon', checked)}
                    disabled
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* MercadoLibre */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {getMarketplaceIcon('mercadolibre')} MercadoLibre
              </CardTitle>
              <CardDescription>
                Vincula tu producto con MercadoLibre usando la URL del listado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ml-url">URL de MercadoLibre</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="ml-url"
                      placeholder="https://articulo.mercadolibre.com.co/MCO-123456789"
                      value={mlUrl}
                      onChange={(e) => handleMLUrlChange(e.target.value)}
                      className={
                        mlValid === true ? 'border-green-500' :
                        mlValid === false ? 'border-red-500' : ''
                      }
                    />
                    {mlValid === true && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                    {mlValid === false && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {mlUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={mlUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
                {links.mercadolibre?.item_id && (
                  <Badge variant="outline" className="text-xs">
                    Item ID: {links.mercadolibre.item_id}
                  </Badge>
                )}
              </div>

              {mlValid && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="ml-sync" className="text-sm font-medium">
                      Sincronizar precio y stock
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Actualizar automáticamente desde MercadoLibre (próximamente)
                    </p>
                  </div>
                  <Switch
                    id="ml-sync"
                    checked={links.mercadolibre?.sync_enabled || false}
                    onCheckedChange={(checked) => handleToggleSync('mercadolibre', checked)}
                    disabled
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other Marketplaces */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Otros Marketplaces</CardTitle>
              <CardDescription>
                Agrega enlaces a otras plataformas como Etsy, Shopify, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {links.other && links.other.length > 0 && (
                <div className="space-y-2">
                  {links.other.map((link, index) => {
                    const colors = getMarketplaceColor(link.platform);
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-lg">{getMarketplaceIcon(link.platform)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${colors.text}`}>{link.platform}</p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:underline truncate block"
                            >
                              {formatMarketplaceUrl(link.url)}
                            </a>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOther(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="other-platform">Plataforma</Label>
                    <Input
                      id="other-platform"
                      placeholder="Ej: Etsy, Shopify"
                      value={otherPlatform}
                      onChange={(e) => setOtherPlatform(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other-url">URL</Label>
                    <Input
                      id="other-url"
                      placeholder="https://..."
                      value={otherUrl}
                      onChange={(e) => setOtherUrl(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOther}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <div className="flex gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Sobre la sincronización automática</p>
              <p className="text-xs text-blue-600 mt-1">
                La sincronización de precios y stock estará disponible próximamente. 
                Por ahora, los enlaces se guardarán para referencia y gestión manual.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
