import { CmsSection } from '../types/cms-section.types';

/**
 * Initial editorial content for /territorios.
 *
 * La página ahora se renderiza 100 % via <PageRenderer pageKey="territorios" />.
 * El bloque interactivo (mapa + spotlight + tiendas + lista índice) vive
 * como `embedded_widget` con `widget: 'territorios_map_block'`.
 */
export const territoriosSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  // 0 — Hero
  {
    pageKey: 'territorios',
    position: 0,
    type: 'territorios_hero',
    published: true,
    payload: {
      kicker: 'Geografía Humana',
      title: 'El mapa de nuestros hilos',
      body: '"El territorio no es un lugar, es un ecosistema de gestos, materiales y memoria. Cada región de Colombia custodia una forma distinta de transformar la materia."',
      stats: [
        { value: '+7',   label: 'Regiones'  },
        { value: '+120', label: 'Talleres'  },
        { value: '+24',  label: 'Técnicas'  },
      ],
    },
  },

  // 10 — Bloque interactivo (mapa + spotlight + tiendas + lista índice)
  {
    pageKey: 'territorios',
    position: 10,
    type: 'embedded_widget',
    published: true,
    payload: {
      slot: 'territorios_map_block',
      widget: 'territorios_map_block',
      mapCaption: 'Diagrama de Densidad Artesanal / 2025',
      spotlightKicker: 'Foco Regional',
      spotlightCtaLabel: 'Explorar Colección',
      unlocatedLabel: 'Tiendas sin ubicación cartográfica',
    },
  },

  // 20 — Dark editorial module
  {
    pageKey: 'territorios',
    position: 20,
    type: 'territorios_dark_quote',
    published: true,
    payload: {
      quote:
        'La geografía dicta la técnica. Donde hay palma, hay cestería; donde hay volcán, hay barro negro.',
      leftStats: [
        { value: '+120', caption: 'Talleres en el Pacífico',           color: '#ec6d13' },
        { value: '45',   caption: 'Técnicas en riesgo de desaparición', color: '#ba1a1a' },
      ],
      rightTitle: 'El rastro de la fibra',
      rightBody:
        '"En la humedad del Pacífico, la fibra se curva antes de ceder. El artesano no domina la materia, la acompaña en su metamorfosis natural."',
    },
  },

  // 30 — Index header (queda al final, sobre la lista índice del widget)
  {
    pageKey: 'territorios',
    position: 30,
    type: 'home_section_header',
    published: true,
    payload: {
      slot: 'territorios_index',
      kicker: 'Índice Editorial',
      title: 'Territorios de Gracia',
      subtitle: '',
    },
  },
];
