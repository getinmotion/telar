/**
 * Fixed Tasks Configuration - CAMINO ARTESANAL
 * Sistema simplificado de misiones progresivas
 */

import { FixedTask } from '@/types/fixedTask';

export const FIXED_TASKS: FixedTask[] = [
  // ========================================
  // TIENDA ONLINE
  // ========================================
  {
    id: 'create_shop',
    title: 'Crea tu tienda online',
    description: 'Configura tu tienda artesanal y comienza a vender en línea',
    action: { type: 'wizard', destination: '/dashboard/create-shop' },
    milestone: 'shop',
    priority: 1,
    icon: 'storefront',
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
    priority: 2,
    icon: 'inventory_2',
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
    priority: 3,
    icon: 'inventory_2',
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
    priority: 4,
    icon: 'inventory_2',
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
    priority: 5,
    icon: 'person_pin',
    estimatedMinutes: 30,
    deliverable: 'Perfil artesanal completo y publicado'
  },

  // ========================================
  // IDENTIDAD DE MARCA
  // ========================================
  {
    id: 'create_brand',
    title: 'Define tu identidad de marca',
    description: 'Crea el logo, colores y claim que representan tu negocio',
    action: { type: 'wizard', destination: '/dashboard/brand-wizard' },
    milestone: 'brand',
    priority: 6,
    icon: 'palette',
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
    priority: 7,
    icon: 'verified',
    estimatedMinutes: 10,
    deliverable: 'Diagnóstico de marca completado'
  }
];

export const getMilestoneLabel = (milestone: string): string => {
  const labels: Record<string, string> = {
    brand: 'Identidad de Marca',
    shop: 'Tienda Online',
    sales: 'Ventas'
  };
  return labels[milestone] || milestone;
};
