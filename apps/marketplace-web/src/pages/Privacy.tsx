import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">Política de Privacidad (Publicidad)</h1>
          <p className="text-muted-foreground mb-8">Última actualización: Diciembre 2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Ámbito de Aplicación</h2>
            <p className="text-muted-foreground leading-relaxed">
              La presente Política de Privacidad (Publicidad) tiene como finalidad establecer las condiciones bajo las cuales GET IN MOTION S.A.S., en adelante "la Empresa" o "TELAR", protege y gestiona los datos personales de los usuarios que interactúan con su plataforma de comercio electrónico denominada TELAR y/o sus servicios de marketing, publicidad y comunicaciones comerciales.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Esta política se encuentra en concordancia con lo dispuesto por la Ley 1581 de 2012, el Decreto 1377 de 2013, y demás normatividad aplicable en materia de protección de datos personales en Colombia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Objetivo</h2>
            <p className="text-muted-foreground leading-relaxed">
              Establecer las condiciones y lineamientos para el uso de datos personales con fines publicitarios, promocionales y de comunicación comercial, garantizando el respeto del derecho a la privacidad y el cumplimiento del marco legal vigente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Definiciones</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Autorización:</strong> Consentimiento previo, expreso e informado del titular para llevar a cabo el tratamiento de datos personales.</li>
              <li><strong>Base de Datos:</strong> Conjunto organizado de datos personales que sea objeto de tratamiento.</li>
              <li><strong>Dato Personal:</strong> Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
              <li><strong>Encargado del Tratamiento:</strong> Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, realice el tratamiento de datos personales por cuenta del responsable del tratamiento.</li>
              <li><strong>Responsable del Tratamiento:</strong> Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, decida sobre la base de datos y/o el tratamiento de los datos.</li>
              <li><strong>Titular:</strong> Persona natural cuyos datos personales sean objeto de tratamiento.</li>
              <li><strong>Tratamiento:</strong> Cualquier operación o conjunto de operaciones sobre datos personales, tales como la recolección, almacenamiento, uso, circulación o supresión.</li>
              <li><strong>Publicidad:</strong> Comunicaciones comerciales o promocionales emitidas por la Empresa para divulgar productos, servicios u ofertas.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Principios Rectores</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El tratamiento de datos personales con fines publicitarios se rige por los siguientes principios:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Legalidad:</strong> Solo se realizará tratamiento con la autorización del titular y conforme a la normativa vigente.</li>
              <li><strong>Finalidad:</strong> El tratamiento responderá a propósitos legítimos informados al titular.</li>
              <li><strong>Libertad:</strong> El tratamiento solo podrá realizarse previa autorización, la cual puede revocarse en cualquier momento.</li>
              <li><strong>Veracidad o Calidad:</strong> Los datos deben ser veraces, completos, exactos y actualizados.</li>
              <li><strong>Transparencia:</strong> El titular puede conocer el uso de sus datos en cualquier momento.</li>
              <li><strong>Acceso y Circulación Restringida:</strong> Los datos solo serán tratados por personas autorizadas.</li>
              <li><strong>Seguridad:</strong> Se implementan medidas técnicas, humanas y administrativas para proteger los datos.</li>
              <li><strong>Confidencialidad:</strong> Se garantiza la reserva de la información tratada.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Finalidades del Tratamiento de Datos con Fines Publicitarios</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La Empresa podrá utilizar los datos personales de los titulares para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Enviar comunicaciones comerciales, promociones, ofertas y descuentos relacionados con los productos y servicios de TELAR.</li>
              <li>Informar sobre lanzamientos de nuevos productos o funcionalidades.</li>
              <li>Compartir contenidos de interés, como blogs, noticias o eventos relacionados con la artesanía colombiana.</li>
              <li>Realizar estudios de mercado, encuestas de satisfacción o análisis de comportamiento de compra.</li>
              <li>Personalizar la experiencia del usuario mediante recomendaciones de productos.</li>
              <li>Notificar cambios en los términos y condiciones o políticas de la plataforma.</li>
              <li>Realizar remarketing mediante herramientas tecnológicas autorizadas.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Canales de Comunicación Publicitaria</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TELAR podrá contactar a los titulares a través de los siguientes medios:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Correo electrónico.</li>
              <li>Mensajes de texto (SMS).</li>
              <li>Notificaciones push (en caso de contar con aplicación móvil).</li>
              <li>Redes sociales y plataformas publicitarias.</li>
              <li>Llamadas telefónicas.</li>
              <li>WhatsApp o servicios de mensajería similares.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Autorización y Revocación</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Los datos personales solo serán utilizados con fines publicitarios cuando el titular haya otorgado su autorización expresa para ello.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La autorización podrá ser revocada en cualquier momento, sin justificación alguna, mediante:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Solicitud escrita enviada al correo: datospersonales@telar.co</li>
              <li>Opción de "Cancelar suscripción" en los correos electrónicos recibidos.</li>
              <li>Solicitud formal a través de la plataforma TELAR.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              La revocación se hará efectiva en un plazo máximo de diez (10) días hábiles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Derechos del Titular</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El titular de los datos personales tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Revocar su autorización y/o solicitar la supresión del dato, siempre que no exista una obligación legal que lo impida.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a lo dispuesto en la ley.</li>
              <li>Acceder en forma gratuita a sus datos personales.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Seguridad de la Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              TELAR implementa medidas de seguridad técnicas, administrativas y físicas para proteger los datos personales frente a accesos no autorizados, pérdida, alteración o destrucción.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Uso de Cookies y Tecnologías Similares</h2>
            <p className="text-muted-foreground leading-relaxed">
              La plataforma TELAR puede utilizar cookies, píxeles de seguimiento y herramientas analíticas para mejorar la experiencia del usuario y personalizar la publicidad. El usuario podrá configurar su navegador para aceptar o rechazar el uso de cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Transferencia y Transmisión de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos personales no serán compartidos con terceros para fines publicitarios sin autorización previa del titular, salvo cuando exista una obligación legal o contractual que lo permita o requiera.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Responsable del Tratamiento</h2>
            <div className="text-muted-foreground leading-relaxed">
              <p><strong>GET IN MOTION S.A.S.</strong></p>
              <p>NIT: 901.777.707-1</p>
              <p>Dirección: Calle 77 # 11 - 19, Bogotá D.C., Colombia</p>
              <p>Correo electrónico: datospersonales@telar.co</p>
              <p>Teléfono: +57 300 123 4567</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Vigencia</h2>
            <p className="text-muted-foreground leading-relaxed">
              La presente política entra en vigencia a partir de su publicación y permanecerá vigente mientras la Empresa realice el tratamiento de datos personales con fines publicitarios.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
