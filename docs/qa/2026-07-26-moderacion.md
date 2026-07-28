# QA — Moderación (cola de productos) — 2026-07-26

**Rama:** develop (`9eae5a8`) | **Entorno:** local (artisans-web :8080, marketplace-web :8081, API `http://localhost:1010/telar/server`)
**Alcance:** Hito 4.1 — cola de moderación de productos en artisans-web (`/backoffice/moderacion-os`, `/backoffice/studio`) y los endpoints que consume | **Casos:** 19 ejecutados · 4 ✅ · 7 ❌ · 8 ⏸

## Resumen

La capa de datos de la cola de moderación **no pasa**. Se confirmaron tres fallas 🔴 ejecutando la API real: el endpoint que cambia el estado de un producto (`PATCH /products-new/:id/status`) **no exige autenticación alguna**, de modo que cualquiera en la red puede aprobar o rechazar cualquier pieza; el mismo controlador permite **enumerar sin token productos en `draft`/`pending_moderation`/`rejected` junto con datos de contacto y de pagos del artesano**; y el filtro "todos los estados" de la cola devuelve **solo productos aprobados** (449 de 598), ocultando justamente lo que un moderador necesita revisar.

El guard de frontend sí funciona: `/backoffice/moderacion-os`, `/backoffice/studio` y los redirects legacy (`/moderacion`, `/admin/moderation`) llevan correctamente a `/backoffice/login`. Eso mismo dejó **la UI de la cola sin probar**: no había credenciales de moderador y el intento de verificar el guard inyectando un token local fue bloqueado por política del entorno. Todo lo que solo se ve estando dentro (orden, búsqueda, filtros, aprobar/rechazar/solicitar cambios, corrección asistida, historial) quedó ⏸.

Las lecturas de código dejaron además seis riesgos de peso que **no se pudieron reproducir** por ese bloqueo, incluidos dos que valdría la pena atender antes que las 🔴 cosméticas: las ediciones del moderador en "Corrección asistida" se descartan en silencio con toast de éxito, y el score de prioridad sobre el que se supone que ordena la cola **nunca se calcula en ninguna parte del repo**. Están en la sección de sospechas con anclas exactas.

El área no es apta para release mientras `PATCH /products-new/:id/status` siga abierto.

## Incidencias

### QA-MOD-01 — `PATCH /products-new/:id/status` no exige autenticación: cualquiera puede aprobar o rechazar productos 🔴
- **Caso:** nuevo (impacta MOD-06, MOD-07, MOD-08)
- **Precondiciones:** API en `:1010`. Ninguna sesión, ningún token.
- **Pasos:**
  1. `curl -X PATCH http://localhost:1010/telar/server/products-new/11111111-1111-1111-1111-111111111111/status -H "Content-Type: application/json" -d '{"status":"approved"}'`
- **Esperado:** `401 Unauthorized` — cambiar el estado de moderación es la acción privilegiada central del hito.
- **Obtenido:** `404 Not Found` con `{"message":"Product with ID 1111... not found","name":"NotFoundException"}`. El 404 lo lanza `findOne()` **dentro del servicio**: la petición atravesó el router sin guard y llegó a la lógica de negocio. Con un `id` real la escritura se habría ejecutado.
- **Evidencia:** `apps/api/src/resources/products-new/products-new.controller.ts:358` — `@Patch(':id/status')` sin `@UseGuards` ni `@Roles`; la clase (`:31`) tampoco declara guard. En todo el controlador solo las líneas `264` y `388` tienen `@UseGuards(JwtAuthGuard)`. Contrasta con `moderation-queue.controller.ts:27` y `product-moderation-history.controller.ts:34`, que sí exigen `JwtAuthGuard + RolesGuard` (verificado: ambos responden `401` sin token).
- **Causa probable:** `apps/api/src/resources/products-new/products-new.controller.ts:358-364` — el endpoint nació como parte del CRUD de productos y nunca recibió el guard de moderación. Agrava `apps/api/src/resources/products-new/products-new.service.ts:949-953`: `updateStatus` asigna `product.status = status` sin validar el enum, sin validar la legalidad de la transición y sin registrar quién la hizo.
- **Sugerencia:** `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('moderator','admin')` en `:358`, y validar `status` contra `ProductStatus` (`create-products-new.dto.ts:19-26`) dentro de `updateStatus`.
- **Nota:** no se ejecutó la escritura contra un producto real para no alterar datos del entorno. El 404-en-lugar-de-401 prueba la ausencia del guard sin necesidad de mutar.

