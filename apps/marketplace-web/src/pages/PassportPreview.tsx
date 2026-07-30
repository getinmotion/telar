/**
 * PassportPreview — vista previa del pasaporte digital / certificado de
 * autenticidad de una pieza. Ruta: /pasaporte/:id
 *
 * Se alimenta solo de datos públicos del producto: es la muestra de cómo se ve
 * el documento. El pasaporte definitivo (con folio, comprador y sello) se emite
 * con la compra y vive en /product-identity.
 */

import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, MapPin, ShieldCheck } from "lucide-react";
import { useProducts } from "@/contexts/ProductsContext";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { InstitutionalLogos } from "@/components/InstitutionalLogos";
import type { Product } from "@/types/products.types";
import type { ArtisanShop } from "@/types/artisan-shops.types";

/** Ficha "campo: valor" del documento. */
const Field = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="border-t border-charcoal/10 pt-3">
      <dt className="text-[9px] font-bold uppercase tracking-[0.25em] text-charcoal/40 mb-1.5">
        {label}
      </dt>
      <dd className="text-sm text-charcoal/80 leading-relaxed">{value}</dd>
    </div>
  );
};

const Block = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-12">
    <h2 className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-6">
      {title}
    </h2>
    <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-5">{children}</dl>
  </section>
);

