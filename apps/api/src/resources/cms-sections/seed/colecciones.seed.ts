import { CmsSection } from '../types/cms-section.types';

/**
 * Secciones editoriales para el ÍNDICE /colecciones.
 *
 * La página ahora se renderiza 100 % via <PageRenderer pageKey="colecciones" />
 * — el orden visual lo controla el curador desde el admin con flechas ↑↓.
 *
 * Slots usados (para identificar bloques específicos por código si hace falta):
 *   - colecciones_header        → hero
 *   - colecciones_intro         → bloque editorial entre hero y grid
 *   - colecciones_content_picks → widget embebido (banners hacia blog/colecciones)
 *   - colecciones_cms_grid      → widget embebido (grid de Mongo collections)
 *   - colecciones_quote         → cita destacada
 *   - colecciones_archive_nav   → header del Archivo del Saber
 *   - colecciones_archive_cols  → widget embebido (3 cols dinámicas)
 *   - colecciones_seasonal      → grid de Selecciones de Temporada (4 cards)
 *   - colecciones_footer        → CTA dark final
 */
export const coleccionesSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  // 0 — Hero
  {
    pageKey: 'colecciones',
    position: 0,
    type: 'home_section_header',
    published: true,
    payload: {
      slot: 'colecciones_header',
      kicker: 'Curaduría / Colecciones',
      title: 'Mundos tejidos, historias que habitan',
      subtitle:
        'Descubre selecciones curadas que exploran la materialidad y el alma de la artesanía colombiana.',
      ctaLabel: 'Explorar todas las piezas',
      ctaHref: '/productos',
      imageUrl:
        'https://telar-prod-bucket.s3.us-east-1.amazonaws.com/vajilla_n/VAJILLA%20NEGRA%20-%201.jpg',
      imageAlt: 'Colecciones — La Chamba',
    },
  },

  // 1 — Bloque editorial
  {
    pageKey: 'colecciones',
    position: 1,
    type: 'home_block',
    published: true,
    payload: {
      slot: 'colecciones_intro',
      kicker: 'El archivo TELAR',
      title: 'Selecciones que reúnen oficio, territorio y memoria',
      body: 'Cada colección es un recorte editorial: una mirada que conecta piezas, maestros y geografías bajo una sola narrativa. No son catálogos — son lecturas curadas del saber hacer colombiano.',
      ctaLabel: '',
      ctaHref: '',
      variant: 'light',
      imageUrl: '',
    },
  },

  // 2 — Content picks (widget)
  {
    pageKey: 'colecciones',
    position: 2,
    type: 'embedded_widget',
    published: true,
    payload: {
      slot: 'colecciones_content_picks',
      widget: 'content_picks',
      pageKey: 'colecciones',
    },
  },

  // 3 — Grid de colecciones Mongo (widget)
  {
    pageKey: 'colecciones',
    position: 3,
    type: 'embedded_widget',
    published: true,
    payload: {
      slot: 'colecciones_cms_grid',
      widget: 'cms_collections_grid',
      kicker: 'Colecciones curadas',
    },
  },

  // 4 — Cita destacada
  {
    pageKey: 'colecciones',
    position: 4,
    type: 'quote',
    published: true,
    payload: {
      slot: 'colecciones_quote',
      body: 'No solo se teje con hilo, se teje con paciencia; no solo se cultiva la tierra, se cultiva la memoria.',
      attribution: 'Manifiesto TELAR',
    },
  },

  // 5 — Header del Archivo del Saber
  {
    pageKey: 'colecciones',
    position: 5,
    type: 'colecciones_archive_nav_header',
    published: true,
    payload: {
      slot: 'colecciones_archive_nav',
      kicker: 'El Archivo del Saber',
      title: 'Navegar por la esencia',
    },
  },

  // 6 — 3 columnas dinámicas (widget)
  {
    pageKey: 'colecciones',
    position: 6,
    type: 'embedded_widget',
    published: true,
    payload: {
      slot: 'colecciones_archive_cols',
      widget: 'colecciones_archive_columns',
      col1Label: 'Por Colección',
      col2Label: 'Por Territorio',
      col3Label: 'Por Técnica',
      col2CtaLabel: 'Explorar el mapa',
      col2CtaHref: '/territorios',
    },
  },

  // 7 — Grid de Selecciones de Temporada
  {
    pageKey: 'colecciones',
    position: 7,
    type: 'colecciones_seasonal_grid',
    published: true,
    payload: {
      slot: 'colecciones_seasonal',
      kicker: 'Actualidad',
      title: 'Selecciones de temporada',
      cards: [
        {
          title: 'Palmas del Atlántico',
          description: 'Tejeduría en iraca para la mesa contemporánea.',
          cta: 'Adquirir piezas',
          href: '/productos',
          imageUrl: '',
          imageAlt: 'Palmas del Atlántico',
        },
        {
          title: 'Luz de Mompox',
          description: 'Plata transformada en encaje eterno.',
          cta: 'Ver selección',
          href: '/productos',
          imageUrl: '',
          imageAlt: 'Luz de Mompox',
        },
        {
          title: 'Urdimbres del Sur',
          description: 'Lanas de oveja teñidas naturalmente.',
          cta: 'Explorar piezas',
          href: '/productos',
          imageUrl: '',
          imageAlt: 'Urdimbres del Sur',
        },
        {
          title: 'Alquimia de Barro',
          description: 'Formas ancestrales que abrazan el fuego.',
          cta: 'Adquirir ahora',
          href: '/productos',
          imageUrl: '',
          imageAlt: 'Alquimia de Barro',
        },
      ],
    },
  },

  // 8 — CTA final dark
  {
    pageKey: 'colecciones',
    position: 8,
    type: 'home_block',
    published: true,
    payload: {
      slot: 'colecciones_footer',
      kicker: 'El viaje continúa',
      title: 'El saber hacer es un viaje que apenas comienza',
      body: 'Detrás de cada selección hay un territorio, una técnica y un oficio. Síguenos en este recorrido por las geografías del saber hacer colombiano.',
      ctaLabel: 'Descubrir historias',
      ctaHref: '/historias',
      variant: 'dark',
      imageUrl: '',
    },
  },
];
