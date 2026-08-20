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
 * Rescata la marca cuando el Excel trae una frase en vez de un nombre:
 * "Emprendimiento en macrame, mi marca se llama kanuto design macrame tejido de
 * origen" -> "Kanuto Design Macrame". Sin esto la tienda se quedaba con el
 * nombre derivado del apellido y se perdía la marca que el artesano sí declaró.
 */
export function marcaDesdeFrase(texto: string): string | null {
  const t = (texto || '').trim();
  if (!t || t.length <= 60) return null;

  const patron = /(?:mi marca (?:se llama|es)|marca:|se llama)\s+(.+)/i.exec(t);
  if (patron) {
    // Corta en la primera coma o al llegar a un largo razonable de nombre.
    const bruto = patron[1].split(/[,.;]/)[0].trim().split(/\s+/).slice(0, 5).join(' ');
    if (bruto.length >= 3) return capitalizar(bruto);
  }
  return null;
}

/**
 * Nombre de marca para quien no declara ninguno. Se construye con el apellido y
 * el territorio para que sea único y suene propio, no como un identificador.
 */
export function marcaSugerida(nombre: string, municipio: string, oficio: OficioResuelto): string {
  const partes = nombre.trim().split(/\s+/);
  const apellido = capitalizar(partes[partes.length - 1] || partes[0] || 'Artesano');
  const prefijo = elegir(PREFIJOS_MARCA, nombre);
  const lugar = municipio ? capitalizar(municipio.split(/[,-]/)[0].trim()) : '';
  // Se nombra el oficio, no sólo el apellido: "Taller Meza · Viche" dice algo;
  // "Manos de Meza" no dice nada de lo que ahí se hace.
  const base = `${prefijo} ${apellido}`;
  const conOficio = `${base} · ${oficio.craft.split(/\s+/)[0]}`;
  return lugar && !sinTildes(conOficio).includes(sinTildes(lugar)) ? `${conOficio}, ${lugar}` : conOficio;
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
  physicalSpecs: { heightCm: number; widthCm: number; lengthOrDiameterCm: number; realWeightKg: number };
  logistics: {
    packagingType: string;
    packHeightCm: number;
    packWidthCm: number;
    packLengthCm: number;
    packWeightKg: number;
    fragility: 'bajo' | 'medio' | 'alto';
    requiresAssembly: boolean;
    specialProtectionNotes: string;
  };
  production: {
    availabilityType: string;
    productionTimeDays: number;
    monthlyCapacity: number;
    processDescription: string;
    tools: string[];
  };
  estimatedElaborationTime: string;
  precioCop: number;
}

/**
 * Medidas, peso, precio y tiempos plausibles por oficio.
 *
 * Sin esto la ficha de producto queda con la mitad de los campos vacíos: el
 * marketplace muestra dimensiones, peso y logística, y una pieza sin ellos se ve
 * incompleta. Son valores representativos del oficio, no medidas reales de una
 * pieza concreta — el artesano los corrige cuando entre a su tienda.
 */
const FICHA_POR_OFICIO: Record<
  string,
  { alto: number; ancho: number; largo: number; pesoKg: number; fragilidad: 'bajo' | 'medio' | 'alto'; dias: number; capacidad: number; precio: number; herramientas: string[] }
