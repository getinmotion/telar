import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { ChevronLeft, Truck, MapPin, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const shippingOptions = [
  {
    title: "Envío nacional - Servientrega",
    description: "Cobertura en todo Colombia",
    time: "3-7 días hábiles",
    icon: Truck,
    features: [
      "Rastreo en tiempo real con número de guía",
      "Seguro incluido hasta $500.000",
      "Entrega puerta a puerta",
      "Costo calculado según peso y destino"
    ]
  },
  {
    title: "Retiro en local",
    description: "Directamente en el taller del artesano",
    time: "Disponible inmediatamente",
    icon: MapPin,
    features: [
      "Sin costo adicional",
      "Conoce personalmente al artesano",
      "Coordina horario directamente",
      "Disponible solo en algunas tiendas"
    ]
  }
];

const shippingCosts = [
  { destination: "Bogotá y alrededores", cost: "$8.000 - $15.000", time: "2-3 días" },
  { destination: "Principales ciudades", cost: "$12.000 - $20.000", time: "3-5 días" },
  { destination: "Zonas rurales", cost: "$18.000 - $35.000", time: "5-7 días" },
  { destination: "San Andrés y zona insular", cost: "$25.000 - $45.000", time: "5-10 días" }
];

const importantNotes = [
  "El costo de envío se calcula automáticamente según tu código postal",
  "Cada artesano envía sus productos de forma independiente",
  "Si compras de múltiples tiendas, pagarás un envío por cada una",
  "Los tiempos estimados pueden variar en temporadas de alta demanda",
  "Recibirás un email con el número de seguimiento cuando tu pedido sea enviado",
  "Los productos hechos bajo pedido pueden tomar tiempo adicional de producción"
];

export default function Envios() {
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
          <span className="text-primary font-bold">Envíos</span>
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
            Información de
            <br />
            <span className="italic text-primary">envíos</span>
          </h1>
          <p className="text-base md:text-lg text-charcoal/70 max-w-2xl font-sans leading-relaxed">
            Todo lo que necesitas saber sobre entregas y tiempos de envío
          </p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <h2 className="text-3xl font-serif mb-8 text-charcoal">
          Opciones de <span className="italic text-primary">entrega</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {shippingOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 border border-charcoal/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <option.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-charcoal/60 font-sans">
                    {option.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{option.time}</span>
              </div>
              <ul className="space-y-2">
                {option.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping Costs */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5">
          <div className="flex items-center gap-3 mb-8">
            <DollarSign className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-serif text-charcoal">
              Costos <span className="italic text-primary">aproximados</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="text-left py-4 px-4 font-semibold text-charcoal">Destino</th>
                  <th className="text-left py-4 px-4 font-semibold text-charcoal">Costo estimado</th>
                  <th className="text-left py-4 px-4 font-semibold text-charcoal">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {shippingCosts.map((item, index) => (
                  <tr key={index} className="border-b border-charcoal/5">
                    <td className="py-4 px-4 text-charcoal/70 font-sans">{item.destination}</td>
                    <td className="py-4 px-4 text-charcoal/70 font-sans font-medium">{item.cost}</td>
                    <td className="py-4 px-4 text-charcoal/60 font-sans text-sm">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-charcoal/60 font-sans mt-4">
            * Los costos son aproximados y pueden variar según el peso y dimensiones del paquete
          </p>
        </div>
      </section>

      {/* Important Notes */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl p-8 md:p-12 border border-amber-500/20">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
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
            ¿Tienes dudas sobre tu envío?
          </h3>
          <p className="text-charcoal/70 font-sans mb-6">
            Contáctanos y te ayudaremos con tu pedido
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
