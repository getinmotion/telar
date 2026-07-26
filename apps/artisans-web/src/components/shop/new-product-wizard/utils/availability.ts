import type { AvailabilityType } from '@/services/products-new.types';
import type { ProductionType } from '../hooks/useNewWizardState';

/**
 * El tipo de producción (paso 2) es la única pregunta al usuario;
 * la disponibilidad comercial se deriva automáticamente de él.
 */
const PRODUCTION_TO_AVAILABILITY: Record<ProductionType, AvailabilityType> = {
  unica: 'pieza_unica',
  limitada: 'edicion_limitada',
  continua: 'en_stock',
  bajo_pedido: 'bajo_pedido',
};

const AVAILABILITY_TO_PRODUCTION: Record<AvailabilityType, ProductionType> = {
  pieza_unica: 'unica',
  edicion_limitada: 'limitada',
  en_stock: 'continua',
  bajo_pedido: 'bajo_pedido',
};

export const deriveAvailabilityType = (pt: ProductionType): AvailabilityType =>
  PRODUCTION_TO_AVAILABILITY[pt];

/** Mapeo inverso, tolerante a valores desconocidos (datos viejos o externos). */
export const deriveProductionType = (
  at: AvailabilityType | string | undefined | null,
): ProductionType | undefined =>
  at ? AVAILABILITY_TO_PRODUCTION[at as AvailabilityType] : undefined;

export const AVAILABILITY_LABELS: Record<AvailabilityType, string> = {
  en_stock: 'Disponible ahora',
  bajo_pedido: 'Bajo pedido',
  edicion_limitada: 'Edición limitada',
  pieza_unica: 'Pieza única',
};
