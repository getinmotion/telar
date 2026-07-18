/**
 * ProductDetail — Editorial design matching reference HTML
 * Route: /product/:id
 */

import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import {
  Heart,
  X,
  Sparkles,
  MapPin,
  Quote,
  BookOpen,
  Hammer,
  Ruler,
  Layers,
  Wrench,
  ClipboardCheck,
  Scissors,
  Clock,
  Droplets,
} from "lucide-react";

/** Parte un texto multilinea en ítems, tolerando bullets legacy ("• ", "- ") */
const toLines = (s?: string | null): string[] =>
  (s ?? "")
    .split(/\n+/)
    .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ProductVariants } from "@/components/ProductVariants";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductPurchaseButton } from "@/components/ProductPurchaseButton";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currencyUtils";
import { geocodeArtisan } from "@/lib/colombia-geocodes";
import { Product, MarketplaceVariant } from "@/types/products.types";
import { ArtisanShop } from "@/types/artisan-shops.types";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const PIECE_TYPE_LABELS: Record<string, string> = {
  funcional: "Funcional",
  decorativa: "Decorativa",
  ritual: "Ritual",
  coleccionable: "Coleccionable",
};

const STYLE_LABELS: Record<string, string> = {
  tradicional: "Tradicional",
  contemporaneo: "Contemporáneo",
  fusion: "Fusión",
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl =
    (location.state as { returnUrl?: string })?.returnUrl ||
    sessionStorage.getItem("productsReturnUrl") ||
    "";
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<ArtisanShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingShop, setLoadingShop] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<MarketplaceVariant | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { fetchShopById } = useArtisanShops();
  const { fetchProductById } = useProducts();
  const isFavorite = product ? isInWishlist(product.id) : false;
  const shopCoords = useMemo(() => (shop ? geocodeArtisan(shop) : null), [shop]);

  // Reset scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const productData = await fetchProductById(id);
      if (productData) {
        const realStock = productData?.stock || productData.inventory || 0;
        const storeReadyToPurchase = productData.canPurchase ?? false;
        const realCanPurchase = storeReadyToPurchase && realStock > 0;
        setProduct({ ...productData, stock: realStock, canPurchase: realCanPurchase });
        if (productData.shopId) fetchShopInfo(productData.shopId);
      }
    } catch {
      // handled by context
    } finally {
      setLoading(false);
    }
  };

  const fetchShopInfo = async (shopId: string) => {
    setLoadingShop(true);
    try {
      const shopData = await fetchShopById(shopId);
      if (shopData) setShop(shopData);
    } catch (err) {
      console.error("Error fetching shop:", err);
    } finally {
      setLoadingShop(false);
    }
  };

  const getFinalPrice = () => {
    if (!product) return 0;
    return selectedVariant ? selectedVariant.price : parseFloat(product.price);
  };

  // ¿El producto tiene variantes reales que exigen selección?
  const activeVariantsWithOptions = (product?.variants ?? []).filter(
    (v) => v.isActive && Object.keys(v.optionValues).length > 0,
  );
  const needsVariantSelection =
    activeVariantsWithOptions.length > 1 && !selectedVariant;
  const hasPriceRange =
    !!product?.priceMax && product.priceMax > parseFloat(product.price);

  const maxStock = selectedVariant?.stock ?? product?.stock ?? 0;

  // Disponibilidad comercial (availabilityType de producción)
  const availabilityInfo = (() => {
    switch (product?.availabilityType) {
      case "pieza_unica":
        return { label: "Pieza única", note: "Existe un solo ejemplar de esta pieza." };
      case "edicion_limitada":
        return { label: "Edición limitada", note: null };
      case "bajo_pedido":
        return {
          label: "Hecha bajo pedido",
          note: product?.leadTimeDays
            ? `Se elabora cuando la ordenas · aprox. ${product.leadTimeDays} días`
            : product?.productionTime
              ? `Se elabora cuando la ordenas · ${product.productionTime}`
              : "Se elabora cuando la ordenas",
        };
      default:
        return null;
    }
  })();

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1e6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f1e6] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif italic text-[#2b2f26]">
            Producto no encontrado
          </h1>
          <Link
            to="/"
            className="inline-block bg-[#2b2f26] text-white px-8 py-3 uppercase text-xs tracking-widest hover:bg-[#2e5424] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  // La foto de la variante seleccionada encabeza la galería (sin duplicarla)
  const galleryImages = selectedVariant?.imageUrl
    ? [
        selectedVariant.imageUrl,
        ...productImages.filter((img) => img !== selectedVariant.imageUrl),
      ]
    : productImages;

  return (
    <div className="min-h-screen bg-[#f5f1e6] text-[#2b2f26] font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* ═══════════════ PRODUCT HERO ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery
              key={selectedVariant?.imageUrl ?? "base"}
              images={galleryImages}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            {/* Taller label */}
            {product.storeName && (
              <Link
                to={product.storeSlug ? `/tienda/${product.storeSlug}` : "#"}
                className="mb-2 text-[#2e5424] font-bold tracking-widest text-[10px] uppercase hover:underline"
              >
                Taller: {product.storeName}
              </Link>
            )}

            <div className="flex flex-col gap-4 mb-6">
              {/* Title + subtitle */}
              <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-serif italic text-[#2b2f26]">
                  {product.name}
                </h2>
                {(shop?.region || product.storeName) && (
                  <p className="text-sm text-[#2b2f26]/80 italic">
                    Hecho a mano en {shop?.municipality || shop?.region || "Colombia"}
                    {shop?.department ? `, ${shop.department}` : ""} por el taller{" "}
                    {product.storeName}
                  </p>
                )}
                {product.isCollaboration && product.collaborationName && (
                  <p className="text-sm text-[#2b2f26]/60 italic">
                    En colaboración con {product.collaborationName}
                  </p>
                )}

                {/* Authenticity badges */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowComingSoon(true)}
                    className="bg-[#2b2f26] text-white text-[9px] px-2 py-1 uppercase tracking-widest hover:bg-[#2b2f26]/80 transition-colors"
                  >
                    Huella Digital Registrada
                  </button>
                  <button
                    onClick={() => setShowComingSoon(true)}
                    className="bg-[#2e5424] text-white text-[9px] px-2 py-1 uppercase tracking-widest hover:bg-[#2e5424]/80 transition-colors"
                  >
                    Certificado de autenticidad COCREA
                  </button>
                </div>
              </div>

              {/* Certificate link */}
              <button
                onClick={() => setShowComingSoon(true)}
                className="text-xs text-[#2b2f26]/60 underline underline-offset-4 hover:text-[#2e5424] transition-colors font-bold w-fit"
              >
                Ver certificado de autenticidad
              </button>
              <p className="text-[10px] text-[#2b2f26]/40 max-w-xs leading-relaxed">
                Al adquirir esta pieza, usted recibe un certificado de autenticidad
                digital que garantiza su origen y autoría.
              </p>

              {/* Coming Soon Card */}
              {showComingSoon && (
                <div className="relative border border-[#2e5424]/30 bg-[#2e5424]/5 p-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button
                    onClick={() => setShowComingSoon(false)}
                    className="absolute top-3 right-3 text-[#2b2f26]/40 hover:text-[#2b2f26] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#2e5424]" />
                    <h4 className="font-serif italic text-lg">Próximamente</h4>
                  </div>
                  <p className="text-sm text-[#2b2f26]/70 leading-relaxed">
                    Estamos construyendo un sistema de certificados digitales que
                    permitirá verificar la autenticidad, el origen y la trazabilidad
                    de cada pieza artesanal.
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-[#2b2f26]/40 font-bold">
                    Lanzamiento próximo · 2026
                  </p>
                </div>
              )}
            </div>

            {/* Location + Category */}
            <div className="flex flex-wrap gap-2 mb-8 text-xs text-[#2b2f26]/50 uppercase tracking-widest font-bold">
              {(shop?.municipality || shop?.region || product.department) && (
                <span>
                  {shop?.municipality || shop?.region || product.department}
                  {shop?.department ? `, ${shop.department}` : ""} — Colombia
                </span>
              )}
              {product.category && (
                <>
                  <span>•</span>
                  <span>{product.category}</span>
                </>
              )}
              {product.subcategoryName && (
                <>
                  <span>•</span>
                  <span>{product.subcategoryName}</span>
                </>
              )}
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-12">
              <span className="border border-[#2b2f26]/10 text-[#2b2f26]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                Hecho a mano en Colombia
              </span>
              {product.craft && (
                <span className="border border-[#2b2f26]/10 text-[#2b2f26]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {product.craft}
                </span>
              )}
              {product.materials && product.materials.length > 0 && (
                <span className="border border-[#2b2f26]/10 text-[#2b2f26]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {product.materials.slice(0, 2).join(" · ")}
                </span>
              )}
              {product.pieceType && (
                <span className="border border-[#2b2f26]/10 text-[#2b2f26]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {PIECE_TYPE_LABELS[product.pieceType] ?? product.pieceType}
                </span>
              )}
              {(product.styles ?? []).map((style) => (
                <span
                  key={style}
                  className="border border-[#2b2f26]/10 text-[#2b2f26]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest"
                >
                  {STYLE_LABELS[style] ?? style}
                </span>
              ))}
              {product.history && (
                <span className="border border-[#2b2f26]/10 text-[#2b2f26]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  Pieza con historia
                </span>
              )}
              {(product.badges ?? []).map((badge) => (
                <span
                  key={badge.id}
                  className="border border-[#2e5424]/30 text-[#2e5424] px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold"
                >
                  {badge.name}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="text-4xl font-serif mb-12 text-[#2b2f26]">
              {!selectedVariant && hasPriceRange && (
                <span className="text-lg text-[#2b2f26]/50 italic mr-2">Desde</span>
              )}
              {formatCurrency(getFinalPrice())}
            </div>

            {/* Availability */}
            {availabilityInfo && (
              <div className="mb-8 -mt-6 flex flex-wrap items-center gap-3">
                <span className="bg-[#2b2f26] text-white px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold">
                  {availabilityInfo.label}
                </span>
                {availabilityInfo.note && (
                  <span className="text-xs text-[#2b2f26]/50 italic">
                    {availabilityInfo.note}
                  </span>
                )}
              </div>
            )}

            {/* Variants */}
            <div className="mb-8">
              <ProductVariants
                variants={product.variants ?? []}
                onVariantSelect={(variant) => {
                  setSelectedVariant(variant);
                  setQuantity(1);
                }}
              />
            </div>

            {/* Quantity */}
            {maxStock > 0 && (
              <div className="mb-6 flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#2b2f26]/40">
                  Cantidad
                </span>
                <div className="flex items-center border border-[#2b2f26]/10">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-[#2b2f26]/60 hover:text-[#2b2f26] transition-colors disabled:opacity-30"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-bold border-x border-[#2b2f26]/10">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-[#2b2f26]/60 hover:text-[#2b2f26] transition-colors disabled:opacity-30"
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock}
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#2b2f26]/40 italic">
                  {maxStock <= 3
                    ? `¡Solo ${maxStock} disponible${maxStock > 1 ? "s" : ""}!`
                    : maxStock > 10
                      ? "+10 disponibles"
                      : `${maxStock} disponibles`}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 mb-10">
              <ProductPurchaseButton
                productId={product.id}
                productName={product.name}
                canPurchase={product.canPurchase ?? true}
                stock={product.stock}
                quantity={quantity}
                variantId={selectedVariant?.id}
                requiresVariantSelection={needsVariantSelection}
                variant="detail"
              />
              <button
                className="w-full border border-[#2b2f26]/20 text-[#2b2f26] font-bold py-5 uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[#2b2f26] transition-all"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-[#2e5424] text-[#2e5424]" : ""}`}
                />
                {isFavorite ? "Guardado" : "Guardar"}
              </button>
            </div>

            {/* Handmade notice */}
            <p className="text-xs text-[#2b2f26]/60 leading-relaxed italic border-l border-[#2e5424]/30 pl-4">
              "Las piezas hechas a mano pueden tener tiempos de preparación
              diferentes dependiendo del proceso artesanal."
            </p>
          </div>
        </div>

        {/* ═══════════════ DESCRIPCIÓN ═══════════════ */}
        {product.shortDescription && (
          <section className="max-w-3xl mx-auto text-center mb-24 py-12 border-y border-[#2b2f26]/5">
            <span className="inline-flex items-center gap-2 text-[#2e5424] font-bold uppercase text-[10px] tracking-[0.3em] mb-6">
              <Quote className="w-4 h-4" />
              Descripción
            </span>
            <blockquote className="font-serif text-xl lg:text-2xl text-[#2b2f26] leading-relaxed italic px-8">
              {product.shortDescription}
            </blockquote>
          </section>
        )}

        {/* ═══════════════ STORY OF THE PIECE ═══════════════ */}
        {product.history && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-center bg-white rounded-3xl p-8 lg:p-16 shadow-sm">
            <div>
              <span className="inline-flex items-center gap-2 text-[#2e5424] font-bold uppercase text-[10px] tracking-[0.3em] mb-4">
                <BookOpen className="w-4 h-4" />
                Historia
              </span>
              <h3 className="text-4xl font-serif mb-8 text-[#2b2f26]">
                Historia de la pieza
              </h3>
              <div className="space-y-6 text-[#2b2f26]/70 leading-relaxed text-lg font-light italic whitespace-pre-line">
                {product.history}
              </div>
            </div>
            {productImages[1] && (
              <div className="aspect-[4/3] bg-[#e5e1d8] rounded-2xl overflow-hidden">
                <img
                  src={productImages[1]}
                  alt="Detalle artesanal"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </section>
        )}

        {/* ═══════════════ PROCESS + DETAILS ═══════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8 border-y border-[#2b2f26]/10 py-16">
          {/* Proceso artesanal */}
          <div className="space-y-6">
            <h5 className="flex items-center gap-2 text-xl font-serif italic text-[#2b2f26]">
              <Hammer className="w-5 h-5 text-[#2e5424]" />
              Proceso artesanal
            </h5>
            <ul className="space-y-5 text-sm text-[#2b2f26]/70">
              {(product.materials?.length > 0 || product.material) && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2e5424]/10">
                    <Layers className="w-4 h-4 text-[#2e5424]" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Materiales
                    </span>
                    <span className="italic">
                      {(product.materialsDetailed ?? []).some((m) => m.percentage != null)
                        ? product.materialsDetailed!
                            .map((m) =>
                              m.percentage != null ? `${m.name} (${m.percentage}%)` : m.name
                            )
                            .join(", ")
                        : product.materials?.join(", ") || product.material}
                    </span>
                  </span>
                </li>
              )}
              {(product.tools?.length ?? 0) > 0 && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2e5424]/10">
                    <Wrench className="w-4 h-4 text-[#2e5424]" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Herramientas
                    </span>
                    <span className="italic">{product.tools!.join(", ")}</span>
                  </span>
                </li>
              )}
              {product.requirementsToStart && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2e5424]/10">
                    <ClipboardCheck className="w-4 h-4 text-[#2e5424]" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Requisitos para iniciar
                    </span>
                    <span className="italic">{product.requirementsToStart}</span>
                  </span>
                </li>
              )}
              {(product.techniques?.length > 0 || product.craft) && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2e5424]/10">
                    <Scissors className="w-4 h-4 text-[#2e5424]" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Técnica
                    </span>
                    <span className="italic">
                      {product.techniques?.length > 0
                        ? product.techniques.join(", ")
                        : product.craft}
                    </span>
                  </span>
                </li>
              )}
              {(product.leadTimeDays || product.productionTime) && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2e5424]/10">
                    <Clock className="w-4 h-4 text-[#2e5424]" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Tiempo de elaboración
                    </span>
                    <span className="italic">
                      {product.leadTimeDays
                        ? `Aproximadamente ${product.leadTimeDays} día${product.leadTimeDays > 1 ? "s" : ""}`
                        : product.productionTime}
                    </span>
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Detalles técnicos — ficha técnica destacada */}
          <div className="space-y-6 bg-white rounded-2xl border border-[#2b2f26]/10 shadow-sm p-8">
            <h5 className="flex items-center gap-2 text-xl font-serif italic text-[#2b2f26]">
              <Ruler className="w-5 h-5 text-[#2e5424]" />
              Ficha técnica
            </h5>
            <ul className="space-y-4 text-sm text-[#2b2f26]/70">
              {(() => {
                const d = product.dimensions;
                if (!d) return null;
                if (typeof d === "string") {
                  return (
                    <li className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                        Dimensiones
                      </span>
                      <span className="italic">{d}</span>
                    </li>
                  );
                }
                const parts = [d.length, d.width, d.height].filter(
                  (v): v is number => typeof v === "number" && v > 0,
                );
                if (parts.length === 0) return null;
                return (
                  <li className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Dimensiones
                    </span>
                    <span className="italic">{parts.join(" × ")} cm</span>
                  </li>
                );
              })()}
              {product.weight && parseFloat(product.weight) > 0 && (
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Peso
                  </span>
                  <span className="italic">
                    {parseFloat(product.weight).toFixed(2)} kg
                  </span>
                </li>
              )}
              {product.monthlyCapacity != null && (
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Capacidad mensual
                  </span>
                  <span className="italic">
                    {product.monthlyCapacity} unidad{product.monthlyCapacity !== 1 ? "es" : ""}/mes
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Cuidados y uso */}
          {(product.careNotes || product.usageSuggestions) && (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl border border-[#2b2f26]/10 shadow-sm p-8">
              {toLines(product.careNotes).length > 0 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Para que dure toda la vida
                    </span>
                    <h5 className="flex items-center gap-2 text-xl font-serif italic text-[#2b2f26] mt-1">
                      <Droplets className="w-5 h-5 text-[#2e5424]" />
                      Cuidados
                    </h5>
                  </div>
                  <ul className="space-y-3 text-sm text-[#2b2f26]/70">
                    {toLines(product.careNotes).map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2e5424]/10">
                          <Droplets className="w-4 h-4 text-[#2e5424]" />
                        </span>
                        <span className="italic pt-1.5">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {toLines(product.usageSuggestions).length > 0 && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Cómo disfrutarla
                    </span>
                    <h5 className="flex items-center gap-2 text-xl font-serif italic text-[#2b2f26] mt-1">
                      <Sparkles className="w-5 h-5 text-[#2e5424]" />
                      Sugerencias de uso
                    </h5>
                  </div>
                  <ul className="space-y-3 text-sm text-[#2b2f26]/70">
                    {toLines(product.usageSuggestions).map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2e5424]/10">
                          <Sparkles className="w-4 h-4 text-[#2e5424]" />
                        </span>
                        <span className="italic pt-1.5">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Así se hizo esta pieza */}
          {(product.processDescription ||
            (product.processEvidenceUrls?.length ?? 0) > 0) && (
            <div className="md:col-span-2 space-y-6 pt-12 border-t border-[#2b2f26]/10">
              <h5 className="text-xl font-serif italic text-[#2b2f26]">
                Así se hizo esta pieza
              </h5>
              {product.processDescription && (
                <p className="text-sm text-[#2b2f26]/70 leading-relaxed italic max-w-3xl whitespace-pre-line">
                  {product.processDescription}
                </p>
              )}
              {(product.processEvidenceUrls?.length ?? 0) > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.processEvidenceUrls!.map((url) => (
                    <div
                      key={url}
                      className="aspect-square bg-[#e5e1d8] rounded-xl overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Proceso de elaboración de ${product.name}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Envío consciente — nota breve, no compite con la ficha técnica */}
        <p className="text-xs text-[#2b2f26]/50 italic text-center max-w-2xl mx-auto mb-24">
          Envío consciente: las piezas se preparan cuidadosamente respetando
          tanto la integridad de la creación como el impacto ambiental del
          proceso.
        </p>

        {/* ═══════════════ DIGITAL TRACEABILITY (franja compacta) ═══════════════ */}
        <section className="mb-24 bg-[#2b2f26] text-white py-8 px-6 rounded-2xl">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 max-w-4xl mx-auto text-sm">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">
              Huella digital de la pieza
            </span>
            {(shop?.municipality || shop?.region || product.department) && (
              <span className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-[#2e5424]" />
                {shop?.municipality || shop?.region || product.department}
                {shop?.department ? `, ${shop.department}` : ""}
              </span>
            )}
            {product.storeName && (
              <span className="flex items-center gap-2 text-white/80">
                <Hammer className="w-4 h-4 text-[#2e5424]" />
                {product.storeName}
              </span>
            )}
            {product.craft && (
              <span className="flex items-center gap-2 text-white/80">
                <Sparkles className="w-4 h-4 text-[#2e5424]" />
                {product.craft}
              </span>
            )}
          </div>
        </section>

        {/* ═══════════════ CULTURAL RECORD + MAP ═══════════════ */}
        {(shop?.region || shop?.municipality) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl mb-24 bg-white border border-[#2b2f26]/5 shadow-sm">
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <span className="text-[#2e5424] font-bold mb-4 uppercase text-[11px] tracking-[0.3em]">
                Registro cultural
              </span>
              <h3 className="text-4xl font-serif text-[#2b2f26] mb-8">
                {shop?.municipality || shop?.region}
                {shop?.department ? `, ${shop.department}` : ""}
              </h3>
              {shop?.description && (
                <p className="text-[#2b2f26]/70 leading-relaxed mb-10 text-lg font-light italic">
                  {shop.description}
                </p>
              )}
              <div className="flex flex-col gap-4">
                {product.craft && (
                  <div className="flex justify-between border-b border-[#2b2f26]/10 pb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Tradición
                    </span>
                    <span className="text-sm italic">{product.craft}</span>
                  </div>
                )}
                {(shop?.department || shop?.region) && (
                  <div className="flex justify-between border-b border-[#2b2f26]/10 pb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Ubicación
                    </span>
                    <span className="text-sm italic">
                      {shop?.department || shop?.region}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[#e5e1d8] min-h-[400px] relative">
              {shopCoords ? (
                <Map
                  initialViewState={{
                    longitude: shopCoords.lng,
                    latitude: shopCoords.lat,
                    zoom: 10,
                  }}
                  mapStyle={MAP_STYLE}
                  dragPan={false}
                  scrollZoom={false}
                  doubleClickZoom={false}
                  attributionControl={false}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Marker longitude={shopCoords.lng} latitude={shopCoords.lat}>
                    <MapPin className="w-8 h-8 text-[#2e5424] fill-[#2e5424]/20" />
                  </Marker>
                </Map>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-[#2e5424] opacity-40" />
                </div>
              )}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md pointer-events-none">
                <p className="text-sm font-semibold text-[#2b2f26]">
                  {shop?.municipality || shop?.region || "Colombia"}
                </p>
                <p className="text-xs text-[#2b2f26]/50 mt-1">
                  Origen artesanal
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ ARTISAN PROFILE ═══════════════ */}
        {/*
          Identidad artesanal: solo se renderiza si la tienda tiene datos reales
          que mostrar. Fuentes (en orden de preferencia):
            - shop.aboutContent.story  (about_content jsonb del API)
            - shop.story               (story columna directa)
            - shop.description         (descripción breve)
          Si nada existe, NO mostramos texto genérico hardcoded — preferimos
          ocultar la sección a inventar copy.
        */}
        {(() => {
          const aboutStory = shop?.aboutContent?.story?.trim();
          const directStory = shop?.story?.trim();
          const description = shop?.description?.trim();
          const identityStory = aboutStory || directStory || description || null;
          const claim = shop?.brandClaim?.trim() || shop?.aboutContent?.title?.trim() || null;
          // Si no hay tienda real ni copy alguno, no renderizamos la sección.
          if (!product.storeName || (!identityStory && !claim && !shop?.bannerUrl && !shop?.logoUrl)) {
            return null;
          }
          return (
            <section className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="aspect-square bg-[#e5e1d8] rounded-2xl overflow-hidden">
                  {shop?.bannerUrl ? (
                    <img
                      src={shop.bannerUrl}
                      alt={product.storeName}
                      className="w-full h-full object-cover"
                    />
                  ) : shop?.logoUrl ? (
                    <img
                      src={shop.logoUrl}
                      alt={product.storeName}
                      className="w-full h-full object-contain p-12"
                    />
                  ) : null}
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                <div>
                  <span className="text-[#2e5424] font-bold uppercase text-[10px] tracking-[0.3em] mb-4 block">
                    Conoce al artesano
                  </span>
                  <h3 className="text-4xl font-serif text-[#2b2f26] mb-6">
                    {claim || `El taller que creó esta pieza`}
                  </h3>
                  <h4 className="text-2xl font-serif italic text-[#2b2f26]/80 mb-6">
                    {product.storeName}
                  </h4>
                </div>
                {identityStory && (
                  <div className="space-y-4 text-[#2b2f26]/70 text-lg font-light italic leading-relaxed">
                    <p>{identityStory}</p>
                  </div>
                )}
                {shop?.certifications && shop.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {shop.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#2b2f26]/15 text-[#2b2f26]/70"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to={shop?.shopSlug ? `/artesano/${shop.shopSlug}` : product.storeSlug ? `/artesano/${product.storeSlug}` : "#"}
                  className="inline-block border border-[#2b2f26] text-[#2b2f26] px-10 py-4 uppercase text-[11px] font-bold tracking-[0.2em] hover:bg-[#2b2f26] hover:text-white transition-all"
                >
                  Ver perfil del taller
                </Link>
              </div>
            </section>
          );
        })()}

        {/* ═══════════════ FAIR TRADE BLOCK ═══════════════ */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 bg-[#2b2f26] rounded-2xl overflow-hidden shadow-lg">
          <div className="h-40 bg-[#e5e1d8] relative overflow-hidden">
            {productImages[0] && (
              <img
                src={productImages[0]}
                alt="Comercio justo"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-8 lg:p-12 flex flex-col justify-center items-start bg-black">
            <h3 className="text-2xl lg:text-3xl font-serif text-white mb-3 italic">
              Comercio justo
            </h3>
            <p className="text-base text-white/70 mb-6 font-light italic leading-relaxed">
              Trabajamos directamente con talleres artesanales para que las
              personas que crean cada pieza reciban una compensación justa por su
              trabajo.
            </p>
            <Link
              to="/newsletter"
              className="inline-block bg-[#2e5424] text-white px-6 py-3 font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-[#2b2f26] transition-all"
            >
              Conoce más de Cocrea
            </Link>
          </div>
        </section>

        {/* ═══════════════ GIFT BLOCK ═══════════════ */}
        <section className="relative bg-[#20291a] text-white rounded-2xl overflow-hidden mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[20vh]">
            <div className="p-8 lg:p-12 flex flex-col justify-center items-start z-10">
              <h3 className="text-2xl lg:text-3xl font-serif italic text-white mb-3">
                ¿Es para un regalo?
              </h3>
              <p className="text-base text-white/70 mb-6 font-light italic leading-relaxed max-w-md">
                Ofrecemos opciones de empaque especial que cuentan la historia de
                la pieza y una nota personalizada.
              </p>
              <Link
                to="/giftcards"
                className="bg-[#2e5424] text-white px-6 py-3 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-white hover:text-[#2b2f26] transition-all"
              >
                Explorar regalos
              </Link>
            </div>
            <div className="hidden lg:block bg-[#2b2f26]" />
          </div>
        </section>
      </main>

      {/* ═══════════════ RELATED PRODUCTS ═══════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <RelatedProducts
          currentProductId={product.id}
          category={product.category}
          storeName={product.storeName}
          storeId={product.shopId}
        />
      </div>

      <CartDrawer />
      <Footer />
    </div>
  );
};

export default ProductDetail;
