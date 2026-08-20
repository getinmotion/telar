import * as fs from 'fs';
import * as path from 'path';
import { get } from './api';
import { sinTildes } from './normalize';

/** Catálogos de taxonomía que necesita la inyección, resueltos una sola vez. */

export interface Item {
  id: string;
  name: string;
  parentId?: string | null;
  craftId?: string | null;
  craftIds?: string[] | null;
}

export interface Catalogos {
  crafts: Item[];
  techniques: Item[];
  materials: Item[];
  categories: Item[];
  countryId: string;
  idTypeCcId: string;
  dane: Record<string, Array<{ municipio: string; codigo: string }>>;
}

/**
 * El catálogo DANE vive en el front (lo sirve el formulario de registro).
 * Se lee de ahí en vez de duplicar 1.119 municipios en este script.
 */
const DANE_JSON = path.join(__dirname, '..', '..', '..', '..', 'artisans-web', 'public', 'ciudades_dane.json');

let cache: Catalogos | null = null;

export async function cargarCatalogos(): Promise<Catalogos> {
  if (cache) return cache;

  const [crafts, techniques, materials, categories, countries, idTypes] = await Promise.all([
    get<Item[]>('/crafts'),
    get<Item[]>('/techniques'),
    get<Item[]>('/materials'),
    get<Item[]>('/categories'),
    get<Array<{ id: string; name: string }>>('/countries'),
    get<Array<{ id: string; idTypeValue: string }>>('/id-type-user'),
  ]);

  const colombia = countries.find((c) => sinTildes(c.name) === 'colombia');
  if (!colombia) throw new Error('No se encontró el país Colombia en /countries');

  const cc = idTypes.find((t) => t.idTypeValue === 'CC');
  if (!cc) throw new Error('No se encontró el tipo de documento CC en /id-type-user');

  if (!fs.existsSync(DANE_JSON)) throw new Error(`No se encontró el catálogo DANE en ${DANE_JSON}`);

  cache = {
    crafts,
    techniques,
    materials,
    categories,
    countryId: colombia.id,
    idTypeCcId: cc.id,
    dane: JSON.parse(fs.readFileSync(DANE_JSON, 'utf8')),
  };
  return cache;
}

/** Busca por nombre exacto (sin tildes ni mayúsculas); si no, por coincidencia parcial. */
export function porNombre(items: Item[], nombre: string): Item | undefined {
  const objetivo = sinTildes(nombre).trim();
  return (
    items.find((i) => sinTildes(i.name).trim() === objetivo) ??
    items.find((i) => sinTildes(i.name).includes(objetivo)) ??
    items.find((i) => objetivo.includes(sinTildes(i.name)))
  );
}

export const idDe = (items: Item[], nombre: string): string | undefined => porNombre(items, nombre)?.id;

/** Técnicas asociadas a un oficio, según `craftId` o el array `craftIds`. */
export const tecnicasDe = (cat: Catalogos, craftId: string): Item[] =>
  cat.techniques.filter((t) => t.craftId === craftId || (t.craftIds ?? []).includes(craftId));

export const categoriasRaiz = (cat: Catalogos): Item[] => cat.categories.filter((c) => !c.parentId);

export const subcategoriasDe = (cat: Catalogos, categoryId: string): Item[] =>
  cat.categories.filter((c) => c.parentId === categoryId);

export interface Territorio {
  department: string;
  city: string;
  daneCity: number;
  /** true si sólo se pudo identificar el departamento y se usó su capital. */
  aproximado?: boolean;
}

/** Texto comparable: sin tildes, sin puntuación y con palabras separadas por un espacio. */
const normalizar = (s: string): string =>
  ` ${sinTildes(s).replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()} `;

/**
 * Coincidencia por palabra completa, no por subcadena.
 * Sin esto, "departamento de Córdoba" contenía "tame" (Tame, Arauca) y
 * "Portadores de Viche" contenía "tado" (Tadó, Chocó).
 */
const contienePalabra = (textoNormalizado: string, clave: string): boolean =>
  textoNormalizado.includes(` ${clave} `);

