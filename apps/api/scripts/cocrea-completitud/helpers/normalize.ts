/** Utilidades de normalización de texto para emparejar personas y generar slugs. */

export const sinTildes = (s: string): string =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const email = (s: string | null | undefined): string => (s || '').toLowerCase().trim();

export const tieneEmail = (s: string | null | undefined): boolean => email(s).includes('@');

/**
 * Palabras que no distinguen a un artesano de otro dentro del convenio.
 * Sin esto, "Viche X" y "Viche Y" se parecen entre sí sólo por decir "viche",
 * y casi todos los portadores del Pacífico son marcas de viche.
 */
const VACIAS = new Set([
  'viche',
  'del',
  'los',
  'las',
  'don',
  'dona',
  'para',
  'con',
  'taller',
  'artesanal',
  'artesanales',
  'derivados',
  'bebidas',
  'crea',
  'cocrea',
  'marca',
  'llama',
  'mi',
  'emprendimiento',
]);

/** Tokens significativos de un texto. `conVacias` conserva palabras como "viche". */
export const tokens = (s: string, conVacias = false): Set<string> =>
  new Set(
    sinTildes(s)
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((w) => w.length > 2 && (conVacias || !VACIAS.has(w))),
  );

/** Solapamiento sobre el conjunto más corto: "Bantura" contra "Viche Bantura" da 1. */
export const solape = (a: Set<string>, b: Set<string>): number => {
  if (!a.size || !b.size) return 0;
  const comunes = [...a].filter((x) => b.has(x)).length;
  return comunes / Math.min(a.size, b.size);
};

/** Raíz del correo, sin dígitos ni separadores: martapgomez8 y marthapgomez8 -> martapgomez / marthapgomez */
export const raizEmail = (e: string): string =>
  email(e)
    .split('@')[0]
    .replace(/[0-9._+-]/g, '');

/** Parte local del correo, sólo letras y sin tildes: para buscar apellidos pegados (angulosaac). */
export const localEmail = (e: string): string => sinTildes(email(e).split('@')[0]).replace(/[^a-z]/g, '');

/** Slug apto para `shop_slug` (regex del DTO: ^[a-z0-9]+(?:-[a-z0-9]+)*$). */
export const slug = (s: string): string =>
  sinTildes(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'taller';

/** Capitaliza cada palabra: "JAIR JOSE CASSALETH" -> "Jair Jose Cassaleth". */
export const capitalizar = (s: string): string =>
  (s || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