### QA-MOD-02 — Sin token se pueden enumerar productos no publicados y datos de contacto y pagos del artesano 🔴
- **Caso:** nuevo (relacionado con MOD-12)
- **Precondiciones:** ninguna sesión, ningún token.
- **Pasos:**
  1. `curl "http://localhost:1010/telar/server/products-new?status=draft&limit=3"`
  2. Repetir con `status=pending_moderation` y `status=rejected`.
  3. `curl "http://localhost:1010/telar/server/artisan-shops?limit=100&page=1"`
- **Esperado:** los estados no públicos solo deberían ser legibles por el dueño de la tienda o por un moderador autenticado.
- **Obtenido:** `200` con el payload completo. Conteos accesibles anónimamente: `draft` 63, `pending_moderation` 16, `changes_requested` 52, `rejected` 18. Cada ítem incluye el objeto `artisanShop` entero.
- **Evidencia:** campos reales devueltos para productos en `draft` (sin token): `artisanShop.userId` (`c710fd9e-672d-432f-8834-89cb71caf628`), `artisanShop.contactConfig.email` (`lamarca.maldita@gmail.com`), `contactConfig.whatsapp` (`+573006146672`), `bankDataStatus`, `idContraparty` (`cp_1XLF2WH9cL`, `cp_KLOfmRoZ6R` — identificadores de contraparte del proveedor de pagos), `marketplaceApprovedBy`, `privacyLevel`, `dataClassification`. `GET /artisan-shops?limit=100` también responde `200` sin token y devuelve 806 KB con los mismos campos para 100 de 172 tiendas.
- **Causa probable:** `apps/api/src/resources/products-new/products-new.controller.ts:78-102` — el listado no tiene guard y acepta `status` libre; `products-new.service.ts:1708-1717` solo restringe a `PUBLIC_STATUSES` **cuando el parámetro se omite**, así que basta pasarlo explícitamente para saltarse el filtro. El objeto `artisanShop` se serializa completo, sin DTO de respuesta ni `@Exclude`.
- **Sugerencia:** exigir sesión cuando `status` no esté en `PUBLIC_STATUSES`, y proyectar `artisanShop` a un DTO público (id, nombre, slug, logo, región) en lugar de devolver la entidad.

### QA-MOD-03 — El filtro de estado "todos" muestra solo productos aprobados: se ocultan 149 ítems moderables 🔴
- **Caso:** MOD-03 (variante "todos")
- **Precondiciones:** cola con productos en varios estados.
- **Pasos:**
  1. En la cola, elegir el estado agregado "todos" — el cliente entonces **omite** el parámetro `status` (`moderation.actions.ts:178`: `if (status !== 'all') queryParams.status = status`).
  2. Equivalente ejecutado: `curl "http://localhost:1010/telar/server/products-new?limit=200"`
- **Esperado:** los 598 productos (63 draft + 16 pending + 52 changes_requested + 403 approved + 46 approved_with_edits + 18 rejected).
- **Obtenido:** `total: 449`, y los únicos `status` presentes en la respuesta son `approved` y `approved_with_edits`. Quedan invisibles los 149 productos que un moderador realmente tiene que ver: los 63 borradores, los 16 pendientes, los 52 con cambios solicitados y los 18 rechazados.
- **Evidencia:** `statuses en pagina publica: approved, approved_with_edits | total: 449` contra la suma por estado consultada uno a uno.
- **Causa probable:** colisión de contratos. `apps/api/src/resources/products-new/products-new.service.ts:1712-1717` interpreta "sin `status`" como "listado público" (`PUBLIC_STATUSES`, `:28`), mientras `apps/artisans-web/src/services/moderation.actions.ts:178` usa "sin `status`" para decir "todos". El mismo endpoint sirve al catálogo del comprador y a la cola del moderador, con semánticas opuestas para la ausencia del parámetro.
- **Sugerencia:** parámetro explícito (`status=all`, o `includeNonPublic=true` sujeto a rol) en vez de darle significado a la omisión.

### QA-MOD-04 — El cambio de estado no exige rol pero el historial sí: se puede mover un producto sin dejar rastro de auditoría 🟡
- **Caso:** nuevo (impacta AUDIT-02, MOD-10)
- **Precondiciones:** ninguna sesión.
- **Pasos:**
  1. `curl -X PATCH .../products-new/<id>/status -d '{"status":"approved"}'` → pasa el guard (ver QA-MOD-01).
  2. `curl -X POST .../product-moderation-history -d '{"productId":"1111...","newStatus":"approved"}'` → **401**.
