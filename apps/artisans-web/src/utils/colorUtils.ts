// Color utility functions for theme system

import { HSLColor } from '@/types/designSystem';

/**
 * Parse HSL string to HSLColor object
 * @example "220 50% 15%" => { h: 220, s: 50, l: 15 }
 */
export function parseHSL(hslString: string): HSLColor {
  const parts = hslString.trim().split(/\s+/);
  return {
    h: parseInt(parts[0]),
    s: parseInt(parts[1].replace('%', '')),
    l: parseInt(parts[2].replace('%', ''))
  };
}

/**
 * Format HSLColor object to HSL string
 * @example { h: 220, s: 50, l: 15 } => "220 50% 15%"
 */
export function formatHSL(color: HSLColor): string {
  return `${color.h} ${color.s}% ${color.l}%`;
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Calculate WCAG 2.1 AA contrast ratio between two colors (HSL strings)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hslStr: string): number => {
    const hsl = parseHSL(hslStr);
    const hex = hslToHex(hsl.h, hsl.s, hsl.l);
    return getLuminanceFromHex(hex);
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminanceFromHex(hex: string): number {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const toLinear = (val: number) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  };
  
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Check if contrast ratio meets WCAG 2.1 AA standard (4.5:1 for normal text)
 */
export function meetsWCAG_AA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG 2.1 AAA standard (7:1 for normal text)
 */
export function meetsWCAG_AAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

export function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${h} ${s}% ${lPercent}%`;
}

export function hexToRgb(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function validateContrast(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7
  };
}

function getLuminance(hex: string): number {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const toLinear = (val: number) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  };
  
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function inferEmotionsFromDescription(description: string): string[] {
  const emotions: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  // Emotion keywords mapping
  const emotionMap: Record<string, string> = {
    'natural': 'natural',
    'artesanal': 'auténtico',
    'tradicional': 'tradicional',
    'moderno': 'moderno',
    'elegante': 'elegante',
    'rústico': 'rústico',
    'cálido': 'cálido',
    'fresco': 'fresco',
    'minimalista': 'minimalista',
    'vibrante': 'vibrante',
    'sostenible': 'ecológico',
    'ecológico': 'ecológico',
    'orgánico': 'orgánico',
    'auténtico': 'auténtico',
    'único': 'único',
    'artístico': 'creativo',
    'creativo': 'creativo',
    'innovador': 'innovador',
    'clásico': 'atemporal'
  };
  
  Object.entries(emotionMap).forEach(([keyword, emotion]) => {
    if (lowerDesc.includes(keyword) && !emotions.includes(emotion)) {
      emotions.push(emotion);
    }
  });
  
  // Default emotions if none found
  if (emotions.length === 0) {
    emotions.push('natural', 'auténtico', 'artesanal');
  }
  
  return emotions;
}

interface ColorPalette {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  accent: Record<string, string>;
  neutral: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
  info: Record<string, string>;
}

export function convertLegacyToNewPalette(
  primaryColors?: string[], 
  secondaryColors?: string[]
): ColorPalette {
  const defaultPrimary = '#6366f1';
  const defaultSecondary = '#8b5cf6';
  
  const primary = primaryColors?.[0] || defaultPrimary;
  const primaryHover = primaryColors?.[1] || primary;
  const secondary = secondaryColors?.[0] || defaultSecondary;
  const secondaryHover = secondaryColors?.[1] || secondary;
  
  return {
    primary: {
      '50': lighten(primary, 0.9),
      '100': lighten(primary, 0.8),
      '200': lighten(primary, 0.6),
      '300': lighten(primary, 0.4),
      '400': lighten(primary, 0.2),
      '500': primary,
      '600': darken(primary, 0.1),
      '700': primaryHover,
      '800': darken(primary, 0.3),
      '900': darken(primary, 0.5)
    },
    secondary: {
      '50': lighten(secondary, 0.9),
      '100': lighten(secondary, 0.8),
      '200': lighten(secondary, 0.6),
      '300': lighten(secondary, 0.4),
      '400': lighten(secondary, 0.2),
      '500': secondary,
      '600': darken(secondary, 0.1),
      '700': secondaryHover,
      '800': darken(secondary, 0.3),
      '900': darken(secondary, 0.5)
    },
    accent: {
      '500': secondary
    },
    neutral: {
      '50': '#fafaf9',
      '100': '#f5f5f4',
      '200': '#e7e5e4',
      '300': '#d6d3d1',
      '400': '#a8a29e',
      '500': '#78716c',
      '600': '#57534e',
      '700': '#44403c',
      '800': '#292524',
      '900': '#1c1917'
    },
    success: { '500': '#3AA76D' },
    warning: { '500': '#E9B64F' },
    error: { '500': '#E04F5F' },
    info: { '500': '#4D8DE3' }
  };
}

function lighten(hex: string, amount: number): string {
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, ((num >> 16) + Math.round((255 - (num >> 16)) * amount)));
  const g = Math.min(255, (((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * amount)));
  const b = Math.min(255, ((num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function darken(hex: string, amount: number): string {
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, ((num >> 16) - Math.round((num >> 16) * amount)));
  const g = Math.max(0, (((num >> 8) & 0x00FF) - Math.round(((num >> 8) & 0x00FF) * amount)));
  const b = Math.max(0, ((num & 0x0000FF) - Math.round((num & 0x0000FF) * amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
