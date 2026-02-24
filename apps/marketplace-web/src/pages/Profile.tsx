import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as ProductsActions from '@/services/products.actions';
import * as AddressesActions from '@/services/addresses.actions';
import * as UserProfilesActions from '@/services/user-profiles.actions';
import * as GiftCardsActions from '@/services/gift-cards.actions';
import * as OrdersActions from '@/services/orders.actions';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, MapPin, Package, User, Plus, Trash2, Star, CreditCard, Gift, Pencil, ChevronDown, Truck, Clock, CheckCircle2, XCircle, AlertCircle, Wallet, Banknote } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/currencyUtils';

interface UserProfile {
  id: string;
  full_name: string | null;
  user_type: string;
}

interface Address {
  id: string;
  label: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
  product_image?: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  payment_method: string;
  notes: string | null;
  tracking_number: string | null;
  carrier: string | null;
  shipped_at: string | null;
  estimated_delivery_date: string | null;
  shipping_address_id: string | null;
  // New breakdown fields
  subtotal: number | null;
  shipping_cost: number | null;
  gift_card_discount: number | null;
  gift_card_code: string | null;
  delivery_method: string | null;
  paid_amount: number | null;
  order_items: OrderItem[];
}

interface GiftCard {
  id: string;
  code: string;
  masked_code: string;
  original_amount: number;
  remaining_amount: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  is_owner: boolean;
  is_recipient: boolean;
}

interface Municipio {
  municipio: string;
  codigo: string;
}

