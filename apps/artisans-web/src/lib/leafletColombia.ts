import { COLOMBIA_COORDS, DEPT_FALLBACK_COORDS } from '@/data/colombiaCoords';

/**
 * Geocodificación estática de Colombia y carga perezosa de Leaflet.
 *
 * Se extrajo de components/shipping-dashboard/ArtisansMap.tsx sin cambiar su
 * comportamiento, para que el mapa del tablero institucional pueda reusarla en
 * vez de duplicar el dataset. `ArtisansMap` sigue funcionando igual.
 *
 * No hay coordenadas en la base de datos: todo se resuelve aquí, contra
 * data/colombiaCoords.ts.
 */

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

export function normalizeLocation(s: string): string {
  return (s || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Resolución exacta por par departamento/municipio, con respaldo departamental. */
export function getCoords(
  dept: string,
  muni: string,
): [number, number] | null {
  const key = `${normalizeLocation(dept)}|${normalizeLocation(muni)}`;
  if (COLOMBIA_COORDS[key]) return COLOMBIA_COORDS[key];
  const fb = DEPT_FALLBACK_COORDS[normalizeLocation(dept)];
  return fb ?? null;
}

/** Índice municipio → coordenada, construido una sola vez. */
let municipalityIndex: Record<string, [number, number]> | null = null;
function getMunicipalityIndex(): Record<string, [number, number]> {
  if (municipalityIndex) return municipalityIndex;
  const index: Record<string, [number, number]> = {};
  for (const [key, coords] of Object.entries(COLOMBIA_COORDS)) {
    const municipality = key.split('|')[1];
    // El primero gana: los duplicados entre departamentos son marginales y no
    // vale la pena resolverlos con un dataset aproximado.
    if (municipality && !index[municipality]) index[municipality] = coords;
  }
  municipalityIndex = index;
  return index;
}

export interface GeoResolution {
  coords: [number, number];
  /** Qué tan fiable es la ubicación, para poder declararlo en la interfaz. */
  precision: 'municipio' | 'departamento';
}

/**
 * Resuelve una unidad productiva a coordenadas con cascada.
 *
 * El dato estructurado está casi vacío: medido contra la base, solo 24 de 172
 * unidades tienen departamento. Por eso, cuando falta, se prueban los tokens
 * que el backend extrae del texto libre de `region` ("CHIMICHAGUA, CESAR,
 * Colombia" → ['CHIMICHAGUA', 'CESAR']). Con eso se ubican ~128 en vez de 24.
 *
 * Devuelve null si no hay forma de ubicarla; el llamador debe contarlas y
 * decirlo, no hacerlas desaparecer.
 */
export function resolveCoords(input: {
  geoKey?: string | null;
  geoTokens?: string[];
}): GeoResolution | null {
  if (input.geoKey) {
    const exact = COLOMBIA_COORDS[input.geoKey];
    if (exact) return { coords: exact, precision: 'municipio' };
    const dept = input.geoKey.split('|')[0];
    const fb = DEPT_FALLBACK_COORDS[dept];
    if (fb) return { coords: fb, precision: 'departamento' };
  }

  const tokens = input.geoTokens ?? [];
  // Primero el par: si dos tokens forman "DEPARTAMENTO|MUNICIPIO" en cualquier
  // orden, esa es la ubicación más precisa disponible.
  for (const a of tokens) {
    for (const b of tokens) {
      if (a === b) continue;
      const hit = COLOMBIA_COORDS[`${a}|${b}`] ?? COLOMBIA_COORDS[`${b}|${a}`];
      if (hit) return { coords: hit, precision: 'municipio' };
    }
  }
  // Luego el municipio suelto.
  const byMunicipality = getMunicipalityIndex();
  for (const token of tokens) {
    if (byMunicipality[token])
      return { coords: byMunicipality[token], precision: 'municipio' };
  }
  // Por último el departamento suelto.
  for (const token of tokens) {
    if (DEPT_FALLBACK_COORDS[token])
      return { coords: DEPT_FALLBACK_COORDS[token], precision: 'departamento' };
  }
  return null;
}

/** Carga Leaflet desde CDN una sola vez. No es dependencia de npm. */
export function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);

  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${LEAFLET_JS}"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).L));
      existing.addEventListener('error', reject);
      if ((window as any).L) resolve((window as any).L);
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
