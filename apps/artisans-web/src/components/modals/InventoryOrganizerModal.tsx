import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PriceInput } from '@/components/ui/price-input';
import { useToast } from '@/components/ui/use-toast';
import { Package, Edit, Save, Sparkles, Search, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface InventoryOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  active: boolean;
  inventory: number | null;
  shop_id: string;
}

export const InventoryOrganizerModal: React.FC<InventoryOrganizerModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadProducts();
    }
  }, [isOpen, user]);

  const loadProducts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // @ts-ignore - Type issue with Supabase generated types
      const { data: shopData, error: shopError } = await supabase
        .from('artisan_shops')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (shopError) throw shopError;
      
      if (!shopData) {
        console.log('No shop found for user');
        setProducts([]);
        setLoading(false);
        return;
      }

      // @ts-ignore - Type issue with Supabase generated types
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, category, active, inventory, shop_id')
        .eq('shop_id', shopData.id)
        .order('name', { ascending: true });

      if (error) throw error;

      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          price: updates.price,
          category: updates.category,
          active: updates.active,
          inventory: updates.inventory
        })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, ...updates } : p
      ));

      toast({
        title: 'Producto actualizado',
        description: 'Los cambios se han guardado correctamente.',
      });

      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el producto',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    await handleUpdateProduct(productId, { active: !currentActive });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeProducts = filteredProducts.filter(p => p.active);
  const inactiveProducts = filteredProducts.filter(p => !p.active);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="w-6 h-6 text-primary" />
            Organizador de Inventario
          </DialogTitle>
          <DialogDescription>
            Gestiona tu catálogo de productos de forma rápida y eficiente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barra de búsqueda */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos por nombre o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredProducts.length} productos
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando productos...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Package className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No tienes productos aún</h3>
                <p className="text-sm text-muted-foreground">
                  Comienza subiendo tu primer producto a la tienda
                </p>
              </div>
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Productos activos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5 text-success" />
                    Productos Activos
                  </h3>
                  <Badge variant="outline" className="bg-success/10">
                    {activeProducts.length}
                  </Badge>
                </div>

                {activeProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                    No hay productos activos
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeProducts.map(product => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onEdit={() => setEditingProduct(product)}
                        onToggleActive={() => handleToggleActive(product.id, product.active)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Productos inactivos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                    Productos Inactivos
                  </h3>
                  <Badge variant="outline" className="bg-muted">
                    {inactiveProducts.length}
                  </Badge>
                </div>

                {inactiveProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                    No hay productos inactivos
                  </p>
                ) : (
                  <div className="space-y-2">
                    {inactiveProducts.map(product => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onEdit={() => setEditingProduct(product)}
                        onToggleActive={() => handleToggleActive(product.id, product.active)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {onComplete && products.length > 0 && (
            <Button onClick={onComplete} className="bg-accent text-white hover:bg-accent/90">
              <Sparkles className="w-4 h-4 mr-2" />
              Completar Organización
            </Button>
          )}
        </div>

        {/* Modal de edición */}
        {editingProduct && (
          <EditProductDialog
            product={editingProduct}
            onSave={(updates) => handleUpdateProduct(editingProduct.id, updates)}
            onCancel={() => setEditingProduct(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

// Componente para fila de producto
const ProductRow: React.FC<{
  product: Product;
  onEdit: () => void;
  onToggleActive: () => void;
}> = ({ product, onEdit, onToggleActive }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow bg-card">
      <div className="flex-1 space-y-1">
        <h4 className="font-medium">{product.name}</h4>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          )}
          <span>${product.price.toLocaleString('es-CL')}</span>
          {product.inventory !== null && (
            <span>Stock: {product.inventory}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant={product.active ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleActive}
        >
          {product.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

// Dialog de edición simple
const EditProductDialog: React.FC<{
  product: Product;
  onSave: (updates: Partial<Product>) => void;
  onCancel: () => void;
}> = ({ product, onSave, onCancel }) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [category, setCategory] = useState(product.category || '');
  const [inventory, setInventory] = useState(product.inventory || 0);

  const handleSave = () => {
    onSave({
      name,
      price,
      category: category || null,
      inventory
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <PriceInput
            value={price}
            onChange={(newPrice) => setPrice(newPrice || 0)}
            label="Precio"
            showConfirmation={false}
          />
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="inventory">Stock</Label>
            <Input
              id="inventory"
              type="number"
              value={inventory}
              onChange={(e) => setInventory(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
