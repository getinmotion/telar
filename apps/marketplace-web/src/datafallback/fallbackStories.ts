/**
 * Fallback editorial stories.
 * Used when the Storyblok CMS is empty or unreachable, so /historias
 * and /historia/:slug always have editorial content to display.
 */

import type { BlogArticle, RichTextContent } from "@/types/storyblok";

// ── helpers ────────────────────────────────────────────
const paragraph = (text: string): RichTextContent => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

const heading = (text: string, level = 2): RichTextContent => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});

// ── Cauca: La Seda Teje Caminos de Paz ─────────────────
const caucaSedaContent: RichTextContent = {
  type: "doc",
  content: [
    paragraph(
      "En las montañas del Cauca, un territorio de contrastes profundos que ha resistido décadas de conflicto, está ocurriendo una revolución silenciosa. Allí, donde la violencia y los cultivos ilícitos intentaron imponer una narrativa de sombra, ha surgido una luz tejida a mano. Esta es la historia de Colteseda y Agroarte, dos fuerzas que demuestran que la seda es el hilo conductor de la reconciliación."
    ),

    heading("El Corazón del Proyecto: Mujeres Cabeza de Familia"),
    paragraph(
      "Esta ruta no sería posible sin su motor principal: mujeres valientes, en su mayoría jefas de hogar, que han asumido el liderazgo de sus comunidades. Para ellas, el telar no es solo una herramienta de trabajo, es un espacio de protección y sustento. Al transformar la realidad de sus familias, estas mujeres están sanando el tejido social del Cauca, convirtiendo cada unidad productiva en un refugio de paz y en una empresa de vida que garantiza el bienestar de sus hijos y el futuro de su territorio."
    ),

    heading("De la Raíz a la Fibra: El Milagro de la Morera"),
    paragraph(
      "Todo comienza con el cultivo de la morera. En manos de familias campesinas, esta planta es un símbolo de arraigo. El proceso de sericultura —la cría cuidadosa de los gusanos de seda— requiere una delicadeza que contrasta con la dureza de la historia de la región. Cada capullo hilado por Colteseda representa una transición valiente: la sustitución de la incertidumbre por una economía legal, digna y circular."
    ),

    heading("La Alquimia de la Paz: Coca para Tintes Naturales"),
    paragraph(
      "En un acto de soberanía cultural sin precedentes, las artesanas de Agroarte han liderado una innovación que cautiva al mundo: el uso de la hoja de coca como tinte natural. Lo que antes fue combustible para la guerra, hoy se sumerge en las tinas de teñido para dar vida a verdes profundos y amarillos solares. Esta recuperación de la planta sagrada despoja a la hoja de su estigma y la devuelve a su origen artesanal, transformando un símbolo de dolor en un pigmento de esperanza."
    ),

    heading("Diseño, Resistencia y Relevo Generacional"),
    paragraph(
      "Si Colteseda entrega la pureza de la fibra, Agroarte le otorga el alma. Sus maestras tejedoras crean piezas de culto que narran la resiliencia caucana. Al integrar a los jóvenes en este proceso, aseguran que el conocimiento no muera, sino que evolucione con nuevas herramientas digitales. En Telar.co, potenciamos esta Economía Popular brindando la infraestructura necesaria para que este lujo ético llegue a mercados globales."
    ),

    paragraph(
      "Llevar una pieza de seda del Cauca es portar una historia de transformación. Es apoyar a una mujer jefa de hogar que decidió cambiar el rumbo de su historia y demostrar que, cuando la comunidad se une para tejer, no hay hilo que se rompa ni esperanza que se desvanezca."
    ),
  ],
};

export const CAUCA_SEDA_STORY: BlogArticle = {
  _uid: "fallback-cauca-seda",
  component: "blog_article",
  title: "El Cauca: Donde la Seda Teje Caminos de Paz y Liderazgo Femenino",
  slug: "cauca-seda-paz",
  full_slug: "historias/cauca-seda-paz",
  description:
    "Entre las montañas del Cauca, Colteseda y Agroarte demuestran que la seda, cultivada por mujeres cabeza de familia, es el hilo conductor de la reconciliación.",
  cover: {
    filename:
      "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/images/1766278723378_0_WhatsApp_Image_2025-08-08_at_3.29.32_PM.jpeg.jpeg",
    alt: "Tejedoras de seda del Cauca trabajando en el telar",
  },
  author_name: "Redacción Telar",
  category: "Crónica del Territorio",
  reading_time: 8,
  content: caucaSedaContent,
  first_published_at: "2026-04-14T00:00:00.000Z",
  published_at: "2026-04-14T00:00:00.000Z",
  // Custom fields for keyword matching — not part of Storyblok schema,
  // but safe to carry through because BlogArticle is structurally typed.
  // @ts-expect-error — extension field
  keywords: [
    "seda",
    "cauca",
    "colteseda",
    "agroarte",
    "morera",
    "coca",
    "tinte",
    "telar",
    "tejido",
    "popayan",
    "timbio",
    "el tambo",
  ],
};

// ── Alcides Vides: El Pescador que Tejió su Propio Destino ────
export const ARTESOL_SHOP_SLUG = "artesol-el-cedro";
export const ALCIDES_STORY_SLUG = "alcides-vides-artesol";

const linkParagraph = (
  leading: string,
  linkText: string,
  href: string,
  trailing = ""
): RichTextContent => ({
  type: "paragraph",
  content: [
    { type: "text", text: leading },
    {
      type: "text",
      text: linkText,
      marks: [{ type: "link", attrs: { href, target: "_self" } }],
    },
    { type: "text", text: trailing },
  ],
});

