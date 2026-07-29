# QA — Cola de moderación de productos (artisans-web)

- **Fecha:** 2026-07-26
- **Rama:** `develop` (working tree limpio, HEAD `9eae5a8`)
- **Área:** Backoffice → Lista de aprobación (`/backoffice/moderacion-os`) + servicios y endpoints que la alimentan
- **Entorno:** artisans-web `http://localhost:8080`, marketplace-web `http://localhost:8081`, API `http://localhost:1010/telar/server`

---

## 0. Alcance real de esta corrida (leer antes de las incidencias)

### 0.1 No se pudo ejercitar la UI: no hay credenciales

`/backoffice/moderacion-os` está detrás de `BackofficeProtectedRoute`, que exige sesión con rol de
backoffice leída del JWT en `localStorage`/`authStore`
(`apps/artisans-web/src/components/auth/BackofficeProtectedRoute.tsx:67`,
`apps/artisans-web/src/hooks/useBackofficeAccess.ts:131`). Sin credenciales de prueba la navegación
redirige a `/backoffice/login`, que es lo único que se pudo ver renderizado (login pinta bien, el
guard funciona).

Se intentó sembrar una sesión sintética en `localStorage` para poder renderizar la pantalla; la
acción fue **bloqueada por la política del entorno**, así que no se insistió.

**Consecuencia:** todas las incidencias de abajo están verificadas por (a) lectura de código y
(b) llamadas de solo lectura al API real, **no** por observación en pantalla. Cada incidencia dice
explícitamente cómo se verificó. Ninguna es especulativa sobre el comportamiento del código, pero
sí quedan sin confirmar visualmente y no se pudo medir el impacto real de las acciones de escritura
(aprobar / rechazar / aprobar con ediciones) porque además habría alterado datos de un entorno
compartido con otros agentes.

**Pendiente cuando haya un usuario moderador:** confirmar 1, 2, 3, 4, 5, 6, 8, 9, 10, 11 en pantalla
y ejecutar una aprobación y una aprobación-con-ediciones de punta a punta.

### 0.2 Los puertos del brief estaban invertidos

El brief indicaba artisans-web en `:8081`. En realidad:

| Puerto | App | `<title>` |
|---|---|---|
| 8080 | **artisans-web** | `TELAR - Plataforma Digital para Artesanos` |
| 8081 | marketplace-web | `Telar.co / Marketplace de artesanos` |

Navegar a `http://localhost:8081/backoffice/moderacion-os` da el 404 de marketplace-web, no la cola.

### 0.3 Datos del entorno (verificado por API)

`GET /products-new?status=<X>&limit=1&page=1` → `total`:

| status | total |
|---|---|
| `pending_moderation` | 16 |
| `approved` | 403 |
| `approved_with_edits` | 46 |
| `changes_requested` | 52 |
| `rejected` | 18 |
| `draft` | 63 |

Los contadores de las pestañas (`fetchCounts`) sí devuelven estos números correctamente.

---

## 1. Incidencias

Orden por severidad. Rutas relativas a la raíz del repo.

---

### #1 — CRÍTICO — El artesano nunca recibe el feedback de moderación

**Dónde:** `apps/artisans-web/src/services/productModerationHistory.actions.ts:46-87`,
consumido en `apps/artisans-web/src/pages/InventoryPage.tsx:141`.

Dos fallas independientes, cada una suficiente para romper el flujo:

1. **Desalineación de nomenclatura.** El filtro usa snake_case:

   ```ts
   const relevantRecords = records.filter(
     record => record.new_status === 'rejected' || record.new_status === 'changes_requested'
   );
   ```

   pero la API devuelve camelCase (`newStatus`, `createdAt`, `previousStatus`) — la entidad TypeORM
   declara propiedades camelCase mapeadas a columnas snake_case
   (`apps/api/src/resources/product-moderation-history/entities/*.ts:38` →
   `@Column({ type: 'text', name: 'new_status' })`), y el propio
   `ProductModerationHistoryApi` de `moderation.actions.ts:399-409` lo confirma. `record.new_status`
   es siempre `undefined` → el filtro nunca hace match → `commentsMap` siempre queda vacío.

