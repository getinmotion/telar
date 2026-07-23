/**
 * ArtisanProfile Page — Editorial Artisan Profile
 * Route: /artesano/:slug
 * Data-driven from the shop's artisanProfile blob (AI-generated `generatedStory`
 * as the narrative spine, raw wizard fields as fallback) + products-new.
 */

import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import {
  getProductsByStore,
  getPrimaryImageUrl,
  getProductPrice,
  getProductStock,
  getTechniqueName,
  getCraftName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/hooks/useWishlist";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { Badge } from "@/components/ui/badge";
import {
  LEARNED_FROM_LABELS,
  ETHNIC_RELATION_LABELS,
} from "@/types/artisanProfile.types";
import { ArrowRight, Heart } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────
const dedupe = (arr: (string | undefined | null)[]): string[] =>
  Array.from(new Set(arr.filter((s): s is string => Boolean(s && s.trim()))));

// Some legacy profile arrays store a comma-joined list as a single string
// (e.g. "Marroquinería, tejidos en cuero, preforma"). Split into clean chips.
const splitChips = (arr: (string | undefined | null)[]): string[] =>
  dedupe(
    arr
      .flatMap((s) => (s ? s.split(/\s*,\s*/) : []))
      .map((s) => s.trim()),
  );

const resolveNames = (
  ids: string[] | undefined,
  map: Map<string, string>,
): string[] => (ids ?? []).map((id) => map.get(id)).filter((n): n is string => Boolean(n));

// ── Component ────────────────────────────────────────────
const ArtisanProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    currentShop,
    fetchShopBySlug,
    loading: shopLoading,
  } = useArtisanShops();
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const { crafts, techniques: techCatalog, materials: matCatalog } = useTaxonomy();

  // Fetch shop by slug
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setNotFound(false);
    fetchShopBySlug(slug)
      .then((shop) => {
        if (!cancelled && !shop) setNotFound(true);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Fetch products-new when shop loads
  useEffect(() => {
    if (!currentShop?.id) return;
    let cancelled = false;
    setProductsLoading(true);
    getProductsByStore(currentShop.id)
      .then((prods) => {
        if (!cancelled) setProducts(prods);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentShop?.id]);

  // ── Base data ──────────────────────────────────────────
  const artisanProfile = currentShop?.artisanProfile;
  const gs = artisanProfile?.generatedStory;
  const aboutContent = currentShop?.aboutContent;
  const certifications = currentShop?.certifications ?? [];
  const craftType = currentShop?.craftType ?? "";

  const displayName =
    artisanProfile?.artisticName ||
    artisanProfile?.artisanName ||
    currentShop?.shopName ||
    slug?.replace(/-/g, " ") ||
    "Artesano";
  const nameParts = displayName.split(" ");
  const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(" ");
  const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(" ");

  const location = currentShop
    ? [currentShop.municipality, currentShop.department]
        .filter(Boolean)
        .join(", ")
    : "";

  // ── Taxonomy id→name maps ──────────────────────────────
  const techMap = useMemo(
    () => new Map(techCatalog.map((t) => [t.id, t.name])),
    [techCatalog],
  );
  const matMap = useMemo(
    () => new Map(matCatalog.map((m) => [m.id, m.name])),
    [matCatalog],
  );
  const craftMap = useMemo(
    () => new Map(crafts.map((c) => [c.id, c.name])),
    [crafts],
  );

  // Product-derived technique/material names (already resolved)
  const realTechniques = useMemo(() => {
    const techs = new Set<string>();
    products.forEach((p) => {
      const t = p.artisanalIdentity?.primaryTechnique;
      if (t?.name) techs.add(t.name);
      const t2 = p.artisanalIdentity?.secondaryTechnique;
      if (t2?.name) techs.add(t2.name);
    });
    return Array.from(techs);
  }, [products]);

  const realMaterials = useMemo(() => {
    const mats = new Set<string>();
    products.forEach((p) => {
      p.materials?.forEach((ml) => {
        if (ml.material?.name) mats.add(ml.material.name);
      });
    });
    return Array.from(mats);
  }, [products]);

  // Union of profile-declared (resolved) + product-derived, deduped
  const techniquesToShow = useMemo(
    () =>
      splitChips([
        ...resolveNames(artisanProfile?.techniqueIds, techMap),
        ...(artisanProfile?.techniques ?? []),
        ...realTechniques,
      ]),
    [artisanProfile, techMap, realTechniques],
  );
  const materialsToShow = useMemo(
    () =>
      splitChips([
        ...resolveNames(artisanProfile?.materialIds, matMap),
        ...(artisanProfile?.materials ?? []),
        ...realMaterials,
      ]),
    [artisanProfile, matMap, realMaterials],
  );

  const toolsToShow = useMemo(
    () => splitChips(artisanProfile?.workshopTools ?? []),
    [artisanProfile],
  );

  const primaryCraft = useMemo(() => {
    const fromProfile = artisanProfile?.craftId
      ? craftMap.get(artisanProfile.craftId)
      : undefined;
    if (fromProfile) return fromProfile;
    for (const p of products) {
      const c = getCraftName(p);
      if (c) return c;
    }
    return craftType;
  }, [artisanProfile, craftMap, products, craftType]);

  // ── Images ─────────────────────────────────────────────
  const heroImages = useMemo(() => {
    const imgs: string[] = [];
    if (artisanProfile?.artisanPhoto) imgs.push(artisanProfile.artisanPhoto);
    if (currentShop?.bannerUrl) imgs.push(currentShop.bannerUrl);
    if (currentShop?.logoUrl) imgs.push(currentShop.logoUrl);
    products.forEach((p) => {
      const url = getPrimaryImageUrl(p);
      if (url && imgs.length < 8) imgs.push(url);
    });
    return imgs;
  }, [products, currentShop, artisanProfile]);

  const workshopGallery = useMemo(
    () =>
      dedupe([
        artisanProfile?.workshopPhoto,
        artisanProfile?.workshopActionPhoto,
        artisanProfile?.workshopToolsPhoto,
        ...(artisanProfile?.workshopPhotos ?? []),
      ]),
    [artisanProfile],
  );

  // A logo cropped by object-cover looks broken; show it whole (contain + padding).
  const logoUrl = currentShop?.logoUrl;
  const imgFitClass = (src?: string) =>
    src && src === logoUrl
      ? "w-full h-full object-contain p-6 md:p-10"
      : "w-full h-full object-cover";

  // ── Narrative content (AI spine → raw fallback) ────────
  const heroEyebrow = gs?.claim || primaryCraft;
  const heroSubtitle =
    gs?.heroSubtitle || artisanProfile?.shortBio || currentShop?.description || "";

  const originParagraphs =
    gs?.originStory || gs?.culturalStory
      ? dedupe([gs?.originStory, gs?.culturalStory])
      : dedupe([
          currentShop?.story || aboutContent?.story,
          artisanProfile?.culturalMeaning,
        ]);

  const learnedFromLabel = artisanProfile?.learnedFrom
    ? LEARNED_FROM_LABELS[artisanProfile.learnedFrom] ?? ""
    : "";
  const ethnicLabel = artisanProfile?.ethnicRelation
    ? ETHNIC_RELATION_LABELS[artisanProfile.ethnicRelation] ?? ""
    : "";

  const timeline = (gs?.timeline ?? []).filter((t) => t?.year || t?.event);
  const craftStory = gs?.craftStory || "";
  const workshopStory = gs?.workshopStory || "";
  const quote =
    gs?.artisanQuote ||
    artisanProfile?.craftMessage ||
    artisanProfile?.culturalMeaning ||
    "";
  const closingMessage = gs?.closingMessage || "";

  // Section guards
  const hasOrigin =
    originParagraphs.length > 0 ||
    !!learnedFromLabel ||
    !!artisanProfile?.learnedFromDetail ||
    !!artisanProfile?.regionalHistory;
  const hasCraft =
    !!craftStory ||
    techniquesToShow.length > 0 ||
    materialsToShow.length > 0 ||
    !!artisanProfile?.uniqueness;
  const hasWorkshop =
    !!workshopStory ||
    !!artisanProfile?.workshopDescription ||
    !!artisanProfile?.creationProcess ||
    workshopGallery.length > 0 ||
    toolsToShow.length > 0;

  // ── Loading / not-found ────────────────────────────────
  if (shopLoading && !currentShop) {
    return (
      <div className="bg-[#F7E7D7] min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6 rounded-full border-2 border-[#BC3F1C]/20 border-t-[#BC3F1C] animate-spin" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#1a1a1a]/40 font-bold">
            Cargando perfil del artesano
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F7E7D7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl">Artesano no encontrado</h1>
          <Link
            to="/tiendas"
            className="text-[#BC3F1C] text-sm font-bold uppercase tracking-widest"
          >
            Volver a talleres
          </Link>
        </div>
      </div>
    );
  }

  const chipClass =
    "rounded-full border border-[#1a1a1a]/15 bg-transparent px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#1a1a1a]/70";

  return (
    <div className="bg-[#F7E7D7] text-[#1a1a1a] min-h-screen overflow-x-hidden">
      {/* ═══ Hero / Identidad ═══ */}
      <section className="relative lg:min-h-[70vh] flex flex-col justify-end pt-8 md:pt-12 lg:pt-0 pb-12 md:pb-16">
        {/* Desktop 2/3 background image */}
        <div className="hidden lg:block absolute top-0 right-0 w-2/3 h-full bg-[#F3E4D3] z-0 overflow-hidden">
          {heroImages[0] ? (
            <img
              src={heroImages[0]}
              alt={displayName}
              className={imgFitClass(heroImages[0])}
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]/20 font-serif italic text-xl">
              Retrato del Taller
            </div>
          )}
        </div>

        {/* Mobile image */}
        <div className="lg:hidden w-full aspect-[4/5] bg-[#F3E4D3] overflow-hidden mb-8">
          {heroImages[0] ? (
            <img
              src={heroImages[0]}
              alt={displayName}
              className={imgFitClass(heroImages[0])}
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]/20 font-serif italic text-base">
              Retrato del Taller
            </div>
          )}
        </div>

        <div className="max-w-[1440px] mx-auto px-5 md:px-8 w-full relative z-10">
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-12 lg:col-span-9">
              {heroEyebrow && (
                <p className="text-[#BC3F1C] font-extrabold tracking-[0.4em] md:tracking-[0.5em] uppercase mb-4 md:mb-6 text-[10px] md:text-[11px]">
                  {heroEyebrow}
                </p>
              )}
              <h1
                className="font-serif italic font-bold mb-8 break-words flex flex-col items-start gap-1.5"
                style={{ fontSize: "clamp(2.25rem, 8vw, 7rem)", letterSpacing: "-0.03em" }}
              >
                <span className="inline-block bg-[#F7E7D7]/90 backdrop-blur-sm text-[#1a1a1a] leading-[1.05] px-4 py-1 rounded-md">
                  {firstName}
                </span>
                {lastName && (
                  <span className="inline-block bg-[#F7E7D7]/90 backdrop-blur-sm text-[#1a1a1a] leading-[1.05] px-4 py-1 rounded-md">
                    {lastName}
                  </span>
                )}
              </h1>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <a
                  href="#piezas"
                  className="inline-flex items-center gap-2 bg-[#BC3F1C] text-white px-7 md:px-9 py-3 md:py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#BC3F1C] transition-colors"
                >
                  Ver las piezas del taller
                  <ArrowRight className="w-4 h-4" />
                </a>
                {currentShop?.shopSlug && (
                  <Link
                    to={`/tienda/${currentShop.shopSlug}`}
                    className="inline-flex items-center gap-2 bg-[#F7E7D7]/90 backdrop-blur-sm border border-[#1a1a1a]/30 text-[#1a1a1a] px-7 md:px-9 py-3 md:py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase hover:border-[#BC3F1C] hover:text-[#BC3F1C] transition-colors"
                  >
                    Volver a la tienda
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-6 md:gap-8 items-end">
            <div className="col-span-12 lg:col-span-4 border-l-2 border-[#BC3F1C] pl-5 md:pl-8 py-1">
              <div className="grid grid-cols-1 gap-4">
                {location && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-1">
                      Ubicacion
                    </p>
                    <p className="font-bold text-sm md:text-base">{location}</p>
                  </div>
                )}
                {primaryCraft && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-1">
                      Oficio Principal
                    </p>
                    <p className="font-bold text-sm md:text-base">{primaryCraft}</p>
                  </div>
                )}
                {(artisanProfile?.startAge ?? 0) > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-1">
                      En el oficio
                    </p>
                    <p className="font-bold text-sm md:text-base">
                      Desde los {artisanProfile!.startAge} años
                    </p>
                  </div>
                )}
                {ethnicLabel && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-1">
                      Pertenencia
                    </p>
                    <p className="font-bold text-sm md:text-base">{ethnicLabel}</p>
                  </div>
                )}
                {techniquesToShow.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-1">
                      Tecnicas
                    </p>
                    <p className="font-bold text-sm md:text-base">
                      {techniquesToShow.slice(0, 3).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {heroSubtitle && (
              <div className="col-span-12 lg:col-span-8 flex lg:justify-end">
                <div className="max-w-md lg:text-right bg-[#F7E7D7]/90 backdrop-blur-sm rounded-lg px-5 py-4">
                  <p className="text-base md:text-lg leading-relaxed text-[#1a1a1a]/75 font-light italic">
                    {heroSubtitle}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ El origen ═══ */}
      {hasOrigin && (
        <section className="py-20 md:py-28 lg:py-32 bg-white overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-5 md:px-8">
            <div className="grid grid-cols-12 gap-8 md:gap-12 lg:gap-24 items-start">
              <div className="hidden lg:block col-span-1">
                <span
                  className="font-serif text-6xl text-[#BC3F1C]/10 select-none"
                  style={{ writingMode: "vertical-rl" }}
                >
                  ORIGEN
                </span>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <p className="lg:hidden text-[#BC3F1C] font-bold tracking-[0.4em] uppercase mb-4 text-[10px]">
                  Origen
                </p>
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 md:mb-10 italic leading-tight">
                  {gs?.heroTitle || "La historia del taller"}
                </h2>
                <div className="space-y-6 md:space-y-8 text-lg md:text-xl leading-[1.6] text-[#1a1a1a]/80 font-light">
                  {originParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {(learnedFromLabel || artisanProfile?.learnedFromDetail) && (
                  <div className="mt-10 md:mt-12 border-l-2 border-[#BC3F1C]/30 pl-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-2">
                      El aprendizaje
                    </p>
                    {learnedFromLabel && (
                      <p className="font-serif italic text-xl md:text-2xl text-[#1a1a1a] mb-3">
                        {learnedFromLabel}
                      </p>
                    )}
                    {artisanProfile?.learnedFromDetail && (
                      <p className="text-base md:text-lg leading-relaxed text-[#1a1a1a]/70 font-light">
                        {artisanProfile.learnedFromDetail}
                      </p>
                    )}
                  </div>
                )}

              </div>
              <div className="col-span-12 lg:col-span-5 pt-4 lg:pt-24">
                <div className="aspect-[4/5] bg-[#F3E4D3] relative max-w-sm mx-auto lg:ml-auto overflow-hidden">
                  {(artisanProfile?.workshopPhoto || heroImages[1]) ? (
                    <img
                      src={artisanProfile?.workshopPhoto || heroImages[1]}
                      alt={displayName}
                      className={imgFitClass(artisanProfile?.workshopPhoto || heroImages[1])}
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#1a1a1a]/20 italic text-sm">
                      Vida en el Taller
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Ubicacion del taller ═══ */}
      <section className="bg-[#111111] py-24 md:py-36 lg:py-48 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
          <div
            className="font-black text-white leading-none whitespace-nowrap select-none"
            style={{ fontSize: "clamp(6rem, 28vw, 20rem)" }}
          >
            ORIGEN
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center relative z-10">
          <p className="text-[#BC3F1C] font-bold tracking-[0.5em] md:tracking-[0.6em] uppercase mb-6 md:mb-8 text-[10px]">
            Ubicacion del taller
          </p>
          <h3 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#F7E7D7] mb-4 md:mb-6 italic leading-tight">
            {location ||
              currentShop?.region ||
              currentShop?.department ||
              artisanProfile?.country ||
              "Colombia"}
          </h3>
          {artisanProfile?.communityVillage && (
            <p className="text-[#F7E7D7]/40 text-[11px] md:text-xs uppercase tracking-[0.3em] font-bold mb-8 md:mb-10">
              {artisanProfile.communityVillage}
            </p>
          )}
            {artisanProfile?.regionalHistory && (
              <p className="text-base md:text-xl text-[#F7E7D7]/50 leading-[1.7] md:leading-[1.8] font-light mb-10 md:mb-12 max-w-2xl mx-auto">
                {artisanProfile.regionalHistory}
              </p>
            )}
            {currentShop?.department && (
              <Link
                to={`/territorio/${currentShop.department.toLowerCase().replace(/\s+/g, "-")}`}
                className="group relative inline-block border border-[#BC3F1C] text-[#BC3F1C] px-8 md:px-12 py-3 md:py-4 text-[11px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase overflow-hidden"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  Explorar la Region
                </span>
                <div className="absolute inset-0 bg-[#BC3F1C] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            )}
          </div>
        </section>

      {/* ═══ Linea de tiempo ═══ */}
      {timeline.length > 0 && (
        <section className="py-20 md:py-28 lg:py-32 bg-[#F7E7D7]">
          <div className="max-w-[1100px] mx-auto px-5 md:px-8">
            <div className="mb-12 md:mb-16">
              <p className="text-[#BC3F1C] font-bold tracking-[0.4em] uppercase mb-4 text-[10px]">
                Trayectoria
              </p>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl italic leading-tight">
                Momentos del oficio
              </h3>
            </div>
            <ol className="relative border-l border-[#1a1a1a]/15 ml-2 md:ml-4">
              {timeline.map((t, i) => (
                <li key={i} className="mb-10 md:mb-12 last:mb-0 pl-8 md:pl-12 relative">
                  <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#BC3F1C]" />
                  {t.year && (
                    <p className="font-serif text-2xl md:text-3xl text-[#BC3F1C] mb-1">
                      {t.year}
                    </p>
                  )}
                  {t.event && (
                    <p className="text-base md:text-lg leading-relaxed text-[#1a1a1a]/75 font-light max-w-2xl">
                      {t.event}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ═══ El oficio / Tecnica ═══ */}
      {hasCraft && (
        <section className="py-20 md:py-28 lg:py-32 px-5 md:px-8 bg-white">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-12 md:mb-16 max-w-3xl">
              <p className="text-[#BC3F1C] font-bold tracking-[0.4em] uppercase mb-4 text-[10px]">
                Saber-hacer
              </p>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-[1.05]">
                Tecnica y materiales
              </h3>
              {craftStory && (
                <p className="text-lg md:text-xl leading-[1.6] text-[#1a1a1a]/80 font-light">
                  {craftStory}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
              {techniquesToShow.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-4">
                    Tecnicas
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {techniquesToShow.map((t) => (
                      <Badge key={t} variant="outline" className={chipClass}>
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {materialsToShow.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-4">
                    Materiales
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {materialsToShow.map((m) => (
                      <Badge key={m} variant="outline" className={chipClass}>
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {artisanProfile?.uniqueness && (
              <div className="mt-14 md:mt-20 border-t border-[#1a1a1a]/10 pt-10 md:pt-14 max-w-3xl">
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-3">
                  Lo que lo hace unico
                </p>
                <p className="font-serif italic text-2xl md:text-3xl text-[#1a1a1a] leading-snug">
                  {artisanProfile.uniqueness}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ El taller ═══ */}
      {hasWorkshop && (
        <section className="py-20 md:py-28 lg:py-32 bg-[#F7E7D7]">
          <div className="max-w-[1440px] mx-auto px-5 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 border-b border-[#1a1a1a]/5 pb-8 gap-4">
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl italic leading-tight">
                El taller
              </h3>
              <p className="text-[#1a1a1a]/40 text-[10px] tracking-widest uppercase mb-1">
                Donde nace cada pieza
              </p>
            </div>

            {(workshopStory || artisanProfile?.workshopDescription) && (
              <div className="max-w-3xl space-y-6 text-lg md:text-xl leading-[1.6] text-[#1a1a1a]/80 font-light mb-12 md:mb-16">
                {workshopStory && <p>{workshopStory}</p>}
                {artisanProfile?.workshopDescription && !workshopStory && (
                  <p>{artisanProfile.workshopDescription}</p>
                )}
              </div>
            )}

            {workshopGallery.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
                {workshopGallery.slice(0, 6).map((img, i) => (
                  <div
                    key={img}
                    className={`bg-[#F3E4D3] overflow-hidden ${
                      i === 0 ? "col-span-2 md:col-span-2 aspect-[16/10]" : "aspect-square"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Taller ${displayName} ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
              {artisanProfile?.creationProcess && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-3">
                    El proceso de creacion
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-[#1a1a1a]/75 font-light">
                    {artisanProfile.creationProcess}
                  </p>
                </div>
              )}
              {toolsToShow.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-4">
                    Herramientas
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {toolsToShow.map((tool) => (
                      <Badge key={tool} variant="outline" className={chipClass}>
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Motivacion ═══ */}
      {artisanProfile?.motivation && (
        <section className="bg-[#111111] py-20 md:py-28 lg:py-32 relative overflow-hidden">
          <div className="max-w-3xl mx-auto px-5 md:px-8 text-center relative z-10">
            <p className="text-[#BC3F1C] font-bold tracking-[0.5em] uppercase mb-6 md:mb-8 text-[10px]">
              Lo que me mueve
            </p>
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-[#F7E7D7] italic leading-snug">
              {artisanProfile.motivation}
            </p>
          </div>
        </section>
      )}

      {/* ═══ Piezas del taller ═══ */}
      <section id="piezas" className="scroll-mt-24 py-20 md:py-28 lg:py-32 px-5 md:px-8 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <p className="text-[#BC3F1C] font-bold uppercase tracking-[0.35em] md:tracking-[0.4em] text-[10px] mb-3">
                Catalogo Editorial
              </p>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl italic leading-tight">
                Piezas de este taller
              </h3>
            </div>
            {currentShop?.shopSlug && (
              <Link
                to={`/tienda/${currentShop.shopSlug}`}
                className="group inline-flex items-center gap-3 text-[11px] md:text-xs font-bold tracking-widest uppercase pb-1 hover:text-[#BC3F1C] transition-colors self-start md:self-end"
              >
                <span>Ver coleccion completa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] bg-[#F3E4D3] mb-5" />
                  <div className="h-3 bg-[#F3E4D3] w-2/3 mb-2" />
                  <div className="h-3 bg-[#F3E4D3] w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
              {products.slice(0, 8).map((product) => {
                const imageUrl = getPrimaryImageUrl(product);
                const price = getProductPrice(product);
                const technique = getTechniqueName(product);
                const stock = getProductStock(product);
                const wished = isInWishlist(product.id);

                return (
                  <Link key={product.id} to={`/product/${product.id}`} className="group">
                    <div className="aspect-[4/5] bg-[#F3E4D3] mb-5 relative overflow-hidden">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                            stock === 0 ? "grayscale" : ""
                          }`}
                          onError={(e) =>
                            ((
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none")
                          }
                        />
                      )}
                      {stock === 0 && (
                        <div className="absolute top-3 left-0 bg-[#1a1a1a] text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
                          Agotado
                        </div>
                      )}
                      <button
                        type="button"
                        aria-label={
                          wished
                            ? "Quitar de favoritos"
                            : "Guardar en favoritos"
                        }
                        className={`absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center transition-all ${
                          wished
                            ? "opacity-100 scale-100 text-[#BC3F1C]"
                            : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 text-[#1a1a1a] hover:text-[#BC3F1C]"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        disabled={wishlistLoading}
                      >
                        <Heart className={`w-4 h-4 ${wished ? "fill-[#BC3F1C]" : ""}`} />
                      </button>
                      <div className="absolute inset-0 bg-[#BC3F1C]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-[#1a1a1a]/40 uppercase tracking-widest font-bold">
                        {technique ? `${technique} • ` : ""}
                        {location || displayName}
                      </p>
                      <h4 className="font-bold text-sm md:text-base leading-snug group-hover:text-[#BC3F1C] transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-[#BC3F1C] font-black tracking-tight text-sm pt-1">
                        {price ? formatCurrency(price) : "Consultar"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#1a1a1a]/40 text-sm">
                Proximamente se mostraran las piezas de este taller.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ Cierre / Quote ═══ */}
      {(quote || closingMessage) && (
        <section className="py-20 md:py-28 lg:py-32 bg-[#F7E7D7] border-t border-[#1a1a1a]/5">
          <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
            {quote && (
              <p className="font-serif italic text-3xl md:text-4xl lg:text-5xl text-[#BC3F1C] leading-snug mb-8">
                {/^["“«']/.test(quote.trim()) ? quote : `“${quote}”`}
              </p>
            )}
            {closingMessage && (
              <p className="text-base md:text-xl text-[#1a1a1a]/60 font-light leading-relaxed">
                {closingMessage}
              </p>
            )}
            <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 font-bold">
              {displayName}
            </p>
          </div>
        </section>
      )}

      {/* ═══ Certificaciones ═══ */}
      {certifications.length > 0 && (
        <section className="py-20 md:py-28 lg:py-32 bg-white border-t border-[#1a1a1a]/5">
          <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#BC3F1C]/10 text-[#BC3F1C] mb-8 md:mb-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 md:w-7 md:h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.48 4.48 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
            </div>
            <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 italic leading-tight">
              Certificaciones del taller
            </h3>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12 text-[9px] font-bold uppercase tracking-[0.25em] md:tracking-[0.3em] text-[#1a1a1a]/40">
              {certifications.map((cert) => (
                <span key={cert} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BC3F1C]" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ArtisanProfile;
