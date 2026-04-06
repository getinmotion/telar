import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, Calendar, Cookie } from "lucide-react";

export default function PoliticaDeCookies() {
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
          <span className="text-primary font-bold">Política de Cookies</span>
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
            Política de
            <br />
            <span className="italic text-primary">Cookies</span>
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
                <h2 className="text-2xl font-serif mb-4 text-charcoal">1. ¿Qué son las cookies?</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed">
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o móvil) cuando visitas nuestra plataforma TELAR. Estas cookies permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">2. Tipos de cookies que utilizamos</h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                    <div className="flex items-start gap-3 mb-3">
                      <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <h3 className="text-xl font-semibold text-charcoal">Cookies Esenciales</h3>
                    </div>
                    <p className="text-charcoal/70 font-sans leading-relaxed">
                      Son necesarias para el funcionamiento básico de la plataforma. Permiten la navegación y el uso de funcionalidades como el carrito de compras y el acceso a áreas seguras.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-lg p-6 border border-blue-500/20">
                    <div className="flex items-start gap-3 mb-3">
                      <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <h3 className="text-xl font-semibold text-charcoal">Cookies de Rendimiento</h3>
                    </div>
                    <p className="text-charcoal/70 font-sans leading-relaxed">
                      Recopilan información sobre cómo los usuarios utilizan la plataforma, como las páginas más visitadas. Estos datos nos ayudan a mejorar el funcionamiento del sitio.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-lg p-6 border border-green-500/20">
                    <div className="flex items-start gap-3 mb-3">
                      <Cookie className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <h3 className="text-xl font-semibold text-charcoal">Cookies de Funcionalidad</h3>
                    </div>
                    <p className="text-charcoal/70 font-sans leading-relaxed">
                      Permiten recordar tus preferencias (idioma, región, opciones de visualización) para ofrecerte una experiencia más personalizada.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-lg p-6 border border-purple-500/20">
                    <div className="flex items-start gap-3 mb-3">
                      <Cookie className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                      <h3 className="text-xl font-semibold text-charcoal">Cookies de Publicidad</h3>
                    </div>
                    <p className="text-charcoal/70 font-sans leading-relaxed">
                      Se utilizan para mostrarte anuncios relevantes según tus intereses. También limitan el número de veces que ves un anuncio y ayudan a medir la efectividad de campañas publicitarias.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">3. Control de cookies</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed mb-4">
                  Puedes controlar y/o eliminar las cookies según desees. Puedes:
                </p>
                <ul className="list-none space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span className="text-charcoal/70 font-sans">Eliminar todas las cookies instaladas en tu dispositivo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span className="text-charcoal/70 font-sans">Configurar tu navegador para bloquear cookies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span className="text-charcoal/70 font-sans">Aceptar o rechazar cookies individualmente</span>
                  </li>
                </ul>
                <p className="text-charcoal/70 font-sans leading-relaxed mt-4">
                  Ten en cuenta que al bloquear todas las cookies, algunas funcionalidades de TELAR pueden no estar disponibles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">4. Cookies de terceros</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed">
                  Utilizamos servicios de terceros como Google Analytics, Facebook Pixel y otras herramientas de análisis y publicidad. Estas empresas pueden usar cookies para recopilar información sobre tu uso de nuestra plataforma y otros sitios web.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">5. Datos de Contacto</h2>
                <div className="bg-charcoal/5 rounded-lg p-6 text-charcoal/70 font-sans leading-relaxed">
                  <p className="mb-2"><strong className="text-charcoal">GET IN MOTION S.A.S.</strong></p>
                  <p className="mb-2">NIT: 901.777.707-1</p>
                  <p className="mb-2">Correo electrónico: datospersonales@telar.co</p>
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
                ¿Preguntas sobre cookies?
              </h2>
              <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed">
                Contáctanos si necesitas más información
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
