import { CmsSection } from '../types/cms-section.types';

/**
 * Secciones editoriales para el ÍNDICE /colecciones.
 *
 * El frontend resuelve cada bloque por `slot` (no por type), así el curador
 * puede reorganizar `position` libremente sin romper layout.
 *
 * Slots usados:
 *   - colecciones_header   → hero (kicker / title / subtitle / CTA)
 *   - colecciones_intro    → bloque editorial entre hero y grid de colecciones
 *   - colecciones_quote    → cita destacada antes de "El Archivo del Saber"
 *   - colecciones_footer   → CTA final (continúa el viaje)
 */
export const coleccionesSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
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
  {
    pageKey: 'colecciones',
    position: 2,
    type: 'quote',
    published: true,
    payload: {
      slot: 'colecciones_quote',
      body: 'No solo se teje con hilo, se teje con paciencia; no solo se cultiva la tierra, se cultiva la memoria.',
      attribution: 'Manifiesto TELAR',
    },
  },
  {
    pageKey: 'colecciones',
    position: 3,
    type: 'home_block',
    published: true,
    payload: {
      slot: 'colecciones_footer',
      kicker: 'Continúa el viaje',
      title: 'Cada colección es una invitación',
      body: 'Detrás de cada selección hay un territorio, una técnica y un oficio. Síguenos en este recorrido por las geografías del saber hacer colombiano.',
      ctaLabel: 'Ver historias',
      ctaHref: '/historias',
      variant: 'dark',
      imageUrl: '',
    },
  },
];
