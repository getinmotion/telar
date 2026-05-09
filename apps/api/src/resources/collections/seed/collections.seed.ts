/**
 * Seed inicial de colecciones editoriales.
 *
 * Mantén en sync (cuando se actualiza una) con
 * apps/marketplace-web/src/datafallback/fallbackCollections.ts — son los
 * mismos datos que usa el front cuando la API está vacía / caída.
 */

const CHAMBA_S3_BASE =
  'https://telar-prod-bucket.s3.us-east-1.amazonaws.com/vajilla_n';
const CHAMBA_GALLERY_NUMBERS = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15];
const CHAMBA_GALLERY = CHAMBA_GALLERY_NUMBERS.map((i) => ({
  url: `${CHAMBA_S3_BASE}/VAJILLA%20NEGRA%20-%20${i}.jpg`,
  alt: `Vajilla La Chamba ${i}`,
}));

interface CollectionSeedEntry {
  title: string;
  slug: string;
  excerpt: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  region: string | null;
  layoutVariant: 'wide' | 'dark' | 'centered';
  blocks: Array<{ type: string; payload: any }>;
  status: 'published';
  publishedAt: string;
  keywords: string[];
}

export const collectionsSeed: CollectionSeedEntry[] = [
  // ── 1) Día de la Madre (Telar.co campaign) ──────────────────────
  {
    title: 'Día de la Madre',
    slug: 'dia-de-la-madre',
    excerpt:
      'Celebramos a las que tejen vida — una selección de Artesanías de Origen para regalar con alma y territorio.',
    heroImageUrl: null,
    heroImageAlt: null,
    region: 'Colombia',
    layoutVariant: 'centered',
    blocks: [
      {
        type: 'text',
        payload: {
          kicker: 'Telar.co',
          title: 'A las que tejen vida',
          body: '¡Hola!\n\nEn este Día de la Madre, en Telar.co celebramos a las que tejen vida.\n\nQueremos invitarte a conocer nuestra selección de Artesanías de Origen, piezas creadas bajo la cultura del cuidado y la libertad de procesos violentos. Regala algo que no solo brille, sino que tenga alma y territorio.',
        },
      },
      {
        type: 'manifest',
        payload: {
          kicker: 'Manifiesto',
          sections: [
            {
              title: 'A las maestras del telar',
              body: 'Las que transmiten el saber del telar.',
            },
            {
              title: 'A las que cuidan las semillas',
              body: 'Las que cuidan los procesos lentos.',
            },
            {
              title: 'A las que hacen crecer la paz',
              body: 'Las que, con sus manos, hacen crecer la paz en sus territorios.',
            },
          ],
        },
      },
      {
        type: 'product_grid',
        payload: {
          kicker: 'Selección curada',
          title: 'Tesoros para ella',
          columns: 3,
          productIds: [
            '79f30306-5e51-40b1-a2eb-c7449400b5b0',
            '29b0cca3-8075-48e1-a362-893d58e53af9',
            '04ec8899-4a14-484a-8b1b-569564cb0034',
            '654536f4-c57a-4f5b-a75c-2b1ce980c8a9',
            '963a11d1-98a2-480e-993c-c722b1f248de',
            'd9771ef8-9951-4974-87fb-26b9def601c2',
            'd78a4435-8b6d-4436-a0d4-927515c81d3a',
            '3d98343b-b7e7-4ed5-aa3e-0f321c92412c',
            '798f3b41-8569-4eda-a010-91147c8c4136',
          ],
        },
      },
      {
        type: 'quote',
        payload: {
          body: 'En Telar.co creemos que la labor de una madre es la forma más pura de artesanía. No solo se teje con hilo, se teje con paciencia; no solo se cultiva la tierra, se cultiva la memoria.',
        },
      },
    ],
    status: 'published',
    publishedAt: '2026-05-01T00:00:00.000Z',
    keywords: ['dia de la madre', 'regalo', 'mama', 'cuidado', 'artesania'],
  },

  // ── 2) Cerámica de La Chamba ─────────────────────────────────────
  {
    title: 'El Legado del Barro Negro',
    slug: 'ceramica-de-la-chamba',
    excerpt:
      'La Chamba, Tolima: más de 300 años de tradición alfarera a orillas del Magdalena. Herencia Pijao, liderazgo femenino y Denominación de Origen reconocida mundialmente.',
    heroImageUrl: `${CHAMBA_S3_BASE}/VAJILLA%20NEGRA%20-%201.jpg`,
    heroImageAlt: 'Vajilla negra de La Chamba',
    region: 'Tolima',
    layoutVariant: 'wide',
    blocks: [
      {
        type: 'text',
        payload: {
          kicker: 'Colección Principal',
          title: 'Fuego, agua y memoria',
          body: 'En las orillas del río Magdalena, las maestras alfareras de La Chamba modelan barro negro con técnicas heredadas del pueblo Pijao. Cada pieza pasa por un quemado que la convierte en objeto utilitario y ritual a la vez.',
        },
      },
      {
        type: 'gallery',
        payload: {
          kicker: 'Galería',
          columns: 3,
          images: CHAMBA_GALLERY,
        },
      },
      {
        type: 'product_grid',
        payload: {
          title: 'Piezas disponibles',
          columns: 3,
          productIds: [],
        },
      },
    ],
    status: 'published',
    publishedAt: '2026-04-01T00:00:00.000Z',
    keywords: ['chamba', 'ceramica', 'barro negro', 'tolima', 'pijao'],
  },

  // ── 3) Tejeduría de San Jacinto ──────────────────────────────────
  {
    title: 'Donde la Hamaca se Teje con Notas de Gaita',
    slug: 'tejeduria-de-san-jacinto',
    excerpt:
      'El legado textil de San Jacinto, Bolívar: hamacas grandes tejidas en telar vertical por herederas del Reino Finzenú, al ritmo de gaitas y cumbia.',
    heroImageUrl: null,
    heroImageAlt: null,
    region: 'Bolívar',
    layoutVariant: 'dark',
    blocks: [
      {
        type: 'text',
        payload: {
          kicker: 'Selección Editorial',
          title: 'Hilos del Caribe',
          body: 'En San Jacinto las tejedoras heredan del Reino Finzenú una técnica de telar vertical que produce hamacas y mantas de gran formato. La música acompaña el ritmo del trabajo: cumbia y gaita son tan parte del proceso como las hebras.',
        },
      },
      {
        type: 'product_grid',
        payload: {
          title: 'Piezas disponibles',
          columns: 3,
          productIds: [],
        },
      },
    ],
    status: 'published',
    publishedAt: '2026-04-01T00:00:00.000Z',
    keywords: ['san jacinto', 'hamaca', 'bolivar', 'finzenu', 'tejeduria'],
  },

  // ── 4) Tejeduría Wayúu ───────────────────────────────────────────
  {
    title: 'Ancestría Geométrica',
    slug: 'tejeduria-wayuu',
    excerpt:
      'El mapa de una cultura trazado en hilos. Una gramática de simetría y cosmogonía ancestral donde cada rombo cuenta una historia de territorio.',
    heroImageUrl: null,
    heroImageAlt: null,
    region: 'La Guajira',
    layoutVariant: 'centered',
    blocks: [
      {
        type: 'text',
        payload: {
          kicker: 'Curada por TELAR',
          title: 'Cosmogonía en hilos',
          body: 'Cada kanaas (figura geométrica) en una mochila wayúu es el registro de un sueño, un animal, un astro. Las tejedoras de la alta y media Guajira mantienen viva una iconografía que codifica la cosmovisión de su pueblo.',
        },
      },
      {
        type: 'product_grid',
        payload: {
          title: 'Piezas disponibles',
          columns: 3,
          productIds: [],
        },
      },
    ],
    status: 'published',
    publishedAt: '2026-04-01T00:00:00.000Z',
    keywords: ['wayuu', 'mochila', 'guajira', 'kanaas'],
  },

  // ── 5) Cerámica de Ráquira ───────────────────────────────────────
  {
    title: 'Barros del Altiplano',
    slug: 'ceramica-de-raquira',
    excerpt:
      'La tradición alfarera de Ráquira transformada en objetos que dialogan entre lo ancestral y lo contemporáneo. Acabados terracota que cuentan siglos de historia.',
    heroImageUrl: null,
    heroImageAlt: null,
    region: 'Boyacá',
    layoutVariant: 'wide',
    blocks: [
      {
        type: 'text',
        payload: {
          kicker: 'Selección Editorial',
          title: 'Tierra cocida del Altiplano',
          body: 'Ráquira, en Boyacá, ha sido durante siglos el "pueblo de las ollas". Hoy sus alfareros reinventan la tradición con piezas decorativas y utilitarias que conservan los acabados terracota característicos.',
        },
      },
      {
        type: 'product_grid',
        payload: {
          title: 'Piezas disponibles',
          columns: 3,
          productIds: [],
        },
      },
    ],
    status: 'published',
    publishedAt: '2026-04-01T00:00:00.000Z',
    keywords: ['raquira', 'boyaca', 'ceramica', 'terracota'],
  },

  // ── 6) Sombrero Vueltiao ─────────────────────────────────────────
  {
    title: 'Trenzados del Sinú',
    slug: 'sombrero-vueltiao',
    excerpt:
      'La caña flecha se convierte en arte a través de las manos del pueblo Zenú. Geometría precisa que codifica cosmovisiones ancestrales en cada trenzado.',
    heroImageUrl: null,
    heroImageAlt: null,
    region: 'Córdoba',
    layoutVariant: 'dark',
    blocks: [
      {
        type: 'text',
        payload: {
          kicker: 'Curada por TELAR',
          title: 'Patrimonio Zenú',
          body: 'El sombrero vueltiao es símbolo cultural de Colombia. Tejido en caña flecha por las comunidades Zenú del valle del Sinú, su geometría precisa codifica la cosmovisión de un pueblo que lleva siglos trenzando memoria.',
        },
      },
      {
        type: 'product_grid',
        payload: {
          title: 'Piezas disponibles',
          columns: 3,
          productIds: [],
        },
      },
    ],
    status: 'published',
    publishedAt: '2026-04-01T00:00:00.000Z',
    keywords: ['sombrero vueltiao', 'zenu', 'cana flecha', 'cordoba', 'sinu'],
  },

  // ── 7) Mopa-Mopa / Barniz de Pasto ───────────────────────────────
  {
    title: 'Resinas de la Selva',
    slug: 'mopa-mopa-barniz-de-pasto',
    excerpt:
      'Una técnica prehispánica que transforma resinas selváticas en láminas de color. El barniz de Pasto es alquimia pura entre naturaleza y mano humana.',
    heroImageUrl: null,
    heroImageAlt: null,
    region: 'Nariño',
    layoutVariant: 'centered',
    blocks: [
      {
        type: 'text',
        payload: {
          kicker: 'Patrimonio UNESCO',
          title: 'Mopa-Mopa: alquimia vegetal',
          body: 'En Pasto, una resina recolectada del árbol Mopa-Mopa se mastica y estira en láminas microscópicas que se aplican a fuego sobre madera. Es una técnica única en el mundo, declarada Patrimonio Cultural Inmaterial por UNESCO.',
        },
      },
      {
        type: 'product_grid',
        payload: {
          title: 'Piezas disponibles',
          columns: 3,
          productIds: [],
        },
      },
    ],
    status: 'published',
    publishedAt: '2026-04-01T00:00:00.000Z',
    keywords: ['mopa-mopa', 'barniz de pasto', 'narino', 'unesco'],
  },
];
