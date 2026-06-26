# Formulario de Onboarding — Identidad Artesanal

## ¿Qué es este módulo?

El **Formulario de Onboarding** es el primer paso que todo artesano debe completar al registrarse en TELAR. Es una conversación guiada dividida en 4 bloques de preguntas + una pantalla final de resultados. Su propósito es que el artesano le cuente a TELAR quién es, cómo trabaja y qué necesita, para que la plataforma y su agente de inteligencia artificial puedan ayudarle de forma personalizada.

Este formulario se encuentra en la ruta `/growth/agent-form` y es obligatorio para todos los artesanos nuevos. Un artesano no puede acceder al dashboard ni a las demás funciones de TELAR hasta completar los 4 bloques.

---

## ¿Cuándo aparece este formulario?

- **Artesanos nuevos:** Inmediatamente después de registrarse y verificar su correo, TELAR redirige al artesano a este formulario. Es la primera experiencia dentro de la plataforma.
- **Artesanos que ya tienen tienda:** Si un artesano ya completó el formulario y tiene tienda activa, al intentar entrar a esta página será redirigido automáticamente al dashboard. Sin embargo, puede volver a acceder si necesita actualizar su información.

---

## Estructura del formulario

El formulario tiene **4 bloques temáticos** que se completan de forma secuencial (uno después de otro). Cada bloque se guarda por separado al dar clic en "Continuar", lo que significa que si el artesano cierra la aplicación a mitad del proceso, cuando vuelva a entrar retomará exactamente en el bloque donde se quedó.

### Bloque 1 — Identidad Artesanal
**Tema:** Quién eres y qué hace especial tu trabajo.

Este bloque recoge la información más personal y esencial del artesano. Las preguntas son:

1. **Nombre de tu taller o marca artesanal** — El nombre con el que el artesano quiere ser conocido en el marketplace. Puede ser su nombre personal, el nombre de su taller o una marca creativa.

2. **Presentación breve** — Una descripción corta de quién es el artesano y qué hace. Este texto se usa como presentación pública en la tienda. El campo incluye la opción de dictar por voz para mayor facilidad.

3. **Años de experiencia** — Cuánto tiempo lleva el artesano dedicado a su oficio. Se puede indicar como un rango aproximado (ejemplo: "hace más de 20 años") o con un número preciso si lo prefiere.

4. **Categorías de oficio** — El tipo de artesanía que practica (cerámica, tejido, joyería, carpintería, etc.). El artesano puede seleccionar una o varias categorías para que TELAR sepa qué tipo de productos hace.

5. **¿Qué hace especial tu trabajo?** — Una selección de diferenciadores que describen el valor único del artesano. Opciones como: técnicas ancestrales, materiales naturales, piezas únicas, diseño contemporáneo, entre otras. Se pueden elegir hasta 3.

6. **¿Cómo aprendiste tu oficio?** — El origen del conocimiento artesanal: herencia familiar, comunidad, maestros tradicionales, autodidacta, formación académica, o una mezcla. Se pueden elegir hasta 3 respuestas.

7. **Cuéntanos la historia detrás de tu oficio** *(opcional)* — Un espacio libre para que el artesano narre con más detalle cómo llegó a este oficio. También tiene dictado por voz.

8. **¿Qué productos haces?** *(opcional)* — Descripción libre de los productos que elabora.

9. **¿Qué significa culturalmente tu oficio?** *(opcional)* — Espacio para explicar la conexión cultural, territorial o comunitaria de su trabajo.

**Campos obligatorios del Bloque 1:** Nombre del taller, presentación breve y años de experiencia.

---

### Bloque 2 — Realidad Comercial
**Tema:** Cómo funciona hoy la parte comercial de tu taller.

Este bloque busca entender la situación económica actual del artesano, sin juzgar. Todas las respuestas son válidas y sirven para que el agente calibre sus recomendaciones. Las preguntas son:

1. **¿En qué rango de precio vendes tus productos?** — Opciones:
   - Menos de $20.000 COP
   - Entre $20.000 y $80.000 COP
   - Entre $80.000 y $200.000 COP
   - Más de $200.000 COP
   - Aún no tengo precios definidos

2. **¿Cómo defines tus precios?** — Cómo llega el artesano al precio de venta:
   - Calcula costos y ganancia con precisión
   - Tiene una idea aproximada pero no completa
   - Se guía por precios de otros
   - Pone un precio según lo que considera justo
   - No tiene una forma clara

3. **¿Qué tan claro tienes cuánto te cuesta producir?** — Nivel de conocimiento de sus costos de producción:
   - Lo tiene muy claro
   - Tiene claros algunos costos pero no todos
   - Lo calcula de forma aproximada
   - Trabaja por experiencia o costumbre
   - No tiene claro cuánto le cuesta

4. **¿Sabes si tu taller genera ganancias?** — Claridad sobre rentabilidad:
   - Lo tiene claro
   - Tiene una idea general
   - Vende pero no sabe cuánto gana
   - Cree que gana poco o pierde dinero
   - Nunca lo ha analizado

**Todos los campos del Bloque 2 son obligatorios.**

---

### Bloque 3 — Clientes y Mercado
**Tema:** Quiénes compran tus productos y dónde vendes.

Este bloque ayuda a entender el mercado actual del artesano. Las preguntas son:

1. **¿Quiénes son tus principales compradores?** — Selección múltiple (hasta 3):
   - Turistas
   - Amantes de lo artesanal
   - Compradores de regalos
   - Diseñadores
   - Clientes locales
   - No lo tengo claro

2. **¿Tienes presencia digital?** — Estado de sus canales digitales:
   - Sí, activa
   - Tengo pero no la uso
   - No tengo
   - Estoy empezando

