import type { MetricCode } from '@/services/gestion.actions';

/**
 * Metas comprometidas en la propuesta v9 del convenio con el Ministerio de las
 * Culturas. Son constantes de configuración: no viven en la base de datos y se
 * ajustan editando este archivo.
 *
 * Solo se muestra "% sobre meta" en las tarjetas que tienen una meta declarada;
 * las demás se presentan como cifra absoluta, sin inventar un denominador.
 */

export interface Meta {
  /** Valor objetivo al cierre del convenio. */
  target: number;
  /** Cuando la meta es un rango, el techo. Se usa solo para el rótulo. */
  targetMax?: number;
  /** De dónde sale la cifra, para que el número sea defendible. */
  source: string;
}

export const METAS_CONVENIO: Partial<Record<MetricCode, Meta>> = {
  up_creadas: {
    target: 80,
    source: 'Artesanos y productores vinculados al programa.',
  },
  up_activas: {
    target: 80,
    source:
      'Activación comercial por participante: indicador comprometido cuyo medio de verificación es este tablero.',
  },
  productos_publicados: {
    target: 240,
    targetMax: 400,
    source: 'De 3 a 5 productos publicados y activos por cada uno de los 80 artesanos.',
  },
  catalogos_completos: {
    target: 80,
    source:
      'Catálogos digitales activos con ficha técnica completa: indicador comprometido.',
  },
  pasaportes_emitidos: {
    target: 160,
    source: 'Más de 160 Pasaportes de Origen, por artesano y por producto.',
  },
};

/** Rótulo legible de la meta: "80" o "240–400". */
export function metaLabel(meta: Meta): string {
  return meta.targetMax ? `${meta.target}–${meta.targetMax}` : String(meta.target);
}

/**
 * Avance sobre meta, acotado a 100. Cuando la meta es un rango, el piso del
 * rango es lo que cuenta como cumplimiento: superarlo ya es meta alcanzada.
 */
export function metaProgress(value: number, meta: Meta): number {
  if (meta.target <= 0) return 0;
  return Math.min(100, Math.round((value / meta.target) * 100));
}
