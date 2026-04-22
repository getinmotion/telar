/**
 * ColeccionDetail — Editorial Collection Detail
 * Route: /coleccion/:slug
 * Shows a curated collection with products, curatorial context, and system connections.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Footer } from "@/components/Footer";
import { ExploreProductCard } from "@/components/ExploreProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { ArrowRight, Map, Waypoints, Store } from "lucide-react";
import {
  getProductsNew,
  getProductNewById,
  getPrimaryImageUrl,
  type ProductNewCore,
} from "@/services/products-new.actions";

// ── Editorial metadata per collection slug ───────────
interface CollectionMeta {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  manifestoTitle: string;
  manifestoText: string;
  stories: { title: string; excerpt: string }[];
  /** Optional: product whose image should be used as the hero of the collection */
  featuredProductId?: string;
  /** Optional: curated gallery images (S3 URLs) used for hero/manifesto/stories
   * when there are no products that represent the collection well. */
  galleryImages?: string[];
  /** Optional: extra editorial narrative sections rendered before the manifesto */
  extraSections?: { eyebrow?: string; title: string; body: string }[];
}

// ── Gallery: La Chamba — Vajilla Negra (S3) ──────────
const CHAMBA_S3_BASE =
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/vajilla_n";
const CHAMBA_GALLERY = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15].map(
  (n) => `${CHAMBA_S3_BASE}/VAJILLA%20NEGRA%20-%20${n}.jpg`,
);

