import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useAutoHeroGeneration } from '@/hooks/useAutoHeroGeneration';
import { NotificationTemplates } from '@/services/notificationService';
import {
  getArtisanShopByUserId,
  createArtisanShop,
  updateArtisanShop,
  isSlugAvailable
} from '@/services/artisanShops.actions';
import { ArtisanShop } from '@/types/artisanShop.types';

export const useArtisanShop = () => {
  const [shop, setShop] = useState<ArtisanShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateHeroSlides } = useAutoHeroGeneration();
  const isFetchingRef = useRef(false);

  const fetchShop = async (retryAttempt = 0) => {

    // If we already have shop data, just complete initialization


    if (shop && user?.id) {
      setLoading(false);
      setInitialCheckComplete(true);
      return;
    }

    if (!user) {
      setLoading(false);
      setShop(null);
      setInitialCheckComplete(true);
      return;
    }

    try {
      isFetchingRef.current = true;
      // Solo setLoading(true) si es el primer intento
      if (retryAttempt === 0) {
        setLoading(true);
      }

      const data = await getArtisanShopByUserId(user.id);


      setShop(data as any);

      // ✅ Fetch exitoso - marcar como completado
      setLoading(false);
      setInitialCheckComplete(true);
      isFetchingRef.current = false;

    } catch (err: any) {
      // Retry logic: attempt up to 2 additional times with exponential backoff
      if (retryAttempt < 2) {
        const retryDelay = 1000 * (retryAttempt + 1); // 1s, 2s
        setTimeout(() => fetchShop(retryAttempt + 1), retryDelay);
        return;
      }

      // ❌ Agotamos retries - marcar como error final
      setError(err.message);
      setLoading(false);
      setInitialCheckComplete(true);
      isFetchingRef.current = false;

      console.error('[useArtisanShop] Error fetching artisan shop after retries:', err);
      toast({
        title: "Error al cargar tienda",
        description: "No se pudo cargar la información de tu tienda",
        variant: "destructive",
      });
    }
  };

  const createShop = async (shopData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);

      // Check if user already has a shop
      const existingShop = await checkExistingShop();
      if (existingShop) {
        if (existingShop.creationStatus === 'complete') {
          throw new Error('Ya tienes una tienda creada. Solo puedes tener una tienda.');
        }
        // Continue with existing shop
        return updateShopProgress(existingShop.id, shopData, 'complete');
      }

      // Generate unique slug
      const baseSlug = shopData.shop_name?.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'tienda';

      let slug = baseSlug;
      let counter = 1;

      // ✅ Migrado a NestJS - GET /artisan-shops/slug/{slug}
      // Genera un slug único verificando disponibilidad
      while (!(await isSlugAvailable(slug))) {
        slug = `${baseSlug}-${counter}`;
        counter++;

        // Prevención de bucle infinito (máximo 1000 intentos)
        if (counter > 1000) {
          throw new Error('No se pudo generar un slug único después de 1000 intentos');
        }
      }

      // Convertir shopData de snake_case a camelCase
      const payload: any = {
        userId: user.id,
        shopSlug: slug,
        creationStatus: 'complete',
        creationStep: 0,
        publishStatus: 'pending_publish',
        active: false,
      };

      // Mapear campos comunes de snake_case a camelCase
      if (shopData.shop_name) payload.shopName = shopData.shop_name;
      if (shopData.description) payload.description = shopData.description;
      if (shopData.craft_type) payload.craftType = shopData.craft_type;
      if (shopData.region) payload.region = shopData.region;
      if (shopData.brand_claim) payload.brandClaim = shopData.brand_claim;
      if (shopData.logo_url) payload.logoUrl = shopData.logo_url;
      if (shopData.primary_colors) payload.primaryColors = shopData.primary_colors;
      if (shopData.secondary_colors) payload.secondaryColors = shopData.secondary_colors;

      const data = await createArtisanShop(payload);

      setShop(data as any);

      // 🔔 Crear notificación de tienda creada
      // await NotificationTemplates.shopCreated(user.id, data.shopName, data.shopSlug);

      // Generar hero slides automáticamente
      const heroResult = await generateHeroSlides(data.id);

      // Generar solo Contact automáticamente (Nosotros se reemplaza por Perfil Artesanal wizard)
      try {
        const contactResult = await supabase.functions.invoke('generate-shop-contact', {
          body: {
            shopName: data.shopName,
            craftType: data.craftType,
            region: data.region,
            brandClaim: data.brandClaim || ''
          }
        });

        if (contactResult.data) {
          await updateArtisanShop(data.id, {
            contactConfig: contactResult.data
          });
        }
      } catch (error) {
        console.warn('No se pudo generar Contact automáticamente:', error);
      }

      toast({
        title: "¡Tienda creada!",
        description: heroResult.success
          ? "Tu tienda, hero slides y contenido han sido creados exitosamente."
          : "Tu tienda ha sido creada. Completa tu marca para generar hero slides.",
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message.includes('Ya tienes una tienda') ?
          err.message : "No se pudo crear la tienda. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkExistingShop = async () => {
    if (!user) return null;

    try {
      const data = await getArtisanShopByUserId(user.id);
      return data
    } catch (error) {
      return null;
    }
  };

  const updateShopProgress = async (shopId: string, updates: any, status: string = 'incomplete', step: number = 0) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Convertir updates de snake_case a camelCase
      const payload: any = {
        creationStatus: status,
        creationStep: step,
      };

      // Mapear campos conocidos
      if (updates.shop_name) payload.shopName = updates.shop_name;
      if (updates.description) payload.description = updates.description;
      if (updates.craft_type) payload.craftType = updates.craft_type;
      if (updates.logo_url) payload.logoUrl = updates.logo_url;
      if (updates.hero_config) payload.heroConfig = updates.hero_config;
      if (updates.about_content) payload.aboutContent = updates.about_content;
      if (updates.contact_config) payload.contactConfig = updates.contact_config;
      if (updates.social_links) payload.socialLinks = updates.social_links;

      const data = await updateArtisanShop(shopId, payload);

      setShop(data as any);
      return data as any;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateShop = async (updates: any) => {
    if (!shop || !user) throw new Error('Shop or user not found');

    try {
      setLoading(true);

      // Convertir updates de snake_case a camelCase
      const payload: any = {};

      // Mapear campos conocidos de snake_case a camelCase
      if (updates.shop_name !== undefined) payload.shopName = updates.shop_name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.craft_type !== undefined) payload.craftType = updates.craft_type;
      if (updates.logo_url !== undefined) payload.logoUrl = updates.logo_url;
      if (updates.banner_url !== undefined) payload.bannerUrl = updates.banner_url;
      if (updates.hero_config !== undefined) payload.heroConfig = updates.hero_config;
      if (updates.about_content !== undefined) payload.aboutContent = updates.about_content;
      if (updates.contact_config !== undefined) payload.contactConfig = updates.contact_config;
      if (updates.social_links !== undefined) payload.socialLinks = updates.social_links;
      if (updates.brand_claim !== undefined) payload.brandClaim = updates.brand_claim;
      if (updates.primary_colors !== undefined) payload.primaryColors = updates.primary_colors;
      if (updates.secondary_colors !== undefined) payload.secondaryColors = updates.secondary_colors;
      if (updates.active !== undefined) payload.active = updates.active;
      if (updates.publish_status !== undefined) payload.publishStatus = updates.publish_status;
      if (updates.artisan_profile !== undefined) payload.artisanProfile = updates.artisan_profile;

      const data = await updateArtisanShop(shop.id, payload);

      setShop(data as any);
      toast({
        title: "Tienda actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });

      return data as any;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Force refresh function that bypasses guards
  const forceRefresh = async () => {
    if (!user) return;
    isFetchingRef.current = false;

    try {
      const data = await getArtisanShopByUserId(user.id);

      console.log('verificando user', user)


      if (data) {
        setShop(data as any);
      }
    } catch (err) {
      console.error('[useArtisanShop] Force refresh error:', err);
    }
  };

  useEffect(() => {

    if (user === null) {
      // Solo si explícitamente NO hay usuario (no undefined/loading)
      setLoading(false);
      setShop(null);
      setInitialCheckComplete(true);
    }
    // Si user es undefined, esperamos - NO hacemos nada
  }, [user?.id]); // Removed 'shop' to prevent race conditions

  // Listen for shop-updated events to auto-refresh
  useEffect(() => {
    const handleShopUpdated = () => {
      forceRefresh();
    };

    window.addEventListener('shop-updated', handleShopUpdated);
    return () => window.removeEventListener('shop-updated', handleShopUpdated);
  }, [user?.id]);

  return {
    shop,
    loading,
    error,
    initialCheckComplete,
    createShop,
    updateShop,
    refreshShop: fetchShop,
    forceRefresh,
    fetchShop,
    checkExistingShop,
    updateShopProgress,
  };
};