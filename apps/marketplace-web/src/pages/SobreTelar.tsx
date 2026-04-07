import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Sparkles, TrendingUp } from "lucide-react";

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
        <div className="py-8 border-b border-charcoal/5">
          <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-charcoal tracking-tight">
            TELAR ES EL
            <br />
            <span className="italic text-primary">PUENTE DIGITAL</span>
            <br />
            DE LA ARTESANÍA
          </h1>
          <p className="text-base md:text-lg text-charcoal/70 max-w-2xl font-sans leading-relaxed">
            Somos una plataforma que conecta directamente a artesanos colombianos
            con personas que valoran el trabajo manual, la tradición y el impacto
            social. Cada producto cuenta una historia, cada compra transforma una vida.
          </p>
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
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl font-bold text-primary mb-2">1.500+</div>
                <div className="text-sm uppercase tracking-widest text-charcoal/60 font-sans">
                  Artesanos conectados
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 18.3 Comercio justo — Cómo funciona */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-sans text-primary font-bold">
              Comercio justo
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-8 text-charcoal tracking-tight">
            Transparencia en
            <br />
            <span className="italic text-primary">cada transacción</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-3xl font-bold text-primary">85%</div>
              <h3 className="text-lg font-semibold text-charcoal">
                Va directo al artesano
              </h3>
              <p className="text-sm text-charcoal/70 font-sans leading-relaxed">
                El artesano recibe la mayor parte del precio de venta. Solo
                cobramos una comisión del 15% para mantener la plataforma.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-3xl font-bold text-primary">0</div>
              <h3 className="text-lg font-semibold text-charcoal">
                Intermediarios
              </h3>
              <p className="text-sm text-charcoal/70 font-sans leading-relaxed">
                Conexión directa entre artesano y comprador. Sin cadenas de
                distribución que inflan precios y reducen ganancias.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-3xl font-bold text-primary">100%</div>
              <h3 className="text-lg font-semibold text-charcoal">
                Precios justos
              </h3>
              <p className="text-sm text-charcoal/70 font-sans leading-relaxed">
                Cada artesano define sus precios considerando materiales, tiempo
                y valor de su conocimiento ancestral.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 18.4 Inteligencia artesanal — Diferencia del sistema */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-lg overflow-hidden order-2 md:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-32 w-32 text-primary/30" />
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

      {/* 18.5 Impacto — Comunidades, talleres */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-sans text-primary font-bold">
              Nuestro impacto
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-6 text-charcoal tracking-tight">
            Más que ventas,
            <br />
            <span className="italic text-primary">transformación social</span>
          </h2>
          <p className="text-sm md:text-base text-charcoal/70 max-w-2xl mx-auto font-sans leading-relaxed">
            Cada compra en TELAR genera un efecto multiplicador en las comunidades
            artesanales de Colombia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-charcoal/5">
            <div className="text-4xl font-bold text-primary mb-2">42</div>
            <div className="text-sm font-semibold text-charcoal mb-2">
              Municipios conectados
            </div>
            <div className="text-xs text-charcoal/60 font-sans">
              Desde La Guajira hasta el Amazonas
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-charcoal/5">
            <div className="text-4xl font-bold text-primary mb-2">1.500+</div>
            <div className="text-sm font-semibold text-charcoal mb-2">
              Artesanos activos
            </div>
            <div className="text-xs text-charcoal/60 font-sans">
              Vendiendo y creciendo cada mes
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-charcoal/5">
            <div className="text-4xl font-bold text-primary mb-2">350</div>
            <div className="text-sm font-semibold text-charcoal mb-2">
              Talleres familiares
            </div>
            <div className="text-xs text-charcoal/60 font-sans">
              Preservando técnicas ancestrales
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-charcoal/5">
            <div className="text-4xl font-bold text-primary mb-2">$2.5M</div>
            <div className="text-sm font-semibold text-charcoal mb-2">
              Millones pagados
            </div>
            <div className="text-xs text-charcoal/60 font-sans">
              Directamente a artesanos en 2024
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-8 border border-primary/20">
            <h3 className="text-xl font-semibold text-charcoal mb-4">
              Comunidades indígenas
            </h3>
            <p className="text-sm text-charcoal/70 font-sans leading-relaxed mb-4">
              Trabajamos con comunidades Wayuu, Arhuaca, Emberá y Zenú,
              respetando sus procesos tradicionales y garantizando que
              mantengan el control de su conocimiento ancestral.
            </p>
            <p className="text-xs text-charcoal/60 font-sans">
              Certificación de origen y autenticidad en cada producto
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/10 rounded-lg p-8 border border-amber-500/20">
            <h3 className="text-xl font-semibold text-charcoal mb-4">
              Talleres urbanos
            </h3>
            <p className="text-sm text-charcoal/70 font-sans leading-relaxed mb-4">
              Apoyamos a artesanos en ciudades que mantienen vivas técnicas
              como la cerámica, el tejido, la marroquinería y la joyería,
              generando empleo local de calidad.
            </p>
            <p className="text-xs text-charcoal/60 font-sans">
              Capacitación continua en diseño y gestión de negocio
            </p>
          </div>
        </div>
      </section>

      {/* 18.6 CTA a explorar */}
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
      <Footer />
    </div>
  );
}