> = {
  Viche: { alto: 28, ancho: 8, largo: 8, pesoKg: 1.1, fragilidad: 'alto', dias: 30, capacidad: 40, precio: 70000, herramientas: ['Alambique', 'Barriles de roble', 'Filtros de tela'] },
  Tejeduría: { alto: 40, ancho: 30, largo: 2, pesoKg: 0.6, fragilidad: 'bajo', dias: 10, capacidad: 12, precio: 180000, herramientas: ['Telar de horqueta', 'Agujas', 'Tijeras'] },
  'Trabajo en fibras naturales': { alto: 25, ancho: 25, largo: 12, pesoKg: 0.4, fragilidad: 'medio', dias: 12, capacidad: 10, precio: 150000, herramientas: ['Punzón', 'Tijeras', 'Aguja capotera'] },
  Cestería: { alto: 22, ancho: 28, largo: 28, pesoKg: 0.5, fragilidad: 'medio', dias: 8, capacidad: 14, precio: 130000, herramientas: ['Punzón', 'Machete pequeño', 'Tijeras'] },
  Macramé: { alto: 90, ancho: 50, largo: 3, pesoKg: 0.7, fragilidad: 'bajo', dias: 7, capacidad: 10, precio: 190000, herramientas: ['Bastidor', 'Tijeras', 'Peine'] },
  'Joyería artesanal': { alto: 4, ancho: 3, largo: 1, pesoKg: 0.03, fragilidad: 'medio', dias: 5, capacidad: 25, precio: 160000, herramientas: ['Soplete', 'Pinzas', 'Yunque', 'Limas'] },
  'Trabajo en chaquira': { alto: 25, ancho: 3, largo: 1, pesoKg: 0.05, fragilidad: 'medio', dias: 6, capacidad: 20, precio: 120000, herramientas: ['Aguja de chaquira', 'Hilo encerado', 'Tijeras'] },
  'Marroquinería artesanal': { alto: 30, ancho: 25, largo: 12, pesoKg: 0.8, fragilidad: 'bajo', dias: 12, capacidad: 8, precio: 320000, herramientas: ['Chaira', 'Punzón', 'Martillo', 'Hilo encerado'] },
  'Cerámica artesanal': { alto: 8, ancho: 22, largo: 22, pesoKg: 0.9, fragilidad: 'alto', dias: 15, capacidad: 20, precio: 110000, herramientas: ['Torno', 'Estecas', 'Horno'] },
  'Cosmética artesanal': { alto: 6, ancho: 8, largo: 3, pesoKg: 0.12, fragilidad: 'bajo', dias: 20, capacidad: 60, precio: 35000, herramientas: ['Moldes', 'Balanza', 'Batidora'] },
  'Tallado artesanal': { alto: 30, ancho: 12, largo: 12, pesoKg: 1.4, fragilidad: 'medio', dias: 14, capacidad: 6, precio: 260000, herramientas: ['Gubias', 'Mazo', 'Lijas'] },
  'Bordado artesanal': { alto: 35, ancho: 35, largo: 1, pesoKg: 0.25, fragilidad: 'bajo', dias: 9, capacidad: 12, precio: 140000, herramientas: ['Bastidor', 'Agujas', 'Dedal'] },
};

const FICHA_POR_DEFECTO = FICHA_POR_OFICIO['Tejeduría'];

const ADJETIVOS = ['de la casa', 'del taller', 'de temporada', 'del maestro', 'de origen'];

