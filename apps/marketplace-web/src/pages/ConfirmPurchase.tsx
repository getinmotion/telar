import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

interface Municipio {
  municipio: string;
  codigo: string;
}

interface CiudadesDane {
  [departamento: string]: Municipio[];
}

interface ShippingInfo {
  address: string;
  city: string;
  department: string;
  postal: string;
  description: string;
  daneCiudad: string;
}

export const ConfirmPurchase: React.FC = () => {
  const { items, totalPrice, totalItems, activeCartId, loading: cartLoading, hasGiftCards, getGiftCardItems, nonGiftCardTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { isLoading, createCheckoutLink, promo, getFinalTotal, applyPromoToOrder } = useCheckout();
  const navigate = useNavigate();
  
  // ALL useState hooks MUST be before any conditional returns
  const [ciudadesDane, setCiudadesDane] = useState<CiudadesDane>({});
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    phone: "",
  });

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: "",
    city: "",
    department: "",
    postal: "",
    description: "",
    daneCiudad: "",
  });

  // Sync user email when available
  useEffect(() => {
    if (user?.email && !personalInfo.email) {
      setPersonalInfo(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user?.email, personalInfo.email]);

  // Cargar JSON de ciudades
  useEffect(() => {
    fetch('/ciudades_dane.json')
      .then(res => res.json())
      .then((data: CiudadesDane) => {
        setCiudadesDane(data);
        setDepartamentos(Object.keys(data).sort());
      })
      .catch(err => console.error('Error loading ciudades_dane.json:', err));
  }, []);

  // Actualizar municipios cuando cambia el departamento
  useEffect(() => {
    if (selectedDepartment && ciudadesDane[selectedDepartment]) {
      setMunicipios(ciudadesDane[selectedDepartment].sort((a, b) => 
        a.municipio.localeCompare(b.municipio)
      ));
    } else {
      setMunicipios([]);
    }
  }, [selectedDepartment, ciudadesDane]);

  // Protección de ruta: requiere autenticación y carrito activo
  useEffect(() => {
    if (authLoading || cartLoading) return;

    if (!user) {
      toast.error('Debes iniciar sesión para continuar');
      navigate('/auth');
      return;
    }

    if (!activeCartId && !hasGiftCards) {
      toast.error('No tienes un carrito activo');
      navigate('/cart');
      return;
    }
  }, [user, activeCartId, authLoading, cartLoading, navigate, hasGiftCards]);

  // Mostrar loading mientras se verifica
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No renderizar si no cumple requisitos
  if (!user || (!activeCartId && !hasGiftCards)) {
    return null;
  }

  // Handler para selección de departamento
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setShippingInfo(prev => ({
      ...prev,
      department: value,
      city: "",
      daneCiudad: "",
    }));
  };

  // Handler para selección de municipio
  const handleMunicipioChange = (codigo: string) => {
    const municipio = municipios.find(m => m.codigo === codigo);
    if (municipio) {
      setShippingInfo(prev => ({
        ...prev,
        city: municipio.municipio,
        daneCiudad: municipio.codigo,
      }));
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(v);

  // El descuento solo aplica a productos físicos, luego sumamos gift cards
  const giftCardTotal = items
    .filter(item => item.isGiftCard)
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountedPhysicalTotal = getFinalTotal(nonGiftCardTotal);
  const finalTotal = discountedPhysicalTotal + giftCardTotal;
  const giftCardItems = getGiftCardItems();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeCartId && !hasGiftCards) {
      toast.error('No hay un carrito activo');
      return;
    }

    if (finalTotal <= 0) {
      toast.error('El carrito está vacío');
      return;
    }

    // Validar campos requeridos
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
      toast.error('Por favor completa la información personal');
      return;
    }

    // Solo validar envío si hay productos físicos (no solo gift cards)
    const hasPhysicalProducts = items.some(item => !item.isGiftCard);
    if (hasPhysicalProducts) {
      if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.department || 
          !shippingInfo.postal || !shippingInfo.description || !shippingInfo.daneCiudad) {
        toast.error('Por favor completa la información de envío');
        return;
      }
    }

    try {
      // Guardar datos de envío primero (solo si hay productos físicos)
      if (hasPhysicalProducts && activeCartId) {
        const { error: shippingError } = await supabase
          .from('shipping_data')
          .insert({
            cart_id: activeCartId,
            full_name: personalInfo.name,
            email: personalInfo.email,
            phone: personalInfo.phone,
            address: shippingInfo.address,
            dane_ciudad: parseInt(shippingInfo.daneCiudad),
            desc_ciudad: shippingInfo.city,
            desc_depart: shippingInfo.department,
            postal_code: shippingInfo.postal,
            desc_envio: shippingInfo.description,
          });

        if (shippingError) {
          console.error('Error saving shipping data:', shippingError);
          toast.error('Error al guardar datos de envío');
          return;
        }
      }

      // Si hay código promocional aplicado, aplicarlo al pedido (solo a productos físicos)
      if (promo && activeCartId) {
        await applyPromoToOrder(activeCartId, nonGiftCardTotal);
      }

      // Guardar cartId en sessionStorage para la página de payment-pending
      if (activeCartId) {
        sessionStorage.setItem('pendingPaymentCartId', activeCartId);
      }
      
      // También guardar info de gift cards si las hay
      if (giftCardItems.length > 0) {
        sessionStorage.setItem('pendingGiftCards', JSON.stringify({
          purchaser_email: personalInfo.email,
          items: giftCardItems.map(item => ({
            amount: item.giftCardAmount,
            quantity: item.quantity,
            recipient_email: item.recipientEmail,
            message: item.giftMessage
          }))
        }));
      }
      
      // Crear link de checkout y redirigir
      if (activeCartId) {
        await createCheckoutLink(activeCartId, totalPrice);
      }
      navigate('/payment-pending');
    } catch (error) {
      console.error('Error in checkout:', error);
      toast.error('Error al procesar el pago');
    }
  };

  const hasPhysicalProducts = items.some(item => !item.isGiftCard);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Confirmar compra</h1>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Mobile: Order summary first, Desktop: Forms first */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            
            {/* Order Summary - Mobile: First, Desktop: Third */}
            <div className="order-first lg:order-last lg:sticky lg:top-24 space-y-4">
              <Card className="h-fit">
                <CardHeader className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-medium">
                    Resumen del pedido ({totalItems})
                  </h2>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                  <div className="space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 items-center border-b border-border pb-3 last:border-0"
                      >
                        {item.isGiftCard ? (
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded flex items-center justify-center shrink-0">
                            <Gift className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          </div>
                        ) : (
                          <img
                            src={item.product.image_url || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-12 h-12 md:w-14 md:h-14 object-cover rounded shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs md:text-sm truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                          {item.recipientEmail && (
                            <p className="text-xs text-muted-foreground truncate">
                              Para: {item.recipientEmail}
                            </p>
                          )}
                        </div>
                        <p className="font-medium text-xs md:text-sm whitespace-nowrap">
                          {fmt(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal y descuentos */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{fmt(totalPrice)}</span>
                    </div>
                    
                    {promo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">
                          {promo.type === 'GIFTCARD' ? 'Gift Card' : 'Cupón'} ({promo.code})
                        </span>
                        <span className="text-green-600">-{fmt(promo.discountAmount)}</span>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between font-semibold text-base md:text-lg">
                      <span>Total</span>
                      <span>{fmt(finalTotal)}</span>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Cupón / Gift Card */}
              <PromoCodeInput cartTotal={nonGiftCardTotal} />

              {/* CTA Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `Confirmar y pagar ${fmt(finalTotal)}`
                )}
              </Button>
            </div>

            {/* Forms Column */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6 order-last lg:order-first">
              {/* Información Personal */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-medium">Información personal</h2>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={personalInfo.name}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, name: e.target.value })
                        }
                        placeholder="Juan Pérez"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, email: e.target.value })
                        }
                        placeholder="juan@ejemplo.com"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, phone: e.target.value })
                        }
                        placeholder="+57 300 123 4567"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de Envío - Solo si hay productos físicos */}
              {hasPhysicalProducts && (
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-medium">Información de envío</h2>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                          id="address"
                          value={shippingInfo.address}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, address: e.target.value })
                          }
                          placeholder="Calle 123 #45-67"
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Departamento</Label>
                        <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                          <SelectTrigger id="department" className="h-11">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {departamentos.map((dep) => (
                              <SelectItem key={dep} value={dep}>
                                {dep}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad / Municipio</Label>
                        <Select 
                          value={shippingInfo.daneCiudad} 
                          onValueChange={handleMunicipioChange}
                          disabled={!selectedDepartment}
                        >
                          <SelectTrigger id="city" className="h-11">
                            <SelectValue placeholder={selectedDepartment ? "Selecciona" : "Primero departamento"} />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {municipios.map((mun) => (
                              <SelectItem key={mun.codigo} value={mun.codigo}>
                                {mun.municipio}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal">Código postal</Label>
                        <Input
                          id="postal"
                          value={shippingInfo.postal}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, postal: e.target.value })
                          }
                          placeholder="110111"
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="description">Descripción del envío</Label>
                        <Input
                          id="description"
                          value={shippingInfo.description}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, description: e.target.value })
                          }
                          placeholder="Conjunto, Torre, Apto..."
                          required
                          className="h-11"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
