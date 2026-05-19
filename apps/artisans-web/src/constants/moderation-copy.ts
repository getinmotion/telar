// UX copy centralizado para el sistema de moderación TELAR.
// Principio: lenguaje humano, pedagógico, colaborativo. Nunca "rechazado", "inválido" o "error".

export const MODERATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_moderation: 'Pendiente de revisión',
  approved: 'En el marketplace',
  approved_with_edits: 'Ajustado por el equipo TELAR',
  changes_requested: 'Pendiente de ajustes del artesano',
  rejected: 'No disponible en marketplace',
  archived: 'Archivado',
};

export const MODERATION_STATUS_DESCRIPTIONS: Record<string, string> = {
  draft: 'Esta pieza todavía no ha sido enviada para revisión.',
  pending_moderation: 'Esta pieza está en cola de revisión. La revisaremos pronto.',
  approved: 'Esta pieza cumple con todos los criterios del marketplace.',
  approved_with_edits:
    'Hicimos algunos ajustes para ayudarte a tener una mejor presentación en el marketplace.',
  changes_requested:
    'Aún falta información o hay algunos ajustes que el artesano debe hacer antes de aparecer en el marketplace.',
  rejected:
    'Esta pieza necesita ajustes más importantes antes de aparecer en el marketplace. Revisa el historial para más detalles.',
  archived: 'Esta pieza ha sido retirada del catálogo.',
};

export const QUEUE_SECTION_LABELS = {
  products: {
    label: 'Productos',
    subsections: {
      pending: 'Pendientes de revisión',
      incomplete: 'Incompletos',
      changes_requested: 'Esperando ajustes',
      rejected: 'No disponibles',
    },
  },
  shops: {
    label: 'Tiendas',
    subsections: {
      pending_publish: 'Listas para publicar',
      branding_incomplete: 'Branding incompleto',
      no_bank_data: 'Sin datos bancarios',
      identity_incomplete: 'Identidad incompleta',
    },
  },
  taxonomy: {
    label: 'Taxonomías',
    subsections: {
      materials: 'Materiales nuevos',
      crafts: 'Oficios nuevos',
      techniques: 'Técnicas nuevas',
      styles: 'Estilos nuevos',
    },
  },
  visual_quality: {
    label: 'Calidad visual',
    subsections: {
      no_photos: 'Sin fotos',
      low_quality: 'Baja calidad',
      wrong_background: 'Fondo incorrecto',
    },
  },
  marketplace: {
    label: 'Marketplace',
    subsections: {
      featured: 'Destacados',
      collections: 'Colecciones',
      campaigns: 'Campañas',
    },
  },
} as const;

export const ACTION_COPY = {
  approve: {
    label: 'Aprobar',
    confirm: '¿Confirmar aprobación?',
    success: 'Pieza aprobada y disponible en el marketplace.',
  },
  approve_with_edits: {
    label: 'Aprobar con ajustes',
    confirm: '¿Confirmar aprobación con ajustes?',
    success: 'Pieza aprobada con mejoras del equipo TELAR.',
  },
  request_changes: {
    label: 'Solicitar ajustes',
    confirm: '¿Enviar solicitud de ajustes al artesano?',
    success: 'Se notificó al artesano sobre los ajustes necesarios.',
  },
  reject: {
    label: 'No disponible para marketplace',
    confirm: '¿Confirmar que esta pieza no está lista para el marketplace?',
    success: 'Pieza marcada como no disponible. El artesano recibirá retroalimentación.',
  },
  publish_shop: {
    label: 'Publicar tienda',
    confirm: '¿Publicar esta tienda en el marketplace?',
    success: 'Tienda publicada y visible en el marketplace.',
  },
  approve_shop: {
    label: 'Aprobar para marketplace',
    confirm: '¿Aprobar esta tienda para el marketplace?',
    success: 'Tienda aprobada para el marketplace.',
  },
} as const;

export const SCORE_LABELS = {
  priority: 'Prioridad',
  risk: 'Riesgo',
  commercial: 'Potencial',
} as const;

export const SCORE_COLORS = {
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
} as const;

export function getScoreLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

export const EMPTY_STATE_COPY = {
  products_pending: {
    title: '¡Todo al día!',
    description: 'No hay productos pendientes de revisión en este momento.',
  },
  shops_pending: {
    title: 'Sin tiendas en cola',
    description: 'Todas las tiendas han sido revisadas.',
  },
  taxonomy_pending: {
    title: 'Taxonomías actualizadas',
    description: 'No hay términos nuevos pendientes de revisión.',
  },
  default: {
    title: 'Cola vacía',
    description: 'No hay items pendientes en esta sección.',
  },
} as const;
