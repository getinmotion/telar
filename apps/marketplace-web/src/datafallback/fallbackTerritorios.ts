/**
 * Fallback editorial for /territorios — espejo de
 * apps/api/src/resources/cms-sections/seed/territorios.seed.ts.
 */
import type { CmsSection } from '@/services/cms-sections.actions';

const sec = (id: string, position: number, type: string, payload: Record<string, any>): CmsSection => ({
  id, pageKey: 'territorios', position, type, published: true, payload,
  createdAt: '', updatedAt: '',
});

export const FALLBACK_TERRITORIOS_SECTIONS: CmsSection[] = [
  sec('fb-ter-0', 0, 'territorios_hero', {
    kicker: 'Geografía Humana',
    title: 'El mapa de nuestros hilos',
    body: '"El territorio no es un lugar, es un ecosistema de gestos, materiales y memoria. Cada región de Colombia custodia una forma distinta de transformar la materia."',
    stats: [
      { value: '+7',   label: 'Regiones'  },
      { value: '+120', label: 'Talleres'  },
      { value: '+24',  label: 'Técnicas'  },
    ],
  }),
  sec('fb-ter-1', 10, 'embedded_widget', {
    slot: 'territorios_map_block',
    widget: 'territorios_map_block',
    mapCaption: 'Diagrama de Densidad Artesanal / 2025',
    spotlightKicker: 'Foco Regional',
    spotlightCtaLabel: 'Explorar Colección',
    unlocatedLabel: 'Tiendas sin ubicación cartográfica',
  }),
  sec('fb-ter-2', 20, 'territorios_dark_quote', {
    quote: 'La geografía dicta la técnica. Donde hay palma, hay cestería; donde hay volcán, hay barro negro.',
    leftStats: [
      { value: '+120', caption: 'Talleres en el Pacífico',           color: '#ec6d13' },
      { value: '45',   caption: 'Técnicas en riesgo de desaparición', color: '#ba1a1a' },
    ],
    rightTitle: 'El rastro de la fibra',
    rightBody: '"En la humedad del Pacífico, la fibra se curva antes de ceder."',
  }),
  sec('fb-ter-3', 30, 'home_section_header', {
    slot: 'territorios_index',
    kicker: 'Índice Editorial',
    title: 'Territorios de Gracia',
  }),
];