3. **¿Dónde vendes actualmente?** — Selección múltiple (hasta 3):
   - Ferias y mercados
   - Redes sociales
   - WhatsApp
   - Tienda propia
   - Marketplace online
   - Referidos / voz a voz

4. **¿Cómo es tu actividad de ventas?** — Frecuencia y estabilidad:
   - Constante
   - Irregular
   - Solo en temporadas
   - Casi no vendo

**Todos los campos del Bloque 3 son obligatorios.**

---

### Bloque 4 — Operaciones y Crecimiento
**Tema:** Capacidad productiva, limitaciones y metas.

Este es el último bloque de preguntas. Busca entender qué puede producir el artesano, qué lo frena y qué espera de TELAR. Las preguntas son:

1. **¿Cuántos productos haces al mes?** — Capacidad productiva:
   - Menos de 10
   - 10 – 30
   - 30 – 100
   - Más de 100
   - Varía mucho

2. **¿Qué es lo que más te frena hoy?** — Selección múltiple (hasta 3):
   - Falta de tiempo
   - Falta de dinero / capital
   - Materiales o herramientas
   - Pocos clientes o ventas
   - Falta de conocimiento o apoyo
   - No lo sé

3. **¿Cuántas personas trabajan en tu taller?** — Equipo de trabajo:
   - Solo yo
   - Con mi familia
   - Pequeño equipo (2-5)
   - Colectivo o taller

4. **¿Qué es lo primero que te gustaría que TELAR te ayude a resolver?** — Pregunta abierta donde el artesano escribe libremente qué necesita. También tiene dictado por voz.

**Todos los campos del Bloque 4 son obligatorios.**

---

## ¿Qué es el Oráculo?

En el lado derecho de la pantalla (en computador) o como un botón flotante (en celular), aparece un panel llamado **Oráculo**. Este panel no requiere ninguna acción del artesano — es puramente informativo.

El Oráculo cumple dos funciones:

1. **Explicar por qué se hacen las preguntas.** Cada bloque tiene mensajes que explican al artesano cómo va a usar el agente esa información. Por ejemplo, en el Bloque 1 explica que las categorías sirven para conectar al taller con compradores específicos.

2. **Mostrar qué viene después.** Al final del panel siempre hay un mensaje de "Próximo paso" que le dice al artesano qué esperar cuando termine ese bloque.

El Oráculo solo aparece durante los 4 bloques de preguntas. En la pantalla final (Bloque 5) ya no se muestra.

---

## Pantalla final — Resultados y activación

Después de completar los 4 bloques, el artesano llega a una pantalla de resultados. Aquí suceden dos cosas:

### 1. Análisis del agente

TELAR envía toda la información del artesano a su servicio de inteligencia artificial, que analiza el perfil y devuelve:

- **Nivel de madurez:** Una evaluación general del estado del negocio artesanal (por ejemplo: "en desarrollo", "consolidado", etc.).
- **Mensaje personalizado:** Un título y un texto que resumen las fortalezas y oportunidades detectadas en el perfil del artesano.
- **Recomendaciones de próximos pasos:** Una lista de acciones concretas que el agente sugiere como prioridades para el artesano.

### 2. Creación de la tienda

Dependiendo de la situación del artesano:

- **Si es la primera vez** (no tiene tienda): Aparece un botón **"Crear mi tienda y entrar"** que crea automáticamente su espacio en el marketplace de TELAR usando la información proporcionada (nombre del taller, descripción, historia). Después de crear la tienda, el artesano es llevado al dashboard.

- **Si ya tiene tienda** (está actualizando su perfil): Aparece un mensaje confirmando que la información fue actualizada y un botón **"Volver al dashboard"** para regresar.

---

## Datos pre-cargados

Si el artesano ya completó el formulario de perfil artesanal al crear su tienda (el wizard de la tienda), algunos datos del Bloque 1 se cargan automáticamente:

- Nombre artístico → Nombre del taller
- Biografía corta → Presentación breve
- Categorías seleccionadas
- Cómo aprendió su oficio
- Descripción de productos
- Significado cultural

Cuando esto ocurre, aparece un banner naranja en la parte superior informando al artesano que sus datos fueron cargados desde su Identidad Artesanal y que puede revisarlos antes de confirmar.

---

## Progreso y guardado

- Cada bloque se guarda de forma independiente al avanzar al siguiente.
- El progreso se conserva entre sesiones: si el artesano cierra la aplicación y vuelve, retoma en el bloque exacto donde se quedó.
- El artesano puede navegar hacia atrás entre bloques usando el botón "Atrás" en la barra superior.
- Si falla el guardado de un bloque, se muestra un mensaje de error y el artesano permanece en ese bloque para intentar de nuevo.

---

## Validaciones

Antes de avanzar de un bloque al siguiente, TELAR verifica que los campos obligatorios estén completos. Si falta alguno, se muestra un mensaje indicando exactamente qué campo necesita completarse. El artesano no puede avanzar al siguiente bloque hasta completar todos los campos obligatorios del bloque actual.

---

## Flujo resumido

```
Registro → Verificar correo → Formulario de Onboarding
                                    │
                                    ├── Bloque 1: Identidad (nombre, historia, categorías)
                                    │       ↓ Guardar
                                    ├── Bloque 2: Comercial (precios, costos, ganancias)
                                    │       ↓ Guardar
                                    ├── Bloque 3: Mercado (compradores, canales, ventas)
                                    │       ↓ Guardar
                                    ├── Bloque 4: Operaciones (capacidad, límites, metas)
                                    │       ↓ Guardar + Análisis IA
                                    └── Pantalla final: Resultados + Crear tienda
                                            ↓
                                        Dashboard
```
