/**
 * Tabla estática de geocodificación para Colombia.
 *
 * Fix temporal mientras `ArtisanShop` no tiene columnas `latitude`/`longitude`.
 * Resuelve coordenadas a partir de `municipality` (preferido) o `department`.
 */

import type { ArtisanShop } from '@/types/artisan-shops.types';

export interface LatLng {
  lat: number;
  lng: number;
}

const normalize = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

/** Municipios donde típicamente hay tiendas artesanales. */
export const MUNICIPALITY_COORDS: Record<string, LatLng> = {
  // Caribe
  riohacha: { lat: 11.5444, lng: -72.9072 },
  uribia: { lat: 11.7139, lng: -72.2658 },
  manaure: { lat: 11.7758, lng: -72.4453 },
  maicao: { lat: 11.3786, lng: -72.2406 },
  'san jacinto': { lat: 9.8306, lng: -75.1219 },
  cartagena: { lat: 10.3997, lng: -75.5144 },
  'santa marta': { lat: 11.2408, lng: -74.199 },
  barranquilla: { lat: 10.9685, lng: -74.7813 },
  sincelejo: { lat: 9.3047, lng: -75.3978 },
  monteria: { lat: 8.7479, lng: -75.8814 },
  valledupar: { lat: 10.4631, lng: -73.2532 },
  // Andina – Boyacá
  tunja: { lat: 5.5353, lng: -73.3678 },
  duitama: { lat: 5.8244, lng: -73.0322 },
  sogamoso: { lat: 5.7144, lng: -72.9331 },
  ráquira: { lat: 5.5375, lng: -73.6328 },
  raquira: { lat: 5.5375, lng: -73.6328 },
  villadeleyva: { lat: 5.6339, lng: -73.5253 },
  'villa de leyva': { lat: 5.6339, lng: -73.5253 },
  nobsa: { lat: 5.7706, lng: -72.9408 },
  // Andina – Tolima (La Chamba)
  'la chamba': { lat: 3.6833, lng: -75.0167 },
  guamo: { lat: 4.0289, lng: -74.9692 },
  ibague: { lat: 4.4389, lng: -75.2322 },
  // Andina – Cundinamarca
  bogota: { lat: 4.711, lng: -74.0721 },
  'bogota d.c.': { lat: 4.711, lng: -74.0721 },
  // Pacífico – Cauca
  popayan: { lat: 2.4448, lng: -76.6147 },
  timbio: { lat: 2.3539, lng: -76.6831 },
  'el tambo': { lat: 2.4514, lng: -76.8103 },
  silvia: { lat: 2.6122, lng: -76.3814 },
  // Pacífico – Valle del Cauca
  cali: { lat: 3.4516, lng: -76.532 },
  buenaventura: { lat: 3.8801, lng: -77.0312 },
  // Pacífico – Nariño
  pasto: { lat: 1.2136, lng: -77.2811 },
  ipiales: { lat: 0.8281, lng: -77.6406 },
  tumaco: { lat: 1.7942, lng: -78.7853 },
  sandona: { lat: 1.2833, lng: -77.4667 },
  // Amazonía – Putumayo
  mocoa: { lat: 1.1492, lng: -76.6483 },
  sibundoy: { lat: 1.2031, lng: -76.9181 },
  // Otros departamentos
  medellin: { lat: 6.2442, lng: -75.5812 },
  manizales: { lat: 5.0689, lng: -75.5174 },
  pereira: { lat: 4.8133, lng: -75.6961 },
  armenia: { lat: 4.5339, lng: -75.6811 },
  bucaramanga: { lat: 7.1193, lng: -73.1227 },
  cucuta: { lat: 7.8939, lng: -72.5078 },
  villavicencio: { lat: 4.142, lng: -73.6266 },
  neiva: { lat: 2.93, lng: -75.2819 },
  florencia: { lat: 1.6144, lng: -75.6062 },
  quibdo: { lat: 5.6919, lng: -76.6583 },
};

