import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/ShoppingCartContext';
import { CheckoutFormData, ShippingOption } from '@/types/cart';
import { ArrowLeft, CreditCard, Truck, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const shippingOptions: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Envío Estándar',
    description: '5-7 días hábiles',
    price: 15000,
    estimatedDays: '5-7 días'
  },
  {
    id: 'express',
    name: 'Envío Express',
    description: '2-3 días hábiles',
    price: 25000,
    estimatedDays: '2-3 días'
  },
  {
    id: 'same-day',
    name: 'Envío Mismo Día',
    description: 'Solo Bogotá',
    price: 35000,
    estimatedDays: 'Hoy'
  }
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, summary, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    customer: {
      name: '',
      email: '',
      phone: '',
    },
    shipping: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Colombia',
    },
    billing: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Colombia',
      sameAsShipping: true,
    },
    shippingMethod: 'standard',
    paymentMethod: 'cash',
    notes: '',
  });

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const selectedShipping = shippingOptions.find(opt => opt.id === formData.shippingMethod);
  const totalWithShipping = summary.total + (selectedShipping?.price || 0);

  const handleInputChange = (section: keyof CheckoutFormData | '', field: string, value: any) => {
    if (section === '') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* ========================================
       * 🔌 PAYMENT GATEWAY INTEGRATION POINT
       * ========================================
       * 
       * To integrate with a payment gateway (Stripe, Wompi, PayU, etc.):
       * 
       * 1. Uncomment and modify this section based on your gateway
       * 2. Replace the payment flow below with your gateway's API calls
       * 
       * Example structure for gateway integration:
       * 
       * const paymentData = {
       *   amount: totalWithShipping,
       *   currency: 'COP',
       *   customer: {
       *     name: formData.customer.name,
       *     email: formData.customer.email,
       *     phone: formData.customer.phone,
       *   },
       *   items: cartItems.map(item => ({
       *     id: item.product_id,
       *     name: item.product?.name,
       *     quantity: item.quantity,
       *     price: item.price,
       *   })),
       *   metadata: {
       *     shipping: formData.shipping,
       *     notes: formData.notes,
       *   }
       * };
       * 
       * // Call your payment gateway API
       * const paymentResponse = await fetch('/api/create-payment', {
       *   method: 'POST',
       *   body: JSON.stringify(paymentData),
       * });
       * 
       * if (paymentResponse.ok) {
       *   const { paymentUrl } = await paymentResponse.json();
       *   window.location.href = paymentUrl; // Redirect to gateway
       * }
       * 
       * ======================================== */

      // Create order in database
      const orderData = {
        customer_name: formData.customer.name,
        customer_email: formData.customer.email,
        customer_phone: formData.customer.phone,
        shipping_address: formData.billing.sameAsShipping ? formData.shipping : formData.billing,
        billing_address: formData.billing.sameAsShipping ? formData.shipping : formData.billing,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product_name: item.product?.name || '',
        })),
        subtotal: summary.subtotal,
        tax: summary.tax,
        shipping_cost: selectedShipping?.price || 0,
        total: totalWithShipping,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
        shop_id: cartItems[0]?.product?.shop_id || '',
        order_number: `ORD-${Date.now()}`,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      // Clear cart
      await clearCart();

      toast.success('¡Pedido creado exitosamente!');
      navigate(`/order-confirmation/${data.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <Button onClick={() => navigate('/tienda')}>
            Explorar Productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Finalizar Compra</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.customer.name}
                    onChange={(e) => handleInputChange('customer', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.customer.email}
                    onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    required
                    value={formData.customer.phone}
                    onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    required
                    value={formData.shipping.address}
                    onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      required
                      value={formData.shipping.city}
                      onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Departamento *</Label>
                    <Input
                      id="state"
                      required
                      value={formData.shipping.state}
                      onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    value={formData.shipping.zipCode}
                    onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Método de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.shippingMethod}
                  onValueChange={(value) => handleInputChange('', 'shippingMethod', value)}
                >
                  {shippingOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover-glow">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{option.name}</p>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                          <span className="font-semibold">{formatPrice(option.price)}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('', 'paymentMethod', value)}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover-glow">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Pago Contra Entrega</p>
                        <p className="text-sm text-muted-foreground">Paga cuando recibas tu pedido</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover-glow opacity-50">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Tarjeta de Crédito/Débito</p>
                        <p className="text-sm text-muted-foreground">Próximamente disponible</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Notas del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Instrucciones especiales para la entrega..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('', 'notes', e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product?.images?.[0] || '/placeholder.svg'}
                      alt={item.product?.name || ''}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%)</span>
                    <span>{formatPrice(summary.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{formatPrice(selectedShipping?.price || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalWithShipping)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al confirmar tu pedido aceptas nuestros{' '}
                  <Link to="/terminos" className="underline hover:text-primary">términos y condiciones</Link>
                  {' '}y{' '}
                  <Link to="/privacidad" className="underline hover:text-primary">política de privacidad</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};