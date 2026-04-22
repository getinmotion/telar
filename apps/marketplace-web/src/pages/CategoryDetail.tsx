import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import {
  getProductsNew,
  getPrimaryImageUrl,
  getProductPrice,
  getProductStock,
  getMaterialNames,
  getCraftName,
  getTechniqueName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Editorial data per category (visual content that doesn't come from API) ──
interface CategoryEditorial {
  title: string;
  titleAccent: string;
  description: string;
  storyTitle: string;
  storyLocation: string;
  storyText: string;
  storyCTAs: { label: string; href: string }[];
}

const CATEGORY_EDITORIAL: Record<string, CategoryEditorial> = {
  "textiles-y-moda": {
    title: "TEXTILES",
    titleAccent: "& MODA",
    description:
      "Piezas textiles hechas a mano por talleres artesanales de Colombia. Cada pieza conserva una historia, una técnica y un origen cultural.",
    storyTitle: "El tejido en",
    storyLocation: "San Jacinto",
    storyText:
      "San Jacinto, la “tierra de la hamaca grande”, es cuna del telar vertical heredado del Reino Finzenú. Sus tejedoras transforman el algodón en hamacas y caminos de mesa al ritmo de gaitas y cumbia.",
    storyCTAs: [
      { label: "Conoce la historia", href: "/territorio/san-jacinto" },
      { label: "Explorar piezas de San Jacinto", href: "/territorio/san-jacinto" },
    ],
  },
  "joyeria-y-accesorios": {
    title: "JOYERÍA",
    titleAccent: "& ACCESORIOS",
    description:
      "Piezas únicas elaboradas a mano por artesanos colombianos. Cada joya cuenta una historia de tradición, creatividad y conexión cultural.",
    storyTitle: "La filigrana en",
    storyLocation: "Mompox",
    storyText:
      "Mompox es cuna de la filigrana colombiana, una técnica de orfebrería que transforma hilos de plata y oro en obras maestras de delicadeza y precisión.",
    storyCTAs: [
      { label: "Conoce la historia", href: "#" },
      { label: "Explorar joyería de Mompox", href: "#" },
    ],
  },
  "bolsos-y-carteras": {
    title: "BOLSOS",
    titleAccent: "& CARTERAS",
    description:
      "Bolsos y carteras tejidos y elaborados a mano con técnicas ancestrales colombianas. Cada pieza es un lienzo de color, textura y tradición.",
    storyTitle: "El tejido Wayúu en",
    storyLocation: "La Guajira",
    storyText:
      "La Guajira es el hogar de las mochilas Wayúu, tejidas con patrones geométricos que narran historias de la cosmogonía y la vida cotidiana de este pueblo indígena.",
    storyCTAs: [
      { label: "Conoce la historia", href: "#" },
      { label: "Explorar mochilas Wayúu", href: "#" },
    ],
  },
  "decoracion-del-hogar": {
    title: "DECORACIÓN",
    titleAccent: "DEL HOGAR",
    description:
      "Piezas decorativas artesanales que transforman cualquier espacio. Cada objeto trae consigo la calidez y autenticidad de los talleres colombianos.",
    storyTitle: "La cerámica en",
    storyLocation: "Ráquira",
    storyText:
      "Ráquira, pueblo de las ollas, es reconocido por su tradición alfarera que ha dado vida a piezas decorativas únicas durante siglos.",
    storyCTAs: [
      { label: "Conoce la historia", href: "#" },
      { label: "Explorar piezas de Ráquira", href: "#" },
    ],
  },
  "arte-y-esculturas": {
    title: "ARTE",
    titleAccent: "& ESCULTURAS",
    description:
      "Obras de arte y esculturas creadas por maestros artesanos colombianos. Expresiones únicas que capturan la esencia cultural de cada región.",
    storyTitle: "La talla en",
    storyLocation: "Chocó",
    storyText:
      "El Chocó es reconocido por sus talladores de madera y escultores que transforman materias primas de la selva en expresiones artísticas de profundo significado cultural.",
    storyCTAs: [
      { label: "Conoce la historia", href: "#" },
      { label: "Explorar arte del Chocó", href: "#" },
    ],
  },
  "vajillas-y-cocina": {
    title: "VAJILLAS",
    titleAccent: "& COCINA",
    description:
      "Vajillas y utensilios artesanales para la mesa y la cocina. Cada pieza está hecha con el cuidado y la dedicación de manos expertas.",
    storyTitle: "La cerámica en",
    storyLocation: "Carmen de Viboral",
    storyText:
      "Carmen de Viboral es famoso por su cerámica pintada a mano, una tradición que ha convertido a este pueblo antioqueño en referente de la vajilla artesanal colombiana.",
    storyCTAs: [
      { label: "Conoce la historia", href: "#" },
      { label: "Explorar vajillas del Carmen", href: "#" },
    ],
  },
  muebles: {
    title: "MUEBLES",
    titleAccent: "ARTESANALES",
    description:
      "Muebles hechos a mano por maestros carpinteros y artesanos colombianos. Cada pieza combina funcionalidad con el carácter único del trabajo manual.",
    storyTitle: "La ebanistería en",
    storyLocation: "Pasto",
    storyText:
      "Pasto es reconocido por el barniz de Pasto, una técnica de decoración sobre madera que ha sido declarada Patrimonio Cultural Inmaterial de la Humanidad.",
    storyCTAs: [
      { label: "Conoce la historia", href: "#" },
      { label: "Explorar muebles de Pasto", href: "#" },
    ],
  },
  "juguetes-e-instrumentos-musicales": {
    title: "JUGUETES",
    titleAccent: "E INSTRUMENTOS",
    description:
      "Juguetes tradicionales e instrumentos musicales artesanales de Colombia. Piezas que celebran el juego, la música y la tradición cultural.",
    storyTitle: "La luthería en",
    storyLocation: "Chiquinquirá",
    storyText:
      "Chiquinquirá es cuna de la fabricación artesanal de instrumentos musicales, donde luthiers mantienen viva la tradición de dar vida a guitarras, tiples y bandolas.",
    storyCTAs: [
      { label: "Conoce la historia", href: "#" },
      { label: "Explorar instrumentos", href: "#" },
    ],
  },
};

const DEFAULT_EDITORIAL: CategoryEditorial = {
  title: "CATEGORÍA",
  titleAccent: "",
  description: "Explora piezas artesanales colombianas en esta categoría.",
  storyTitle: "La tradición en",
  storyLocation: "Colombia",
  storyText:
    "Colombia es tierra de artesanos. Cada región aporta técnicas, materiales y expresiones únicas que hacen de la artesanía colombiana una de las más ricas del mundo.",
  storyCTAs: [{ label: "Conoce más", href: "#" }],
};

// ── Filter types ─────────────────────────────────────
interface CategoryFilterState {
  technique: string | null;
  material: string | null;
  priceRange: [number, number];
}

// ── Component ────────────────────────────────────────
const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    categoryHierarchy,
    materials: allMaterials,
    crafts: allCrafts,
    loading: taxonomyLoading,
  } = useTaxonomy();

  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<CategoryFilterState>({
    technique: null,
    material: null,
    priceRange: [0, 2000000],
  });
  const [activeFilterChips, setActiveFilterChips] = useState<string[]>([]);

  // Resolve parent category from taxonomy hierarchy
  const parentCategory = useMemo(() => {
    return categoryHierarchy.find((c) => c.slug === slug);
  }, [categoryHierarchy, slug]);

  const categoryName = parentCategory?.name ?? "";
  const editorial = CATEGORY_EDITORIAL[slug ?? ""] ?? DEFAULT_EDITORIAL;

  // Subcategories from real taxonomy
  const subcategories = useMemo(() => {
    return parentCategory?.subcategories ?? [];
  }, [parentCategory]);

  // Fetch products when category or subcategory changes
  useEffect(() => {
    if (!parentCategory) return;

    const targetCategoryId = activeSubcategory
      ? subcategories.find((s) => s.slug === activeSubcategory)?.id
      : parentCategory.id;

    if (!targetCategoryId || !UUID_RE.test(targetCategoryId)) return;

    setProductsLoading(true);
    getProductsNew({
      categoryId: targetCategoryId,
      page: 1,
      limit: 50,
    })
      .then((res) => {
        // res could be paginated or array
        if (Array.isArray(res)) {
          setProducts(res as ProductNewCore[]);
          setTotalProducts((res as ProductNewCore[]).length);
        } else {
          setProducts(res.data ?? []);
          setTotalProducts(res.total ?? 0);
        }
      })
      .catch(() => {
        setProducts([]);
        setTotalProducts(0);
      })
      .finally(() => setProductsLoading(false));
  }, [parentCategory, activeSubcategory, subcategories]);

  // Extract dynamic filter options from loaded products
  const productTechniques = useMemo(() => {
    const all = products
      .map((p) => getTechniqueName(p))
      .filter(Boolean) as string[];
    return [...new Set(all)].sort();
  }, [products]);

  const productMaterials = useMemo(() => {
    const all = products.flatMap((p) => getMaterialNames(p));
    return [...new Set(all)].sort();
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.technique) {
        const tech = getTechniqueName(p);
        if (tech !== filters.technique) return false;
      }
      if (filters.material) {
        const mats = getMaterialNames(p);
        if (!mats.includes(filters.material)) return false;
      }
      const price = getProductPrice(p) ?? 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1])
        return false;
      return true;
    });
  }, [products, filters]);

  const toggleFilter = (type: string, value: string) => {
    const key = type as keyof CategoryFilterState;
    if (key === "priceRange") return;
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
    setActiveFilterChips((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value],
    );
  };

  const clearFilters = () => {
    setFilters({ technique: null, material: null, priceRange: [0, 2000000] });
    setActiveFilterChips([]);
  };

  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">{categoryName || slug}</span>
        </nav>
      </div>

      {/* Editorial Header */}
      <section className="max-w-[1400px] mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-8 border-b border-charcoal/5">
          <div>
            <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-charcoal tracking-tight">
              {editorial.title} <br />
              <span className="italic text-primary">
                {editorial.titleAccent}
              </span>
            </h1>
            <p className="text-sm text-charcoal/70 max-w-md font-sans leading-relaxed">
              {editorial.description}
            </p>
          </div>
          <div className="aspect-[21/6] bg-[#e5e1d8] w-full rounded-sm relative overflow-hidden">
            {parentCategory?.imageUrl && (
              <img
                src={parentCategory.imageUrl}
                alt={categoryName}
                className="w-full h-full object-cover rounded-sm"
              />
            )}
          </div>
        </div>
      </section>

      {/* Subcategory Pills — from real taxonomy */}
      {subcategories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 mb-16 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveSubcategory(null)}
              className={`px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap rounded-full font-sans transition-colors ${
                !activeSubcategory
                  ? "bg-primary text-white"
                  : "border border-charcoal/10 hover:border-primary"
              }`}
            >
              Todos
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() =>
                  setActiveSubcategory(
                    activeSubcategory === sub.slug ? null : sub.slug,
                  )
                }
                className={`px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap rounded-full font-sans transition-colors ${
                  activeSubcategory === sub.slug
                    ? "bg-primary text-white"
                    : "border border-charcoal/10 hover:border-primary"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Product Grid & Filters */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-32 space-y-8">
              {/* Categorías — real taxonomy */}
              <FilterSection title="Categorías" defaultOpen>
                <ul className="pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
                  <li className="text-primary font-bold flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    {categoryName}
                  </li>
                  {categoryHierarchy
                    .filter((c) => c.slug !== slug)
                    .map((c) => (
                      <li key={c.id}>
                        <Link
                          to={`/categoria/${c.slug}`}
                          className="hover:text-primary cursor-pointer transition-colors"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </FilterSection>

              {/* Técnica artesanal — from products */}
              {productTechniques.length > 0 && (
                <FilterSection title="Técnica artesanal" defaultOpen>
                  <ul className="pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
                    {productTechniques.map((t) => (
                      <li
                        key={t}
                        onClick={() => toggleFilter("technique", t)}
                        className={`hover:text-primary cursor-pointer transition-colors flex justify-between ${
                          filters.technique === t
                            ? "font-bold text-charcoal"
                            : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {filters.technique === t && (
                            <span className="w-1 h-1 bg-primary rounded-full" />
                          )}
                          {t}
                        </span>
                      </li>
                    ))}
                  </ul>
                </FilterSection>
              )}

              {/* Material — from products */}
              {productMaterials.length > 0 && (
                <FilterSection title="Material">
                  <ul className="pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
                    {productMaterials.map((m) => (
                      <li
                        key={m}
                        onClick={() => toggleFilter("material", m)}
                        className={`hover:text-primary cursor-pointer transition-colors flex justify-between ${
                          filters.material === m
                            ? "font-bold text-charcoal"
                            : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {filters.material === m && (
                            <span className="w-1 h-1 bg-primary rounded-full" />
                          )}
                          {m}
                        </span>
                      </li>
                    ))}
                  </ul>
                </FilterSection>
              )}

              {/* Precio */}
              <FilterSection title="Precio">
                <div className="pt-6 px-1">
                  <input
                    type="range"
                    className="w-full h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    min={0}
                    max={2000000}
                    step={50000}
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [0, Number(e.target.value)],
                      }))
                    }
                  />
                  <div className="flex justify-between mt-4 text-[10px] font-bold font-sans uppercase">
                    <span>{formatCurrency(0)}</span>
                    <span>{formatCurrency(filters.priceRange[1])}</span>
                  </div>
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Main Listing */}
          <div className="flex-1">
            <div className="flex flex-col gap-8 mb-12">
              {/* Active Filters */}
              {activeFilterChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 border-b border-charcoal/5 pb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">
                    Filtros activos:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeFilterChips.map((chip) => (
                      <span
                        key={chip}
                        className="bg-charcoal text-white text-[9px] px-3 py-1 flex items-center gap-2 rounded-full font-bold uppercase tracking-wider"
                      >
                        {chip}
                        <button
                          onClick={() => {
                            if (filters.technique === chip)
                              toggleFilter("technique", chip);
                            else if (filters.material === chip)
                              toggleFilter("material", chip);
                          }}
                          className="text-white/70 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={clearFilters}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary hover:opacity-70 transition-opacity ml-2"
                    >
                      Limpiar todo
                    </button>
                  </div>
                </div>
              )}

              {/* Sort & View Bar */}
              <div className="flex justify-between items-center">
                <span className="text-[11px] uppercase tracking-[0.2em] text-charcoal/50 font-sans">
                  Mostrando {filteredProducts.length} de {totalProducts} piezas
                  artesanales
                </span>
              </div>
            </div>

            {/* Product Grid */}
            {productsLoading || taxonomyLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-24">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-[#e5e1d8] aspect-[3/4] mb-6 rounded-sm" />
                    <div className="h-4 bg-[#e5e1d8] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#e5e1d8] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-16">
                {filteredProducts.map((product, idx) => (
                  <ProductNewCard
                    key={product.id}
                    product={product}
                    className={
                      idx % 3 === 1
                        ? "md:mt-16"
                        : idx % 3 === 2
                          ? "md:-mt-8"
                          : ""
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <p className="text-charcoal/40 text-sm font-sans">
                  No se encontraron piezas en esta categoría.
                </p>
              </div>
            )}

            {/* Load more */}
            {filteredProducts.length > 0 &&
              totalProducts > filteredProducts.length && (
                <div className="mt-32 flex justify-center">
                  <button className="border border-primary text-primary px-16 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all font-sans rounded-sm">
                    Explorar más piezas ({totalProducts} totales)
                  </button>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Editorial Story Block */}
      <section className="bg-primary/5 py-32 mb-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="aspect-[5/6] w-full bg-[#e5e1d8] shadow-2xl rounded-sm" />
            <div className="space-y-10">
              <h2 className="text-5xl md:text-7xl font-serif leading-tight">
                {editorial.storyTitle} <br />
                <span className="italic">{editorial.storyLocation}</span>
              </h2>
              <p className="text-xl text-charcoal/70 leading-relaxed font-sans font-light">
                {editorial.storyText}
              </p>
              <div className="flex flex-col sm:flex-row gap-8 pt-6">
                {editorial.storyCTAs.map((cta, i) => (
                  <a
                    key={i}
                    href={cta.href}
                    className={`text-[11px] font-bold uppercase tracking-[0.3em] border-b-2 ${
                      i === 0
                        ? "border-primary"
                        : "border-charcoal hover:border-primary"
                    } pb-2 inline-block self-start hover:text-primary transition-colors font-sans`}
                  >
                    {cta.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Talleres Destacados */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-serif text-4xl mb-2">
              Talleres Destacados
            </h2>
            <p className="text-charcoal/50 text-sm font-medium font-sans">
              Maestros del oficio y la tradición artesanal.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="border border-charcoal/10 p-2 rounded-full hover:bg-charcoal/5 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="border border-charcoal/10 p-2 rounded-full hover:bg-charcoal/5 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Extract unique shops from loaded products */}
          {(() => {
            const shopsMap = new Map<
              string,
              NonNullable<ProductNewCore["artisanShop"]>
            >();
            products.forEach((p) => {
              if (p.artisanShop && !shopsMap.has(p.artisanShop.id)) {
                shopsMap.set(p.artisanShop.id, p.artisanShop);
              }
            });
            const shops = Array.from(shopsMap.values()).slice(0, 3);

            if (shops.length === 0) {
              return [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-sm border border-primary/10"
                >
                  <div className="w-full aspect-square bg-[#e5e1d8] rounded-sm mb-8" />
                  <div className="h-5 bg-[#e5e1d8] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#e5e1d8] rounded w-1/2" />
                </div>
              ));
            }

            return shops.map((shop) => (
              <Link
                key={shop.id}
                to={`/artesano/${shop.shopSlug}`}
                className="bg-white p-8 rounded-sm border border-primary/10 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="w-full aspect-square bg-[#e5e1d8] rounded-sm mb-8 overflow-hidden">
                  {shop.logoUrl && (
                    <img
                      src={shop.logoUrl}
                      alt={shop.shopName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="font-bold text-xl mb-1 font-sans">
                  {shop.shopName}
                </h3>
                <p className="text-primary text-[10px] uppercase tracking-widest mb-4 font-bold font-sans">
                  {shop.department ?? ""}
                </p>
              </Link>
            ));
          })()}
        </div>
      </section>

      {/* Piezas para regalar */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="relative rounded-sm overflow-hidden h-[450px] flex items-center px-16 group">
          <div className="absolute inset-0 bg-[#e5e1d8]" />
          <div className="relative z-10 max-w-xl">
            <h2 className="font-serif text-6xl mb-6 leading-tight text-charcoal">
              Piezas para regalar
            </h2>
            <p className="text-xl mb-10 font-sans text-charcoal/80">
              Selección curada de textiles artesanales para momentos especiales.
            </p>
            <Link
              to="/giftcards"
              className="bg-primary text-white px-12 py-5 font-bold text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-primary/90 transition-all font-sans inline-block"
            >
              VER TODO
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// ── Product Card for new architecture ────────────────
function ProductNewCard({
  product,
  className = "",
}: {
  product: ProductNewCore;
  className?: string;
}) {
  const imageUrl = getPrimaryImageUrl(product);
  const price = getProductPrice(product);
  const craft = getCraftName(product);
  const technique = getTechniqueName(product);
  const stock = getProductStock(product);
  const shopName = product.artisanShop?.shopName;

  return (
    <div className={className}>
      <Link
        to={`/product/${product.id}`}
        className="group block"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] bg-[#e5e1d8] mb-6 rounded-sm overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal/20 text-sm font-sans">
              Sin imagen
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.status === "published" && stock > 0 && (
              <span className="bg-charcoal text-white text-[8px] px-3 py-1 uppercase tracking-widest font-bold rounded-sm">
                Disponible
              </span>
            )}
            {stock === 0 && (
              <span className="bg-charcoal/50 text-white text-[8px] px-3 py-1 uppercase tracking-widest font-bold rounded-sm">
                Agotado
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 text-charcoal" />
          </button>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-bold text-base mb-1 font-sans leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {shopName && (
            <p className="text-[10px] text-charcoal/50 uppercase tracking-widest mb-2 font-sans">
              {shopName}
            </p>
          )}
          {technique && (
            <p className="text-[10px] text-charcoal/40 uppercase tracking-widest mb-3 font-sans">
              {technique}
              {craft ? ` · ${craft}` : ""}
            </p>
          )}
          {price != null && (
            <p className="text-lg font-bold text-charcoal font-sans">
              {formatCurrency(price)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

// ── Filter Section Component ─────────────────────────
function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-primary/20 pb-4">
      <details className="group" open={defaultOpen || undefined}>
        <summary className="flex justify-between items-center cursor-pointer list-none py-2">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold font-sans">
            {title}
          </h3>
          <span className="text-lg group-open:rotate-180 transition-transform select-none">
            ▾
          </span>
        </summary>
        {children}
      </details>
    </div>
  );
}

export default CategoryDetail;
