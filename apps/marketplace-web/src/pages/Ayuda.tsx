import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronRight, MessageCircle, ShoppingBag, Settings, Package, RotateCcw, Mail } from "lucide-react";

const helpCategories = [
  {
    id: "faqs",
    title: "FAQs",
    description: "Preguntas frecuentes sobre TELAR",
    icon: MessageCircle,
  },
  {
    id: "como-comprar",
    title: "Cómo comprar",
    description: "Guía paso a paso para realizar tu compra",
    icon: ShoppingBag,
  },
  {
    id: "envios",
    title: "Envíos",
    description: "Información sobre tiempos y costos de envío",
    icon: Package,
  },
  {
    id: "devoluciones",
    title: "Devoluciones",
    description: "Políticas y proceso de devoluciones",
    icon: RotateCcw,
  },
];

export default function Ayuda() {
  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Ayuda</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 mb-16">
        <div className="py-8 text-center">
          <h1 className="text-5xl md:text-6xl leading-tight font-serif mb-4 text-charcoal tracking-tight">
            ¿Con qué te ayudamos?
          </h1>
        </div>
      </section>

      {/* Explora las preguntas frecuentes */}
      <section className="max-w-[1400px] mx-auto px-6 mb-16">
        <h2 className="text-2xl md:text-3xl font-serif mb-8 text-charcoal">
          Explora las preguntas frecuentes
        </h2>

        <div className="bg-white rounded-2xl border border-charcoal/5 divide-y divide-charcoal/5">
          {helpCategories.map((category) => (
            <Link
              key={category.id}
              to={`/ayuda/${category.id}`}
              className="flex items-center justify-between p-6 hover:bg-charcoal/5 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-charcoal/60 font-sans">
                    {category.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-charcoal/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* ¿Necesitas más ayuda? */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif mb-3 text-charcoal">
                ¿Necesitas más ayuda?
              </h2>
              <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed">
                Nuestro equipo está disponible para responder tus preguntas
              </p>
            </div>
            <Link to="/ayuda/contacto">
              <Button
                size="lg"
                className="group"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contáctanos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
