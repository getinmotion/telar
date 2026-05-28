import { CmsSection } from '../types/cms-section.types';

/**
 * Initial editorial content for /historias.
 *
 * Las historias en sí (blog posts) son datos del módulo blog-posts. Aquí
 * solo guardamos la copia editorial que enmarca el archivo: hero, navegador
 * por relato, cápsula de cita, headers de sección y CTA final.
 */
export const historiasSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  // 0 — Hero
  {
    pageKey: 'historias',
    position: 0,
    type: 'historias_hero',
    published: true,
    payload: {
      kicker: 'El Telar Digital',
      title: 'Historias hechas a mano',
      body: 'Detrás de cada pieza hay una historia humana. Crónicas de origen, saberes ancestrales y los rostros que dan vida a la artesanía colombiana.',
      ctaLabel: 'Explorar historias',
      ctaHref: '#featured',
    },
  },
  // 10 — Explorar por relato (4 cards)
  {
    pageKey: 'historias',
    position: 10,
    type: 'historias_story_types_grid',
    published: true,
    payload: {
      kicker: 'Navegar el archivo',
      title: 'Explorar por relato',
      cards: [
        { title: 'Artesanos',   subtitle: 'Vida y Oficio',           href: '/tiendas'     },
        { title: 'Territorios', subtitle: 'Contexto Cultural',       href: '/territorios' },
        { title: 'Técnicas',    subtitle: 'Proceso y Conocimiento',  href: '/tecnicas'    },
        { title: 'Piezas',      subtitle: 'Origen de Objetos',       href: '/productos'   },
      ],
    },
  },
  // 20 — Section header: Del Relato al Objeto
  {
    pageKey: 'historias',
    position: 20,
    type: 'home_section_header',
    published: true,
    payload: {
      slot: 'historias_products',
      kicker: 'Del Relato al Objeto',
      title: 'Piezas que nacen de esta historia',
      italicTitle: true,
    },
  },
  // 30 — Cultural capsule quote
  {
    pageKey: 'historias',
    position: 30,
    type: 'historias_capsule_quote',
    published: true,
    payload: {
      body: '"El oficio artesanal no es nostalgia: es memoria viva que se reinventa con cada puntada, cada quema, cada trenzado."',
    },
  },
  // 40 — Section header: Relatos por descubrir
  {
    pageKey: 'historias',
    position: 40,
    type: 'home_section_header',
    published: true,
    payload: {
      slot: 'historias_discover',
      kicker: 'Seguir leyendo',
      title: 'Relatos por descubrir',
      italicTitle: true,
    },
  },
  // 50 — Final CTA dark
  {
    pageKey: 'historias',
    position: 50,
    type: 'historias_final_cta',
    published: true,
    payload: {
      kicker: 'Continúa el viaje',
      titleLineTop: 'Cada pieza tiene una historia.',
      titleLineBottom: 'Cada historia, un territorio.',
      ctas: [
        { label: 'Explorar piezas',  href: '/productos',   variant: 'primary' },
        { label: 'Ver territorios',  href: '/territorios', variant: 'outline' },
        { label: 'Conocer talleres', href: '/tiendas',     variant: 'outline' },
      ],
    },
  },
];