2. **El endpoint está cerrado al artesano.** `GET /product-moderation-history/product/:productId`
   lleva `@Roles('moderator', 'admin')`
   (`apps/api/src/resources/product-moderation-history/*.controller.ts:82-84`). Un artesano
   consultando su propio inventario recibe 403 en cada llamada; el `.catch(() => ({ records: [] }))`
   de la línea 54 lo silencia.

**Verificación:** lectura de código + `GET /product-moderation-history/product/<id>` sin token →
`401 No autorizado` (confirma que la ruta está protegida).

**Impacto:** cuando un moderador rechaza o pide cambios, el comentario que escribió **no llega
nunca** al artesano en su inventario. El artesano ve el badge de estado pero no el motivo. El ciclo
de moderación no cierra.

---

### #2 — CRÍTICO — Editar la Categoría en modo "Corregir" nunca se guarda, y el campo muestra un UUID

**Dónde:** `apps/artisans-web/src/components/moderation/ReviewerWorkspace/modes/CorrectionMode.tsx:151-157`
+ `apps/artisans-web/src/services/moderation.actions.ts:313-316`.

Cadena completa:

1. El mapper de la cola llena `category` con el **id** de la categoría, no con su nombre:
   `subcategory: product.categoryId` (`moderation.actions.ts:128`) y luego
   `category: p.subcategory ?? ''` (`hooks/useProductModeration.ts:110`).
2. `CorrectionMode` precarga ese valor en un `<Input>` de texto libre etiquetado "Categoría"
   (línea 68: `category: product.category ?? ''`). El moderador ve
   `f7afa80a-f16d-496c-8b85-bd03d692eee1` en una caja de texto.
3. Al confirmar, `editMap.category = '<lo que haya escrito>'` (línea 99).
4. `mapLegacyEditsToProductsNew` **no tiene case para `category`** → cae en el `default:`,
   `console.warn('Campo desconocido en edits, ignorado: category')` y **se descarta**.

