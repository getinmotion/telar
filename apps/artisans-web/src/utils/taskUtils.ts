/**
 * Task Utilities
 * 
 * Funciones helper para manejar tareas y detectar si requieren wizards
 */

export interface TaskMetadata {
  requiresWizard: boolean;
  wizardType?: 'brand' | 'product' | 'shop' | 'maturity';
  wizardRoute?: string;
  canHaveSteps: boolean;
}

/**
 * Detecta si una tarea requiere un wizard específico basado en título/descripción
 */
export const detectTaskWizardRequirement = (task: {
  title: string;
  description?: string;
  agent_id?: string;
}): TaskMetadata => {
  const searchText = `${task.title} ${task.description || ''}`.toLowerCase();

  // Wizard de Marca/Identidad Visual
  if (
    searchText.includes('marca') ||
    searchText.includes('brand') ||
    searchText.includes('identidad visual') ||
    searchText.includes('logo') ||
    searchText.includes('colores')
  ) {
    return {
      requiresWizard: true,
      wizardType: 'brand',
      wizardRoute: '/dashboard/brand-wizard',
      canHaveSteps: false // Wizard maneja sus propios pasos
    };
  }

  // Wizard de Productos
  if (
    searchText.includes('primer producto') ||
    searchText.includes('subir producto') ||
    searchText.includes('añadir producto') ||
    searchText.includes('upload product') ||
    (searchText.includes('producto') && task.agent_id === 'inventory-manager')
  ) {
    return {
      requiresWizard: true,
      wizardType: 'product',
      wizardRoute: '/productos/subir',
      canHaveSteps: false
    };
  }

  // Wizard de Tienda
  if (
    searchText.includes('crear tienda') ||
    searchText.includes('create shop') ||
    searchText.includes('configurar tienda') ||
    searchText.includes('publicar tienda')
  ) {
    return {
      requiresWizard: true,
      wizardType: 'shop',
      wizardRoute: '/crear-tienda',
      canHaveSteps: false
    };
  }

  // Test de Madurez
  if (
    searchText.includes('test de madurez') ||
    searchText.includes('maturity test') ||
    searchText.includes('evaluar madurez')
  ) {
    return {
      requiresWizard: true,
      wizardType: 'maturity',
      wizardRoute: '/maturity-calculator',
      canHaveSteps: false
    };
  }

  // Tareas normales que SÍ pueden tener pasos
  return {
    requiresWizard: false,
    canHaveSteps: true
  };
};

/**
 * Determina si una tarea debería mostrar pasos o solo un botón de acción
 */
export const shouldShowTaskSteps = (task: {
  title: string;
  description?: string;
  agent_id?: string;
  steps?: any[];
}): boolean => {
  const metadata = detectTaskWizardRequirement(task);
  
  // Si requiere wizard, no mostrar pasos (el wizard los maneja)
  if (metadata.requiresWizard) {
    return false;
  }

  // Si tiene pasos definidos y no requiere wizard, mostrarlos
  if (task.steps && task.steps.length > 0) {
    return true;
  }

  return false;
};

/**
 * Obtiene el CTA apropiado para una tarea
 */
export const getTaskCTA = (task: {
  title: string;
  description?: string;
  agent_id?: string;
}): { label: string; route?: string } => {
  const metadata = detectTaskWizardRequirement(task);

  if (metadata.requiresWizard && metadata.wizardRoute) {
    const labels = {
      brand: 'Iniciar Wizard de Marca',
      product: 'Subir Producto',
      shop: 'Crear Tienda',
      maturity: 'Hacer Test'
    };

    return {
      label: labels[metadata.wizardType!] || 'Comenzar',
      route: metadata.wizardRoute
    };
  }

  return {
    label: 'Ver Detalles'
  };
};
