import React, { useEffect, useState } from 'react';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, DollarSign, Plus, Trash2, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useInventory } from '@/hooks/useInventory';
import { DeleteProductDialog } from './DeleteProductDialog';
import { ModerationFeedbackBadge } from './ModerationFeedbackBadge';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const MasterInventoryView: React.FC = () => {
  const { masterState, refreshModule, isLoading } = useMasterAgent();
  const navigate = useNavigate();
  const { deleteProduct, duplicateProduct, loading: deleteLoading } = useInventory();
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [moderationComments, setModerationComments] = useState<Record<string, string>>({});

  // Fetch moderation comments for rejected/changes_requested products
  useEffect(() => {
    const fetchModerationComments = async () => {
      const productsNeedingComments = masterState.inventario.productos.filter(
        (p: any) => p.moderation_status === 'rejected' || p.moderation_status === 'changes_requested'
      );
      
      if (productsNeedingComments.length === 0) return;
      
      const productIds = productsNeedingComments.map((p: any) => p.id);
      
      const { data } = await supabase
        .from('product_moderation_history')
        .select('product_id, comment, created_at')
        .in('product_id', productIds)
        .in('new_status', ['rejected', 'changes_requested'])
        .order('created_at', { ascending: false });
      
      if (data) {
        const commentsMap: Record<string, string> = {};
        data.forEach((record) => {
          if (!commentsMap[record.product_id] && record.comment) {
            commentsMap[record.product_id] = record.comment;
          }
        });
        setModerationComments(commentsMap);
      }
    };
    
    if (masterState.inventario.productos.length > 0) {
      fetchModerationComments();
    }
  }, [masterState.inventario.productos]);

  useEffect(() => {
    refreshModule('inventario');
    refreshModule('pricing');
  }, [refreshModule]);

  const hasProducts = masterState.inventario.productos.length > 0;

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    const success = await deleteProduct(productToDelete.id);
    if (success) {
      setProductToDelete(null);
      // Refresh inventory after deletion
      refreshModule('inventario');
    }
  };

  const handleDuplicateProduct = async (product: any) => {
    const newProduct = await duplicateProduct(product.id);
    if (newProduct) {
      refreshModule('inventario');
      // Navigate to edit the new duplicate
      navigate(`/productos/editar/${newProduct.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No products - Show upload wizard
  if (!hasProducts) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Tu Inventario Está Vacío</CardTitle>
                <CardDescription>
                  Añade tus primeros productos para empezar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Puedes añadir productos de dos formas:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 border rounded-lg space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Manualmente</h3>
                <p className="text-sm text-muted-foreground">
                  Crea productos uno por uno con todos los detalles
                </p>
                <Button onClick={() => navigate('/dashboard/inventory/add')} className="w-full">
                  Añadir Manualmente
                </Button>
              </div>

              <div className="p-6 border rounded-lg space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Con IA</h3>
                <p className="text-sm text-muted-foreground">
                  Sube fotos y descripciones, la IA crea los productos
                </p>
                <Button onClick={() => navigate('/dashboard/inventory/ai-upload')} variant="outline" className="w-full">
                  Usar IA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has products - Show inventory management
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Productos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{masterState.inventario.productos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stock Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{masterState.inventario.stock_total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Stock Bajo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {masterState.inventario.low_stock.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-red-500" />
              Sin Precio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {masterState.inventario.sin_precio.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Productos</h2>
        <Button onClick={() => navigate('/dashboard/inventory/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Producto
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masterState.inventario.productos.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.stock || 0}
                    {(product.stock || 0) < 5 && (
                      <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                        Bajo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.price ? `$${product.price.toLocaleString()}` : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Sin precio
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <ModerationFeedbackBadge 
                      status={product.moderation_status} 
                      comment={moderationComments[product.id]}
                      productId={product.id}
                      productName={product.name}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleDuplicateProduct(product)}
                              variant="ghost"
                              size="icon"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicar producto</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        onClick={() => navigate(`/productos/editar/${product.id}`)}
                        variant="ghost"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => setProductToDelete(product)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        productName={productToDelete?.name || ''}
        onConfirm={handleDeleteProduct}
        loading={deleteLoading}
      />
    </div>
  );
};
