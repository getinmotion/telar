/**
 * Event Registry - Documentación Central de Eventos del Sistema
 * 
 * Este archivo documenta TODOS los eventos del sistema, sus publishers y consumers.
 * Sirve como referencia única para entender el flujo de eventos en la aplicación.
 * 
 * REGLA CRÍTICA: El Coordinador Maestro debe estar suscrito a todos los eventos
 * marcados como [MASTER] para mantener sincronización completa.
 */

export type SystemEvent =
  | 'store.synced'
  | 'brand.reviewed'
  | 'brand.updated'
  | 'brand.logo.uploaded'
  | 'brand.colors.updated'
  | 'brand.wizard.completed'
  | 'inventory.synced'
  | 'inventory.updated'
  | 'product.wizard.completed'
  | 'shop.wizard.completed'
  | 'pricing.updated'
  | 'shop.published'
  | 'shop.created'
  | 'legal.nit.pending'
  | 'legal.nit.completed'
  | 'growth.plan.ready'
  | 'perfil.synced'
  | 'marca.synced'
  | 'tienda.synced'
  | 'inventario.synced'
  | 'presence.synced'
  | 'i18n.synced'
  | 'master.context.updated'
  | 'master.full.sync'
  | 'task.updated'
  | 'deliverable.created'
  | 'profile.updated'
  | 'business.updated'
  | 'business.profile.updated'
  | 'maturity.assessment.completed'
  | 'gamification.xp_gained'
  | 'maturity.score_updated'
  | 'debug.data.cleared'
  | 'task.completed.check.generation'
  | 'milestone.completed'
  | 'milestone.unlocked'
  | 'milestone.almost.complete'
  | 'milestone.tasks.generated';

