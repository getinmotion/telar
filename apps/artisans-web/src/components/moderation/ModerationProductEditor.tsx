import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModerationTagEditor } from './ModerationTagEditor';
import { ModerationImageEditor } from './ModerationImageEditor';
import { ModerationShopApproval } from './ModerationShopApproval';
import { ModerationHistory } from './ModerationHistory';
import { ModerationStatusBadge } from './ModerationStatusBadge';
import { 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Edit, 
  AlertCircle, 
  XCircle,
  Package,
  Store,
  History,
  Loader2,
  Truck
} from 'lucide-react';
import type { ModerationProduct, ModerationHistory as ModerationHistoryType } from '@/hooks/useProductModeration';

interface ProductDimensions {
  length: number | null;
  width: number | null;
  height: number | null;
}

interface ProductEdits {
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number | null;
  category: string;
  subcategory: string | null;
  images: string[];
  tags: string[];
  materials: string[];
  techniques: string[];
  inventory: number;
  sku: string | null;
  active: boolean;
  featured: boolean;
  weight: number | null;
  dimensions: ProductDimensions | null;
}

interface ModerationProductEditorProps {
  product: ModerationProduct;
  history: ModerationHistoryType[];
  onModerate: (
    action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
    comment?: string,
    edits?: Record<string, any>
  ) => Promise<void>;
  onShopApprovalChange: (shopId: string, approved: boolean, comment?: string) => Promise<void>;
  moderating: boolean;
}

const categories = [
  'Joyería y Accesorios',
  'Textiles y Moda',
  'Bolsos y Carteras',
  'Decoración del Hogar',
  'Vajillas y Cocina',
  'Muebles',
  'Arte y Esculturas',
  'Iluminación',
];

