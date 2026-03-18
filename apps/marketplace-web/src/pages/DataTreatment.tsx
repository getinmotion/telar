import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const DataTreatment = () => {
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
          <h1 className="text-3xl font-bold mb-2">Política de Tratamiento de Datos Personales</h1>
          <p className="text-muted-foreground mb-8">Última actualización: Diciembre 2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Identificación del Responsable</h2>
            <div className="text-muted-foreground leading-relaxed">
              <p><strong>Razón Social:</strong> GET IN MOTION S.A.S.</p>
              <p><strong>NIT:</strong> 901.777.707-1</p>
              <p><strong>Dirección:</strong> Calle 77 # 11 - 19, Bogotá D.C., Colombia</p>
              <p><strong>Correo electrónico:</strong> datospersonales@telar.co</p>
              <p><strong>Teléfono:</strong> +57 300 123 4567</p>
              <p><strong>Sitio web:</strong> www.telar.co</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              GET IN MOTION S.A.S., en adelante "TELAR" o "la Empresa", actúa como Responsable del Tratamiento de los datos personales recolectados a través de su plataforma de comercio electrónico y demás canales de contacto.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Objeto de la Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              La presente Política tiene por objeto establecer los lineamientos, principios, derechos y procedimientos que rigen el tratamiento de datos personales recolectados por TELAR, en cumplimiento de lo establecido en la Ley 1581 de 2012, el Decreto 1377 de 2013, y demás normas que las modifiquen, adicionen o complementen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Definiciones</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Autorización:</strong> Consentimiento previo, expreso e informado del titular para llevar a cabo el tratamiento de datos personales.</li>
              <li><strong>Base de Datos:</strong> Conjunto organizado de datos personales que sea objeto de tratamiento.</li>
              <li><strong>Dato Personal:</strong> Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
              <li><strong>Dato Público:</strong> Dato que no sea semiprivado, privado o sensible. Son considerados datos públicos, entre otros, los datos relativos al estado civil de las personas, a su profesión u oficio y a su calidad de comerciante o de servidor público.</li>
              <li><strong>Dato Privado:</strong> Dato que por su naturaleza íntima o reservada solo es relevante para el titular.</li>
              <li><strong>Dato Sensible:</strong> Dato que afecta la intimidad del titular o cuyo uso indebido puede generar discriminación, tales como aquellos que revelen el origen racial o étnico, la orientación política, las convicciones religiosas o filosóficas, la pertenencia a sindicatos, organizaciones sociales, de derechos humanos, así como datos relativos a la salud, la vida sexual y los datos biométricos.</li>
              <li><strong>Encargado del Tratamiento:</strong> Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, realice el tratamiento de datos personales por cuenta del responsable del tratamiento.</li>
              <li><strong>Responsable del Tratamiento:</strong> Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, decida sobre la base de datos y/o el tratamiento de los datos.</li>
              <li><strong>Titular:</strong> Persona natural cuyos datos personales sean objeto de tratamiento.</li>
              <li><strong>Tratamiento:</strong> Cualquier operación o conjunto de operaciones sobre datos personales, tales como la recolección, almacenamiento, uso, circulación o supresión.</li>
              <li><strong>Transferencia:</strong> El tratamiento de datos que implica la comunicación de los mismos dentro o fuera del territorio de la República de Colombia cuando tenga por objeto la realización de un tratamiento por el encargado.</li>
              <li><strong>Transmisión:</strong> El tratamiento de datos que implica la comunicación de los mismos dentro o fuera del territorio de la República de Colombia cuando tenga por objeto la realización de un tratamiento por el encargado por cuenta del responsable.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Principios del Tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TELAR aplicará los siguientes principios en el tratamiento de datos personales:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Principio de legalidad:</strong> El tratamiento de datos personales es una actividad reglada que debe sujetarse a lo establecido en la ley y demás disposiciones que la desarrollen.</li>
              <li><strong>Principio de finalidad:</strong> El tratamiento debe obedecer a una finalidad legítima de acuerdo con la Constitución y la ley, la cual debe ser informada al titular.</li>
              <li><strong>Principio de libertad:</strong> El tratamiento solo puede ejercerse con el consentimiento previo, expreso e informado del titular. Los datos personales no podrán ser obtenidos o divulgados sin previa autorización.</li>
              <li><strong>Principio de veracidad o calidad:</strong> La información sujeta a tratamiento debe ser veraz, completa, exacta, actualizada, comprobable y comprensible.</li>
              <li><strong>Principio de transparencia:</strong> El titular debe poder acceder a información acerca de la existencia de datos que le conciernan.</li>
              <li><strong>Principio de acceso y circulación restringida:</strong> El tratamiento solo podrá realizarse por personas autorizadas por el titular y/o por las personas previstas en la ley.</li>
              <li><strong>Principio de seguridad:</strong> La información sujeta a tratamiento debe estar protegida con las medidas técnicas, humanas y administrativas necesarias para otorgar seguridad a los registros.</li>
              <li><strong>Principio de confidencialidad:</strong> Todas las personas que intervengan en el tratamiento de datos están obligadas a garantizar la reserva de la información.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Datos Personales Recolectados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TELAR recolecta los siguientes tipos de datos personales:
            </p>
            <h3 className="text-lg font-medium mb-3">5.1. De Compradores:</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Nombres y apellidos</li>
              <li>Número de identificación (cédula, pasaporte, NIT)</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección de envío</li>
              <li>Información de pago (datos de tarjetas procesados por pasarelas de pago autorizadas)</li>
              <li>Historial de compras</li>
              <li>Preferencias de consumo</li>
            </ul>
            <h3 className="text-lg font-medium mb-3">5.2. De Vendedores (Artesanos):</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Nombres y apellidos o razón social</li>
              <li>Número de identificación (cédula, NIT)</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección de domicilio o establecimiento</li>
              <li>Información bancaria para desembolsos</li>
              <li>Registro de cámara de comercio (cuando aplique)</li>
              <li>Fotografías de productos</li>
              <li>Historial de ventas</li>
            </ul>
            <h3 className="text-lg font-medium mb-3">5.3. De Visitantes:</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Dirección IP</li>
              <li>Datos de navegación (cookies, páginas visitadas, tiempo de permanencia)</li>
              <li>Ubicación geográfica (si el usuario lo autoriza)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Finalidades del Tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Los datos personales recolectados serán utilizados para las siguientes finalidades:
            </p>
            <h3 className="text-lg font-medium mb-3">6.1. Finalidades generales:</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Gestionar el registro y creación de cuentas de usuario.</li>
              <li>Procesar y gestionar las órdenes de compra.</li>
              <li>Facilitar la comunicación entre compradores y vendedores.</li>
              <li>Realizar el despacho y seguimiento de los productos adquiridos.</li>
              <li>Procesar pagos y desembolsos.</li>
              <li>Atender peticiones, quejas y reclamos.</li>
              <li>Enviar notificaciones relacionadas con la operación de la Plataforma.</li>
            </ul>
            <h3 className="text-lg font-medium mb-3">6.2. Finalidades comerciales y publicitarias:</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Enviar comunicaciones comerciales, promociones y ofertas.</li>
              <li>Realizar estudios de mercado y análisis de comportamiento de compra.</li>
              <li>Personalizar la experiencia del usuario mediante recomendaciones de productos.</li>
              <li>Realizar campañas de remarketing.</li>
            </ul>
            <h3 className="text-lg font-medium mb-3">6.3. Finalidades legales y regulatorias:</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Cumplir con obligaciones legales, fiscales y regulatorias.</li>
              <li>Prevenir fraudes y garantizar la seguridad de la Plataforma.</li>
              <li>Atender requerimientos de autoridades competentes.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Autorización del Titular</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TELAR obtendrá la autorización previa, expresa e informada de los titulares para el tratamiento de sus datos personales. Dicha autorización se obtendrá a través de:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Formularios de registro en la Plataforma (marcación de casilla de aceptación).</li>
              <li>Aceptación de términos y condiciones.</li>
              <li>Consentimiento expreso mediante firma física o digital.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              La autorización podrá ser revocada en cualquier momento mediante solicitud escrita al correo datospersonales@telar.co.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Derechos del Titular</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El titular de los datos personales tiene los siguientes derechos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informado sobre el uso que se ha dado a sus datos personales.</li>
              <li>Presentar ante la Superintendencia de Industria y Comercio quejas por infracciones a lo dispuesto en la ley.</li>
              <li>Revocar la autorización y/o solicitar la supresión del dato, cuando no exista una obligación legal o contractual que lo impida.</li>
              <li>Acceder en forma gratuita a sus datos personales.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Procedimiento para el Ejercicio de Derechos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El titular podrá ejercer sus derechos mediante solicitud escrita enviada al correo datospersonales@telar.co, indicando:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Nombre completo y número de identificación.</li>
              <li>Descripción del derecho que desea ejercer.</li>
              <li>Documentos que sustenten la solicitud (si aplica).</li>
              <li>Datos de contacto para respuesta.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Plazos de respuesta:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Consultas: Diez (10) días hábiles desde la recepción de la solicitud.</li>
              <li>Reclamos: Quince (15) días hábiles desde la recepción de la solicitud.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Seguridad de la Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              TELAR implementa medidas técnicas, humanas y administrativas para proteger los datos personales frente a accesos no autorizados, pérdida, alteración, destrucción o uso indebido. Dichas medidas incluyen cifrado de datos, controles de acceso, auditorías de seguridad y capacitación del personal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Transferencia y Transmisión de Datos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TELAR podrá transferir o transmitir datos personales a terceros encargados del tratamiento, tales como:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pasarelas de pago para el procesamiento de transacciones.</li>
              <li>Empresas de logística y transporte para el despacho de productos.</li>
              <li>Proveedores de servicios de alojamiento en la nube.</li>
              <li>Empresas de marketing y publicidad digital.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              La transferencia o transmisión de datos se realizará bajo estrictas condiciones de seguridad y confidencialidad, garantizando que los terceros cumplan con niveles de protección equivalentes a los establecidos en esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Uso de Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              La Plataforma utiliza cookies y tecnologías similares para mejorar la experiencia del usuario, analizar el tráfico y personalizar el contenido. El usuario podrá configurar su navegador para aceptar o rechazar el uso de cookies. Para mayor información, consulte nuestra Política de Cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Datos de Menores de Edad</h2>
            <p className="text-muted-foreground leading-relaxed">
              TELAR no recolecta datos personales de menores de edad sin el consentimiento previo, expreso y verificable de los padres o representantes legales. En caso de que se detecte que se han recolectado datos de menores sin autorización, estos serán eliminados de forma inmediata.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">14. Vigencia</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos personales serán almacenados durante el tiempo necesario para cumplir con las finalidades descritas en esta política, y durante los plazos legales de conservación que apliquen. Una vez finalizado el tratamiento, los datos serán eliminados o anonimizados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">15. Modificaciones a la Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              TELAR se reserva el derecho de modificar esta política en cualquier momento. Los cambios serán comunicados a los titulares mediante publicación en la Plataforma o por correo electrónico.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">16. Contacto</h2>
            <div className="text-muted-foreground leading-relaxed">
              <p>Para cualquier consulta, petición, queja o reclamo relacionado con el tratamiento de datos personales, el titular puede contactar a TELAR a través de:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Correo electrónico: datospersonales@telar.co</li>
                <li>Teléfono: +57 300 123 4567</li>
                <li>Dirección: Calle 77 # 11 - 19, Bogotá D.C., Colombia</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">17. Autoridad de Protección de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              La autoridad encargada de vigilar el cumplimiento de la normativa de protección de datos en Colombia es la Superintendencia de Industria y Comercio (SIC). El titular puede presentar quejas o denuncias ante esta entidad en caso de vulneración de sus derechos.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default DataTreatment;
