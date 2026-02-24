/**
 * Agent Action Router
 * 
 * Maps task keywords to specific actions (wizards, modals, routes, chat)
 * Used for intelligent task execution routing
 */

export type ActionType = 'wizard' | 'modal' | 'route' | 'chat';

export interface TaskAction {
  type: ActionType;
  destination: string;
  label: string;
  icon: string;
}

// Keywords mapping for shop configuration wizards
const SHOP_CONFIG_ACTIONS: Record<string, TaskAction> = {
  // Hero Slider missions
  'hero slider': {
    type: 'wizard',
    destination: '/dashboard/shop-hero-wizard',
    label: 'Configurar Hero Slider',
    icon: 'Sparkles'
  },
  'configurar hero': {
    type: 'wizard',
    destination: '/dashboard/shop-hero-wizard',
    label: 'Configurar Hero Slider',
    icon: 'Sparkles'
  },
  'carrusel': {
    type: 'wizard',
    destination: '/dashboard/shop-hero-wizard',
    label: 'Configurar Hero Slider',
    icon: 'Sparkles'
  },
  
  // About/Nosotros missions
  'sección nosotros': {
    type: 'wizard',
    destination: '/dashboard/shop-about-wizard',
    label: 'Configurar Nosotros',
    icon: 'BookOpen'
  },
  'historia de marca': {
    type: 'wizard',
    destination: '/dashboard/shop-about-wizard',
    label: 'Contar Historia',
    icon: 'BookOpen'
  },
  'sobre nosotros': {
    type: 'wizard',
    destination: '/dashboard/shop-about-wizard',
    label: 'Configurar Nosotros',
    icon: 'BookOpen'
  },
  'misión y visión': {
    type: 'wizard',
    destination: '/dashboard/shop-about-wizard',
    label: 'Definir Misión y Visión',
    icon: 'BookOpen'
  },
  
  // Contact missions
  'configurar contacto': {
    type: 'wizard',
    destination: '/dashboard/shop-contact-wizard',
    label: 'Configurar Contacto',
    icon: 'Mail'
  },
  'página de contacto': {
    type: 'wizard',
    destination: '/dashboard/shop-contact-wizard',
    label: 'Configurar Contacto',
    icon: 'Mail'
  },
  'formulario de contacto': {
    type: 'wizard',
    destination: '/dashboard/shop-contact-wizard',
    label: 'Configurar Contacto',
    icon: 'Mail'
  }
};

// Keywords mapping for product/inventory actions
const PRODUCT_ACTIONS: Record<string, TaskAction> = {
  'subir producto': {
    type: 'wizard',
    destination: '/productos/subir',
    label: 'Subir Producto',
    icon: 'Upload'
  },
  'agregar producto': {
    type: 'wizard',
    destination: '/productos/subir',
    label: 'Agregar Producto',
    icon: 'Plus'
  },
  'inventario': {
    type: 'route',
    destination: '/dashboard/inventory',
    label: 'Gestionar Inventario',
    icon: 'Package'
  }
};

// Keywords mapping for brand actions
const BRAND_ACTIONS: Record<string, TaskAction> = {
  'identidad de marca': {
    type: 'wizard',
    destination: '/dashboard/brand-wizard',
    label: 'Brand Wizard',
    icon: 'Palette'
  },
  'logo': {
    type: 'wizard',
    destination: '/dashboard/brand-wizard',
    label: 'Configurar Logo',
    icon: 'Image'
  },
  'colores de marca': {
    type: 'wizard',
    destination: '/dashboard/brand-wizard',
    label: 'Definir Colores',
    icon: 'Palette'
  },
  'claim': {
    type: 'wizard',
    destination: '/dashboard/brand-wizard',
    label: 'Crear Claim',
    icon: 'MessageSquare'
  }
};

// Combine all action mappings
const ALL_ACTIONS = {
  ...SHOP_CONFIG_ACTIONS,
  ...PRODUCT_ACTIONS,
  ...BRAND_ACTIONS
};

/**
 * Get the appropriate action for a given task
 * @param taskTitle - The task title
 * @param taskDescription - The task description (optional)
 * @returns TaskAction or null if no match found
 */
export function getActionForTask(
  taskTitle: string,
  taskDescription?: string
): TaskAction | null {
  const searchText = `${taskTitle} ${taskDescription || ''}`.toLowerCase();
  
  // Search for keyword matches
  for (const [keyword, action] of Object.entries(ALL_ACTIONS)) {
    if (searchText.includes(keyword.toLowerCase())) {
      return action;
    }
  }
  
  return null;
}

/**
 * Check if a task should route to a specific wizard
 * @param taskTitle - The task title
 * @param taskDescription - The task description (optional)
 * @returns boolean
 */
export function shouldRouteToWizard(
  taskTitle: string,
  taskDescription?: string
): boolean {
  const action = getActionForTask(taskTitle, taskDescription);
  return action?.type === 'wizard';
}

/**
 * Get wizard route for a task if applicable
 * @param taskTitle - The task title
 * @param taskDescription - The task description (optional)
 * @returns string route or null
 */
export function getWizardRoute(
  taskTitle: string,
  taskDescription?: string
): string | null {
  const action = getActionForTask(taskTitle, taskDescription);
  return action?.type === 'wizard' ? action.destination : null;
}