/** "Bogotá D.C." -> "bogota"; el texto libre casi nunca escribe el sufijo. */
const claveMunicipio = (nombre: string): string =>
  sinTildes(nombre)
    .replace(/\s+d\.?\s*c\.?$/, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();

/**
 * Resuelve un texto libre de territorio ("Municipio de Tuchín, departamento de
 * Córdoba", "Barichara barrio la primavera") contra el catálogo DANE.
 *
 * No basta con buscar la coincidencia más larga: hay municipios que se llaman
 * igual que un departamento ajeno. "Mompós, Bolívar" caía en el municipio de
 * Bolívar (Cauca) y "Tumaco - Nariño" en el municipio de Nariño (Antioquia).
 * Por eso se prefiere el candidato cuyo departamento también aparece en el texto,
 * y se penaliza al municipio que se llama igual que algún departamento.
 */
export function resolverTerritorio(cat: Catalogos, texto: string, contexto = ''): Territorio | null {
  const principal = normalizar(texto);
  const completo = normalizar(`${texto} ${contexto}`);
  if (!completo.trim()) return null;

  const departamentos = Object.keys(cat.dane);
  const nombresDepto = new Set(departamentos.map((d) => claveMunicipio(d)));
  const deptoEnTexto = (depto: string) => contienePalabra(completo, claveMunicipio(depto));

  interface Candidato extends Territorio {
    enPrincipal: boolean;
    deptoCitado: boolean;
    homonimoDeDepto: boolean;
    largo: number;
  }

  const candidatos: Candidato[] = [];
  for (const [departamento, municipios] of Object.entries(cat.dane)) {
    for (const m of municipios) {
      const clave = claveMunicipio(m.municipio);
      if (clave.length < 4) continue;
      if (!contienePalabra(completo, clave)) continue;
      candidatos.push({
        department: departamento,
        city: m.municipio,
        daneCity: Number(m.codigo),
        enPrincipal: contienePalabra(principal, clave),
        deptoCitado: deptoEnTexto(departamento),
        homonimoDeDepto: nombresDepto.has(clave),
        largo: clave.length,
      });
    }
  }

  // Si un candidato se llama igual que un departamento que el texto nombra, y él
  // pertenece a otro departamento, lo que el texto nombraba era el departamento.
  // "Tuchín, departamento de Córdoba" no es el municipio de Córdoba (Bolívar).
  const validos = candidatos.filter(
    (c) => !(c.homonimoDeDepto && !c.deptoCitado && departamentos.some((d) => deptoEnTexto(d) && claveMunicipio(d) === claveMunicipio(c.city))),
  );
  candidatos.length = 0;
  candidatos.push(...validos);

  // Sin municipio reconocible, pero con departamento nombrado ("Gaupi - Cauca",
  // donde el municipio viene mal escrito): se usa la capital y se marca aproximado.
  if (!candidatos.length) {
    const depto = departamentos.filter(deptoEnTexto).sort((a, b) => b.length - a.length)[0];
    if (!depto) return null;
    const capital = capitalDe(cat, depto);
    return capital ? { ...capital, aproximado: true } : null;
  }

  candidatos.sort(
    (a, b) =>
      Number(b.enPrincipal) - Number(a.enPrincipal) ||
      Number(b.deptoCitado) - Number(a.deptoCitado) ||
      Number(a.homonimoDeDepto) - Number(b.homonimoDeDepto) ||
      b.largo - a.largo,
  );

  const { department, city, daneCity } = candidatos[0];
  return { department, city, daneCity };
}

/**
 * Capital del departamento, para cuando se conoce el departamento pero no el
 * municipio. En la codificación DANE la capital es la que termina en `001`.
 */
export function capitalDe(cat: Catalogos, departamento: string): Territorio | null {
  const municipios = cat.dane[departamento];
  if (!municipios) return null;
  const capital = municipios.find((m) => m.codigo.endsWith('001')) ?? municipios[0];
  return capital ? { department: departamento, city: capital.municipio, daneCity: Number(capital.codigo) } : null;
}