- **Esperado:** o ambas operaciones se permiten al mismo actor y de forma atómica, o ninguna.
- **Obtenido:** el paso 1 no requiere autenticación y el paso 3 exige rol `moderator`/`admin`. Un actor sin rol cambia el estado y no puede (ni quiere) escribir el historial: el producto queda aprobado y la cadena de auditoría no registra nada.
- **Evidencia:** `PATCH .../status` sin token → `404` (llegó al servicio); `POST /product-moderation-history` sin token → `401`.
- **Causa probable:** `apps/artisans-web/src/services/moderation.actions.ts:340-396` — `moderateProduct` encadena status → edits → historial en tres llamadas HTTP **sin transacción**, y el `catch` de `:393-396` solo hace `console.error` y relanza. Si el paso 3 falla, los pasos 1-2 ya se aplicaron y no hay compensación. El historial además toma `moderatorId` del cliente (`:390`) en vez del JWT, así que ni siquiera es un dato confiable cuando sí se escribe.
- **Sugerencia:** mover la orquestación al backend, en un solo endpoint transaccional `POST /products-new/:id/moderate` que escriba estado + historial y tome el moderador del token.

### QA-MOD-05 — Un `status` inexistente devuelve 200 con lista vacía en lugar de error 🟡
- **Caso:** nuevo (borde de MOD-03)
- **Precondiciones:** ninguna.
- **Pasos:** `curl -o /dev/null -w "%{http_code}" "http://localhost:1010/telar/server/products-new?status=basura"`
- **Esperado:** `400 Bad Request` indicando los valores válidos.
- **Obtenido:** `200` con `total: 0`.
- **Evidencia:** `status=basura -> 200`, `total=0`. Comparado con los seis estados válidos, que devuelven 63/16/52/403/46/18.
- **Causa probable:** `apps/api/src/resources/products-new/products-new.controller.ts:78-102` recibe `status` como `@Query` string suelto, sin DTO ni `ValidationPipe`; `products-new.service.ts:1708` lo usa como igualdad directa en el `WHERE`. El enum existe (`create-products-new.dto.ts:19-26`) pero no se aplica aquí.
- **Sugerencia:** DTO de query con `@IsEnum(ProductStatus)` en `status`. Importa porque hoy un typo en un filtro se ve igual que una cola vacía.

### QA-MOD-06 — El panel de moderación descarga ~4,7 MB para pintar contadores 🟡
- **Caso:** nuevo
- **Precondiciones:** ninguna (medido directamente contra la API con los mismos parámetros que emite el cliente).
- **Pasos:**
  1. Para cada uno de los 6 estados: `curl -o /dev/null -w "%{size_download}" ".../products-new?status=<s>&limit=50&page=1"`.
  2. `curl -o /dev/null -w "%{size_download}" ".../artisan-shops?limit=100&page=1"`.
- **Esperado:** unos pocos KB — la pantalla solo muestra números agregados.
- **Obtenido:** 3.074.099 bytes en productos (pending 151 KB, approved 708 KB, approved_with_edits 601 KB, changes_requested 680 KB, rejected 270 KB, draft 663 KB) + 806 KB por página de tiendas × 2 páginas (172 tiendas) ≈ **4,7 MB por carga**.
- **Causa probable:** `apps/artisans-web/src/services/moderation.actions.ts:643-708` — `getModerationStats` pide `limit: 50` de **payload completo** (con `media`, `variants`, `materials`, `artisanShop`) para los 6 estados y luego solo usa `r.data.total` y recuentos; `:673-686` pagina *todas* las tiendas para contar cuántas tienen `idContraparty`. Lo consumen las páginas de entrada del moderador (`BackofficeHomePage.tsx:38`, `BackofficeDashboardPage.tsx:122`, `BackofficeMarketplaceHealthPage.tsx:160`).
- **Sugerencia:** un endpoint de agregados (`GET /products-new/counts`, `GET /artisan-shops/stats`) que devuelva los números ya calculados; entretanto `limit: 1` bastaría para leer `total`.

