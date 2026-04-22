/**
 * TecnicaDetail — Editorial technique detail page
 * Route: /tecnica/:slug
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import {
  getProductsNew,
  getPrimaryImageUrl,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { ExploreProductCard } from "@/components/ExploreProductCard";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import type { TaxonomyTechnique } from "@/services/taxonomy.actions";
import {
  useProductImagesByTechnique,
  getTechniqueImage,
  sanitizeImageUrl,
} from "@/hooks/useProductImagesByTechnique";

/* ── Technique editorial metadata ──────────────────── */
interface TechniqueEditorial {
  name: string;
  slug: string;
  subtitle: string;
  heroDescription: string;
  longDescription: string;
  explanationCards: { title: string; text: string }[];
  culturalQuote: string;
  culturalTitle: string;
  territories: string[];
  ctaHeadline: string;
}

const TECHNIQUE_DATA: Record<string, TechniqueEditorial> = {
  "tejido-plano": {
    name: "Tejido Plano",
    slug: "tejido-plano",
    subtitle: "Un diálogo entre tensión y paciencia",
    heroDescription:
      "El tejido plano es una de las técnicas textiles más antiguas de la humanidad. En Colombia, artesanos de múltiples regiones mantienen vivo este oficio, tejiendo identidad y tradición en cada pasada de hilo sobre el telar.",
    longDescription:
      "El tejido plano funciona mediante hilos de urdimbre tensados entre los que el artesano entrelaza la trama usando una lanzadera. Ya sea en telar vertical u horizontal, cada región le imprime su identidad a través de materiales, patrones y rituales.",
    explanationCards: [
      { title: "Proceso", text: "Los hilos de urdimbre se tensan en un marco de madera. La trama se pasa horizontalmente con una lanzadera, creando el tejido patrón a patrón." },
      { title: "Materiales", text: "Algodón, lana virgen, fique y fibras naturales. Cada región privilegia materiales locales que dan carácter único a sus tejidos." },
      { title: "Tiempo", text: "Una hamaca puede tardar de 15 a 30 días. Una ruana compleja, hasta 2 meses. El tiempo es parte integral del valor artesanal." },
    ],
    culturalQuote: "El telar no es solo un instrumento, es un altar donde se teje la memoria de un pueblo. Cada hilo lleva consigo la voz de quien lo tensó.",
    culturalTitle: "La memoria en el hilo",
    territories: ["san-jacinto", "boyaca", "narino"],
    ctaHeadline: "Descubra la maestría del Tejido Plano",
  },
  "tejido-en-chaquira": {
    name: "Tejido en Chaquira",
    slug: "tejido-en-chaquira",
    subtitle: "Cuentas de color que codifican la cosmovisión",
    heroDescription:
      "El tejido en chaquira ensarta diminutas cuentas de vidrio para crear manillas, collares y objetos ceremoniales con patrones geométricos que codifican la cosmovisión de comunidades indígenas.",
    longDescription:
      "Las artesanas enhebran cientos de cuentas de vidrio en hilos de nailon, construyendo mosaicos geométricos que narran elementos de la naturaleza y la cosmogonía. Cada pieza puede requerir miles de cuentas colocadas una a una.",
    explanationCards: [
      { title: "Proceso", text: "Se enhebran cuentas de vidrio en hilo de nailon siguiendo patrones geométricos memorizados. Cada fila se tensa para mantener la estructura." },
      { title: "Materiales", text: "Chaquiras (cuentas de vidrio), hilo de nailon, agujas finas. Los colores tradicionales representan elementos de la naturaleza." },
      { title: "Tiempo", text: "Una manilla sencilla tarda 2-3 días. Collares y pectorales complejos pueden requerir hasta 3 semanas de trabajo continuo." },
    ],
    culturalQuote: "Cada cuenta de chaquira lleva un color que habla. El rojo es sangre y fuerza, el blanco es pureza, el negro es la noche madre.",
    culturalTitle: "El lenguaje de las cuentas",
    territories: ["la-guajira"],
    ctaHeadline: "Descubra la maestría del Tejido en Chaquira",
  },
  modelado: {
    name: "Modelado",
    slug: "modelado",
    subtitle: "Alquimia de tierra y fuego",
    heroDescription:
      "Desde el barro negro de La Chamba hasta la cerámica de Ráquira, el modelado en arcilla es un lienzo donde las manos del artesano esculpen la identidad de cada territorio.",
    longDescription:
      "La cerámica artesanal colombiana preserva técnicas precolombinas. El barro se extrae, se amasa, se moldea a mano o en torno, se pule con piedras de río y se cuece en hornos de leña a cielo abierto.",
    explanationCards: [
      { title: "Proceso", text: "Extracción de arcilla, amasado, moldeado manual o en torno, secado al sol, bruñido con piedra de río y cocción en horno de leña." },
      { title: "Materiales", text: "Arcilla local, agua, piedras de río para bruñir. El barro negro de La Chamba no usa esmaltes: el brillo viene del bruñido y la cocción." },
      { title: "Tiempo", text: "Una pieza de barro negro tarda entre 5 y 15 días entre moldeado, secado, bruñido y cocción. Las piezas grandes pueden tardar más." },
    ],
    culturalQuote: "Las ollas de La Chamba no llevan esmalte. El brillo negro viene del bruñido con piedra de río y la cocción a fuego abierto con hojarasca.",
    culturalTitle: "Alquimia del barro negro",
    territories: ["la-chamba", "boyaca"],
    ctaHeadline: "Descubra la maestría del Modelado",
  },
  trenzado: {
    name: "Trenzado",
    slug: "trenzado",
    subtitle: "La geometría de la fibra",
    heroDescription:
      "El trenzado transforma fibras vegetales en canastos, esteras y objetos ceremoniales. En el Putumayo y la Amazonía, cada pieza trenzada es un mapa del bosque y de la cosmovisión del artesano.",
    longDescription:
      "Las comunidades indígenas recolectan fibras de chambira, werregue y otras palmas. Cada fibra se procesa artesanalmente: se pela, se seca, se tiñe con tintes naturales y se trenza en patrones transmitidos oralmente.",
    explanationCards: [
      { title: "Proceso", text: "Recolección de palma, extracción de fibra, secado, teñido natural y trenzado manual. Los patrones se memorizan y se transmiten de madre a hija." },
      { title: "Materiales", text: "Fibra de werregue, chambira, iraca, caña flecha. Los tintes provienen de plantas, cortezas y frutos del bosque." },
      { title: "Tiempo", text: "Un canasto puede tardar de 3 días a 3 semanas según tamaño y complejidad del patrón." },
    ],
    culturalQuote: "Cada semilla elegida para un collar del Putumayo tiene un nombre, un origen y un propósito. Los artesanos escuchan a la selva antes de tomar.",
    culturalTitle: "La voz de la selva",
    territories: ["putumayo"],
    ctaHeadline: "Descubra la maestría del Trenzado",
  },
  filigrana: {
    name: "Filigrana",
    slug: "filigrana",
    subtitle: "El arte de tejer el metal",
    heroDescription:
      "La filigrana es joyería convertida en encaje. Hilos finísimos de plata u oro se enrollan, sueldan y ensamblan a mano sin moldes, dando vida a piezas que parecen bordadas sobre el aire.",
    longDescription:
      "Heredera del encuentro entre la orfebrería precolombina —Quimbaya, Tayrona, Zenú— y la técnica morisca llegada a América con la Colonia, la filigrana colombiana es una cartografía de maestrías regionales: la escuela momposina (Bolívar), declarada Patrimonio Cultural Inmaterial de la Nación; la tradición antioqueña de Santa Fe de Antioquia; el pulso del Zenú en Ciénaga de Oro (Córdoba); la orfebrería afro del Pacífico en Quibdó (Chocó); y la tradición pastusa en Barbacoas (Nariño). En Telar acompañamos a cada taller con trazabilidad del metal, pago directo a la maestra o maestro orfebre y apoyo a la recuperación de plata reciclada.",
    explanationCards: [
      {
        title: "Encuentro de dos mundos",
        text: "Oro ancestral y plata morisca convergen en un oficio que tiene 500 años de diálogo cultural. La filigrana no copia a ninguno de sus padres: los reinterpreta en cada pulso.",
      },
      {
        title: "Geografía de la filigrana",
        text: "Mompox, Santa Fe de Antioquia, Ciénaga de Oro, Quibdó y Barbacoas. Cinco escuelas regionales, cinco gramáticas del hilo, un mismo respeto por el metal hecho encaje.",
      },
      {
        title: "Impacto Telar",
        text: "Transparencia de origen, inclusión financiera para artesanos sin banca y materias primas sostenibles (plata reciclada, oro libre de mercurio). Comprar filigrana en Telar es financiar un linaje.",
      },
    ],
    culturalQuote:
      "La filigrana no se hace: se teje. Cada espiral nace del pulso, no del molde; y cada pieza lleva el nombre de una escuela, un taller y una mano.",
    culturalTitle: "El pulso del orfebre",
    territories: [],
    ctaHeadline: "Descubra la maestría de la Filigrana",
  },
  calado: {
    name: "Calado",
    slug: "calado",
    subtitle: "La filigrana de la madera",
    heroDescription:
      "El calado es el arte de perforar la madera para que la luz la atraviese. Lo que se retira es tan importante como lo que queda: el vacío se vuelve dibujo, la silueta se vuelve materia.",
    longDescription:
      "Arquitectura de detalle en balcones y celosías, mobiliario de autor con respaldares que parecen bordados, y una soberanía del oficio que se resiste a la producción industrial: el calado colombiano es heredero de la carpintería colonial y de las tradiciones indígenas de la talla. Cada pieza calada exige precisión de cirujano y paciencia de tejedora — porque una gubia que resbala no tiene vuelta atrás.",
    explanationCards: [
      {
        title: "Técnica y herramienta",
        text: "Dibujo del patrón, perforación con taladro para abrir el paso, y recorte fino con segueta, gubia y formón. Pulido a mano hasta que el borde del vacío sea tan limpio como el del sólido.",
      },
      {
        title: "Arquitectura y mobiliario",
        text: "Balcones, celosías, biombos y respaldares. El calado convierte el mueble en un filtro de luz y el detalle arquitectónico en una firma del territorio.",
      },
      {
        title: "Soberanía del oficio",
        text: "Cada taller guarda sus plantillas heredadas. No hay dos calados iguales, y esa imposibilidad de copia es la garantía del oficio frente a la réplica industrial.",
      },
    ],
    culturalQuote:
      "En el calado, lo que se quita le da forma a lo que queda. Es la filigrana de la madera: un arte donde el vacío es el protagonista.",
    culturalTitle: "Arquitectura de detalle",
    territories: [],
    ctaHeadline: "Descubra la maestría del Calado",
  },
  "barniz-de-pasto": {
    name: "Barniz de Pasto",
    slug: "barniz-de-pasto",
    subtitle: "Resina vegetal, paciencia infinita",
    heroDescription:
      "El barniz de Pasto o Mopa-Mopa es una técnica única en el mundo. Una resina vegetal es masticada, estirada en láminas casi invisibles y aplicada sobre madera en capas de color.",
    longDescription:
      "Los artesanos recolectan la resina del árbol Mopa-Mopa en el Putumayo, la transportan a Pasto y la procesan masticándola hasta lograr una masa elástica que se estira y se tiñe con anilinas vegetales.",
    explanationCards: [
      { title: "Proceso", text: "Recolección de resina, masticado, estirado en láminas, teñido con anilinas, corte con cuchilla y aplicación sobre madera tallada." },
      { title: "Materiales", text: "Resina de Mopa-Mopa, madera tallada (cedro o sauce), anilinas vegetales para color." },
      { title: "Tiempo", text: "Una pieza mediana puede tardar entre 1 y 4 semanas. Las piezas de alta complejidad, varios meses." },
    ],
    culturalQuote: "El barniz de Pasto es una resina que el artesano mastica, estira y aplica en capas microscópicas. Un arte que solo existe en Nariño.",
    culturalTitle: "Mopa-Mopa: resina y paciencia",
    territories: ["narino"],
    ctaHeadline: "Descubra la maestría del Barniz de Pasto",
  },
  talla: {
    name: "Talla",
    slug: "talla",
    subtitle: "Memoria esculpida en el tiempo",
    heroDescription:
      "La talla transforma troncos y bloques de madera en objetos de arte que narran mitos, creencias y la relación profunda de las comunidades con su entorno natural.",
    longDescription:
      "Los talladores seleccionan maderas locales como cedro, tagua o chonta, y con formones, gubias y cuchillos dan forma a figuras que van desde utensilios cotidianos hasta esculturas ceremoniales.",
    explanationCards: [
      { title: "Proceso", text: "Selección de madera, secado, desbaste con hacha, tallado fino con formones y gubias, lijado y acabado con aceites o lacas naturales." },
      { title: "Materiales", text: "Cedro, sauce, tagua, chonta, guayacán. Cada madera ofrece dureza, veta y aroma diferentes." },
      { title: "Tiempo", text: "Una figura pequeña puede tardar 2-3 días. Esculturas grandes o con calado fino pueden requerir semanas." },
    ],
    culturalQuote: "La madera tiene memoria. El artesano no impone una forma: descubre la que ya estaba dentro del tronco.",
    culturalTitle: "La voz de la madera",
    territories: [],
    ctaHeadline: "Descubra la maestría de la Talla",
  },
  tallado: {
    name: "Tallado",
    slug: "tallado",
    subtitle: "El alma de la madera revelada a cincel",
    heroDescription:
      "El tallado transforma bloques de madera en esculturas, máscaras y objetos rituales. En el Pacífico colombiano, los talladores dan forma a la cosmogonía afrocolombiana e indígena con gubias y formones.",
    longDescription:
      "A diferencia de la talla desbastada, el tallado fino trabaja los detalles con gubias y cinceles, creando texturas, rostros y figuras con un nivel de detalle que solo la mano humana puede lograr.",
    explanationCards: [
      { title: "Proceso", text: "Selección de la pieza, desbaste inicial, tallado de detalle con gubias curvas y rectas, pulido con lija fina y acabado con cera o aceite." },
      { title: "Materiales", text: "Maderas duras como chonta, nazareno y granadillo. Maderas blandas como balso para piezas decorativas." },
      { title: "Tiempo", text: "Una máscara ceremonial puede tardar de 1 a 3 semanas. Esculturas de gran formato, varios meses." },
    ],
    culturalQuote: "En el Pacífico, tallar es orar. Cada máscara que emerge de la madera lleva la voz de los ancestros.",
    culturalTitle: "Tallado del Pacífico",
    territories: [],
    ctaHeadline: "Descubra la maestría del Tallado",
  },
  "tejido-de-punto": {
    name: "Tejido de Punto",
    slug: "tejido-de-punto",
    subtitle: "Bucles que abrazan la tradición",
    heroDescription:
      "El tejido de punto entrelaza hilos en bucles sucesivos para crear prendas y accesorios. De las ruanas boyacenses a las mantas del Caribe, cada puntada es un registro cultural.",
    longDescription:
      "Con agujas de dos puntas o circulares, las artesanas crean puntos que se entrelazan en filas formando telas elásticas y abrigadas. Es la base de la tradición textil del altiplano colombiano.",
    explanationCards: [
      { title: "Proceso", text: "Se montan puntos en agujas y se tejen en filas, creando puntos del derecho y del revés que forman patrones. Se transmite de madre a hija." },
      { title: "Materiales", text: "Lana virgen de oveja, lana merino, algodón. En Boyacá, la lana se hila a mano con huso." },
      { title: "Tiempo", text: "Una ruana puede tardar entre 1 y 2 meses. Una cobija grande, hasta 3 meses de trabajo." },
    ],
    culturalQuote: "La ruana boyacense no es solo una prenda. Es un abrazo de lana virgen que conecta al artesano con siglos de tradición pastoril del páramo.",
    culturalTitle: "La ruana y el páramo",
    territories: ["boyaca"],
    ctaHeadline: "Descubra la maestría del Tejido de Punto",
  },
  anudados: {
    name: "Anudados",
    slug: "anudados",
    subtitle: "Arquitectura de nudos",
    heroDescription:
      "Los anudados transforman cuerdas en hamacas, redes y piezas decorativas mediante una técnica de nudos que requiere precisión milimétrica y una paciencia extraordinaria.",
    longDescription:
      "Sin agujas ni herramientas, solo con las manos, el artesano crea estructuras de nudos que pueden soportar el peso de una persona. Las hamacas de San Jacinto son el ejemplo más conocido de esta técnica.",
    explanationCards: [
      { title: "Proceso", text: "Se fijan cuerdas a un soporte y se anudan siguiendo patrones específicos. Cada nudo debe tener la misma tensión para garantizar la resistencia." },
      { title: "Materiales", text: "Hilo de algodón, fique, nailon. Las hamacas tradicionales usan hilo de algodón por su suavidad y resistencia." },
      { title: "Tiempo", text: "Una hamaca matrimonial puede tardar entre 2 y 4 semanas de trabajo continuo." },
    ],
    culturalQuote: "La hamaca no es un mueble, es una cuna, una cama, un columpio, un refugio. Es donde se nace, se descansa y se muere en el Caribe colombiano.",
    culturalTitle: "La hamaca como hogar",
    territories: ["san-jacinto"],
    ctaHeadline: "Descubra la maestría de los Anudados",
  },
  "pintado-a-mano": {
    name: "Pintado a Mano",
    slug: "pintado-a-mano",
    subtitle: "El color como lenguaje ancestral",
    heroDescription:
      "El pintado a mano aplica pigmentos con pinceles sobre cerámica, madera y textiles, convirtiendo cada pieza en un lienzo irrepetible que refleja la iconografía regional colombiana.",
    longDescription:
      "Los artesanos preparan sus propias mezclas de color a partir de tierras, óxidos y pigmentos vegetales. Cada pincelada sigue patrones heredados pero adaptados al pulso individual del maestro.",
    explanationCards: [
      { title: "Proceso", text: "Preparación de superficie, mezcla de pigmentos, trazado de patrones a mano libre con pinceles finos y sellado con barniz natural." },
      { title: "Materiales", text: "Pigmentos naturales y minerales, pinceles de pelo animal, barnices vegetales. Los colores varían según la tradición regional." },
      { title: "Tiempo", text: "Una pieza sencilla de cerámica tarda 1-2 días. Piezas con patrones complejos pueden requerir 1-2 semanas." },
    ],
    culturalQuote: "El pintor artesano no copia: dialoga con la superficie. Cada trazo es una conversación entre la mano y el material.",
    culturalTitle: "El diálogo del color",
    territories: ["narino"],
    ctaHeadline: "Descubra la maestría del Pintado a Mano",
  },
  "textil-vegetal": {
    name: "Textil Vegetal",
    slug: "textil-vegetal",
    subtitle: "La selva tejida entre las manos",
    heroDescription:
      "El textil vegetal emplea fibras extraídas de palmas, cortezas y lianas amazónicas para crear telas, bolsos y hamacas que preservan el conocimiento botánico indígena.",
    longDescription:
      "Las comunidades indígenas identifican, recolectan y procesan fibras vegetales siguiendo calendarios lunares y estacionales. El resultado son textiles de una resistencia y belleza imposibles de replicar industrialmente.",
    explanationCards: [
      { title: "Proceso", text: "Recolección de fibra, descortezado, secado al sol, blanqueo natural en agua y tejido manual en bastidores improvisados." },
      { title: "Materiales", text: "Fibra de chambira, cumare, yanchama y cortezas. Los tintes provienen de raíces, hojas y frutos del bosque." },
      { title: "Tiempo", text: "Un bolso mediano tarda de 1 a 2 semanas. Una hamaca de fibra vegetal puede requerir hasta un mes." },
    ],
    culturalQuote: "La fibra no se arranca, se pide permiso al árbol. El textil vegetal comienza con un acto de respeto al bosque.",
    culturalTitle: "El permiso del bosque",
    territories: ["putumayo"],
    ctaHeadline: "Descubra la maestría del Textil Vegetal",
  },
};

