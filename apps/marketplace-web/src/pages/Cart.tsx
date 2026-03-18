import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GuestAuthModal from "@/components/GuestAuthModal";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const {
    items,
    loading,
    removeFromCart,
    updateQuantity,
    totalPrice,
    totalItems,
    syncGuestCartToUser,
  } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleProceedToCheckout = async () => {
    setSyncing(true);
    try {
      await syncGuestCartToUser();
      navigate("/confirm-purchase");
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6">
            Agrega productos para comenzar tu compra
          </p>
          <Link to="/">
            <Button size="lg">Explorar Productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Tu Carrito ({totalItems} productos)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.product.image_url || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-lg font-bold text-primary mb-2">
                        ${item.product.price.toLocaleString("es-MX")}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Resumen de Compra</h2>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ${totalPrice.toLocaleString("es-MX")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium">Gratis</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ${totalPrice.toLocaleString("es-MX")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {user ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleProceedToCheckout}
                      disabled={syncing}
                    >
                      {syncing ? 'Sincronizando...' : 'Proceder al Pago'}
                    </Button>
                  ) : (
                    <>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => setGuestModalOpen(true)}
                      >
                        Continuar como invitado
                      </Button>
                      <Link to="/auth">
                        <Button variant="outline" className="w-full">
                          Iniciar sesión
                        </Button>
                      </Link>
                    </>
                  )}

                  <Link to="/">
                    <Button variant="ghost" className="w-full">
                      Seguir Comprando
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Guest Auth Modal */}
      <GuestAuthModal 
        isOpen={guestModalOpen} 
        onClose={() => setGuestModalOpen(false)}
        onSuccess={async () => {
          setGuestModalOpen(false);
          await handleProceedToCheckout();
        }}
      />
    </div>
  );
};

export default Cart;
