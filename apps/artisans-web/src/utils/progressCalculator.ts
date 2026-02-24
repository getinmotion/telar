/**
 * Progress Calculator Utility - SIMPLIFIED
 * Calcula el progreso según el nuevo sistema de misiones del Camino Artesanal
 */

import { Milestone, MilestoneAction, UnifiedProgress, MaturityScores } from '@/types/unifiedProgress';
import { MasterAgentState } from '@/types/agentContracts';

interface ProgressWeights {
  formalization: number;
  brand: number;
  shop: number;
  sales: number;
  community: number;
}

const WEIGHTS: ProgressWeights = {
  formalization: 10,  // Reducido - solo RUT
  brand: 20,          // Dos tareas
  shop: 50,           // 7 tareas - el principal
  sales: 70,          // Bloqueado por ahora
  community: 90,      // 1 tarea
};

/**
 * FORMALIZACIÓN - Solo RUT, siempre activo, NO bloqueante
 */
export const calculateFormalizationProgress = (masterState: MasterAgentState): Milestone => {
  const actions: MilestoneAction[] = [
    {
      id: 'rut_completed',
      label: 'RUT completado',
      completed: !!(masterState.perfil.nit && !masterState.perfil.nit_pendiente),
      route: '/profile?modal=rut'
    }
  ];

  const tasksCompleted = actions.filter(a => a.completed).length;
  const totalTasks = actions.length;
  const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  return {
    id: 'formalization',
    label: 'Formalización',
    progress,
    tasksCompleted,
    totalTasks,
    status: 'active', // SIEMPRE activo, nunca bloqueado
    actions,
    threshold: WEIGHTS.formalization
  };
};

/**
 * MARCA - 2 tareas, puede empezar en paralelo con tienda
 */
export const calculateBrandProgress = (masterState: MasterAgentState): Milestone => {
  const actions: MilestoneAction[] = [
    {
      id: 'brand_identity',
      label: 'Identidad de marca definida',
      completed: !!(masterState.marca.logo && masterState.marca.colores.length > 0),
      route: '/dashboard/brand-wizard'
    },
    {
      id: 'brand_reviewed',
      label: 'Diagnóstico de marca completado',
      completed: masterState.marca.score >= 60,
      route: '/dashboard/brand-wizard?mode=diagnostic'
    }
  ];

  const tasksCompleted = actions.filter(a => a.completed).length;
  const totalTasks = actions.length;
  const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  return {
    id: 'brand',
    label: 'Identidad de Marca',
    progress,
    tasksCompleted,
    totalTasks,
    status: progress === 100 ? 'completed' : 'active', // Siempre activo (paralelo a tienda)
    actions,
    threshold: WEIGHTS.brand
  };
};

/**
 * TIENDA - 7 tareas progresivas, puede empezar en paralelo con marca
 */
export const calculateShopProgress = (masterState: MasterAgentState): Milestone => {
  const hasShop = masterState.tienda.has_shop;
  const productCount = masterState.inventario.productos.length || 0;
  
  // Leer valores reales del masterState
  const hasHeroSlider = !!(masterState.tienda.hero_config?.slides?.length);
  const hasStory = !!(masterState.tienda.story || masterState.tienda.about_content?.story);
  const contactInfo = (masterState.tienda.contact_info as any) || {};
  const hasContactInfo = !!(contactInfo?.email || contactInfo?.phone);

  const actions: MilestoneAction[] = [
    {
      id: 'shop_created',
      label: 'Tienda creada',
      completed: hasShop,
      route: '/dashboard/create-shop'
    },
    {
      id: 'first_product',
      label: 'Primer producto subido',
      completed: hasShop && productCount >= 1,
      route: '/productos/subir'
    },
    {
      id: 'five_products',
      label: '5 productos subidos',
      completed: hasShop && productCount >= 5,
      route: '/productos/subir'
    },
    {
      id: 'ten_products',
      label: '10 productos subidos',
      completed: hasShop && productCount >= 10,
      route: '/productos/subir'
    },
    {
      id: 'shop_story',
      label: 'Historia contada',
      completed: hasShop && hasStory,
      route: '/dashboard/shop-about-wizard'
    },
    {
      id: 'contact_info',
      label: 'Información de contacto',
      completed: hasShop && hasContactInfo,
      route: '/dashboard/shop-contact-wizard'
    },
    {
      id: 'hero_slider',
      label: 'Hero slider personalizado',
      completed: hasShop && hasHeroSlider,
      route: '/dashboard/shop-hero-wizard'
    }
  ];

  const tasksCompleted = actions.filter(a => a.completed).length;
  const totalTasks = actions.length;
  const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  return {
    id: 'shop',
    label: 'Tienda Online',
    progress,
    tasksCompleted,
    totalTasks,
    status: progress === 100 ? 'completed' : 'active', // Siempre activo (paralelo a marca)
    actions,
    threshold: WEIGHTS.shop
  };
};

