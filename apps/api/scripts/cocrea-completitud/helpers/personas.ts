import { ALIAS_MAILBOX } from '../config';
import { PersonaExcel } from './excel';
import { raizEmail, slug, tieneEmail, tokens } from './normalize';

/**
 * Alias de correo para los artesanos que no tienen uno propio.
 *
 * Se usa subdireccionamiento (`+`) sobre un buzón real de GET IN MOTION en vez de
 * inventar un dominio: así la verificación de correo y la recuperación de contraseña
 * llegan a un buzón que el equipo controla, y queda trazado a qué taller corresponde.
 */
export function aliasPara(p: PersonaExcel, usados: Map<string, number>): string {
  const [local, dominio] = ALIAS_MAILBOX.split('@');
  const base = slug(p.marca || p.nombre);

  const veces = (usados.get(base) ?? 0) + 1;
  usados.set(base, veces);
  // Dos personas declaran la misma marca ("Viche Ulaita"); la segunda se desambigua
  // con su propio nombre, no con un número, para que el correo siga siendo legible.
  const sufijo = veces > 1 ? `-${slug(p.nombre).split('-').slice(-2).join('-')}` : '';

  return `${local}+${base}${sufijo}@${dominio}`;
}

export interface Duplicado {
  motivo: string;
  /** Claves `nombre|email` de las filas que NO se procesan. */
  descartar: string[];
}

const clave = (p: PersonaExcel) => `${p.nombre}|${p.email}`;

/**
 * Personas que aparecen dos veces en el Excel bajo nombres o correos distintos.
 * Crear una cuenta por fila las duplicaría en producción.
 */
export function detectarDuplicados(personas: PersonaExcel[]): Duplicado[] {
  const dups: Duplicado[] = [];
  const yaDescartados = new Set<string>();

  for (let i = 0; i < personas.length; i++) {
    for (let j = i + 1; j < personas.length; j++) {
      const a = personas[i];
      const b = personas[j];
      if (yaDescartados.has(clave(a)) || yaDescartados.has(clave(b))) continue;

      const nombreA = tokens(a.nombre, true);
      const nombreB = tokens(b.nombre, true);
      const comunes = [...nombreA].filter((t) => nombreB.has(t));

      const mismaRaizCorreo =
        tieneEmail(a.email) && tieneEmail(b.email) && raizEmail(a.email) === raizEmail(b.email);
      // Hacen falta 3 coincidencias, no 2: con 2 bastaba para confundir a
      // "María … Vásquez" con "Maria … Vasquez", que son personas distintas.
      // "Yohan David Hoyos Angúlo" / "Yojan David Hoyos Angulo" sí comparte 3.
      const mismoNombre = comunes.length >= 3;

      if (!mismaRaizCorreo && !mismoNombre) continue;

      // Se conserva la fila con correo propio; si ambas lo tienen, la primera.
      const conservar = tieneEmail(a.email) || !tieneEmail(b.email) ? a : b;
      const descartar = conservar === a ? b : a;
      yaDescartados.add(clave(descartar));

      // La fila que se descarta puede traer datos que la otra no tiene
      // (típico: la del correo no declara marca y la duplicada sí).
      if (!conservar.marca.trim() && descartar.marca.trim()) conservar.marca = descartar.marca;
      if (!conservar.cedula.trim() && descartar.cedula.trim()) conservar.cedula = descartar.cedula;
      if (!conservar.municipio.trim() && descartar.municipio.trim()) conservar.municipio = descartar.municipio;
      if (!conservar.origen.trim() && descartar.origen.trim()) conservar.origen = descartar.origen;

      dups.push({
        motivo: `«${a.nombre}» (hoja ${a.hoja}) y «${b.nombre}» (hoja ${b.hoja}) parecen la misma persona ${
          mismaRaizCorreo ? 'por la raíz del correo' : `por el nombre (${comunes.join(', ')})`
        }; se procesa la primera y se descarta la otra`,
        descartar: [clave(descartar)],
      });
    }
  }

  return dups;
}