### QA-MOD-07 — Hay un producto con `name: null` en la cola de pendientes 🟢
- **Caso:** nuevo
- **Precondiciones:** ninguna.
- **Pasos:** `curl ".../products-new?status=pending_moderation&limit=50"` y listar `name`.
- **Esperado:** todo producto enviado a moderación tiene nombre (es obligatorio en el wizard).
- **Obtenido:** entre los 16 pendientes, uno tiene `name: null` (creado `2026-03-19T15:34:23.715Z`). Cae en la primera página de la cola (16 ítems, `pageSize` 20).
- **Evidencia:** salida del listado: `- null | status: pending_moderation | created: 2026-03-19T15:34:23.715Z`.
- **Causa probable:** dato antiguo previo a la validación del wizard, o un `PATCH` que dejó el campo en null — `products-new.service.ts:949-953` y el `PATCH :id` tampoco validan. Se marca 🟢 por sí solo, pero es el insumo del riesgo S-01 más abajo: `ModerationOSPage.tsx:388` mapea `title: p.name` sin fallback y el filtro de búsqueda hace `c.title.toLowerCase()` (`:453`) sin guarda de nulos.
- **Sugerencia:** revisar el dato y añadir fallback (`p.name ?? '(sin nombre)'`) en el mapeo de la tarjeta.

## Sospechas sin reproducir

Todas por el mismo bloqueo: sin credenciales de moderador no se pudo entrar a `/backoffice/moderacion-os`. Las anclas son deterministas en el código; ninguna se observó en el navegador.

| # | Riesgo | Ancla | Por qué no se reprodujo |
|---|--------|-------|-------------------------|
| S-01 | Buscar en la cola de productos lanzaría `TypeError: Cannot read properties of null (reading 'toLowerCase')` y rompería la lista: el filtro hace `c.title.toLowerCase()` sin guarda y hay un pendiente con `name: null` (QA-MOD-07) en la primera página | `apps/artisans-web/src/pages/admin/ModerationOSPage.tsx:453` (filtro) y `:388` (`title: p.name`, sin fallback) | Requiere sesión para renderizar la cola y escribir en el buscador |
| S-02 | Las ediciones del moderador en "Corrección asistida" se descartan en silencio con toast de éxito. La UI ofrece 4 campos editables (`name`, `shortDescription`, `description`, `category`), pero `category` no tiene `case` en el mapeo y cae en el `default`, que solo hace `console.warn`. El producto pasa a `approved_with_edits` y el historial guarda `editsMade` con el cambio **que nunca se persistió** | Campos: `components/moderation/ReviewerWorkspace/modes/CorrectionMode.tsx:20-24`. Descarte: `services/moderation.actions.ts:313-316` (`default`), `:295-311` (`comparePrice`, `images`, `tags`, `sku`, `active`…), `:252-255` (`price`, `inventory`). Historial con el edit fantasma: `:385-392` | Requiere sesión para abrir el workspace y ejecutar "Aprobar con ediciones" — y esa acción escribe en la base, así que no se ejecutaría ni con acceso sin permiso explícito |
| S-03 | El score de prioridad **nunca se calcula**, así que MOD-01 ("ordenados por score de prioridad") y MOD-02 no se cumplen y el orden "Prioridad" del toolbar es un no-op silencioso. `computeAndSaveProductScore`/`computeAndSaveShopScore` no tienen ningún llamador en todo `apps/api/src` (solo sus propias definiciones); ningún cliente hace `POST /moderation-queue/scores`; el `GET` se traga el error y devuelve `null`, dejando `scoresMap` siempre vacío y el comparador en `?? 0` para todos | `apps/api/src/resources/moderation-queue/moderation-queue.service.ts:54` y `:140` (sin llamadores); `services/moderation.actions.ts:583-592` (`catch { return null }`); `ModerationOSPage.tsx:470` (`scoresMap?.[b.id]?.priorityScore ?? 0`) | La ausencia de llamadores está verificada estáticamente; el efecto en el orden de la lista no se observó en el navegador |
| S-04 | Búsqueda y filtros de la cola solo aplican a la página cargada (20 ítems), no al total. `search` **nunca se envía al backend, que sí lo soporta**: se comprobó que `.../products-new?status=pending_moderation&search=Silla` devuelve 3 resultados correctos, pero el cliente solo hace `console.warn('Search filter not yet supported')` y filtra en memoria. Con `changes_requested` (52 ítems) buscar perdería lo de las páginas 2-3 | Cliente descarta los filtros: `services/moderation.actions.ts:182-191`. Filtrado en memoria sobre la página: `ModerationOSPage.tsx:450-471`. Soporte real en backend: `products-new.service.ts:1719-1723` | Requiere sesión para escribir en el buscador y comparar resultados |
| S-05 | La categoría se muestra y se filtra como UUID crudo, no como nombre. `mapProduct` hace `category: p.subcategory ?? ''` y `subcategory` es en realidad `product.categoryId`. El desplegable de categorías (`availableCategories`) se llena con esos UUIDs, y el campo "Categoría" de la corrección asistida es un input de texto libre sobre un UUID | `services/moderation.actions.ts:127` (`subcategory: product.categoryId`); `hooks/useProductModeration.ts:104` (`category: p.subcategory ?? ''`); `ModerationOSPage.tsx:443-446` (opciones del filtro) | Requiere sesión para ver las tarjetas y el desplegable |
| S-06 | Escalada de privilegios entre roles granulares: `canAccess('moderation')` exige uno de `['moderator','admin','super_admin','moderator_product','supervisor','admin_global']`, pero `hasRole('moderator')` devuelve `isModerator`, que es `true` para **cualquier** rol granular. Un `moderator_taxonomy` o un `curator_marketplace` entrarían a la moderación de productos y al reviewer workspace, que el mapa de secciones les niega a propósito. Afecta igual a `revisor`, `analytics`, `envios` y `cms` | `apps/artisans-web/src/hooks/useBackofficeAccess.ts:110-116` (`isModerator` colapsa `GRANULAR_ROLES`), `:123` (`if (role === 'moderator') return isModerator`), `:48-52` (mapa de secciones) | Requiere emitir un token con rol granular. El intento de verificarlo inyectando un JWT sin firma en `localStorage` fue bloqueado por la política del entorno y no se buscó alternativa |
| S-07 | El gating de sección es solo de cliente: `parseJwtPayload` decodifica el JWT **sin verificar la firma** y `useBackofficeAccess` lee los roles de ahí. Cualquiera que edite `localStorage` se pinta la UI de moderación; combinado con QA-MOD-01 y QA-MOD-02 (endpoints sin guard) eso deja de ser solo cosmético, porque la cola cargaría datos reales y las acciones de estado funcionarían | `apps/artisans-web/src/utils/jwt.utils.ts:23-39` (documentado como sin verificar), `hooks/useBackofficeAccess.ts:90-95` | Mismo bloqueo que S-06 |
| S-08 | `ModerationPage.tsx` (485 líneas) no está referenciada por ninguna ruta de `App.tsx`: el único `Moderation*` importado ahí es `TaxonomyModerationPage`. Código muerto que puede divergir de la cola viva y confundir a quien arregle estas incidencias | `apps/artisans-web/src/pages/ModerationPage.tsx` (sin ruta); `apps/artisans-web/src/App.tsx:54-55, 764` | No es un fallo observable en runtime; se deja como riesgo de mantenimiento |

