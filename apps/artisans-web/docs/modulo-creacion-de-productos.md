# Creación de Productos — Registro de piezas artesanales

## ¿Qué es este módulo?

El módulo de **Creación de Productos** es el asistente paso a paso que permite a los artesanos registrar sus piezas en el marketplace de TELAR. Es un proceso guiado de 6 pasos que va desde capturar las primeras fotos de la pieza hasta enviarla a revisión para ser publicada.

Cada pieza que se registra en TELAR recibe un **Pasaporte Digital**: un documento de trazabilidad que consolida el origen, la técnica, los materiales y la evidencia del proceso de elaboración. Este pasaporte es lo que diferencia a los productos de TELAR de cualquier otro marketplace.

Este módulo se encuentra en la ruta de creación de productos y es accesible desde el dashboard del artesano.

---

## ¿Quién puede usar este módulo?

Solo artesanos que ya tienen una **tienda activa** en TELAR. Si el artesano aún no ha creado su tienda, al intentar acceder se muestra un mensaje indicando que primero debe crearla, con un botón para ir al formulario de creación.

---

## Guardado automático

El asistente guarda automáticamente el progreso cada vez que el artesano avanza al siguiente paso. Además, hay un botón de "Guardar borrador" disponible en todo momento. Si el artesano cierra la aplicación y regresa después, puede retomar exactamente donde se quedó.

Los borradores se guardan tanto en el dispositivo del artesano como en el servidor, lo que permite continuar desde otro dispositivo si es necesario.

---

## Estructura del asistente

El asistente tiene **6 pasos** que se completan en orden:

---

### Paso 1 — Nueva pieza

**Tema:** Captura inicial para que TELAR entienda qué estás creando.

Este es el punto de partida. El artesano presenta su pieza con fotos, un nombre, una descripción y opcionalmente su historia de origen.

#### Campos de este paso:

1. **Nombre de la pieza** *(obligatorio)*
   - El nombre con el que se mostrará el producto en la tienda.
   - Ejemplos: "Vasija de barro", "Bolso tejido", "Collar en chaquira".

2. **Fotos del producto** *(la foto principal es obligatoria)*
   - Se pueden subir hasta 5 fotos, cada una con una guía específica:
     - **Foto principal** *(obligatoria)* — La pieza completa con fondo limpio
     - **Detalle** — Acercamiento a la textura del material
     - **Lateral** — Vista que muestre la forma y el volumen
     - **Otro ángulo** — Perspectiva adicional del producto
     - **Entorno** — La pieza en su contexto cultural o de uso
   - En celular se muestran como un carrusel horizontal deslizable.
   - En computador se muestra una foto grande principal con cuatro fotos secundarias al lado.

3. **Descripción breve** *(obligatorio)*
   - Lo que verá el comprador en la tienda. Un texto corto que explique qué es la pieza, cómo está hecha o para qué sirve.
   - Tiene la opción de **dictar por voz** presionando el botón del micrófono.

4. **Historia y contexto** *(opcional)*
   - No es la descripción del producto sino su origen: ¿de quién aprendiste a hacerlo? ¿Qué representa esta pieza para tu comunidad?
   - Esta historia aparecerá en el Pasaporte Digital de la pieza.
   - Tiene **dictado por voz**.
   - Incluye una **biblioteca de historias**: el artesano puede guardar historias que haya escrito y reutilizarlas para otros productos similares.

**El Oráculo en este paso** explica que está esperando la foto principal para analizar forma, textura e iluminación, y que la historia y descripción ayudarán a completar la identidad de la pieza en el siguiente paso.

**Para avanzar al Paso 2** es necesario completar: nombre de la pieza y descripción breve.

---

### Paso 2 — Identidad artesanal

**Tema:** Técnica, estilo, materiales y categoría de tu pieza.

En este paso el artesano clasifica su pieza dentro del sistema de TELAR. La inteligencia artificial sugiere valores basados en las fotos y la descripción del paso anterior, que el artesano puede aceptar o ajustar.

#### Campos de este paso:

