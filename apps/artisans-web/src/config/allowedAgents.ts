/**
 * Allowed Agents Configuration
 * Matches the backend validation in master-agent-coordinator
 */

export const ALLOWED_AGENTS = ['growth', 'inventory', 'digital-presence', 'brand'] as const;

export const BLOCKED_AGENTS = [
  'legal',
  'pricing',
  'cultural-consultant',
  'marketing-specialist',
  'personal-brand-eval',
  'financial-management',
  'operations-specialist',
  'business-intelligence',
  'expansion-specialist'
] as const;

export type AllowedAgent = typeof ALLOWED_AGENTS[number];

/**
 * Mapeo de agent_ids legacy a los permitidos actuales
 * Mantiene compatibilidad con tareas antiguas
 */
export const LEGACY_AGENT_MAPPING: Record<string, AllowedAgent> = {
  'create_shop': 'inventory',
  'create_brand': 'brand',
  'market-researcher': 'growth',
  'brand-consultant': 'digital-presence',
  'price-consultant': 'growth',
  'legal': 'growth',
  'pricing': 'growth',
  'cultural-consultant': 'digital-presence',
  'marketing-specialist': 'digital-presence',
  'personal-brand-eval': 'brand',
  'financial-management': 'growth',
  'operations-specialist': 'inventory',
  'business-intelligence': 'growth',
  'expansion-specialist': 'growth'
};

export const AGENT_DISPLAY_INFO: Record<AllowedAgent, { 
  name: string; 
  icon: string; 
  color: string;
  description: string;
}> = {
  growth: {
    name: 'Crecimiento',
    icon: '📈',
    color: 'bg-primary/10 text-primary border-primary/20',
    description: 'Estrategia y desarrollo de negocio'
  },
  inventory: {
    name: 'Producto & Tienda',
    icon: '📦',
    color: 'bg-secondary/10 text-secondary border-secondary/20',
    description: 'Gestión de inventario y catálogo'
  },
  'digital-presence': {
    name: 'Presencia Digital',
    icon: '🌐',
    color: 'bg-accent/10 text-accent border-accent/20',
    description: 'Visibilidad online y redes'
  },
  brand: {
    name: 'Marca',
    icon: '🎨',
    color: 'bg-success/10 text-success border-success/20',
    description: 'Identidad visual y branding'
  }
};

/**
 * Normaliza un agent_id legacy a un agent permitido actual
 * Retorna null si no es válido
 */
export const normalizeAgentId = (agentId: string): AllowedAgent | null => {
  if (ALLOWED_AGENTS.includes(agentId as AllowedAgent)) {
    return agentId as AllowedAgent;
  }
  return LEGACY_AGENT_MAPPING[agentId] || null;
};

/**
 * Verifica si un agentId es permitido (incluyendo legacy)
 */
export const isAllowedAgent = (agentId: string): agentId is AllowedAgent => {
  return normalizeAgentId(agentId) !== null;
};

export const getAgentDisplayInfo = (agentId: string) => {
  if (isAllowedAgent(agentId)) {
    return AGENT_DISPLAY_INFO[agentId];
  }
  return {
    name: 'Desconocido',
    icon: '❓',
    color: 'bg-muted/10 text-muted-foreground border-muted/20',
    description: 'Agente no disponible'
  };
};
