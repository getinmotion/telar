import React from 'react';
import { Link } from 'react-router-dom';
import { MotionLogo } from '@/components/MotionLogo';
import { ArrowLeft, Shield, Calendar, Building2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const PrivacidadPage: React.FC = () => {
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
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Política de Tratamiento de Datos Personales</h1>
            <p className="text-muted-foreground">Protección y privacidad de tu información</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Intro */}
          <section className="bg-muted/50 p-6 rounded-xl">
            <p className="text-sm text-foreground">
              En cumplimiento de lo dispuesto en la Constitución Política de Colombia, la Ley 1581 de 2012, el Decreto 1377 de 2013, el Decreto 1074 de 2015 y las demás normas aplicables, GG2 TECHNOLOGY S.A.S. adopta la presente Política de Tratamiento de Datos Personales aplicable a los datos personales recolectados en el marco de la operación de la Plataforma.
            </p>
          </section>

          <Separator />

          {/* I. POLÍTICA DE TRATAMIENTO */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">I.</span> Política de Tratamiento de Datos Personales
            </h2>
            <p>
              Al suministrar sus datos personales y aceptar el tratamiento de los mismos, el USUARIO autoriza de manera previa, expresa e informada a GG2 TECHNOLOGY S.A.S. para que almacenen, procesen, utilicen, transmitan y/o transfieran la información proporcionada.
            </p>
            <p>
              El tratamiento de los datos personales se realizará con observancia de los principios y disposiciones previstos en la normatividad vigente y en la presente Política.
            </p>
          </section>

          {/* II. ÁMBITO Y APLICACIÓN */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">II.</span> Ámbito y Aplicación
            </h2>
            <p>La presente Política se aplica a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los datos personales de artesanos que se registran en la Plataforma.</li>
              <li>Los datos personales de compradores o usuarios interesados en adquirir productos artesanales.</li>
              <li>Los datos personales de aliados, proveedores, contratistas y colaboradores.</li>
            </ul>
            <p>Aplica a los datos que se recolectan de manera presencial, telefónica, escrita, digital, mediante formularios en línea, correo electrónico, chats u otros medios.</p>
          </section>

          {/* III. DEFINICIONES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">III.</span> Definiciones
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Titular:</strong> Persona natural cuyos datos personales son objeto de tratamiento.</li>
              <li><strong>Tratamiento:</strong> Cualquier operación que se realice con datos personales (recolectar, almacenar, usar, circular, suprimir, etc.).</li>
              <li><strong>Responsable del tratamiento:</strong> GG2 TECHNOLOGY S.A.S., quien decide sobre la base de datos y el tratamiento.</li>
              <li><strong>Autorización:</strong> Consentimiento previo, expreso e informado del TITULAR.</li>
              <li><strong>Dato personal:</strong> Cualquier información vinculada a una persona natural determinada o determinable.</li>
              <li><strong>Dato sensible:</strong> Aquel que afecta la intimidad del TITULAR o cuyo uso indebido puede generar discriminación.</li>
            </ul>
          </section>

          {/* IV. RESPONSABLE DEL TRATAMIENTO */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">IV.</span> Responsable del Tratamiento
            </h2>
            <div className="bg-muted/50 p-4 rounded-lg">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 font-medium">Razón Social:</td>
                    <td className="py-2">GG2 TECHNOLOGY S.A.S.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 font-medium">NIT:</td>
                    <td className="py-2">901063584-8</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 font-medium">Domicilio:</td>
                    <td className="py-2">Calle 93B No. 17-49, Bogotá D.C.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 font-medium">Correo:</td>
                    <td className="py-2">g2technology@getinmotion.io</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Teléfono:</td>
                    <td className="py-2">3015411321</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* V. PRINCIPIOS APLICABLES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">V.</span> Principios Aplicables al Tratamiento
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Legalidad:</strong> El Tratamiento debe sujetarse a lo establecido en la ley.</li>
              <li><strong>Finalidad:</strong> El Tratamiento debe obedecer a una finalidad legítima.</li>
              <li><strong>Libertad:</strong> Solo puede ejercerse con el consentimiento previo del TITULAR.</li>
              <li><strong>Veracidad:</strong> La información debe ser veraz, completa, exacta y actualizada.</li>
              <li><strong>Transparencia:</strong> Se garantiza el derecho a obtener información en cualquier momento.</li>
              <li><strong>Seguridad:</strong> La información será manejada con las medidas necesarias de seguridad.</li>
              <li><strong>Confidencialidad:</strong> Todas las personas están obligadas a garantizar la reserva de la información.</li>
            </ul>
          </section>

          {/* VI. DATOS OBJETO DE TRATAMIENTO */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VI.</span> Datos Personales Objeto de Tratamiento
            </h2>
            
            <h3 className="text-lg font-medium mt-4">Datos de Artesanos</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nombre y apellidos, tipo y número de documento de identidad.</li>
              <li>Datos de contacto: dirección, ciudad, departamento, teléfono, correo electrónico.</li>
              <li>Información del taller o unidad productiva artesanal.</li>
              <li>Fotografías, videos y descripciones de productos artesanales.</li>
              <li>Información bancaria necesaria para la dispersión de recursos.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">Datos de Compradores</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nombre, apellidos, tipo y número de documento.</li>
              <li>Datos de contacto: dirección de envío, correo electrónico, teléfono.</li>
              <li>Información de compras realizadas, historial de pedidos, preferencias.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">Datos Tecnológicos</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dirección IP, tipo de dispositivo, sistema operativo, navegador.</li>
              <li>Información recogida mediante cookies y tecnologías similares.</li>
            </ul>
          </section>

          {/* VII. FINALIDADES DEL TRATAMIENTO */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VII.</span> Finalidades del Tratamiento
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Gestión de cuentas:</strong> Registro, autenticación, administración y actualización de cuentas.</li>
              <li><strong>Operación comercial:</strong> Publicación, promoción y comercialización de productos artesanales.</li>
              <li><strong>Procesos de formación:</strong> Inscripción y gestión de participación en capacitaciones.</li>
              <li><strong>Mejoramiento de la plataforma:</strong> Análisis del uso para mejorar diseño y funcionalidades.</li>
              <li><strong>Comunicaciones:</strong> Envío de información sobre actualizaciones, cambios y promociones.</li>
              <li><strong>Cumplimiento legal:</strong> Atender requerimientos de autoridades y obligaciones tributarias.</li>
            </ul>
          </section>

          {/* VIII. AUTORIZACIÓN DEL TITULAR */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">VIII.</span> Autorización del Titular
            </h2>
            <p>
              GG2 TECHNOLOGY S.A.S. obtendrá la autorización previa, expresa e informada del TITULAR mediante:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Formularios físicos o electrónicos.</li>
              <li>Aceptación de términos y condiciones en la Plataforma.</li>
              <li>Correos electrónicos u otros medios que permitan dejar constancia.</li>
            </ul>
            <p className="mt-4">
              El TITULAR podrá, en cualquier momento, revocar la autorización o solicitar la supresión de sus datos personales.
            </p>
          </section>

          {/* IX. DERECHOS DE LOS TITULARES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">IX.</span> Derechos de los Titulares
            </h2>
            <p>Los TITULARES de los datos personales tienen derecho a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informados sobre el uso de sus datos.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
              <li>Revocar la autorización y/o solicitar la supresión del dato.</li>
              <li>Acceder en forma gratuita a sus datos personales.</li>
            </ul>
          </section>

          {/* X. PROCEDIMIENTO PARA CONSULTAS Y RECLAMOS */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">X.</span> Procedimiento para Consultas y Reclamos
            </h2>
            <p>Los TITULARES podrán ejercer sus derechos a través de:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Correo electrónico: g2technology@getinmotion.io</li>
              <li>Dirección física: Calle 93B No. 17-49, Bogotá D.C.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">Consultas</h3>
            <p>Serán atendidas en un término máximo de diez (10) días hábiles.</p>
            
            <h3 className="text-lg font-medium mt-4">Reclamos</h3>
            <p>Serán atendidos en un término máximo de quince (15) días hábiles.</p>
          </section>

          {/* XI. COOKIES */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">XI.</span> Cookies y Tecnologías de Seguimiento
            </h2>
            <p>
              La Plataforma puede utilizar cookies y tecnologías similares para mejorar la experiencia del usuario, analizar el uso del sitio y personalizar contenidos. El usuario puede configurar su navegador para rechazar cookies.
            </p>
          </section>

          {/* XII. VIGENCIA */}
          <section>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">XII.</span> Vigencia y Modificaciones
            </h2>
            <p>
              La presente Política entra en vigencia a partir de su publicación y permanecerá vigente mientras GG2 TECHNOLOGY S.A.S. continúe operando la Plataforma. Las modificaciones serán publicadas e indicarán la fecha de actualización.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 p-6 rounded-xl border border-primary/20">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              Canal de Contacto
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
            <Link to="/terminos" className="hover:text-primary transition-colors">
              Términos y Condiciones
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

export default PrivacidadPage;