1. **Categoría TELAR** *(obligatorio)*
   - El tipo de producto. Se elige una de 9 categorías con íconos visuales:
     - Textiles y Moda
     - Bolsos y Carteras
     - Joyería y Accesorios
     - Decoración del Hogar
     - Muebles
     - Vajillas y Cocina
     - Arte y Esculturas
     - Juguetes e Instrumentos Musicales
     - Cuidado Personal

2. **Subcategoría** *(opcional)*
   - Aparece después de elegir la categoría. Permite especificar más el tipo de producto (las opciones varían según la categoría seleccionada).

3. **Oficio** *(obligatorio)*
   - El oficio artesanal con el que se elaboró la pieza (ejemplo: cerámica, tejeduría, orfebrería).
   - Se muestra un buscador con sugerencias filtradas según la categoría elegida.

4. **Técnica** *(opcional)*
   - La técnica específica utilizada (ejemplo: modelado a mano, telar de cintura, filigrana).
   - Las opciones se filtran según el oficio seleccionado.

5. **Materiales** *(opcional)*
   - Los materiales con los que está hecha la pieza.
   - Se pueden seleccionar varios materiales de una base de datos con sugerencias según el oficio y la técnica.
   - Los materiales que seleccione el artesano también se guardan en su perfil para futuros productos.

6. **Propósito de la pieza** *(opcional)*
   - Para qué fue creada la pieza:
     - **Funcional** — Tiene un uso práctico en el día a día
     - **Decorativa** — Su propósito es embellecer espacios
     - **Ritual** — Uso ceremonial, espiritual o simbólico
     - **Coleccionable** — Valor cultural o artístico para coleccionar

7. **Estilo** *(opcional)*
   - El estilo artesanal de la pieza:
     - **Tradicional** — Sigue métodos y estéticas ancestrales fieles a su origen
     - **Contemporáneo** — Incorpora lenguajes actuales sin abandonar la técnica artesanal
     - **Fusión** — Mezcla tradición con influencias modernas o de otras culturas

8. **Tipo de producción** *(opcional)*
   - Cómo se produce esta pieza:
     - **Única** — Pieza exclusiva, solo existe una
     - **Serie limitada** — Un número definido de unidades idénticas
     - **Continua** — Se produce de forma regular y permanente
     - **Bajo pedido** — Se fabrica cuando hay un encargo específico

9. **¿Creada en colaboración?** *(opcional)*
   - Si otra persona, marca o colectivo participó en la creación.
   - Si se activa, aparece un campo para indicar el nombre del colaborador.

**El Oráculo en este paso** muestra sugerencias de la IA para categoría, técnica y materiales basadas en las fotos y la descripción. El artesano puede confirmar o cambiar cada sugerencia.

**Para avanzar al Paso 3** es necesario completar: categoría y oficio.

---

### Paso 3 — Proceso y tiempo

**Tema:** Evidencia y descripción para la trazabilidad TELAR.

Este paso documenta cómo se elabora la pieza. Las fotos y descripciones del proceso fortalecen el Pasaporte Digital y permiten a los compradores conocer el trabajo detrás de cada pieza.

#### Campos de este paso:

1. **Registro del proceso** *(opcional pero recomendado)*
   - Se pueden subir hasta 5 fotos o videos del proceso de elaboración, cada uno con una guía:
     - **Vista general** — El proceso completo o la pieza en progreso
     - **Herramientas** — Los materiales y herramientas en uso
     - **Fase inicial** — El comienzo del proceso
     - **En proceso** — Un paso intermedio o transformación
     - **Acabado** — Detalle o etapa final
   - Se muestra en el mismo formato que las fotos del Paso 1 (carrusel en celular, galería en computador).

2. **Descripción del proceso** *(opcional)*
   - Un texto que describe paso a paso cómo se elabora la pieza.
   - Tiene **dictado por voz**.
   - Incluye una **biblioteca de procesos**: el artesano puede guardar descripciones para reutilizar en productos similares.
   - La IA usará esta descripción junto con las fotos para detectar fases, herramientas y tiempos.

