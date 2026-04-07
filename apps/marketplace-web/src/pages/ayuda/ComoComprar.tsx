import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { ChevronLeft, Search, ShoppingCart, CreditCard, Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: 1,
    title: "Explora y encuentra",
    description: "Navega por categorías o busca productos específicos. Conoce la historia detrás de cada artesano.",
    icon: Search,
    color: "from-blue-500/20 to-blue-500/5"
  },
  {
    number: 2,
    title: "Agrega al carrito",
    description: "Selecciona las piezas que te gusten y agrégalas a tu carrito. Puedes comprar de varios artesanos a la vez.",
    icon: ShoppingCart,
    color: "from-green-500/20 to-green-500/5"
  },
  {
    number: 3,
    title: "Completa tu compra",
    description: "Ingresa tu dirección de envío y elige tu método de pago. Todos los pagos son 100% seguros.",
    icon: CreditCard,
    color: "from-purple-500/20 to-purple-500/5"
  },
  {
    number: 4,
    title: "Recibe tu pedido",
    description: "El artesano preparará tu pedido con cuidado. Recibirás notificaciones del estado de envío.",
    icon: Package,
    color: "from-orange-500/20 to-orange-500/5"
  },
  {
    number: 5,
    title: "Disfruta tu compra",
    description: "Recibe piezas únicas hechas con amor. Cada compra apoya directamente a comunidades artesanales.",
    icon: CheckCircle,
    color: "from-primary/20 to-primary/5"
  }
];

const tips = [
  "Revisa las fotos y descripciones de los productos cuidadosamente",
  "Lee las políticas de cada tienda sobre envíos y devoluciones",
  "Contacta al artesano si tienes dudas específicas sobre un producto",
  "Verifica los tiempos de producción, algunos productos se hacen bajo pedido",
  "Guarda tu recibo digital para cualquier consulta futura"
];

export default function ComoComprar() {
  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link to="/ayuda" className="hover:text-primary transition-colors">
            Ayuda
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Cómo comprar</span>
        </nav>
      </div>

      {/* Header */}
      <section className="max-w-[1400px] mx-auto px-6 mb-16">
        <Link to="/ayuda">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Ayuda
          </Button>
        </Link>
        <div className="py-8 border-b border-charcoal/5">
          <h1 className="text-5xl md:text-6xl leading-tight font-serif mb-6 text-charcoal tracking-tight">
            ¿Cómo comprar
            <br />
            <span className="italic text-primary">en TELAR?</span>
          </h1>
          <p className="text-base md:text-lg text-charcoal/70 max-w-2xl font-sans leading-relaxed">
            Guía paso a paso para realizar tu compra y apoyar a artesanos colombianos
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-6 items-start">
              <div className={`flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center border border-charcoal/5`}>
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 bg-white rounded-2xl p-8 border border-charcoal/5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-2xl font-serif text-charcoal">
                    {step.title}
                  </h3>
                  <span className="text-5xl font-bold text-primary/20">
                    {step.number}
                  </span>
                </div>
                <p className="text-charcoal/70 font-sans leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5">
          <h2 className="text-3xl font-serif mb-8 text-charcoal">
            Consejos para una
            <span className="italic text-primary"> mejor experiencia</span>
          </h2>
          <ul className="space-y-4">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-charcoal/70 font-sans leading-relaxed">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-serif mb-3">
            ¿Listo para comenzar?
          </h3>
          <p className="text-white/90 font-sans mb-6 max-w-xl mx-auto">
            Explora productos únicos hechos por artesanos colombianos
          </p>
          <Link to="/productos">
            <Button size="lg" variant="secondary">
              Explorar productos
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
