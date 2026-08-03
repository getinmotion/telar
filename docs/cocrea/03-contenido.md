# CO-CREA · Contenido generado

Generado por `apps/api/scripts/cocrea-completitud/03-contenido.ts` contra **prod**.

Contenido para **23** tiendas nuevas y **57** por completar.
El texto de cada tienda vive en `state/contenido.json`, que no se versiona.

## Cómo se genera

No hay información real de cada artesano más allá del oficio y el territorio, así que el
texto se arma con variantes elegidas de forma **determinista** a partir del nombre de la
persona. Dos artesanos reciben textos distintos, y volver a correr el script produce
exactamente lo mismo — eso es lo que permite reintentar la inyección sin que el contenido
cambie por debajo.

El oficio se infiere del nombre del taller, la Escuela Taller de origen y —cuando la tienda
ya existe— de lo que el artesano escribió en su descripción o su historia.

## Oficio inferido

| Oficio | Tiendas |
|---|---:|
| Tejeduría | 38 |
| Viche | 28 |
| Joyería artesanal | 9 |
| Marroquinería artesanal | 2 |
| Trabajo en fibras naturales | 2 |
| Tallado artesanal | 1 |

✅ Todos los oficios y categorías resuelven contra la taxonomía real.

✅ Todos los territorios resuelven contra el catálogo DANE.

### Territorios aproximados

En 2 casos el Excel trae el municipio mal escrito o uno que no está en el catálogo DANE. Se reconoció el **departamento** y se usó su capital, que es lo más cercano que se puede afirmar:

- Marcial Montalvo · "Municipio de Tuchín, departamento de Córdoba" → Montería
- Luis Evacio Montaño · "Gaupi - Cauca" → Popayán

Hay que corregirlos a mano cuando el equipo confirme el municipio real.

Resolver el territorio no es una búsqueda de texto ingenua. Dos trampas costaron una corrección cada una:
la coincidencia por subcadena hacía que "depar**tame**nto" resolviera a *Tame (Arauca)* y "Por**tado**res" a
*Tadó (Chocó)*; y varios municipios se llaman igual que un departamento ajeno, así que "Mompós, Bolívar"
caía en *Bolívar (Cauca)* y "Tumaco - Nariño" en *Nariño (Antioquia)*.

## Datos sintéticos

| Dato | Cuántos | Valor |
|---|---:|---|
| Cédula | 18 | `9900000001` en adelante |
| Teléfono | 23 | `+573900000001` en adelante |

Ambos rangos son reconocibles a simple vista y no pueden colisionar con datos reales
(`39` no es un prefijo móvil válido en Colombia). Quedan listados en `state/contenido.json`
para que el equipo los reemplace cuando consiga los datos verdaderos.

## Imágenes

Todo se genera como SVG y se sube a S3 con `POST /file-upload/image`, que acepta
`image/svg+xml` — no hace falta rasterizar.

- **Logo**: monograma sobre color, uno de ocho de la paleta.
- **Banner**: cabecera 1600×600 con el nombre y el oficio sobre una trama geométrica
  distinta por marca. Va a `bannerUrl` **y** a `heroConfig.slides`, porque el perfil
  del marketplace lee los slides, no `bannerUrl`.
- **Foto de producto**: 1000×1000 con el monograma y el nombre de la pieza. Sin ella el
  producto se ve roto en el listado.

Son placeholders declarados, no arte final: sirven para que la tienda no salga vacía
mientras el artesano sube sus fotos.

## Ficha de producto

Cada producto lleva medidas, peso, empaque, fragilidad, tiempo de producción, capacidad
mensual, descripción del proceso, herramientas, técnica, materiales y foto. Los valores
son representativos del oficio, con una pequeña variación por tienda para que las fichas
no salgan clonadas; el artesano los corrige cuando entre.

⚠️ **Los 28 productos de viche van sin material.** El catálogo de materiales no tiene
caña de azúcar; lo más parecido es "caña brava", que es una fibra y sería un dato falso.
Si se añade "Caña de azúcar" al catálogo, estos productos quedan completos.

## Contenido por tienda

- **Marca**: la declarada en el Excel; si falta o es una frase, se deriva del apellido y el municipio. Se garantiza única contra los nombres de tienda existentes.
- **Identidad artesanal**: oficio, técnica, materiales, aprendizaje, estilo y descripción del taller.
- **Tienda**: descripción, historia, claim, `aboutContent` (con `values` en forma `{name, description}`, que es la que el marketplace renderiza).
- **Devoluciones**: el mismo texto en todas, por decisión del convenio.
- **FAQ**: cuatro preguntas con la misma estructura, con respuestas que nombran la marca y su pieza.
- **Logo**: monograma sobre color de una paleta de ocho, distinto por tienda. Es un SVG — el endpoint de subida acepta `image/svg+xml`, así que no hace falta rasterizar.
- **Producto**: una pieza representativa del oficio, con **stock 0**.