3. **Tiempo de elaboración** *(opcional)*
   - Cuánto tiempo tarda en crear la pieza. Se elige una opción predefinida o se escribe un tiempo personalizado:
     - 1–3 días
     - 1 semana
     - 15 días
     - 1 mes
     - Personalizado (ejemplo: "3 meses", "45 días")

4. **Capacidad mensual** *(opcional)*
   - Cuántas piezas como esta puede elaborar el artesano en un mes.
   - Se muestra como: "[número] piezas / mes".

5. **Herramientas** *(opcional)*
   - Las herramientas que se usan para crear esta pieza.
   - Se seleccionan de una lista que se filtra según el oficio del artesano.

6. **Cuidados del producto** *(opcional)*
   - Instrucciones para que el comprador mantenga la pieza en buen estado: limpieza, almacenamiento, materiales a evitar.
   - Ejemplo: "Limpiar con paño suave, evitar humedad, no exponer al sol directo."

**El Oráculo en este paso** indica que está analizando las fotos y la descripción para sugerir tiempos, capacidad y método de elaboración.

**Para avanzar al Paso 4** no hay campos estrictamente obligatorios, pero se recomienda agregar al menos fotos del proceso y una descripción.

---

### Paso 4 — Precio y logística

**Tema:** Define cómo se comercializa y despacha esta pieza.

Este es el paso comercial. Aquí el artesano define cuánto cuesta su pieza, cuántas tiene disponibles, y las dimensiones para el envío.

#### Campos de este paso:

1. **Precio de venta** *(obligatorio)*
   - El precio en pesos colombianos (COP) que el artesano quiere recibir por la pieza.
   - Al ingresar el precio, TELAR muestra automáticamente un desglose:
     - **Lo que paga el comprador:**
       - Precio base del artesano
       - Cargo de servicio TELAR (+5%)
       - Total que verá el comprador
     - **Lo que recibe el artesano:**
       - Comisión TELAR (−10%)
       - Pasarela de pago (−3.5%)
       - Monto aproximado que recibirá

2. **Código SKU**
   - TELAR genera automáticamente un código único para la pieza usando la categoría, el territorio y la técnica. No es necesario que el artesano lo ingrese.

3. **Disponibilidad comercial** *(obligatorio)*
   - Cómo está disponible la pieza:
     - **Disponible ahora** — Hay unidades listas para despacho
     - **Bajo pedido** — Se fabrica cuando llega un encargo
     - **Edición limitada** — Número fijo de unidades en total

4. **Stock disponible**
   - Cuántas unidades tiene disponibles.
   - Si la pieza es de tipo "única" (definida en el Paso 2), el stock se fija automáticamente en 1.
   - Si es "bajo pedido", se indica la capacidad mensual.
   - Si es "edición limitada", se definen las unidades totales.

5. **Alerta de stock mínimo** *(opcional)*
   - TELAR puede avisar al artesano cuando el inventario baje de cierta cantidad.

6. **Tiempo de entrega** *(solo si es bajo pedido)*
   - Opciones: 1 semana, 2 semanas, 1 mes, más de 1 mes.

7. **Dimensiones de la pieza** *(opcional)*
   - Alto, ancho y largo en centímetros.
   - Peso en kilogramos o gramos (TELAR selecciona la unidad automáticamente según el material; por ejemplo, usa gramos para joyería y kilogramos para cerámica).

8. **Dimensiones del paquete** *(opcional)*
   - Las medidas con empaque incluido (ancho, alto, largo y peso).
   - Estas medidas se usan para calcular el costo de envío.

9. **¿Requiere manejo especial?** *(opcional)*
   - Para piezas frágiles o delicadas.
   - Si se activa, aparece un campo para escribir notas sobre fragilidad o empaque especial.

**El Oráculo en este paso** muestra sugerencias de la IA para precio, tipo de empaque y peso estimado basados en la técnica, materiales y categoría de la pieza. El artesano puede aceptar o rechazar cada sugerencia.

**Para avanzar al Paso 5** es necesario completar: precio y tipo de disponibilidad.

