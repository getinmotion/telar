import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, MapPin, Store, Loader2 } from 'lucide-react';
import * as CartActions from '@/services/cart.actions';
import type { CartFull } from '@/types/cart.types';
import { toast } from 'sonner';

interface OrderDetailProps {
  cartId: string;
}

const OrderDetail = ({ cartId }: OrderDetailProps) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        setLoading(true);
        const cartData = await CartActions.getCartFull(cartId);
        setCart(cartData);
      } catch (error) {
        console.error('Error loading cart details:', error);
        toast.error('Error al cargar los detalles de la compra');
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cartId]);

  const handleBack = () => {
    navigate('/profile?tab=orders');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se pudo cargar la información de la compra</p>
        <Button className="mt-4" onClick={handleBack}>
          Volver a pedidos
        </Button>
      </div>
    );
  }

  // Calcular totales
  const subtotalProducts = cart.items.reduce(
    (sum, item) => sum + (parseFloat(item.unitPriceMinor) / 100 * item.quantity),
    0
  );

  const shippingCost = cart.shippingInfo
    ? parseFloat(cart.shippingInfo.valorTotalFleteMinor)
    : 0;

  const total = subtotalProducts + shippingCost;

  // Agrupar items por tienda
  const itemsByShop = cart.items.reduce((acc, item) => {
    const shopId = item.sellerShopId;
    if (!acc[shopId]) {
      acc[shopId] = {
        shop: item.sellerShop,
        items: []
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {} as Record<string, { shop: any; items: typeof cart.items }>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Detalle de la compra</h2>
          <p className="text-sm text-muted-foreground">
            Pedido #{cart.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Resumen de compra */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen de compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subtotal productos */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal productos</span>
                <span className="font-medium">${subtotalProducts.toLocaleString('es-CO')}</span>
              </div>

              {/* Costo de envío */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo de envío</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    `$${shippingCost.toLocaleString('es-CO')}`
                  )}
                </span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${total.toLocaleString('es-CO')}
                </span>
              </div>

              {/* Información adicional */}
              <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium">Fecha:</span>{' '}
                  {new Date(cart.createdAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Detalles de productos y envío */}
        <div className="lg:col-span-2 space-y-4">
          {/* Productos agrupados por tienda */}
          {Object.values(itemsByShop).map(({ shop, items }) => (
            <Card key={shop.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {shop.logoUrl ? (
                        <img
                          src={shop.logoUrl}
                          alt={shop.shopName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{shop.shopName}</h3>
                      {shop.location && (
                        <p className="text-sm text-muted-foreground truncate">{shop.location}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/tienda/${shop.shopSlug || shop.id}`)}
                  >
                    Ver tienda
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const primaryMedia = item.product.media.find(m => m.isPrimary);
                  const imageUrl = primaryMedia?.mediaUrl || item.product.media[0]?.mediaUrl;
                  const itemTotal = (parseFloat(item.unitPriceMinor) / 100) * item.quantity;

                  return (
                    <div key={item.id} className="flex gap-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="h-20 w-20 object-cover rounded"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-muted rounded flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.product.shortDescription}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity}
                          </span>
                          <span className="font-semibold">
                            ${itemTotal.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {/* Información de envío */}
          {cart.shippingInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Información de envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Destinatario:</span>{' '}
                  {cart.shippingInfo.fullName}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  {cart.shippingInfo.email}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span>{' '}
                  {cart.shippingInfo.phone}
                </div>
                <Separator />
                <div>
                  <span className="font-medium">Dirección:</span>{' '}
                  {cart.shippingInfo.address}
                </div>
                <div>
                  <span className="font-medium">Ciudad:</span>{' '}
                  {cart.shippingInfo.descCiudad}, {cart.shippingInfo.descDepart}
                </div>
                <div>
                  <span className="font-medium">Código postal:</span>{' '}
                  {cart.shippingInfo.postalCode}
                </div>
                <Separator />
                <div>
                  <span className="font-medium">Método de envío:</span>{' '}
                  {cart.shippingInfo.descEnvio}
                </div>
                {cart.shippingInfo.numGuia && (
                  <div>
                    <span className="font-medium">Número de guía:</span>{' '}
                    <span className="font-mono">{cart.shippingInfo.numGuia}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
