import React from 'react';
import { 
  FileText, 
  Palette, 
  Store, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Globe, 
  Package, 
  Scale,
  HelpCircle,
  Calculator,
  Users,
  Target,
  Settings,
  type LucideIcon
} from 'lucide-react';

/**
 * Mapa centralizado de iconos del sistema
 * Todos los componentes deben usar este mapa para consistencia
 */
export const SYSTEM_ICON_MAP: Record<string, LucideIcon> = {
  // Milestone icons
  FileText,
  Palette,
  Store,
  DollarSign,
  Star,
  TrendingUp,
  Globe,
  Package,
  Scale,
  
  // Agent icons
  Calculator,
  Users,
  Target,
  Settings,
  
  // Fallback
  HelpCircle
};

export interface SystemIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Componente centralizado para renderizar iconos del sistema
 * Usa nombres de iconos Lucide en lugar de emojis
 */
export const SystemIcon: React.FC<SystemIconProps> = ({ 
  name, 
  className = "w-5 h-5",
  size
}) => {
  const IconComponent = SYSTEM_ICON_MAP[name] || SYSTEM_ICON_MAP.HelpCircle;
  
  return <IconComponent className={className} size={size} />;
};

/**
 * Helper para obtener el componente de icono directamente
 */
export const getSystemIcon = (name: string): LucideIcon => {
  return SYSTEM_ICON_MAP[name] || SYSTEM_ICON_MAP.HelpCircle;
};
