/**
 * Homepage — 100% CMS-driven via PageRenderer.
 *
 * Toda la página se compone de secciones en `cms_pages.pageKey='home'`
 * ordenadas por `position`. El curador reordena, añade y quita desde
 * el admin sin pedir cambios al equipo de frontend.
 *
 * Para añadir un widget hardcoded nuevo:
 *  1. Crearlo en `components/home/widgets/HomeWidgets.tsx`
 *  2. Registrarlo en `components/cms/SectionDispatcher.tsx` (WIDGET_REGISTRY)
 *  3. Añadir una sección `embedded_widget` con `payload.widget = 'tu_widget'`
 *     desde el admin o el seed.
 */
import { Helmet } from 'react-helmet-async';
import { Footer } from '@/components/Footer';
import { PageRenderer } from '@/components/cms/PageRenderer';

export default function Index() {
  return (
    <>
      <Helmet>
        <title>TELAR — Artesanía Colombiana</title>
        <meta
          name="description"
          content="Objetos auténticos creados por talleres artesanales de Colombia. Cada pieza conserva la historia, el origen y el conocimiento de quienes la crean."
        />
      </Helmet>

      <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c] font-sans selection:bg-[#7a8a7a] selection:text-white">
        {/* ═══════════════ HERO CAROUSEL (CMS) ═══════════════ */}

          <HeroSectionV2 />
      
        {/* ═══════════════ VALUE PROPS (CMS) ═══════════════ */}
        {valuePropsSection && <CmsSectionRenderer section={valuePropsSection} />}

        {/* ═══════════════ CATEGORIES ═══════════════ */}
        <section className="py-12 border-y border-[#2c2c2c]/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex flex-wrap justify-between gap-y-12">
              {categoriesHeader?.payload?.kicker && (
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] w-full mb-4 opacity-40">
                  {categoriesHeader.payload.kicker}
                </span>
              )}
              {displayCategories.map((cat) => (
                <div key={cat.id} className="w-full md:w-1/4 space-y-2 px-2">
                  <Link to={`/categoria/${cat.slug}`}>
                    <div className="aspect-[16/10] bg-[#e5e1d8] mb-4 overflow-hidden relative">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#e5e1d8]" />
                      )}
                    </div>
                  </Link>
                  <Link
                    to={`/categoria/${cat.slug}`}
                    className="text-xl font-serif hover:italic hover:text-[#ec6d13] transition-all"
                  >
                    {cat.name}
                  </Link>
                  <p className="text-[10px] text-[#2c2c2c]/50 uppercase tracking-widest">
                    {cat.subcategories.length > 0
                      ? cat.subcategories
                          .slice(0, 3)
                          .map((s) => s.name)
                          .join(", ")
                      : "Piezas artesanales únicas"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ FEATURED PRODUCTS (header CMS) ═══════════════ */}
        <section className="py-24 max-w-[1400px] mx-auto px-6">
          {featuredHeader && <CmsSectionRenderer section={featuredHeader} />}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {productsLoading || featuredProducts.length === 0
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-6 animate-pulse">
                    <div className="aspect-[3/4] bg-[#e5e1d8]" />
                    <div className="h-4 w-24 bg-[#e5e1d8]" />
                    <div className="h-6 w-3/4 bg-[#e5e1d8]" />
                    <div className="h-4 w-1/2 bg-[#e5e1d8]" />
                  </div>
                ))
              : featuredProducts.map((product, idx) => {
                  const imageUrl = product.imageUrl;
                  const price = product.price;
                  const shopName = product.storeName;
                  const department = product.department;
                  const technique = product.primaryTechnique;

                  return (
                    <article
                      key={product.id}
                      className={`group ${idx === 1 ? "mt-12 md:mt-24" : ""}`}
                    >
                      <Link to={`/product/${product.id}`}>
                        <div className="aspect-[3/4] bg-[#e5e1d8] mb-6 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden relative">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#e5e1d8]" />
                          )}
                        </div>
                        <div className="space-y-3">
                          <span className="inline-block bg-[#ec6d13]/10 text-[#ec6d13] text-[9px] uppercase tracking-widest px-2 py-0.5 mb-2">
                            Hecho a mano
                          </span>
                          <h3 className="text-2xl font-serif leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-xs uppercase tracking-widest text-[#2c2c2c]/50">
                            {shopName}
                            {department ? ` — ${department}` : ""}
                          </p>
                          <div className="pt-4 flex items-center justify-between border-t border-[#2c2c2c]/5">
                            <span className="font-medium">
                              {price != null
                                ? formatCurrency(price)
                                : "Consultar"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
          </div>
        </section>

        {/* ═══════════════ UN MARKETPLACE DIFERENTE (CMS) ═══════════════ */}
        {marketplaceDiferenteBlock && (
          <CmsSectionRenderer section={marketplaceDiferenteBlock} />
        )}

        {/* ═══════════════ COMERCIO JUSTO (CMS) ═══════════════ */}
        {comercioJustoBlock && (
          <CmsSectionRenderer section={comercioJustoBlock} />
        )}

        {/* ═══════════════ HUELLA DIGITAL ═══════════════ */}
        <section className="py-24 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
            <div className="aspect-square bg-[#e5e1d8]">
              {featuredProducts[1] && featuredProducts[1].imageUrl ? (
                <img
                  src={featuredProducts[1].imageUrl}
                  alt="Huella digital"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-10">
              <h2 className="text-5xl font-serif leading-tight">
                Cada pieza tiene una huella digital
              </h2>
              <p className="text-xl text-[#2c2c2c]/70 leading-relaxed font-light mb-8">
                Cada objeto en Telar conserva un registro que documenta su
                origen cultural, el taller que lo creó y su proceso artesanal.
              </p>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <span className="text-[#ec6d13] font-serif italic text-3xl">
                    01
                  </span>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2">
                      Taller artesanal
                    </h4>
                    <p className="text-[#2c2c2c]/60 text-sm">
                      Ubicación geográfica exacta donde se produjo la pieza.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="text-[#ec6d13] font-serif italic text-3xl">
                    02
                  </span>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2">
                      Maestro artesano
                    </h4>
                    <p className="text-[#2c2c2c]/60 text-sm">
                      Nombre y rostro de los maestros artesanos detrás de la
                      creación.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="text-[#ec6d13] font-serif italic text-3xl">
                    03
                  </span>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2">
                      Proceso documentado
                    </h4>
                    <p className="text-[#2c2c2c]/60 text-sm">
                      Detalles de la técnica, materiales y tiempo de
                      elaboración.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/productos"
                className="inline-block border border-[#2c2c2c] px-10 py-4 uppercase text-xs tracking-widest hover:bg-[#2c2c2c] hover:text-white transition-all"
              >
                Explorar el registro de autenticidad
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════ FEATURED SHOP ═══════════════ */}
        <section className="py-32 bg-[#fdfaf6]">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-20 opacity-40">
              Conoce a los talleres artesanales
            </h2>
            <div className="grid lg:grid-cols-2 gap-20 items-stretch">
              {/* Shop image */}
              <div className="min-h-[500px] bg-[#e5e1d8] overflow-hidden">
                {featuredShop?.bannerUrl ? (
                  <img
                    src={featuredShop.bannerUrl}
                    alt={featuredShop.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : featuredShop?.logoUrl ? (
                  <img
                    src={featuredShop.logoUrl}
                    alt={featuredShop.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              {/* Shop info */}
              <div className="flex flex-col justify-center py-10 space-y-8">
                {featuredShop ? (
                  <>
                    <div className="space-y-2">
                      <span className="text-[#ec6d13] font-bold uppercase tracking-widest text-[11px]">
                        Taller del Mes
                      </span>
                      <h3 className="text-5xl md:text-6xl font-serif">
                        {featuredShop.shopName}
                      </h3>
                      <p className="text-[#2c2c2c]/50 italic font-serif text-xl">
                        {featuredShop.municipality && featuredShop.department
                          ? `${featuredShop.municipality}, ${featuredShop.department}`
                          : featuredShop.department || "Colombia"}
                      </p>
                    </div>
                    <div className="space-y-6">
                      {featuredShop.craftType && (
                        <div className="flex items-start gap-4 pb-6 border-b border-[#2c2c2c]/10">
                          <span className="text-[#ec6d13] mt-1 text-xl">★</span>
                          <span className="text-lg font-serif">
                            Especialidad: {featuredShop.craftType}
                          </span>
                        </div>
                      )}
                      <p className="text-lg leading-relaxed text-[#2c2c2c]/80">
                        {featuredShop.story ||
                          "Taller artesanal dedicado al tejido tradicional con técnicas transmitidas entre generaciones."}
                      </p>
                      <Link
                        to={`/artesano/${featuredShop.shopSlug}`}
                        className="text-xs font-bold uppercase tracking-widest border-b border-[#2c2c2c] pb-1 hover:text-[#ec6d13] hover:border-[#ec6d13] transition-colors"
                      >
                        Ver perfil del taller
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-[#e5e1d8]" />
                    <div className="h-16 w-full bg-[#e5e1d8]" />
                    <div className="h-6 w-64 bg-[#e5e1d8]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ REGALOS CON HISTORIA ═══════════════ */}
        <section className="py-24 bg-[#f9f7f2]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-8">
                <h2 className="text-5xl font-serif">Regalos con historia</h2>
                <p className="text-xl text-[#2c2c2c]/70 leading-relaxed font-light">
                  En Telar puedes encontrar piezas especiales para regalar en
                  momentos importantes. Cada objeto hecho a mano lleva consigo
                  tradición, conocimiento y dedicación.
                </p>
                <Link
                  to="/giftcards"
                  className="inline-block bg-[#2c2c2c] text-white px-10 py-4 uppercase text-xs tracking-widest hover:bg-[#ec6d13] transition-colors"
                >
                  Explorar piezas para regalar
                </Link>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div className="aspect-square bg-[#e5e1d8] overflow-hidden">
                  {featuredProducts[1] && featuredProducts[1].imageUrl ? (
                    <img
                      src={featuredProducts[1].imageUrl}
                      alt="Regalo artesanal"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="aspect-square bg-[#e5e1d8] mt-12 overflow-hidden">
                  {featuredProducts[2] && featuredProducts[2].imageUrl ? (
                    <img
                      src={featuredProducts[2].imageUrl}
                      alt="Regalo artesanal"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ COLECCIONES ═══════════════ */}
        <section className="py-24">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-16 opacity-40">
              Colecciones
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Link to="/productos" className="group cursor-pointer">
                <div className="aspect-[4/5] bg-[#e5e1d8] mb-6 overflow-hidden relative">
                  {displayCategories[0]?.imageUrl && (
                    <img
                      src={displayCategories[0].imageUrl}
                      alt="Piezas para el hogar"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-serif italic">
                  Piezas para el hogar
                </h3>
                <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">
                  Objetos que cuentan historias
                </p>
              </Link>
              <Link to="/productos" className="group cursor-pointer">
                <div className="aspect-[4/5] bg-[#e5e1d8] mb-6 overflow-hidden relative">
                  {displayCategories[1]?.imageUrl && (
                    <img
                      src={displayCategories[1].imageUrl}
                      alt="Textiles con historia"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-serif italic">
                  Textiles con historia
                </h3>
                <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">
                  Tejidos a mano en telar
                </p>
              </Link>
              <Link to="/giftcards" className="group cursor-pointer">
                <div className="aspect-[4/5] bg-[#e5e1d8] mb-6 overflow-hidden relative">
                  {displayCategories[2]?.imageUrl && (
                    <img
                      src={displayCategories[2].imageUrl}
                      alt="Creaciones para regalar"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-serif italic">
                  Creaciones para regalar
                </h3>
                <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">
                  Detalles con alma
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════ ALIADOS ═══════════════ */}
        <section className="py-24 border-t border-[#2c2c2c]/10">
          <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-[10px] font-bold text-[#2c2c2c]/40 uppercase tracking-[0.4em]">
              Aliados
            </h2>
            <div className="flex flex-col items-center gap-6">
              <img
                src="https://telar-prod-bucket.s3.us-east-1.amazonaws.com/marketplace-home/artesanias_de_colombia.png"
                alt="Artesanías de Colombia"
                className="w-48 h-auto object-contain"
              />
              <h3 className="text-2xl font-serif">
                Con el apoyo de Artesanías de Colombia
              </h3>
            </div>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <Footer />
      </div>
    </>
  );
}
