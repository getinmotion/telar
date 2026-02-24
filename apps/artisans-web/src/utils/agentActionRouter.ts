/**
 * Agent Action Router
 * Sistema inteligente de routing que mapea tareas a acciones específicas por agente
 */

import { AgentTask } from '@/hooks/useAgentTasks';
import { AllowedAgent, isAllowedAgent } from '@/config/allowedAgents';

export interface AgentAction {
  type: 'wizard' | 'modal' | 'chat' | 'route';
  destination?: string; // URL si es wizard/route
  component?: string; // Component name si es modal
  label: string; // CTA button text
  icon: string;
}

interface AgentConfig {
  defaultAction: AgentAction;
  keywordActions: { keywords: string[]; action: AgentAction }[];
}

export const AGENT_ACTION_MAP: Record<AllowedAgent, AgentConfig> = {
  growth: {
    defaultAction: {
      type: 'chat',
      label: 'Iniciar Misión de Crecimiento',
      icon: '💬'
    },
    keywordActions: [
      {
        keywords: ['madurez', 'maturity', 'test', 'evaluación', 'diagnóstico', 'evalúa'],
        action: {
          type: 'wizard',
          destination: '/maturity-calculator',
          label: 'Hacer Test de Madurez',
          icon: '📊'
        }
      },
      {
        keywords: ['negocio', 'business', 'plan', 'estrategia', 'planificar'],
        action: {
          type: 'modal',
          component: 'BusinessPlanModal',
          label: 'Planificar Negocio',
          icon: '📝'
        }
      },
      {
        keywords: ['contexto', 'perfil', 'cuéntame', 'describe', 'descripción'],
        action: {
          type: 'wizard',
          destination: '/dashboard/business-profile',
          label: 'Completar Perfil de Negocio',
          icon: '👤'
        }
      }
    ]
  },
  inventory: {
    defaultAction: {
      type: 'route',
      destination: '/dashboard/inventory',
      label: 'Gestionar Inventario',
      icon: '📦'
    },
    keywordActions: [
      {
        keywords: ['producto', 'product', 'subir', 'upload', 'agregar', 'añadir', 'primer', 'first'],
        action: {
          type: 'wizard',
          destination: '/productos/subir',
          label: 'Subir Producto',
          icon: '📸'
        }
      },
      {
        keywords: ['tienda', 'shop', 'crear', 'create', 'publicar', 'store'],
        action: {
          type: 'wizard',
          destination: '/dashboard/create-shop',
          label: 'Crear Tienda',
          icon: '🏪'
        }
      },
      {
        keywords: ['catálogo', 'catalog', 'organizar', 'organize', 'ordenar'],
        action: {
          type: 'modal',
          component: 'InventoryOrganizerModal',
          label: 'Organizar Catálogo',
          icon: '📋'
        }
      },
      {
        keywords: ['materiales', 'materials', 'tiempo', 'time', 'producción', 'production'],
        action: {
          type: 'wizard',
          destination: '/productos/subir',
          label: 'Configurar Materiales y Tiempos',
          icon: '⏱️'
        }
      }
    ]
  },
  'digital-presence': {
    defaultAction: {
      type: 'chat',
      label: 'Iniciar Misión de Presencia Digital',
      icon: '💬'
    },
    keywordActions: [
      {
        keywords: ['marca', 'brand', 'logo', 'colores', 'colors', 'identidad', 'identity', 'claim', 'visual'],
        action: {
          type: 'wizard',
          destination: '/dashboard/brand-wizard',
          label: 'Abrir Brand Wizard',
          icon: '🎨'
        }
      },
      {
        keywords: ['redes', 'social', 'instagram', 'facebook', 'contenido', 'content', 'publicar', 'post'],
        action: {
          type: 'modal',
          component: 'SocialMediaPlannerModal',
          label: 'Planificar Redes Sociales',
          icon: '📱'
        }
      },
      {
        keywords: ['tienda', 'shop', 'publicar', 'publish', 'online', 'web', 'sitio', 'revisar', 'apariencia'],
        action: {
          type: 'route',
          destination: '/mi-tienda',
          label: 'Ver Tienda Pública',
          icon: '🏪'
        }
      },
      {
        keywords: ['encabezado', 'header', 'banner', 'imagen', 'portada', 'configurar'],
        action: {
          type: 'route',
          destination: '/dashboard/create-shop',
          label: 'Configurar Apariencia de Tienda',
          icon: '🎨'
        }
      }
    ]
  },
  brand: {
    defaultAction: {
      type: 'wizard',
      destination: '/dashboard/brand-wizard',
      label: 'Iniciar Misión de Marca',
      icon: '🎨'
    },
    keywordActions: [
      {
        keywords: ['diagnóstico', 'diagnostic', 'evaluar', 'evaluate', 'análisis', 'revisar', 'coherencia'],
        action: {
          type: 'wizard',
          destination: '/dashboard/brand-wizard?mode=diagnostic',
          label: 'Diagnóstico de Marca',
          icon: '🔍'
        }
      },
      {
        keywords: ['logo', 'crear', 'create', 'diseño', 'subir', 'definir'],
        action: {
          type: 'wizard',
          destination: '/dashboard/brand-wizard?step=logo',
          label: 'Crear/Editar Logo',
          icon: '🎨'
        }
      },
      {
        keywords: ['colores', 'colors', 'paleta', 'palette', 'color'],
        action: {
          type: 'wizard',
          destination: '/dashboard/brand-wizard?step=colors',
          label: 'Definir Colores',
          icon: '🎨'
        }
      },
      {
        keywords: ['claim', 'tagline', 'eslogan', 'mensaje', 'lema'],
        action: {
          type: 'wizard',
          destination: '/dashboard/brand-wizard?step=claim',
          label: 'Crear Claim',
          icon: '✨'
        }
      },
      {
        keywords: ['tipografía', 'typography', 'fuente', 'font', 'letra'],
        action: {
          type: 'wizard',
          destination: '/dashboard/brand-wizard?step=typography',
          label: 'Definir Tipografía',
          icon: '🔤'
        }
      }
    ]
  }
};

