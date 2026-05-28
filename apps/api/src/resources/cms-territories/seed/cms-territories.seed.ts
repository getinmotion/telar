/**
 * Seed inicial para `cms-territories` (colección Mongo `territories`).
 * Refleja los 7 territorios que vivían hardcoded en:
 *  - marketplace-web/src/pages/Territorios.tsx (array TERRITORIES)
 *  - marketplace-web/src/pages/Territory.tsx   (TERRITORY_DATA)
 *
 * Idempotente: el seed runner hace match por `slug`.
 */
import { TerritoryDoc } from '../schemas/cms-territory.schema';

export type SeedTerritory = Omit<
  TerritoryDoc,
  'createdAt' | 'updatedAt' | 'publishedAt'
> & { publishedAt?: string | null };

export const cmsTerritoriesSeed: SeedTerritory[] = [
  {
    slug: 'la-guajira',
    name: 'La Guajira',
    department: 'La Guajira',
    region: 'Caribe',
    subtitle: 'Tejeduría Wayúu · Desierto y Mar',
    description:
      'El desierto más septentrional de Sudamérica, donde la comunidad Wayúu transforma hilos en mochilas que cuentan historias ancestrales.',
    longDescription:
      'La Guajira alberga una de las tradiciones textiles más reconocidas internacionalmente. La mochila Wayúu es un símbolo de identidad cultural que ha trascendido fronteras.',
    culturalTitle: 'El lenguaje del Kanás',
    culturalQuote:
      'Cada mochila Wayúu tarda entre 20 y 30 días en tejerse. Los patrones, llamados Kanás, representan elementos de la naturaleza y la cosmovisión del pueblo Wayúu.',
    ctaHeadline: 'Descubra la maestría de La Guajira',
    lat: 11.55,
    lng: -72.9,
    color: '#ec6d13',
    markerSize: 16,
    techniques: 'Tejeduría Wayúu',
    featuredProductId: null,
    extraSections: [],
    status: 'published',
    publishedAt: null,
    keywords: ['guajira', 'wayuu', 'mochila', 'kanas'],
    position: 0,
  },
  {
    slug: 'san-jacinto',
    name: 'San Jacinto, Bolívar',
    department: 'Bolivar',
    region: 'Caribe',
    subtitle: 'Donde la hamaca se teje con notas de gaita',
    description:
      'En las sabanas del norte de Bolívar, a menos de tres horas de Cartagena, se encuentra San Jacinto, un territorio donde el tiempo no se mide en horas, sino en las pasadas del hilo por el telar. Considerado la "Cuna de la Hamaca", este municipio es un paraíso donde la herencia textil del antiguo Reino Finzenú —cultura Zenú— sigue viva en cada hogar.',
    longDescription:
      'La hamaca es el alma de San Jacinto. Durante generaciones, las mujeres —madres, abuelas e hijas— han custodiado el telar vertical. En los patios de sus casas, entre risas y saberes compartidos, realizan procesos ancestrales como el devanado y el trenzado. Para ellas, tejer no es solo un oficio; es un legado familiar que las convierte en las guardianas de la identidad del Caribe.',
    culturalTitle: 'Mucho más que un lugar para descansar',
    culturalQuote:
      'Para la cultura Zenú, la hamaca tenía un significado sagrado: era la pieza central en los ritos fúnebres y el símbolo de compromiso que un novio entregaba a su novia. Hoy, esa mística se transforma en piezas de diseño contemporáneo: mochilas, cojines y centros de mesa que llevan consigo siglos de historia y leyendas.',
    ctaHeadline: 'Descubra la tierra de la hamaca grande',
    lat: 9.83,
    lng: -75.12,
    color: '#ec6d13',
    markerSize: 22,
    techniques: 'Telar vertical, Macramé',
    featuredProductId: 'b5e6e8c6-5d50-404d-b295-38a7346d7333',
    extraSections: [
      {
        eyebrow: 'Sinfonía textil',
        title: 'Gaitas y cumbia',
        body: 'San Jacinto no solo se mira, se escucha. Es la tierra de los legendarios Gaiteros de San Jacinto, donde el ritmo de la gaita y la cumbia marca el compás de las tejedoras. Un territorio donde la música y la artesanía son una sola voz; como dice la canción, es "la tierra de la hamaca grande", donde el folclor se siente en cada fibra de algodón.',
      },
    ],
    status: 'published',
    publishedAt: null,
    keywords: ['san jacinto', 'hamaca', 'bolivar', 'zenu', 'finzenu'],
    position: 1,
  },
  {
    slug: 'boyaca',
    name: 'Boyacá',
    department: 'Boyaca',
    region: 'Andina',
    subtitle: 'Tradición Textil · Altiplano',
    description:
      'Tierra de lanas y tejidos en el corazón del altiplano cundiboyacense, donde la tradición del hilado manual se transmite de generación en generación.',
    longDescription:
      'Boyacá es reconocido por su tradición textil centenaria, especialmente en municipios como Nobsa e Iza, donde las ruanas y cobijas cuentan la historia del altiplano.',
    culturalTitle: 'La ruana y el páramo',
    culturalQuote:
      'La ruana boyacense no es solo una prenda, es un abrazo de lana virgen que protege del frío del páramo y conecta al artesano con siglos de tradición pastoril.',
    ctaHeadline: 'Descubra la maestría de Boyacá',
    lat: 5.53,
    lng: -73.36,
    color: '#ec6d13',
    markerSize: 18,
    techniques: 'Hilado manual, Ruanas',
    featuredProductId: null,
    extraSections: [],
    status: 'published',
    publishedAt: null,
    keywords: ['boyaca', 'ruana', 'altiplano', 'lana'],
    position: 2,
  },
  {
    slug: 'narino',
    name: 'Nariño',
    department: 'Narino',
    region: 'Pacífico',
    subtitle: 'Barniz de Pasto · Andes Volcánicos',
    description:
      'En las laderas del sur de Colombia, los artesanos de Nariño dominan técnicas únicas como el barniz de Pasto y el trabajo en paja toquilla.',
    longDescription:
      'Nariño es un territorio de contrastes donde conviven técnicas precolombinas con innovación artesanal. El barniz de Pasto, patrimonio inmaterial, sigue vivo en talleres familiares.',
    culturalTitle: 'Mopa-Mopa: resina y paciencia',
    culturalQuote:
      'El barniz de Pasto, o Mopa-Mopa, es una resina vegetal que los artesanos mastican, estiran y aplican en capas microscópicas sobre la madera. Un arte que solo existe aquí.',
    ctaHeadline: 'Descubra la maestría de Nariño',
    lat: 1.28,
    lng: -77.35,
    color: '#0098f2',
    markerSize: 18,
    techniques: 'Barniz de Pasto, Paja Toquilla',
    featuredProductId: null,
    extraSections: [],
    status: 'published',
    publishedAt: null,
    keywords: ['narino', 'pasto', 'mopa-mopa', 'barniz'],
    position: 3,
  },
  {
    slug: 'la-chamba',
    name: 'La Chamba, Tolima',
    department: 'Tolima',
    region: 'Andina',
    subtitle: 'Barro Negro · Río Magdalena',
    description:
      'En las riberas del Magdalena, las manos de La Chamba moldean el barro negro en piezas de cocina y arte que brillan sin esmalte.',
    longDescription:
      'La Chamba es reconocida mundialmente por su cerámica de barro negro. Las piezas se pulen con piedras de río y se cocinan en hornos abiertos, dándoles su brillo característico.',
    culturalTitle: 'Alquimia del barro negro',
    culturalQuote:
      'Las ollas de La Chamba no llevan esmalte ni pintura. El brillo negro viene del bruñido con piedra de río y la cocción a fuego abierto con hojarasca. Pura alquimia de tierra.',
    ctaHeadline: 'Descubra la maestría de La Chamba',
    lat: 3.68,
    lng: -75.02,
    color: '#584237',
    markerSize: 14,
    techniques: 'Cerámica de barro negro',
    featuredProductId: null,
    extraSections: [],
    status: 'published',
    publishedAt: null,
    keywords: ['la chamba', 'tolima', 'barro negro', 'ceramica'],
    position: 4,
  },
  {
    slug: 'putumayo',
    name: 'Putumayo',
    department: 'Putumayo',
    region: 'Amazonía',
    subtitle: 'Cestería y Semillas · Selva Amazónica',
    description:
      'En la espesura amazónica, las comunidades indígenas del Putumayo transforman fibras y semillas en cestería y ornamentos rituales.',
    longDescription:
      'El Putumayo alberga tradiciones artesanales profundamente conectadas con la selva. La cestería en fibra de chambira y los collares de semillas son expresiones de una cosmovisión viva.',
    culturalTitle: 'La voz de las semillas',
    culturalQuote:
      'Cada semilla elegida para un collar del Putumayo tiene un nombre, un origen y un propósito. Los artesanos no recolectan al azar: escuchan a la selva antes de tomar.',
    ctaHeadline: 'Descubra la maestría del Putumayo',
    lat: 0.77,
    lng: -76.64,
    color: '#0098f2',
    markerSize: 14,
    techniques: 'Cestería, Semillas',
    featuredProductId: null,
    extraSections: [],
    status: 'published',
    publishedAt: null,
    keywords: ['putumayo', 'amazonia', 'cesteria', 'chambira'],
    position: 5,
  },
  {
    slug: 'cauca',
    name: 'Cauca',
    department: 'Cauca',
    region: 'Pacífico',
    subtitle: 'Seda y Tintes de Paz · Popayán · Timbío · El Tambo',
    description:
      'En las montañas del Cauca, Colteseda y Agroarte tejen una revolución silenciosa: mujeres cabeza de familia transforman la morera en seda y la hoja de coca en tintes naturales, convirtiendo cada telar en un refugio de paz.',
    longDescription:
      'Entre Popayán, Timbío y El Tambo, el cultivo de la morera y la sericultura han sustituido economías de la guerra por una economía legal, digna y circular. Las maestras tejedoras de Agroarte integran a los jóvenes en el proceso, asegurando relevo generacional y convirtiendo cada pieza en un manifiesto de reconciliación.',
    culturalTitle: 'De la coca al color: alquimia de paz',
    culturalQuote:
      'La hoja que fue combustible de guerra se sumerge hoy en las tinas de teñido para dar vida a verdes profundos y amarillos solares. La coca vuelve a su origen artesanal como pigmento de esperanza.',
    ctaHeadline: 'Descubra la seda del Cauca',
    lat: 2.44,
    lng: -76.61,
    color: '#ec6d13',
    markerSize: 20,
    techniques: 'Sericultura, Tintes Naturales, Telar',
    featuredProductId: '963a11d1-98a2-480e-993c-c722b1f248de',
    extraSections: [],
    status: 'published',
    publishedAt: null,
    keywords: ['cauca', 'seda', 'colteseda', 'agroarte', 'popayan'],
    position: 6,
  },
];
