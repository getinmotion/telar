import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { ArtisanProfileData, LEARNED_FROM_OPTIONS, ETHNIC_RELATION_OPTIONS } from '@/types/artisanProfile';
import {
  T, pageBg, glassCard, glassLoom,
  LabelCaps, HeadingSerif,
  ShopTopBar, ShopPublicFooter, TrustStrip,
  normShop, getHeroImage,
  ShopLoadingState, ShopNotFoundState,
} from '@/components/shop/public/ShopPublicShell';
import { ShoppingCartProvider } from '@/contexts/ShoppingCartContext';

// ─── helpers ──────────────────────────────────────────────────────────────────
function galleryPhotos(p: ArtisanProfileData): string[] {
  return [
    ...(p.workingPhotos     ?? []),
    ...(p.maestrosPhotos    ?? []),
    ...(p.communityPhotos   ?? []),
    ...(p.environmentPhotos ?? []),
    ...(p.familyPhotos      ?? []),
    ...(p.workshopPhotos    ?? []),
  ].filter(Boolean);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PublicArtisanProfile: React.FC = () => {
  const { shopSlug }  = useParams<{ shopSlug: string }>();
  const location      = useLocation();
  const isPreview     = new URLSearchParams(location.search).get('preview') === 'true';

  const [rawShop,  setRawShop]  = useState<any>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!shopSlug) return;
    getArtisanShopBySlug(shopSlug)
      .then(d => setRawShop(d ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shopSlug]);

  const shop    = useMemo(() => rawShop ? normShop(rawShop) : null, [rawShop]);
  const profile = (rawShop as any)?.artisanProfile as ArtisanProfileData | null;

  if (loading) return <ShopLoadingState />;
  if (!shop)   return <ShopNotFoundState message="Tienda no encontrada" />;
  if (!profile || !shop.artisanProfileCompleted)
    return <ShopNotFoundState message="Historia del taller no disponible" />;

  const learnedFromLabel = LEARNED_FROM_OPTIONS.find(o => o.value === profile.learnedFrom)?.label ?? profile.learnedFrom;
  const ethnicLabel      = ETHNIC_RELATION_OPTIONS.find(o => o.value === profile.ethnicRelation)?.label ?? null;
  const location_str     = [profile.municipality, profile.department, profile.country].filter(Boolean).join(', ');
  const photos           = galleryPhotos(profile);
  const heroImage        = profile.artisanPhoto ?? getHeroImage(shop);
  const quote            = profile.craftMessage || profile.culturalMeaning;

  const workshopImages = [
    profile.workshopPhoto,
    profile.workshopActionPhoto,
    profile.workshopToolsPhoto,
    ...(profile.workshopPhotos ?? []),
  ].filter(Boolean) as string[];

  return (
    <ShoppingCartProvider>
      <div style={pageBg}>
        <Helmet>
          <title>{`Historia de ${profile.artisanName ?? shop.shopName} · TELAR`}</title>
        </Helmet>

        <ShopTopBar shop={shop} shopSlug={shopSlug!} activePage="profile"
          isPreviewMode={isPreview} />

        <TrustStrip />

        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ minHeight: 520 }}>
          {heroImage
            ? <img src={heroImage} alt={profile.artisanName}
                className="absolute inset-0 w-full h-full object-cover" />
            : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${T.dark}, ${T.muted})` }} />
          }
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(21,27,45,0.88) 45%, rgba(21,27,45,0.3) 100%)',
          }} />
          <div className="relative z-10 max-w-[1400px] mx-auto px-10 py-20 flex flex-col justify-end" style={{ minHeight: 520 }}>
            <LabelCaps color={T.orange} style={{ marginBottom: 12 }}>Historia del taller</LabelCaps>
            <HeadingSerif as="h1" size={54} style={{ color: 'white', maxWidth: 640, marginBottom: 16 }}>
              {profile.artisticName || profile.artisanName}
            </HeadingSerif>
            {quote && (
              <p style={{ fontFamily: T.sans, fontSize: 16, color: 'rgba(255,255,255,0.70)', maxWidth: 520, lineHeight: 1.7, marginBottom: 20 }}>
                "{quote}"
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {location_str && (
                <span className="flex items-center gap-1.5 text-white/60" style={{ fontFamily: T.sans, fontSize: 11 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                  {location_str}
                </span>
              )}
              {profile.startAge > 0 && (
                <span className="flex items-center gap-1.5 text-white/60" style={{ fontFamily: T.sans, fontSize: 11 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>history_edu</span>
                  Artesano/a desde los {profile.startAge} años
                </span>
              )}
              {ethnicLabel && (
                <span className="px-3 py-1 rounded-full text-white" style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', background: `${T.orange}cc` }}>
                  {ethnicLabel.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. APRENDIZAJE ─────────────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-10 py-10">
          <div style={{ ...glassLoom, borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.06)' }}>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: story text */}
              <div className="p-10 flex flex-col justify-center gap-5 border-r" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
                <div>
                  <LabelCaps color={T.orange} style={{ display: 'block', marginBottom: 8 }}>El aprendizaje</LabelCaps>
                  <HeadingSerif size={32} style={{ marginBottom: 16 }}>
                    De dónde viene este oficio
                  </HeadingSerif>
                  {profile.learnedFromDetail && (
                    <p style={{ fontFamily: T.sans, fontSize: 14, color: `${T.muted}cc`, lineHeight: 1.8 }}>
                      {profile.learnedFromDetail}
                    </p>
                  )}
                </div>

                {learnedFromLabel && (
                  <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: `${T.orange}08`, border: `1px solid ${T.orange}20` }}>
                    <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 18, color: T.orange }}>school</span>
                    <div>
                      <p style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: `${T.muted}60`, textTransform: 'uppercase', marginBottom: 2 }}>Aprendí de</p>
                      <p style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.dark }}>{learnedFromLabel}</p>
                    </div>
                  </div>
                )}

                {profile.culturalMeaning && (
                  <div>
                    <LabelCaps style={{ display: 'block', marginBottom: 8 }}>Significado del oficio</LabelCaps>
                    <p style={{ fontFamily: T.sans, fontSize: 14, color: `${T.muted}cc`, lineHeight: 1.8 }}>
                      {profile.culturalMeaning}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: photo + territory */}
              <div className="flex flex-col">
                {profile.artisanPhoto && (
                  <div className="flex-1 overflow-hidden" style={{ minHeight: 260 }}>
                    <img src={profile.artisanPhoto} alt={profile.artisanName}
                      className="w-full h-full object-cover" style={{ maxHeight: 340 }} />
                  </div>
                )}
                <div className="p-8 space-y-4" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <LabelCaps color={T.orange}>Territorio de origen</LabelCaps>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: 'public',        label: 'País',         value: profile.country },
                      { icon: 'map',           label: 'Departamento', value: profile.department },
                      { icon: 'location_city', label: 'Municipio',    value: profile.municipality },
                      { icon: 'cottage',       label: 'Comunidad',    value: profile.communityVillage },
                    ].filter(x => x.value).map(({ icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 14, color: T.orange }}>{icon}</span>
                        <div>
                          <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: `${T.muted}50`, textTransform: 'uppercase' }}>{label}</p>
                          <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.dark }}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {profile.regionalHistory && (
                    <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}90`, lineHeight: 1.7, borderTop: `1px solid ${T.dark}10`, paddingTop: 12 }}>
                      {profile.regionalHistory}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. TALLER ──────────────────────────────────────────────────── */}
        {(profile.workshopDescription || workshopImages.length > 0) && (
          <section className="py-10" style={{ background: T.dark }}>
            <div className="max-w-[1400px] mx-auto px-10">
              <div className="mb-8">
                <LabelCaps color={T.orange} style={{ display: 'block', marginBottom: 8 }}>El taller</LabelCaps>
                <HeadingSerif size={36} style={{ color: 'white' }}>Donde nace el arte</HeadingSerif>
                {profile.workshopDescription && (
                  <p style={{ fontFamily: T.sans, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, maxWidth: 600, marginTop: 12 }}>
                    {profile.workshopDescription}
                  </p>
                )}
                {profile.creationProcess && (
                  <p style={{ fontFamily: T.sans, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 600, marginTop: 8 }}>
                    {profile.creationProcess}
                  </p>
                )}
              </div>

              {workshopImages.length > 0 && (
                <div className="grid gap-3" style={{
                  gridTemplateColumns: workshopImages.length === 1 ? '1fr'
                    : workshopImages.length === 2 ? 'repeat(2, 1fr)'
                    : 'repeat(3, 1fr)',
                }}>
                  {workshopImages.slice(0, 3).map((src, i) => (
                    <div key={i} className="overflow-hidden rounded-xl" style={{ aspectRatio: '4/3' }}>
                      <img src={src} alt={`Taller ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                  ))}
                </div>
              )}

              {(profile.workshopTools?.length ?? 0) > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {(profile.workshopTools ?? []).map(tool => (
                    <span key={tool} className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', fontFamily: T.sans, fontSize: 11, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 4. TÉCNICAS + MATERIALES ──────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-10 py-10">
          <div style={{ ...glassCard, borderRadius: 20, boxShadow: '0 4px 24px -6px rgba(0,0,0,0.06)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ '--tw-divide-opacity': 0.3, borderColor: `${T.dark}20` } as any}>

              {/* Técnicas */}
              {(profile.techniques?.length ?? 0) > 0 && (
                <div className="p-8 space-y-4">
                  <LabelCaps color={T.orange}>Técnicas</LabelCaps>
                  <div className="flex flex-wrap gap-2">
                    {(profile.techniques ?? []).map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-full" style={{ background: `${T.orange}12`, fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.orange }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Materiales */}
              {(profile.materials?.length ?? 0) > 0 && (
                <div className="p-8 space-y-4">
                  <LabelCaps color={T.orange}>Materiales</LabelCaps>
                  <div className="flex flex-wrap gap-2">
                    {(profile.materials ?? []).map(m => (
                      <span key={m} className="px-3 py-1.5 rounded-full" style={{ background: `${T.dark}08`, fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.dark, border: `1px solid ${T.dark}10` }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Esencia / Lo que me hace único */}
              {profile.uniqueness && (
                <div className="p-8 space-y-4">
                  <LabelCaps color={T.orange}>Lo que me hace único</LabelCaps>
                  <p style={{ fontFamily: T.sans, fontSize: 14, color: `${T.muted}cc`, lineHeight: 1.7 }}>
                    {profile.uniqueness}
                  </p>
                </div>
              )}
            </div>

            {/* Motivación */}
            {profile.motivation && (
              <div className="px-8 py-6 border-t" style={{ borderColor: `${T.dark}08`, background: `${T.orange}05` }}>
                <LabelCaps color={T.orange} style={{ display: 'block', marginBottom: 8 }}>¿Qué me motiva a seguir?</LabelCaps>
                <p style={{ fontFamily: T.sans, fontSize: 14, color: `${T.muted}cc`, lineHeight: 1.8, maxWidth: 740 }}>
                  {profile.motivation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── 5. GALERÍA HUMANA ──────────────────────────────────────────── */}
        {photos.length > 0 && (
          <div className="max-w-[1400px] mx-auto px-10 pb-6">
            <div className="mb-6">
              <LabelCaps color={T.orange} style={{ display: 'block', marginBottom: 4 }}>Galería humana</LabelCaps>
              <HeadingSerif size={28}>El oficio en imágenes</HeadingSerif>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.slice(0, 8).map((src, i) => (
                <div key={i} className="overflow-hidden rounded-xl group" style={{ aspectRatio: i % 5 === 0 ? '3/4' : '1/1' }}>
                  <img src={src} alt={`Galería ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. QUOTE FINAL ─────────────────────────────────────────────── */}
        {profile.craftMessage && (
          <div className="max-w-[1400px] mx-auto px-10 pb-10">
            <div className="p-12 rounded-2xl text-center" style={{ background: T.dark }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: T.orange, marginBottom: 16, display: 'block' }}>format_quote</span>
              <HeadingSerif size={28} style={{ color: 'white', maxWidth: 620, margin: '0 auto 16px' }}>
                {profile.craftMessage}
              </HeadingSerif>
              <p style={{ fontFamily: T.sans, fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                — {profile.artisanName ?? shop.shopName}
              </p>
              <Link to={`/tienda/${shopSlug}${isPreview ? '?preview=true' : ''}`}>
                <button
                  className="mt-8 px-8 py-3 rounded-full text-white transition-colors"
                  style={{ background: T.orange, fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}
                >
                  VER LAS PIEZAS DEL TALLER
                </button>
              </Link>
            </div>
          </div>
        )}

        <ShopPublicFooter shop={shop} shopSlug={shopSlug!} />
      </div>
    </ShoppingCartProvider>
  );
};

export default PublicArtisanProfile;