/**
 * Detecta la acción apropiada para una tarea basándose en agent_id + keywords
 */
export function getActionForTask(task: AgentTask): AgentAction {
  const agentId = task.agent_id;
  
  // Verificar si es agente permitido
  if (!isAllowedAgent(agentId)) {
    console.log('⚠️ [AgentActionRouter] Agent not allowed:', agentId);
    return {
      type: 'chat',
      label: 'Chatear con Agente',
      icon: '💬'
    };
  }
  
  const agentConfig = AGENT_ACTION_MAP[agentId];
  const searchText = `${task.title} ${task.description || ''}`.toLowerCase();
  
  // Buscar acción específica por keywords
  for (const keywordAction of agentConfig.keywordActions) {
    const matchedKeyword = keywordAction.keywords.find(kw => 
      searchText.includes(kw.toLowerCase())
    );
    
    if (matchedKeyword) {
      console.log(`✅ [AgentActionRouter] Matched keyword "${matchedKeyword}" for task: ${task.title}`);
      return keywordAction.action;
    }
  }
  
  // Fallback a acción por defecto del agente
  console.log(`⚪ [AgentActionRouter] Using default action for agent: ${agentId}`);
  return agentConfig.defaultAction;
}

/**
 * Obtiene el nombre del wizard/modal para mostrar en UI
 */
export function getActionName(action: AgentAction): string {
  if (action.type === 'wizard' && action.destination) {
    if (action.destination.includes('brand-wizard')) return 'Brand Wizard';
    if (action.destination.includes('productos/subir')) return 'Wizard de Productos';
    if (action.destination.includes('maturity-calculator')) return 'Test de Madurez';
    if (action.destination.includes('create-shop')) return 'Configuración de Tienda';
  }
  
  if (action.type === 'modal' && action.component) {
    return action.component.replace('Modal', '');
  }
  
  return action.label;
}