interface CiudadesDane {
  [departamento: string]: Municipio[];
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  
  // Add/Edit Address Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [ciudadesDane, setCiudadesDane] = useState<CiudadesDane>({});
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [addressForm, setAddressForm] = useState({
    label: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadAddresses();
      loadOrders();
      loadGiftCards();
    }
  }, [user]);

  // Load ciudades_dane.json for address form
  useEffect(() => {
    fetch('/ciudades_dane.json')
      .then(res => res.json())
      .then((data: CiudadesDane) => {
        setCiudadesDane(data);
        setDepartamentos(Object.keys(data).sort());
      })
      .catch(err => console.error('Error loading ciudades_dane.json:', err));
  }, []);

  // Update municipios when department changes
  useEffect(() => {
    if (selectedDepartment && ciudadesDane[selectedDepartment]) {
      setMunicipios(ciudadesDane[selectedDepartment].sort((a, b) => 
        a.municipio.localeCompare(b.municipio)
      ));
    } else {
      setMunicipios([]);
    }
  }, [selectedDepartment, ciudadesDane]);

  const loadProfileData = async () => {
    try {
      const profileData = await UserProfilesActions.getUserProfileByUserId(user!.id);

      // Map camelCase to snake_case for local state
      setProfile({
        id: profileData.id,
        full_name: profileData.fullName,
        user_type: profileData.userType,
      });
      setFullName(profileData.fullName || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const addressesData = await AddressesActions.getUserAddresses(user!.id);

      // Map camelCase to snake_case for local state
      const mappedAddresses = addressesData.map(addr => ({
        id: addr.id,
        label: addr.label,
        street_address: addr.streetAddress,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postalCode,
        country: addr.country,
        is_default: addr.isDefault,
      }));

      setAddresses(mappedAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const loadOrders = async () => {
    try {
      // Fetch orders from backend with items
      const backendOrders = await OrdersActions.getBuyerOrdersWithItems(user!.id);

      if (!backendOrders || backendOrders.length === 0) {
        setOrders([]);
        return;
      }

      // Get all unique product IDs from order items
      const productIds = [...new Set(
        backendOrders.flatMap(order =>
          (order.orderItems || []).map(item => item.productId)
        )
      )].filter(Boolean);

      // Fetch product details from products service if there are products
      let productMap: Record<string, { name: string; image_url: string }> = {};
      if (productIds.length > 0) {
        const productPromises = productIds.map(id =>
          ProductsActions.getProductById(id).catch(() => null)
        );
        const products = await Promise.all(productPromises);

        productMap = Object.fromEntries(
          products
            .filter(p => p !== null)
            .map(p => [
              p!.id,
              {
                name: p!.name,
                image_url: p!.imageUrl || p!.images?.[0] || ''
              }
            ])
        );
      }

      // Map backend orders to frontend Order interface
      const ordersWithProducts: Order[] = backendOrders.map(order => ({
        id: order.id,
        status: order.status,
        total: OrdersActions.minorToMajor(order.grossSubtotalMinor),
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        payment_method: order.checkout.paymentMethod || 'mercadopago',
        notes: order.checkout.notes || null,
        tracking_number: order.trackingNumber || null,
        carrier: order.carrier || null,
        shipped_at: order.shippedAt || null,
        estimated_delivery_date: order.estimatedDeliveryDate || null,
        shipping_address_id: order.checkout.shippingAddressId || null,
        subtotal: OrdersActions.minorToMajor(order.grossSubtotalMinor),
        shipping_cost: OrdersActions.minorToMajor(order.checkout.shippingCost),
        gift_card_discount: OrdersActions.minorToMajor(order.checkout.giftCardDiscount),
        gift_card_code: order.checkout.giftCardCode || null,
        delivery_method: order.checkout.deliveryMethod || null,
        paid_amount: OrdersActions.minorToMajor(order.checkout.paidAmount),
        order_items: (order.orderItems || []).map(item => ({
          id: item.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: OrdersActions.minorToMajor(item.unitPriceMinor),
          product_name: productMap[item.productId]?.name || 'Producto',
          product_image: productMap[item.productId]?.image_url,
        })),
      }));

      setOrders(ordersWithProducts);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar órdenes');
    }
  };

  const loadGiftCards = async () => {
    if (!user?.email) return;

    setLoadingGiftCards(true);
    try {
      const giftCardsData = await GiftCardsActions.getUserGiftCards(user.email);

      // Map camelCase backend response to snake_case frontend interface
      const mappedGiftCards = giftCardsData.map(gc => ({
        id: gc.id,
        code: gc.code,
        masked_code: GiftCardsActions.maskGiftCardCode(gc.code),
        original_amount: parseFloat(gc.originalAmount || gc.initialAmount),
        remaining_amount: parseFloat(gc.remainingAmount),
        is_active: gc.isActive,
        expires_at: gc.expiresAt || gc.expirationDate,
        created_at: gc.createdAt,
        // Determine if user is owner (purchaser) or recipient
        is_owner: gc.purchaserEmail === user.email,
        is_recipient: gc.recipientEmail === user.email,
      }));

      setGiftCards(mappedGiftCards);
    } catch (error) {
      console.error('Error loading gift cards:', error);
      toast.error('Error al cargar gift cards');
    } finally {
      setLoadingGiftCards(false);
    }
  };

  const updateProfile = async () => {
    try {
      if (!profile?.id) {
        toast.error('Perfil no cargado');
        return;
      }

      await UserProfilesActions.updateUserProfile(profile.id, {
        fullName: fullName,
      });

      toast.success('Perfil actualizado');
      setEditingProfile(false);
      loadProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar perfil');
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await AddressesActions.deleteAddress(addressId);

      toast.success('Dirección eliminada');
      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error al eliminar dirección');
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      await AddressesActions.setDefaultAddress(addressId);

      toast.success('Dirección predeterminada actualizada');
      loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Error al actualizar dirección predeterminada');
    }
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setAddressForm(prev => ({
      ...prev,
      state: value,
      city: '',
    }));
  };

  const handleMunicipioChange = (codigo: string) => {
    const municipio = municipios.find(m => m.codigo === codigo);
    if (municipio) {
      setAddressForm(prev => ({
        ...prev,
        city: municipio.municipio,
      }));
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: '',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      is_default: false,
    });
    setSelectedDepartment('');
    setEditingAddressId(null);
  };

  const openEditAddressModal = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      is_default: address.is_default,
    });
    setSelectedDepartment(address.state);
    setShowAddressModal(true);
  };

  const openNewAddressModal = () => {
    resetAddressForm();
    setShowAddressModal(true);
  };

  const saveAddress = async () => {
    if (!user?.id) return;

    if (!addressForm.label || !addressForm.street_address ||
        !addressForm.city || !addressForm.state || !addressForm.postal_code) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setSavingAddress(true);
    try {
      if (editingAddressId) {
        // Update existing address
        await AddressesActions.updateAddress(editingAddressId, {
          label: addressForm.label,
          streetAddress: addressForm.street_address,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postal_code,
          isDefault: addressForm.is_default,
        });

        // If setting as default, call the set-default endpoint
        if (addressForm.is_default) {
          await AddressesActions.setDefaultAddress(editingAddressId);
        }

        toast.success('Dirección actualizada');
      } else {
        // Create new address
        const newAddress = await AddressesActions.createAddress({
          userId: user.id,
          label: addressForm.label,
          streetAddress: addressForm.street_address,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postal_code,
          country: 'Colombia',
          isDefault: addressForm.is_default,
        });

        // If setting as default, call the set-default endpoint
        if (addressForm.is_default) {
          await AddressesActions.setDefaultAddress(newAddress.id);
        }

        toast.success('Dirección guardada');
      }

      setShowAddressModal(false);
      resetAddressForm();
      loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error al guardar dirección');
    } finally {
      setSavingAddress(false);
    }
  };

  const statusConfig: Record<string, { 
    label: string; 
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    explanation: string;
  }> = {
    pending: { 
      label: 'Pendiente', 
      variant: 'outline',
      icon: <Clock className="h-4 w-4" />,
      explanation: 'Esperando confirmación de pago. Si ya pagaste, puede tomar unos minutos en reflejarse.'
    },
    confirmed: { 
      label: 'Confirmado', 
      variant: 'default',
      icon: <CheckCircle2 className="h-4 w-4" />,
      explanation: 'Pago recibido exitosamente. Estamos preparando tu pedido para envío.'
    },
    processing: { 
      label: 'Procesando', 
      variant: 'secondary',
      icon: <Package className="h-4 w-4" />,
      explanation: 'Tu pedido está siendo empacado por el artesano con mucho cuidado.'
    },
    shipped: { 
      label: 'Enviado', 
      variant: 'default',
      icon: <Truck className="h-4 w-4" />,
      explanation: '¡Tu pedido va en camino! Revisa el número de seguimiento para rastrearlo.'
    },
    delivered: { 
      label: 'Entregado', 
      variant: 'default',
      icon: <CheckCircle2 className="h-4 w-4" />,
      explanation: 'Pedido entregado exitosamente. ¡Esperamos que lo disfrutes!'
    },
    cancelled: { 
      label: 'Cancelado', 
      variant: 'destructive',
      icon: <XCircle className="h-4 w-4" />,
      explanation: 'Este pedido fue cancelado y no será procesado.'
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodInfo = (method: string) => {
    const methodMap: Record<string, { label: string; icon: React.ReactNode }> = {
      credit_card: { label: 'Tarjeta de crédito', icon: <CreditCard className="h-4 w-4" /> },
      debit_card: { label: 'Tarjeta débito', icon: <CreditCard className="h-4 w-4" /> },
      pse: { label: 'PSE', icon: <Banknote className="h-4 w-4" /> },
      nequi: { label: 'Nequi', icon: <Wallet className="h-4 w-4" /> },
      gift_card: { label: 'Gift Card', icon: <Gift className="h-4 w-4" /> },
      cash_on_delivery: { label: 'Pago contraentrega', icon: <Banknote className="h-4 w-4" /> },
    };
    return methodMap[method] || { label: method, icon: <Wallet className="h-4 w-4" /> };
  };

  const getGiftCardStatus = (card: GiftCard) => {
    if (!card.is_active) {
      return <Badge variant="destructive">Inactiva</Badge>;
    }
    if (card.remaining_amount <= 0) {
      return <Badge variant="secondary">Agotada</Badge>;
    }
    if (card.expires_at && new Date(card.expires_at) < new Date()) {
      return <Badge variant="destructive">Expirada</Badge>;
    }
    return <Badge variant="default">Activa</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Mi Perfil</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gestiona tu información y pedidos</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
          {/* Tabs responsivos: scroll horizontal en móvil, grid en desktop */}
          <TabsList className="flex w-full overflow-x-auto gap-1 p-1 md:grid md:grid-cols-4 md:max-w-lg md:overflow-visible">
            <TabsTrigger value="profile" className="flex-shrink-0 min-w-[80px] md:min-w-0 px-3 py-2 touch-manipulation">
              <User className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-shrink-0 min-w-[80px] md:min-w-0 px-3 py-2 touch-manipulation">
              <Package className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex-shrink-0 min-w-[80px] md:min-w-0 px-3 py-2 touch-manipulation">
              <MapPin className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Direcciones</span>
            </TabsTrigger>
            <TabsTrigger value="giftcards" className="flex-shrink-0 min-w-[80px] md:min-w-0 px-3 py-2 touch-manipulation">
              <CreditCard className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Gift Cards</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!editingProfile}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Usuario</Label>
                  <Input value={profile?.user_type === 'guest' ? 'Invitado' : 'Cliente'} disabled />
                </div>

                <div className="flex gap-2">
                  {editingProfile ? (
                    <>
                      <Button onClick={updateProfile}>Guardar Cambios</Button>
                      <Button variant="outline" onClick={() => {
                        setEditingProfile(false);
                        setFullName(profile?.full_name || '');
                      }}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditingProfile(true)}>Editar Perfil</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tienes pedidos aún</p>
                    <Button className="mt-4" onClick={() => navigate('/productos')}>
                      Explorar Productos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
              orders.map((order) => {
                  const paymentInfo = getPaymentMethodInfo(order.payment_method);
                  const statusInfo = statusConfig[order.status] || statusConfig.pending;
                  
                  return (
                    <Card key={order.id}>
                      <CardHeader className="pb-3 px-4 md:px-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <CardTitle className="text-base md:text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                            <CardDescription className="text-xs md:text-sm">
                              {new Date(order.created_at).toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardDescription>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        {/* Status explanation */}
                        <div className="mt-2 flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                          <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{statusInfo.explanation}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 px-4 md:px-6">
                        {/* Products section */}
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                            <span className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Productos ({order.order_items.length})
                            </span>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2">
                            <div className="space-y-3">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                  {item.product_image ? (
                                    <img
                                      src={item.product_image}
                                      alt={item.product_name || 'Producto'}
                                      className="h-16 w-16 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium">{item.product_name || 'Producto artesanal'}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Cantidad: {item.quantity} × ${item.price.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        <Separator />

                        {/* Order details section */}
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                            <span className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Detalles del pedido
                            </span>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2">
                            <div className="space-y-3 text-sm bg-muted/30 rounded-lg p-4">
                              {/* Payment breakdown header */}
                              <h4 className="font-medium text-foreground flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                Desglose del pago
                              </h4>
                              
                              {/* Subtotal */}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal productos</span>
                                <span>${(order.subtotal || order.total || 0).toLocaleString()}</span>
                              </div>
                              
                              {/* Shipping cost */}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  {order.delivery_method === 'pickup' ? (
                                    <>
                                      <MapPin className="h-3 w-3" />
                                      Envío (Retiro en local)
                                    </>
                                  ) : (
                                    <>
                                      <Truck className="h-3 w-3" />
                                      Envío (Servientrega)
                                    </>
                                  )}
                                </span>
                                <span>
                                  {order.delivery_method === 'pickup' ? (
                                    <span className="text-green-600">Gratis</span>
                                  ) : (
                                    `+$${(order.shipping_cost || 0).toLocaleString()}`
                                  )}
                                </span>
                              </div>
                              
                              <Separator className="my-2" />
                              
                              {/* Gift card payment if any */}
                              {(order.gift_card_discount !== null && order.gift_card_discount > 0) && (
                                <div className="flex justify-between items-center text-green-600">
                                  <span className="flex items-center gap-1">
                                    <Gift className="h-4 w-4" />
                                    Pagado con Gift Card
                                    {order.gift_card_code && (
                                      <span className="text-xs font-mono bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                                        {order.gift_card_code}
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-medium">-{formatCurrency(order.gift_card_discount)}</span>
                                </div>
                              )}
                              
                              {/* Paid with Breve/other payment method */}
                              {(order.paid_amount !== null && order.paid_amount > 0) && (
                                <div className="flex justify-between items-center">
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    {paymentInfo.icon}
                                    Pagado con {order.payment_method === 'gift_card' ? 'Breve' : paymentInfo.label}
                                  </span>
                                  <span className="font-medium">{formatCurrency(order.paid_amount)}</span>
                                </div>
                              )}
                              
                              {/* 100% gift card message */}
                              {order.payment_method === 'gift_card' && (order.paid_amount === null || order.paid_amount === 0) && (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                                  <Gift className="h-5 w-5" />
                                  <span className="font-medium">Pagado al 100% con Gift Card</span>
                                </div>
                              )}
                              
                              <Separator className="my-2" />
                              
                              {/* Total */}
                              <div className="flex justify-between items-center text-lg font-bold">
                                <span>TOTAL</span>
                                <span>{formatCurrency(order.total)}</span>
                              </div>
                              
                              <div className="flex justify-between text-xs text-muted-foreground pt-2">
                                <span>Fecha del pedido</span>
                                <span>{new Date(order.created_at).toLocaleString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                              
                              {order.notes && (
                                <div className="pt-2 border-t">
                                  <span className="text-muted-foreground block mb-1">Notas:</span>
                                  <p className="text-foreground">{order.notes}</p>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Shipping section - only show if has tracking or shipped */}
                        {(order.tracking_number || order.shipped_at || order.status === 'shipped' || order.status === 'delivered') && (
                          <>
                            <Separator />
                            <Collapsible defaultOpen={order.status === 'shipped'}>
                              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                                <span className="flex items-center gap-2">
                                  <Truck className="h-4 w-4" />
                                  Información de envío
                                </span>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pt-2">
                                <div className="space-y-3 text-sm bg-muted/30 rounded-lg p-4">
                                  {order.carrier && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Transportadora</span>
                                      <span className="capitalize font-medium">{order.carrier}</span>
                                    </div>
                                  )}
                                  {order.tracking_number && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Número de guía</span>
                                      <span className="font-mono font-medium">{order.tracking_number}</span>
                                    </div>
                                  )}
                                  {order.shipped_at && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Fecha de envío</span>
                                      <span>{new Date(order.shipped_at).toLocaleDateString('es-CO', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}</span>
                                    </div>
                                  )}
                                  {order.estimated_delivery_date && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Entrega estimada</span>
                                      <span className="font-medium text-primary">
                                        {new Date(order.estimated_delivery_date).toLocaleDateString('es-CO', {
                                          weekday: 'long',
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </>
                        )}

                        <Separator />
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-medium">Total:</span>
                          <span className="text-xl font-bold">${order.total.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="space-y-4">
              {/* Header responsivo: apilado en móvil */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h3 className="text-base md:text-lg font-semibold">Direcciones Guardadas</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Gestiona tus direcciones de envío</p>
                </div>
                <Button onClick={openNewAddressModal} className="w-full sm:w-auto touch-manipulation">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="sm:inline">Agregar</span>
                </Button>
              </div>

              {addresses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 md:py-12 text-center">
                    <MapPin className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm md:text-base text-muted-foreground">No tienes direcciones guardadas</p>
                  </CardContent>
                </Card>
              ) : (
                addresses.map((address) => (
                  <Card key={address.id}>
                    <CardContent className="pt-4 pb-4 px-4 md:pt-6 md:px-6">
                      {/* Layout vertical en móvil, horizontal en desktop */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-sm md:text-base">{address.label}</p>
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Predeterminada</span>
                                <span className="sm:hidden">Ppal</span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">{address.street_address}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">{address.country}</p>
                        </div>
                        {/* Botones: fila horizontal en móvil con mejor touch */}
                        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 touch-manipulation"
                            onClick={() => openEditAddressModal(address)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {!address.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-10 touch-manipulation flex-1 sm:flex-none"
                              onClick={() => setDefaultAddress(address.id)}
                            >
                              <Star className="h-3 w-3 mr-1 sm:hidden" />
                              <span className="hidden sm:inline">Predeterminada</span>
                              <span className="sm:hidden">Principal</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 touch-manipulation"
                            onClick={() => deleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Gift Cards Tab */}
          <TabsContent value="giftcards">
            <div className="space-y-4">
              {/* Header responsivo para Gift Cards */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h3 className="text-base md:text-lg font-semibold">Mis Gift Cards</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Tarjetas de regalo compradas o recibidas</p>
                </div>
                <Button onClick={() => navigate('/giftcards')} className="w-full sm:w-auto touch-manipulation">
                  <Gift className="h-4 w-4 mr-2" />
                  <span>Comprar</span>
                </Button>
              </div>

              {loadingGiftCards ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
                </div>
              ) : giftCards.length === 0 ? (
                <Card>
                  <CardContent className="py-8 md:py-12 text-center">
                    <CreditCard className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm md:text-base text-muted-foreground mb-4">No tienes gift cards aún</p>
                    <Button onClick={() => navigate('/giftcards')} className="touch-manipulation">
                      <Gift className="h-4 w-4 mr-2" />
                      Comprar una Gift Card
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                giftCards.map((card) => {
                  const usagePercentage = ((card.original_amount - card.remaining_amount) / card.original_amount) * 100;
                  const isUsable = card.is_active && card.remaining_amount > 0 && 
                    (!card.expires_at || new Date(card.expires_at) >= new Date());
                  
                  return (
                    <Card key={card.id} className={!isUsable ? 'opacity-60' : ''}>
                      <CardContent className="pt-4 pb-4 px-4 md:pt-6 md:px-6">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-mono font-semibold text-sm md:text-lg truncate">{card.masked_code}</p>
                                <div className="flex flex-wrap items-center gap-1 md:gap-2">
                                  {card.is_owner && (
                                    <Badge variant="outline" className="text-xs">Comprada</Badge>
                                  )}
                                  {card.is_recipient && !card.is_owner && (
                                    <Badge variant="outline" className="text-xs">Recibida</Badge>
                                  )}
                                  {getGiftCardStatus(card)}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs md:text-sm">
                                <span className="text-muted-foreground">Saldo disponible</span>
                                <span className="font-semibold">
                                  ${card.remaining_amount.toLocaleString()} / ${card.original_amount.toLocaleString()}
                                </span>
                              </div>
                              <Progress value={100 - usagePercentage} className="h-2" />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-muted-foreground">
                              <span>
                                Creada: {new Date(card.created_at).toLocaleDateString('es-CO')}
                              </span>
                              {card.expires_at && (
                                <span>
                                  Vence: {new Date(card.expires_at).toLocaleDateString('es-CO')}
                                </span>
                              )}
                            </div>
                          </div>

                          {isUsable && (
                            <div className="pt-2 border-t md:border-0 md:pt-0">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full md:w-auto touch-manipulation"
                                onClick={() => {
                                  navigator.clipboard.writeText(card.code);
                                  toast.success('Código copiado al portapapeles');
                                }}
                              >
                                Copiar código
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Address Modal - optimizado para móvil */}
      <Dialog open={showAddressModal} onOpenChange={(open) => { setShowAddressModal(open); if (!open) resetAddressForm(); }}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>{editingAddressId ? 'Editar dirección' : 'Agregar nueva dirección'}</DialogTitle>
            <DialogDescription>
              {editingAddressId ? 'Modifica los datos de tu dirección' : 'Completa los datos de tu dirección de envío'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address-label">Nombre de la dirección</Label>
                <Input
                  id="address-label"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Ej: Casa, Oficina, Apartamento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-department">Departamento</Label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                  <SelectTrigger id="address-department">
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
                <Label htmlFor="address-city">Ciudad / Municipio</Label>
                <Select 
                  value={municipios.find(m => m.municipio === addressForm.city)?.codigo || ''} 
                  onValueChange={handleMunicipioChange}
                  disabled={!selectedDepartment}
                >
                  <SelectTrigger id="address-city">
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

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address-street">Dirección</Label>
                <Input
                  id="address-street"
                  value={addressForm.street_address}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, street_address: e.target.value }))}
                  placeholder="Calle 123 #45-67, Apto 101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-postal">Código postal</Label>
                <Input
                  id="address-postal"
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="110111"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="address-default"
                  checked={addressForm.is_default}
                  onCheckedChange={(checked) => setAddressForm(prev => ({ ...prev, is_default: checked === true }))}
                />
                <Label htmlFor="address-default" className="text-sm font-normal cursor-pointer">
                  Establecer como predeterminada
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => { setShowAddressModal(false); resetAddressForm(); }} className="w-full sm:w-auto touch-manipulation">
              Cancelar
            </Button>
            <Button onClick={saveAddress} disabled={savingAddress} className="w-full sm:w-auto touch-manipulation">
              {savingAddress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                editingAddressId ? 'Actualizar' : 'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Profile;
