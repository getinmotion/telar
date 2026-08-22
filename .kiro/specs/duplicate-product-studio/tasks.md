# Implementation Plan: Duplicate Product Studio

## Overview

Implementación incremental de la acción "Duplicar" en `ProductStudioPage`. Se construye primero la función pura de mapeo (`buildDuplicatePayload`), luego la orquestación en el hook (`useProductStudio.duplicateProduct` + `duplicatingId`), y finalmente el refactor de la Product_Card y el nuevo Duplicate_Button. Cada capa se valida con tests opcionales (property-based para el mapper, unit + integration para el hook y la card) antes de un checkpoint final de build.

## Tasks

- [x] 1. Implementar mapper puro `buildDuplicatePayload`
  - [x] 1.1 Crear `apps/artisans-web/src/services/duplicateProduct.ts` con la constante `COPY_PREFIX = "Copia de "` y la función `buildDuplicatePayload(product: ProductResponse): CreateProductsNewDto`
    - Emitir siempre `storeId`, `name = COPY_PREFIX + product.name`, `status = 'draft'`
    - Copiar escalares core (`categoryId`, `subcategoryId`, `shortDescription`, `history`, `careNotes`, `usageSuggestions`) preservando `undefined` cuando el source no los tiene
    - Mapear capas 1:1 (`artisanalIdentity`, `physicalSpecs`, `logistics`, `production`) campo por campo según la tabla del design; omitir la clave completa si la capa es `undefined`; omitir `productId` en cada capa
    - Mapear colecciones 1:N (`media`, `materials`, `variants`) preservando longitud y orden; omitir la clave completa si el array es `undefined` o vacío; omitir `id`, `productId`, `sku`, `createdAt`, `updatedAt`, `deletedAt` según corresponda
    - Omitir siempre en la raíz: `productId`, `legacyProductId`, `badges`, `id`, `slug`, `createdAt`, `updatedAt`, `deletedAt` y cualquier campo de moderación
    - No mutar el argumento (transformación pura)
    - Importar tipos desde `services/products-new.types.ts`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15_

  - [ ]\* 1.2 Crear `apps/artisans-web/src/__tests__/duplicateProduct.property.test.ts` con arbitrario `arbProductResponse` (fast-check) y property test para claves prohibidas
    - **Property 1: El DTO no contiene claves prohibidas ni identificadores del original**
    - **Validates: Requirements 3.1, 3.13, 3.14, 3.15**
    - Ejecutar con `fc.assert(..., { numRuns: 100 })`
    - Añadir comentario de trazabilidad: `// Feature: duplicate-product-studio, Property 1`

  - [ ]\* 1.3 Añadir property test para escalares core y reglas de `name`/`status`
    - **Property 2: Los campos escalares del core se copian correctamente y `name`/`status` respetan las reglas de duplicación**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

  - [ ]\* 1.4 Añadir property test para capas 1:1
    - **Property 3: Las capas 1:1 se copian campo a campo y se omiten cuando el source no las tiene**
    - **Validates: Requirements 3.6, 3.7, 3.8, 3.9**

  - [ ]\* 1.5 Añadir property test para colecciones 1:N
    - **Property 4: Las colecciones 1:N preservan longitud, orden y campos declarados**
    - **Validates: Requirements 3.10, 3.11, 3.12**

  - [ ]\* 1.6 Añadir property test de no-mutación (snapshot profundo antes/después)
    - **Property 5: El source no se muta**
    - **Validates: Requirements 3.1-3.15 (invariante transversal)**

- [x] 2. Extender `useProductStudio` con la acción de duplicación
  - [x] 2.1 Modificar `apps/artisans-web/src/hooks/useProductStudio.ts` para añadir `duplicatingId` y `duplicateProduct`
    - Añadir `const [duplicatingId, setDuplicatingId] = useState<string | null>(null)`
    - Implementar `duplicateProduct(product: ProductResponse): Promise<boolean>` con guard `if (duplicatingId) return false`, `setDuplicatingId(product.id)` al inicio y `setDuplicatingId(null)` en `finally`
    - Construir el DTO con `buildDuplicatePayload(product)` y hacer `telarApi.post<ProductResponse>('/products-new', dto)`
    - Tras 2xx, re-leer detalle con `GET /products-new/:id` (fallback a `res.data` si el GET falla) e insertar optimistamente al frente: `setProducts(prev => [created, ...prev])`
    - En éxito: `toast.success("Producto duplicado")`; en error: `toast.error("Error al duplicar producto")` sin mutar `products`
    - No invocar `createProduct` internamente (evita `setSelectedProduct` y toast "Producto creado")
    - Exponer `duplicateProduct` y `duplicatingId` en el return del hook
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]\* 2.2 Añadir unit tests para `duplicateProduct` en `apps/artisans-web/src/__tests__/useProductStudio.duplicate.test.ts` con mock de `telarApi`
    - Caso éxito: inserta al frente de `products`, `toast.success` invocado, `duplicatingId` vuelve a `null`
    - Caso error (POST rechazado): `products` sin cambios, `toast.error` invocado, `duplicatingId` vuelve a `null`
    - Caso doble llamada concurrente: la segunda invocación retorna `false` sin llamar `telarApi.post` de nuevo
    - _Requirements: 4.4, 4.6, 5.4_

