import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StockManager } from '@/components/inventory/StockManager';
import { ImageUploader } from '@/components/shop/ai-upload/ImageUploader';
import { Loader2, Save, ArrowLeft, Send, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { Product } from '@/types/artisan';

interface ProductEditFormProps {
  productId: string;
  shopId: string;
  onSuccess?: () => void;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  productId,
  shopId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    inventory: 0,
    category: '',
    active: true,
    featured: false,
    images: [] as string[],
    weight: null as number | null,
    dimensions: null as { length: number; width: number; height: number } | null,
    allowsLocalPickup: false
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('shop_id', shopId)
        .single();

      if (error) throw error;

      setProduct(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        inventory: data.inventory || 0,
        category: data.category || '',
        active: data.active ?? true,
        featured: data.featured ?? false,
        images: Array.isArray(data.images) ? (data.images as string[]) : [],
        weight: data.weight || null,
        dimensions: data.dimensions as { length: number; width: number; height: number } | null,
        allowsLocalPickup: data.allows_local_pickup ?? false
      });

      // Fetch or create default variant for stock management
      const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .limit(1);

      if (variants && variants.length > 0) {
        setVariant(variants[0]);
      } else {
        // Create default variant if none exists
        const { data: newVariant, error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: productId,
            sku: `${data.sku || productId}-DEFAULT`,
            price: data.price,
            stock: data.inventory || 0,
            min_stock: 5,
            status: 'active',
          })
          .select()
          .single();

        if (!variantError && newVariant) {
          setVariant(newVariant);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el producto',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          inventory: formData.inventory,
          category: formData.category,
          active: formData.active,
          featured: formData.featured,
          images: formData.images,
          weight: formData.weight,
          dimensions: formData.dimensions,
          allows_local_pickup: formData.allowsLocalPickup
        })
        .eq('id', productId)
        .eq('shop_id', shopId);

      if (error) throw error;

      toast({
        title: '✅ Producto Actualizado',
        description: 'Los cambios han sido guardados exitosamente'
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard/inventory');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Check if shipping data is complete for moderation submission
  const hasCompleteShippingData = !!(
    formData.weight && 
    formData.weight > 0 && 
    formData.dimensions &&
    formData.dimensions.length > 0 && 
    formData.dimensions.width > 0 && 
    formData.dimensions.height > 0
  );

  const isDraft = product?.moderation_status === 'draft';

  // Submit draft to moderation
  const handleSubmitForReview = async () => {
    // Validate required fields for moderation
    if (!formData.name?.trim()) {
      toast({ title: 'Error', description: 'El nombre del producto es obligatorio', variant: 'destructive' });
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast({ title: 'Error', description: 'El precio debe ser mayor a 0', variant: 'destructive' });
      return;
    }
    if (!hasCompleteShippingData) {
      toast({ title: 'Datos de envío incompletos', description: 'Debes completar el peso y las dimensiones para enviar a revisión', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          inventory: formData.inventory,
          category: formData.category,
          active: false, // Keep inactive until approved
          featured: formData.featured,
          images: formData.images,
          weight: formData.weight,
          dimensions: formData.dimensions,
          moderation_status: 'pending_moderation',
          shipping_data_complete: true
        })
        .eq('id', productId)
        .eq('shop_id', shopId);

      if (error) throw error;

      toast({
        title: '✅ Producto enviado a revisión',
        description: 'Tu producto será revisado por nuestro equipo y te notificaremos cuando esté aprobado'
      });

      navigate('/dashboard/inventory');
    } catch (error) {
      console.error('Error submitting for review:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar a revisión',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockChange = async (newStock: number) => {
    setFormData(prev => ({ ...prev, inventory: newStock }));
    
    // Also update product table
    await supabase
      .from('products')
      .update({ inventory: newStock })
      .eq('id', productId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Producto no encontrado</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Draft Alert */}
      {isDraft && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <strong>Este producto es un borrador.</strong> Completa los datos de envío (peso y dimensiones) para poder enviarlo a revisión.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Precio (COP) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Cerámica, Textil, Joyería"
              />
            </div>
          </div>

          {/* Weight and Dimensions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Datos de envío</Label>
              {isDraft && (
                hasCompleteShippingData ? (
                  <Badge variant="outline" className="text-success border-success/50 bg-success/10">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Requerido para revisión
                  </Badge>
                )
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="weight">Peso (gramos)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                value={formData.weight ?? ''}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : null })}
                placeholder="Ej: 500"
              />
            </div>

            <div>
              <Label htmlFor="length">Largo (cm)</Label>
              <Input
                id="length"
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions?.length ?? ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dimensions: { 
                    ...formData.dimensions, 
                    length: e.target.value ? Number(e.target.value) : 0,
                    width: formData.dimensions?.width ?? 0,
                    height: formData.dimensions?.height ?? 0
                  } 
                })}
                placeholder="Largo"
              />
            </div>

            <div>
              <Label htmlFor="width">Ancho (cm)</Label>
              <Input
                id="width"
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions?.width ?? ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dimensions: { 
                    ...formData.dimensions, 
                    length: formData.dimensions?.length ?? 0,
                    width: e.target.value ? Number(e.target.value) : 0,
                    height: formData.dimensions?.height ?? 0
                  } 
                })}
                placeholder="Ancho"
              />
            </div>

            <div>
              <Label htmlFor="height">Alto (cm)</Label>
              <Input
                id="height"
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions?.height ?? ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dimensions: { 
                    ...formData.dimensions, 
                    length: formData.dimensions?.length ?? 0,
                    width: formData.dimensions?.width ?? 0,
                    height: e.target.value ? Number(e.target.value) : 0
                  } 
                })}
                placeholder="Alto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked as boolean })}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Producto activo (visible en la tienda)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Producto destacado
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowsLocalPickup"
              checked={formData.allowsLocalPickup}
              onCheckedChange={(checked) => setFormData({ ...formData, allowsLocalPickup: checked as boolean })}
            />
            <Label htmlFor="allowsLocalPickup" className="cursor-pointer flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Ofrecer retiro en local (envío gratis)
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            El cliente puede recoger el producto directamente en tu ubicación
          </p>
        </CardContent>
      </Card>

      {/* Stock Management */}
      {variant && (
        <StockManager
          variantId={variant.id}
          currentStock={formData.inventory}
          minStock={variant.min_stock}
          onStockChange={handleStockChange}
          showHistory={true}
        />
      )}

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            value={formData.images}
            onChange={(urls) => setFormData({ ...formData, images: urls })}
            maxFiles={10}
            bucket="product-images"
            folder="products"
            aspectRatio="square"
            placeholder="Arrastra imágenes del producto o haz clic para subir"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/dashboard/inventory')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        
        <Button
          type="submit"
          variant="outline"
          disabled={saving || submitting}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar {isDraft ? 'Borrador' : 'Cambios'}
            </>
          )}
        </Button>

        {isDraft && (
          <Button
            type="button"
            onClick={handleSubmitForReview}
            disabled={saving || submitting || !hasCompleteShippingData}
            className="flex-1 bg-success hover:bg-success/90"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar a revisión
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
};