export interface EventMetadata {
  event: SystemEvent;
  description: string;
  publishers: string[];
  consumers: string[];
  requiresMasterCoordinator: boolean;
  dataStructure: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Registro completo de eventos del sistema
 */
export const EVENT_REGISTRY: Record<SystemEvent, EventMetadata> = {
  // ========== MILESTONE EVENTS [CRITICAL] ==========
  'milestone.completed': {
    event: 'milestone.completed',
    description: 'Milestone completado al 100%',
    publishers: ['useUnifiedProgress', 'progressCalculator'],
    consumers: ['useMilestoneNotifications', 'MasterCoordinatorContext', 'user_achievements'],
    requiresMasterCoordinator: true,
    dataStructure: '{ milestoneId: string, milestoneName: string, userId: string }',
    priority: 'critical'
  },
  
  'milestone.unlocked': {
    event: 'milestone.unlocked',
    description: 'Nuevo milestone desbloqueado (locked → active)',
    publishers: ['useUnifiedProgress', 'progressCalculator'],
    consumers: ['useMilestoneNotifications', 'MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ milestoneId: string, milestoneName: string, userId: string }',
    priority: 'high'
  },
  
  'milestone.almost.complete': {
    event: 'milestone.almost.complete',
    description: 'Milestone casi completo (≥80%)',
    publishers: ['useUnifiedProgress'],
    consumers: ['useMilestoneNotifications'],
    requiresMasterCoordinator: false,
    dataStructure: '{ milestoneId: string, progress: number, tasksLeft: number }',
    priority: 'medium'
  },
  
  'milestone.tasks.generated': {
    event: 'milestone.tasks.generated',
    description: 'Nuevas tareas generadas para un milestone',
    publishers: ['MilestoneDetailPopover', 'master-coordinator-orchestrator'],
    consumers: ['useMilestoneNotifications', 'MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ milestoneId: string, milestoneName: string, count: number }',
    priority: 'high'
  },

  // ========== MASTER COORDINATOR EVENTS [CRITICAL] ==========
  'master.context.updated': {
    event: 'master.context.updated',
    description: 'Contexto del coordinador maestro actualizado (fuente única de verdad)',
    publishers: ['master-coordinator-orchestrator', 'MasterAgentContext', 'DataIntegrityDashboard'],
    consumers: ['ALL_COMPONENTS_WITH_MASTER_CONTEXT'],
    requiresMasterCoordinator: false, // El coordinador es el publisher
    dataStructure: '{ userId: string, contextSnapshot: any }',
    priority: 'critical'
  },
  
  'master.full.sync': {
    event: 'master.full.sync',
    description: 'Sincronización completa forzada de todo el sistema',
    publishers: ['DataIntegrityDashboard', 'useAutoDataRepair'],
    consumers: ['MasterCoordinatorContext', 'useMasterAgent'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, trigger: string }',
    priority: 'critical'
  },

  // ========== TASK EVENTS [HIGH PRIORITY] ==========
  'task.updated': {
    event: 'task.updated',
    description: 'Tarea actualizada (status, progress, etc)',
    publishers: ['useAgentTasks', 'TaskExecutionFlow'],
    consumers: ['MasterCoordinatorContext', 'useUnifiedProgress'],
    requiresMasterCoordinator: true,
    dataStructure: '{ taskId: string, userId: string, status: string }',
    priority: 'high'
  },
  
  'task.completed.check.generation': {
    event: 'task.completed.check.generation',
    description: 'Verificar si se deben generar nuevas tareas tras completar una',
    publishers: ['useAgentTasks'],
    consumers: ['master-coordinator-orchestrator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ taskId: string, userId: string }',
    priority: 'high'
  },

  // ========== BRAND EVENTS ==========
  'brand.updated': {
    event: 'brand.updated',
    description: 'Información de marca actualizada',
    publishers: ['IntelligentBrandWizard', 'LogoEditModal', 'ColorPaletteModal', 'ClaimEditorModal'],
    consumers: ['MasterCoordinatorContext', 'useUnifiedProgress'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, element: string }',
    priority: 'medium'
  },
  
  'brand.logo.uploaded': {
    event: 'brand.logo.uploaded',
    description: 'Logo de marca subido',
    publishers: ['IntelligentBrandWizard', 'LogoEditModal'],
    consumers: ['MasterCoordinatorContext', 'progressCalculator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, logoUrl: string }',
    priority: 'medium'
  },
  
  'brand.colors.updated': {
    event: 'brand.colors.updated',
    description: 'Paleta de colores actualizada',
    publishers: ['IntelligentBrandWizard', 'ColorPaletteModal'],
    consumers: ['MasterCoordinatorContext', 'progressCalculator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, colors: any }',
    priority: 'medium'
  },
  
  'brand.wizard.completed': {
    event: 'brand.wizard.completed',
    description: 'Brand Wizard completado con diagnóstico',
    publishers: ['IntelligentBrandWizard'],
    consumers: ['MasterCoordinatorContext', 'useUnifiedProgress'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, diagnosis: any }',
    priority: 'high'
  },
  
  'brand.reviewed': {
    event: 'brand.reviewed',
    description: 'Marca revisada/evaluada',
    publishers: ['IntelligentBrandWizard'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string }',
    priority: 'medium'
  },

  // ========== SHOP & INVENTORY EVENTS ==========
  'shop.created': {
    event: 'shop.created',
    description: 'Tienda creada',
    publishers: ['ShopCreationWizard'],
    consumers: ['MasterCoordinatorContext', 'progressCalculator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, shopId: string }',
    priority: 'high'
  },
  
  'shop.published': {
    event: 'shop.published',
    description: 'Tienda publicada (activa)',
    publishers: ['ShopDashboard'],
    consumers: ['MasterCoordinatorContext', 'progressCalculator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, shopId: string }',
    priority: 'high'
  },
  
  'inventory.updated': {
    event: 'inventory.updated',
    description: 'Inventario actualizado (productos añadidos/modificados)',
    publishers: ['ProductCatalog', 'ProductWizard'],
    consumers: ['MasterCoordinatorContext', 'ShopDashboard', 'progressCalculator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, productsCount: number }',
    priority: 'high'
  },
  
  'product.wizard.completed': {
    event: 'product.wizard.completed',
    description: 'Wizard de producto completado',
    publishers: ['ProductWizard'],
    consumers: ['MasterCoordinatorContext', 'inventory'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, productId: string }',
    priority: 'medium'
  },

  // ========== MATURITY & GAMIFICATION EVENTS ==========
  'maturity.assessment.completed': {
    event: 'maturity.assessment.completed',
    description: 'Test de madurez completado',
    publishers: ['FusedMaturityCalculator'],
    consumers: ['MasterCoordinatorContext', 'master-coordinator-orchestrator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, scores: CategoryScore }',
    priority: 'critical'
  },
  
  'maturity.score_updated': {
    event: 'maturity.score_updated',
    description: 'Scores de madurez actualizados',
    publishers: ['MasterCoordinatorContext'],
    consumers: ['useUnifiedProgress', 'Dashboard'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string, scores: CategoryScore }',
    priority: 'high'
  },
  
  'gamification.xp_gained': {
    event: 'gamification.xp_gained',
    description: 'Usuario ganó XP',
    publishers: ['TaskCompletionHandler', 'MilestoneCompletionHandler'],
    consumers: ['RewardsPanel', 'MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, xpGained: number, reason: string }',
    priority: 'medium'
  },

  // ========== PROFILE & BUSINESS EVENTS ==========
  'profile.updated': {
    event: 'profile.updated',
    description: 'Perfil de usuario actualizado',
    publishers: ['ProfileEditor'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string }',
    priority: 'medium'
  },
  
  'business.updated': {
    event: 'business.updated',
    description: 'Información de negocio actualizada',
    publishers: ['BusinessProfileDialog'],
    consumers: ['MasterCoordinatorContext', 'progressCalculator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string }',
    priority: 'medium'
  },
  
  'business.profile.updated': {
    event: 'business.profile.updated',
    description: 'Perfil de negocio actualizado',
    publishers: ['BusinessProfileDialog'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string }',
    priority: 'medium'
  },

  // ========== LEGAL EVENTS ==========
  'legal.nit.completed': {
    event: 'legal.nit.completed',
    description: 'RUT/NIT completado',
    publishers: ['NITFormDialog'],
    consumers: ['MasterCoordinatorContext', 'progressCalculator'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string }',
    priority: 'high'
  },
  
  'legal.nit.pending': {
    event: 'legal.nit.pending',
    description: 'RUT/NIT pendiente',
    publishers: ['NITFormDialog'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },

  // ========== PRICING EVENTS ==========
  'pricing.updated': {
    event: 'pricing.updated',
    description: 'Estrategia de precios actualizada',
    publishers: ['PricingCalculator'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string }',
    priority: 'medium'
  },

  // ========== DELIVERABLE EVENTS ==========
  'deliverable.created': {
    event: 'deliverable.created',
    description: 'Entregable creado',
    publishers: ['AgentTaskValidation'],
    consumers: ['MasterCoordinatorContext', 'DeliverablesGallery'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, deliverableId: string }',
    priority: 'medium'
  },

  // ========== SYNC EVENTS (Módulos) ==========
  'store.synced': {
    event: 'store.synced',
    description: 'Módulo de tienda sincronizado',
    publishers: ['useMasterAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },
  
  'perfil.synced': {
    event: 'perfil.synced',
    description: 'Módulo de perfil sincronizado',
    publishers: ['useMasterAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },
  
  'marca.synced': {
    event: 'marca.synced',
    description: 'Módulo de marca sincronizado',
    publishers: ['useMasterAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },
  
  'tienda.synced': {
    event: 'tienda.synced',
    description: 'Módulo de tienda sincronizado',
    publishers: ['useMasterAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },
  
  'inventario.synced': {
    event: 'inventario.synced',
    description: 'Módulo de inventario sincronizado',
    publishers: ['useMasterAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },
  
  'presence.synced': {
    event: 'presence.synced',
    description: 'Módulo de presencia digital sincronizado',
    publishers: ['useMasterAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },
  
  'i18n.synced': {
    event: 'i18n.synced',
    description: 'Módulo de internacionalización sincronizado',
    publishers: ['useMasterAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },
  
  'inventory.synced': {
    event: 'inventory.synced',
    description: 'Módulo de inventario sincronizado',
    publishers: ['useMasterAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  },

  // ========== MISC EVENTS ==========
  'growth.plan.ready': {
    event: 'growth.plan.ready',
    description: 'Plan de crecimiento generado',
    publishers: ['GrowthAgent'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string }',
    priority: 'medium'
  },
  
  'shop.wizard.completed': {
    event: 'shop.wizard.completed',
    description: 'Wizard de tienda completado',
    publishers: ['ShopCreationWizard'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: true,
    dataStructure: '{ userId: string, shopId: string }',
    priority: 'high'
  },
  
  'debug.data.cleared': {
    event: 'debug.data.cleared',
    description: 'Datos de debug limpiados',
    publishers: ['DebugPanel'],
    consumers: ['MasterCoordinatorContext'],
    requiresMasterCoordinator: false,
    dataStructure: '{ userId: string }',
    priority: 'low'
  }
};

/**
 * Helper: Obtener todos los eventos que requieren notificación al coordinador maestro
 */
export function getCriticalEvents(): SystemEvent[] {
  return Object.values(EVENT_REGISTRY)
    .filter(event => event.requiresMasterCoordinator)
    .map(event => event.event);
}

/**
 * Helper: Validar que un evento existe en el registry
 */
export function validateEvent(event: string): event is SystemEvent {
  return event in EVENT_REGISTRY;
}

/**
 * Helper: Obtener metadata de un evento
 */
export function getEventMetadata(event: SystemEvent): EventMetadata | undefined {
  return EVENT_REGISTRY[event];
}
