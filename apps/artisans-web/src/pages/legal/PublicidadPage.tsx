import React from 'react';
import { Link } from 'react-router-dom';
import { MotionLogo } from '@/components/MotionLogo';
import { ArrowLeft, Megaphone, Calendar, Building2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const PublicidadPage: React.FC = () => {
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
            <Megaphone className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Política de Publicidad</h1>
            <p className="text-muted-foreground">Lineamientos para la difusión de contenidos promocionales</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Intro */}
          <section className="bg-muted/50 p-6 rounded-xl">
            <p className="text-sm text-foreground">
              La presente Política de Publicidad establece las reglas aplicables a la difusión, publicación y gestión de contenidos publicitarios y promocionales dentro y fuera de la plataforma digital orientada al sector artesanal.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta Política complementa los Términos y Condiciones de Uso y la Política de Tratamiento de Datos Personales de GG2 TECHNOLOGY S.A.S.
            </p>
          </section>

          <Separator />

          {/* I. ÁMBITO Y APLICACIÓN */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">I.</span> Ámbito y Aplicación
            </h2>
            <p>La presente Política aplica a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Toda publicidad, promoción o comunicación comercial que se difunda a través de la Plataforma.</li>
              <li>Los contenidos promocionales generados por los Artesanos respecto de sus productos artesanales.</li>
              <li>La publicidad sobre programas de formación, convocatorias, eventos y actividades relacionadas con el sector artesanal.</li>
            </ul>
            <p className="mt-4">Comprende la publicidad desplegada en:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sitio web y/o aplicación móvil de la Plataforma.</li>
              <li>Boletines electrónicos, correos masivos y notificaciones.</li>
              <li>Redes sociales y demás canales digitales administrados por GG2 TECHNOLOGY S.A.S.</li>
            </ul>
          </section>

          {/* II. OBJETIVO */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">II.</span> Objetivo
            </h2>
            <p>Establecer criterios y lineamientos claros para que la publicidad asociada a la Plataforma sea:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Veraz, suficiente, clara y oportuna.</li>
              <li>Respetuosa de los derechos de los consumidores y de los artesanos.</li>
              <li>Coherente con los valores culturales, sociales y económicos del sector artesanal.</li>
              <li>Alineada con la normativa colombiana (Ley 1480 de 2011, Ley 1581 de 2012, entre otras).</li>
            </ul>
          </section>

          {/* III. DEFINICIONES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">III.</span> Definiciones
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Publicidad o comunicación comercial:</strong> Toda forma de mensaje destinado a promover bienes, servicios, actividades o la propia Plataforma.</li>
              <li><strong>Publicidad propia:</strong> Publicidad generada por GG2 TECHNOLOGY S.A.S. para promover la Plataforma.</li>
              <li><strong>Publicidad de Artesanos:</strong> Comunicación comercial generada por los Usuarios Vendedores en relación con sus productos.</li>
              <li><strong>Publicidad de terceros aliados:</strong> Anuncios de organizaciones aliadas, patrocinadores o instituciones vinculadas a la Plataforma.</li>
            </ul>
          </section>

          {/* IV. PRINCIPIOS RECTORES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">IV.</span> Principios Rectores de la Publicidad
            </h2>
            
            <h3 className="text-lg font-medium mt-4">1. Veracidad y Suficiencia</h3>
            <p>La información publicitaria debe ser veraz, comprobable y no inducir a error. Los anuncios deben contener información suficiente para que el consumidor tome decisiones informadas.</p>

            <h3 className="text-lg font-medium mt-4">2. Claridad y Transparencia</h3>
            <p>Se deben distinguir claramente los espacios publicitarios de otros contenidos informativos o editoriales. Los contenidos con carácter publicitario deben identificarse como tal.</p>

            <h3 className="text-lg font-medium mt-4">3. Respeto al Consumidor</h3>
            <p>Se prohíben mensajes engañosos, abusivos, discriminatorios, violentos o que vulneren la dignidad humana.</p>

            <h3 className="text-lg font-medium mt-4">4. Respeto a la Cultura y al Patrimonio Artesanal</h3>
            <p>La publicidad no podrá trivializar, apropiarse indebidamente, descontextualizar o desnaturalizar los saberes, símbolos y expresiones culturales de comunidades artesanales.</p>

            <h3 className="text-lg font-medium mt-4">5. Legalidad y Propiedad Intelectual</h3>
            <p>No se permitirá publicidad que promueva productos ilícitos o que infrinjan derechos de autor, marcas, diseños industriales u otros derechos de propiedad intelectual.</p>
          </section>

          {/* V. PUBLICIDAD DE LA PLATAFORMA */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">V.</span> Publicidad Generada por la Plataforma
            </h2>
            <p>GG2 TECHNOLOGY S.A.S. podrá realizar campañas publicitarias para promover:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>El uso de la Plataforma por parte de artesanos y compradores.</li>
              <li>Programas de formación, acompañamiento y fortalecimiento del sector artesanal.</li>
              <li>Eventos, ferias, convocatorias y espacios de comercialización.</li>
            </ul>
            <p className="mt-4">
              Con sujeción a las autorizaciones otorgadas, la Plataforma podrá utilizar imágenes, descripciones y otros contenidos de productos artesanales para destacar productos o artesanos y elaborar piezas promocionales.
            </p>
          </section>

          {/* VI. PUBLICIDAD DE ARTESANOS */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VI.</span> Publicidad Generada por los Artesanos
            </h2>
            <p>Los Artesanos son responsables por los contenidos publicitarios que generen y publiquen, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Textos descriptivos y promocionales.</li>
              <li>Imágenes, videos, audios y cualquier otra pieza gráfica o audiovisual.</li>
              <li>Mensajes sobre ofertas, descuentos, garantías y beneficios.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">Requisitos Mínimos</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Ajustarse a la realidad de los productos ofrecidos (materiales, técnicas, origen, medidas, plazos).</li>
              <li>Incluir información clara sobre condiciones de ofertas, descuentos, unidades disponibles y vigencia.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">Prohibiciones Específicas</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Atribuir a los productos calidades o certificaciones que no posean.</li>
              <li>Utilizar imágenes de productos o creaciones de terceros sin autorización.</li>
              <li>Publicar contenidos que impliquen plagio o apropiación indebida de diseños.</li>
              <li>Incluir mensajes ofensivos, discriminatorios o contrarios a la moral.</li>
              <li>Hacer publicidad de productos ilícitos, falsificados o que contravengan normas.</li>
            </ul>
          </section>

          {/* VII. USO DE MARCA */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VII.</span> Uso de Marca e Identidad de la Plataforma
            </h2>
            <p>
              Los Artesanos y terceros aliados solo podrán utilizar la marca, logotipos, signos distintivos y elementos de identidad gráfica de la Plataforma cuando exista autorización previa, expresa y por escrito de GG2 TECHNOLOGY S.A.S.
            </p>
            <p className="mt-2">
              Queda prohibido sugerir, sin autorización, que existe una relación de patrocinio, respaldo, certificación o alianza con la Plataforma cuando ello no sea cierto.
            </p>
          </section>

          {/* VIII. COMUNICACIONES COMERCIALES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VIII.</span> Comunicaciones Comerciales
            </h2>
            <p>El envío de correos electrónicos, notificaciones, mensajes de texto u otros medios con contenido publicitario:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Se hará respetando las autorizaciones otorgadas y las preferencias de contacto del Usuario.</li>
              <li>Permitirá al Usuario solicitar en cualquier momento la exclusión ("darse de baja").</li>
            </ul>
            <p className="mt-2">
              Queda prohibido el envío de spam o comunicaciones masivas no autorizadas a través de la Plataforma.
            </p>
          </section>

          {/* IX. USOS PROHIBIDOS */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">IX.</span> Responsabilidades
            </h2>
            <p>Cada Usuario Vendedor será responsable directa y exclusivamente por la publicidad que elabore y publique, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Exactitud de la información.</li>
              <li>Cumplimiento de las ofertas y condiciones anunciadas.</li>
              <li>Respeto de los derechos de los consumidores y de terceros.</li>
            </ul>
            <p className="mt-2">
              GG2 TECHNOLOGY S.A.S. será responsable por la publicidad propia de la Plataforma y por velar porque los contenidos publicitarios cumplan con la presente Política.
            </p>
          </section>

          {/* X. MODIFICACIONES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">X.</span> Modificaciones a la Política
            </h2>
            <p>
              GG2 TECHNOLOGY S.A.S. podrá modificar la presente Política de Publicidad en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en la Plataforma, con indicación de la fecha de actualización.
            </p>
            <p className="mt-2">
              El uso continuado de la Plataforma después de la publicación de los cambios implica la aceptación de la nueva versión de la Política.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 p-6 rounded-xl border border-primary/20">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              Canal de Contacto
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Para consultas, observaciones o reclamaciones relacionadas con la publicidad difundida en la Plataforma:
            </p>
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
            <Link to="/terminos" className="hover:text-primary transition-colors">
              Términos y Condiciones
            </Link>
            <Link to="/privacidad" className="hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicidadPage;
