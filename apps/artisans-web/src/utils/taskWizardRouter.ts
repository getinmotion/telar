/**
 * @deprecated Este archivo está obsoleto. Usa agentActionRouter.ts en su lugar.
 * taskWizardRouter.ts será eliminado en futuras versiones.
 * El nuevo sistema agentActionRouter.ts proporciona routing más inteligente
 * basado en agentes y keywords con soporte para modales especializados.
 */

import { AgentTask } from '@/hooks/types/agentTaskTypes';
import { getActionForTask } from './agentActionRouter';

export interface WizardRoute {
  type: 'redirect' | 'generic';
  destination?: string; // URL if redirect
  shouldMarkCompleteOnReturn?: boolean;
  matchedBy?: 'task_id' | 'deliverable_type' | 'agent_keyword' | 'fallback';
  matchedValue?: string;
}

// Exact task ID mappings
const TASK_WIZARD_MAP: Record<string, string> = {
  // Brand tasks
  'brand-visual-identity': '/dashboard/brand-wizard',
  'brand-story': '/dashboard/brand-wizard',
  'brand-identity': '/dashboard/brand-wizard',
  
  // Inventory/Product tasks
  'inventory-first-products-wizard': '/productos/subir',
  'inventory-add-products': '/productos/subir',
  'product-upload': '/productos/subir',
  'inventory-first': '/productos/subir',
};

// Agent + keyword mappings
interface AgentWizardConfig {
  keywords: string[];
  route: string;
}

const AGENT_WIZARD_MAP: Record<string, AgentWizardConfig> = {
  'brand': {
    keywords: ['marca', 'logo', 'identidad', 'visual', 'claim', 'brand', 'identity', 'historia', 'story'],
    route: '/dashboard/brand-wizard'
  },
  'inventory': {
    keywords: ['producto', 'inventario', 'subir', 'agregar', 'product', 'inventory', 'upload', 'catalogo', 'catálogo'],
    route: '/productos/subir'
  },
  'operations-specialist': {
    keywords: ['producto', 'inventario', 'subir', 'agregar', 'product', 'inventory'],
    route: '/productos/subir'
  }
};

export function getWizardRouteForTask(task: AgentTask): WizardRoute {
  console.warn('⚠️ [TaskRouter] DEPRECATED: Use agentActionRouter.getActionForTask() instead');
  
  // Backward compatibility: convert new action system to old format
  const action = getActionForTask(task);
  
  if (action.type === 'wizard' || action.type === 'route') {
    return {
      type: 'redirect',
      destination: action.destination,
      shouldMarkCompleteOnReturn: true,
      matchedBy: 'agent_keyword',
      matchedValue: task.agent_id
    };
  }
  
  return {
    type: 'generic',
    matchedBy: 'fallback'
  };

  // Old logic kept for reference but not used:
  console.log('🔍 [TaskRouter] Evaluating task:', {
    id: task.id,
    title: task.title,
    agent_id: task.agent_id,
    deliverableType: task.deliverableType || (task as any).deliverable_type
  });

  // 1. Check by exact task ID
  if (TASK_WIZARD_MAP[task.id]) {
    console.log('✅ [TaskRouter] Matched by TASK_ID:', task.id, '→', TASK_WIZARD_MAP[task.id]);
    return {
      type: 'redirect',
      destination: TASK_WIZARD_MAP[task.id],
      shouldMarkCompleteOnReturn: true,
      matchedBy: 'task_id',
      matchedValue: task.id
    };
  }

  // 2. Check by deliverableType (supports both camelCase and snake_case from Supabase)
  const deliverableType = task.deliverableType || (task as any).deliverable_type;
  if (deliverableType) {
    console.log('🔍 [TaskRouter] Checking deliverableType:', deliverableType);
    
    if (deliverableType === 'brand_identity_wizard') {
      console.log('✅ [TaskRouter] Matched by DELIVERABLE_TYPE: brand_identity_wizard → /dashboard/brand-wizard');
      return {
        type: 'redirect',
        destination: '/dashboard/brand-wizard',
        shouldMarkCompleteOnReturn: true,
        matchedBy: 'deliverable_type',
        matchedValue: deliverableType
      };
    }
    if (deliverableType === 'product_upload_wizard') {
      console.log('✅ [TaskRouter] Matched by DELIVERABLE_TYPE: product_upload_wizard → /productos/subir');
      return {
        type: 'redirect',
        destination: '/productos/subir',
        shouldMarkCompleteOnReturn: true,
        matchedBy: 'deliverable_type',
        matchedValue: deliverableType
      };
    }
  }

  // 3. Check by agentId + keywords in title
  const agentConfig = AGENT_WIZARD_MAP[task.agent_id];
  if (agentConfig) {
    const titleLower = task.title.toLowerCase();
    const matchedKeyword = agentConfig.keywords.find(keyword => 
      titleLower.includes(keyword.toLowerCase())
    );
    
    if (matchedKeyword) {
      console.log('✅ [TaskRouter] Matched by AGENT_KEYWORD:', {
        agent_id: task.agent_id,
        keyword: matchedKeyword,
        route: agentConfig.route
      });
      return {
        type: 'redirect',
        destination: agentConfig.route,
        shouldMarkCompleteOnReturn: true,
        matchedBy: 'agent_keyword',
        matchedValue: `${task.agent_id}:${matchedKeyword}`
      };
    }
  }

  // Default to generic flow
  console.log('⚪ [TaskRouter] Using GENERIC flow (no wizard match)');
  return {
    type: 'generic',
    matchedBy: 'fallback'
  };
}

export function getWizardName(destination?: string): string {
  if (!destination) return 'herramienta especializada';
  
  if (destination.includes('brand-wizard')) {
    return 'Brand Wizard';
  }
  if (destination.includes('productos/subir')) {
    return 'Product Upload Wizard';
  }
  
  return 'herramienta especializada';
}
