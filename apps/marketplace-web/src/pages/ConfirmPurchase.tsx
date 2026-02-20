import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PromoCodeInput } from "@/components/checkout/PromoCodeInput";
import { PromoValidationResult } from "@/hooks/usePromotions";
import { usePromotions } from "@/hooks/usePromotions";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Gift, Truck, MapPin } from "lucide-react";
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

interface ShippingQuote {
  shopId?: string;
  shop_id?: string;
  shopName?: string;
  originCity?: string;
  origin_city?: string;
  destinationCity?: string;
  shippingCost?: number;
  estimatedDays?: number;
  error?: string;
  response?: {
    ValorFlete?: number;
    [key: string]: any;
  };
  status?: number;
}

interface SavedAddress {
  id: string;
  label: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export const ConfirmPurchase: React.FC = () => {
  const { items, totalPrice, totalItems, activeCartId, loading: cartLoading, hasGiftCards, getGiftCardItems, nonGiftCardTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { isLoading, createCheckoutLink } = useCheckout();
  const { applyPromoCode } = usePromotions();
  const navigate = useNavigate();
  
  // Multiple promo codes state (up to 3)
  const [appliedPromos, setAppliedPromos] = useState<PromoValidationResult[]>([]);
  
  // ALL useState hooks MUST be before any conditional returns
  const [ciudadesDane, setCiudadesDane] = useState<CiudadesDane>({});
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  
  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  
  // Shipping service state
  const [selectedShippingService, setSelectedShippingService] = useState<string>("");
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(0);
  const [loadingShipping, setLoadingShipping] = useState<boolean>(false);
  
  // Delivery method state: 'shipping' or 'pickup'
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
  
  // Save address state
  const [saveNewAddress, setSaveNewAddress] = useState<boolean>(false);
  const [newAddressLabel, setNewAddressLabel] = useState<string>("");
  
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

  // Sync user data when available (email, name, phone from profile)
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      // Set email immediately
      if (user.email && !personalInfo.email) {
        setPersonalInfo(prev => ({ ...prev, email: user.email || "" }));
      }
      
      // Fetch user profile for name and phone
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle();
      
      setPersonalInfo(prev => ({
        ...prev,
        email: prev.email || user.email || "",
        name: prev.name || profile?.full_name || "",
        phone: prev.phone || profile?.phone || "",
      }));
    };
    
    loadUserData();
  }, [user?.id, user?.email]);

  // Load saved addresses
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (!error && data) {
        setSavedAddresses(data);
        // Auto-select default address if exists and form is empty
        const defaultAddress = data.find(a => a.is_default);
        if (defaultAddress && !shippingInfo.address) {
          handleAddressSelect(defaultAddress.id);
        }
      }
    };
    
    loadSavedAddresses();
  }, [user?.id]);

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

  // Fetch shipping quote when service is selected and city is filled
  useEffect(() => {
    const fetchShippingQuote = async () => {
      // Filter out gift cards - they don't need shipping
      const physicalItems = items.filter((item) => !item.isGiftCard);

      // Servientrega quote requires a real cart_id (the function reads cart items from backend)
      if (
        !selectedShippingService ||
        !shippingInfo.daneCiudad ||
        !activeCartId ||
        physicalItems.length === 0
      ) {
        setShippingQuotes([]);
        setShippingCost(0);
        return;
      }

      setLoadingShipping(true);
      try {
        const { data, error } = await supabase.functions.invoke("servientrega-function", {
          body: {
            cart_id: activeCartId,
            idCityDestino: shippingInfo.daneCiudad,
          },
        });

        if (error) {
          console.warn("Shipping quote unavailable:", error);
          setShippingQuotes([]);
          setShippingCost(0);
          return;
        }

        if (data?.success && Array.isArray(data.quotes)) {
          setShippingQuotes(data.quotes);
          // Use totalShipping from response, or calculate from individual quotes
          const total = data.totalShipping ?? data.quotes.reduce(
            (sum: number, quote: ShippingQuote) => sum + (quote.shippingCost || quote.response?.ValorFlete || 0),
            0
          );
          setShippingCost(total);
          // Get max estimated days from all quotes
          const maxDays = Math.max(...data.quotes.map((q: ShippingQuote) => q.estimatedDays || 0));
          setEstimatedDays(maxDays || 5);
          
                          // Store detailed shipping costs in localStorage
                          // Note: servientrega-function returns rawResponse, not response
                          const totalValorFlete = data.quotes.reduce(
                            (sum: number, q: any) => sum + (q.rawResponse?.ValorFlete || 0), 0
                          );
                          const totalValorSobreFlete = data.quotes.reduce(
                            (sum: number, q: any) => sum + (q.rawResponse?.ValorSobreFlete || 0), 0
                          );
                          const totalValorTotal = data.quotes.reduce(
                            (sum: number, q: any) => sum + (q.rawResponse?.ValorTotal || 0), 0
                          );
          localStorage.setItem('pending_shipping_costs', JSON.stringify({
            valor_flete: totalValorFlete,
            valor_sobre_flete: totalValorSobreFlete,
            valor_total_flete: totalValorTotal,
          }));
        } else {
          console.warn("Shipping quote unavailable:", data?.error || data);
          setShippingQuotes([]);
          setShippingCost(0);
          setEstimatedDays(0);
        }
      } catch (error) {
        setShippingQuotes([]);
        setShippingCost(0);
        setEstimatedDays(0);
        localStorage.removeItem('pending_shipping_costs');
      } finally {
        setLoadingShipping(false);
      }
    };

    fetchShippingQuote();
  }, [selectedShippingService, shippingInfo.daneCiudad, activeCartId, items]);

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
    setSelectedAddressId("_new"); // Clear saved address selection when manually changing
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

  // Handler for saved address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    
    if (addressId === "_new") {
      // Clear form for new address
      setShippingInfo({
        address: "",
        city: "",
        department: "",
        postal: "",
        description: "",
        daneCiudad: "",
      });
      setSelectedDepartment("");
      return;
    }
    
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      // Only fill shipping fields, NOT personal info (name/phone come from user profile)
      setSelectedDepartment(address.state);
      
      // Find DANE code for the city - need to search in ciudadesDane
      let daneCiudad = "";
      if (ciudadesDane[address.state]) {
        const municipio = ciudadesDane[address.state].find(
          m => m.municipio.toLowerCase() === address.city.toLowerCase()
        );
        if (municipio) {
          daneCiudad = municipio.codigo;
        }
      }
      
      setShippingInfo({
        address: address.street_address,
        city: address.city,
        department: address.state,
        postal: address.postal_code,
        description: "",
        daneCiudad: daneCiudad,
      });
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(v);

  // El descuento solo aplica a productos físicos, luego sumamos gift cards y envío
  const giftCardTotal = items
    .filter(item => item.isGiftCard)
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalDiscount = appliedPromos.reduce((sum, promo) => sum + promo.discount_amount, 0);
  const discountedPhysicalTotal = nonGiftCardTotal - totalDiscount;
  
  // Shipping cost is 0 when pickup is selected
  const effectiveShippingCost = deliveryMethod === 'pickup' ? 0 : shippingCost;
  const finalTotal = discountedPhysicalTotal + giftCardTotal + effectiveShippingCost;
  const giftCardItems = getGiftCardItems();
  
  // Check if all physical products allow pickup
  const physicalItems = items.filter(item => !item.isGiftCard);
  const allProductsAllowPickup = physicalItems.length > 0 && 
    physicalItems.every(item => item.product.allows_local_pickup === true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeCartId && !hasGiftCards) {
      toast.error('No hay un carrito activo');
      return;
    }

    // Only check for empty cart, not zero total (gift card can cover 100%)
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    // Validar campos requeridos
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
      toast.error('Por favor completa la información personal');
      return;
    }

    // Solo validar envío si hay productos físicos Y se eligió envío (no pickup)
    const hasPhysicalProducts = items.some(item => !item.isGiftCard);
    if (hasPhysicalProducts && deliveryMethod === 'shipping') {
      if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.department || 
          !shippingInfo.postal || !shippingInfo.description || !shippingInfo.daneCiudad) {
        toast.error('Por favor completa la información de envío');
        return;
      }
    }

    try {
      // Guardar teléfono en el perfil del usuario si está logueado
      if (user?.id && personalInfo.phone) {
        await supabase
          .from('user_profiles')
          .update({ phone: personalInfo.phone })
          .eq('id', user.id);
      }

      // Guardar datos de envío primero (solo si hay productos físicos Y se eligió envío)
      if (hasPhysicalProducts && activeCartId && deliveryMethod === 'shipping') {
        // Retrieve shipping costs from localStorage
        const pendingShippingCosts = localStorage.getItem('pending_shipping_costs');
        const shippingCosts = pendingShippingCosts ? JSON.parse(pendingShippingCosts) : {};
        
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
            valor_flete: shippingCosts.valor_flete || null,
            valor_sobre_flete: shippingCosts.valor_sobre_flete || null,
            valor_total_flete: shippingCosts.valor_total_flete || null,
          });

        if (shippingError) {
          console.error('Error saving shipping data:', shippingError);
          toast.error('Error al guardar datos de envío');
          return;
        }

        // Save new address if user opted in
        if (saveNewAddress && newAddressLabel && user?.id) {
          const { error: addressError } = await supabase
            .from('addresses')
            .insert({
              user_id: user.id,
              label: newAddressLabel,
              street_address: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.department,
              postal_code: shippingInfo.postal,
              is_default: savedAddresses.length === 0, // Make default if first address
            });

          if (addressError) {
            console.error('Error saving address:', addressError);
            // Don't block checkout, just log the error
          } else {
            toast.success('Dirección guardada para futuras compras');
          }
        }
      }

      // Si hay códigos promocionales aplicados Y el finalTotal > 0, aplicarlos aquí
      // Si finalTotal === 0, el process-zero-payment aplicará el descuento con el order_id real
      if (appliedPromos.length > 0 && activeCartId && finalTotal > 0) {
        // Aplicar cada código secuencialmente con el total restante
        let remainingTotal = nonGiftCardTotal;
        for (const promo of appliedPromos) {
          if (promo.code) {
            await applyPromoCode(promo.code, activeCartId, remainingTotal, user?.id, personalInfo.email);
            remainingTotal -= promo.discount_amount;
          }
        }
      }

      // Crear link de checkout y continuar solo si fue exitoso
      if (!activeCartId) {
        toast.error('No hay un carrito activo');
        return;
      }

      // If total is 0 (fully covered by gift card), use process-zero-payment
      if (finalTotal === 0) {
        console.log('Total is $0, using process-zero-payment');
        
        const { data, error } = await supabase.functions.invoke('process-zero-payment', {
          body: {
            cart_id: activeCartId,
            user_id: user.id,
            promo_code: appliedPromos.length > 0 ? appliedPromos[0].code : null,
            shipping_data: deliveryMethod === 'shipping' ? {
              full_name: personalInfo.name,
              email: personalInfo.email,
              phone: personalInfo.phone,
              address: shippingInfo.address,
              city: shippingInfo.city,
              department: shippingInfo.department,
              postal: shippingInfo.postal,
              daneCiudad: shippingInfo.daneCiudad,
              description: shippingInfo.description,
            } : null,
            is_pickup: deliveryMethod === 'pickup',
            personal_info: {
              name: personalInfo.name,
              email: personalInfo.email,
              phone: personalInfo.phone,
            },
            gift_card_items: giftCardItems.length > 0 ? giftCardItems.map(item => ({
              amount: item.giftCardAmount,
              quantity: item.quantity,
              recipient_email: item.recipientEmail || null,
              message: item.giftMessage || null,
            })) : null,
          }
        });

        if (error) {
          console.error('Error processing zero payment:', error);
          toast.error('Error al procesar la orden');
          return;
        }

        toast.success('¡Orden creada exitosamente!');
        navigate(`/order-confirmed/${data.order_id}`);
        return;
      }

      // Normal payment flow with Cobre
      const checkoutOk = await createCheckoutLink(activeCartId, finalTotal);
      if (!checkoutOk) return;

      // Guardar cartId y breakdown en sessionStorage para sync-payment-status
      sessionStorage.setItem('pendingPaymentCartId', activeCartId);
      
      // Guardar breakdown para que sync-payment-status lo use al crear la orden
      const paymentBreakdown = {
        subtotal: nonGiftCardTotal,
        shipping_cost: effectiveShippingCost,
        gift_card_discount: totalDiscount,
        gift_card_code: appliedPromos.length > 0 ? appliedPromos[0].code : null,
        paid_amount: finalTotal,
        delivery_method: deliveryMethod,
      };
      sessionStorage.setItem('pendingPaymentBreakdown', JSON.stringify(paymentBreakdown));

      // Guardar gift cards en la base de datos para procesamiento backend resiliente
      if (giftCardItems.length > 0 && user?.id) {
        const giftCardData = {
          cart_id: activeCartId,
          user_id: user.id,
          purchaser_email: personalInfo.email,
          items: giftCardItems.map(item => ({
            amount: item.giftCardAmount,
            quantity: item.quantity,
            recipient_email: item.recipientEmail || null,
            message: item.giftMessage || null
          }))
        };

        // Upsert to handle retries - replace existing if cart_id already exists
        const { error: giftCardError } = await supabase
          .from('pending_gift_card_orders')
          .upsert(giftCardData, { onConflict: 'cart_id' });

        if (giftCardError) {
          console.error('Error saving pending gift cards:', giftCardError);
          // Also save to sessionStorage as fallback
          sessionStorage.setItem('pendingGiftCards', JSON.stringify({
            purchaser_email: personalInfo.email,
            items: giftCardData.items
          }));
        } else {
          console.log('Pending gift cards saved to database for cart:', activeCartId);
          // Clear sessionStorage since DB is the source of truth now
          sessionStorage.removeItem('pendingGiftCards');
        }
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

      <div className="container mx-auto px-4 py-6 md:py-8 pb-28 lg:pb-8">
        <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Confirmar compra</h1>

        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
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
                    
                    {appliedPromos.length > 0 && appliedPromos.map((promo) => (
                      <div key={promo.code} className="flex justify-between text-sm">
                        <span className="text-green-600">
                          {promo.type === 'gift_card' ? 'Gift Card' : 'Cupón'} ({promo.code})
                        </span>
                        <span className="text-green-600">-{fmt(promo.discount_amount)}</span>
                      </div>
                    ))}

                    {/* Shipping/Pickup cost */}
                    <div className="flex justify-between text-sm">
                      {deliveryMethod === 'pickup' ? (
                        <>
                          <span className="text-green-600 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            Retiro en local
                          </span>
                          <span className="text-green-600 font-medium">$0</span>
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5" />
                            Valor envío
                          </span>
                          {loadingShipping ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : shippingCost > 0 ? (
                            <span>{fmt(shippingCost)}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Selecciona servicio</span>
                          )}
                        </>
                      )}
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between font-semibold text-base md:text-lg">
                      <span>Total</span>
                      <span>{fmt(finalTotal)}</span>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Cupón / Gift Card */}
              <PromoCodeInput 
                cartTotal={nonGiftCardTotal} 
                hasOnlyGiftCards={hasGiftCards && nonGiftCardTotal === 0}
                userId={user?.id}
                userEmail={personalInfo.email}
                onPromosChanged={setAppliedPromos}
                appliedPromos={appliedPromos}
              />

              {/* CTA Button - Desktop only */}
              <Button 
                type="submit" 
                className="hidden lg:flex w-full h-12 text-base" 
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
                <>
                {/* Delivery Method Selection - Only show if all products allow pickup */}
                {allProductsAllowPickup && (
                  <Card>
                    <CardHeader className="p-4 md:p-6">
                      <h2 className="text-base md:text-lg font-medium">Método de entrega</h2>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                      <RadioGroup 
                        value={deliveryMethod} 
                        onValueChange={(v) => setDeliveryMethod(v as 'shipping' | 'pickup')}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value="shipping" id="shipping-method" />
                          <Label htmlFor="shipping-method" className="flex-1 cursor-pointer">
                            <div className="font-medium flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Envío a domicilio
                            </div>
                            <div className="text-sm text-muted-foreground">Recibe tu pedido en la dirección que indiques</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer bg-green-50 border-green-200">
                          <RadioGroupItem value="pickup" id="pickup-method" />
                          <Label htmlFor="pickup-method" className="flex-1 cursor-pointer">
                            <div className="font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Retiro en local
                              <Badge className="bg-green-600 text-white">Sin costo de envío</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">Recoge tu pedido directamente en el taller del artesano</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                )}

                {/* Address Selection Card - Only show if shipping method is selected */}
                {deliveryMethod === 'shipping' && (
                <>
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-medium">Dirección de envío</h2>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    {/* Selection dropdown - always show */}
                    <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="¿Cómo deseas ingresar la dirección?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_new">Ingresar nueva dirección</SelectItem>
                        {savedAddresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>
                            {addr.label} - {addr.street_address}, {addr.city}
                            {addr.is_default && " ★"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Show form only after selection */}
                    {selectedAddressId && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
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

                        {/* Save address option - only for new addresses */}
                        {selectedAddressId === "_new" && user?.id && (
                          <div className="sm:col-span-2 pt-2 border-t border-border space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="save-address"
                                checked={saveNewAddress}
                                onCheckedChange={(checked) => setSaveNewAddress(checked === true)}
                              />
                              <Label htmlFor="save-address" className="text-sm font-normal cursor-pointer">
                                Guardar esta dirección para compras futuras
                              </Label>
                            </div>
                            {saveNewAddress && (
                              <div className="space-y-2">
                                <Label htmlFor="address-label">Nombre de la dirección</Label>
                                <Select value={newAddressLabel} onValueChange={setNewAddressLabel}>
                                  <SelectTrigger id="address-label" className="h-11">
                                    <SelectValue placeholder="Selecciona o escribe un nombre" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Casa">Casa</SelectItem>
                                    <SelectItem value="Oficina">Oficina</SelectItem>
                                    <SelectItem value="Trabajo">Trabajo</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping Service Selection */}
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-medium flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Seleccionar servicio de envío
                    </h2>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-service">Servicio de envío</Label>
                      <Select 
                        value={selectedShippingService} 
                        onValueChange={setSelectedShippingService}
                        disabled={!shippingInfo.daneCiudad}
                      >
                        <SelectTrigger id="shipping-service" className="h-11">
                          <SelectValue placeholder={shippingInfo.daneCiudad ? "Selecciona un servicio" : "Completa la dirección primero"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="servientrega">Servientrega</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quote result info */}
                    {loadingShipping && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Consultando tarifa de envío...
                      </div>
                    )}

                    {!loadingShipping && shippingCost > 0 && (
                      <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">Cotización de envío</p>
                          <p className="text-lg font-semibold text-primary">{fmt(shippingCost)}</p>
                        </div>
                        {estimatedDays > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Tiempo estimado: <span className="font-medium text-foreground">{estimatedDays} días hábiles</span>
                          </p>
                        )}
                        {shippingQuotes.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            Incluye envío desde {shippingQuotes.length} tiendas
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                </>
                )}
              </>
              )}


            </div>
          </div>
        </form>
      </div>

      {/* Mobile: Fixed CTA at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:hidden z-50">
        <Button 
          type="submit"
          form="checkout-form"
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
    </div>
  );
};
