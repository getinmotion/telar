import { OficioResuelto } from './oficio';
import { capitalizar, sinTildes, slug } from './normalize';

/** Sólo la primera letra en mayúscula: "Botella de viche", no "Botella De Viche". */
const mayusInicial = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Género del oficio. Se mira la **primera** palabra, no la última: "marroquinería
 * artesanal" es femenino aunque termine en "-al", y "trabajo en fibras naturales"
 * es masculino aunque termine en "-es".
 */
const esFemenino = (craft: string): boolean => /(a|ía|ción|dad)$/.test(craft.toLowerCase().split(/\s+/)[0] ?? '');

/** "la tejeduría", "el viche". */
const conArticulo = (craft: string): string => `${esFemenino(craft) ? 'la' : 'el'} ${craft.toLowerCase()}`;

/** Con la preposición ya contraída: "a la tejeduría", "al viche" — nunca "a el viche". */
const aConArticulo = (craft: string): string =>
  esFemenino(craft) ? `a la ${craft.toLowerCase()}` : `al ${craft.toLowerCase()}`;

/**
 * Genera el contenido de cada tienda.
 *
 * El requisito del convenio es que las tiendas no se sientan copiadas entre sí,
 * pero no hay información real de cada artesano más allá del oficio y el
 * territorio. La salida se arma con variantes elegidas de forma determinista a
 * partir del nombre de la persona: dos artesanos distintos reciben textos
 * distintos, y volver a correr el script produce exactamente lo mismo (hace
 * falta para que la inyección sea idempotente).
 */