## Casos ejecutados

| ID | Caso | Estado | Nota |
|----|------|--------|------|
| MOD-AUTH-01 | Guard de la ruta de moderación | ✅ | `/backoffice/moderacion-os` sin sesión → redirige a `/backoffice/login`; el formulario renderiza email, contraseña y "Acceder al backoffice". No se intentó autenticar (sin credenciales) |
| — | Redirects legacy `/moderacion` y `/admin/moderation` | ✅ | Ambos llegan a `/backoffice/login` vía `/backoffice/moderacion-os`. Sin errores de consola más allá de warnings de React Router v7 |
| MOD-12 | Producto rechazado no visible en el listado público | ✅ | `GET /products-new` sin `status` devuelve solo `approved` y `approved_with_edits` (449). Los 18 rechazados no aparecen **por esa vía** — pero ver QA-MOD-02: sí son enumerables pasando `status=rejected` sin token |
| — | Filtro por estado válido (los 6 estados) | ✅ | `status=<estado>` devuelve el subconjunto correcto: draft 63, pending_moderation 16, changes_requested 52, approved 403, approved_with_edits 46, rejected 18 |
| MOD-03 | Filtrar por estado "todos" | ❌ | QA-MOD-03 — devuelve solo aprobados (449 en vez de 598) |
| — | Estado inválido en el filtro | ❌ | QA-MOD-05 — `status=basura` → 200 con lista vacía |
| MOD-06 | Aprobar producto (autorización del endpoint) | ❌ | QA-MOD-01 — `PATCH .../status` sin token llega al servicio. La UI del caso quedó ⏸ |
| MOD-07 | Rechazar producto (autorización del endpoint) | ❌ | Mismo endpoint y mismo defecto que MOD-06 |
| MOD-08 | Solicitar cambios (autorización del endpoint) | ❌ | Mismo endpoint y mismo defecto que MOD-06 |
| — | Exposición de datos sin autenticación | ❌ | QA-MOD-02 — productos no publicados + email, WhatsApp, `userId`, `idContraparty`, `bankDataStatus` del artesano |
| — | Consistencia de auditoría status vs. historial | ❌ | QA-MOD-04 — status sin guard, historial con `RolesGuard`, sin transacción |
| — | Peso de la carga del panel | ❌ | QA-MOD-06 — ~4,7 MB medidos |
| — | Integridad de datos de la cola | ❌ | QA-MOD-07 — un pendiente con `name: null` |
| — | Guards de `moderation-queue` y `product-moderation-history` | ✅ | `GET /moderation-queue/scores/:id`, `GET` y `POST /product-moderation-history` responden `401` sin token, como se espera |
| MOD-01 | Ver la cola ordenada por score de prioridad | ⏸ | Sin credenciales. Ver S-03: el score no se calcula en ninguna parte |
| MOD-02 | Score de prioridad correcto | ⏸ | Sin credenciales. Ver S-03 |
| MOD-04 | Filtrar por categoría | ⏸ | Sin credenciales. Ver S-04 y S-05 |
| MOD-05 | Buscar producto en la cola | ⏸ | Sin credenciales. Ver S-01 (posible crash) y S-04 |
| MOD-09 | Aprobar con ediciones | ⏸ | Sin credenciales. Ver S-02 (pérdida silenciosa de ediciones) |
| MOD-10 | Ver historial de moderación del producto | ⏸ | Sin credenciales; `GET /product-moderation-history` exige rol |
| MOD-11 | Producto aprobado visible en marketplace | ⏸ | Requiere aprobar un producto (escritura) — no se ejecutó |
| — | Vista Kanban de la cola | ⏸ | Sin credenciales |
| — | Acciones masivas sobre la cola | ⏸ | Sin credenciales |

