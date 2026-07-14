import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Qué es COCREA?",
    answer: "COCREA es el marketplace del Programa Nacional Escuelas Taller de Colombia (PNET), una iniciativa del Ministerio de las Culturas, las Artes y los Saberes. Conecta los productos elaborados por egresados y egresadas, maestras y maestros de las Escuelas Taller y emprendimientos culturales de todo el país con personas que valoran el trabajo hecho a mano, la tradición y la construcción de paz."
  },
  {
    question: "¿Los productos son 100% artesanales?",
    answer: "Sí, todos los productos en COCREA son elaborados a mano por artesanas, artesanos, Escuelas Taller y unidades productivas colombianas. Verificamos la autenticidad y el origen de cada pieza antes de publicarla en la plataforma."
  },
  {
    question: "¿Cómo sé que mi compra llega al artesano?",
    answer: "COCREA habilita el comercio directo entre compradores y talleres, sin intermediarios: cada compra fortalece a las unidades productivas, a las Escuelas Taller y a las economías culturales, populares y comunitarias de los territorios."
  },
  {
    question: "¿Puedo comprar directamente desde la tienda del artesano?",
    answer: "Sí, cada artesano tiene su propia tienda digital donde puedes ver todos sus productos, conocer su historia y realizar compras directas."
  },
  {
    question: "¿Los precios incluyen envío?",
    answer: "No, el costo de envío se calcula según tu ubicación y se muestra antes de confirmar la compra. Algunos artesanos ofrecen retiro en local sin costo adicional."
  },
  {
    question: "¿Cuánto tiempo tarda en llegar mi pedido?",
    answer: "Los tiempos de envío varían según la ubicación del artesano y tu dirección. Generalmente entre 3-7 días hábiles para envíos nacionales. Verás el tiempo estimado antes de comprar."
  },
  {
    question: "¿Puedo devolver un producto?",
    answer: "Sí, tienes 7 días calendario desde que recibes el producto para solicitar una devolución. El producto debe estar en las mismas condiciones en que lo recibiste."
  },
  {
    question: "¿Cómo contacto al artesano directamente?",
    answer: "Cada tienda de artesano tiene información de contacto disponible. También puedes enviar mensajes a través de la plataforma."
  },
  {
    question: "¿Necesito crear una cuenta para comprar?",
    answer: "Puedes navegar sin cuenta, pero necesitas registrarte para finalizar una compra. Esto nos ayuda a proteger tanto a compradores como a artesanos."
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos tarjetas de crédito, débito, PSE, Nequi y gift cards de COCREA. Todos los pagos son seguros y procesados a través de plataformas certificadas."
  },
  {
    question: "¿Puedo comprar varios productos de diferentes artesanos?",
    answer: "Sí, puedes agregar productos de múltiples tiendas a tu carrito. Ten en cuenta que cada artesano enviará sus productos de forma independiente."
  },
  {
    question: "¿Ofrecen gift cards?",
    answer: "Sí, puedes comprar gift cards digitales de COCREA. Son perfectas para regalar y apoyar a los artesanos colombianos."
  }
];

export default function FAQs() {
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
          <span className="text-primary font-bold">FAQs</span>
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
            Preguntas
            <br />
            <span className="italic text-primary">frecuentes</span>
          </h1>
          <p className="text-base md:text-lg text-charcoal/70 max-w-2xl font-sans leading-relaxed">
            Encuentra respuestas a las preguntas más comunes sobre COCREA
          </p>
        </div>
      </section>

      {/* FAQs Accordion */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="bg-white rounded-2xl border border-charcoal/5 p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-charcoal hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-charcoal/70 font-sans leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center border border-primary/20">
          <h3 className="text-2xl font-serif mb-3 text-charcoal">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-charcoal/70 font-sans mb-6">
            Contacta a nuestro equipo de soporte
          </p>
          <Link to="/ayuda/contacto">
            <Button size="lg">
              Contáctanos
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
