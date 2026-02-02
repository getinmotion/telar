
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { 
  Calculator, 
  Scale, 
  TrendingUp, 
  Palette, 
  Settings, 
  Target, 
  FileText, 
  Users, 
  User,
  HelpCircle
} from 'lucide-react';

interface SafeAgentIconProps {
  iconName: string;
  className?: string;
}

// Mapa seguro de iconos - nunca falla
const ICON_MAP: Record<string, LucideIcon> = {
  'Calculator': Calculator,
  'Scale': Scale,
  'TrendingUp': TrendingUp,
  'Palette': Palette,
  'Settings': Settings,
  'Target': Target,
  'FileText': FileText,
  'Users': Users,
  'User': User,
  'default': HelpCircle
};

export const SafeAgentIcon: React.FC<SafeAgentIconProps> = ({ 
  iconName, 
  className = "w-6 h-6" 
}) => {
  // Siempre devuelve un icono válido
  const IconComponent = ICON_MAP[iconName] || ICON_MAP.default;
  
  return <IconComponent className={className} />;
};
