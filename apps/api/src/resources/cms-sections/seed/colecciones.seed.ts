import { CmsSection } from '../types/cms-section.types';

/**
 * Secciones editoriales para el ÍNDICE /colecciones (no las páginas
 * individuales — esas viven en `collections` collection).
 *
 * Reusa los types existentes home_section_header y home_block. El front
 * busca por type para renderizar arriba/abajo del grid de cards.
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
      kicker: 'El Archivo TELAR',
      title: 'Colecciones',
      subtitle:
        'Selecciones editoriales que reúnen piezas, oficios y territorios bajo una misma narrativa curatorial.',
      ctaLabel: '',
      ctaHref: '',
    },
  },
  {
    pageKey: 'colecciones',
    position: 1,
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
