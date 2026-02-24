// Mapeo de labels de acciones a IDs de wizard

export const ACTION_ID_MAP: Record<string, string> = {
  // Formalización
  'nit': 'complete-nit',
  'perfil-de-negocio': 'business-profile',
  'perfil-negocio': 'business-profile',
  'completa-nit': 'complete-nit',
  'completa-tu-nit': 'complete-nit',
  
  // Marca
  'identidad-visual': 'evaluate-identity',
  'evalua-identidad-visual': 'evaluate-identity',
  'evalua-tu-identidad-visual': 'evaluate-identity',
  'logo': 'evaluate-identity',
  'disena-logo': 'evaluate-identity',
  'crea-logo': 'evaluate-identity',
  
  // Tienda
  'primer-producto': 'first-product',
  'lista-producto': 'first-product',
  'agrega-producto': 'first-product',
  'sube-producto': 'first-product',
  
  // Ventas
  'estrategia-ventas': 'sales-strategy',
  'canales-venta': 'sales-channels',
  
  // Comunidad
  'presencia-redes': 'social-presence',
  'redes-sociales': 'social-presence',
  'configura-redes': 'social-presence',
};

/**
 * Normaliza un label de acción para buscar en el mapa
 */
export function normalizeActionLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/^(completa|crea|sube|configura|define|lista|agrega|disena)\s+/g, '') // Quitar verbos
    .replace(/tu\s+|tus\s+|el\s+|la\s+|los\s+|las\s+/g, '') // Quitar artículos
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/**
 * Obtiene el ID de wizard desde un label de acción
 */
export function getWizardIdFromLabel(label: string): string | null {
  const normalized = normalizeActionLabel(label);
  return ACTION_ID_MAP[normalized] || null;
}
