import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Package, Gift, Loader2, ShoppingBag, Home } from "lucide-react";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  notes: string | null;
}

export default function OrderConfirmed() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("No se encontró el ID de la orden");
        setLoading(false);
        return;
      }

      if (authLoading) return;

      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (orderError) {
          console.error("Error fetching order:", orderError);
          setError("Error al cargar la orden");
          setLoading(false);
          return;
        }

        if (!orderData) {
          setError("Orden no encontrada");
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId);

        if (!itemsError && itemsData) {
          setOrderItems(itemsData);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, authLoading, navigate]);

  const fmt = (v: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(v);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Orden no encontrada</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isGiftCardPayment = order?.payment_method === "gift_card";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              ¡Orden confirmada!
            </h1>
            <p className="text-muted-foreground">
              Tu pedido ha sido procesado exitosamente
            </p>
          </div>

          {/* Order Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Order ID */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Número de orden</span>
                <span className="font-mono text-sm">{order?.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <Separator className="my-4" />

              {/* Payment Method */}
              <div className="flex items-center gap-3 mb-4">
                {isGiftCardPayment ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Pagado con Gift Card</p>
                      <p className="text-sm text-muted-foreground">
                        Tu gift card cubrió el total de la compra
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Pago confirmado</p>
                      <p className="text-sm text-muted-foreground">
                        {order?.payment_method}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Productos</span>
                  <span>{orderItems.length} artículos</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold text-lg">
                    {order?.total === 0 ? (
                      <span className="text-green-600">$0 (Cubierto por Gift Card)</span>
                    ) : (
                      fmt(order?.total || 0)
                    )}
                  </span>
                </div>
              </div>

              {order?.notes && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">¿Qué sigue?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">1.</span>
                  <span>Recibirás un email de confirmación con los detalles de tu pedido.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">2.</span>
                  <span>Los artesanos prepararán tu pedido con mucho cuidado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">3.</span>
                  <span>Te notificaremos cuando tu pedido sea enviado con el número de seguimiento.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link to="/profile">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Ver mis pedidos
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
