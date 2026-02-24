import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Package, Image as ImageIcon, DollarSign, Tag, Check, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface InventoryOrganizerModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  stepTitle: string;
}

type ProductStatus = 'uncategorized' | 'categorized' | 'priced' | 'published';

interface Product {
  id: string;
  name: string;
  price: number | null;
  category: string | null;
  images: string[];
  status: ProductStatus;
}

const SUGGESTED_CATEGORIES = [
  'Cerámica',
  'Textiles',
  'Joyería',
  'Madera',
  'Cuero',
  'Bisutería',
  'Decoración',
  'Accesorios',
  'Otros'
];

export const InventoryOrganizerModal: React.FC<InventoryOrganizerModalProps> = ({
  open,
  onClose,
  onComplete,
  stepTitle
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (open && user) {
      loadProducts();
    }
  }, [open, user]);

  useEffect(() => {
    if (products.length > 0) {
      const organized = products.filter(p => p.category && p.price).length;
      setProgress((organized / products.length) * 100);
    }
  }, [products]);

  const loadProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // ✅ Forzar tipo en el cliente para evitar inferencia profunda
      const response = await (supabase as any)
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      const rawData = response.data;
      const error = response.error;

      if (error) {
        console.error('Error loading products:', error);
        toast({ title: 'Error', description: 'No se pudieron cargar los productos', variant: 'destructive' });
      } else if (rawData) {
        const mapped: Product[] = rawData.map((p: any) => {
          let status: ProductStatus = 'uncategorized';
          if (p.is_active && p.category && p.price) status = 'published';
          else if (p.price && p.category) status = 'priced';
          else if (p.category) status = 'categorized';
          
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            images: Array.isArray(p.images) ? p.images.filter((i: any) => typeof i === 'string') : [],
            status
          };
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    setLoading(false);
  };

  const determineStatus = (p: any): ProductStatus => {
    if (p.is_active && p.category && p.price) return 'published';
    if (p.price && p.category) return 'priced';
    if (p.category) return 'categorized';
    return 'uncategorized';
  };

  const updateProductCategory = async (productId: string, category: string) => {
    const { error } = await supabase
      .from('products')
      .update({ category })
      .eq('id', productId);

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la categoría',
        variant: 'destructive'
      });
      return;
    }

    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, category, status: determineStatus({ ...p, category }) }
        : p
    ));

    toast({
      title: '✅ Categoría actualizada',
      description: 'Producto organizado correctamente'
    });
  };

  const bulkAssignCategory = () => {
    if (!selectedCategory) {
      toast({
        title: 'Selecciona una categoría',
        description: 'Elige la categoría para asignar',
        variant: 'destructive'
      });
      return;
    }

    const uncategorized = products.filter(p => !p.category);
    
    uncategorized.forEach(product => {
      updateProductCategory(product.id, selectedCategory);
    });

    toast({
      title: '📦 Categorías asignadas',
      description: `${uncategorized.length} productos organizados`
    });
  };

  const handleComplete = () => {
    const organized = products.filter(p => p.category && p.price).length;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: '🎉 ¡Catálogo organizado!',
      description: `${organized}/${products.length} productos completamente organizados`
    });

    onComplete({
      totalProducts: products.length,
      organizedProducts: organized,
      categories: [...new Set(products.map(p => p.category).filter(Boolean))]
    });

    onClose();
  };

  const groupedProducts = {
    uncategorized: products.filter(p => p.status === 'uncategorized'),
    categorized: products.filter(p => p.status === 'categorized'),
    priced: products.filter(p => p.status === 'priced'),
    published: products.filter(p => p.status === 'published')
  };

  const statusLabels = {
    uncategorized: { label: 'Sin Categoría', icon: AlertCircle, color: 'text-destructive' },
    categorized: { label: 'Categorizados', icon: Tag, color: 'text-yellow-500' },
    priced: { label: 'Con Precio', icon: DollarSign, color: 'text-blue-500' },
    published: { label: 'Publicados', icon: Check, color: 'text-success' }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-primary" />
            Organizador de Catálogo
          </DialogTitle>
          <DialogDescription>
            Organiza tus {products.length} productos por categorías y prepáralos para publicar
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2 mb-4" />

        {/* Bulk Action */}
        {groupedProducts.uncategorized.length > 0 && (
          <div className="bg-muted rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">Asignación Masiva</p>
              <p className="text-xs text-muted-foreground">
                Asigna categoría a todos los productos sin categorizar
              </p>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {SUGGESTED_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={bulkAssignCategory}>
              Asignar a {groupedProducts.uncategorized.length}
            </Button>
          </div>
        )}

        {/* Products Grid by Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(groupedProducts).map(([status, items]) => {
            const statusInfo = statusLabels[status as keyof typeof statusLabels];
            
            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center gap-2">
                  <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                  <h3 className="font-semibold text-sm">{statusInfo.label}</h3>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {items.map(product => (
                    <div key={product.id} className="border rounded-lg p-3 space-y-2 hover:bg-accent transition-colors">
                      <div className="flex items-start gap-2">
                        {product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          {product.price && (
                            <p className="text-xs text-muted-foreground">
                              ${product.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {status === 'uncategorized' && (
                        <Select 
                          value={product.category || ''} 
                          onValueChange={(value) => updateProductCategory(product.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Asignar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUGGESTED_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Sin productos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleComplete}>Completar Organización</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
