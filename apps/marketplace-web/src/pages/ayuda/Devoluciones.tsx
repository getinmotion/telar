import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { ChevronLeft, RotateCcw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const devolutionProcess = [
  {
    step: 1,
    title: "Contacta al artesano",
    description: "Dentro de los 7 días calendario de recibido el producto, comunícate con el artesano a través de TELAR para notificar tu intención de devolución."
  },
  {
    step: 2,
    title: "Prepara el producto",
    description: "Empaca el producto en su embalaje original con todas las etiquetas y accesorios. El producto debe estar en perfectas condiciones, sin uso ni daños."
  },
  {
    step: 3,
    title: "Coordinación de devolución",
    description: "El artesano te indicará cómo proceder con el envío de devolución. En algunos casos, podrás devolver el producto en persona."
  },
  {
    step: 4,
    title: "Reembolso",
    description: "Una vez el artesano confirme la recepción y el estado del producto, se procesará el reembolso en un plazo de 5-10 días hábiles al mismo método de pago."
  }
];

const acceptedReasons = [
  "Producto defectuoso o con fallas de fabricación",
  "Producto diferente al descrito o fotografiado",
  "Producto dañado durante el envío",
  "Error en el pedido (color, tamaño, variante incorrecta)"
];

const notAcceptedReasons = [
  "Cambio de opinión después de usar el producto",
  "Productos personalizados o hechos bajo pedido específico",
  "Productos sin embalaje original o con señales de uso",
  "Daños causados por mal uso o manipulación incorrecta",
  "Solicitudes fuera del plazo de 7 días calendario"
];

const importantNotes = [
  "El comprador asume el costo del envío de devolución, excepto en casos de producto defectuoso o error del vendedor",
  "Los productos artesanales pueden tener variaciones naturales en color, tamaño y acabado que son parte de su carácter único",
  "Cada artesano puede tener políticas específicas adicionales, revísalas antes de comprar",
  "Productos en liquidación o descuento especial pueden tener políticas diferentes",
  "Guarda tu recibo digital y el comprobante de envío de devolución"
];

export default function Devoluciones() {
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
          <span className="text-primary font-bold">Devoluciones</span>
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
            Políticas de
            <br />
            <span className="italic text-primary">devoluciones</span>
          </h1>
          <p className="text-base md:text-lg text-charcoal/70 max-w-2xl font-sans leading-relaxed">
            Información sobre cómo devolver productos y obtener reembolsos
          </p>
        </div>
      </section>

      {/* Plazo de devolución */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 border border-primary/20 text-center">
          <RotateCcw className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-3 text-charcoal">
            Tienes <span className="italic text-primary">7 días calendario</span>
          </h2>
          <p className="text-charcoal/70 font-sans text-lg">
            para solicitar una devolución desde que recibes tu producto
          </p>
        </div>
      </section>

      {/* Proceso de devolución */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <h2 className="text-3xl font-serif mb-8 text-charcoal">
          Proceso de <span className="italic text-primary">devolución</span>
        </h2>
        <div className="space-y-6">
          {devolutionProcess.map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-8 border border-charcoal/5">
              <div className="flex items-start gap-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-charcoal mb-2">
                    {item.title}
                  </h3>
                  <p className="text-charcoal/70 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Motivos aceptados y no aceptados */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Aceptados */}
          <div className="bg-white rounded-2xl p-8 border border-green-500/20">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-charcoal">
                Motivos aceptados
              </h3>
            </div>
            <ul className="space-y-3">
              {acceptedReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* No aceptados */}
          <div className="bg-white rounded-2xl p-8 border border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-semibold text-charcoal">
                Motivos no aceptados
              </h3>
            </div>
            <ul className="space-y-3">
              {notAcceptedReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Notas importantes */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl p-8 md:p-12 border border-amber-500/20">
          <div className="flex items-start gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-serif text-charcoal mb-6">
                Información <span className="italic text-primary">importante</span>
              </h2>
              <ul className="space-y-3">
                {importantNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                    <span className="text-charcoal/70 font-sans leading-relaxed">
                      {note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-white rounded-2xl p-8 text-center border border-charcoal/5">
          <h3 className="text-2xl font-serif mb-3 text-charcoal">
            ¿Necesitas ayuda con una devolución?
          </h3>
          <p className="text-charcoal/70 font-sans mb-6">
            Contacta a nuestro equipo de soporte para asistencia personalizada
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
