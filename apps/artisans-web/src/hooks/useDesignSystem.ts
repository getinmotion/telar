import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ColorVariables, DesignSystemConfig } from '@/types/designSystem';
import { useToast } from '@/hooks/use-toast';

const CACHE_KEY = 'telar_design_system_config';

export function useDesignSystem() {
  const [config, setConfig] = useState<ColorVariables | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Apply CSS variables to document
  const applyCSSVariables = useCallback((colorVars: ColorVariables) => {
    const root = document.documentElement;

    // Apply semantic tokens
    Object.entries(colorVars.semantic).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply palette colors
    Object.entries(colorVars.palettes).forEach(([paletteName, palette]) => {
      Object.entries(palette).forEach(([shade, value]) => {
        root.style.setProperty(`--${paletteName}-${shade}`, value);
      });
    });

    // Apply gradients
    Object.entries(colorVars.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply shadows
    Object.entries(colorVars.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply element overrides
    if (colorVars.elementOverrides) {
      Object.entries(colorVars.elementOverrides).forEach(([elementId, tokenName]) => {
        root.style.setProperty(`--element-${elementId}`, `var(--${tokenName})`);
      });
    }
  }, []);

  // Load configuration from database or cache
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedConfig = JSON.parse(cached) as ColorVariables;
        setConfig(cachedConfig);
        applyCSSVariables(cachedConfig);
      }

      // Fetch from database (active global config)
      const { data, error: fetchError } = await supabase
        .from('design_system_config')
        .select('*')
        .is('user_id', null)
        .eq('is_active', true)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        const colorVars = data.color_variables as unknown as ColorVariables;
        setConfig(colorVars);
        applyCSSVariables(colorVars);
        
        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(colorVars));
      }
    } catch (err) {
      console.error('[Design System] Error loading config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load design system');
    } finally {
      setIsLoading(false);
    }
  }, [applyCSSVariables]);

  // Save configuration to database
  const saveConfig = useCallback(async (newConfig: ColorVariables) => {
    try {
      const { error: updateError } = await supabase
        .from('design_system_config')
        .update({ 
          color_variables: newConfig as unknown as Record<string, any>,
          updated_at: new Date().toISOString()
        })
        .is('user_id', null)
        .eq('theme_name', 'default');

      if (updateError) throw updateError;

      setConfig(newConfig);
      applyCSSVariables(newConfig);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newConfig));

      toast({
        title: "Design System actualizado",
        description: "Los cambios se aplicaron en toda la plataforma.",
      });

      return true;
    } catch (err) {
      console.error('[Design System] Error saving config:', err);
      toast({
        title: "Error al guardar",
        description: err instanceof Error ? err.message : 'No se pudo guardar la configuración',
        variant: "destructive"
      });
      return false;
    }
  }, [applyCSSVariables, toast]);

  // Update specific color
  const updateColor = useCallback((
    category: 'semantic' | 'palettes',
    path: string[],
    value: string
  ) => {
    if (!config) return;

    const newConfig = { ...config };
    
    if (category === 'semantic') {
      newConfig.semantic = {
        ...newConfig.semantic,
        [path[0]]: value
      };
    } else if (category === 'palettes') {
      const [palette, shade] = path;
      newConfig.palettes = {
        ...newConfig.palettes,
        [palette]: {
          ...newConfig.palettes[palette as keyof typeof newConfig.palettes],
          [shade]: value
        }
      };
    }

    // Apply immediately for live preview
    applyCSSVariables(newConfig);
    setConfig(newConfig);
  }, [config, applyCSSVariables]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    try {
      await loadConfig();
      toast({
        title: "Restaurado a valores por defecto",
        description: "El design system se ha restaurado a su configuración original.",
      });
    } catch (err) {
      toast({
        title: "Error al restaurar",
        description: "No se pudo restaurar la configuración por defecto.",
        variant: "destructive"
      });
    }
  }, [loadConfig, toast]);

  // Subscribe to real-time changes
  useEffect(() => {
    loadConfig();

    const channel = supabase
      .channel('design_system_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'design_system_config',
          filter: 'user_id=is.null'
        },
        (payload) => {
          console.log('[Design System] Real-time update received:', payload);
          if (payload.new && 'color_variables' in payload.new) {
            const newConfig = (payload.new as DesignSystemConfig).color_variables as unknown as ColorVariables;
            setConfig(newConfig);
            applyCSSVariables(newConfig);
            localStorage.setItem(CACHE_KEY, JSON.stringify(newConfig));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadConfig, applyCSSVariables]);

  return {
    config,
    isLoading,
    error,
    saveConfig,
    updateColor,
    resetToDefaults,
    reloadConfig: loadConfig
  };
}