export const ModerationProductEditor: React.FC<ModerationProductEditorProps> = ({
  product,
  history,
  onModerate,
  onShopApprovalChange,
  moderating,
}) => {
  const [activeTab, setActiveTab] = useState('product');
  const [comment, setComment] = useState('');
  const [edits, setEdits] = useState<ProductEdits>({
    name: '',
    description: '',
    short_description: '',
    price: 0,
    compare_price: null,
    category: '',
    subcategory: null,
    images: [],
    tags: [],
    materials: [],
    techniques: [],
    inventory: 0,
    sku: null,
    active: true,
    featured: false,
    weight: null,
    dimensions: null,
  });

  // Reset edits when product changes
  useEffect(() => {
    setEdits({
      name: product.name,
      description: product.description || '',
      short_description: product.short_description || '',
      price: product.price,
      compare_price: product.compare_price,
      category: product.category || '',
      subcategory: product.subcategory,
      images: Array.isArray(product.images) ? product.images : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      materials: Array.isArray(product.materials) ? product.materials : [],
      techniques: Array.isArray(product.techniques) ? product.techniques : [],
      inventory: product.inventory || 0,
      sku: product.sku,
      active: product.active,
      featured: false,
      weight: product.weight ?? null,
      dimensions: product.dimensions ?? null,
    });
    setComment('');
    setActiveTab('product');
  }, [product.id]);

  const hasEdits = () => {
    return (
      edits.name !== product.name ||
      edits.description !== (product.description || '') ||
      edits.short_description !== (product.short_description || '') ||
      edits.price !== product.price ||
      edits.compare_price !== product.compare_price ||
      edits.category !== (product.category || '') ||
      edits.subcategory !== product.subcategory ||
      JSON.stringify(edits.images) !== JSON.stringify(product.images || []) ||
      JSON.stringify(edits.tags) !== JSON.stringify(product.tags || []) ||
      JSON.stringify(edits.materials) !== JSON.stringify(product.materials || []) ||
      JSON.stringify(edits.techniques) !== JSON.stringify(product.techniques || []) ||
      edits.inventory !== (product.inventory || 0) ||
      edits.sku !== product.sku ||
      edits.weight !== (product.weight ?? null) ||
      JSON.stringify(edits.dimensions) !== JSON.stringify(product.dimensions ?? null)
    );
  };

  const resetEdits = () => {
    setEdits({
      name: product.name,
      description: product.description || '',
      short_description: product.short_description || '',
      price: product.price,
      compare_price: product.compare_price,
      category: product.category || '',
      subcategory: product.subcategory,
      images: Array.isArray(product.images) ? product.images : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      materials: Array.isArray(product.materials) ? product.materials : [],
      techniques: Array.isArray(product.techniques) ? product.techniques : [],
      inventory: product.inventory || 0,
      sku: product.sku,
      active: product.active,
      featured: false,
      weight: product.weight ?? null,
      dimensions: product.dimensions ?? null,
    });
  };

  const handleAction = async (action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject') => {
    const requiresComment = action === 'request_changes' || action === 'reject';
    if (requiresComment && !comment.trim()) return;

    const editedFields = hasEdits() ? edits : undefined;
    const finalAction = editedFields ? 'approve_with_edits' : action;
    
    await onModerate(finalAction, comment || undefined, editedFields);
  };

  return (
    <div className="space-y-4">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold truncate max-w-[300px]">{product.name}</h2>
          <ModerationStatusBadge status={product.moderation_status} />
        </div>
        {hasEdits() && (
          <Button variant="ghost" size="sm" onClick={resetEdits}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Deshacer cambios
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product" className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            Producto
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="w-4 h-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Link to shop */}
        {product.artisan_shops && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Tienda: <strong>{product.artisan_shops.shop_name}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Para aprobar esta tienda en el marketplace, usa el panel de Tiendas.
            </p>
          </div>
        )}

        {/* Product Tab */}
        <TabsContent value="product" className="space-y-4 mt-4">
          {/* Images */}
          <Card>
            <CardContent className="pt-4">
              <ModerationImageEditor
                images={edits.images}
                onChange={(imgs) => setEdits(prev => ({ ...prev, images: imgs }))}
              />
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del producto</Label>
                <Input
                  value={edits.name}
                  onChange={(e) => setEdits(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción corta</Label>
                <Input
                  value={edits.short_description}
                  onChange={(e) => setEdits(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Breve descripción para listados..."
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción completa</Label>
                <Textarea
                  value={edits.description}
                  onChange={(e) => setEdits(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Precios e Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Precio ($)</Label>
                  <Input
                    type="number"
                    value={edits.price}
                    onChange={(e) => setEdits(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio anterior ($)</Label>
                  <Input
                    type="number"
                    value={edits.compare_price || ''}
                    onChange={(e) => setEdits(prev => ({ ...prev, compare_price: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={edits.inventory}
                    onChange={(e) => setEdits(prev => ({ ...prev, inventory: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={edits.sku || ''}
                    onChange={(e) => setEdits(prev => ({ ...prev, sku: e.target.value || null }))}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Data */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Datos de Envío
                </CardTitle>
                {(edits.weight && edits.dimensions?.length && edits.dimensions?.width && edits.dimensions?.height) ? (
                  <span className="text-xs text-success flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completo
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Incompleto
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={edits.weight ?? ''}
                    onChange={(e) => setEdits(prev => ({ 
                      ...prev, 
                      weight: e.target.value ? Number(e.target.value) : null 
                    }))}
                    placeholder="ej: 0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largo (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={edits.dimensions?.length ?? ''}
                    onChange={(e) => setEdits(prev => ({ 
                      ...prev, 
                      dimensions: {
                        ...prev.dimensions,
                        length: e.target.value ? Number(e.target.value) : null,
                        width: prev.dimensions?.width ?? null,
                        height: prev.dimensions?.height ?? null,
                      }
                    }))}
                    placeholder="ej: 30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ancho (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={edits.dimensions?.width ?? ''}
                    onChange={(e) => setEdits(prev => ({ 
                      ...prev, 
                      dimensions: {
                        ...prev.dimensions,
                        length: prev.dimensions?.length ?? null,
                        width: e.target.value ? Number(e.target.value) : null,
                        height: prev.dimensions?.height ?? null,
                      }
                    }))}
                    placeholder="ej: 20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alto (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={edits.dimensions?.height ?? ''}
                    onChange={(e) => setEdits(prev => ({ 
                      ...prev, 
                      dimensions: {
                        ...prev.dimensions,
                        length: prev.dimensions?.length ?? null,
                        width: prev.dimensions?.width ?? null,
                        height: e.target.value ? Number(e.target.value) : null,
                      }
                    }))}
                    placeholder="ej: 10"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Los datos de envío son necesarios para calcular costos de envío con Servientrega.
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Categorización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select 
                    value={edits.category} 
                    onValueChange={(v) => setEdits(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subcategoría</Label>
                  <Input
                    value={edits.subcategory || ''}
                    onChange={(e) => setEdits(prev => ({ ...prev, subcategory: e.target.value || null }))}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags, Materials, Techniques */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Etiquetas y Atributos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ModerationTagEditor
                tags={edits.tags}
                onChange={(tags) => setEdits(prev => ({ ...prev, tags }))}
                label="Tags"
                placeholder="Agregar tag..."
              />
              <ModerationTagEditor
                tags={edits.materials}
                onChange={(materials) => setEdits(prev => ({ ...prev, materials }))}
                label="Materiales"
                placeholder="Agregar material..."
              />
              <ModerationTagEditor
                tags={edits.techniques}
                onChange={(techniques) => setEdits(prev => ({ ...prev, techniques }))}
                label="Técnicas"
                placeholder="Agregar técnica..."
              />
            </CardContent>
          </Card>

          {/* Toggles */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Producto activo</Label>
                  <p className="text-xs text-muted-foreground">Visible en la tienda</p>
                </div>
                <Switch
                  checked={edits.active}
                  onCheckedChange={(v) => setEdits(prev => ({ ...prev, active: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          {history.length > 0 ? (
            <ModerationHistory history={history} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Sin historial de moderación</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Moderation Actions - Always visible */}
      <Card className="sticky bottom-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Comentario para el artesano</Label>
            <Textarea
              placeholder="Escribe un comentario (obligatorio para pedir cambios o rechazar)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={() => handleAction('approve')}
              disabled={moderating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {moderating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
              Aprobar
            </Button>
            <Button
              onClick={() => handleAction('approve_with_edits')}
              disabled={moderating || !hasEdits()}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {moderating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Edit className="w-4 h-4 mr-1" />}
              Con ediciones
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction('request_changes')}
              disabled={moderating || !comment.trim()}
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
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

          {hasEdits() && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              ⚠️ Tienes cambios sin guardar. Usa "Con ediciones" para aplicarlos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
