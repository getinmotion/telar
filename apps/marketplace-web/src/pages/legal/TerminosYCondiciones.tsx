import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, Calendar } from "lucide-react";

export default function TerminosYCondiciones() {
  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-charcoal/50">Legal</span>
          <span>/</span>
          <span className="text-primary font-bold">Términos y Condiciones</span>
        </nav>
      </div>

      {/* Header */}
      <section className="max-w-[1400px] mx-auto px-6 mb-16">
        <Link to="/">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>
        <div className="py-8 border-b border-charcoal/5">
          <h1 className="text-5xl md:text-6xl leading-tight font-serif mb-6 text-charcoal tracking-tight">
            Términos y
            <br />
            <span className="italic text-primary">Condiciones de Uso</span>
          </h1>
          <div className="flex items-center gap-2 text-charcoal/60 font-sans text-sm">
            <Calendar className="h-4 w-4" />
            <span>Última actualización: Diciembre 2024</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5">
          <article className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">1. Definiciones</h2>
                <ul className="list-none space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Plataforma:</strong>
                      <span className="text-charcoal/70 font-sans"> El sitio web, aplicación móvil y cualquier otro medio digital operado por TELAR, donde se prestan los servicios de comercio electrónico.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">TELAR:</strong>
                      <span className="text-charcoal/70 font-sans"> GET IN MOTION S.A.S., sociedad colombiana, identificada con NIT 901.777.707-1, con domicilio en Bogotá, D.C.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Usuario:</strong>
                      <span className="text-charcoal/70 font-sans"> Toda persona natural o jurídica que acceda a la Plataforma, ya sea como visitante, comprador o vendedor.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Comprador:</strong>
                      <span className="text-charcoal/70 font-sans"> Usuario que adquiere productos o servicios publicados en la Plataforma.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Vendedor o Artesano:</strong>
                      <span className="text-charcoal/70 font-sans"> Persona natural o jurídica que ofrece productos artesanales a través de la Plataforma.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Producto:</strong>
                      <span className="text-charcoal/70 font-sans"> Todo bien material o intangible ofrecido en la Plataforma por un vendedor.</span>
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">2. Objeto de la Plataforma</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed">
                  TELAR es un marketplace que conecta compradores con artesanos colombianos, facilitando la comercialización de productos artesanales. TELAR actúa como intermediario tecnológico, proporcionando el espacio digital para la publicación, promoción y gestión de transacciones, sin ser parte de los contratos de compraventa celebrados entre compradores y vendedores.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">3. Aceptación de los Términos</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed mb-4">
                  El acceso y uso de la Plataforma implica la aceptación plena e incondicional de estos términos y condiciones. Si el usuario no está de acuerdo con alguna de las disposiciones aquí contenidas, deberá abstenerse de usar la Plataforma.
                </p>
                <p className="text-charcoal/70 font-sans leading-relaxed">
                  TELAR se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones serán notificadas a los usuarios mediante publicación en la Plataforma o por correo electrónico.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">4. Registro y Cuenta de Usuario</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed mb-4">
                  Para acceder a ciertas funcionalidades de la Plataforma, el usuario deberá registrarse y crear una cuenta. El usuario es responsable de:
                </p>
                <ul className="list-none space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span className="text-charcoal/70 font-sans">Proporcionar información veraz y actualizada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span className="text-charcoal/70 font-sans">Mantener la confidencialidad de su contraseña</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span className="text-charcoal/70 font-sans">Notificar inmediatamente cualquier uso no autorizado de su cuenta</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">5. Datos de Contacto</h2>
                <div className="bg-charcoal/5 rounded-lg p-6 text-charcoal/70 font-sans leading-relaxed">
                  <p className="mb-2"><strong className="text-charcoal">GET IN MOTION S.A.S.</strong></p>
                  <p className="mb-2">NIT: 901.777.707-1</p>
                  <p className="mb-2">Dirección: Calle 77 # 11 - 19, Bogotá D.C., Colombia</p>
                  <p className="mb-2">Correo electrónico: info@telar.co</p>
                  <p>Teléfono: +57 300 123 4567</p>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-charcoal/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif mb-3 text-charcoal">
                ¿Tienes dudas sobre los términos?
              </h2>
              <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed">
                Nuestro equipo está disponible para aclarar cualquier pregunta
              </p>
            </div>
            <Link to="/ayuda/contacto">
              <Button size="lg" className="group">
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