Sección 4.2 (moderación de tiendas, MOD-SHOP-01…07): fuera del alcance de esta corrida, ⬜ sin probar.

## Bloqueos

1. **Sin credenciales de moderador.** Es el bloqueo principal: deja ⏸ los 8 casos de UI de la cola (MOD-01, 02, 04, 05, 09, 10, 11, kanban y bulk) y las 8 sospechas S-01…S-08 sin reproducir. Hace falta un usuario con rol `moderator` (y, para S-06, uno con `moderator_taxonomy` o `curator_marketplace`).
2. **Verificación del guard de cliente bloqueada.** Para probar S-06/S-07 sin credenciales se intentó inyectar un JWT sin firma en `localStorage`; la acción fue denegada por la política del entorno y no se buscó forma de sortearla. Se necesita autorización explícita o tokens de prueba.
3. **No se ejecutó ninguna escritura de moderación.** Aprobar, rechazar y solicitar cambios mutan datos reales del entorno compartido y `PATCH .../status` no tiene guard, así que ejecutarlos habría alterado productos. MOD-06/07/08 se validaron solo en su capa de autorización.

### Nota de entorno (no es una incidencia)

**Los puertos estaban invertidos respecto a lo documentado.** `:8080` servía **artisans-web** (`<title>TELAR - Plataforma Digital para Artesanos</title>`) y `:8081` servía **marketplace-web** (`<title>Telar.co / Marketplace de artesanos</title>`), al revés de `.claude/launch.json`, que asigna 8080 a marketplace y 8081 a artisans-web. La causa probable es `autoPort: true` en ambas configuraciones. Síntoma engañoso: `/backoffice/moderacion-os` en `:8081` devuelve el 404 del router de React (`404 Error: User attempted to access non-existent route`) porque marketplace-web no tiene esas rutas — se lee como "la moderación está rota" cuando solo es el app equivocado. La corrida se hizo contra `:8080`.

También conviene saber que los dos apps apuntan a URLs de API distintas: `apps/artisans-web/.env.local` usa `http://192.168.1.24:1010/telar/server` (IP LAN) y `apps/marketplace-web/.env.local` usa `http://localhost:1010/telar/server`. Ambas respondieron `200`, así que no afectó esta corrida, pero la IP LAN es frágil ante cambios de red.
