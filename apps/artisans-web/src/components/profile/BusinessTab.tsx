import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, TrendingUp, AlertCircle, Eye, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopNavigation } from '@/hooks/useShopNavigation';

interface Product {
  id: string;
  name: string;
  price?: number;
  inventory?: number;
  images?: string[];
}

interface BusinessTabProps {
  shopId: string | null;
  shopName: string | null;
  shopSlug?: string;
  products: Product[];
  stockTotal: number;
  lowStock: string[];
  sinPrecio: string[];
}

export const BusinessTab: React.FC<BusinessTabProps> = ({
  shopId,
  shopName,
  shopSlug,
  products,
  stockTotal,
  lowStock,
  sinPrecio
}) => {
  const navigate = useNavigate();
  const { shopButtonText, navigateToShop } = useShopNavigation();

  if (!shopId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Store className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tienes una tienda aún</h3>
        <p className="text-muted-foreground mb-4">Crea tu tienda artesanal para empezar a vender</p>
        <Button onClick={navigateToShop}>
          {shopButtonText}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">en tu catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Stock Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stockTotal}</p>
            <p className="text-xs text-muted-foreground">unidades disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{lowStock.length + sinPrecio.length}</p>
            <p className="text-xs text-muted-foreground">requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(lowStock.length > 0 || sinPrecio.length > 0) && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-5 h-5" />
              Acciones Requeridas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sinPrecio.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-sm">{sinPrecio.length} productos sin precio</p>
                  <p className="text-xs text-muted-foreground">Agrega precios para poder vender</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/productos')}>
                  Revisar
                </Button>
              </div>
            )}
            {lowStock.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-sm">{lowStock.length} productos con bajo stock</p>
                  <p className="text-xs text-muted-foreground">Actualiza tu inventario</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/productos')}>
                  Ver Stock
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Productos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tus Productos</CardTitle>
              <CardDescription>Gestiona tu catálogo artesanal</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/productos')}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
              <Button size="sm" onClick={() => navigate('/productos/subir')}>
                <Package className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No tienes productos aún</p>
              <Button className="mt-4" onClick={() => navigate('/productos/subir')}>
                Subir tu primer producto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/productos/${product.id}`)}
                >
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  ) : (
                    <div className="w-full h-32 bg-muted rounded-md mb-2 flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <h4 className="font-medium text-sm mb-1 truncate">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    {product.price ? (
                      <p className="text-sm font-semibold text-primary">${product.price}</p>
                    ) : (
                      <Badge variant="outline" className="text-xs">Sin precio</Badge>
                    )}
                    {product.inventory !== undefined && (
                      <p className="text-xs text-muted-foreground">Stock: {product.inventory}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-auto py-4 justify-start"
          onClick={navigateToShop}
        >
          <Store className="w-5 h-5 mr-3" />
          <div className="text-left">
            <p className="font-semibold">Mi Espacio</p>
            <p className="text-xs text-muted-foreground">Administra tu tienda</p>
          </div>
        </Button>
        
        {shopSlug && (
          <Button 
            variant="outline" 
            className="h-auto py-4 justify-start"
            onClick={() => window.open(`/tienda/${shopSlug}`, '_blank')}
          >
            <Eye className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-semibold">Ver Vitrina</p>
              <p className="text-xs text-muted-foreground">Como te ven tus clientes</p>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
};
