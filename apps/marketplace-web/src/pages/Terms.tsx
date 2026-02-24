import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Terms = () => {
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
          <h1 className="text-3xl font-bold mb-2">Términos y Condiciones de Uso</h1>
          <p className="text-muted-foreground mb-8">Última actualización: Diciembre 2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Definiciones</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Plataforma:</strong> El sitio web, aplicación móvil y cualquier otro medio digital operado por TELAR, donde se prestan los servicios de comercio electrónico.</li>
              <li><strong>TELAR:</strong> GET IN MOTION S.A.S., sociedad colombiana, identificada con NIT 901.777.707-1, con domicilio en Bogotá, D.C., que opera como administradora y responsable de la Plataforma.</li>
              <li><strong>Usuario:</strong> Toda persona natural o jurídica que acceda a la Plataforma, ya sea como visitante, comprador o vendedor.</li>
              <li><strong>Comprador:</strong> Usuario que adquiere productos o servicios publicados en la Plataforma.</li>
              <li><strong>Vendedor o Artesano:</strong> Persona natural o jurídica que ofrece productos artesanales a través de la Plataforma, previa aceptación de estos términos y condiciones.</li>
              <li><strong>Producto:</strong> Todo bien material o intangible ofrecido en la Plataforma por un vendedor, incluyendo, pero no limitándose a, artesanías, piezas decorativas, accesorios y obras de arte.</li>
              <li><strong>Orden:</strong> Solicitud de compra realizada por un comprador a través de la Plataforma.</li>
              <li><strong>Contenido:</strong> Texto, imágenes, videos, descripciones, valoraciones y cualquier otra información publicada en la Plataforma.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Objeto de la Plataforma</h2>
            <p className="text-muted-foreground leading-relaxed">
              TELAR es un marketplace que conecta compradores con artesanos colombianos, facilitando la comercialización de productos artesanales. TELAR actúa como intermediario tecnológico, proporcionando el espacio digital para la publicación, promoción y gestión de transacciones, sin ser parte de los contratos de compraventa celebrados entre compradores y vendedores.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Aceptación de los Términos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El acceso y uso de la Plataforma implica la aceptación plena e incondicional de estos términos y condiciones. Si el usuario no está de acuerdo con alguna de las disposiciones aquí contenidas, deberá abstenerse de usar la Plataforma.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              TELAR se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones serán notificadas a los usuarios mediante publicación en la Plataforma o por correo electrónico. El uso continuado de la Plataforma después de la notificación implica la aceptación de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Registro de Usuarios</h2>
            <h3 className="text-lg font-medium mb-3">4.1. Creación de cuenta</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El registro en la Plataforma es gratuito y está abierto a personas naturales mayores de 18 años y personas jurídicas debidamente constituidas. El usuario se compromete a proporcionar información veraz, completa y actualizada.
            </p>
            <h3 className="text-lg font-medium mb-3">4.2. Responsabilidad del usuario</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El usuario es responsable de mantener la confidencialidad de su cuenta y contraseña, y de todas las actividades realizadas bajo su cuenta. En caso de uso no autorizado, deberá notificar inmediatamente a TELAR.
            </p>
            <h3 className="text-lg font-medium mb-3">4.3. Suspensión y cancelación de cuentas</h3>
            <p className="text-muted-foreground leading-relaxed">
              TELAR se reserva el derecho de suspender o cancelar cuentas de usuarios que incumplan estos términos, realicen actividades fraudulentas o que afecten la operación de la Plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Obligaciones de los Compradores</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Proporcionar información veraz y completa para la ejecución de las órdenes.</li>
              <li>Realizar los pagos de acuerdo con los métodos habilitados en la Plataforma.</li>
              <li>Revisar las descripciones, imágenes y condiciones de los productos antes de realizar una compra.</li>
              <li>Comunicar cualquier inconformidad con el producto dentro de los plazos establecidos.</li>
              <li>Abstenerse de realizar reclamaciones fraudulentas o infundadas.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Obligaciones de los Vendedores</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Publicar información veraz, precisa y completa sobre los productos ofrecidos.</li>
              <li>Cumplir con los plazos de preparación y despacho de los productos.</li>
              <li>Garantizar la calidad de los productos conforme a la descripción publicada.</li>
              <li>Responder oportunamente las consultas y solicitudes de los compradores.</li>
              <li>Aceptar devoluciones y reembolsos en los términos establecidos por la ley y la Plataforma.</li>
              <li>Cumplir con todas las obligaciones fiscales, tributarias y de seguridad social aplicables.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Productos Prohibidos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Está prohibido publicar en la Plataforma productos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Falsificados, piratas o que infrinjan derechos de propiedad intelectual.</li>
              <li>Que promuevan la violencia, la discriminación o sean contrarios a la moral y las buenas costumbres.</li>
              <li>Armas, sustancias controladas, medicamentos, flora y fauna protegida.</li>
              <li>Cualquier otro producto cuya venta esté restringida o prohibida por la legislación colombiana.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Proceso de Compra y Pago</h2>
            <h3 className="text-lg font-medium mb-3">8.1. Órdenes</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Una vez realizado el pago, la orden será enviada al vendedor para su procesamiento. TELAR confirmará la orden al comprador mediante correo electrónico.
            </p>
            <h3 className="text-lg font-medium mb-3">8.2. Métodos de pago</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La Plataforma acepta diversos métodos de pago electrónico, incluyendo tarjetas de crédito, débito, PSE y pagos en efectivo a través de convenios con terceros.
            </p>
            <h3 className="text-lg font-medium mb-3">8.3. Precios</h3>
            <p className="text-muted-foreground leading-relaxed">
              Los precios publicados incluyen IVA, salvo que se indique expresamente lo contrario. Los costos de envío se calcularán y mostrarán al momento de finalizar la compra.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Envíos y Entregas</h2>
            <h3 className="text-lg font-medium mb-3">9.1. Tiempos de entrega</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Los tiempos de entrega son estimados y dependen del vendedor y del transportador. TELAR no garantiza plazos exactos de entrega, aunque trabajará por optimizar los tiempos de despacho.
            </p>
            <h3 className="text-lg font-medium mb-3">9.2. Riesgo de pérdida</h3>
            <p className="text-muted-foreground leading-relaxed">
              El riesgo de pérdida o daño de los productos se transfiere al comprador en el momento de la entrega. En caso de daño durante el transporte, el comprador deberá reportarlo conforme al procedimiento establecido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Devoluciones y Reembolsos</h2>
            <h3 className="text-lg font-medium mb-3">10.1. Derecho de retracto</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El comprador podrá ejercer su derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega del producto, de conformidad con el artículo 47 de la Ley 1480 de 2011.
            </p>
            <h3 className="text-lg font-medium mb-3">10.2. Condiciones</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El producto debe encontrarse en perfectas condiciones, sin uso y en su empaque original.
            </p>
            <h3 className="text-lg font-medium mb-3">10.3. Exclusiones</h3>
            <p className="text-muted-foreground leading-relaxed">
              No aplican devoluciones en productos personalizados o hechos a medida, salvo que presenten defectos de fabricación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Garantías</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los productos artesanales cuentan con la garantía legal de calidad, idoneidad y seguridad establecida en el Estatuto del Consumidor. En caso de defectos de fabricación, el comprador podrá solicitar la reparación, el cambio o la devolución del dinero.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Responsabilidad de TELAR</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TELAR actúa exclusivamente como intermediario tecnológico y no es responsable por:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>La calidad, legalidad o veracidad de los productos publicados por los vendedores.</li>
              <li>El incumplimiento de obligaciones contractuales entre compradores y vendedores.</li>
              <li>Daños derivados del uso inadecuado de los productos adquiridos.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              No obstante, TELAR podrá mediar en los conflictos entre compradores y vendedores, y tomará las acciones necesarias para garantizar el buen funcionamiento de la Plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Propiedad Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Todo el contenido de la Plataforma, incluyendo logotipos, diseños, textos, imágenes y software, es propiedad de TELAR o de sus licenciantes. Queda prohibida la reproducción, distribución o modificación sin autorización previa.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Los vendedores otorgan a TELAR una licencia no exclusiva para usar las imágenes y descripciones de sus productos con fines publicitarios y promocionales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">14. Privacidad y Protección de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              El tratamiento de datos personales se realiza conforme a la Política de Tratamiento de Datos Personales, disponible en la Plataforma. Los usuarios aceptan dicha política al registrarse y usar la Plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">15. Resolución de Disputas</h2>
            <h3 className="text-lg font-medium mb-3">15.1. Mediación interna</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              En caso de conflicto entre compradores y vendedores, las partes deberán intentar resolverlo de manera directa. En caso de no lograrlo, podrán solicitar la mediación de TELAR.
            </p>
            <h3 className="text-lg font-medium mb-3">15.2. Jurisdicción aplicable</h3>
            <p className="text-muted-foreground leading-relaxed">
              Cualquier controversia relacionada con estos términos se resolverá conforme a la legislación colombiana y ante los jueces y tribunales de Bogotá, D.C.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">16. Modificaciones a los Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              TELAR se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones serán comunicadas a través de la Plataforma y/o por correo electrónico. El uso continuado de la Plataforma constituye aceptación de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">17. Contacto</h2>
            <div className="text-muted-foreground leading-relaxed">
              <p>Para cualquier consulta o reclamación, el usuario puede contactar a TELAR a través de:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Correo electrónico: soporte@telar.co</li>
                <li>Teléfono: +57 300 123 4567</li>
                <li>Dirección: Calle 77 # 11 - 19, Bogotá D.C., Colombia</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">18. Vigencia</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estos términos y condiciones entran en vigencia a partir de su publicación en la Plataforma.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
