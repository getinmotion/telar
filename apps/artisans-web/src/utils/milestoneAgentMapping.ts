/**
 * Milestone → Agent Mapping
 * 
 * Define qué agentes pertenecen a cada milestone del Camino del Artesano.
 * Cada milestone tiene agentes específicos que pueden generar tareas para ese hito.
 */

export const MILESTONE_AGENT_MAPPING: Record<string, string[]> = {
  formalization: ['legal', 'growth'],
  brand: ['digital-presence', 'growth'],
  shop: ['inventory', 'digital-presence', 'growth'],
  sales: ['pricing', 'growth'],
  community: ['digital-presence', 'growth']
};

export interface MilestoneCategoryInfo {
  id: string;
  label: string;
  keywords: string[];
  agents: string[];
  description: string;
}

export const MILESTONE_CATEGORIES: Record<string, MilestoneCategoryInfo> = {
  formalization: {
    id: 'formalization',
    label: 'Formalización',
    keywords: ['RUT', 'legal', 'registro', 'formalización', 'impuestos', 'trámites'],
    agents: ['legal', 'growth'],
    description: 'Registro legal del negocio, obtención de RUT, formalización tributaria'
  },
  brand: {
    id: 'brand',
    label: 'Identidad de Marca',
    keywords: ['logo', 'colores', 'identidad', 'marca', 'branding', 'diseño', 'paleta', 'claim'],
    agents: ['digital-presence', 'growth'],
    description: 'Creación de logo, definición de colores, identidad visual de la marca'
  },
  shop: {
    id: 'shop',
    label: 'Tienda Online',
    keywords: ['tienda', 'productos', 'inventario', 'catálogo', 'e-commerce', 'fotos', 'descripciones'],
    agents: ['inventory', 'digital-presence', 'growth'],
    description: 'Creación de tienda online, carga de productos, gestión de inventario'
  },
  sales: {
    id: 'sales',
    label: 'Ventas',
    keywords: ['precios', 'ventas', 'monetización', 'ingresos', 'conversión', 'estrategia', 'clientes'],
    agents: ['pricing', 'growth'],
    description: 'Definición de precios, estrategias de venta, conversión de clientes'
  },
  community: {
    id: 'community',
    label: 'Comunidad',
    keywords: ['redes sociales', 'comunidad', 'engagement', 'audiencia', 'instagram', 'facebook', 'contenido'],
    agents: ['digital-presence', 'growth'],
    description: 'Construcción de comunidad, redes sociales, engagement con audiencia'
  }
};

/**
 * Infiere el milestone_category basado en el agent_id
 */
export function inferMilestoneFromAgent(agentId: string): string | null {
  for (const [milestone, agents] of Object.entries(MILESTONE_AGENT_MAPPING)) {
    if (agents.includes(agentId)) {
      // Si el agente pertenece a múltiples milestones, retornar el primero
      // (growth está en todos, así que se usará el contexto del usuario)
      if (agentId === 'growth') continue;
      return milestone;
    }
  }
  return null;
}

/**
 * Obtiene los agentes permitidos para un milestone específico
 */
export function getAllowedAgentsForMilestone(milestoneId: string): string[] {
  return MILESTONE_AGENT_MAPPING[milestoneId] || [];
}

/**
 * Valida si un agente puede generar tareas para un milestone
 */
export function isAgentAllowedForMilestone(agentId: string, milestoneId: string): boolean {
  const allowedAgents = MILESTONE_AGENT_MAPPING[milestoneId];
  return allowedAgents ? allowedAgents.includes(agentId) : false;
}
