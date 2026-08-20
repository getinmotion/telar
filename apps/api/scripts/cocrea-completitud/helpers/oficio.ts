import { Catalogos, Item, idDe, porNombre, subcategoriasDe, tecnicasDe } from './catalogos';
import { sinTildes } from './normalize';

/**
 * Deduce el oficio de un artesano a partir de lo poco que hay: el nombre de su
 * taller, la Escuela Taller de la que viene y —cuando ya tiene tienda— lo que
 * escribió en la descripción o la historia.
 *
 * El Excel no trae oficio. Sin esta inferencia habría que meter a todos en una
 * categoría genérica, y un productor de viche del Pacífico terminaría publicado
 * como si hiciera cerámica.
 */

export interface Oficio {
  craft: string;
  categoria: string;
  subcategoria?: string;
  materiales: string[];
  /**
   * Técnica principal, por nombre exacto del catálogo.
   *
   * Se fija a mano en vez de tomar la primera técnica asociada al oficio: esa
   * asociación es floja (12 técnicas no tienen oficio) y "la primera" salía
   * arbitraria — un tejedor podía terminar etiquetado con "Fieltrado".
   */
  tecnica: string;
  /** Sustantivo de la pieza placeholder, en singular. */
  pieza: string;
  /** Verbo del oficio en infinitivo, para redactar sin repetir fórmula. */
  gesto: string;
  /** El mismo verbo en tercera persona: 'se destila', no 'se destilar'. */
  gesto3: string;
}

/**
 * Se evalúan en orden: la primera regla cuyo patrón aparezca en el texto gana.
 * Las más específicas van arriba (caña flecha antes que tejeduría genérica).
 */
const REGLAS: Array<{ patron: RegExp; oficio: Oficio }> = [
  {
    patron: /viche|biche|curao|arrechon|tomaseca|destil|pacific|guarapo/,
    oficio: {
      craft: 'Viche',
      tecnica: 'Viche',
      categoria: 'Bebidas ancestrales',
      // El catálogo de materiales no tiene caña de azúcar. "caña brava" es una
      // fibra, no la caña del viche, así que se deja sin material antes que
      // etiquetar 28 tiendas con algo falso. Ver docs/cocrea/03-contenido.md.
      materiales: [],
      pieza: 'botella de viche artesanal',
      gesto: 'destilar',
      gesto3: 'destila',
    },
  },
  {
    patron: /caña flecha|cana flecha|sombrero|vueltiao/,
    oficio: {
      craft: 'Trabajo en fibras naturales',
      tecnica: 'Trenzado',
      categoria: 'Decoración del Hogar',
      subcategoria: 'Cestas',
      // El catálogo no tiene "caña flecha"; "Fibras Naturales" es lo más cercano real.
      materiales: ['Fibras Naturales'],
      pieza: 'pieza tejida en caña flecha',
      gesto: 'trenzar',
      gesto3: 'trenza',
    },
  },
  {
    patron: /macrame|macramé|anudad/,
    oficio: {
      craft: 'Macramé',
      tecnica: 'Macramé',
      categoria: 'Decoración del Hogar',
      materiales: ['Algodón'],
      pieza: 'tapiz anudado en macramé',
      gesto: 'anudar',
      gesto3: 'anuda',
    },
  },
  {
    patron: /joyer|orfebr|plata|filigrana|aretes|collar/,
    oficio: {
      craft: 'Joyería artesanal',
      tecnica: 'Filigrana',
      categoria: 'Joyería y Accesorios',
      subcategoria: 'Aretes',
      materiales: ['Plata'],
      pieza: 'par de aretes',
      gesto: 'forjar',
      gesto3: 'forja',
    },
  },
  {
    patron: /marroquin|cuero|talabart/,
    oficio: {
      craft: 'Marroquinería artesanal',
      tecnica: 'Trabajo En Cuero',
      categoria: 'Bolsos y Carteras',
      materiales: ['Cuero'],
      pieza: 'bolso en cuero',
      gesto: 'curtir y coser',
      gesto3: 'curte y cose',
    },
  },
  {
    patron: /ceramic|cerámic|alfarer|barro|greda|arcilla/,
    oficio: {
      craft: 'Cerámica artesanal',
      tecnica: 'Torno',
      categoria: 'Vajillas y Cocina',
      subcategoria: 'Platos',
      materiales: ['Arcilla'],
      pieza: 'plato de cerámica',
      gesto: 'modelar',
      gesto3: 'modela',
    },
  },
  {
    patron: /jabon|jabón|aceite|aromater|cosmet|cosmét|esencia/,
    oficio: {
      craft: 'Cosmética artesanal',
      tecnica: 'Saponificación',
      categoria: 'Cuidado personal',
      subcategoria: 'Jabones artesanales',
      materiales: ['Aceites Esenciales'],
      pieza: 'jabón artesanal',
      gesto: 'macerar',
      gesto3: 'macera',
    },
  },
  {
    patron: /talla|madera|ebanist|escultur/,
    oficio: {
      craft: 'Tallado artesanal',
      tecnica: 'Talla',
      categoria: 'Arte y Esculturas',
      subcategoria: 'Esculturas',
      materiales: ['Madera'],
      pieza: 'talla en madera',
      gesto: 'tallar',
      gesto3: 'talla',
    },
  },
  {
    patron: /bordad/,
    oficio: {
      craft: 'Bordado artesanal',
      tecnica: 'Bordado',
      categoria: 'Textiles y Moda',
      materiales: ['Hilo'],
      pieza: 'pieza bordada a mano',
      gesto: 'bordar',
      gesto3: 'borda',
    },
  },
  {
    patron: /cester|canast|iraca|werregue|palma/,
    oficio: {
      craft: 'Cestería',
      tecnica: 'Tejido en fibras',
      categoria: 'Decoración del Hogar',
      subcategoria: 'Cestas',
      materiales: ['Fibras naturales'],
      pieza: 'canasto tejido',
      gesto: 'tejer',
      gesto3: 'teje',
    },
  },
  {
    patron: /chaquira|mostacilla|abalorio/,
    oficio: {
      craft: 'Trabajo en chaquira',
      tecnica: 'Tejido En Chaquira',
      categoria: 'Joyería y Accesorios',
      subcategoria: 'Collares',
      materiales: ['Chaquira'],
      pieza: 'collar en chaquira',
      gesto: 'ensartar',
      gesto3: 'ensarta',
    },
  },
  {
    patron: /telar|tejed|tejid|lana|mochila|ruana|hamaca|textil|confec|costur/,
    oficio: {
      craft: 'Tejeduría',
      tecnica: 'Telar vertical',
      categoria: 'Textiles y Moda',
      materiales: ['Lana'],
      pieza: 'pieza tejida en telar',
      gesto: 'tejer',
      gesto3: 'teje',
    },
  },
];

