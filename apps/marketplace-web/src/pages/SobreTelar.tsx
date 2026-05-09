import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles, TrendingUp } from "lucide-react";

// Imágenes editoriales subidas a S3
const S3_ABOUT_BASE =
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/hero-images/last-version/about";
const ABOUT_1_URL = `${S3_ABOUT_BASE}/about_1.jpeg`;
const ABOUT_2_URL = `${S3_ABOUT_BASE}/about_2.jpeg`;
// Artesana original — se mantiene al final
const ARTESANA_TEJIENDO_URL =
  "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/hero-images/last-version/artisan_capture.png";

export default function SobreTelar() {
  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Sobre Telar</span>
        </nav>
      </div>

      {/* 18.1 Hero — Qué es TELAR */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Imagen de fondo */}
          <img
            src={ABOUT_1_URL}
            alt="Artesanía colombiana"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 30%" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Overlay para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/60 to-charcoal/30" />

          <div className="relative px-8 md:px-16 py-20 md:py-32">
            <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-white tracking-tight">
              TELAR ES EL
              <br />
              <span className="italic text-primary">PUENTE DIGITAL</span>
              <br />
              DE LA ARTESANÍA
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-2xl font-sans leading-relaxed">
              Somos una plataforma que conecta directamente a artesanos colombianos
              con personas que valoran el trabajo manual, la tradición y el impacto
              social. Cada producto cuenta una historia, cada compra transforma una vida.
            </p>
          </div>
        </div>
      </section>

      {/* 18.2 Propósito — Por qué existe */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-[10px] uppercase tracking-widest font-sans text-primary font-bold">
                Nuestro propósito
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-6 text-charcoal tracking-tight">
              Preservar tradiciones,
              <br />
              <span className="italic text-primary">dignificar oficios</span>
            </h2>
            <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed mb-4">
              Colombia tiene una riqueza artesanal milenaria que se pierde entre
              intermediarios, bajos precios y falta de visibilidad. Muchos artesanos
              abandonan sus oficios porque no encuentran un canal justo para vender
              su trabajo.
            </p>
            <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed">
              Creamos TELAR para que cada artesano tenga su propia vitrina digital,
              controle sus precios, cuente su historia y construya un negocio
              sostenible desde su comunidad.
            </p>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <img
              src={ABOUT_2_URL}
              alt="Artesanos conectados a Telar"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 -z-10" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent p-6 md:p-8">
              <div className="text-5xl md:text-6xl font-bold text-white mb-1 font-serif">
                1.500+
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/80 font-sans font-bold">
                Artesanos conectados
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 18.3 Comercio justo — Honestidad en cada fibra */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-sans text-primary font-bold">
              Comercio justo
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-8 text-charcoal tracking-tight">
            Honestidad en
            <br />
            <span className="italic text-primary">cada fibra</span>
          </h2>

          <div className="space-y-5 max-w-3xl">
            <p className="text-base md:text-lg text-charcoal/70 font-sans leading-relaxed">
              En Telar eliminamos las barreras entre el territorio y tú. Nuestra
              plataforma habilita el comercio directo para que el beneficio
              económico llegue íntegramente a los verdaderos protagonistas:
              comunidades indígenas, afrodescendientes, campesinos y mujeres
              cabeza de familia que lideran la economía popular desde la
              Colombia profunda.
            </p>
            <p className="text-base md:text-lg text-charcoal/70 font-sans leading-relaxed">
              Comprar aquí es una inversión social: es garantizar un pago justo,
              respaldar el liderazgo de líderes sociales en sus comunidades y
              asegurar que el saber ancestral sea una oportunidad real para las
              nuevas generaciones. Sin intermediarios y con trazabilidad total,
              conectamos tu compra con la fuerza y la cultura de cada territorio.
            </p>
          </div>
        </div>
      </section>

      {/* 18.4 Inteligencia artesanal — Diferencia del sistema */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden order-2 md:order-1">
            <img
              src={ARTESANA_TEJIENDO_URL}
              alt="Artesana tejiendo con lanas de colores"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 -z-10" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent p-6 md:p-8">
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-sans text-white/70 font-bold mb-2">
                Tecnología al servicio
              </p>
              <p className="font-serif italic text-2xl md:text-3xl text-white leading-tight">
                de la tradición
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] uppercase tracking-widest font-sans text-primary font-bold">
                Inteligencia artesanal
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-6 text-charcoal tracking-tight">
              Tecnología al servicio
              <br />
              <span className="italic text-primary">de la tradición</span>
            </h2>
            <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed mb-4">
              No reemplazamos el trabajo artesanal con máquinas. Usamos tecnología
              para que los artesanos puedan:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-charcoal/70 font-sans leading-relaxed">
                  Crear su tienda en minutos sin conocimientos técnicos
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-charcoal/70 font-sans leading-relaxed">
                  Gestionar inventarios, pedidos y pagos desde su celular
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-charcoal/70 font-sans leading-relaxed">
                  Contar su historia y conectar con compradores de todo el país
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-charcoal/70 font-sans leading-relaxed">
                  Recibir pagos seguros directamente en su cuenta bancaria
                </span>
              </li>
            </ul>
            <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed">
              La tecnología amplifica su alcance, pero el corazón sigue siendo
              el trabajo manual, la dedicación y el conocimiento transmitido por
              generaciones.
            </p>
          </div>
        </div>
      </section>

      {/* 18.5 CTA a explorar */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 md:p-16 text-center text-white">
          <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-6 tracking-tight">
            Cada compra es un voto
            <br />
            <span className="italic">por un futuro más justo</span>
          </h2>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8 font-sans leading-relaxed">
            Explora el trabajo de cientos de artesanos colombianos y lleva a casa
            piezas únicas que cuentan historias de tradición, dedicación y esperanza.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/productos">
              <Button
                size="lg"
                variant="secondary"
                className="group"
              >
                Explorar productos
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/categorias">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Ver categorías
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 18.7 Footer */}
      <Footer showNewsletter />
    </div>
  );
}
