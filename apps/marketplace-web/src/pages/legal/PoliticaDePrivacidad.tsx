import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, Calendar } from "lucide-react";

export default function PoliticaDePrivacidad() {
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
          <span className="text-primary font-bold">Política de Privacidad</span>
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
            <span className="italic text-primary">Privacidad</span>
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
                <h2 className="text-2xl font-serif mb-4 text-charcoal">1. Ámbito de Aplicación</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed mb-4">
                  La presente Política de Privacidad (Publicidad) tiene como finalidad establecer las condiciones bajo las cuales GET IN MOTION S.A.S., en adelante "la Empresa" o "TELAR", protege y gestiona los datos personales de los usuarios que interactúan con su plataforma de comercio electrónico denominada TELAR y/o sus servicios de marketing, publicidad y comunicaciones comerciales.
                </p>
                <p className="text-charcoal/70 font-sans leading-relaxed">
                  Esta política se encuentra en concordancia con lo dispuesto por la Ley 1581 de 2012, el Decreto 1377 de 2013, y demás normatividad aplicable en materia de protección de datos personales en Colombia.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">2. Objetivo</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed">
                  Establecer las condiciones y lineamientos para el uso de datos personales con fines publicitarios, promocionales y de comunicación comercial, garantizando el respeto del derecho a la privacidad y el cumplimiento del marco legal vigente.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">3. Definiciones</h2>
                <ul className="list-none space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Autorización:</strong>
                      <span className="text-charcoal/70 font-sans"> Consentimiento previo, expreso e informado del titular para llevar a cabo el tratamiento de datos personales.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Base de Datos:</strong>
                      <span className="text-charcoal/70 font-sans"> Conjunto organizado de datos personales que sea objeto de tratamiento.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Dato Personal:</strong>
                      <span className="text-charcoal/70 font-sans"> Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Responsable del Tratamiento:</strong>
                      <span className="text-charcoal/70 font-sans"> Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, decida sobre la base de datos y/o el tratamiento de los datos.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Titular:</strong>
                      <span className="text-charcoal/70 font-sans"> Persona natural cuyos datos personales sean objeto de tratamiento.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Publicidad:</strong>
                      <span className="text-charcoal/70 font-sans"> Comunicaciones comerciales o promocionales emitidas por la Empresa para divulgar productos, servicios u ofertas.</span>
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">4. Principios Rectores</h2>
                <p className="text-charcoal/70 font-sans leading-relaxed mb-4">
                  El tratamiento de datos personales con fines publicitarios se rige por los siguientes principios:
                </p>
                <ul className="list-none space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Legalidad:</strong>
                      <span className="text-charcoal/70 font-sans"> Solo se realizará tratamiento con la autorización del titular y conforme a la normativa vigente.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Finalidad:</strong>
                      <span className="text-charcoal/70 font-sans"> El tratamiento responderá a propósitos legítimos informados al titular.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Seguridad:</strong>
                      <span className="text-charcoal/70 font-sans"> Se implementan medidas técnicas, humanas y administrativas para proteger los datos.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <div>
                      <strong className="text-charcoal">Confidencialidad:</strong>
                      <span className="text-charcoal/70 font-sans"> Se garantiza la reserva de la información tratada.</span>
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif mb-4 text-charcoal">5. Responsable del Tratamiento</h2>
                <div className="bg-charcoal/5 rounded-lg p-6 text-charcoal/70 font-sans leading-relaxed">
                  <p className="mb-2"><strong className="text-charcoal">GET IN MOTION S.A.S.</strong></p>
                  <p className="mb-2">NIT: 901.777.707-1</p>
                  <p className="mb-2">Dirección: Calle 77 # 11 - 19, Bogotá D.C., Colombia</p>
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
                ¿Tienes preguntas sobre tu privacidad?
              </h2>
              <p className="text-sm md:text-base text-charcoal/70 font-sans leading-relaxed">
                Contáctanos si necesitas más información sobre cómo manejamos tus datos
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
