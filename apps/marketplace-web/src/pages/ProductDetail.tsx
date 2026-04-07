/**
 * ProductDetail — Editorial design matching reference HTML
 * Route: /product/:id
 */

import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { Heart, X, Sparkles, MapPin, Share2 } from "lucide-react";
import { ProductVariants } from "@/components/ProductVariants";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductPurchaseButton } from "@/components/ProductPurchaseButton";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currencyUtils";
import { Product } from "@/types/products.types";
import { ArtisanShop } from "@/types/artisan-shops.types";

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
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { fetchShopById } = useArtisanShops();
  const { fetchProductById } = useProducts();
  const isFavorite = product ? isInWishlist(product.id) : false;

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
    return parseFloat(product.price) + (selectedVariant?.price_adjustment || 0);
  };

  const maxStock = selectedVariant?.stock ?? product?.stock ?? 0;

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2]">
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
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif italic text-[#2c2c2c]">
            Producto no encontrado
          </h1>
          <Link
            to="/"
            className="inline-block bg-[#2c2c2c] text-white px-8 py-3 uppercase text-xs tracking-widest hover:bg-[#ec6d13] transition-colors"
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

  return (
    <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c] font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* ═══════════════ PRODUCT HERO ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery
              images={productImages}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            {/* Taller label */}
            {product.storeName && (
              <Link
                to={product.storeSlug ? `/tienda/${product.storeSlug}` : "#"}
                className="mb-2 text-[#ec6d13] font-bold tracking-widest text-[10px] uppercase hover:underline"
              >
                Taller: {product.storeName}
              </Link>
            )}

            <div className="flex flex-col gap-4 mb-6">
              {/* Title + subtitle */}
              <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-serif italic text-[#2c2c2c]">
                  {product.name}
                </h2>
                {(shop?.region || product.storeName) && (
                  <p className="text-sm text-[#2c2c2c]/80 italic">
                    Hecho a mano en {shop?.municipality || shop?.region || "Colombia"}
                    {shop?.department ? `, ${shop.department}` : ""} por el taller{" "}
                    {product.storeName}
                  </p>
                )}

                {/* Authenticity badges */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowComingSoon(true)}
                    className="bg-[#2c2c2c] text-white text-[9px] px-2 py-1 uppercase tracking-widest hover:bg-[#2c2c2c]/80 transition-colors"
                  >
                    Huella Digital Registrada
                  </button>
                  <button
                    onClick={() => setShowComingSoon(true)}
                    className="bg-[#ec6d13] text-white text-[9px] px-2 py-1 uppercase tracking-widest hover:bg-[#ec6d13]/80 transition-colors"
                  >
                    Certificado de autenticidad TELAR
                  </button>
                </div>
              </div>

              {/* Certificate link */}
              <button
                onClick={() => setShowComingSoon(true)}
                className="text-xs text-[#2c2c2c]/60 underline underline-offset-4 hover:text-[#ec6d13] transition-colors font-bold w-fit"
              >
                Ver certificado de autenticidad
              </button>
              <p className="text-[10px] text-[#2c2c2c]/40 max-w-xs leading-relaxed">
                Al adquirir esta pieza, usted recibe un certificado de autenticidad
                digital que garantiza su origen y autoría.
              </p>

              {/* Coming Soon Card */}
              {showComingSoon && (
                <div className="relative border border-[#ec6d13]/30 bg-[#ec6d13]/5 p-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button
                    onClick={() => setShowComingSoon(false)}
                    className="absolute top-3 right-3 text-[#2c2c2c]/40 hover:text-[#2c2c2c] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#ec6d13]" />
                    <h4 className="font-serif italic text-lg">Próximamente</h4>
                  </div>
                  <p className="text-sm text-[#2c2c2c]/70 leading-relaxed">
                    Estamos construyendo un sistema de certificados digitales que
                    permitirá verificar la autenticidad, el origen y la trazabilidad
                    de cada pieza artesanal.
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-[#2c2c2c]/40 font-bold">
                    Lanzamiento próximo · 2026
                  </p>
                </div>
              )}
            </div>

            {/* Location + Category */}
            <div className="flex flex-wrap gap-2 mb-8 text-xs text-[#2c2c2c]/50 uppercase tracking-widest font-bold">
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
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-12">
              <span className="border border-[#2c2c2c]/10 text-[#2c2c2c]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                Hecho a mano en Colombia
              </span>
              {product.craft && (
                <span className="border border-[#2c2c2c]/10 text-[#2c2c2c]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {product.craft}
                </span>
              )}
              {product.materials && product.materials.length > 0 && (
                <span className="border border-[#2c2c2c]/10 text-[#2c2c2c]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {product.materials.slice(0, 2).join(" · ")}
                </span>
              )}
              <span className="border border-[#2c2c2c]/10 text-[#2c2c2c]/60 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                Pieza con historia
              </span>
            </div>

            {/* Price */}
            <div className="text-4xl font-serif mb-12 text-[#2c2c2c]">
              {formatCurrency(getFinalPrice())}
            </div>

            {/* Variants */}
            {id && (
              <ProductVariants
                productId={id}
                basePrice={parseFloat(product.price)}
                onVariantSelect={(variant) => {
                  setSelectedVariant(variant);
                  setQuantity(1);
                }}
              />
            )}

            {/* Quantity */}
            {maxStock > 0 && (
              <div className="mb-6 flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#2c2c2c]/40">
                  Cantidad
                </span>
                <div className="flex items-center border border-[#2c2c2c]/10">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-[#2c2c2c]/60 hover:text-[#2c2c2c] transition-colors disabled:opacity-30"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-bold border-x border-[#2c2c2c]/10">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-[#2c2c2c]/60 hover:text-[#2c2c2c] transition-colors disabled:opacity-30"
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock}
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#2c2c2c]/40 italic">
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
                variant="detail"
              />
              <button
                className="w-full border border-[#2c2c2c]/20 text-[#2c2c2c] font-bold py-5 uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[#2c2c2c] transition-all"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-[#ec6d13] text-[#ec6d13]" : ""}`}
                />
                {isFavorite ? "Guardado" : "Guardar"}
              </button>
            </div>

            {/* Handmade notice */}
            <p className="text-xs text-[#2c2c2c]/60 leading-relaxed italic border-l border-[#ec6d13]/30 pl-4">
              "Las piezas hechas a mano pueden tener tiempos de preparación
              diferentes dependiendo del proceso artesanal."
            </p>
          </div>
        </div>

        {/* ═══════════════ NARRATIVE QUOTE ═══════════════ */}
        <section className="max-w-3xl mx-auto text-center mb-24 py-12 border-y border-[#2c2c2c]/5">
          <span className="text-[#ec6d13] font-serif italic text-4xl opacity-40 mb-8 block">
            "
          </span>
          <blockquote className="font-serif text-2xl lg:text-3xl text-[#2c2c2c] leading-relaxed italic px-8">
            {product.shortDescription ||
              product.description ||
              "Este producto artesanal ha sido elaborado con dedicación y maestría por artesanos colombianos. Cada pieza es única y refleja la riqueza cultural de nuestra tradición artesanal."}
          </blockquote>
        </section>

        {/* ═══════════════ STORY OF THE PIECE ═══════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-center">
          <div>
            <h3 className="text-4xl font-serif mb-8 text-[#2c2c2c]">
              Historia de la pieza
            </h3>
            <div className="space-y-6 text-[#2c2c2c]/70 leading-relaxed text-lg font-light italic">
              <p>
                {shop?.story ||
                  (shop?.region
                    ? `En ${shop.municipality || shop.region}, ${shop.department || "Colombia"}, ${product.craft ? `el ${product.craft.toLowerCase()} ha sido` : "la artesanía ha sido"} una tradición transmitida durante generaciones. Las piezas hechas a mano reflejan el conocimiento y la identidad cultural de las comunidades que mantienen vivo este oficio.`
                    : "La tradición artesanal colombiana se transmite de generación en generación. Cada pieza nace del trabajo paciente del taller y de técnicas que han pasado durante décadas.")}
              </p>
              <p>
                Cada creación nace del trabajo paciente del taller y de técnicas
                que han pasado de madres a hijas durante décadas.
              </p>
            </div>
          </div>
          <div className="aspect-[4/3] bg-[#e5e1d8] rounded-2xl overflow-hidden">
            {productImages[1] ? (
              <img
                src={productImages[1]}
                alt="Detalle artesanal"
                className="w-full h-full object-cover"
              />
            ) : productImages[0] ? (
              <img
                src={productImages[0]}
                alt="Detalle artesanal"
                className="w-full h-full object-cover opacity-60"
              />
            ) : null}
          </div>
        </section>

        {/* ═══════════════ PROCESS + DETAILS (3 cols) ═══════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 border-y border-[#2c2c2c]/10 py-16">
          {/* Proceso artesanal */}
          <div className="space-y-6">
            <h5 className="text-xl font-serif italic text-[#2c2c2c]">
              Proceso artesanal
            </h5>
            <ul className="space-y-4 text-sm text-[#2c2c2c]/70">
              {(product.materials?.length > 0 || product.material) && (
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Materiales
                  </span>
                  <span className="italic">
                    {product.materials?.join(", ") || product.material}
                  </span>
                </li>
              )}
              {(product.craft || product.techniques?.length > 0) && (
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Técnica
                  </span>
                  <span className="italic">
                    {product.craft || product.techniques?.join(", ")}
                  </span>
                </li>
              )}
              {(product.leadTimeDays || product.productionTime) && (
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Tiempo de elaboración
                  </span>
                  <span className="italic">
                    {product.leadTimeDays
                      ? `De ${product.leadTimeDays} a ${product.leadTimeDays + 3} días`
                      : product.productionTime}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Detalles técnicos */}
          <div className="space-y-6">
            <h5 className="text-xl font-serif italic text-[#2c2c2c]">
              Detalles técnicos
            </h5>
            <ul className="space-y-4 text-sm text-[#2c2c2c]/70">
              {product.dimensions && (
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Dimensiones
                  </span>
                  <span className="italic">
                    {typeof product.dimensions === "object" &&
                    "width" in product.dimensions
                      ? `${product.dimensions.width} × ${product.dimensions.height} cm`
                      : product.dimensions}
                  </span>
                </li>
              )}
              {product.weight && (
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Peso
                  </span>
                  <span className="italic">{product.weight} g</span>
                </li>
              )}
              {product.careNotes && (
                <li className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Cuidados
                  </span>
                  <span className="italic">{product.careNotes}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Envío consciente */}
          <div className="space-y-6">
            <h5 className="text-xl font-serif italic text-[#2c2c2c]">
              Envío consciente
            </h5>
            <p className="text-sm text-[#2c2c2c]/70 leading-relaxed italic">
              Las piezas se preparan cuidadosamente para su envío respetando
              tanto la integridad de la creación como el impacto ambiental del
              proceso.
            </p>
          </div>
        </section>

        {/* ═══════════════ DIGITAL TRACEABILITY ═══════════════ */}
        <section className="mb-24 bg-[#2c2c2c] text-white py-16 px-6 rounded-3xl">
          <h3 className="text-center mb-12">
            <span className="text-xs text-white/70 mb-4 block italic max-w-lg mx-auto leading-relaxed">
              Cada pieza en TELAR cuenta con una huella digital que preserva su
              origen, su proceso artesanal y el taller que la creó.
            </span>
            <span className="text-4xl font-serif text-white">
              Registro digital de la pieza
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center space-y-6 px-4 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#ec6d13]/30 group-hover:border-[#ec6d13] transition-colors">
                <MapPin className="w-8 h-8 text-[#ec6d13]" />
              </div>
              <h5 className="text-2xl font-serif italic text-white">Origen</h5>
              <p className="text-sm text-white/60 leading-relaxed font-light italic">
                {product.material
                  ? `${product.material} ${product.region ? `recolectado y procesado en ${product.region}` : "procesado localmente"}`
                  : "Fibras naturales recolectadas y procesadas localmente"}
              </p>
            </div>
            <div className="text-center space-y-6 px-4 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#ec6d13]/30 group-hover:border-[#ec6d13] transition-colors">
                <svg className="w-8 h-8 text-[#ec6d13]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h5 className="text-2xl font-serif italic text-white">Taller</h5>
              <p className="text-sm text-white/60 leading-relaxed font-light italic">
                {product.storeName
                  ? `Elaborado en el taller ${product.storeName} bajo principios de comercio justo`
                  : "Elaborado en el taller bajo principios de comercio justo"}
              </p>
            </div>
            <div className="text-center space-y-6 px-4 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#ec6d13]/30 group-hover:border-[#ec6d13] transition-colors">
                <svg className="w-8 h-8 text-[#ec6d13]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h5 className="text-2xl font-serif italic text-white">
                Proceso
              </h5>
              <p className="text-sm text-white/60 leading-relaxed font-light italic">
                {product.craft
                  ? `Cada etapa del ${product.craft.toLowerCase()} se realiza manualmente y forma parte del registro histórico de la pieza`
                  : "Cada etapa del tejido se realiza manualmente y forma parte del registro histórico de la pieza"}
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════ CULTURAL RECORD + MAP ═══════════════ */}
        {(shop?.region || shop?.municipality) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl mb-24 bg-white border border-[#2c2c2c]/5 shadow-sm">
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <span className="text-[#ec6d13] font-bold mb-4 uppercase text-[11px] tracking-[0.3em]">
                Registro cultural
              </span>
              <h3 className="text-4xl font-serif text-[#2c2c2c] mb-8">
                {shop?.municipality || shop?.region}
                {shop?.department ? `, ${shop.department}` : ""}
              </h3>
              <p className="text-[#2c2c2c]/70 leading-relaxed mb-10 text-lg font-light italic">
                {shop?.description ||
                  `Ubicado en el corazón de Colombia, esta región es reconocida por su tradición artesanal. Durante generaciones, artesanos de la zona han trabajado ${product.craft || "la artesanía"} como una forma de preservar su identidad cultural.`}
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-[#2c2c2c]/10 pb-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Tradición
                  </span>
                  <span className="text-sm italic">
                    {product.craft || "Artesanía tradicional"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#2c2c2c]/10 pb-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Ubicación
                  </span>
                  <span className="text-sm italic">
                    {shop?.department || shop?.region || "Colombia"}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-[#e5e1d8] min-h-[400px] relative flex items-center justify-center">
              <MapPin className="w-16 h-16 text-[#ec6d13] opacity-40" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <p className="text-sm font-semibold text-[#2c2c2c]">
                  {shop?.municipality || shop?.region || "Colombia"}
                </p>
                <p className="text-xs text-[#2c2c2c]/50 mt-1">
                  Origen artesanal
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ ARTISAN PROFILE ═══════════════ */}
        {product.storeName && (
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
                <span className="text-[#ec6d13] font-bold uppercase text-[10px] tracking-[0.3em] mb-4 block">
                  Conoce al artesano
                </span>
                <h3 className="text-4xl font-serif text-[#2c2c2c] mb-6">
                  El taller que creó esta pieza
                </h3>
                <h4 className="text-2xl font-serif italic text-[#2c2c2c]/80 mb-6">
                  {product.storeName}
                </h4>
              </div>
              <div className="space-y-4 text-[#2c2c2c]/70 text-lg font-light italic leading-relaxed">
                <p>
                  {shop?.story ||
                    `${product.storeName} es un taller dedicado a la preservación de técnicas artesanales tradicionales. Cada miembro del taller aporta su experiencia en el manejo de materiales naturales y técnicas transmitidas durante generaciones. El taller trabaja bajo principios de comercio justo y producción artesanal responsable.`}
                </p>
              </div>
              <Link
                to={shop?.shopSlug ? `/artesano/${shop.shopSlug}` : product.storeSlug ? `/artesano/${product.storeSlug}` : "#"}
                className="inline-block border border-[#2c2c2c] text-[#2c2c2c] px-10 py-4 uppercase text-[11px] font-bold tracking-[0.2em] hover:bg-[#2c2c2c] hover:text-white transition-all"
              >
                Ver perfil del taller
              </Link>
            </div>
          </section>
        )}

        {/* ═══════════════ FAIR TRADE BLOCK ═══════════════ */}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-2 bg-[#2c2c2c] rounded-3xl overflow-hidden shadow-2xl min-h-[60vh]">
          <div className="h-96 lg:h-auto bg-[#e5e1d8] relative overflow-hidden">
            {productImages[0] && (
              <img
                src={productImages[0]}
                alt="Comercio justo"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-12 lg:p-24 flex flex-col justify-center items-start bg-black">
            <h3 className="text-4xl lg:text-5xl font-serif text-white mb-8 italic">
              Comercio justo
            </h3>
            <p className="text-xl text-white/70 mb-10 font-light italic leading-relaxed">
              Trabajamos directamente con talleres artesanales para que las
              personas que crean cada pieza reciban una compensación justa por su
              trabajo. Creemos en una relación más transparente entre quienes
              crean y quienes compran.
            </p>
            <Link
              to="/newsletter"
              className="inline-block bg-[#ec6d13] text-white px-8 py-4 font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-[#2c2c2c] transition-all"
            >
              Conoce más de Telar
            </Link>
          </div>
        </section>

        {/* ═══════════════ GIFT BLOCK ═══════════════ */}
        <section className="relative bg-[#1a1a1a] text-white rounded-3xl overflow-hidden mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            <div className="p-12 lg:p-20 flex flex-col justify-center items-start z-10">
              <h3 className="text-5xl font-serif italic text-white mb-8">
                ¿Es para un regalo?
              </h3>
              <p className="text-xl text-white/70 mb-12 font-light italic leading-relaxed max-w-md">
                Ofrecemos opciones de empaque especial que cuentan la historia de
                la pieza. También podemos incluir una nota personalizada para que
                tu obsequio sea inolvidable.
              </p>
              <Link
                to="/giftcards"
                className="bg-[#ec6d13] text-white px-12 py-5 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-white hover:text-[#2c2c2c] transition-all"
              >
                Explorar regalos
              </Link>
            </div>
            <div className="hidden lg:block bg-[#2c2c2c]" />
          </div>
        </section>
      </main>

      {/* ═══════════════ RELATED PRODUCTS ═══════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <RelatedProducts
          currentProductId={product.id}
          category={product.category}
          storeName={product.storeName}
        />
      </div>

      <CartDrawer />
      <Footer />
    </div>
  );
};

export default ProductDetail;
