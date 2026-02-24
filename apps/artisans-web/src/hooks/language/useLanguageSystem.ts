import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DEFAULT_LANGUAGE, type Language } from '@/types/language';
import { useUserLocalStorage } from '../user/useUserLocalStorage';
import { useUnifiedUserData } from '../user';

interface LanguageSystemHook {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
  needsLanguageSelection: boolean;
  updateMasterCoordinatorLanguage: (language: Language) => Promise<void>;
}

export type { LanguageSystemHook };

export const useLanguageSystem = (): LanguageSystemHook => {
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();
  const { profile, context, loading: unifiedLoading } = useUnifiedUserData();
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [needsLanguageSelection, setNeedsLanguageSelection] = useState(false);

  // Load user's language preference
  useEffect(() => {
    if (!user) {
      setLanguageState(DEFAULT_LANGUAGE);
      return;
    }

    const loadLanguage = async () => {
      try {
        // 1️⃣ Check localStorage first (immediate)
        const cachedLanguage = userLocalStorage.getItem('user_language_preference');
        if (cachedLanguage) {
          console.log('✅ Idioma desde localStorage:', cachedLanguage);
          setLanguageState(cachedLanguage as Language);
          return;
        }

        // 2️⃣ Wait for data if still loading
        if (unifiedLoading) {
          console.log('⏳ Esperando datos...');
          return;
        }

        // 3️⃣ Check profile
        if (profile?.languagePreference) {
          console.log('✅ Idioma desde perfil:', profile.languagePreference);
          setLanguageState(profile.languagePreference as Language);
          userLocalStorage.setItem('user_language_preference', profile.languagePreference);
          return;
        }

        // 4️⃣ Check context
        if (context?.taskGenerationContext?.language) {
          console.log('✅ Idioma desde contexto:', context.taskGenerationContext.language);
          setLanguageState(context.taskGenerationContext.language as Language);
          userLocalStorage.setItem('user_language_preference', context.taskGenerationContext.language);
          return;
        }

        // 5️⃣ Use default
        console.log('ℹ️ Usando idioma por defecto');
        setLanguageState(DEFAULT_LANGUAGE);
      } catch (error) {
        console.error('Error cargando idioma:', error);
        setLanguageState(DEFAULT_LANGUAGE);
      }
    };

    loadLanguage();
  }, [user, profile, context, unifiedLoading, userLocalStorage]);

  // Update Master Coordinator with new language
  const updateMasterCoordinatorLanguage = useCallback(async (newLanguage: Language) => {
    if (!user) return;

    try {
      // Update or create master context
      const { error } = await supabase
        .from('user_master_context')
        .upsert({
          user_id: user.id,
          language_preference: newLanguage,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Notify Master Coordinator about language change
      await supabase.functions.invoke('contexto-maestro', {
        body: {
          action: 'update',
          userId: user.id,
          agentId: 'master-coordinator',
          newInsight: `User changed language preference to ${newLanguage}`
        }
      });

    } catch (error) {
      console.error('Error updating Master Coordinator language:', error);
      throw error;
    }
  }, [user]);

  // Set language and persist it
  const setLanguage = useCallback(async (newLanguage: Language) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          language_preference: newLanguage,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Update Master Coordinator
      await updateMasterCoordinatorLanguage(newLanguage);

      // Update local state
      setLanguageState(newLanguage);
      setNeedsLanguageSelection(false);

      // Update user-namespaced localStorage for immediate UI updates
      userLocalStorage.setItem('user_language_preference', newLanguage);

      toast.success('Idioma actualizado correctamente');
    } catch (error) {
      console.error('Error setting language:', error);
      toast.error('Error al actualizar el idioma');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateMasterCoordinatorLanguage]);

  return {
    language,
    setLanguage,
    isLoading,
    needsLanguageSelection,
    updateMasterCoordinatorLanguage
  };
};