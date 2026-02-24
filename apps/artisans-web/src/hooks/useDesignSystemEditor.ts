import { useState, useCallback } from 'react';
import { useDesignSystemContext } from '@/contexts/DesignSystemContext';
import { ColorVariables } from '@/types/designSystem';
import { toast } from 'sonner';

interface ChangeHistory {
  timestamp: Date;
  category: string;
  path: string[];
  oldValue: string;
  newValue: string;
}

export function useDesignSystemEditor() {
  const { config, saveConfig, updateColor, reloadConfig } = useDesignSystemContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changeHistory, setChangeHistory] = useState<ChangeHistory[]>([]);
  const [previewConfig, setPreviewConfig] = useState<ColorVariables | null>(null);

  const openEditor = useCallback(() => {
    setIsOpen(true);
    setPreviewConfig(config);
  }, [config]);

  const closeEditor = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('¿Cerrar sin guardar? Se perderán los cambios.');
      if (!confirm) return;
      
      // Restaurar configuración original
      if (config) {
        reloadConfig();
      }
    }
    setIsOpen(false);
    setHasUnsavedChanges(false);
    setChangeHistory([]);
    setPreviewConfig(null);
  }, [hasUnsavedChanges, config, reloadConfig]);

  const updatePreviewColor = useCallback((
    category: 'semantic' | 'palettes',
    path: string[],
    value: string
  ) => {
    // Actualizar preview inmediato (CSS variables)
    updateColor(category, path, value);
    
    // Marcar cambios sin guardar
    setHasUnsavedChanges(true);
    
    // Agregar al historial
    const oldValue = category === 'semantic' 
      ? config?.semantic[path[0] as keyof typeof config.semantic] || ''
      : config?.palettes[path[0] as keyof typeof config.palettes]?.[path[1]] || '';
    
    setChangeHistory(prev => [...prev, {
      timestamp: new Date(),
      category,
      path,
      oldValue,
      newValue: value
    }].slice(-10)); // Mantener últimos 10 cambios
  }, [updateColor, config]);

  const updateElementOverride = useCallback((elementId: string, tokenName: string | null) => {
    if (!previewConfig && !config) return;

    const baseConfig = previewConfig || config!;
    const newConfig = { ...baseConfig };
    if (!newConfig.elementOverrides) {
      newConfig.elementOverrides = {};
    }

    if (tokenName === null) {
      delete newConfig.elementOverrides[elementId];
    } else {
      newConfig.elementOverrides[elementId] = tokenName;
    }

    setPreviewConfig(newConfig);
    setHasUnsavedChanges(true);

    // Apply to DOM immediately
    const root = document.documentElement;
    if (tokenName) {
      root.style.setProperty(`--element-${elementId}`, `var(--${tokenName})`);
    } else {
      root.style.removeProperty(`--element-${elementId}`);
    }
  }, [config, previewConfig]);

  const saveChanges = useCallback(async () => {
    const configToSave = previewConfig || config;
    if (!configToSave) return false;
    
    setIsSaving(true);
    const success = await saveConfig(configToSave);
    
    if (success) {
      setHasUnsavedChanges(false);
      setChangeHistory([]);
      setPreviewConfig(null);
      toast.success('Cambios guardados correctamente', {
        description: 'El Design System se ha actualizado en toda la plataforma.'
      });
    } else {
      toast.error('Error al guardar cambios', {
        description: 'Por favor intenta nuevamente.'
      });
    }
    
    setIsSaving(false);
    return success;
  }, [config, previewConfig, saveConfig]);

  const discardChanges = useCallback(() => {
    const confirm = window.confirm('¿Descartar todos los cambios?');
    if (!confirm) return;
    
    reloadConfig();
    setHasUnsavedChanges(false);
    setChangeHistory([]);
    toast.info('Cambios descartados');
  }, [reloadConfig]);

  const exportConfig = useCallback(() => {
    if (!config) return;
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `design-system-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Configuración exportada');
  }, [config]);

  return {
    isOpen,
    openEditor,
    closeEditor,
    config,
    isSaving,
    hasUnsavedChanges,
    changeHistory,
    updatePreviewColor,
    updateElementOverride,
    saveChanges,
    discardChanges,
    exportConfig
  };
}