const COLLECTION_META: CollectionMeta[] = [
  {
    slug: "tejeduria-de-san-jacinto",
    title: "Donde la Hamaca se Teje con Notas de Gaita",
    description:
      "El legado textil de San Jacinto, Bolívar: hamacas grandes tejidas en telar vertical por herederas del Reino Finzenú, al ritmo de gaitas y cumbia.",
    longDescription:
      "La hamaca es el alma de San Jacinto. Durante generaciones, las mujeres han tejido en telares verticales piezas que son mucho más que objetos de descanso: son un documento vivo de técnica, tradición y resistencia.",
    tags: ["Hamaca grande", "Telar vertical", "San Jacinto"],
    featuredProductId: "b5e6e8c6-5d50-404d-b295-38a7346d7333",
    manifestoTitle: "Mucho más que un lugar para descansar",
    manifestoText:
      "Para la cultura Zenú, la hamaca tenía un significado sagrado: se usaba para dormir, descansar, recibir visitas y también como mortaja en los ritos funerarios. Hoy, cada hamaca sanjacintera conserva esa memoria en la trama de sus hilos.",
    stories: [
      {
        title: "El telar vertical",
        excerpt:
          "La técnica heredada del Reino Finzenú que permite tejer hamacas de gran formato con dibujos geométricos y franjas de color.",
      },
      {
        title: "Gaitas y cumbia",
        excerpt:
          "San Jacinto no solo se mira, se escucha. Cuna de los Gaiteros, el pueblo late al ritmo de gaita hembra, gaita macho y tambor.",
      },
      {
        title: "Mujeres tejedoras",
        excerpt:
          "El oficio pasa de madres a hijas. Cada pieza lleva la firma invisible de su artesana y del linaje que la formó.",
      },
    ],
  },
  {
    slug: "tejeduria-wayuu",
    title: "Ancestría Geométrica",
    description:
      "El mapa de una cultura trazado en hilos. Una gramática de simetría y cosmogonía ancestral donde cada rombo cuenta una historia de territorio.",
    longDescription:
      "Cada mochila Wayúu es un universo de significados. Los kanaas —diseños geométricos— codifican elementos de la naturaleza, relatos de la comunidad y la identidad del clan que la teje. No hay dos mochilas iguales.",
    tags: ["Mochilas", "Wayúu", "La Guajira"],
    manifestoTitle: "Geometría Sagrada",
    manifestoText:
      "Los diseños kanaas no son ornamento: son lenguaje. Cada rombo, cada línea diagonal, cada patrón de color cuenta una historia que ha sido transmitida de madre a hija durante generaciones.",
    stories: [
      {
        title: "Los Hilos del Desierto",
        excerpt:
          "Cómo la aridez de La Guajira se transforma en explosión de color a través de las manos de las mujeres Wayúu.",
      },
      {
        title: "Kanaas: Código Visual",
        excerpt:
          "Descifrando el lenguaje geométrico que da forma a una de las tradiciones textiles más ricas del continente.",
      },
      {
        title: "Chinchorro: El Arte de Descansar",
        excerpt:
          "Más que una hamaca, un chinchorro Wayúu es una pieza de arte que puede tomar meses en completarse.",
      },
    ],
  },
  {
    slug: "ceramica-de-la-chamba",
    title: "La Chamba, Tolima: El Legado del Barro Negro",
    description:
      "En el corazón del Tolima, a orillas del Magdalena, una comunidad donde el barro no es solo tierra: es memoria viva. Con más de 300 años de tradición, el 85% de la vereda respira a través de la alfarería.",
    longDescription:
      "La Chamba es hoy uno de los centros cerámicos más importantes del país. Cada pieza conserva el engobe de barro rojo y el ahumado natural heredados de la cultura Pijao, técnicas que los artesanos han custodiado como un tesoro innegociable.",
    tags: ["Cerámica negra", "La Chamba", "Tolima", "Denominación de Origen"],
    galleryImages: CHAMBA_GALLERY,
    manifestoTitle: "Herencia Pijao: El Origen de la Forma",
    manifestoText:
      "La historia de estas piezas se remonta a los pueblos Poinco y Yaporogo de la cultura Pijao, quienes modelaban el barro con fines ceremoniales. Aunque el tiempo transformó sus símbolos, la esencia técnica permanece intacta: el engobe con barro rojo y el ahumado natural son herencias vivas.",
    extraSections: [
      {
        eyebrow: "Liderazgo femenino",
        title: "Sinergia familiar",
        body: "La cerámica de La Chamba tiene rostro de mujer. Son ellas, madres y jefas de hogar, quienes con destreza magistral dan vida a las piezas, mientras los hombres lideran la compleja labor de conseguir y preparar la materia prima. Esta sinergia familiar es la base de una economía popular sólida que ha permitido que el oficio trascienda los siglos.",
      },
      {
        eyebrow: "Educación y futuro",
        title: "El relevo generacional",
        body: "Desde 1972, con la creación de la Institución Educativa Técnica La Chamba, los niños y jóvenes reciben formación especializada. En Telar potenciamos esta base educativa integrando herramientas digitales y de comercialización directa, asegurando que el talento de estos jóvenes se convierta en una empresa global sin tener que abandonar su vereda.",
      },
      {
        eyebrow: "De la utilidad al culto",
        title: "Denominación de origen",
        body: "Lo que comenzó en 1937 como la creación de ollas y platos para las cocinas típicas de Colombia, hoy es una Denominación de Origen reconocida mundialmente. En Telar eliminamos los intermediarios para que el valor de estas piezas —que llevan el alma, la vida y el corazón de los artesanos del Tolima— regrese de manera justa y transparente al territorio.",
      },
    ],
    stories: [
      {
        title: "Liderazgo femenino",
        excerpt:
          "Madres y jefas de hogar son el alma del oficio. Su destreza sostiene una economía popular que ha trascendido siglos.",
      },
      {
        title: "Escuela de barro",
        excerpt:
          "Desde 1972 la Institución Educativa Técnica La Chamba forma al relevo generacional — tradición y tecnología en un mismo aula.",
      },
      {
        title: "Denominación de origen",
        excerpt:
          "De ollas de cocina a objeto de culto: la cerámica negra de La Chamba es hoy patrimonio reconocido mundialmente.",
      },
    ],
  },
  {
    slug: "ceramica-de-raquira",
    title: "Barros del Altiplano",
    description:
      "La tradición alfarera de Ráquira transformada en objetos que dialogan entre lo ancestral y lo contemporáneo.",
    longDescription:
      "Ráquira es el municipio más artesanal de Colombia. Sus calles huelen a barro cocido y sus talleres son laboratorios donde la tradición se encuentra con nuevas formas de expresión.",
    tags: ["Cerámica", "Ráquira", "Boyacá"],
    manifestoTitle: "Tierra Viva",
    manifestoText:
      "Cada pieza de Ráquira lleva en su interior la tierra del altiplano boyacense. Los acabados terracota y los esmaltes naturales hablan de una tradición que se reinventa sin perder su esencia.",
    stories: [
      {
        title: "Capital de la Artesanía",
        excerpt:
          "Ráquira, el pueblo que respira barro y transforma la tierra en arte desde tiempos prehispánicos.",
      },
      {
        title: "Colores del Altiplano",
        excerpt:
          "Los óxidos y minerales locales que dan a la cerámica de Ráquira su paleta única.",
      },
      {
        title: "Nuevas Formas",
        excerpt:
          "Jóvenes alfareros que dialogan con la tradición para crear piezas contemporáneas.",
      },
    ],
  },
  {
    slug: "sombrero-vueltiao",
    title: "Trenzados del Sinú",
    description:
      "La caña flecha se convierte en arte a través de las manos del pueblo Zenú. Geometría precisa que codifica cosmovisiones ancestrales.",
    longDescription:
      "El sombrero vueltiao no es solo un accesorio: es un símbolo nacional colombiano. Cada trenza cuenta con una complejidad que puede llegar hasta 27 vueltas, requiriendo semanas de trabajo meticuloso.",
    tags: ["Sombrero vueltiao", "Caña flecha", "Zenú"],
    manifestoTitle: "Vueltas de Identidad",
    manifestoText:
      "Las pintas del sombrero vueltiao son un código visual que narra la historia del pueblo Zenú. Cada diseño geométrico representa elementos de la naturaleza y la cosmogonía de esta cultura milenaria.",
    stories: [
      {
        title: "27 Vueltas",
        excerpt:
          "El arte del trenzado fino que puede tomar hasta un mes de trabajo continuo para una sola pieza.",
      },
      {
        title: "Las Pintas",
        excerpt:
          "Descifrando los más de 30 diseños tradicionales que adornan los sombreros del pueblo Zenú.",
      },
      {
        title: "Caña Flecha",
        excerpt:
          "La fibra sagrada que crece en las riberas del Sinú y se transforma en patrimonio cultural.",
      },
    ],
  },
  {
    slug: "mopa-mopa-barniz-de-pasto",
    title: "Resinas de la Selva",
    description:
      "Una técnica prehispánica que transforma resinas selváticas en láminas de color. Patrimonio Inmaterial de la UNESCO.",
    longDescription:
      "El barniz de Pasto es una de las técnicas artesanales más singulares del mundo. La resina del árbol mopa-mopa se recolecta, hierve, estira y aplica a mano sobre objetos de madera, creando acabados de color imposible.",
    tags: ["Mopa-mopa", "Barniz de Pasto", "Nariño"],
    manifestoTitle: "Alquimia Vegetal",
    manifestoText:
      "Transformar la resina de un árbol en láminas de color brillante requiere un dominio técnico que se transmite de generación en generación. El barniz de Pasto es pura alquimia entre naturaleza y mano humana.",
    stories: [
      {
        title: "La Resina Sagrada",
        excerpt:
          "El viaje de la resina desde las selvas del Putumayo hasta los talleres de Pasto.",
      },
      {
        title: "Patrimonio Vivo",
        excerpt:
          "Cómo el barniz de Pasto logró su reconocimiento como Patrimonio Inmaterial de la UNESCO.",
      },
      {
        title: "Colores Imposibles",
        excerpt:
          "La técnica de estirado y aplicación que crea acabados que ningún otro material puede replicar.",
      },
    ],
  },
];

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export default function ColeccionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { curatorialCategories, loading: taxonomyLoading } = useTaxonomy();
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState<ProductNewCore | null>(null);

  // Find the curatorial category matching this slug
  const category = useMemo(() => {
    return curatorialCategories.find((c) => nameToSlug(c.name) === slug);
  }, [curatorialCategories, slug]);

  // Find editorial metadata
  const meta = useMemo(() => {
    return COLLECTION_META.find((m) => m.slug === slug) ?? null;
  }, [slug]);

  // Fetch all products, then filter by curatorial category
  useEffect(() => {
    setLoadingProducts(true);
    getProductsNew({ page: 1, limit: 500 })
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        setProducts(data as ProductNewCore[]);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  // Fetch featured product when specified in collection metadata
  useEffect(() => {
    setFeaturedProduct(null);
    if (!meta?.featuredProductId) return;
    getProductNewById(meta.featuredProductId)
      .then((p) => setFeaturedProduct(p as ProductNewCore))
      .catch(() => {});
  }, [meta?.featuredProductId]);

  const collectionProducts = useMemo(() => {
    if (!category) return [];
    return products.filter(
      (p) => p.artisanalIdentity?.curatorialCategory?.id === category.id,
    );
  }, [products, category]);

  // Use collection name or editorial title
  const displayTitle = meta?.title ?? category?.name ?? slug ?? "";
  const displayDescription =
    meta?.description ?? category?.description ?? "";

  if (taxonomyLoading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <p className="text-[#2c2c2c]/40 text-sm uppercase tracking-widest">
          Cargando colección…
        </p>
      </div>
    );
  }

  if (!category && !taxonomyLoading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2] flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-serif">Colección no encontrada</h1>
        <Link
          to="/colecciones"
          className="text-[#ec6d13] text-sm uppercase tracking-widest font-bold"
        >
          Volver a colecciones
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{displayTitle} — Colecciones TELAR</title>
        <meta name="description" content={displayDescription} />
      </Helmet>

      <div className="bg-[#f9f7f2] text-[#2c2c2c] min-h-screen">
        {/* ═══════════════ HEADER ═══════════════ */}
        <header className="max-w-[1400px] mx-auto px-6 pt-20 mb-24 grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-7 space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#2c2c2c]/40 font-medium mb-4">
              <Link to="/" className="hover:text-[#2c2c2c] transition-colors">
                Inicio
              </Link>
              <span>/</span>
              <Link
                to="/colecciones"
                className="hover:text-[#2c2c2c] transition-colors"
              >
                Colecciones
              </Link>
              <span>/</span>
              <span className="text-[#ec6d13]">{displayTitle}</span>
            </nav>

            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ec6d13] block">
              Colección
            </span>
            <h1 className="text-6xl md:text-7xl font-serif leading-[0.9] italic tracking-tighter">
              {displayTitle}
            </h1>
            <p className="text-lg md:text-xl text-[#2c2c2c]/70 leading-relaxed font-light max-w-xl">
              {displayDescription}
            </p>
            {meta?.tags && (
              <div className="flex flex-wrap gap-2">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-[#2c2c2c]/5 rounded-full text-[10px] uppercase tracking-widest text-[#2c2c2c]/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-5">
            {(() => {
              const galleryHero = meta?.galleryImages?.[0];
              const heroProduct = featuredProduct ?? collectionProducts[0];
              const heroUrl =
                galleryHero ??
                (heroProduct ? getPrimaryImageUrl(heroProduct) : null);
              return heroUrl ? (
                <img
                  src={heroUrl}
                  alt={displayTitle}
                  className="aspect-[4/3] w-full object-cover shadow-[20px_20px_60px_rgba(0,0,0,0.03)]"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-[#e5e1d8]" />
              );
            })()}
          </div>
        </header>

        {/* ═══════════════ PRODUCT / GALLERY GRID ═══════════════ */}
        <section className="max-w-[1400px] mx-auto px-6 mb-24">
          {meta?.galleryImages && meta.galleryImages.length > 0 ? (
            <Carousel
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {meta.galleryImages.map((src, i) => (
                  <CarouselItem
                    key={src}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-[#e5e1d8] group">
                      <img
                        src={src}
                        alt={`${displayTitle} — pieza ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 md:-left-6 bg-white/90 border-[#2c2c2c]/10 hover:bg-white" />
              <CarouselNext className="right-2 md:-right-6 bg-white/90 border-[#2c2c2c]/10 hover:bg-white" />
            </Carousel>
          ) : loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-6">
                  <div className="aspect-[4/5] bg-[#e5e1d8] animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 bg-[#e5e1d8] w-1/3 animate-pulse" />
                    <div className="h-5 bg-[#e5e1d8] w-2/3 animate-pulse" />
                    <div className="h-4 bg-[#e5e1d8] w-1/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : collectionProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {collectionProducts.map((product) => (
                <ExploreProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#2c2c2c]/40 text-lg font-serif italic">
                Próximamente — piezas de esta colección
              </p>
              <Link
                to="/productos"
                className="inline-block mt-6 text-[#ec6d13] text-xs font-bold uppercase tracking-widest"
              >
                Explorar todas las piezas →
              </Link>
            </div>
          )}

          {collectionProducts.length > 9 && (
            <div className="mt-20 flex justify-center">
              <Link
                to="/productos"
                className="group relative px-12 py-4 border border-[#2c2c2c] overflow-hidden transition-all duration-300 hover:text-white"
              >
                <span className="relative z-10 text-xs font-bold uppercase tracking-[0.2em]">
                  Ver toda la colección
                </span>
                <div className="absolute inset-0 bg-[#2c2c2c] translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
              </Link>
            </div>
          )}
        </section>

        {/* ═══════════════ CURATORIAL CONTEXT (DARK) ═══════════════ */}
        {meta && (
          <section className="w-full bg-[#2c2c2c] py-32 text-[#f9f7f2] overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center gap-24">
              <div className="w-full md:w-[45%] space-y-10">
                <h2 className="text-5xl font-serif leading-tight italic">
                  {meta.manifestoTitle}
                </h2>
                <p className="text-xl leading-relaxed font-light opacity-80">
                  {meta.manifestoText}
                </p>
              </div>
              <div className="w-full md:w-[55%] relative">
                {(() => {
                  const manifestoImg =
                    meta.galleryImages?.[1] ??
                    (collectionProducts[1]
                      ? getPrimaryImageUrl(collectionProducts[1])
                      : null);
                  return manifestoImg ? (
                    <img
                      src={manifestoImg}
                      alt={meta.manifestoTitle}
                      className="aspect-video w-full object-cover opacity-70"
                    />
                  ) : (
                    <div className="aspect-video w-full bg-[#3a3a3a] opacity-30" />
                  );
                })()}
                <p className="mt-4 text-[10px] uppercase tracking-widest opacity-40">
                  {category?.description}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ EXTRA NARRATIVE SECTIONS ═══════════════ */}
        {meta?.extraSections && meta.extraSections.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-6 py-24">
            <div className="max-w-[1100px] mx-auto space-y-20">
              {meta.extraSections.map((sec) => (
                <div
                  key={sec.title}
                  className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start"
                >
                  <div className="md:col-span-4">
                    {sec.eyebrow && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] font-sans mb-4 text-[#ec6d13]">
                        {sec.eyebrow}
                      </p>
                    )}
                    <h3 className="text-4xl md:text-5xl font-serif italic leading-tight">
                      {sec.title}
                    </h3>
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-lg md:text-xl leading-relaxed font-light text-[#2c2c2c]/75">
                      {sec.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════ SYSTEM CONNECTIONS ═══════════════ */}
        <section className="max-w-[1400px] mx-auto px-6 py-32 border-b border-[#2c2c2c]/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Link
              to="/territorios"
              className="p-16 border border-[#2c2c2c]/10 hover:bg-gradient-to-br hover:from-[#ec6d13]/[0.08] hover:to-transparent transition-all duration-400 group cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div>
                <Map className="w-10 h-10 text-[#ec6d13] mb-8" />
                <h4 className="text-3xl font-serif italic leading-tight">
                  Ver productos por territorio relacionado
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2c2c2c]/40 group-hover:text-[#2c2c2c] group-hover:translate-x-2 transition-all">
                Ir al mapa de regiones
              </span>
            </Link>
            <Link
              to="/tecnicas"
              className="p-16 border border-[#2c2c2c]/10 hover:bg-gradient-to-br hover:from-[#ec6d13]/[0.08] hover:to-transparent transition-all duration-400 group cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div>
                <Waypoints className="w-10 h-10 text-[#ec6d13] mb-8" />
                <h4 className="text-3xl font-serif italic leading-tight">
                  Explorar técnica de tejeduría
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2c2c2c]/40 group-hover:text-[#2c2c2c] group-hover:translate-x-2 transition-all">
                Ver archivo de técnicas
              </span>
            </Link>
            <Link
              to="/tiendas"
              className="p-16 border border-[#2c2c2c]/10 hover:bg-gradient-to-br hover:from-[#ec6d13]/[0.08] hover:to-transparent transition-all duration-400 group cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div>
                <Store className="w-10 h-10 text-[#ec6d13] mb-8" />
                <h4 className="text-3xl font-serif italic leading-tight">
                  Conocer talleres y maestros
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2c2c2c]/40 group-hover:text-[#2c2c2c] group-hover:translate-x-2 transition-all">
                Lista de artesanos
              </span>
            </Link>
          </div>
        </section>

        {/* ═══════════════ STORIES ═══════════════ */}
        {meta?.stories && (
          <section className="max-w-[1400px] mx-auto px-6 py-32">
            <div className="mb-20 text-center">
              <h2 className="text-4xl md:text-5xl font-serif italic">
                Seguir explorando historias
              </h2>
              <div className="w-12 h-px bg-[#ec6d13] mx-auto mt-6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {meta.stories.map((story, i) => {
                const storyProduct = collectionProducts[i + 2];
                const storyImg =
                  meta.galleryImages?.[i + 2] ??
                  (storyProduct ? getPrimaryImageUrl(storyProduct) : null);
                return (
                  <article
                    key={story.title}
                    className="flex flex-col space-y-8 group cursor-pointer"
                  >
                    <div className="aspect-[4/5] overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.03)] bg-[#e5e1d8] transition-transform duration-500 group-hover:scale-[1.02]">
                      {storyImg && (
                        <img
                          src={storyImg}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-serif italic leading-tight group-hover:text-[#ec6d13] transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-[#2c2c2c]/60 leading-relaxed font-light line-clamp-2">
                        {story.excerpt}
                      </p>
                      <div className="inline-flex items-center gap-2 text-[#ec6d13] group-hover:gap-4 transition-all">
                        <span className="text-[10px] font-bold tracking-widest uppercase">
                          Leer el relato
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}