const alcidesContent: RichTextContent = {
  type: "doc",
  content: [
    paragraph(
      "La historia de Alcides Vides es la de muchos hombres en la Colombia rural: una infancia de rebusque en las calles que encontró su redención en el agua y, finalmente, en las manos. Tras años como pescador en la Ciénaga Grande de Ayapel, la escasez del bocachico lo obligó a reinventarse. Hoy, a sus 44 años, Alcides no solo es un maestro artesano; es el líder del Taller Artesol, un faro de esperanza en el corregimiento de El Cedro, Córdoba."
    ),

    heading("La Palma de Seje: De la Flor al Objeto de Diseño"),
    paragraph(
      "El oficio con la palma de seje es una danza con los tiempos de la naturaleza. El proceso, heredado y perfeccionado por Alcides bajo la guía de su esposa, es una muestra de técnica y paciencia:"
    ),
    {
      type: "bullet_list",
      content: [
        {
          type: "list_item",
          content: [
            paragraph(
              "Recolección y Secado: Se corta la flor de la palma y se somete al sol por varios días."
            ),
          ],
        },
        {
          type: "list_item",
          content: [
            paragraph(
              "Maleabilidad: La fibra seca se hierve en agua, transformando su dureza en una ductilidad que permite el tejido manual."
            ),
          ],
        },
        {
          type: "list_item",
          content: [
            paragraph(
              "Creación: De este proceso nacen piezas de gran formato, desde lámparas esculturales hasta jarrones y centros de mesa que capturan la estética de la ciénaga."
            ),
          ],
        },
      ],
    },

    heading("Impacto Social: El Motor de El Cedro"),
    paragraph(
      "Lo que comenzó como un hobby para Alcides se convirtió en el sustento de 700 familias en Ayapel. Tras el declive de la pesca, la artesanía en palma de seje hoy sostiene a una cuarta parte de la población de El Cedro. El Taller Artesol es una cadena de valor completa:"
    ),
    {
      type: "bullet_list",
      content: [
        {
          type: "list_item",
          content: [
            paragraph(
              "Recolectores: Quienes se adentran en el monte por la materia prima."
            ),
          ],
        },
        {
          type: "list_item",
          content: [
            paragraph(
              "Soldadores: Que crean las estructuras metálicas (esqueletos) para lámparas y canastos."
            ),
          ],
        },
        {
          type: "list_item",
          content: [
            paragraph(
              "Tejedores: Hombres y mujeres que plasman la imaginación de la cuenca del San Jorge en cada nudo."
            ),
          ],
        },
      ],
    },

    heading("Relevo Generacional: Un Legado de Orgullo"),
    paragraph(
      "Con ocho hijos, Alcides tiene claro su propósito: ser un ejemplo de tenacidad. Para él, la artesanía es el camino para que los jóvenes no \"agarren el mal camino\", sino que vean en el trabajo manual una forma digna y creativa de habitar su territorio. En Telar, potenciamos este legado brindando la infraestructura digital para que el Taller Artesol conecte su creatividad de ciénaga con el mundo."
    ),

    {
      type: "blockquote",
      content: [
        paragraph(
          "\"Ser un padre artesano es demostrarle a mis hijos lo incansable que somos y lo importante que es crear con las manos.\" — Alcides Vides"
        ),
      ],
    },

    linkParagraph(
      "Conoce todas las piezas del Taller Artesol: ",
      "ver el taller completo",
      `/tienda/${ARTESOL_SHOP_SLUG}`,
      "."
    ),
  ],
};

export const ALCIDES_VIDES_STORY: BlogArticle = {
  _uid: "fallback-alcides-vides",
  component: "blog_article",
  title: "Alcides Vides: El Pescador que Tejió su Propio Destino",
  slug: "alcides-vides-artesol",
  full_slug: "historias/alcides-vides-artesol",
  description:
    "Del agua de la Ciénaga de Ayapel al tejido de la palma de seje: la historia de Alcides Vides y el Taller Artesol, motor artesanal de El Cedro, Córdoba.",
  cover: {
    filename: "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/images/1765475664530_0_IMG_4019.jpeg.jpeg",
    alt: "Alcides Vides tejiendo palma de seje en el Taller Artesol",
  },
  author_name: "Redacción Telar",
  category: "Crónica del Territorio",
  reading_time: 7,
  content: alcidesContent,
  first_published_at: "2026-04-21T00:00:00.000Z",
  published_at: "2026-04-21T00:00:00.000Z",
  // @ts-expect-error — extension field
  keywords: [
    "alcides",
    "vides",
    "artesol",
    "seje",
    "palma",
    "ayapel",
    "el cedro",
    "cordoba",
    "san jorge",
    "cienaga",
    "pescador",
    "tejido",
  ],
};

// ── Registry ───────────────────────────────────────────
export const FALLBACK_STORIES: BlogArticle[] = [
  ALCIDES_VIDES_STORY,
  CAUCA_SEDA_STORY,
];

/** Find a fallback story by slug. */
export function getFallbackStoryBySlug(
  slug: string | undefined
): BlogArticle | null {
  if (!slug) return null;
  return FALLBACK_STORIES.find((s) => s.slug === slug) ?? null;
}

/** Get the list of keywords declared on a story (if any). */
export function getStoryKeywords(article: BlogArticle | null | undefined): string[] {
  if (!article) return [];
  // @ts-expect-error — custom extension field on fallback entries
  const list = (article.keywords as string[] | undefined) ?? [];
  return list.filter(Boolean);
}