/** Fallback por departamento — coordenadas de la capital. */
export const DEPARTMENT_COORDS: Record<string, LatLng> = {
  amazonas: { lat: -4.2153, lng: -69.9406 },
  antioquia: { lat: 6.2442, lng: -75.5812 },
  arauca: { lat: 7.0903, lng: -70.7617 },
  atlantico: { lat: 10.9685, lng: -74.7813 },
  bolivar: { lat: 10.3997, lng: -75.5144 },
  boyaca: { lat: 5.5353, lng: -73.3678 },
  caldas: { lat: 5.0689, lng: -75.5174 },
  caqueta: { lat: 1.6144, lng: -75.6062 },
  casanare: { lat: 5.3378, lng: -72.395 },
  cauca: { lat: 2.4448, lng: -76.6147 },
  cesar: { lat: 10.4631, lng: -73.2532 },
  choco: { lat: 5.6919, lng: -76.6583 },
  cordoba: { lat: 8.7479, lng: -75.8814 },
  cundinamarca: { lat: 4.711, lng: -74.0721 },
  guainia: { lat: 3.8653, lng: -67.9239 },
  guaviare: { lat: 2.5667, lng: -72.6417 },
  huila: { lat: 2.93, lng: -75.2819 },
  'la guajira': { lat: 11.5444, lng: -72.9072 },
  guajira: { lat: 11.5444, lng: -72.9072 },
  magdalena: { lat: 11.2408, lng: -74.199 },
  meta: { lat: 4.142, lng: -73.6266 },
  narino: { lat: 1.2136, lng: -77.2811 },
  'norte de santander': { lat: 7.8939, lng: -72.5078 },
  putumayo: { lat: 1.1492, lng: -76.6483 },
  quindio: { lat: 4.5339, lng: -75.6811 },
  risaralda: { lat: 4.8133, lng: -75.6961 },
  'san andres y providencia': { lat: 12.5847, lng: -81.7006 },
  santander: { lat: 7.1193, lng: -73.1227 },
  sucre: { lat: 9.3047, lng: -75.3978 },
  tolima: { lat: 4.4389, lng: -75.2322 },
  'valle del cauca': { lat: 3.4516, lng: -76.532 },
  valle: { lat: 3.4516, lng: -76.532 },
  vaupes: { lat: 1.2531, lng: -70.2344 },
  vichada: { lat: 6.1845, lng: -67.4814 },
  'bogota d.c.': { lat: 4.711, lng: -74.0721 },
  bogota: { lat: 4.711, lng: -74.0721 },
};

/**
 * Resuelve coords usando municipio → departamento → parseo del campo `region`.
 *
 * `region` suele venir como "MUNICIPALITY, DEPARTMENT, Colombia" (free text).
 * Lo tokenizamos por comas y probamos cada token contra los dos diccionarios.
 */
export const geocodeArtisan = (shop: ArtisanShop): LatLng | null => {
  if (shop.municipality) {
    const hit = MUNICIPALITY_COORDS[normalize(shop.municipality)];
    if (hit) return hit;
  }
  if (shop.department) {
    const hit = DEPARTMENT_COORDS[normalize(shop.department)];
    if (hit) return hit;
  }
  if (shop.region) {
    const tokens = shop.region
      .split(/[,\/·-]/)
      .map((t) => normalize(t))
      .filter((t) => t && t !== "colombia");
    // 1) try exact municipality match on any token
    for (const t of tokens) {
      const hit = MUNICIPALITY_COORDS[t];
      if (hit) return hit;
    }
    // 2) try exact department match on any token
    for (const t of tokens) {
      const hit = DEPARTMENT_COORDS[t];
      if (hit) return hit;
    }
  }
  return null;
};

/**
 * Offset determinístico (±~0.04°) derivado del id para evitar overlap
 * cuando varios artesanos comparten municipio.
 */
export const jitter = (id: string): { dLat: number; dLng: number } => {
  let h1 = 2166136261;
  let h2 = 5381;
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = (h2 * 33) ^ c;
  }
  const r1 = ((h1 >>> 0) % 10000) / 10000 - 0.5;
  const r2 = ((h2 >>> 0) % 10000) / 10000 - 0.5;
  return { dLat: r1 * 0.08, dLng: r2 * 0.08 };
};