const formatDimensions = (product: Product): string | null => {
  const d = product.dimensions;
  if (!d) return null;
  if (typeof d === "string") return d;
  const parts = [
    d.width != null ? `${d.width} cm de ancho` : null,
    d.height != null ? `${d.height} cm de alto` : null,
    d.length != null ? `${d.length} cm de profundidad` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
};

const PassportPreview = () => {
  const { id } = useParams();
  const { fetchProductById } = useProducts();
  const { fetchShopById } = useArtisanShops();
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<ArtisanShop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    (async () => {
      try {
        const data = await fetchProductById(id);
        if (cancelled) return;
        setProduct(data);
        if (data?.shopId) {
          const shopData = await fetchShopById(data.shopId);
          if (!cancelled && shopData) setShop(shopData);
        }
      } catch {
        // el contexto ya reporta el error
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /** Folio de muestra — el definitivo se asigna al emitir el pasaporte. */
  const folio = useMemo(() => {
    if (!product) return "";
    const short = product.id.replace(/\D/g, "").slice(-4).padStart(4, "0");
    return `VA-${new Date().getFullYear()}-${short}`;
  }, [product]);

  const origin = [
    shop?.municipality || shop?.region || product?.city,
    shop?.department || product?.department,
  ]
    .filter(Boolean)
    .join(", ");

  if (loading) {
    return (
      <div className="bg-editorial-bg min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-editorial-bg min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif">Pieza no encontrada</h1>
          <p className="text-charcoal/60 text-sm">
            No pudimos cargar el pasaporte de esta pieza.
          </p>
          <Link
            to="/productos"
            className="inline-block border border-charcoal px-8 py-3 uppercase text-[11px] font-bold tracking-[0.2em] hover:bg-charcoal hover:text-white transition-all"
          >
            Explorar piezas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Pasaporte digital — ${product.name} | Villa Adelaida`}</title>
        <meta
          name="description"
          content={`Vista previa del pasaporte digital de ${product.name}: origen, autoría, materiales y proceso.`}
        />
      </Helmet>

      <div className="bg-editorial-bg min-h-screen text-charcoal">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-charcoal/50 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la pieza
          </Link>

          {/* ── Documento ── */}
          <article className="bg-white border border-charcoal/10 shadow-sm">
            {/* Encabezado institucional */}
            <header className="px-8 md:px-12 pt-10 pb-8 border-b border-charcoal/10">
              <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-primary mb-3">
                    Villa Adelaida
                  </p>
                  <h1 className="text-4xl md:text-5xl font-serif leading-tight">
                    Pasaporte
                    <br />
                    <span className="italic">de trazabilidad</span>
                  </h1>
                </div>
                <span className="inline-flex items-center gap-2 border border-primary/40 bg-primary/5 text-primary px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Vista previa
                </span>
              </div>
              <InstitutionalLogos size="sm" />
            </header>

            {/* Identificación de la pieza */}
            <div className="px-8 md:px-12 py-10 grid md:grid-cols-[1fr_1.2fr] gap-10 items-start border-b border-charcoal/10">
              <div className="aspect-[4/5] bg-[#F3E4D3] overflow-hidden border border-charcoal/10">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-charcoal/40 mb-2">
                    Folio de muestra
                  </p>
                  <p className="font-mono text-lg text-primary">{folio}</p>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif italic leading-tight">
                  {product.name}
                </h2>
                {product.storeName && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-charcoal/50">
                    Taller: {product.storeName}
                  </p>
                )}
                {origin && (
                  <p className="flex items-center gap-2 text-sm text-charcoal/70">
                    <MapPin className="w-4 h-4 text-primary" />
                    {origin} — Colombia
                  </p>
                )}
                {product.shortDescription && (
                  <p className="text-sm text-charcoal/70 leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Fichas */}
            <div className="px-8 md:px-12 py-10">
              <Block title="Origen y autoría">
                <Field label="Taller" value={product.storeName} />
                <Field
                  label="Ubicación"
                  value={origin ? `${origin}, Colombia` : null}
                />
                <Field
                  label="Oficio"
                  value={product.craft || shop?.craftType || null}
                />
                <Field
                  label="Técnica principal"
                  value={product.techniques?.[0] || null}
                />
                <Field
                  label="Técnica secundaria"
                  value={product.secondaryTechnique || null}
                />
                <Field
                  label="Colaboración"
                  value={
                    product.isCollaboration && product.collaborationName
                      ? product.collaborationName
                      : null
                  }
                />
              </Block>

              <Block title="Ficha técnica">
                <Field label="Categoría" value={product.category} />
                <Field label="Subcategoría" value={product.subcategoryName} />
                <Field
                  label="Materiales"
                  value={
                    product.materials?.length
                      ? product.materials.join(", ")
                      : null
                  }
                />
                <Field label="Dimensiones" value={formatDimensions(product)} />
                <Field
                  label="Peso"
                  value={
                    product.weight
                      ? // El backend guarda el peso en kg como número suelto.
                        `${product.weight} kg`
                      : null
                  }
                />
                <Field
                  label="Tiempo de elaboración"
                  value={product.productionTime}
                />
                <Field
                  label="Tipo de pieza"
                  value={product.pieceType}
                />
                <Field
                  label="Herramientas"
                  value={product.tools?.length ? product.tools.join(", ") : null}
                />
              </Block>

              {(product.processDescription || product.history) && (
                <section className="mb-12">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-6">
                    Proceso y contexto
                  </h2>
                  <div className="space-y-4 text-sm text-charcoal/75 leading-relaxed">
                    {product.processDescription && (
                      <p>{product.processDescription}</p>
                    )}
                    {product.history && <p>{product.history}</p>}
                  </div>
                </section>
              )}

              {(product.careNotes || product.usageSuggestions) && (
                <Block title="Cuidados y uso">
                  <Field label="Cuidados" value={product.careNotes} />
                  <Field label="Uso sugerido" value={product.usageSuggestions} />
                </Block>
              )}
            </div>

            {/* Pie del documento */}
            <footer className="px-8 md:px-12 py-10 bg-[#FBEFE1] border-t border-charcoal/10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-xl space-y-3">
                  <h3 className="font-serif italic text-xl">
                    Sello de validación Villa Adelaida
                  </h3>
                  <p className="text-sm text-charcoal/70 leading-relaxed">
                    Esta pieza está registrada en la plataforma dentro del
                    Programa de fortalecimiento comercial – Villa Adelaida. Al
                    adquirirla, usted recibe su pasaporte de trazabilidad
                    definitivo, con folio propio y el registro de origen y autoría
                    verificado.
                  </p>
                </div>
                <Link
                  to={`/product/${product.id}`}
                  className="shrink-0 inline-block bg-charcoal text-white px-8 py-4 uppercase text-[11px] font-bold tracking-[0.2em] hover:bg-primary transition-colors"
                >
                  Ver la pieza
                </Link>
              </div>
            </footer>
          </article>

          <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 text-center mt-8">
            Documento de muestra · Consultado el{" "}
            {new Date().toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default PassportPreview;