/** Cuando no hay ninguna señal, se cae aquí: textiles, el oficio más común del padrón. */
const POR_DEFECTO: Oficio = {
  craft: 'Tejeduría',
  tecnica: 'Telar vertical',
  categoria: 'Textiles y Moda',
  materiales: ['Algodón'],
  pieza: 'pieza tejida a mano',
  gesto: 'tejer',
  gesto3: 'teje',
};

export function inferirOficio(...senales: Array<string | null | undefined>): Oficio {
  const texto = sinTildes(senales.filter(Boolean).join(' '));
  for (const regla of REGLAS) {
    if (regla.patron.test(texto)) return regla.oficio;
  }
  return POR_DEFECTO;
}

export interface OficioResuelto extends Oficio {
  craftId?: string;
  primaryTechniqueId?: string;
  categoryId?: string;
  subcategoryId?: string;
  materialIds: string[];
  /** Materiales declarados que no existen en el catálogo. Debería estar vacío. */
  materialesSinResolver: string[];
}

/** Traduce los nombres del oficio a los UUIDs reales de la taxonomía. */
export function resolverOficio(cat: Catalogos, oficio: Oficio): OficioResuelto {
  const craftId = idDe(cat.crafts, oficio.craft);
  const categoria = porNombre(cat.categories, oficio.categoria);
  const categoryId = categoria?.id;

  let subcategoryId: string | undefined;
  if (categoryId && oficio.subcategoria) {
    subcategoryId = subcategoriasDe(cat, categoryId).find(
      (s) => sinTildes(s.name) === sinTildes(oficio.subcategoria!),
    )?.id;
  }

  // Manda la técnica declarada por nombre. Buscar sólo entre las asociadas al
  // oficio no sirve: 12 de las 104 técnicas tienen `craftId` nulo, y la de Viche
  // es una de ellas. Como último recurso, una del oficio.
  const tecnicasDelOficio: Item[] = craftId ? tecnicasDe(cat, craftId) : [];
  const primaryTechniqueId =
    cat.techniques.find((t) => sinTildes(t.name) === sinTildes(oficio.tecnica))?.id ??
    tecnicasDelOficio.find((t) => sinTildes(t.name) === sinTildes(oficio.craft))?.id ??
    tecnicasDelOficio[0]?.id;

  const materialIds = oficio.materiales.map((m) => idDe(cat.materials, m)).filter((x): x is string => !!x);
  // Un material declarado que no exista en el catálogo es un error de este script,
  // no del dato: conviene verlo en vez de que desaparezca en silencio.
  const materialesSinResolver = oficio.materiales.filter((m) => !idDe(cat.materials, m));

  return { ...oficio, craftId, primaryTechniqueId, categoryId, subcategoryId, materialIds, materialesSinResolver };
}
