import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, Calendar, Shield, CheckCircle, XCircle } from "lucide-react";

export default function PoliticaDeGarantias() {
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
          <span className="text-primary font-bold">Política de Garantías</span>
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
            <span className="italic text-primary">Garantías</span>
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
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold text-charcoal mb-2">Compromiso con la Calidad</h2>
                      <p className="text-charcoal/70 font-sans leading-relaxed">
                        En TELAR garantizamos la autenticidad y calidad artesanal de cada producto. Esta política establece los términos y condiciones de las garantías aplicables a los productos adquiridos a través de nuestra plataforma.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">1. Ámbito de Aplicación</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed">
                  Esta política de garantías aplica a todos los productos artesanales vendidos a través de la plataforma TELAR. Los productos están garantizados contra defectos de fabricación y materiales, conforme a lo establecido en la legislación colombiana de protección al consumidor (Ley 1480 de 2011).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">2. Período de Garantía</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed mb-4">
                  El período de garantía varía según el tipo de producto:
                </p>
                <ul className="list-none space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Productos textiles y tejidos:</strong>
                      <span className="text-charcoal/70 font-sans"> 30 días contra defectos de fabricación</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Cerámica y vajillas:</strong>
                      <span className="text-charcoal/70 font-sans"> 60 días contra roturas no causadas por uso</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Joyería y accesorios:</strong>
                      <span className="text-charcoal/70 font-sans"> 90 días contra defectos de materiales</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Muebles y decoración:</strong>
                      <span className="text-charcoal/70 font-sans"> 180 días contra defectos estructurales</span>
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">3. Cobertura de la Garantía</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Cubre */}
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-semibold text-charcoal">La garantía cubre:</h3>
                    </div>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Defectos de fabricación o materiales
                      </li>
                      <li className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Producto diferente al descrito
                      </li>
                      <li className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Daños durante el envío
                      </li>
                      <li className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Fallas funcionales no causadas por uso
                      </li>
                    </ul>
                  </div>

                  {/* No cubre */}
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-6 border border-red-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle className="h-6 w-6 text-red-600" />
                      <h3 className="text-xl font-semibold text-charcoal">No cubre:</h3>
                    </div>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        Desgaste normal por uso
                      </li>
                      <li className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        Daños por mal uso o negligencia
                      </li>
                      <li className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        Modificaciones no autorizadas
                      </li>
                      <li className="flex items-start gap-2 text-sm text-charcoal/70 font-sans">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        Variaciones naturales de productos artesanales
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">4. Proceso de Garantía</h2>
                <ol className="list-none space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <strong className="text-charcoal">Contacta al artesano:</strong>
                      <p className="text-charcoal/70 font-sans text-sm mt-1">
                        Dentro del período de garantía, contacta directamente al artesano a través de la plataforma TELAR.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <strong className="text-charcoal">Proporciona evidencia:</strong>
                      <p className="text-charcoal/70 font-sans text-sm mt-1">
                        Envía fotografías del defecto o daño, junto con tu comprobante de compra.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <strong className="text-charcoal">Evaluación:</strong>
                      <p className="text-charcoal/70 font-sans text-sm mt-1">
                        El artesano evaluará el caso y determinará si aplica la garantía.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">4</span>
                    </div>
                    <div>
                      <strong className="text-charcoal">Solución:</strong>
                      <p className="text-charcoal/70 font-sans text-sm mt-1">
                        Según el caso, se ofrecerá reparación, reemplazo o reembolso.
                      </p>
                    </div>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">5. Datos de Contacto</h2>
                <div className="bg-charcoal/5 rounded-lg p-6 text-charcoal/70 font-sans leading-relaxed">
                  <p className="mb-2"><strong className="text-charcoal">GET IN MOTION S.A.S.</strong></p>
                  <p className="mb-2">NIT: 901.777.707-1</p>
                  <p className="mb-2">Correo electrónico: garantias@telar.co</p>
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
                ¿Necesitas hacer válida tu garantía?
              </h2>
              <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed">
                Contáctanos y te ayudaremos con el proceso
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
