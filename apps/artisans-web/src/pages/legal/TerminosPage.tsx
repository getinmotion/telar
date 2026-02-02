import React from 'react';
import { Link } from 'react-router-dom';
import { MotionLogo } from '@/components/MotionLogo';
import { ArrowLeft, FileText, Calendar, Building2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const TerminosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <MotionLogo variant="dark" size="md" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Actualizado: 25 de Noviembre de 2025</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Términos y Condiciones de Uso</h1>
            <p className="text-muted-foreground">Plataforma digital para el sector artesanal</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Intro */}
          <section className="bg-muted/50 p-6 rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Nombre:</strong> PLATAFORMA digital desarrollada para el sector artesanal, en virtud del Convenio Marco No. ADC-2025-496 de 2025 suscrito entre GG2 TECHNOLOGY S.A.S. y ARTESANÍAS DE COLOMBIA S.A. – BIC.
            </p>
            <p className="text-sm text-foreground">
              Los presentes Términos y Condiciones de Uso regulan el acceso y uso de la plataforma, que corresponde a la solución tecnológica integral con inteligencia artificial para el fortalecimiento del sector artesanal en Colombia.
            </p>
          </section>

          <Separator />

          {/* I. ÁMBITO Y APLICACIÓN */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">I.</span> Ámbito y Aplicación
            </h2>
            <p>
              El presente documento tiene por objeto regular y disponer los procedimientos y usos del proyecto piloto mediante el cual se diseña, desarrolla e implementa un sistema digital tipo marketplace para la promoción y comercialización de productos del sector artesanal colombiano.
            </p>
            <p>
              Al acceder, navegar, registrarse o usar la Plataforma, el Usuario (Artesano o Comprador) declara que ha leído, entendido y aceptado íntegramente estos Términos.
            </p>
          </section>

          {/* II. DEFINICIONES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">II.</span> Definiciones
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Plataforma:</strong> La solución tecnológica integral con inteligencia artificial que permite a los artesanos registrar, publicar y gestionar sus productos.</li>
              <li><strong>Usuario:</strong> Toda persona natural o jurídica que accede o usa la Plataforma.</li>
              <li><strong>Artesano/Usuario Vendedor:</strong> Persona que utiliza la Plataforma para publicar, promocionar y vender productos artesanales.</li>
              <li><strong>Comprador/Usuario Comprador:</strong> Persona que utiliza la Plataforma para conocer, seleccionar y adquirir productos artesanales.</li>
              <li><strong>Contenido:</strong> Toda información, texto, imagen, video, audio u otro material que el Usuario cargue o publique.</li>
            </ul>
          </section>

          {/* III. OBJETO DE LA PLATAFORMA */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">III.</span> Objeto de la Plataforma
            </h2>
            <p>
              La Plataforma tiene por objeto poner a disposición de los Artesanos una herramienta digital y tecnológica integral, que les permita gestionar sus procesos de formación, producción, promoción y comercialización de artesanías.
            </p>
            <p>
              El Administrador actúa como intermediario tecnológico, facilitando el encuentro entre Artesanos y Compradores. La Empresa no es parte directa de las compraventas de productos artesanales.
            </p>
          </section>

          {/* IV. ACEPTACIÓN DE LOS TÉRMINOS */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">IV.</span> Aceptación de los Términos
            </h2>
            <p>
              Los Usuarios deben leer cuidadosamente los Términos y Condiciones de uso de manera previa a la utilización de la Plataforma, en tanto que su uso implica la aceptación plena e incondicional de estos Términos.
            </p>
            <p>
              El Administrador puede modificar unilateralmente y sin previo aviso los Términos y Condiciones de uso, conforme el anuncio y la publicación en la respectiva Plataforma.
            </p>
          </section>

          {/* V. OPERACIÓN DE LA PLATAFORMA */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">V.</span> Operación de la Plataforma
            </h2>
            <p>Los usuarios son responsables de las condiciones de funcionamiento y seguridad de sus computadores y de sus conexiones a internet.</p>
            <p>Los computadores para acceder a la Plataforma deberán tener como mínimo Sistema operativo Windows 8 o superior, o Mac OSX 11, CPU de 2 Ghz o superior, Memoria RAM de 4 GB o superior.</p>
          </section>

          {/* VI. REGISTRO Y CUENTAS DE USUARIO */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VI.</span> Registro y Cuentas de Usuario
            </h2>
            <p>
              Para utilizar las funcionalidades de la Plataforma, el USUARIO debe registrarse proporcionando información veraz, completa y actualizada.
            </p>
            <p>El USUARIO es responsable de la custodia y confidencialidad de su nombre de usuario y contraseña.</p>
            <p>El ADMINISTRADOR podrá suspender o cancelar cuentas que:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporcionen información falsa o incompleta.</li>
              <li>Incumplan estos Términos.</li>
              <li>Desarrollen actividades sospechosas, ilícitas o que perjudiquen a otros Usuarios.</li>
            </ul>
          </section>

          {/* VII. PUBLICACIÓN DE PRODUCTOS */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VII.</span> Publicación de Productos
            </h2>
            <p>Los Artesanos podrán publicar en la Plataforma sus productos artesanales, adjuntando descripciones, imágenes, características técnicas, precios y demás información relevante.</p>
            <p>El Artesano declara y garantiza que:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Es titular de los productos ofertados o está debidamente autorizado para su venta.</li>
              <li>Los productos son lícitos, originales, seguros y cumplen con la normativa aplicable.</li>
              <li>Las imágenes, descripciones y demás contenidos publicados son veraces.</li>
            </ul>
          </section>

          {/* VIII. TRANSACCIONES, PAGOS Y ENVÍOS */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VIII.</span> Transacciones, Pagos y Envíos
            </h2>
            <p>
              Las condiciones específicas de precios, comisiones, recaudo de pagos, dispersión de recursos a los Artesanos, envíos, devoluciones y garantías, podrán constar en acuerdos particulares o Políticas específicas complementarias.
            </p>
            <p>
              El Artesano será responsable frente al Comprador por el cumplimiento de la venta, incluyendo calidad del producto, tiempos de entrega, atención de garantías, cambios, devoluciones.
            </p>
          </section>

          {/* IX. PROCESOS DE ADQUISICIÓN */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">IX.</span> Procesos de Adquisición
            </h2>
            <h3 className="text-lg font-medium mt-4">Entrega</h3>
            <p>El Usuario Vendedor debe entregar los bienes dentro de los cinco (5) días hábiles siguientes a la colocación de la Orden de Compra y su respectivo pago.</p>
            
            <h3 className="text-lg font-medium mt-4">Política de Cambios</h3>
            <p>El Usuario Comprador puede solicitar el cambio y realizar la devolución del bien hasta tres (3) días hábiles siguientes a la recepción.</p>
            
            <h3 className="text-lg font-medium mt-4">Garantías</h3>
            <p>Los bienes objeto de la Orden de Compra deben estar amparados por la garantía legal a que se refiere la Ley 1480 de 2011.</p>
          </section>

          {/* X. USOS PROHIBIDOS */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">X.</span> Usos Prohibidos
            </h2>
            <p>El Usuario se obliga a NO:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Utilizar la Plataforma para fines ilícitos o no autorizados.</li>
              <li>Suplantar a otras personas o utilizar cuentas de terceros.</li>
              <li>Interferir con el funcionamiento normal de la Plataforma.</li>
              <li>Captar datos personales de otros Usuarios sin su consentimiento.</li>
              <li>Realizar actos que puedan afectar la seguridad, integridad o disponibilidad del servicio.</li>
            </ul>
          </section>

          {/* XI. OBLIGACIONES DEL ADMINISTRADOR */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">XI.</span> Obligaciones del Administrador
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Administrar la Plataforma de acuerdo con lo establecido en el Convenio Marco.</li>
              <li>Actualizar los Catálogos de la Plataforma.</li>
              <li>Autorizar el registro, actualización y retiro de Usuarios.</li>
              <li>Informar las situaciones que afecten la disponibilidad de la Plataforma.</li>
              <li>Publicar los cambios en los Términos y Condiciones de Uso.</li>
            </ul>
          </section>

          {/* XII. DISPONIBILIDAD Y LIMITACIÓN */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">XII.</span> Disponibilidad y Limitación de Responsabilidad
            </h2>
            <p>El Administrador no garantiza la disponibilidad permanente de la Plataforma.</p>
            <p>El Administrador no será responsable por:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>La calidad de los productos ofrecidos por los Artesanos.</li>
              <li>El incumplimiento de las obligaciones contractuales entre Artesanos y Compradores.</li>
              <li>Los daños que se deriven del uso indebido de la Plataforma.</li>
            </ul>
          </section>

          {/* XIII. PROPIEDAD INTELECTUAL */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">XIII.</span> Propiedad Intelectual
            </h2>
            <p>El Artesano conserva la titularidad sobre las creaciones artesanales y diseños que comercializa.</p>
            <p>Al cargar contenido en la Plataforma, el Artesano otorga al Administrador una licencia no exclusiva, gratuita, mundial para usar dicho contenido con fines de operación y promoción de la Plataforma.</p>
          </section>

          {/* XIV. LEY APLICABLE */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">XIV.</span> Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos se rigen por la legislación de la República de Colombia. Cualquier controversia se someterá a los jueces y tribunales de la ciudad de Bogotá D.C.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 p-6 rounded-xl border border-primary/20">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              Información de Contacto
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>Razón Social:</strong> GG2 TECHNOLOGY S.A.S.</p>
              <p><strong>NIT:</strong> 901063584-8</p>
              <p><strong>Domicilio:</strong> Calle 93B No. 17-49, Bogotá D.C., Colombia</p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:g2technology@getinmotion.io" className="text-primary hover:underline">
                  g2technology@getinmotion.io
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 GG2 TECHNOLOGY S.A.S. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/privacidad" className="hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
            <Link to="/publicidad" className="hover:text-primary transition-colors">
              Política de Publicidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TerminosPage;