/* ── Territory names for linking ─────────────────────── */
const TERRITORY_NAMES: Record<string, string> = {
  "san-jacinto": "San Jacinto, Bolívar",
  "la-guajira": "La Guajira",
  boyaca: "Boyacá",
  narino: "Nariño",
  "la-chamba": "La Chamba, Tolima",
  putumayo: "Putumayo",
};

/* ── Helper to match API technique to slug ───────────── */
function techniqueToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function findTechniqueData(slug: string): TechniqueEditorial | undefined {
  return TECHNIQUE_DATA[slug];
}

/* ── Component ──────────────────────────────────────── */
export default function TecnicaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { techniques: allTechniques } = useTaxonomy();
  const { shops } = useArtisanShops();
  const { data: techImages } = useProductImagesByTechnique();
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [loading, setLoading] = useState(true);

  const technique = slug ? findTechniqueData(slug) : undefined;

  // Find the API technique matching this slug
  const apiTechnique: TaxonomyTechnique | undefined = useMemo(() => {
    if (!slug) return undefined;
    return allTechniques.find((t) => techniqueToSlug(t.name) === slug);
  }, [allTechniques, slug]);

  // Fetch products that use this technique
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await getProductsNew({ page: 1, limit: 500 });
        if (cancelled) return;

        if (apiTechnique) {
          const filtered = res.data.filter((p) => {
            const primary = p.artisanalIdentity?.primaryTechnique;
            const secondary = p.artisanalIdentity?.secondaryTechnique;
            return primary?.id === apiTechnique.id || secondary?.id === apiTechnique.id;
          });
          setProducts(filtered);
        } else {
          // Fallback: strict normalized equality so "talla" ≠ "tallado".
          const norm = (s: string) =>
            s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const target = norm(technique?.name || slug?.replace(/-/g, " ") || "");
          const filtered = target
            ? res.data.filter((p) => {
                const primary = norm(p.artisanalIdentity?.primaryTechnique?.name || "");
                const secondary = norm(p.artisanalIdentity?.secondaryTechnique?.name || "");
                return primary === target || secondary === target;
              })
            : [];
          setProducts(filtered);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [slug, apiTechnique, technique]);

  // Related techniques (exclude current)
  const relatedTechniques = useMemo(() => {
    const allSlugs = Object.keys(TECHNIQUE_DATA);
    return allSlugs.filter((s) => s !== slug).slice(0, 3);
  }, [slug]);

  // Not found — build generic from API data
  const displayName = technique?.name || apiTechnique?.name || slug?.replace(/-/g, " ") || "";
  const displayData: TechniqueEditorial = technique || {
    name: displayName,
    slug: slug || "",
    subtitle: "Tradición artesanal colombiana",
    heroDescription: apiTechnique?.description || `${displayName} es una técnica artesanal que forma parte del patrimonio cultural colombiano.`,
    longDescription: `Esta técnica ha sido transmitida de generación en generación, preservando el conocimiento ancestral y adaptándose a las necesidades contemporáneas.`,
    explanationCards: [
      { title: "Proceso", text: "Técnica transmitida oralmente de maestro a aprendiz, donde cada paso del proceso es esencial." },
      { title: "Materiales", text: "Materiales locales seleccionados por el artesano según la tradición de su territorio." },
      { title: "Tiempo", text: "Cada pieza requiere dedicación y paciencia, con tiempos que varían según la complejidad." },
    ],
    culturalQuote: "El oficio artesanal no se aprende, se hereda. No se enseña, se transmite.",
    culturalTitle: "Herencia viva",
    territories: [],
    ctaHeadline: `Descubra la maestría de ${displayName}`,
  };

  const displayProducts = products.slice(0, 8);

  // Workshops that mention this technique in craftType
  const relevantShops = useMemo(() => {
    const nameLC = displayData.name.toLowerCase();
    return shops.filter(
      (s) =>
        s.craftType?.toLowerCase().includes(nameLC) ||
        s.description?.toLowerCase().includes(nameLC)
    ).slice(0, 4);
  }, [shops, displayData.name]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f7f2", color: "#2c2c2c" }}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <nav className="flex text-[10px] uppercase tracking-widest gap-2 font-sans mb-12" style={{ color: "rgba(44,44,44,0.4)" }}>
          <Link to="/" className="hover:text-[#ec6d13] transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/tecnicas" className="hover:text-[#ec6d13] transition-colors">Técnicas</Link>
          <span>/</span>
          <span style={{ color: "#ec6d13" }} className="font-bold">{displayData.name}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-8 lg:border-r lg:pr-12" style={{ borderColor: "rgba(44,44,44,0.05)" }}>
            <div className="space-y-4">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.4em] font-sans"
                style={{ color: "#ec6d13" }}
              >
                Técnica artesanal
              </p>
              <h1 className="text-5xl md:text-6xl font-serif italic leading-[0.9]" style={{ letterSpacing: "-0.04em" }}>
                {displayData.name}
              </h1>
              <p className="text-xl font-serif italic" style={{ color: "rgba(44,44,44,0.7)" }}>
                {displayData.subtitle}
              </p>
            </div>
            <p className="text-lg font-light leading-relaxed max-w-md" style={{ color: "rgba(44,44,44,0.7)" }}>
              {displayData.heroDescription}
            </p>
            <Link
              to="/productos"
              className="inline-block px-8 py-3 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#2c2c2c] transition-all"
              style={{ backgroundColor: "#ec6d13" }}
            >
              Ver piezas con esta técnica
            </Link>
          </div>
          <div className="lg:col-span-7">
            <div className="aspect-[21/9] rounded-sm relative overflow-hidden" style={{ backgroundColor: "#e5e1d8" }}>
              {(() => {
                // Try product image first (sanitised), then technique image map
                const productImg = displayProducts[0] && getPrimaryImageUrl(displayProducts[0]);
                const imgUrl = productImg
                  ? sanitizeImageUrl(productImg)
                  : getTechniqueImage(techImages, displayData.name);
                return imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={displayData.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-6xl font-serif italic" style={{ color: "rgba(44,44,44,0.06)" }}>
                      {displayData.name}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ EXPLANATION BLOCK (3 cards) ═══════════════ */}
      <section className="px-6 py-24" style={{ backgroundColor: "#f5f3ee" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 flex justify-between items-baseline">
            <h2 className="text-4xl font-serif italic">Cómo se hace</h2>
            <span className="text-[10px] uppercase tracking-widest font-bold font-sans" style={{ color: "rgba(44,44,44,0.3)" }}>
              El oficio
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayData.explanationCards.map((card, i) => (
              <div
                key={i}
                className="p-10 space-y-6 border transition-colors duration-500 hover:bg-white"
                style={{ backgroundColor: "#f9f7f2", borderColor: "rgba(44,44,44,0.05)" }}
              >
                <span className="font-serif italic text-2xl" style={{ color: "#ec6d13" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl font-serif">{card.title}</h3>
                <p className="font-light leading-relaxed" style={{ color: "rgba(44,44,44,0.7)" }}>
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ LONG DESCRIPTION ═══════════════ */}
      <section className="px-6 py-24" style={{ backgroundColor: "#2c2c2c", color: "#f9f7f2" }}>
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">La técnica en profundidad</h2>
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <p className="text-xl leading-relaxed opacity-90 font-light">
              {displayData.longDescription}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRODUCT GRID ═══════════════ */}
      <section className="px-6 py-32 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-5xl font-serif">Piezas con {displayData.name}</h2>
          <Link
            to="/productos"
            className="text-[10px] font-bold uppercase tracking-widest border-b pb-1 transition-colors hover:text-[#ec6d13] hover:border-[#ec6d13]"
            style={{ borderColor: "#2c2c2c" }}
          >
            Ver todas las piezas
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((p) => (
              <ExploreProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="aspect-[3/4] mb-6 rounded-sm animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                <div className="h-4 w-24 rounded mb-2 animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
                <div className="h-6 w-40 rounded animate-pulse" style={{ backgroundColor: "#e5e1d8" }} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg italic opacity-60">
            Próximamente: piezas elaboradas con esta técnica.
          </p>
        )}
      </section>

      {/* ═══════════════ WORKSHOPS ═══════════════ */}
      {relevantShops.length > 0 && (
        <section className="px-6 py-32" style={{ backgroundColor: "#2c2c2c", color: "#f9f7f2" }}>
          <div className="max-w-[1400px] mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-serif">Talleres que dominan esta técnica</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] mt-2 font-sans" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Maestros del oficio
                </p>
              </div>
              <Link
                to="/tiendas"
                className="px-8 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-[#ec6d13] hover:text-[#ec6d13]"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
              >
                Ver todos los talleres
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relevantShops.map((shop) => (
                <Link
                  key={shop.id}
                  to={`/artesano/${shop.shopSlug || shop.id}`}
                  className="group"
                >
                  <div className="aspect-square mb-6 overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    {(shop.logoUrl || shop.bannerUrl) && (
                      <img
                        src={shop.logoUrl || shop.bannerUrl}
                        alt={shop.shopName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <span className="text-[#ec6d13] font-bold uppercase tracking-widest text-[9px] mb-1 block">
                    {shop.department || shop.region || "Colombia"}
                  </span>
                  <h4 className="font-serif text-xl text-white group-hover:text-[#ec6d13] transition-colors">
                    {shop.shopName}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TERRITORY MODULE ═══════════════ */}
      {displayData.territories.length > 0 && (
        <section className="px-6 py-32 max-w-[1400px] mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-serif italic">Territorios donde vive esta técnica</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold font-sans mt-2" style={{ color: "rgba(44,44,44,0.4)" }}>
              Raíces geográficas
            </p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {displayData.territories.map((tSlug) => (
              <Link
                key={tSlug}
                to={`/territorio/${tSlug}`}
                className="group flex-shrink-0 w-80"
              >
                <div className="aspect-[16/10] rounded-sm mb-4 overflow-hidden relative" style={{ backgroundColor: "#e5e1d8" }}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-serif italic group-hover:text-[#ec6d13] transition-colors">
                  {TERRITORY_NAMES[tSlug] || tSlug}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════ CULTURAL CAPSULE ═══════════════ */}
      <section className="relative px-6 py-40 overflow-hidden bg-white border-y" style={{ borderColor: "rgba(44,44,44,0.05)" }}>
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <span className="text-5xl" style={{ color: "#ec6d13" }}>"</span>
          <h2 className="text-4xl md:text-5xl font-serif italic">{displayData.culturalTitle}</h2>
          <p className="text-xl md:text-2xl leading-relaxed italic font-serif" style={{ color: "rgba(44,44,44,0.8)" }}>
            "{displayData.culturalQuote}"
          </p>
          <div className="w-16 h-px mx-auto" style={{ backgroundColor: "#ec6d13" }} />
        </div>
      </section>

      {/* ═══════════════ RELATED TECHNIQUES ═══════════════ */}
      <section className="px-6 py-32 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2
            className="text-[10px] font-bold uppercase tracking-[0.4em] font-sans"
            style={{ color: "rgba(44,44,44,0.4)" }}
          >
            Seguir explorando técnicas
          </h2>
          <Link
            to="/tecnicas"
            className="px-8 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-[#ec6d13] hover:text-[#ec6d13]"
            style={{ borderColor: "rgba(44,44,44,0.2)" }}
          >
            Ver archivo completo
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {relatedTechniques.map((tSlug) => {
            const t = TECHNIQUE_DATA[tSlug];
            if (!t) return null;
            const relImg = getTechniqueImage(techImages, t.name);
            return (
              <Link key={tSlug} to={`/tecnica/${tSlug}`} className="group block">
                <div
                  className="aspect-[4/3] rounded-sm mb-6 grayscale group-hover:grayscale-0 transition-all duration-700 relative overflow-hidden"
                  style={{ backgroundColor: "#e5e1d8" }}
                >
                  {relImg ? (
                    <img
                      src={relImg}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-4xl font-serif italic" style={{ color: "rgba(44,44,44,0.06)" }}>
                        {t.name}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-serif italic group-hover:text-[#ec6d13] transition-colors">{t.name}</h3>
                <p className="text-sm mt-2 font-light" style={{ color: "rgba(44,44,44,0.6)" }}>
                  {t.subtitle}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section
        className="px-6 py-40 flex flex-col items-center text-center gap-10"
        style={{ backgroundColor: "#2c2c2c", color: "#fff" }}
      >
        <h2 className="text-4xl md:text-5xl font-serif max-w-3xl leading-tight">{displayData.ctaHeadline}</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            to="/productos"
            className="px-12 py-4 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#2c2c2c] transition-all"
            style={{ backgroundColor: "#ec6d13" }}
          >
            Explorar piezas
          </Link>
          <Link
            to="/tecnicas"
            className="px-12 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-[#ec6d13] hover:text-[#ec6d13]"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
          >
            Ver todas las técnicas
          </Link>
          <Link
            to="/territorios"
            className="px-12 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all hover:border-[#ec6d13] hover:text-[#ec6d13]"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
          >
            Descubrir territorios
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
