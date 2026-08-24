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
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currencyUtils";
import { geocodeArtisan } from "@/lib/colombia-geocodes";
import { Product, MarketplaceVariant } from "@/types/products.types";
import { ArtisanShop } from "@/types/artisan-shops.types";
import { VillaAdelaidaBadge } from "@/components/VillaAdelaidaBadge";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

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
  const [selectedVariant, setSelectedVariant] =
    useState<MarketplaceVariant | null>(null);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { fetchShopById } = useArtisanShops();
  const { fetchProductById } = useProducts();
  const isFavorite = product ? isInWishlist(product.id) : false;
  const shopCoords = useMemo(
    () => (shop ? geocodeArtisan(shop) : null),
    [shop],
  );

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
        setProduct(productData);
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
        return {
          label: "Pieza única",
          note: "Existe un solo ejemplar de esta pieza.",
        };
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
      <div className="min-h-screen bg-[#F7E7D7]">
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
      <div className="min-h-screen bg-[#F7E7D7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif italic text-[#1a1a1a]">
            Producto no encontrado
          </h1>
          <Link
            to="/"
            className="inline-block bg-[#1a1a1a] text-white px-8 py-3 uppercase text-xs tracking-widest hover:bg-[#BC3F1C] transition-colors"
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
    <div className="min-h-screen bg-[#F7E7D7] text-[#1a1a1a] font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* ═══════════════ PRODUCT HERO ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start relative">
            {/* Sello Villa Adelaida superpuesto al carrusel */}
            {product && (
              <VillaAdelaidaBadge
                product={product}
                className="absolute top-4 left-4 z-20 mt-8"
              />
            )}
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
                className="mb-2 text-[#BC3F1C] font-bold tracking-widest text-[10px] uppercase hover:underline"
              >
                Taller: {product.storeName}
              </Link>
            )}

            <div className="flex flex-col gap-4 mb-6">
              {/* Title + subtitle */}
              <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-serif italic text-[#1a1a1a]">
                  {product.name}
                </h2>
                {(shop?.region || product.storeName) && (
                  <p className="text-sm text-[#1a1a1a]/80 italic">
                    Hecho a mano en{" "}
                    {shop?.municipality || shop?.region || "Colombia"}
                    {shop?.department ? `, ${shop.department}` : ""} por el
                    taller {product.storeName}
                  </p>
                )}
                {product.isCollaboration && product.collaborationName && (
                  <p className="text-sm text-[#1a1a1a]/60 italic">
                    En colaboración con {product.collaborationName}
                  </p>
                )}

                {/* Pasaporte de trazabilidad */}
                <Link
                  to={`/pasaporte/${product.id}`}
                  className="w-fit bg-[#BC3F1C] text-white text-[10px] px-4 py-2 uppercase tracking-[0.2em] font-bold hover:bg-[#1a1a1a] transition-colors"
                >
                  Pasaporte de trazabilidad
                </Link>
              </div>

              <p className="text-[10px] text-[#1a1a1a]/40 max-w-xs leading-relaxed">
                Al adquirir esta pieza, usted recibe su pasaporte de
                trazabilidad digital, que registra su origen y autoría.
              </p>
            </div>

            {/* Location + Category */}
            <div className="flex flex-wrap gap-2 mb-8 text-xs text-[#1a1a1a]/50 uppercase tracking-widest font-bold">
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
              <span className="border border-[#1a1a1a]/10 text-[#1a1a1a]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                Hecho a mano en Colombia
              </span>
              {product.craft && (
                <span className="border border-[#1a1a1a]/10 text-[#1a1a1a]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {product.craft}
                </span>
              )}
              {product.materials && product.materials.length > 0 && (
                <span className="border border-[#1a1a1a]/10 text-[#1a1a1a]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {product.materials.slice(0, 2).join(" · ")}
                </span>
              )}
              {product.pieceType && (
                <span className="border border-[#1a1a1a]/10 text-[#1a1a1a]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {PIECE_TYPE_LABELS[product.pieceType] ?? product.pieceType}
                </span>
              )}
              {(product.styles ?? []).map((style) => (
                <span
                  key={style}
                  className="border border-[#1a1a1a]/10 text-[#1a1a1a]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest"
                >
                  {STYLE_LABELS[style] ?? style}
                </span>
              ))}
              {product.history && (
                <span className="border border-[#1a1a1a]/10 text-[#1a1a1a]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  Pieza con historia
                </span>
              )}
              {(product.badges ?? []).map((badge) => (
                <span
                  key={badge.id}
                  className="border border-[#BC3F1C]/30 text-[#BC3F1C] px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold"
                >
                  {badge.name}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="text-4xl font-serif mb-12 text-[#1a1a1a]">
              {!selectedVariant && hasPriceRange && (
                <span className="text-lg text-[#1a1a1a]/50 italic mr-2">
                  Desde
                </span>
              )}
              {formatCurrency(getFinalPrice())}
            </div>

            {/* Availability */}
            {availabilityInfo && (
              <div className="mb-8 -mt-6 flex flex-wrap items-center gap-3">
                <span className="bg-[#1a1a1a] text-white px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold">
                  {availabilityInfo.label}
                </span>
                {availabilityInfo.note && (
                  <span className="text-xs text-[#1a1a1a]/50 italic">
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
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a]/40">
                  Cantidad
                </span>
                <div className="flex items-center border border-[#1a1a1a]/10">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors disabled:opacity-30"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-bold border-x border-[#1a1a1a]/10">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors disabled:opacity-30"
                    onClick={() =>
                      setQuantity(Math.min(maxStock, quantity + 1))
                    }
                    disabled={quantity >= maxStock}
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#1a1a1a]/40 italic">
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
                canPurchase={
                  product.stock !== undefined ? product.stock > 0 : maxStock > 0
                }
                stock={maxStock}
                quantity={quantity}
                variantId={selectedVariant?.id}
                requiresVariantSelection={needsVariantSelection}
                variant="detail"
              />
              <button
                className="w-full border border-[#1a1a1a]/20 text-[#1a1a1a] font-bold py-5 uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[#1a1a1a] transition-all"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-[#BC3F1C] text-[#BC3F1C]" : ""}`}
                />
                {isFavorite ? "Guardado" : "Guardar"}
              </button>
            </div>

            {/* Handmade notice */}
            <p className="text-xs text-[#1a1a1a]/60 leading-relaxed italic border-l border-[#BC3F1C]/30 pl-4">
              "Las piezas hechas a mano pueden tener tiempos de preparación
              diferentes dependiendo del proceso artesanal."
            </p>
          </div>
        </div>

        {/* Resto del detalle sin cambios ... */}
      </main>

      {/* ═══════════════ RELATED PRODUCTS ═══════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <RelatedProducts
          currentProductId={product.id}
          category={product.category}
          storeName={product.storeName}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
