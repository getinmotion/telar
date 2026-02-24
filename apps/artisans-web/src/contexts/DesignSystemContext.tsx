import React, { createContext, useContext, ReactNode } from 'react';
import { ColorVariables } from '@/types/designSystem';
import { useDesignSystem } from '@/hooks/useDesignSystem';

interface DesignSystemContextValue {
  config: ColorVariables | null;
  isLoading: boolean;
  error: string | null;
  saveConfig: (newConfig: ColorVariables) => Promise<boolean>;
  updateColor: (category: 'semantic' | 'palettes', path: string[], value: string) => void;
  resetToDefaults: () => Promise<void>;
  reloadConfig: () => Promise<void>;
}

const DesignSystemContext = createContext<DesignSystemContextValue | null>(null);

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  const designSystem = useDesignSystem();

  return (
    <DesignSystemContext.Provider value={designSystem}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystemContext() {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystemContext must be used within DesignSystemProvider');
  }
  return context;
}
