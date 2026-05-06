/**
 * GiftCards / Regalos Page — Editorial Design
 * Route: /giftcards
 * Combines curated gift experience + gift card purchasing
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import {
  getProductsNew,
  getProductNewById,
  getPrimaryImageUrl,
  getProductPrice,
  getTechniqueName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import {
  Gift,
  Mail,
  MessageSquare,
  ShoppingCart,
  Check,
  Heart,
  ArrowRight,
} from "lucide-react";

// ── Featured editorial story — Cauca / Agroarte ─────
const CAUCA_FEATURED_PRODUCT_ID = "963a11d1-98a2-480e-993c-c722b1f248de";

// ── Editorial photography (S3 · hero-images/last-version/artesanos_p) ──
// Drop the exact S3 keys here when available. Until then, the page falls
// back to imagery drawn from real products so no grey placeholders remain.
const ARTESANOS_P_BASE =
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/hero-images/last-version/artesanos_p";
const ARTESANOS_P_FILES: string[] = [
  // e.g. "artesanos_p_1.jpg", "artesanos_p_2.jpg", ...
];
const ARTESANOS_P_IMAGES = ARTESANOS_P_FILES.map(
  (f) => `${ARTESANOS_P_BASE}/${encodeURIComponent(f)}`,
);

// ── Gift card options ───────────────────────────────
const GIFTCARD_OPTIONS = [
  { id: "gc-100k", name: "Gift Card $100.000", amount: 100000 },
  { id: "gc-200k", name: "Gift Card $200.000", amount: 200000 },
  { id: "gc-300k", name: "Gift Card $300.000", amount: 300000 },
  { id: "gc-500k", name: "Gift Card $500.000", amount: 500000 },
  { id: "gc-1m", name: "Gift Card $1.000.000", amount: 1000000 },
  { id: "gc-2m", name: "Gift Card $2.000.000", amount: 2000000 },
];

// ── Gift intention categories ───────────────────────
const GIFT_INTENTIONS = [
  {
    title: "Para el hogar",
    subtitle: "Explorar Piezas",
    slug: "decoracion-del-hogar",
  },
  {
    title: "Para agradecer",
    subtitle: "Detalles Unicos",
    slug: "joyeria-y-accesorios",
  },
  {
    title: "Para celebrar",
    subtitle: "Colecciones",
    slug: "vajillas-y-cocina",
  },
  {
    title: "Ediciones Limitadas",
    subtitle: "Alta Artesania",
    slug: "arte-y-esculturas",
  },
];

interface GiftCardForm {
  recipientEmail: string;
  message: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v);

const GiftCards = () => {
  const { addGiftCardToCart } = useCart();
  const { categoryHierarchy } = useTaxonomy();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, GiftCardForm>>({});
  const [addedCards, setAddedCards] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [caucaProduct, setCaucaProduct] = useState<ProductNewCore | null>(null);

  // Fetch featured products
  useEffect(() => {
    getProductsNew({ page: 1, limit: 100 })
      .then((res) => setProducts(res.data))
      .catch(() => {});
  }, []);

  // Fetch the Cauca / Agroarte featured product for the editorial story
  useEffect(() => {
    getProductNewById(CAUCA_FEATURED_PRODUCT_ID)
      .then((p) => setCaucaProduct(p as ProductNewCore))
      .catch(() => {});
  }, []);

  // Pick 4 varied recommended products
  const recommendations = useMemo(() => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [products]);

  // Pick an editorial image for a given slot index.
  // Prefers curated S3 images from ARTESANOS_P_IMAGES; falls back to real
  // product imagery so no grey placeholders are rendered.
  const editorialImage = (slot: number): string | null => {
    if (ARTESANOS_P_IMAGES[slot]) return ARTESANOS_P_IMAGES[slot];
    const p = products[slot];
    return p ? getPrimaryImageUrl(p) ?? null : null;
  };

  // Image that represents a gift intention (category slug) — first product
  // whose category matches. Falls back to editorialImage() if nothing matches.
  const intentionImage = (slug: string, slot: number): string | null => {
    if (ARTESANOS_P_IMAGES[slot]) return ARTESANOS_P_IMAGES[slot];
    const match = products.find((p) => {
      const cats = p.artisanalIdentity?.curatorialCategory;
      if (cats?.name) {
        const norm = cats.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-");
        if (norm.includes(slug) || slug.includes(norm)) return true;
      }
      return false;
    });
    return (match ? getPrimaryImageUrl(match) : null) ?? editorialImage(slot);
  };

  const caucaImage = caucaProduct
    ? getPrimaryImageUrl(caucaProduct)
    : editorialImage(0);

  const handleFormChange = (
    cardId: string,
    field: keyof GiftCardForm,
    value: string
  ) => {
    setForms((prev) => ({
      ...prev,
      [cardId]: { ...prev[cardId], [field]: value },
    }));
  };

  const handleAddToCart = async (card: (typeof GIFTCARD_OPTIONS)[0]) => {
    const form = forms[card.id] || { recipientEmail: "", message: "" };
    await addGiftCardToCart(
      card.amount,
      form.recipientEmail || undefined,
      form.message || undefined
    );
    setAddedCards((prev) => new Set([...prev, card.id]));
    setTimeout(() => {
      setAddedCards((prev) => {
        const s = new Set(prev);
        s.delete(card.id);
        return s;
      });
    }, 2000);
    setForms((prev) => ({
      ...prev,
      [card.id]: { recipientEmail: "", message: "" },
    }));
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-[#f9f7f2] text-[#1b1c19]">
      {/* Hero Editorial Section */}
      <header className="relative w-full h-[70vh] min-h-[500px] max-h-[820px] flex items-center justify-center overflow-hidden">
        {(() => {
          const heroImg = ARTESANOS_P_IMAGES[0] ?? caucaImage ?? editorialImage(0);
          return heroImg ? (
            <>
              <img
                src={heroImg}
                alt="Regalos con historia"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1b1c19]/30 via-[#1b1c19]/20 to-[#f9f7f2]/90" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[#1b1c19]/5" />
          );
        })()}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <span className="text-[#ec6d13] text-xs uppercase tracking-[0.3em] mb-4 block font-bold">
            Curaduria Exclusiva
          </span>
          <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8">
            Regalos con historia
          </h1>
          <p className="text-lg text-[#584237] max-w-xl mx-auto leading-relaxed">
            Cada pieza es un dialogo entre el artesano y la materia, seleccionada
            para trascender el simple gesto de obsequiar.
          </p>
        </div>
      </header>

      {/* Navigation by Intention (Asymmetric Grid) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-md">
            <h2 className="font-serif text-4xl mb-4">
              Encuentra el detalle perfecto
            </h2>
            <p className="text-[#584237]">
              Navega por nuestras colecciones curadas segun la intencion de tu
              presente.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {GIFT_INTENTIONS.map((intent, i) => {
            const img = intentionImage(intent.slug, i + 1);
            return (
              <Link
                key={intent.slug}
                to={`/productos?categoria=${intent.slug}`}
                className={`group relative aspect-[3/4] bg-[#1b1c19]/5 overflow-hidden rounded-sm cursor-pointer ${
                  i % 2 === 1 ? "md:mt-12" : ""
                }`}
              >
                {img && (
                  <img
                    src={img}
                    alt={intent.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c19]/80 via-[#1b1c19]/20 to-transparent z-10" />
                <div className="absolute bottom-8 left-8 z-20">
                  <h3 className="font-serif text-2xl text-[#f9f7f2]">
                    {intent.title}
                  </h3>
                  <p className="text-[#f9f7f2]/80 text-sm uppercase tracking-widest mt-2 font-bold">
                    {intent.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Curated Selections (Bento Style) */}
      <section className="bg-[#f0eee9] py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="font-serif text-5xl italic mb-6">
              Selecciones Curadas
            </h2>
            <div className="w-24 h-px bg-[#ec6d13] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Large Feature — La Ruta de la Seda (Cauca · Agroarte) */}
            <div className="md:col-span-7 bg-[#f9f7f2] rounded-sm p-12 flex flex-col justify-between min-h-[500px]">
              <div>
                <span className="text-[#ec6d13] font-bold text-xs tracking-widest uppercase mb-4 block">
                  Crónica del Territorio · Cauca
                </span>
                <h3 className="font-serif text-4xl mb-6 leading-tight">
                  La Ruta de la Seda:
                  <br />
                  <span className="italic">de la morera al telar de paz</span>
                </h3>
                <p className="text-[#584237] leading-relaxed mb-4">
                  En las montañas del Cauca, Colteseda y Agroarte tejen una
                  revolución silenciosa. Mujeres cabeza de familia transforman
                  la morera en seda y la hoja de coca en tintes naturales,
                  sustituyendo economías de la guerra por una economía legal,
                  digna y circular.
                </p>
                <p className="text-[#584237] leading-relaxed">
                  Cada pieza de Agroarte lleva el alma de esta transformación:
                  seda hilada a mano, teñida con pigmentos que devuelven a la
                  coca su origen artesanal. Regalar una pieza del Cauca es
                  portar una historia de reconciliación.
                </p>
              </div>
              <div className="mt-8">
                <div className="w-full h-64 mb-8 rounded-sm overflow-hidden bg-[#1b1c19]/5">
                  {caucaImage && (
                    <img
                      src={caucaImage}
                      alt={caucaProduct?.name ?? "Seda del Cauca · Agroarte"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <Link
                    to={
                      caucaProduct
                        ? `/product/${caucaProduct.id}`
                        : `/product/${CAUCA_FEATURED_PRODUCT_ID}`
                    }
                    className="font-bold border-b-2 border-[#ec6d13] pb-1 hover:text-[#ec6d13] transition-colors text-sm uppercase tracking-widest"
                  >
                    Ver la pieza {caucaProduct?.artisanShop?.shopName
                      ? `de ${caucaProduct.artisanShop.shopName}`
                      : "de Agroarte"}
                  </Link>
                  <Link
                    to="/territorio/cauca"
                    className="text-[10px] uppercase tracking-widest font-bold text-[#584237] hover:text-[#ec6d13] transition-colors"
                  >
                    Conocer el territorio →
                  </Link>
                </div>
              </div>
            </div>
            {/* Side Features */}
            <div className="md:col-span-5 flex flex-col gap-8">
              <Link
                to="/tecnicas"
                className="bg-[#f9f7f2] p-8 rounded-sm flex items-center gap-6 group cursor-pointer overflow-hidden"
              >
                {(() => {
                  const img = editorialImage(5);
                  return (
                    <div className="w-24 h-24 shrink-0 rounded-sm overflow-hidden bg-[#1b1c19]/5">
                      {img && (
                        <img
                          src={img}
                          alt="Técnicas ancestrales"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  );
                })()}
                <div>
                  <h4 className="font-serif text-xl mb-1 group-hover:text-[#ec6d13] transition-colors">
                    Tecnicas Ancestrales
                  </h4>
                  <p className="text-xs text-[#584237]">
                    Kits para el coleccionista de arte popular.
                  </p>
                </div>
              </Link>
              <div className="bg-[#1b1c19] p-8 rounded-sm flex flex-col justify-between flex-grow overflow-hidden">
                {(() => {
                  const img = editorialImage(6);
                  return (
                    <div className="w-full h-40 mb-6 rounded-sm overflow-hidden bg-[#f9f7f2]/5">
                      {img && (
                        <img
                          src={img}
                          alt="El arte de empacar"
                          className="w-full h-full object-cover opacity-90"
                        />
                      )}
                    </div>
                  );
                })()}
                <h4 className="font-serif text-2xl text-[#f9f7f2] mb-4">
                  El Arte de Empacar
                </h4>
                <p className="text-[#f9f7f2]/60 text-sm mb-6">
                  Nuestros empaques son piezas de arte por derecho propio,
                  creados en papel de fibra natural.
                </p>
                <span className="text-[#ec6d13] text-xs tracking-widest font-bold uppercase">
                  Ver mas
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Recommendations */}
      {recommendations.length > 0 && (
        <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex justify-between items-baseline mb-16">
            <h2 className="font-serif text-4xl">Recomendaciones de Telar</h2>
            <Link
              to="/productos"
              className="text-sm uppercase tracking-tight border-b border-[#1b1c19] font-bold hover:text-[#ec6d13] hover:border-[#ec6d13] transition-colors"
            >
              Ver todos los productos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {recommendations.map((product) => {
              const imageUrl = getPrimaryImageUrl(product);
              const price = getProductPrice(product);
              const technique = getTechniqueName(product);
              const dept = product.artisanShop?.department;

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group"
                >
                  <div className="relative aspect-[4/5] bg-[#1b1c19]/5 overflow-hidden mb-6 rounded-sm">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    )}
                    <button
                      className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#584237] uppercase tracking-[0.15em]">
                      {dept}
                      {dept && technique && " / "}
                      {technique}
                    </p>
                    <h3 className="font-serif text-lg group-hover:text-[#ec6d13] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#ec6d13] font-bold text-sm">
                      {price ? formatCurrency(price) : "Consultar"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Gift Cards Section */}
      {/* <section className="py-32 bg-white border-y border-[#1b1c19]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <span className="text-[#ec6d13] font-bold text-xs tracking-widest uppercase mb-4 block">
              Tarjetas de Regalo
            </span>
            <h2 className="font-serif text-5xl italic mb-6">
              Regala una Gift Card
            </h2>
            <p className="text-[#584237] max-w-lg mx-auto leading-relaxed">
              El regalo perfecto para quienes aman la artesania colombiana. Deja
              que elijan sus propias piezas unicas.
            </p>
            <div className="w-24 h-px bg-[#ec6d13] mx-auto mt-8" />
          </div>

          <div className="flex flex-wrap justify-center gap-12 mb-16">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4 text-[#ec6d13]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/60">
                Valida en todo el marketplace
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="w-4 h-4 text-[#ec6d13]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/60">
                Saldo multiples compras
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#ec6d13]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/60">
                Entrega por correo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {GIFTCARD_OPTIONS.map((card) => {
              const isSelected = selectedCard === card.id;
              const isAdded = addedCards.has(card.id);

              return (
                <div
                  key={card.id}
                  className={`relative border transition-all duration-300 p-8 ${
                    isSelected
                      ? "border-[#ec6d13] shadow-lg"
                      : "border-[#1b1c19]/10 hover:border-[#1b1c19]/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <Gift className="w-6 h-6 text-[#ec6d13]" />
                    <span className="font-serif text-2xl font-bold">
                      {fmt(card.amount)}
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`email-${card.id}`}
                          className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/60 flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Email destinatario (opcional)
                        </Label>
                        <Input
                          id={`email-${card.id}`}
                          type="email"
                          placeholder="regalo@ejemplo.com"
                          className="bg-[#f9f7f2] border-[#1b1c19]/10 text-sm"
                          value={forms[card.id]?.recipientEmail || ""}
                          onChange={(e) =>
                            handleFormChange(
                              card.id,
                              "recipientEmail",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`msg-${card.id}`}
                          className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/60 flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Dedicatoria (opcional)
                        </Label>
                        <Textarea
                          id={`msg-${card.id}`}
                          placeholder="Feliz cumpleanos! Espero que encuentres algo especial..."
                          className="bg-[#f9f7f2] border-[#1b1c19]/10 text-sm"
                          value={forms[card.id]?.message || ""}
                          onChange={(e) =>
                            handleFormChange(card.id, "message", e.target.value)
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setSelectedCard(null)}
                          className="flex-1 border border-[#1b1c19]/20 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-[#1b1c19] transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleAddToCart(card)}
                          className="flex-1 bg-[#ec6d13] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#2c2c2c] transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Agregar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        isAdded ? null : setSelectedCard(card.id)
                      }
                      disabled={isAdded}
                      className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        isAdded
                          ? "bg-[#2c2c2c] text-white"
                          : "bg-[#2c2c2c] text-white hover:bg-[#ec6d13]"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          Agregada al carrito
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3" />
                          Seleccionar
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      

      {/* Corporate Section */}
      <section className="w-full bg-[#1b1c19] py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="order-2 md:order-1">
            <div className="w-full aspect-square rounded-sm overflow-hidden bg-[#f9f7f2]/5">
              {(() => {
                const img = editorialImage(7);
                return img ? (
                  <img
                    src={img}
                    alt="Regalos corporativos"
                    className="w-full h-full object-cover"
                  />
                ) : null;
              })()}
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-12">
            <div className="space-y-6">
              <span className="text-[#ec6d13] font-bold text-xs tracking-widest uppercase block">
                Servicios B2B
              </span>
              <h2 className="font-serif text-5xl md:text-6xl text-[#f9f7f2] leading-tight">
                Regalos que cuentan su proposito
              </h2>
              <p className="text-[#f9f7f2]/60 text-lg leading-relaxed">
                Elevamos los regalos corporativos a una expresion de cultura y
                responsabilidad. Personalizamos selecciones de alta artesania
                para empresas que valoran la trazabilidad y el impacto social.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <span className="text-[#ec6d13] mt-1">✦</span>
                <div>
                  <h4 className="text-[#f9f7f2] font-bold mb-1">
                    Trazabilidad Total
                  </h4>
                  <p className="text-[#f9f7f2]/50 text-sm">
                    Documentamos la historia de cada artesano involucrado en su
                    pedido.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#ec6d13] mt-1">✦</span>
                <div>
                  <h4 className="text-[#f9f7f2] font-bold mb-1">
                    Curaduria a Medida
                  </h4>
                  <p className="text-[#f9f7f2]/50 text-sm">
                    Adaptamos las piezas a la identidad y valores de su
                    organizacion.
                  </p>
                </div>
              </div>
            </div>
            <a
              href="mailto:hola@telar.co"
              className="inline-block bg-[#ec6d13] text-white px-12 py-5 font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#1b1c19] transition-all"
            >
              Solicitar catalogo corporativo
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl italic">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-10">
          {[
            {
              q: "Como funciona la Gift Card?",
              a: "Al completar la compra, el destinatario recibira un codigo unico por correo electronico. Este codigo se puede usar en el checkout de cualquier compra en el Marketplace de Telar.",
            },
            {
              q: "La Gift Card tiene fecha de vencimiento?",
              a: "Las Gift Cards de Telar no tienen fecha de vencimiento. El saldo permanece disponible hasta que se utilice por completo.",
            },
            {
              q: "Puedo usar la Gift Card en varias compras?",
              a: "Si! Si tu compra es menor al saldo de la Gift Card, el resto queda disponible para futuras compras. Tambien puedes combinarla con otros metodos de pago.",
            },
            {
              q: "Puedo regalar varias Gift Cards a la vez?",
              a: "Absolutamente. Puedes agregar multiples Gift Cards al carrito, cada una con un destinatario y mensaje diferente si lo deseas.",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-[#1b1c19]/5 pb-10">
              <h3 className="font-serif text-xl mb-3">{faq.q}</h3>
              <p className="text-[#584237] leading-relaxed font-light">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="pb-24" />
      <Footer />
    </div>
  );
};

export default GiftCards;
