/**
 * System Configuration - Centralización de Configuraciones del Sistema
 * 
 * IMPORTANTE: Todas las configuraciones del sistema deben estar aquí
 * para evitar hardcodeo y facilitar actualizaciones centralizadas.
 */

export interface MilestoneDisplayConfig {
  icon: string;
  color: string;
  label: string;
}

export interface LevelProgressionConfig {
  level: number;
  title: string;
  color: string;
  minXP: number;
  maxXP: number;
  benefits: string[];
}

export interface AgentConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Configuración visual de milestones
 */
export const MILESTONE_DISPLAY_CONFIG: Record<string, MilestoneDisplayConfig> = {
  formalization: { 
    icon: 'FileText', 
    color: 'moss-green',
    label: 'Formalización'
  },
  brand: { 
    icon: 'Palette', 
    color: 'golden-hour',
    label: 'Identidad de Marca'
  },
  shop: { 
    icon: 'Store', 
    color: 'terracotta',
    label: 'Tienda Online'
  },
  sales: { 
    icon: 'DollarSign', 
    color: 'clay-red',
    label: 'Ventas'
  },
  community: { 
    icon: 'Star', 
    color: 'moss-green',
    label: 'Comunidad'
  }
};

/**
 * Configuración de progresión de niveles (Gamification)
 */
export const LEVEL_PROGRESSION_CONFIG: LevelProgressionConfig[] = [
  { 
    level: 1, 
    title: 'Aprendiz Artesano', 
    color: 'text-muted-foreground',
    minXP: 0,
    maxXP: 100,
    benefits: ['Acceso al Camino del Artesano', 'Chat con Coordinador Maestro']
  },
  { 
    level: 2, 
    title: 'Artesano en Formación', 
    color: 'text-moss-green-600',
    minXP: 100,
    maxXP: 300,
    benefits: ['Diagnóstico de Marca', 'Asistentes especializados']
  },
  { 
    level: 3, 
    title: 'Artesano Competente', 
    color: 'text-golden-hour-600',
    minXP: 300,
    maxXP: 600,
    benefits: ['Analytics avanzados', 'Certificado digital']
  },
  { 
    level: 4, 
    title: 'Maestro Artesano', 
    color: 'text-terracotta-600',
    minXP: 600,
    maxXP: 1000,
    benefits: ['Mentor de otros artesanos', 'Prioridad en soporte']
  },
  { 
    level: 5, 
    title: 'Gran Maestro', 
    color: 'text-primary',
    minXP: 1000,
    maxXP: Infinity,
    benefits: ['Embajador del programa', 'Acceso a eventos exclusivos']
  }
];

/**
 * Configuración de los 6 agentes del sistema
 */
export const AGENTS_CONFIG: Record<string, AgentConfig> = {
  growth: {
    id: 'growth',
    name: 'Agente de Crecimiento',
    icon: 'TrendingUp',
    color: 'moss-green',
    description: 'Estrategia de crecimiento y objetivos'
  },
  pricing: {
    id: 'pricing',
    name: 'Agente de Precios',
    icon: 'DollarSign',
    color: 'golden-hour',
    description: 'Estrategias de precios y monetización'
  },
  brand: {
    id: 'brand',
    name: 'Agente de Marca',
    icon: 'Palette',
    color: 'terracotta',
    description: 'Identidad visual y branding'
  },
  'digital-presence': {
    id: 'digital-presence',
    name: 'Agente de Presencia Digital',
    icon: 'Globe',
    color: 'clay-red',
    description: 'Redes sociales y presencia online'
  },
  inventory: {
    id: 'inventory',
    name: 'Agente de Inventario',
    icon: 'Package',
    color: 'wood-brown',
    description: 'Gestión de productos y catálogo'
  },
  legal: {
    id: 'legal',
    name: 'Agente Legal',
    icon: 'Scale',
    color: 'moss-green',
    description: 'Formalización y aspectos legales'
  }
};

/**
 * Iconos para achievements/logros
 */
export const ACHIEVEMENT_ICONS: Record<string, string> = {
  trophy: '🏆',
  star: '⭐',
  award: '🏅',
  target: '🎯',
  crown: '👑',
  flame: '🔥'
};

/**
 * Helper: Obtener configuración de nivel por XP
 */
export function getLevelByXP(xp: number): LevelProgressionConfig {
  for (let i = LEVEL_PROGRESSION_CONFIG.length - 1; i >= 0; i--) {
    const config = LEVEL_PROGRESSION_CONFIG[i];
    if (xp >= config.minXP) {
      return config;
    }
  }
  return LEVEL_PROGRESSION_CONFIG[0];
}

/**
 * Helper: Calcular progreso dentro del nivel actual
 */
export function calculateLevelProgress(xp: number): { 
  currentLevel: LevelProgressionConfig;
  nextLevel: LevelProgressionConfig | null;
  progressPercentage: number;
  xpToNext: number;
} {
  const currentLevel = getLevelByXP(xp);
  const currentIndex = LEVEL_PROGRESSION_CONFIG.findIndex(l => l.level === currentLevel.level);
  const nextLevel = currentIndex < LEVEL_PROGRESSION_CONFIG.length - 1 
    ? LEVEL_PROGRESSION_CONFIG[currentIndex + 1] 
    : null;
  
  const xpInLevel = xp - currentLevel.minXP;
  const xpNeededForLevel = currentLevel.maxXP - currentLevel.minXP;
  const progressPercentage = Math.min((xpInLevel / xpNeededForLevel) * 100, 100);
  const xpToNext = nextLevel ? nextLevel.minXP - xp : 0;
  
  return {
    currentLevel,
    nextLevel,
    progressPercentage,
    xpToNext
  };
}
