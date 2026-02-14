import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Package,
  Edit3,
  Eye,
  Plus,
  ShoppingBag,
  Users,
  Star,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Mail,
  FileText,
  BarChart3,
  Palette,
  CreditCard,
  Loader2,
  Truck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShopPublishStatusBanner } from '@/components/shop/ShopPublishStatusBanner';
import { useBankData } from '@/hooks/useBankData';
import { cn } from '@/lib/utils';
import { ModerationStatusBadge } from '@/components/moderation/ModerationStatusBadge';
import { StockBadge } from '@/components/trust/StockBadge';
import { useAIRefinement } from '@/components/shop/ai-upload/hooks/useAIRefinement';
import { ShopMobileConfigAccordions } from '@/components/shop/mobile/ShopMobileConfigAccordions';
import { SalesMiniDashboard } from '@/components/shop/SalesMiniDashboard';
import { useShopOrders } from '@/hooks/useShopOrders';

export const ShopDashboard: React.FC = () => {
  const { shop, loading: shopLoading, initialCheckComplete, refreshShop, forceRefresh } = useArtisanShop();
  const { products, loading: productsLoading } = useProducts(shop?.id);
  // const { bankData, loading: bankLoading } = useBankData();
  const { refineContent, isRefining: isDescriptionRefining } = useAIRefinement();
  const [isNameRefining, setIsNameRefining] = useState(false);
  const { stats: orderStats } = useShopOrders(shop?.id);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Force refresh on mount to get latest data (e.g., after batch AI refinement)
  useEffect(() => {
    refreshShop();
  }, [shop?.id]);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleStartEdit = () => {
    setEditedDescription(shop?.description || '');
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    if (!shop?.id) return;

    setIsSaving(true);
    try {
      // Refinar descripción con IA
      const refinedDescription = await refineContent({
        context: 'shop_description',
        currentValue: editedDescription,
        userPrompt: 'Corrige errores ortográficos y mejora la claridad manteniendo la esencia'
      });

      const finalDescription = refinedDescription || editedDescription;

      const { error } = await supabase
        .from('artisan_shops')
        .update({ description: finalDescription })
        .eq('id', shop.id);

      if (error) throw error;

      toast({
        title: "Descripción actualizada",
        description: refinedDescription
          ? "Tu descripción ha sido refinada y guardada"
          : "Los cambios se han guardado correctamente",
      });

      setEditedDescription(finalDescription);
      setIsEditingDescription(false);
      window.dispatchEvent(new Event('shop-updated'));
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la descripción",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditName = () => {
    setEditedName(shop?.shopName || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!shop?.id || !editedName.trim()) return;

    setIsSaving(true);
    try {
      const finalName = editedName.trim();

      const { error } = await supabase
        .from('artisan_shops')
        .update({ shop_name: finalName })
        .eq('id', shop.id);

      if (error) throw error;

      toast({
        title: "Nombre actualizado",
        description: "El nombre de tu tienda se ha guardado correctamente",
      });

      setEditedName(finalName);
      setIsEditingName(false);
      window.dispatchEvent(new Event('shop-updated'));
    } catch (error) {
      console.error('Error updating shop name:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el nombre",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefineNameWithAI = async () => {
    if (!shop?.id || !editedName.trim()) return;

    setIsNameRefining(true);
    try {
      const refinedName = await refineContent({
        context: 'shop_name',
        currentValue: editedName.trim(),
        userPrompt: 'Corrige errores y usa capitalización correcta'
      });

      if (refinedName && refinedName !== editedName.trim()) {
        setEditedName(refinedName);
        toast({
          title: "Nombre refinado",
          description: "La IA ha mejorado tu nombre. Guarda para aplicar los cambios.",
        });
      } else {
        toast({
          title: "Sin cambios",
          description: "El nombre ya está bien escrito.",
        });
      }
    } catch (error) {
      console.error('Error refining name:', error);
      toast({
        title: "Error",
        description: "No se pudo refinar el nombre",
        variant: "destructive",
      });
    } finally {
      setIsNameRefining(false);
    }
  };

  // Auto-redirect to shop creation if no shop exists
  useEffect(() => {
    if (initialCheckComplete && !shopLoading && !shop) {
      console.log('[ShopDashboard] Verified no shop exists, redirecting to creation flow');
      navigate('/dashboard/create-shop', { replace: true });
    }
  }, [shop, shopLoading, initialCheckComplete, navigate]);


  // Safety timeout: if loading persists for more than 15 seconds AND initialCheckComplete, show error
  useEffect(() => {
    if (shopLoading && initialCheckComplete) {
      const timeoutId = setTimeout(() => {
        console.warn('[ShopDashboard] Loading timeout reached (15s) after initialCheckComplete');
        setLoadingTimeout(true);
      }, 15000);
      return () => clearTimeout(timeoutId);
    } else {
      setLoadingTimeout(false);
    }
  }, [shopLoading, initialCheckComplete]);

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
        <div className="max-w-7xl mx-auto">
          {loadingTimeout ? (
            <Card className="p-8 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-bold mb-2">La carga está tomando más tiempo del esperado</h3>
              <p className="text-muted-foreground mb-4">
                Esto puede deberse a una conexión lenta o un problema temporal.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Intenta reintentar primero. Si el problema persiste, recarga la página.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={async () => {
                    setLoadingTimeout(false);
                    await refreshShop();
                  }}
                >
                  Reintentar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Recargar página
                </Button>
              </div>
            </Card>
          ) : (
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 flex items-center justify-center">
        <div className="animate-pulse">
          <Store className="w-12 h-12 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <ShopHeader
        title="MI TIENDA"
        subtitle="Gestiona tu tienda digital"
        showPublicShopButton={true}
        publicShopSlug={shop.shopSlug}
        shopPublishStatus={shop.publishStatus}
        showBackButton={false}
        showUploadButton={false}
        showDashboardButton={true}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Publish Status Banner - Compacto */}
        <ShopPublishStatusBanner shop={shop} />

        {/* Two Column Layout: 60% Info+Stats / 40% Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          {/* LEFT COLUMN - 60% - Shop Info + Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 space-y-4"
          >
            {/* Mobile Layout: Logo + Name inline */}
            <div className="flex items-center gap-3 md:hidden">
              {/* Shop Logo - smaller on mobile */}
              <div className="flex-shrink-0">
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.shopName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-7 h-7 text-primary" />
                  </div>
                )}
              </div>

              {/* Name + Badge + Edit inline */}
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-lg font-bold w-full px-2 py-1 border-2 border-input bg-background rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Nombre"
                      autoFocus
                      disabled={isSaving || isNameRefining}
                    />
                    <div className="flex gap-1 mt-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveName} disabled={isSaving || isNameRefining}>
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRefineNameWithAI} disabled={isSaving || isNameRefining}>
                        {isNameRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditingName(false)} disabled={isSaving || isNameRefining}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground truncate">{shop.shopName}</h2>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={handleStartEditName}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Badge variant={shop.active ? "default" : "secondary"} className="flex-shrink-0 text-xs">
                      {shop.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Description with expand/collapse */}
            <div className="md:hidden">
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="min-h-[60px] w-full text-sm"
                    placeholder="Describe tu tienda..."
                    disabled={isSaving || isDescriptionRefining}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveDescription} disabled={isSaving || isDescriptionRefining}>
                      {(isSaving || isDescriptionRefining) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingDescription(false)} disabled={isSaving || isDescriptionRefining}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className={cn(
                    "text-sm text-muted-foreground",
                    !isDescriptionExpanded && "line-clamp-2"
                  )}>
                    {shop.description}
                  </p>
                  {shop.description && shop.description.length > 80 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-xs text-primary font-medium"
                    >
                      {isDescriptionExpanded ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEdit}
                    className="text-xs h-6 px-2"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop Layout: Original structure */}
            <div className="hidden md:flex flex-row gap-6">
              {/* Shop Logo/Icon */}
              <div className="flex-shrink-0">
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.shopName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-neumorphic"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shadow-neumorphic-inset">
                    <Store className="w-10 h-10 text-primary" />
                  </div>
                )}
              </div>

              {/* Shop Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {isEditingName ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="text-2xl font-bold max-w-md px-3 py-1 border-2 border-input bg-background rounded-lg focus:outline-none focus:border-primary"
                            placeholder="Nombre de tu tienda"
                            autoFocus
                            disabled={isSaving || isNameRefining}
                          />
                          <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={isSaving || isNameRefining} title="Guardar">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRefineNameWithAI}
                            disabled={isSaving || isNameRefining}
                            className="text-xs"
                            title="Refinar con IA"
                          >
                            {isNameRefining ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                            Refinar con IA
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)} disabled={isSaving || isNameRefining} title="Cancelar">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-foreground">{shop.shopName}</h2>
                          <Button variant="ghost" size="icon" onClick={handleStartEditName}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <Badge variant={shop.active ? "default" : "secondary"}>
                        {shop.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>

                    {isEditingDescription ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          className="min-h-[80px] w-full"
                          placeholder="Describe tu tienda..."
                          disabled={isSaving || isDescriptionRefining}
                        />
                        {isDescriptionRefining && (
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Refinando con IA...
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveDescription}
                            disabled={isSaving || isDescriptionRefining}
                          >
                            {(isSaving || isDescriptionRefining) ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                {isDescriptionRefining ? 'Refinando...' : 'Guardando...'}
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Guardar
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingDescription(false)}
                            disabled={isSaving || isDescriptionRefining}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-muted-foreground text-left flex-1">
                          {shop.description}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleStartEdit}
                          className="flex-shrink-0"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {shop.craftType && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium text-foreground">{shop.craftType}</span>
                    </div>
                  )}
                  {shop.region && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Región:</span>
                      <span className="font-medium text-foreground">{shop.region}</span>
                    </div>
                  )}
                </div>

                {/* Reviews Placeholder */}
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">0.0 (0 reseñas)</span>
                </div>
              </div>
            </div>

            {/* Stats Card - Now below description in left column (desktop only) */}
            <Card className="hidden lg:block p-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-golden/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-golden" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{products.length}</div>
                    <div className="text-xs text-muted-foreground">Productos</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">0</div>
                    <div className="text-xs text-muted-foreground">Visitas</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{orderStats.total}</div>
                    <div className="text-xs text-muted-foreground">Ventas</div>
                  </div>
                </div>
                {orderStats.pendingTracking > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-warning">{orderStats.pendingTracking}</div>
                      <div className="text-xs text-muted-foreground">Sin guía</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* RIGHT COLUMN - 40% - Sales (Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block"
          >
            <SalesMiniDashboard shopId={shop.id} />
          </motion.div>
        </div>

        {/* Mobile Stats - Solo visible en móvil */}
        <div className="lg:hidden">
          <Card className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-golden/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-golden" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{products.length}</div>
                  <div className="text-xs text-muted-foreground">Productos</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">Visitas</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{orderStats.total}</div>
                  <div className="text-xs text-muted-foreground">Ventas</div>
                </div>
              </div>
              {orderStats.pendingTracking > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-warning">{orderStats.pendingTracking}</div>
                    <div className="text-xs text-muted-foreground">Sin guía</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          <div className="mt-4">
            <SalesMiniDashboard shopId={shop.id} />
          </div>
        </div>

        {/* Mobile: Products first, then accordions */}
        {/* Desktop: Two columns (config left, products right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Desktop only - AI Configuration Cards */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* DESTACADO: Subir Productos Card */}
              <Card
                className="p-5 bg-gradient-to-br from-accent/10 to-golden/10 border-accent/30 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate('/productos/subir')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="neumorphic-inset p-3 rounded-xl bg-accent/20">
                    <Package className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-foreground">Subir Productos</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Agrega nuevos productos a tu catálogo
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-accent/20 text-foreground"
                  >
                    {products.length} productos
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <button className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </Card>

              {/* Ver Inventario Card */}
              <Card
                className="p-4 hover:shadow-lg transition-all cursor-pointer border-primary/20"
                onClick={() => navigate('/dashboard/inventory')}
              >
                <div className="flex items-center gap-3">
                  <div className="neumorphic-inset p-2.5 rounded-xl flex-shrink-0 bg-primary/10">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground">Ver Inventario</h4>
                    <p className="text-xs text-muted-foreground">Gestiona todos tus productos</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {products.length}
                  </Badge>
                  <button className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
              {/* Columna vertical de cards de configuración */}
              <div className="flex flex-col gap-3">
                {/* Control de Stock Card */}
                <Card
                  className="p-3 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate('/stock-wizard')}
                >
                  <div className="flex items-center gap-3">
                    <div className="neumorphic-inset p-2 rounded-xl flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">Control Stock</h4>
                      <p className="text-xs text-muted-foreground truncate">Gestiona inventario</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0"
                    >
                      {products.filter(p => (p.inventory ?? 0) <= 5).length} bajo
                    </Badge>
                    <button className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>

                {/* Hero Slider Card */}
                <Card
                  className="p-3 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate('/dashboard/shop-hero-wizard')}
                >
                  <div className="flex items-center gap-3">
                    <div className="neumorphic-inset p-2 rounded-xl flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">Hero Slider</h4>
                      <p className="text-xs text-muted-foreground truncate">Portada de tu tienda</p>
                    </div>
                    <Badge
                      variant={(shop as any).hero_config?.slides?.length > 0 ? "default" : "destructive"}
                      className="text-xs flex-shrink-0"
                    >
                      {(shop as any).hero_config?.slides?.length > 0 ? 'OK' : 'Pendiente'}
                    </Badge>
                    <button className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>

                {/* Perfil Artesanal Card */}
                <Card
                  className="p-3 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate('/dashboard/artisan-profile-wizard')}
                >
                  <div className="flex items-center gap-3">
                    <div className="neumorphic-inset p-2 rounded-xl flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">Perfil Artesanal</h4>
                      <p className="text-xs text-muted-foreground truncate">Tu historia profunda</p>
                    </div>
                    <Badge
                      variant={(shop as any).artisan_profile_completed ? "default" : "destructive"}
                      className="text-xs flex-shrink-0"
                    >
                      {(shop as any).artisan_profile_completed ? 'OK' : 'Pendiente'}
                    </Badge>
                    <button className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>

                {/* Contacto Card */}
                <Card
                  className="p-3 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate('/dashboard/shop-contact-wizard')}
                >
                  <div className="flex items-center gap-3">
                    <div className="neumorphic-inset p-2 rounded-xl flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">Contacto</h4>
                      <p className="text-xs text-muted-foreground truncate">Info de contacto</p>
                    </div>
                    <Badge
                      variant={(shop as any).contact_config?.welcomeMessage ? "default" : "destructive"}
                      className="text-xs flex-shrink-0"
                    >
                      {(shop as any).contact_config?.welcomeMessage ? 'OK' : 'Pendiente'}
                    </Badge>
                    <button className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>

                {/* Mi Marca Card */}
                <Card
                  className="p-3 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate('/dashboard/brand-wizard')}
                >
                  <div className="flex items-center gap-3">
                    <div className="neumorphic-inset p-2 rounded-xl flex-shrink-0">
                      <Palette className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">Mi Marca</h4>
                      <p className="text-xs text-muted-foreground truncate">Logo y colores</p>
                    </div>
                    <Badge
                      variant={shop.logoUrl ? "default" : "destructive"}
                      className="text-xs flex-shrink-0"
                    >
                      {shop.logoUrl ? 'OK' : 'Pendiente'}
                    </Badge>
                    <button className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>

                {/* Datos Bancarios Card */}
                <Card
                  className={cn(
                    "p-3 hover:shadow-lg transition-all cursor-pointer",
                    !shop.idContraparty && "bg-gradient-to-br from-warning/10 to-destructive/10 border-warning/30"
                  )}
                  onClick={() => navigate('/mi-cuenta/datos-bancarios')}
                >
                  <div className="flex items-center gap-3">
                    <div className="neumorphic-inset p-2 rounded-xl flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">Datos Bancarios</h4>
                      <p className="text-xs text-muted-foreground truncate">Para publicar</p>
                    </div>
                    <Badge
                      variant={shop.idContraparty ? "default" : "destructive"}
                      className="text-xs flex-shrink-0"
                    >
                      {shop.idContraparty ? 'OK' : 'Requerido'}
                    </Badge>
                    <button className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* PRODUCTS SECTION - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 order-first lg:order-last">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground">Mis Productos</h3>
                  <Button
                    onClick={() => navigate('/productos/subir')}
                    size="icon"
                    className="rounded-full w-10 h-10 lg:w-12 lg:h-12 bg-foreground hover:bg-foreground/90"
                  >
                    <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
                  </Button>
                </div>

                {productsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 lg:py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Aún no tienes productos</p>
                    <Button onClick={() => navigate('/productos/subir')} variant="default">
                      Subir tu primer producto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 5).map((product) => {
                      const needsAttention = product.moderation_status === 'changes_requested' || product.moderation_status === 'rejected';
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center gap-3 lg:gap-4 p-3 rounded-lg border transition-all bg-background/50 ${needsAttention
                            ? 'border-destructive/50 hover:border-destructive'
                            : 'border-border hover:border-primary/30'
                            }`}
                        >
                          <img
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm lg:text-base text-foreground truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <ModerationStatusBadge
                                status={product.moderation_status || 'draft'}
                                size="sm"
                              />
                              {product.inventory <= 10 && (
                                <StockBadge inventory={product.inventory} />
                              )}
                            </div>
                            <p className="text-base lg:text-lg font-bold text-primary mt-1">
                              ${product.price.toLocaleString('es-CO')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/productos/editar/${product.id}`)}
                            className="flex-shrink-0"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}

                    {products.length > 5 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/inventario')}
                      >
                        Ir al inventario
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>


        {/* Mobile Accordions - Only visible on mobile */}
        <ShopMobileConfigAccordions shop={shop} products={products} />
      </div>
    </div>
  );
};
