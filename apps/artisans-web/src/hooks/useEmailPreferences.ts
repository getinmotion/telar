import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EmailPreferences {
  moderation: boolean;
  shop: boolean;
  products: boolean;
  progress: boolean;
  account: boolean;
  system: boolean;
}

const DEFAULT_PREFERENCES: EmailPreferences = {
  moderation: true,
  shop: true,
  products: true,
  progress: false,
  account: true,
  system: true,
};

export const useEmailPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar preferencias del usuario
  // OPTIMIZATION: Use user?.id instead of user to prevent unnecessary re-creation
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('email_notification_preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[useEmailPreferences] Error loading preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
      } else if (data) {
        const loadedPrefs = (data.email_notification_preferences as Record<string, boolean>) || {};
        setPreferences({ ...DEFAULT_PREFERENCES, ...loadedPrefs });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (err) {
      console.error('[useEmailPreferences] Exception loading preferences:', err);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // OPTIMIZATION: Use user?.id instead of user

  // Guardar preferencias
  const savePreferences = useCallback(async (newPreferences: EmailPreferences) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para guardar preferencias',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          email_notification_preferences: newPreferences as any,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('[useEmailPreferences] Error saving preferences:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron guardar las preferencias',
          variant: 'destructive',
        });
        return false;
      }

      setPreferences(newPreferences);
      toast({
        title: 'Preferencias guardadas',
        description: 'Tus preferencias de notificaciones han sido actualizadas',
      });
      return true;
    } catch (err) {
      console.error('[useEmailPreferences] Exception saving preferences:', err);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al guardar las preferencias',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user?.id, toast]);

  // Actualizar una categoría específica
  const updateCategory = useCallback(async (category: keyof EmailPreferences, enabled: boolean) => {
    const newPreferences = { ...preferences, [category]: enabled };
    await savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Cargar preferencias al montar
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    updateCategory,
    refreshPreferences: loadPreferences,
  };
};