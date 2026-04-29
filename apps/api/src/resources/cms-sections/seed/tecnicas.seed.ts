import { CmsSection } from '../types/cms-section.types';

/**
 * Initial editorial content for /tecnicas. Mirrors the hardcoded copy
 * that lived in marketplace-web/src/pages/Tecnicas.tsx so that turning
 * on the CMS does not blank the page on day one.
 */
export const tecnicasSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  {
    pageKey: 'tecnicas',
    position: 0,
    type: 'hero',
    published: true,
    payload: {
      kicker: 'Archivo Maestro de Técnicas',
      title: 'El lenguaje silencioso de las manos.',
      body: 'Una cartografía viva del saber hacer colombiano. Documentamos el gesto, la materia y el territorio como pilares de nuestra identidad cultural, conectando la herencia ancestral con el diseño del mañana.',
      totalCountLabel: 'Técnicas Documentadas',
    },
  },
  {
    pageKey: 'tecnicas',
    position: 1,
    type: 'quote',
    published: true,
    payload: {
      kicker: 'Filosofía del Oficio',
      body: 'Cada gesto es una forma de resistencia cultural, una huella que el tiempo no ha podido borrar.',
      attribution: '— Manifiesto del Saber Hacer, 2024',
    },
  },
  {
    pageKey: 'tecnicas',
    position: 2,
    type: 'two_column_intro',
    published: true,
    payload: {
      kicker: 'La Madera en Colombia',
      title: 'El alma de la biodiversidad transformada.',
      body: 'De la selva chocoana al bosque andino, la madera colombiana sostiene una cartografía de oficios que convierten veta, dureza y aroma en arquitectura, mobiliario y escultura. Cada pieza parte de una ciencia silenciosa: la selección del árbol correcto para lo que la mano quiere decir.',
      columns: [
        {
          kicker: 'Maderas nobles / duras',
          title: 'Para durar siglos.',
          body: 'Chonta, nazareno, granadillo, guayacán. Densas y resistentes, son la materia de máscaras ceremoniales, mobiliario de autor y tallados que retan al tiempo.',
        },
        {
          kicker: 'Maderas ligeras / versátiles',
          title: 'Para que la luz pase.',
          body: 'Balso, cedro, sauce, pino colombiano. Fáciles de calar, labrar y pirograbar, permiten la filigrana de la madera y las piezas decorativas que habitan la casa sin pesarle.',
        },
      ],
    },
  },
  {
    pageKey: 'tecnicas',
    position: 3,
    type: 'technique_grid',
    published: true,
    payload: {
      kicker: 'Técnicas que inmortalizan la tradición',
      title: 'Cuatro gramáticas para un mismo material.',
      cards: [
        {
          title: 'Ebanistería de Autor',
          body: 'El mobiliario como firma. Ensambles sin clavos, acabados aceitados y una relación íntima con la veta: cada mueble es un objeto que guarda la biografía del taller.',
          slug: null,
          imageKey: 'Talla',
        },
        {
          title: 'Talla y Labrado Artístico',
          body: 'Gubias y formones dan forma a la cosmogonía afrocolombiana e indígena. Tallar es descubrir la figura que ya vivía dentro del tronco.',
          slug: 'tallado',
          imageKey: 'Tallado',
        },
        {
          title: 'Taracea y Calado',
          body: 'La taracea compone marquetería con maderas de contraste; el calado perfora la madera para que la luz la atraviese. Dos maneras de convertir el detalle en protagonista.',
          slug: 'calado',
          imageKey: 'Calado',
        },
        {
          title: 'Torneado y Pirograbado',
          body: 'El torno esculpe simetría; el pirograbado firma la superficie con fuego. Dos técnicas que llevan la madera del utensilio cotidiano al objeto de culto.',
          slug: null,
          imageKey: 'Talla',
        },
      ],
    },
  },
];
