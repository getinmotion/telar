import { PersonaExcel } from './excel';
import { ShopProd } from './api';
import { email, localEmail, raizEmail, solape, tokens } from './normalize';

/**
 * Empareja las filas del Excel con las tiendas del convenio en la BD.
 *
 * Por qué no basta el correo: 27 filas del Excel vienen sin correo (los portadores
 * de Viche) y varias más lo traen con typo (`martapgomez8` vs `marthapgomez8`).
 * Esas personas SÍ tienen tienda en producción, así que emparejar sólo por correo
 * las daría por faltantes y crearía cuentas duplicadas.
 *
 * Por qué la asignación es global y no fila-a-fila: dos personas distintas declaran
 * la misma marca ("Viche Ulaita"), y el primero en el Excel se quedaba con la tienda
 * del otro. Se puntúan todos los pares y se asignan de mayor a menor, de forma que
 * cada tienda va a la persona con más evidencia y nadie se queda con la ajena.
 */

export interface Emparejamiento {
  persona: PersonaExcel;
  shop: ShopProd;
  score: number;
  razones: string;
}

export interface ResultadoCruce {
  emparejados: Emparejamiento[];
  /** Filas del Excel sin tienda: hay que crearles cuenta. */
  sinTienda: PersonaExcel[];
  /** Tiendas del convenio que no aparecen en el Excel: existen y se respetan. */
  sinFilaExcel: ShopProd[];
}

/** Debajo de esto no hay evidencia suficiente; preferimos dejarlo sin emparejar. */
const UMBRAL = 30;

const PESOS = {
  emailExacto: 100,
  emailRaiz: 80,
  marca: 40,
  nombrePorToken: 12,
  apellidoEnCorreo: 10,
};

function puntuar(p: PersonaExcel, s: ShopProd): { score: number; razones: string[] } {
  const razones: string[] = [];
  let score = 0;

  const pMail = email(p.email);
  const sMail = email(s.user?.email);

  if (pMail && sMail && pMail === sMail) {
    score += PESOS.emailExacto;
    razones.push('correo idéntico');
  } else if (pMail && sMail && raizEmail(pMail) && raizEmail(pMail) === raizEmail(sMail)) {
    score += PESOS.emailRaiz;
    razones.push('correo con typo');
  }

  // La marca puede estar en shopName o en artisticName: hay tiendas llamadas
  // "Telar" cuyo artisticName es la marca real ("Viche Único").
  const marcaShop = tokens([s.shopName, s.artisanProfile?.artisticName].filter(Boolean).join(' '));
  const marcaExcel = tokens(p.marca);
  const sim = solape(marcaExcel, marcaShop);
  if (sim > 0) {
    score += sim * PESOS.marca;
    razones.push(`marca ${(sim * 100).toFixed(0)}%`);
  }

  const nombrePersona = tokens(p.nombre, true);
  const candidatos = new Set([
    ...marcaShop,
    ...tokens([s.artisanProfile?.artisanName, s.artisanProfile?.artisticName].filter(Boolean).join(' '), true),
    ...tokens(sMail.split('@')[0], true),
  ]);
  const comunes = [...nombrePersona].filter((t) => candidatos.has(t)).length;
  if (comunes) {
    score += comunes * PESOS.nombrePorToken;
    razones.push(`nombre ×${comunes}`);
  }

  // Apellidos pegados en la parte local del correo: angulosaac <- "Angulo Saa".
  const local = localEmail(sMail);
  const pegados = [...nombrePersona].filter((t) => t.length > 3 && local.includes(t)).length;
  if (pegados) {
    score += pegados * PESOS.apellidoEnCorreo;
    razones.push(`apellido en correo ×${pegados}`);
  }

  return { score, razones };
}

export function cruzar(personas: PersonaExcel[], shops: ShopProd[]): ResultadoCruce {
  const pares: Array<{ pi: number; si: number; score: number; razones: string }> = [];

  personas.forEach((p, pi) => {
    shops.forEach((s, si) => {
      const { score, razones } = puntuar(p, s);
      if (score >= UMBRAL) pares.push({ pi, si, score, razones: razones.join(' + ') });
    });
  });

  pares.sort((a, b) => b.score - a.score);

  const personaTomada = new Set<number>();
  const shopTomada = new Set<number>();
  const emparejados: Emparejamiento[] = [];

  for (const par of pares) {
    if (personaTomada.has(par.pi) || shopTomada.has(par.si)) continue;
    personaTomada.add(par.pi);
    shopTomada.add(par.si);
    emparejados.push({
      persona: personas[par.pi],
      shop: shops[par.si],
      score: par.score,
      razones: par.razones,
    });
  }

  return {
    emparejados,
    sinTienda: personas.filter((_, i) => !personaTomada.has(i)),
    sinFilaExcel: shops.filter((_, i) => !shopTomada.has(i)),
  };
}

/** Emparejamientos que no fueron por correo idéntico: los que conviene revisar a ojo. */
export const inferidos = (r: ResultadoCruce): Emparejamiento[] =>
  r.emparejados.filter((e) => !e.razones.startsWith('correo idéntico'));