export function productoPlaceholder(d: DatosArtesano): ProductoPlaceholder {
  const clave = d.marca + '|producto';
  const nombre = `${mayusInicial(d.oficio.pieza)} ${elegir(ADJETIVOS, clave)} · ${d.marca}`;
  const f = FICHA_POR_OFICIO[d.oficio.craft] ?? FICHA_POR_DEFECTO;

  // Pequeña variación por tienda para que las fichas no salgan clonadas.
  const jitter = (base: number, pct = 0.15) => {
    const delta = ((semilla(clave + base) % 200) - 100) / 100; // -1..1
    return Math.round(base * (1 + delta * pct) * 100) / 100;
  };

  const alto = jitter(f.alto);
  const ancho = jitter(f.ancho);
  const largo = jitter(f.largo);
  const peso = jitter(f.pesoKg, 0.2);

  return {
    name: nombre.slice(0, 150),
    physicalSpecs: {
      heightCm: alto,
      widthCm: ancho,
      lengthOrDiameterCm: largo,
      realWeightKg: peso,
    },
    logistics: {
      packagingType: f.fragilidad === 'alto' ? 'Caja rígida con relleno' : 'Caja de cartón corrugado',
      // El empaque va holgado respecto a la pieza; el peso incluye el material.
      packHeightCm: Math.round((alto + 6) * 100) / 100,
      packWidthCm: Math.round((ancho + 6) * 100) / 100,
      packLengthCm: Math.round((largo + 6) * 100) / 100,
      packWeightKg: Math.round((peso + 0.25) * 100) / 100,
      fragility: f.fragilidad,
      requiresAssembly: false,
      specialProtectionNotes:
        f.fragilidad === 'alto'
          ? 'Pieza frágil: se envía con relleno y señalización de frágil en el empaque.'
          : 'Se envía protegida con papel y plástico burbuja.',
    },
    production: {
      availabilityType: 'bajo_pedido',
      productionTimeDays: f.dias,
      monthlyCapacity: f.capacidad,
      processDescription: `Cada pieza se ${d.oficio.gesto3} a mano en el taller de ${d.marca}, en ${d.municipio || d.departamento}. El proceso toma alrededor de ${f.dias} días y el taller alcanza unas ${f.capacidad} piezas al mes trabajando con ${d.oficio.materiales.join(' y ').toLowerCase()}.`,
      tools: f.herramientas,
    },
    estimatedElaborationTime: f.dias >= 21 ? `${Math.round(f.dias / 7)} semanas` : `${f.dias} días`,
    precioCop: f.precio,
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escapar(marca)}">
  <rect width="512" height="512" fill="${color}"/>
  <circle cx="256" cy="256" r="196" fill="none" stroke="#F3EDE0" stroke-width="6" opacity="0.55"/>
  <text x="256" y="256" fill="#F3EDE0" font-family="Georgia, 'Times New Roman', serif" font-size="${tam}" font-weight="700" letter-spacing="6" text-anchor="middle" dominant-baseline="central">${txt}</text>
</svg>`;
}

const escapar = (s: string): string =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Trama geométrica que evoca el tejido, distinta por marca. Se usa de fondo. */
function trama(marca: string, color: string, opacidad: number): string {
  const paso = 24 + (semilla(marca) % 5) * 8;
  const variante = semilla(marca + 'trama') % 3;
  const linea =
    variante === 0
      ? `<path d="M0 0 L${paso} ${paso} M${paso} 0 L0 ${paso}" stroke="${color}" stroke-width="1.5" fill="none"/>`
      : variante === 1
        ? `<path d="M0 ${paso / 2} L${paso} ${paso / 2} M${paso / 2} 0 L${paso / 2} ${paso}" stroke="${color}" stroke-width="1.5" fill="none"/>`
        : `<circle cx="${paso / 2}" cy="${paso / 2}" r="${paso / 5}" stroke="${color}" stroke-width="1.5" fill="none"/>`;
  return `<defs><pattern id="t" width="${paso}" height="${paso}" patternUnits="userSpaceOnUse" patternTransform="rotate(${15 + (semilla(marca) % 4) * 15})">${linea}</pattern></defs>
  <rect width="100%" height="100%" fill="url(#t)" opacity="${opacidad}"/>`;
}

/**
 * Banner de la tienda. Sin él la cabecera del perfil queda vacía en el
 * marketplace, que es lo primero que se ve al entrar a una tienda.
 */
export function bannerSvg(marca: string, oficio: string, lugar: string): string {
  const color = elegir(PALETA, marca);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600" role="img" aria-label="${escapar(marca)}">
  <rect width="1600" height="600" fill="${color}"/>
  ${trama(marca, '#F3EDE0', 0.14)}
  <rect x="0" y="0" width="1600" height="600" fill="url(#g)"/>
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.35"/>
  </linearGradient></defs>
  <text x="80" y="470" fill="#F3EDE0" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="700">${escapar(marca).slice(0, 34)}</text>
  <text x="82" y="524" fill="#F3EDE0" font-family="Inter, Helvetica, Arial, sans-serif" font-size="28" opacity="0.85" letter-spacing="3">${escapar(oficio.toUpperCase())}${lugar ? ' · ' + escapar(lugar.toUpperCase()) : ''}</text>
</svg>`;
}

/**
 * Imagen del producto. Un producto sin foto se ve roto en el marketplace y no
 * pasa el filtro visual de la tienda, así que hace falta aunque sea provisional.
 */
export function productoSvg(marca: string, pieza: string): string {
  const color = elegir(PALETA, marca, 1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" role="img" aria-label="${escapar(pieza)}">
  <rect width="1000" height="1000" fill="#F3EDE0"/>
  ${trama(marca + pieza, color, 0.16)}
  <circle cx="500" cy="430" r="210" fill="${color}" opacity="0.92"/>
  <text x="500" y="430" fill="#F3EDE0" font-family="Georgia, 'Times New Roman', serif" font-size="150" font-weight="700" text-anchor="middle" dominant-baseline="central">${iniciales(marca)}</text>
  <text x="500" y="740" fill="#2b2b26" font-family="Inter, Helvetica, Arial, sans-serif" font-size="34" text-anchor="middle">${escapar(mayusInicial(pieza)).slice(0, 40)}</text>
  <text x="500" y="792" fill="#2b2b26" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" text-anchor="middle" opacity="0.6">${escapar(marca).slice(0, 40)}</text>
</svg>`;
}
