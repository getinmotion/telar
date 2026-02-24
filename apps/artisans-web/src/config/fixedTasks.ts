/**
 * Fixed Tasks Configuration - CAMINO ARTESANAL
 * Sistema simplificado de misiones progresivas
 */

import { FixedTask } from '@/types/fixedTask';

export const FIXED_TASKS: FixedTask[] = [
  // ========================================
  // FORMALIZACIÓN - No bloqueante, solo RUT
  // ========================================
  {
    id: 'complete_rut',
    title: 'Completa tu RUT',
    description: 'Formaliza tu negocio artesanal registrando tu número de identificación tributaria',
    action: { type: 'modal', destination: '/profile?modal=rut' },
    milestone: 'formalization',
    priority: 1,
    icon: 'FileText',
    estimatedMinutes: 5,
    deliverable: 'RUT registrado en el sistema'
  },
  {
    id: 'complete_bank_data',
    title: 'Configura tus datos bancarios',
    description: 'Agrega tu información bancaria para recibir pagos de tus ventas',
    action: { type: 'route', destination: '/mi-cuenta/datos-bancarios' },
    milestone: 'formalization',
    priority: 2,
    icon: 'CreditCard',
    estimatedMinutes: 10,
    deliverable: 'Datos bancarios configurados'
  },
  
  // ========================================
  // ANÁLISIS PROFUNDO - 6 bloques progresivos
  // ========================================
  {
    id: 'maturity_block_1',
    title: 'Completa el Bloque 1 del Análisis',
    description: 'Responde las primeras 5 preguntas del análisis de madurez de tu negocio',
    action: { type: 'route', destination: '/maturity-calculator' },
    milestone: 'formalization',
    priority: 10,
    icon: 'Brain',
    estimatedMinutes: 5,
    deliverable: 'Bloque 1: Fundamentos completado'
  },
  {
    id: 'maturity_block_2',
    title: 'Completa el Bloque 2 del Análisis',
    description: 'Continúa con el segundo bloque de preguntas (preguntas 6-10)',
    action: { type: 'route', destination: '/maturity-calculator' },
    requirements: {
      mustComplete: ['maturity_block_1']
    },
    milestone: 'formalization',
    priority: 11,
    icon: 'Brain',
    estimatedMinutes: 5,
    deliverable: 'Bloque 2: Estrategia completado'
  },
  {
    id: 'maturity_block_3',
    title: 'Completa el Bloque 3 del Análisis',
    description: 'Avanza al tercer bloque de preguntas (preguntas 11-15)',
    action: { type: 'route', destination: '/maturity-calculator' },
    requirements: {
      mustComplete: ['maturity_block_2']
    },
    milestone: 'formalization',
    priority: 12,
    icon: 'Brain',
    estimatedMinutes: 5,
    deliverable: 'Bloque 3: Operaciones completado'
  },
  {
    id: 'maturity_block_4',
    title: 'Completa el Bloque 4 del Análisis',
    description: 'Continúa con el cuarto bloque de preguntas (preguntas 16-20)',
    action: { type: 'route', destination: '/maturity-calculator' },
    requirements: {
      mustComplete: ['maturity_block_3']
    },
    milestone: 'formalization',
    priority: 13,
    icon: 'Brain',
    estimatedMinutes: 5,
    deliverable: 'Bloque 4: Marketing completado'
  },
  {
    id: 'maturity_block_5',
    title: 'Completa el Bloque 5 del Análisis',
    description: 'Avanza al quinto bloque de preguntas (preguntas 21-25)',
    action: { type: 'route', destination: '/maturity-calculator' },
    requirements: {
      mustComplete: ['maturity_block_4']
    },
    milestone: 'formalization',
    priority: 14,
    icon: 'Brain',
    estimatedMinutes: 5,
    deliverable: 'Bloque 5: Ventas completado'
  },
  {
    id: 'maturity_block_6',
    title: 'Completa el Bloque 6 del Análisis',
    description: 'Finaliza con el último bloque de preguntas (preguntas 26-30)',
    action: { type: 'route', destination: '/maturity-calculator' },
    requirements: {
      mustComplete: ['maturity_block_5']
    },
    milestone: 'formalization',
    priority: 15,
    icon: 'Brain',
    estimatedMinutes: 5,
    deliverable: 'Bloque 6: Crecimiento completado'
  },
  
  // ========================================
  // TIENDA ONLINE - 7 tareas progresivas
  // ========================================
  {
    id: 'create_shop',
    title: 'Crea tu tienda online',
    description: 'Configura tu tienda artesanal y comienza a vender en línea',
    action: { type: 'wizard', destination: '/dashboard/create-shop' },
    milestone: 'shop',
    priority: 16,
    icon: 'Store',
    estimatedMinutes: 15,
    deliverable: 'Tienda online publicada'
  },
  {
    id: 'first_product',
    title: 'Sube tu primer producto',
    description: 'Agrega tu primera creación artesanal al catálogo',
    action: { type: 'route', destination: '/productos/subir' },
    requirements: {
      mustComplete: ['create_shop']
    },
    milestone: 'shop',
    priority: 3,
    icon: 'Package',
    estimatedMinutes: 10,
    deliverable: 'Primer producto publicado'
  },
  {
    id: 'five_products',
    title: 'Sube 5 productos',
    description: 'Amplía tu catálogo con más variedad de productos',
    action: { type: 'route', destination: '/productos/subir' },
    requirements: {
      mustComplete: ['first_product'],
      mustHave: { products: { min: 1 } }
    },
    milestone: 'shop',
    priority: 4,
    icon: 'Package',
    estimatedMinutes: 30,
    deliverable: 'Catálogo de 5 productos'
  },
  {
    id: 'ten_products',
    title: 'Sube 10 productos',
    description: 'Construye un catálogo completo y diverso',
    action: { type: 'route', destination: '/productos/subir' },
    requirements: {
      mustComplete: ['five_products'],
      mustHave: { products: { min: 5 } }
    },
    milestone: 'shop',
    priority: 5,
    icon: 'Package',
    estimatedMinutes: 40,
    deliverable: 'Catálogo completo de 10 productos'
  },
  {
    id: 'create_artisan_profile',
    title: 'Crea tu Perfil Artesanal',
    description: 'Cuenta tu historia, tu origen y tu oficio de manera profunda y auténtica',
    action: { type: 'wizard', destination: '/dashboard/artisan-profile-wizard' },
    requirements: {
      mustComplete: ['create_shop']
    },
    milestone: 'shop',
    priority: 6,
    icon: 'FileText',
    estimatedMinutes: 30,
    deliverable: 'Perfil artesanal completo y publicado'
  },
  {
    id: 'add_contact',
    title: 'Agrega tu información de contacto',
    description: 'Configura cómo los clientes pueden comunicarse contigo',
    action: { type: 'wizard', destination: '/dashboard/shop-contact-wizard' },
    requirements: {
      mustComplete: ['create_shop']
    },
    milestone: 'shop',
    priority: 7,
    icon: 'Mail',
    estimatedMinutes: 10,
    deliverable: 'Información de contacto configurada'
  },
  {
    id: 'customize_shop',
    title: 'Personaliza tu tienda con hero slider',
    description: 'Crea un banner impactante con imágenes de tu trabajo',
    action: { type: 'wizard', destination: '/dashboard/shop-hero-wizard' },
    requirements: {
      mustComplete: ['create_shop']
    },
    milestone: 'shop',
    priority: 8,
    icon: 'Paintbrush',
    estimatedMinutes: 15,
    deliverable: 'Hero slider personalizado'
  },
  
  // ========================================
  // IDENTIDAD DE MARCA - 2 tareas
  // ========================================
  {
    id: 'create_brand',
    title: 'Define tu identidad de marca',
    description: 'Crea el logo, colores y claim que representan tu negocio',
    action: { type: 'wizard', destination: '/dashboard/brand-wizard' },
    milestone: 'brand',
    priority: 9,
    icon: 'Palette',
    estimatedMinutes: 20,
    deliverable: 'Identidad de marca completa'
  },
  {
    id: 'review_brand',
    title: 'Revisa tu diagnóstico de marca',
    description: 'Evalúa la coherencia y fortaleza de tu identidad visual',
    action: { type: 'route', destination: '/dashboard/brand-wizard?mode=diagnostic' },
    requirements: {
      mustComplete: ['create_brand']
    },
    milestone: 'brand',
    priority: 17,
    icon: 'CheckCircle',
    estimatedMinutes: 10,
    deliverable: 'Diagnóstico de marca completado'
  },
  
  // ========================================
  // COMUNIDAD - 1 tarea
  // ========================================
  {
    id: 'add_social_links',
    title: 'Agrega tus redes sociales',
    description: 'Conecta tu tienda con Instagram, Facebook y otras redes',
    action: { type: 'wizard', destination: '/dashboard/social-links-wizard' },
    requirements: {
      mustComplete: ['create_shop']
    },
    milestone: 'community',
    priority: 18,
    icon: 'Share2',
    estimatedMinutes: 5,
    deliverable: 'Redes sociales vinculadas'
  }
];

// Helper to get milestone label
export const getMilestoneLabel = (milestone: string): string => {
  const labels: Record<string, string> = {
    formalization: 'Formalización',
    brand: 'Identidad de Marca',
    shop: 'Tienda Online',
    sales: 'Ventas',
    community: 'Comunidad'
  };
  return labels[milestone] || milestone;
};
