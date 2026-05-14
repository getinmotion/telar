import { CmsSection } from '../types/cms-section.types';

/**
 * Initial editorial content for /tecnicas. Mirrors the hardcoded copy
 * that lived in marketplace-web/src/pages/Tecnicas.tsx so that turning
 * on the CMS does not blank the page on day one.
 *
 * Slot-specific types (rendered in dedicated layout positions, NOT in
 * the editorial flow) — kept early in the position order to read like a
 * timeline of the page top-to-bottom:
 *  - hero                  → top of page
 *  - featured_aside_card   → right column of the featured section
 *  - metrics_stat          → orange data box inside the asymmetric archive
 *  - muestra_intro         → header for the "Muestra de Técnicas" API grid
 *  - archive_label         → centered "Exploración del Archivo" label
 *  - editorial_footer      → bottom editorial footer ("Legado Viviente")
 *
 * Editorial flow types (rendered between the featured section and the
 * archive via `editorialSections.map(...)`):
 *  - quote
 *  - two_column_intro
 *  - technique_grid
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
    type: 'featured_aside_card',
    published: true,
    payload: {
      title: 'Archivo Digital de Patrones',
      body: 'Acceda a nuestra base de datos de iconografía y patrones técnicos digitalizados para investigación.',
      ctaLabel: 'Ver Catálogo',
      ctaHref: '',
    },
  },
  {
    pageKey: 'tecnicas',
    position: 2,
    type: 'metrics_stat',
    published: true,
    payload: {
      kicker: 'Métricas 2024',
      value: '24',
      caption: 'Nuevos talleres registrados en el último trimestre.',
    },
  },
  {
    pageKey: 'tecnicas',
    position: 3,
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
    position: 4,
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
    position: 5,
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
  {
    pageKey: 'tecnicas',
    position: 6,
    type: 'muestra_intro',
    published: true,
    payload: {
      kicker: 'Muestra de Técnicas',
      title: 'Técnicas con piezas disponibles ahora.',
      body: 'Solo aparecen técnicas que tienen al menos un producto publicado en Telar. Cada tarjeta abre el detalle de la técnica.',
    },
  },
  {
    pageKey: 'tecnicas',
    position: 7,
    type: 'archive_label',
    published: true,
    payload: {
      kicker: 'Exploración del Archivo',
    },
  },
  {
    pageKey: 'tecnicas',
    position: 8,
    type: 'editorial_footer',
    published: true,
    payload: {
      kicker: 'Legado Viviente',
      title: 'El archivo del saber hacer es una conversación inacabada.',
      body: 'Buscamos no solo preservar, sino activar. Cada técnica documentada aquí es una invitación a la colaboración entre el artesano y el innovador.',
      links: [
        { label: 'Talleres', href: '/tiendas' },
        { label: 'Piezas', href: '/productos' },
        { label: 'Historias', href: '/historias' },
      ],
      asideTitle: 'Colabora',
      asideBody: '¿Conoces una técnica que aún no hemos documentado? Ayúdanos a expandir el archivo maestro.',
      asideCtaLabel: 'Postular Técnica',
      copyright: 'TELAR © 2025 · Colombia',
      edition: 'Edición 01: El gesto primordial',
    },
  },
];