- [x] 3. Refactor de la Product_Card y nuevo Duplicate_Button en `ProductStudioPage`
  - [x] 3.1 Refactorizar la Product_Card en `apps/artisans-web/src/pages/admin/ProductStudioPage.tsx` de `<button>` a `<div role="button" tabIndex={0}>`
    - Preservar estilos, key, `className`, y estilos inline actuales
    - Mover el `onClick` existente al `div`; añadir `onKeyDown` que dispare `selectProduct(product.id)` con Enter o Space (usando `e.preventDefault()` para bloquear scroll con Space)
    - Añadir `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#142239]` para accesibilidad de teclado
    - Añadir `group` a la clase raíz para habilitar `group-hover` en el botón hijo
    - No cambiar el markup interno (imagen + contenido)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Añadir el `Duplicate_Button` dentro de la Product_Card en `ProductStudioPage.tsx`
    - Importar `Copy` y `Loader2` de `lucide-react`; consumir `duplicateProduct` y `duplicatingId` de `useProductStudio`
    - Renderizar `<button type="button" aria-label="Duplicar producto">` posicionado `absolute top-2 right-2` con estilos redondeados y `bg-white/90 backdrop-blur-sm`
    - `onClick`: `e.stopPropagation()` + `e.preventDefault()` antes de invocar `duplicateProduct(product)`
    - `disabled={duplicatingId === product.id}`; icono `Loader2` con `animate-spin` cuando duplicando, `Copy` en reposo
    - Texto `"Duplicar"` en `<span className="hidden sm:inline">` para viewport ≥ sm
    - Responsive visibility: `opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 4.1, 5.1, 5.2, 5.5_

  - [ ]\* 3.3 Añadir tests de renderizado y accesibilidad de la card en `apps/artisans-web/src/__tests__/ProductStudioPage.duplicate.test.tsx` con Testing Library
    - **Property 6: Toda tarjeta del listado expone un Duplicate_Button accesible**
    - **Property 7: El click en Duplicate_Button no propaga a la navegación de la Product_Card**
    - **Property 10: El Loading_State es local, exclusivo y reversible**
    - **Validates: Requirements 1.1, 1.8, 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.5**
    - Verificar además que Enter/Space sobre el `div[role="button"]` sí dispara `selectProduct`

  - [ ]\* 3.4 Añadir integration test del flujo éxito con `telarApi` mockeado
    - **Property 8: Éxito de la Duplicate_Action inserta el Duplicated_Product en el listado**
    - **Validates: Requirements 4.1, 4.3, 4.4**

  - [ ]\* 3.5 Añadir integration test del flujo de fallo
    - **Property 9: Fallo de la Duplicate_Action preserva el listado**
    - **Validates: Requirement 4.6**

- [x] 4. Checkpoint final - Verificar build y tipos
  - Ejecutar `npm run build` (o `tsc --noEmit`) en `apps/artisans-web/` y confirmar 0 errores de tipos
  - Ejecutar los tests opcionales que se hayan implementado y asegurar que pasan
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido; las tareas 1.1, 2.1, 3.1 y 3.2 son el core mínimo funcional.
- Cada task referencia sub-requisitos granulares (no solo user stories) para trazabilidad.
- Las property-based tests (1.2-1.6) usan `fast-check` y validan la función pura `buildDuplicatePayload`; los tests de UI (3.3-3.5) usan Testing Library con mocks de `telarApi` y `sonner`.
- La tarea 3.1 (refactor) precede a 3.2 (nuevo botón) porque un `<button>` anidado en otro `<button>` es HTML inválido: el refactor habilita la anidación segura.
- Sin cambios en el backend NestJS ni en tipos compartidos: se reutiliza `POST /products-new` (upsert) y los tipos `ProductResponse` / `CreateProductsNewDto` existentes.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6", "2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "3.5"] }
  ]
}
```
