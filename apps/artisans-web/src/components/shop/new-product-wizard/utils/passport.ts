import type { NewWizardState } from '../hooks/useNewWizardState';

/**
 * Identificador del pasaporte. Con productId es determinista (estable entre
 * renders y sesiones); sin él se genera un provisional que el paso debe
 * memoizar para que no cambie durante la sesión.
 */
export const derivePassportId = (productId?: string): string => {
  const year = new Date().getFullYear();
  const suffix = productId
    ? productId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()
    : String(Math.floor(1000 + Math.random() * 9000));
  return `TLR-PV-${year}-${suffix || 'BORRADOR'}`;
};

const MRZ_LINE_LENGTH = 44;

/** Normaliza texto a alfabeto MRZ: mayúsculas sin tildes, resto → '<'. */
const toMrzAlphabet = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '<');

const padMrz = (value: string): string =>
  (value + '<'.repeat(MRZ_LINE_LENGTH)).slice(0, MRZ_LINE_LENGTH);

/**
 * Zona de lectura mecánica decorativa (estilo ICAO) para el pie del pasaporte.
 * Es ornamental: no codifica datos verificables.
 */
export const buildMrzLines = (
  state: NewWizardState,
  passportId: string,
): [string, string] => {
  const name = toMrzAlphabet(state.name || 'PIEZA ARTESANAL');
  const department = (toMrzAlphabet(state.department || 'COL').replace(/</g, '') || 'COL').slice(0, 3);
  const line1 = padMrz(`P<TLRCOL${name}`);
  const line2 = padMrz(`${toMrzAlphabet(passportId)}${new Date().getFullYear()}${department}`);
  return [line1, line2];
};

// Etiquetas de propósito/estilo — mismas que usa marketplace-web (ProductDetail)
export const PURPOSE_LABELS: Record<string, string> = {
  funcional: 'Funcional',
  decorativa: 'Decorativa',
  ritual: 'Ritual',
  coleccionable: 'Coleccionable',
};

export const STYLE_LABELS: Record<string, string> = {
  tradicional: 'Tradicional',
  contemporaneo: 'Contemporáneo',
  fusion: 'Fusión',
};

/** Parte un texto multilinea en ítems, tolerando bullets legacy ("• ", "- ") */
export const toLines = (s?: string | null): string[] =>
  (s ?? '')
    .split(/\n+/)
    .map(l => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean);
