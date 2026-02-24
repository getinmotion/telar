import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { hexToHSL, hexToRgb, convertLegacyToNewPalette } from '@/utils/colorUtils';

interface ShopTheme {
  themeId?: string;
  palette?: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    accent: Record<string, string>;
    neutral: Record<string, string>;
    success: Record<string, string>;
    warning: Record<string, string>;
    error: Record<string, string>;
    info: Record<string, string>;
  };
  styleContext?: {
    tone: string;
    emotion: string;
    contrastMode: string;
    textureHint: string;
  };
  usageRules?: Record<string, string>;
  brandClaim?: string;
  logoUrl?: string;
  // Legacy support
  primaryColors?: string[];
  secondaryColors?: string[];
}

interface ShopThemeContextValue {
  theme: ShopTheme;
  getPrimaryColor: (shade?: number) => string;
  getSecondaryColor: (shade?: number) => string;
  getAccentColor: (shade?: number) => string;
  getNeutralColor: (shade?: number) => string;
  getSuccessColor: () => string;
  getWarningColor: () => string;
  getErrorColor: () => string;
  getInfoColor: () => string;
  getPrimaryGradient: () => string;
  getOverlayGradient: () => string;
  getButtonStyles: () => { bg: string; hover: string; text: string };
  applyThemeColors: () => void;
}

const ShopThemeContext = createContext<ShopThemeContextValue | null>(null);

interface ShopThemeProviderProps {
  theme: ShopTheme;
  children: React.ReactNode;
}

export const ShopThemeProvider: React.FC<ShopThemeProviderProps> = ({ theme, children }) => {
  // Normalize theme (convert legacy to new format if needed)
  const normalizedTheme = useMemo(() => {
    if (theme.palette) {
      return theme;
    }
    // Convert legacy format
    if (theme.primaryColors || theme.secondaryColors) {
      return {
        ...theme,
        palette: convertLegacyToNewPalette(theme.primaryColors, theme.secondaryColors)
      };
    }
    // Return default theme
    return {
      ...theme,
      palette: convertLegacyToNewPalette()
    };
  }, [theme]);

  const getPrimaryColor = (shade: number = 500) => {
    return normalizedTheme.palette?.primary?.[shade.toString()] || '#6366f1';
  };

  const getSecondaryColor = (shade: number = 500) => {
    return normalizedTheme.palette?.secondary?.[shade.toString()] || '#8b5cf6';
  };

  const getAccentColor = (shade: number = 500) => {
    return normalizedTheme.palette?.accent?.[shade.toString()] || getSecondaryColor(shade);
  };

  const getNeutralColor = (shade: number = 500) => {
    return normalizedTheme.palette?.neutral?.[shade.toString()] || '#78716c';
  };

  const getSuccessColor = () => {
    return normalizedTheme.palette?.success?.['500'] || '#3AA76D';
  };

  const getWarningColor = () => {
    return normalizedTheme.palette?.warning?.['500'] || '#E9B64F';
  };

  const getErrorColor = () => {
    return normalizedTheme.palette?.error?.['500'] || '#E04F5F';
  };

  const getInfoColor = () => {
    return normalizedTheme.palette?.info?.['500'] || '#4D8DE3';
  };

  const getPrimaryGradient = () => {
    const color1 = getPrimaryColor(400);
    const color2 = getPrimaryColor(600);
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };

  const getOverlayGradient = () => {
    const color = getPrimaryColor(500);
    return `linear-gradient(to bottom, ${color}00, ${color}99)`;
  };

  const getButtonStyles = () => {
    return {
      bg: getPrimaryColor(500),
      hover: getPrimaryColor(700),
      text: getNeutralColor(50)
    };
  };

  const applyThemeColors = () => {
    if (typeof document === 'undefined' || !normalizedTheme.palette) return;

    const root = document.documentElement;
    
    // Apply all color scales
    Object.entries(normalizedTheme.palette).forEach(([colorName, shades]) => {
      Object.entries(shades).forEach(([shade, hexValue]) => {
        root.style.setProperty(`--shop-${colorName}-${shade}`, hexToHSL(hexValue));
        root.style.setProperty(`--shop-${colorName}-${shade}-rgb`, hexToRgb(hexValue));
      });
    });
    
    // Apply main colors for backward compatibility
    root.style.setProperty('--shop-primary', hexToHSL(getPrimaryColor(500)));
    root.style.setProperty('--shop-primary-rgb', hexToRgb(getPrimaryColor(500)));
    root.style.setProperty('--shop-secondary', hexToHSL(getSecondaryColor(500)));
    root.style.setProperty('--shop-secondary-rgb', hexToRgb(getSecondaryColor(500)));
    
    // Apply gradients
    root.style.setProperty('--shop-gradient-primary', getPrimaryGradient());
    root.style.setProperty('--shop-gradient-overlay', getOverlayGradient());
  };

  useEffect(() => {
    applyThemeColors();
  }, [theme]);

  const value = useMemo(
    () => ({
      theme: normalizedTheme,
      getPrimaryColor,
      getSecondaryColor,
      getAccentColor,
      getNeutralColor,
      getSuccessColor,
      getWarningColor,
      getErrorColor,
      getInfoColor,
      getPrimaryGradient,
      getOverlayGradient,
      getButtonStyles,
      applyThemeColors,
    }),
    [normalizedTheme]
  );

  return (
    <ShopThemeContext.Provider value={value}>
      {children}
    </ShopThemeContext.Provider>
  );
};

export const useShopTheme = () => {
  const context = useContext(ShopThemeContext);
  if (!context) {
    throw new Error('useShopTheme must be used within ShopThemeProvider');
  }
  return context;
};
