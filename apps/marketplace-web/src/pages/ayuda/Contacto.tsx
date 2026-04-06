import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { ChevronLeft, Mail, MessageCircle, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const contactMethods = [
  {
    title: "Email",
    description: "soporte@telar.co",
    detail: "Respuesta en 24-48 horas",
    icon: Mail,
    color: "from-blue-500/20 to-blue-500/5"
  },
  {
    title: "WhatsApp",
    description: "+57 300 123 4567",
    detail: "Lun - Vie, 9am - 6pm",
    icon: MessageCircle,
    color: "from-green-500/20 to-green-500/5"
  },
  {
    title: "Teléfono",
    description: "(601) 123 4567",
    detail: "Lun - Vie, 9am - 6pm",
    icon: Phone,
    color: "from-purple-500/20 to-purple-500/5"
  }
];

const officeInfo = {
  address: "Calle 72 #10-51, Oficina 301",
  city: "Bogotá, Colombia",
  hours: "Lunes a Viernes: 9:00 AM - 6:00 PM",
  weekend: "Sábados, Domingos y Festivos: Cerrado"
};

export default function Contacto() {
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
          <span className="text-primary font-bold">Contacto</span>
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
            Estamos aquí
            <br />
            <span className="italic text-primary">para ayudarte</span>
          </h1>
          <p className="text-base md:text-lg text-charcoal/70 max-w-2xl font-sans leading-relaxed">
            Elige el canal que prefieras para comunicarte con nosotros
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => (
            <div key={index} className={`bg-gradient-to-br ${method.color} rounded-2xl p-8 border border-charcoal/5`}>
              <method.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                {method.title}
              </h3>
              <p className="text-charcoal font-medium mb-1">
                {method.description}
              </p>
              <p className="text-sm text-charcoal/60 font-sans">
                {method.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5">
            <h2 className="text-3xl font-serif mb-6 text-charcoal">
              Envíanos un <span className="italic text-primary">mensaje</span>
            </h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  className="font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Problema con mi pedido</SelectItem>
                    <SelectItem value="product">Consulta sobre producto</SelectItem>
                    <SelectItem value="shipping">Envío y entregas</SelectItem>
                    <SelectItem value="return">Devoluciones</SelectItem>
                    <SelectItem value="payment">Pagos y facturación</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-number">Número de pedido (opcional)</Label>
                <Input
                  id="order-number"
                  placeholder="#12345"
                  className="font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                  rows={5}
                  className="font-sans"
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Enviar mensaje
              </Button>

              <p className="text-xs text-charcoal/60 font-sans text-center">
                Responderemos tu consulta en un plazo de 24-48 horas hábiles
              </p>
            </form>
          </div>

          {/* Office Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-charcoal/5">
              <div className="flex items-start gap-3 mb-6">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-3">
                    Nuestra oficina
                  </h3>
                  <p className="text-charcoal/70 font-sans leading-relaxed mb-2">
                    {officeInfo.address}
                  </p>
                  <p className="text-charcoal/70 font-sans leading-relaxed">
                    {officeInfo.city}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-charcoal/5">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-3">
                    Horario de atención
                  </h3>
                  <p className="text-charcoal/70 font-sans leading-relaxed mb-2">
                    {officeInfo.hours}
                  </p>
                  <p className="text-charcoal/60 font-sans text-sm">
                    {officeInfo.weekend}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-lg font-semibold text-charcoal mb-3">
                ¿Eres artesano?
              </h3>
              <p className="text-charcoal/70 font-sans leading-relaxed mb-4">
                Si eres artesano y quieres vender en TELAR, contáctanos para conocer más sobre nuestro programa.
              </p>
              <Button variant="outline" className="w-full">
                Quiero vender en TELAR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5 text-center">
          <h3 className="text-2xl font-serif mb-3 text-charcoal">
            Antes de contactarnos
          </h3>
          <p className="text-charcoal/70 font-sans mb-6 max-w-xl mx-auto">
            Quizás encuentres la respuesta a tu pregunta en nuestras FAQs
          </p>
          <Link to="/ayuda/faqs">
            <Button size="lg" variant="outline">
              Ver preguntas frecuentes
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