**Verificación:** lectura de código; el `categoryId` UUID en el payload está confirmado por API
(ver #4).

**Impacto:** el status sí pasa a `approved_with_edits` y el historial registra la corrección de
categoría en `editsMade`, pero el producto **queda con la categoría vieja**. La auditoría afirma un
cambio que no ocurrió. Es la única corrección estructural que la pantalla ofrece y es la que no
funciona.

---

### #3 — CRÍTICO — "Aprobar con ediciones" descarta precio, stock e imágenes en silencio

**Dónde:** `apps/artisans-web/src/services/moderation.actions.ts:231-321`, `363-373`.

`mapLegacyEditsToProductsNew` descarta con `console.warn`:

- `price`, `inventory` → "Edit de variante ignorado (requiere ID de variante)" (líneas 252-255).
  El bloque que aplicaría el cambio vía `adjustVariantStock` / `updateVariant` está **comentado**
  (líneas 363-373), aunque el código sí resuelve el `variantId` justo antes (líneas 352-360) — es
  decir, hace la petición extra a `/products-new/:id` para nada.
- `comparePrice`, `subcategory`, `images`, `tags`, `techniques`, `sku`, `active`, `featured`,
  `customizable`, `made_to_order`, `lead_time_days`, `production_time`,
  `production_time_hours`, `requires_customization` (líneas 295-311).
- Cualquier campo no listado, incluido `category` (#2) y el `corrections` que
  `ModerationOSPage.tsx:768-770` inyecta en los edits.

Sobreviven solo `name`, `shortDescription`, `description→history`, `weight`, `dimensions`,
`materials`, `categoryId`, `careNotes`.

**Verificación:** lectura de código.

**Impacto:** hoy `CorrectionMode` solo expone 4 campos, así que el daño visible se concentra en #2;
pero cualquier flujo que mande edits de precio/stock/fotos los pierde sin ningún aviso al usuario
(solo `console.warn`), y el historial los guarda como si se hubieran aplicado.

---

### #4 — ALTO — La cola muestra UUIDs donde debería mostrar nombres

**Dónde:** `apps/artisans-web/src/services/moderation.actions.ts:128,131,132`;
`apps/artisans-web/src/hooks/useProductModeration.ts:110,115`.

El payload de `/products-new` **ya trae los nombres** (el service hace
`leftJoinAndSelect('product.category','category')` y `leftJoinAndSelect('materials.material','material')`,
`apps/api/src/resources/products-new/products-new.service.ts:1669,1691`) y el mapper los tira:

- `subcategory: product.categoryId` → descarta `category.name`.
- `materials: product.materials?.map(m => m.materialId)` → descarta `material.name`.
- `techniques: null` fijo, aunque llega `artisanalIdentity.primaryTechnique.name`.

**Verificación (API, `GET /products-new?status=pending_moderation&limit=16`):**

```
SILLA EN MADERA ROBLE
  categoryId=272317c6-7d45-4fa1-9d29-7b6388cc9804   category.name="Muebles"
  materialId=b4c097d5-2f77-44b2-ba0b-6ba4ec7ae984   material.name="Madera De Roble"
  artisanalIdentity.primaryCraft.name="Carpintería artesanal"

ANILLO DE ESMERALDA PARA MUJER
  categoryId=f7afa80a-f16d-496c-8b85-bd03d692eee1   category.name="Joyería y Accesorios"
  materials → "Piedras", "Perlas", "Metales Preciosos"   (se muestran sus 3 UUIDs)
  artisanalIdentity.primaryTechnique.name="Martillado"
```

**Dónde se ve:**
- Pill de categoría en el detalle del producto — `ReviewerWorkspace/WorkspaceLeft.tsx:107-112`.
- Chips de materiales — `WorkspaceLeft.tsx:174-178`.
- **Dropdown "Categoría" del toolbar**: sus opciones se construyen con esos mismos valores
  (`ModerationOSPage.tsx:443-446` → `IntelligentQueue/QueueToolbar.tsx:242`), o sea un menú de
  UUIDs crudos.
- El campo editable de #2.
- La técnica nunca aparece.

**Impacto:** el moderador no puede juzgar ni filtrar por categoría/materiales. Es la incidencia
cosmética más visible y la que más ensucia la pantalla.

---

### #5 — ALTO — El orden "Más antiguo" (el default) no ordena la cola, solo la página

**Dónde:** `apps/artisans-web/src/pages/admin/ModerationOSPage.tsx:244,466-471` vs
`apps/api/src/resources/products-new/products-new.service.ts:1725`.

El backend pagina y ordena `product.createdAt DESC` (y, de paso, aplica el `orderBy` dos veces:
líneas 1725 y 1732). El frontend arranca con `sortBy = 'oldest'` y reordena **solo los 20 registros
ya recibidos**.

**Verificación:** API confirma orden descendente por `createdAt` y `total` > pageSize en varias
pestañas (`changes_requested` 52, `draft` 63, `rejected` 18).

**Impacto:** en una cola de trabajo FIFO, la página 1 con "Más antiguo" trae **los 20 más nuevos**
ordenados ascendentemente. Los ítems realmente más viejos están en la última página. El moderador
que confía en el orden atiende exactamente lo contrario de lo que cree.

---

### #6 — ALTO — Buscador y filtros solo miran la página cargada, y el backend ya soporta la búsqueda

**Dónde:** `apps/artisans-web/src/services/moderation.actions.ts:182-191`;
`ModerationOSPage.tsx:449-472`.

`getModerationQueue` no envía ningún filtro al backend y avisa por consola:

```ts
if (search) console.warn('Search filter not yet supported in products-new');
```

Pero **sí está soportado**: `@Query('search')` en
`apps/api/src/resources/products-new/products-new.controller.ts:85`, aplicado como
`product.name ILIKE :search` en `products-new.service.ts:1719-1723`. El TODO está obsoleto.

`category`, `region` y `onlyNonMarketplace` efectivamente no existen en el backend, y el filtrado
client-side los suple solo dentro de la página.

**Impacto:**
- El placeholder promete "Buscar por nombre, taller, región, SKU…" (`QueueToolbar.tsx:267`) y en
  `approved` (403 productos) o `draft` (63) busca sobre 20.
- El contador del toolbar (`totalItems={filteredAndSortedCards.length}`, `ModerationOSPage.tsx:840`)
  muestra el resultado local y **contradice** el total de la paginación al pie.

---

### #7 — ALTO — El sistema de scores / "Prioridad" está muerto y genera N+1 peticiones por página

**Dónde:** `apps/artisans-web/src/hooks/useQueueScores.ts`,
`apps/artisans-web/src/services/moderation.actions.ts:583-608`,
`apps/api/src/resources/moderation-queue/moderation-queue.service.ts`.

`getQueueScoresBatch` no es batch: hace **un `GET /moderation-queue/scores/:itemId` por ítem**
(20 peticiones por página de cola), y cada fallo se traga con `catch { return null }`.

Y nada escribe esos scores:

- `computeAndSaveProductScore` / `computeAndSaveShopScore` **no tienen ningún llamador** en todo el
  API. `grep -rn "computeAndSaveProductScore|computeAndSaveShopScore|ModerationQueueService"` fuera
  de `resources/moderation-queue/` → 0 resultados. No hay cron, ni hook al crear/moderar producto.
- La única vía de escritura es `POST /moderation-queue/scores` y el frontend solo hace GET
  (`grep "moderation-queue"` en `apps/artisans-web` → una sola línea, la 586, un GET).

**Verificación:** grep en API y frontend; `GET /moderation-queue/scores/<id>` sin token → 401
(protegido con `@Roles('moderator','admin')`).

**Impacto:** `ScoreBadge` nunca se pinta, el sort "Prioridad" del dropdown **no ordena nada**
(todos los scores son `0` por el `?? 0`), y cada carga de cola dispara 20 peticiones inútiles. Toda
la lógica de riesgo/prioridad ya escrita en el service es código muerto.

---

### #8 — MEDIO — El toggle "No marketplace" es un control muerto

**Dónde:** `IntelligentQueue/QueueToolbar.tsx:311-317` vs `ModerationOSPage.tsx:463-465`.

El toggle escribe `filters.nonMarketplaceOnly`, cuenta para el badge "Limpiar (n)"
(`QueueToolbar.tsx:244-247`) y para el reset — pero el pipeline de filtrado solo aplica `region`,
`category` y `hasNoPhotos`. `nonMarketplaceOnly` no se usa en ninguna parte.

**Impacto:** en la sección Tiendas el usuario activa el filtro, ve el pill en verde y la lista no
cambia.

---

### #9 — MEDIO — El botón Actualizar no refresca la vista Kanban

**Dónde:** `ModerationOSPage.tsx:475-509` y `567-579`.

`handleRefresh` en modo kanban solo hace `kanbanLoadedRef.current = false`. El `useEffect` que carga
el kanban depende de `[viewMode, activeSection]`; mutar un ref no provoca render ni re-ejecución del
efecto, así que **no pasa nada**. Hay que cambiar de sección o de vista para forzar la recarga.

---

### #10 — MEDIO — En Tiendas, refrescar o paginar cambia el conjunto de datos

**Dónde:** `ModerationOSPage.tsx:294,329` (`filter: 'not_approved'`) vs `571` y `958`
(`filter: 'all'`).

La carga inicial y el cambio de subsección piden `not_approved`, pero **Actualizar** y
**cambiar de página** piden `all`. Estando en la pestaña "Por aprobar", pulsar refrescar o pasar a la
página 2 mete tiendas ya aprobadas en la lista, sin que la pestaña cambie.

---

### #11 — MEDIO — "Aprobar" promete publicación en marketplace que no siempre ocurre

**Dónde:** `ModerationOSPage.tsx:352-361`.

El toast dice literalmente *"Pieza aprobada y disponible en el marketplace."* Pero un producto solo
es visible si además su tienda tiene `marketplaceApproved = true` (las consultas de marketplace en
`products-new.service.ts:617` filtran por tienda aprobada y publicada).

**Verificación (API):** de los 16 productos en `pending_moderation`, **9 pertenecen a tiendas con
`marketplaceApproved = false`** (MADERAS SILVEIRA V23, Prueba prueba, L'Atelier ×3,
Arte amero y semillas, Somos Kankuamos Unidos, TIENA DE COTORROS ×2).

**Impacto:** el moderador aprueba, recibe confirmación de publicación, y la pieza no aparece nunca.
La card no muestra ninguna señal de que la tienda no está aprobada (`marketplace_approved` sí se
mapea, pero `QueueCard` no lo usa).

---

### #12 — MEDIO — Moderación no transaccional: estado cambiado + mensaje de error + sin auditoría

**Dónde:** `apps/artisans-web/src/services/moderation.actions.ts:340-396`;
`hooks/useProductModeration.ts:222-239`.

`moderateProduct` hace tres escrituras secuenciales sin transacción ni compensación:

1. `PATCH /products-new/:id/status`
2. `PATCH /products-new/:id` (edits)
3. `POST /product-moderation-history`

Si falla (2) o (3), el status **ya cambió** pero el hook captura el throw, muestra
`toast.error('Error al moderar el producto')` y no saca la card de la lista.

**Impacto:** el moderador cree que la acción no se aplicó y reintenta, generando historial duplicado
sobre un producto ya moderado — o, si el fallo es en (3), un cambio de estado **sin ningún registro
de auditoría**, que es justo lo que el historial debería garantizar.

---

### #13 — MEDIO — Historial de moderación incompleto por construcción

**Dónde:** `ModerationOSPage.tsx:354`; `moderation.actions.ts:420-430`.

- La aprobación rápida llama
  `moderateProduct(id, 'approve', undefined, undefined, user?.id)` — omite el 6.º argumento
  `previousStatus` → el registro queda con `previousStatus: null`.
- `artisanId` **nunca** se envía en ningún camino, aunque el DTO lo acepta
  (`create-product-moderation-history.dto.ts`) y existe el endpoint
  `GET /product-moderation-history/artisan/:artisanId` → siempre devolverá vacío.

**Impacto:** no se puede reconstruir la transición de estados ni consultar el historial por artesano.

---

### #14 — MEDIO (seguridad) — El cambio de estado de moderación no tiene guard ni validación

**Dónde:** `apps/api/src/resources/products-new/products-new.controller.ts:356-362` y
`products-new.service.ts:949-953`.

```ts
@Patch(':id/status')
updateStatus(@Param('id') id: string, @Body('status') status: string) {
  return this.productsNewService.updateStatus(id, status);
}
```

Sin `@UseGuards(JwtAuthGuard)`, sin `@Roles(...)`, sin DTO y sin enum — mientras
`/moderation-queue` y `/product-moderation-history` sí exigen rol moderator/admin. El service hace
`product.status = status; save()` con cualquier string.

**Verificación:** los GET de `/products-new` responden 200 sin token, mientras
`/moderation-queue/scores/:id` y `/product-moderation-history/...` responden 401 → el módulo
`products-new` está abierto. `GET /products-new?status=bogus_status` → 200 `total: 0`, sin
validación de valores.

**Impacto:** cualquiera con acceso de red al API puede aprobar o rechazar cualquier producto sin
autenticarse y sin dejar rastro en el historial, y puede dejar el producto en un status inventado
que ninguna pestaña de la cola mostrará. Nota: `docs/environments.md` debería confirmar si el API
está expuesto más allá de localhost en dev.

---

### #15 — BAJO — Precio / stock / SKU pueden venir de una variante inactiva o borrada

**Dónde:** `products-new.service.ts:1691` vs `836-839`; `moderation.actions.ts:109-133`.

`findWithPagination` hace `leftJoinAndSelect('product.variants', 'variants')` **sin** el filtro
`variants.isActive = true AND variants.deletedAt IS NULL` que sí aplican las otras consultas del
mismo service. El mapper toma `variants[0]` para precio, stock y SKU.

**Verificación (API):** 3 de 16 pendientes tienen `variants[0].isActive = false`
(Ramo de rosas, Mesa de Juego Artesanal Hexagonal, Silla Mecedora Artesanal). Otros 2
(`test`, `test update`) no tienen variantes → el mapper reporta precio 0 y stock 0.

---

### #16 — BAJO — `active` mal derivado para `approved_with_edits`

`active: product.status === 'approved'` (`moderation.actions.ts:136`) marca como inactivos los
productos `approved_with_edits`, que sí son públicos: `PUBLIC_STATUSES = ['approved',
'approved_with_edits']` (`products-new.service.ts:28`). Son 46 productos en este entorno.

---

### #17 — BAJO — `useQueueScores` muta un array memoizado durante el render

`queryKey: ['queue-scores', ...itemIds.sort()]` (`hooks/useQueueScores.ts:6`). `Array.prototype.sort`
ordena in-place el array que llega desde el `useMemo` de `ModerationOSPage.tsx:284-286`.

---

### #18 — BAJO — Pestañas de la cola: "Incompletos" son borradores y `approved_with_edits` no tiene pestaña

**Dónde:** `ModerationOSPage.tsx:41-47`, `727-731`.

- "Incompletos" → status `draft`: **63 productos** que son borradores del wizard que el artesano
  todavía no envió. Mezclarlos en la lista de aprobación infla la cola con trabajo que no es del
  moderador.
- Es la única subpestaña **sin badge de conteo** (se llama `<SubTab>` sin prop `count`).
- `recently_edited → approved_with_edits` está en el mapa pero **no existe pestaña** para él: los 46
  productos aprobados-con-ediciones solo son visibles en la vista Kanban.

---

### #19 — BAJO — El badge del módulo "Productos" infla la carga pendiente

`totalProductPending = pending_moderation + changes_requested + rejected`
(`ModerationOSPage.tsx:562`) incluye `rejected`, que es un estado terminal. Con los datos actuales
el módulo mostraría **86** cuando lo realmente pendiente de decisión son **16**.

---

### #20 — COSMÉTICO — Typo en el módulo Tiendas

`sublabel="Talleres y artisanos"` (`ModerationOSPage.tsx:684`) → "artesanos".

---

## 2. Lo que sí se verificó como correcto

- El guard del backoffice funciona: sin sesión, `/backoffice/moderacion-os` redirige a
  `/backoffice/login`, que renderiza bien.
- Los contadores de las pestañas (`fetchCounts`) devuelven los totales correctos por status
  (cotejados uno a uno contra el API).
- `PUBLIC_STATUSES` incluye `approved_with_edits`, así que aprobar con ediciones **sí** publica
  (el problema es #16, la derivación de `active` en el frontend, no la publicación).
- El mapeo camelCase→snake_case de `mapProduct` / `mapHistory` en `useProductModeration.ts` es
  correcto para todos los campos salvo los señalados en #4 y #16. El bug de nomenclatura está en
  `productModerationHistory.actions.ts` (#1), que es un servicio distinto y paralelo.
- Filtro `status` del backend: aplica correctamente `product.status = :status`.

---

## 3. Sugerencia de orden de arreglo

1. **#1** — el artesano no recibe feedback: rompe el ciclo completo de moderación (y son dos fixes
   pequeños: casing + política del endpoint).
2. **#14** — endpoint de cambio de estado sin autenticación.
3. **#2 / #3** — las ediciones del moderador se descartan en silencio y la auditoría miente.
4. **#4** — UUIDs en pantalla; el fix es una línea del mapper por campo, los nombres ya llegan.
5. **#5 / #6** — orden y búsqueda: mover el filtrado y el orden al backend (el `search` ya existe).
6. **#7** — decidir: poblar los scores (llamar a `computeAndSaveProductScore` al crear/moderar) o
   quitar el sort "Prioridad", `ScoreBadge` y las 20 peticiones por página.
7. Resto por severidad.