/**
 * VENTAS - BLOQUEADO por ahora (sin funcionalidad de ventas aún)
 */
export const calculateSalesProgress = (masterState: MasterAgentState): Milestone => {
  const actions: MilestoneAction[] = []; // Sin tareas por ahora

  return {
    id: 'sales',
    label: 'Ventas',
    progress: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    status: 'locked', // SIEMPRE bloqueado
    actions,
    threshold: WEIGHTS.sales
  };
};

/**
 * COMUNIDAD - 1 tarea, requiere tienda
 */
export const calculateCommunityProgress = (masterState: MasterAgentState): Milestone => {
  const hasShop = masterState.tienda.has_shop;
  const hasSocialLinks = !!(masterState.tienda.social_links && Object.keys(masterState.tienda.social_links).length > 0);

  const actions: MilestoneAction[] = [
    {
      id: 'social_links',
      label: 'Redes sociales agregadas',
      completed: hasSocialLinks,
      route: '/dashboard/social-links-wizard'
    }
  ];

  const tasksCompleted = actions.filter(a => a.completed).length;
  const totalTasks = actions.length;
  const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  // Community requires shop to be active
  const status = !hasShop ? 'locked' : progress === 100 ? 'completed' : 'active';

  return {
    id: 'community',
    label: 'Comunidad',
    progress,
    tasksCompleted,
    totalTasks,
    status,
    actions,
    threshold: WEIGHTS.community
  };
};

/**
 * Calcular progreso total (promedio ponderado)
 */
export const calculateTotalProgress = (masterState: MasterAgentState): number => {
  const formalization = calculateFormalizationProgress(masterState);
  const brand = calculateBrandProgress(masterState);
  const shop = calculateShopProgress(masterState);
  const sales = calculateSalesProgress(masterState);
  const community = calculateCommunityProgress(masterState);

  // Solo contar milestones que no estén bloqueados
  const activeMilestones = [formalization, brand, shop, community].filter(m => m.status !== 'locked');
  
  if (activeMilestones.length === 0) return 0;

  const weightedSum = activeMilestones.reduce((sum, milestone) => {
    return sum + (milestone.progress * WEIGHTS[milestone.id]);
  }, 0);

  const totalWeight = activeMilestones.reduce((sum, milestone) => {
    return sum + WEIGHTS[milestone.id];
  }, 0);

  return Math.round(weightedSum / totalWeight);
};

/**
 * Calcular progreso unificado completo
 */
export const calculateUnifiedProgress = (
  masterState: MasterAgentState,
  baseMaturityScores: MaturityScores,
  gamificationData: { level: number; xp: number; nextLevelXP: number }
): UnifiedProgress => {
  const formalization = calculateFormalizationProgress(masterState);
  const brand = calculateBrandProgress(masterState);
  const shop = calculateShopProgress(masterState);
  const sales = calculateSalesProgress(masterState);
  const community = calculateCommunityProgress(masterState);
  const totalProgress = calculateTotalProgress(masterState);

  return {
    totalProgress,
    milestones: {
      formalization,
      brand,
      shop,
      sales,
      community
    },
    maturityScores: baseMaturityScores,
    gamification: gamificationData
  };
};
