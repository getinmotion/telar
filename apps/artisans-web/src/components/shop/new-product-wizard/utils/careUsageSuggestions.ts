import type { PiecePurpose } from '../hooks/useNewWizardState';

interface SuggestionSet {
  care: string[];
  usage: string[];
}

/**
 * Sugerencias de cuidados y uso por categoría TELAR.
 * Match por substring lowercase del nombre de categoría
 * (mismo patrón que CATEGORY_CRAFT_KEYWORDS en CraftPicker).
 */
const BY_CATEGORY: { keywords: string[]; set: SuggestionSet }[] = [
  {
    keywords: ['textil', 'moda'],
    set: {
      care: [
        'Lavar a mano con agua fría y jabón suave',
        'Secar a la sombra, sin exprimir',
        'Planchar a baja temperatura por el revés',
        'Guardar doblado en lugar seco',
        'Evitar blanqueador y secadora',
      ],
      usage: [
        'Ideal para el uso diario con prendas neutras',
        'Pieza de abrigo para clima templado',
        'Combina con looks artesanales o minimalistas',
        'Un regalo con historia',
      ],
    },
  },
  {
    keywords: ['bolso', 'cartera'],
    set: {
      care: [
        'Limpiar con paño seco o apenas húmedo',
        'Evitar sobrecargarlo para conservar la forma',
        'Guardar relleno con papel, en funda de tela',
        'No exponer a lluvia ni humedad prolongada',
        'Hidratar el cuero cada pocos meses (si aplica)',
      ],
      usage: [
        'Perfecto para salidas de día y mercados',
        'Complemento para looks casuales o de oficina',
        'Lleva tus esenciales sin plástico',
      ],
    },
  },
  {
    keywords: ['joyer', 'accesorio'],
    set: {
      care: [
        'Guardar en estuche individual para evitar rayones',
        'Evitar contacto con perfumes y cremas',
        'Limpiar con paño suave después de usar',
        'Retirar antes de bañarse o nadar',
      ],
      usage: [
        'Realza looks sencillos con un toque artesanal',
        'Perfecta para ocasiones especiales',
        'Un regalo significativo hecho a mano',
      ],
    },
  },
  {
    keywords: ['decoraci', 'hogar'],
    set: {
      care: [
        'Quitar el polvo con paño seco y suave',
        'Evitar luz solar directa para conservar el color',
        'Mantener lejos de fuentes de humedad',
        'Mover con ambas manos',
      ],
      usage: [
        'Punto focal para salas y recibidores',
        'Combina con ambientes cálidos y naturales',
        'Ideal sobre mesas, repisas o consolas',
      ],
    },
  },
  {
    keywords: ['mueble'],
    set: {
      care: [
        'Limpiar con paño seco; evitar químicos abrasivos',
        'Proteger del sol directo y la humedad',
        'Usar fieltros para no rayar el piso',
        'Aplicar cera o aceite natural periódicamente',
        'Revisar y ajustar uniones con el uso',
      ],
      usage: [
        'Pieza funcional para interiores cálidos',
        'Ideal en rincones de lectura o descanso',
        'Complementa espacios rústicos y contemporáneos',
      ],
    },
  },
  {
    keywords: ['vajilla', 'cocina'],
    set: {
      care: [
        'Lavar a mano con esponja suave',
        'Evitar cambios bruscos de temperatura',
        'No usar en microondas si tiene detalles metálicos',
        'Secar bien antes de guardar',
        'Evitar golpes contra superficies duras',
      ],
      usage: [
        'Ideal para servir y compartir en la mesa',
        'Perfecta para ocasiones especiales',
        'Suma calidez a la cocina de todos los días',
      ],
    },
  },
  {
    keywords: ['arte', 'escultura'],
    set: {
      care: [
        'Manipular con ambas manos y superficie limpia',
        'Quitar el polvo con brocha suave',
        'Evitar sol directo y humedad',
        'Exhibir sobre una base estable y nivelada',
      ],
      usage: [
        'Punto focal para salas, estudios o vitrinas',
        'Pieza de colección con valor cultural',
        'Regalo institucional o conmemorativo',
      ],
    },
  },
  {
    keywords: ['juguete', 'instrumento'],
    set: {
      care: [
        'Limpiar con paño seco después de usar',
        'Guardar en lugar seco, lejos del sol',
        'Revisar cuerdas y uniones periódicamente',
        'Evitar caídas y golpes fuertes',
        'Supervisar el uso en niños pequeños',
      ],
      usage: [
        'Para jugar, aprender y crear en familia',
        'Ideal para músicos y coleccionistas',
        'Acompaña talleres y encuentros creativos',
      ],
    },
  },
  {
    keywords: ['cuidado personal'],
    set: {
      care: [
        'Mantener en lugar fresco y seco',
        'Cerrar bien el empaque después de usar',
        'Usar antes del tiempo sugerido',
        'Evitar exposición directa al sol',
        'Suspender el uso si hay irritación',
      ],
      usage: [
        'Para tu rutina de autocuidado diario',
        'Ideal para un ritual de spa en casa',
        'Un detalle natural para regalar bienestar',
      ],
    },
  },
];

/** Ajustes según el tipo de pieza (paso 2); se anteponen a los de categoría */
const PURPOSE_EXTRAS: Record<PiecePurpose, SuggestionSet> = {
  funcional: {
    care: [],
    usage: ['Diseñada para el uso cotidiano'],
  },
  decorativa: {
    care: ['Evitar colocarle peso u objetos encima'],
    usage: ['Pensada para exhibir, no para uso intensivo'],
  },
  ritual: {
    care: ['Guardar en un lugar especial cuando no esté en uso'],
    usage: ['Acompaña ceremonias y momentos simbólicos'],
  },
  coleccionable: {
    care: ['Conservar con su empaque o certificado original'],
    usage: ['Pieza única para colección y exhibición'],
  },
};

const GENERIC: SuggestionSet = {
  care: [
    'Limpiar con paño suave y seco',
    'Evitar sol directo y humedad',
    'Guardar en lugar seco y ventilado',
    'Manipular con cuidado',
  ],
  usage: ['Ideal para el uso diario', 'Un regalo artesanal con historia'],
};

const MAX_SUGGESTIONS = 6;

const findCategorySet = (categoryName?: string): SuggestionSet => {
  if (!categoryName) return GENERIC;
  const lower = categoryName.toLowerCase();
  const match = BY_CATEGORY.find((entry) =>
    entry.keywords.some((kw) => lower.includes(kw)),
  );
  return match?.set ?? GENERIC;
};

const buildSuggestions = (
  kind: keyof SuggestionSet,
  categoryName?: string,
  purpose?: PiecePurpose,
): string[] => {
  const extras = purpose ? PURPOSE_EXTRAS[purpose]?.[kind] ?? [] : [];
  const base = findCategorySet(categoryName)[kind];
  return [...new Set([...extras, ...base])].slice(0, MAX_SUGGESTIONS);
};

export const getCareSuggestions = (
  categoryName?: string,
  purpose?: PiecePurpose,
): string[] => buildSuggestions('care', categoryName, purpose);

export const getUsageSuggestions = (
  categoryName?: string,
  purpose?: PiecePurpose,
): string[] => buildSuggestions('usage', categoryName, purpose);