/** Hash estable de una cadena. No es criptográfico: sólo necesita repartir bien. */
function semilla(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Elige un elemento de forma estable para una misma clave, variando por `vuelta`. */
const elegir = <T>(opciones: T[], clave: string, vuelta = 0): T =>
  opciones[(semilla(clave) + vuelta * 7919) % opciones.length];

export interface DatosArtesano {
  nombre: string;
  marca: string;
  municipio: string;
  departamento: string;
  origen: string;
  oficio: OficioResuelto;
}

// ─────────────────────────── marca ───────────────────────────

const PREFIJOS_MARCA = ['Taller', 'Casa', 'Obrador', 'Manos de', 'Raíz'];

/**
 * Nombre de marca para quien no declara ninguno. Se construye con el apellido y
 * el territorio para que sea único y suene propio, no como un identificador.
 */
export function marcaSugerida(nombre: string, municipio: string, oficio: OficioResuelto): string {
  const partes = nombre.trim().split(/\s+/);
  const apellido = capitalizar(partes[partes.length - 1] || partes[0] || 'Artesano');
  const prefijo = elegir(PREFIJOS_MARCA, nombre);
  const lugar = municipio ? capitalizar(municipio.split(/[,-]/)[0].trim()) : '';
  const base = `${prefijo} ${apellido}`;
  return lugar && !sinTildes(base).includes(sinTildes(lugar)) ? `${base} · ${lugar}` : base;
}

/** Slug de tienda a partir de la marca, con desambiguación si ya está tomado. */
export const slugDeMarca = (marca: string, intento = 0): string =>
  intento === 0 ? slug(marca) : `${slug(marca)}-${intento + 1}`;

// ─────────────────────── identidad artesanal ───────────────────────

const APRENDIZAJE = [
  { clave: 'family', texto: 'en la casa, viendo trabajar a los mayores' },
  { clave: 'community', texto: 'en la comunidad, entre vecinos que compartían el oficio' },
  { clave: 'master', texto: 'de la mano de un maestro del territorio' },
  { clave: 'school', texto: 'en la Escuela Taller, con maestros que enseñan el oficio completo' },
] as const;

const ESTILOS = [
  ['Tradicional', 'Funcional'],
  ['Tradicional', 'Decorativo'],
  ['Contemporáneo', 'Funcional'],
  ['Fusión', 'Colorido'],
  ['Minimalista', 'Funcional'],
];

const SINGULARIDAD = [
  'Cada pieza se termina a mano, así que no hay dos exactamente iguales.',
  'El proceso conserva los tiempos del oficio: nada se acelera para producir más.',
  'Los materiales se consiguen en el territorio y se trabajan sin intermediarios.',
  'La técnica viene de una tradición local que hoy sostienen pocas manos.',
];

export interface PerfilArtesanal {
  artisanName: string;
  artisticName: string;
  craftId?: string;
  craftIds: string[];
  techniqueIds: string[];
  materialIds: string[];
  categoryIds: string[];
  learnedFrom: string;
  learnedFromDetail: string;
  startAge: number;
  shortBio: string;
  uniqueness: string;
  craftStyle: string[];
  country: string;
  department: string;
  municipality: string;
  workshopDescription: string;
  completedAt: string;
}

export function perfilArtesanal(d: DatosArtesano, fecha: string): PerfilArtesanal {
  const clave = d.nombre + '|' + d.marca;
  const aprendizaje = elegir([...APRENDIZAJE], clave);
  const escuela = /escuela taller/i.test(d.origen) ? APRENDIZAJE[3] : aprendizaje;
  const lugar = d.municipio || d.departamento || 'su territorio';

  return {
    artisanName: capitalizar(d.nombre),
    artisticName: d.marca,
    craftId: d.oficio.craftId,
    craftIds: d.oficio.craftId ? [d.oficio.craftId] : [],
    techniqueIds: d.oficio.primaryTechniqueId ? [d.oficio.primaryTechniqueId] : [],
    materialIds: d.oficio.materialIds,
    categoryIds: d.oficio.categoryId ? [d.oficio.categoryId] : [],
    learnedFrom: escuela.clave,
    learnedFromDetail: `Aprendió ${escuela.texto}, en ${lugar}.`,
    startAge: 14 + (semilla(clave) % 16),
    shortBio: `${capitalizar(d.nombre)} trabaja ${conArticulo(d.oficio.craft)} en ${lugar}. Su marca es ${d.marca}.`,
    uniqueness: elegir(SINGULARIDAD, clave),
    craftStyle: elegir(ESTILOS, clave),
    country: 'Colombia',
    department: d.departamento,
    municipality: d.municipio,
    workshopDescription: `El taller de ${d.marca} está en ${lugar}. Allí se ${d.oficio.gesto3} cada pieza, de principio a fin.`,
    completedAt: fecha,
  };
}

// ─────────────────────── contenido de tienda ───────────────────────

const VALORES = [
  { name: 'Hecho a mano', description: 'Cada pieza pasa por las manos del artesano, sin producción en serie.' },
  { name: 'Territorio', description: 'Los materiales y los saberes vienen del lugar donde se trabaja.' },
  { name: 'Tiempo propio', description: 'El oficio marca los tiempos; las piezas no se apuran.' },
  { name: 'Oficio vivo', description: 'Sostener la técnica es también sostener a quienes la enseñan.' },
];

export const brandClaim = (d: DatosArtesano): string =>
  elegir(
    [
      `${d.oficio.craft} de ${d.municipio || d.departamento}`,
      `Oficio de ${d.municipio || d.departamento}, pieza a pieza`,
      `${d.oficio.craft} hecha a mano`,
    ],
    d.marca,
  );

export const descripcionTienda = (d: DatosArtesano): string =>
  `${d.marca} es el taller de ${capitalizar(d.nombre)}, dedicado ${aConArticulo(d.oficio.craft)} en ${d.municipio || d.departamento}. Cada pieza se trabaja a mano, con materiales del territorio.`;

export const historiaTienda = (d: DatosArtesano): string => {
  const clave = d.marca + d.nombre;
  return `${elegir(
    [
      `Este taller nació del oficio aprendido en casa.`,
      `Este taller empezó como un encargo suelto y terminó siendo el trabajo de todos los días.`,
      `Este taller es la continuación de una tradición que en ${d.municipio || d.departamento} ya venía de antes.`,
    ],
    clave,
  )} Hoy ${d.marca} ${d.oficio.gesto3} desde ${d.municipio || d.departamento}, sosteniendo una técnica que exige tiempo y oficio. ${elegir(SINGULARIDAD, clave, 1)}`;
};

export const aboutContent = (d: DatosArtesano) => ({
  title: d.marca,
  story: historiaTienda(d),
  mission: `Sostener ${conArticulo(d.oficio.craft)} como oficio vivo en ${d.municipio || d.departamento} y llevar cada pieza a quien sepa valorarla.`,
  vision: `Que el oficio siga teniendo quien lo trabaje en ${d.municipio || d.departamento} dentro de veinte años.`,
  // El marketplace renderiza `values` como {name, description}; con strings sueltos
  // la descripción se pierde (ver ShopDetail.tsx).
  values: [VALORES[0], elegir(VALORES.slice(1), d.marca), elegir(VALORES.slice(1), d.marca, 2)].filter(
    (v, i, arr) => arr.findIndex((x) => x.name === v.name) === i,
  ),
});

export const contactConfig = (d: DatosArtesano, whatsapp: string) => ({
  email: '',
  phone: '',
  whatsapp,
  address: [d.municipio, d.departamento].filter(Boolean).join(', '),
  hours: 'Lun-Vie 9:00-17:00',
  map_embed: '',
});

// ─────────────────────── políticas y FAQ ───────────────────────

/** Igual en todas las tiendas, por decisión del convenio. */
export const POLITICA_DEVOLUCION =
  'No hay devolución. Cada pieza es hecha a mano por encargo del artesano, por lo que no se aceptan devoluciones ni cambios una vez despachado el pedido. Si la pieza llega con un daño ocurrido durante el transporte, escríbenos y lo resolvemos contigo.';

/** Misma estructura en todas, pero las respuestas hablan de esta marca y esta pieza. */
export const faq = (d: DatosArtesano) => [
  {
    q: '¿Las piezas son hechas a mano?',
    a: `Sí. Todas las piezas de ${d.marca} se trabajan a mano en ${d.municipio || d.departamento}. Como cada una se ${d.oficio.gesto3} por separado, pueden variar levemente en color, textura o medidas: eso es parte del oficio, no un defecto.`,
  },
  {
    q: '¿Cuánto demora mi pedido?',
    a: `Depende de la pieza. ${mayusInicial(d.oficio.pieza)} requiere tiempo de elaboración, así que el taller confirma la fecha al momento del pedido. Si la pieza está disponible, el despacho es más rápido.`,
  },
  {
    q: '¿Aceptan devoluciones?',
    a: 'No. Al ser piezas hechas a mano no se aceptan devoluciones ni cambios. Si tu pedido llega dañado por el transporte, escríbenos y lo solucionamos.',
  },
  {
    q: '¿Puedo encargar una pieza distinta?',
    a: `Sí. ${d.marca} recibe encargos: escribe contando qué necesitas y el taller te dice si es posible, cuánto demora y cuánto cuesta.`,
  },
];

// ─────────────────────── producto placeholder ───────────────────────

export interface ProductoPlaceholder {
  name: string;
  shortDescription: string;
  history: string;
  careNotes: string;
  usageSuggestions: string;
}

const ADJETIVOS = ['de la casa', 'del taller', 'de temporada', 'del maestro', 'de origen'];

export function productoPlaceholder(d: DatosArtesano): ProductoPlaceholder {
  const clave = d.marca + '|producto';
  const nombre = `${mayusInicial(d.oficio.pieza)} ${elegir(ADJETIVOS, clave)} · ${d.marca}`;

  return {
    name: nombre.slice(0, 150),
    shortDescription: `${mayusInicial(d.oficio.pieza)} elaborada a mano en el taller de ${d.marca}, en ${d.municipio || d.departamento}. Una pieza representativa del trabajo del artesano, hecha con ${d.oficio.materiales.join(' y ').toLowerCase()} y terminada una a una.`,
    history: `${elegir(
      [
        `Esta pieza es la que el taller enseña primero cuando alguien pregunta qué hacen.`,
        `Esta pieza resume lo que ${d.marca} sabe hacer: la técnica completa, sin atajos.`,
        `Esta pieza es la que más se repite en el taller, y por eso la que mejor cuenta el oficio.`,
      ],
      clave,
    )} Se ${d.oficio.gesto3} en ${d.municipio || d.departamento} siguiendo el proceso que ${capitalizar(d.nombre)} aprendió y hoy sostiene. ${elegir(SINGULARIDAD, clave, 3)}`,
    careNotes: elegir(
      [
        'Guárdala en un lugar seco y lejos de la luz directa del sol. Límpiala con un paño suave y seco.',
        'Evita el contacto prolongado con agua y con productos químicos. Un paño seco basta para mantenerla.',
        'Manipúlala con las manos limpias y guárdala protegida del polvo y la humedad.',
      ],
      clave,
    ),
    usageSuggestions: elegir(
      [
        'Pensada para el uso diario, no sólo para exhibir.',
        'Funciona igual de bien como pieza de uso y como regalo.',
        'Acompaña bien espacios sencillos, donde el material se pueda apreciar.',
      ],
      clave,
    ),
  };
}

// ─────────────────────── logo genérico ───────────────────────

const PALETA = ['#2E5424', '#7A4A2B', '#1F3A5F', '#6B2D3C', '#3D4A2A', '#5A3A6B', '#2B5B5B', '#8A5A1F'];

/** Iniciales de la marca: hasta dos letras. */
const iniciales = (marca: string): string =>
  marca
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || marca.slice(0, 2).toUpperCase();

/**
 * Logo distinto por tienda: monograma sobre un color de la paleta.
 * Es un placeholder declarado, no arte final — el endpoint de subida acepta SVG,
 * así que no hace falta rasterizar.
 */
export function logoSvg(marca: string): string {
  const color = elegir(PALETA, marca);
  const txt = iniciales(marca);
  const tam = txt.length > 1 ? 132 : 168;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${marca.replace(/[<>&"]/g, '')}">
  <rect width="512" height="512" fill="${color}"/>
  <circle cx="256" cy="256" r="196" fill="none" stroke="#F3EDE0" stroke-width="6" opacity="0.55"/>
  <text x="256" y="256" fill="#F3EDE0" font-family="Georgia, 'Times New Roman', serif" font-size="${tam}" font-weight="700" letter-spacing="6" text-anchor="middle" dominant-baseline="central">${txt}</text>
</svg>`;
}