---

### Paso 5 — Pasaporte digital

**Tema:** Vista previa del pasaporte de trazabilidad.

Este paso no tiene campos para llenar. Es una vista previa del **Pasaporte Digital** de la pieza: el documento que consolida toda la información registrada sobre origen, autoría, técnica, materiales y evidencia del proceso.

#### Lo que se muestra:

**En celular:**
- Estado del pasaporte (preparado/pendiente)
- Código único del pasaporte (ejemplo: TLR-PV-2026-4821)
- Historia y proceso de la pieza (extracto)
- Insignias con técnica, materiales y tiempo de elaboración
- Origen (municipio, departamento)
- Dimensiones físicas
- Evidencia fotográfica del proceso
- Aviso: "El pasaporte se activará cuando la pieza sea aprobada para marketplace."

**En computador:**
- Misma información pero en un diseño más amplio tipo documento:
  - Barra de identidad con código de pasaporte
  - Tarjetas de origen/autoría y detalles físicos
  - Documento de origen con la narrativa del proceso en formato de cita
  - Cuadrícula de metadatos: materiales, técnica, subtécnica, tiempo estimado
  - Galería de evidencia de trazabilidad
  - **Sello de validación**: un distintivo visual que indica que el documento consolida la herencia cultural declarada y documentada dentro del flujo de TELAR
  - Estado: "Curaduría en proceso"

Cada sección tiene un botón de edición que lleva directamente al paso correspondiente para hacer ajustes rápidos.

**Para avanzar al Paso 6** no hay requisitos adicionales.

---

### Paso 6 — Revisión final

**Tema:** Verifica la información antes de enviar a curaduría.

Este es el último paso. Presenta un resumen completo de toda la información del producto para que el artesano la verifique antes de enviar.

#### Lo que se muestra:

**En celular** se muestra como una lista vertical de 5 secciones, cada una con:
- Ícono y miniatura del producto
- Título de la sección
- Resumen del contenido
- Indicador de estado (verde = "Listo", naranja = "Incompleto")
- Botón para ir a editar esa sección

Las secciones son:
1. **La pieza** — Nombre, descripción, foto
2. **Identidad y origen** — Categoría, territorio
3. **Técnica y proceso** — Oficio, tiempo de elaboración
4. **Precio y logística** — Precio, disponibilidad, dimensiones
5. **Pasaporte digital** — Estado del pasaporte

**En computador** se muestra como una cuadrícula de tarjetas con información más detallada:
- **La pieza** — Foto, nombre, descripción
- **Identidad y origen** — Categoría, estilo, origen, taller
- **Técnica y proceso** — Oficio, técnica, materiales, tiempo, descripción
- **Evidencia y trazabilidad** — Cantidad de fotografías y registro de proceso
- **Precio y logística** — Precio publicado, desglose, disponibilidad, dimensiones, peso, origen de despacho, paquete de envío
- **Pasaporte digital** — Estado y descripción del pasaporte

#### Acciones disponibles:

- **Guardar borrador** — Guarda el producto sin publicar para seguir editando después.
- **Enviar a curaduría** — Envía la pieza para revisión del equipo TELAR. El producto queda en estado "pendiente de moderación" hasta que sea aprobado.

---

## Pantalla de confirmación

Después de enviar la pieza, aparece una pantalla de confirmación con:

- Ícono de check verde
- Mensaje: **"¡Pieza enviada!"**
- Nombre del producto
- Texto: "Tu pieza está en revisión por el equipo de TELAR. Te avisaremos cuando sea aprobada para el marketplace. Mientras tanto la puedes ver en tu dashboard."
- Dos botones:
  - **"Ir al dashboard"** — Regresa a la página principal
  - **"Registrar otra pieza"** — Limpia el formulario para empezar con un nuevo producto

---

## Modo de edición

Si el artesano necesita editar un producto que ya fue registrado, puede acceder al mismo asistente en modo edición. En este modo:

