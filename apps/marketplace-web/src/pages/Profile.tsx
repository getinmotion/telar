import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import * as AddressesActions from '@/services/addresses.actions';
import * as UserProfilesActions from '@/services/user-profiles.actions';
import * as GiftCardsActions from '@/services/gift-cards.actions';
import * as CartActions from '@/services/cart.actions';
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial tab from query param or default to 'profile'
  const activeTab = searchParams.get('tab') || 'profile';
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
      // Fetch carts from backend with items (returns array)
      const cartsWithItems = await CartActions.getBuyerCartWithItems(user!.id);
      console.log('Carts with items:', cartsWithItems);

      // Check if array is empty
      if (!cartsWithItems || cartsWithItems.length === 0) {
        console.log('No carts found');
        setOrders([]);
        return;
      }

      // Map each cart to Order format
      const ordersWithProducts: Order[] = cartsWithItems.map(cart => ({
        id: cart.id,
        status: cart.status,
        // Calculate total from items
        total: cart.items.reduce((sum, item) =>
          sum + (parseFloat(item.unitPriceMinor) / 100 * item.quantity), 0
        ),
        created_at: cart.createdAt,
        updated_at: cart.updatedAt,
        payment_method: 'pending', // Default value, will be updated when converted to order
        notes: null,
        tracking_number: null,
        carrier: null,
        shipped_at: null,
        estimated_delivery_date: null,
        shipping_address_id: null,
        // Calculate subtotal from items
        subtotal: cart.items.reduce((sum, item) =>
          sum + (parseFloat(item.unitPriceMinor) / 100 * item.quantity), 0
        ),
        shipping_cost: 0,
        gift_card_discount: null,
        gift_card_code: null,
        delivery_method: null,
        paid_amount: null,
        order_items: cart.items.map(item => {
          // Get primary media from product
          const primaryMedia = item.product?.media?.find(m => m.isPrimary);
          const imageUrl = primaryMedia?.mediaUrl || item.product?.media?.[0]?.mediaUrl || '';

          return {
            id: item.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.unitPriceMinor) / 100,
            product_name: item.product?.name || 'Producto',
            product_image: imageUrl,
          };
        }),
      }));

      console.log('Orders with products:', ordersWithProducts);

      setOrders(ordersWithProducts);
    } catch (error) {
      console.error('Error loading carts:', error);
      toast.error('Error al cargar las órdenes');
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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Mi Perfil</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gestiona tu información y pedidos</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="space-y-4 md:space-y-6"
        >
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
            {searchParams.get('carrito') ? (
              <OrderDetail cartId={searchParams.get('carrito')!} />
            ) : (
              <Orders orders={orders} />
            )}
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