- Se cargan todos los datos del producto existente
- El asistente abre directamente en el Paso 6 (Revisión final) para que el artesano pueda ir a cualquier sección a modificar
- Los cambios se guardan sobre el producto existente en lugar de crear uno nuevo

---

## El Oráculo en este módulo

El Oráculo acompaña al artesano durante todo el proceso de creación. Funciona de dos maneras:

- **En computador:** Aparece como un panel fijo en el lado derecho de cada paso.
- **En celular:** Aparece como un botón "ORÁCULO" en la parte inferior que al tocarlo despliega un panel deslizable hacia arriba.

El Oráculo muestra información contextual según el paso en el que se encuentre el artesano: qué datos está analizando la IA, qué sugerencias tiene, y qué viene después.

En los pasos 2, 3 y 4, el Oráculo puede mostrar **sugerencias de la IA** basadas en las fotos y la descripción del producto. El artesano puede aceptar cada sugerencia (se aplica automáticamente) o rechazarla (el campo queda para llenar manualmente). TELAR registra internamente qué sugerencias fueron aceptadas y cuáles no, como parte de la trazabilidad del producto.

---

## Datos que se cargan automáticamente

Para agilizar el registro, TELAR pre-carga información que el artesano ya proporcionó antes:

| Dato | Origen |
|------|--------|
| Departamento y municipio | Tienda del artesano |
| Oficio artesanal | Perfil artesanal |
| Técnica principal y secundaria | Identidad artesanal |
| Proceso de creación | Perfil artesanal (si fue registrado antes) |
| Herramientas del taller | Perfil artesanal |

---

## Cálculo de precios

Cuando el artesano ingresa su precio de venta, TELAR calcula automáticamente:

| Concepto | Cálculo |
|----------|---------|
| Precio base | Lo que define el artesano |
| Cargo de servicio TELAR | +5% sobre el precio base |
| **Total al comprador** | **Precio base + 5%** |
| Comisión TELAR | −10% del precio base |
| Pasarela de pago | −3.5% del precio base |
| **El artesano recibe** | **Precio base − 10% − 3.5%** |

Este desglose es transparente y se muestra en tiempo real cada vez que el artesano modifica el precio.

---

## Estados del producto

| Estado | Significado |
|--------|-------------|
| **Borrador** | El producto está guardado pero no ha sido enviado a revisión. El artesano puede seguir editándolo. |
| **Pendiente de moderación** | El producto fue enviado y está siendo revisado por el equipo TELAR. |
| **Publicado** | El producto fue aprobado y está visible en el marketplace para los compradores. |

---

## Flujo resumido

```
Dashboard → Crear producto
                │
                ├── Paso 1: Nueva pieza (fotos, nombre, descripción, historia)
                │       ↓ Auto-guardado
                ├── Paso 2: Identidad (categoría, oficio, técnica, materiales, estilo)
                │       ↓ Auto-guardado
                ├── Paso 3: Proceso (evidencia, descripción, tiempo, herramientas, cuidados)
                │       ↓ Auto-guardado
                ├── Paso 4: Precio y logística (precio, disponibilidad, dimensiones, envío)
                │       ↓ Auto-guardado
                ├── Paso 5: Pasaporte digital (vista previa del documento de trazabilidad)
                │       ↓ Auto-guardado
                └── Paso 6: Revisión final (resumen completo + enviar a curaduría)
                        ↓
                    Pieza enviada → Pendiente de moderación → Publicada en marketplace
```

---

## Relación con otros módulos

| Módulo | Relación |
|--------|----------|
| **Formulario de Onboarding** | Proporciona el contexto del negocio que la IA usa para sugerir precios y categorías. |
| **Identidad Artesanal** | Pre-carga oficio, técnica, materiales y procesos del artesano para agilizar el registro. |
| **Tienda del artesano** | Pre-carga departamento y municipio. Los productos publicados aparecen en la tienda. |
| **Dashboard** | Desde aquí se accede al módulo. Los productos registrados se listan en el dashboard con su estado. |
| **Pasaporte Digital** | Se genera automáticamente como parte del registro. Se activa cuando el producto es aprobado. |
