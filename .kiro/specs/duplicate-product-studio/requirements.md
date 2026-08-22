# Requirements Document

## Introduction

Esta funcionalidad permite al usuario del Product Studio duplicar un producto existente directamente desde la tarjeta del listado en `ProductStudioPage`, sin abrir el wizard. La duplicación es silenciosa: crea inmediatamente una copia en estado `draft` con nombre prefijado "Copia de", conservando todos los datos artesanales y comerciales del original (descripciones, precios, stock, categorías, taxonomía, medios, materiales, técnicas, dimensiones, variantes) pero descartando identificadores únicos (id, slug), estado de moderación y timestamps. Tras la duplicación exitosa el listado se refresca y se muestra una notificación. El botón "Duplicar" es responsive: solo icono en mobile (siempre visible), icono más texto en desktop (visible en hover sobre la tarjeta).

## Glossary

- **Product_Studio**: Página `ProductStudioPage` del portal de artesanos donde se listan y gestionan los productos de una tienda seleccionada.
- **Product_Card**: Tarjeta visual dentro del grid de productos en el Product Studio; representa un producto y permite navegar a su ficha al hacer click.
- **Duplicate_Button**: Nuevo control (icono `Copy` de lucide-react) ubicado dentro de la Product_Card, que dispara la duplicación del producto.
- **Duplicate_Action**: Operación completa de duplicar un producto: mapeo del producto original a un `CreateProductsNewDto`, envío del `POST /products-new`, refresh del listado y notificación.
- **Duplicated_Product**: Producto nuevo creado por la Duplicate_Action; es una copia del original en estado `draft` con `id` y `slug` nuevos asignados por el backend.
- **Source_Product**: Producto original desde el que se dispara la duplicación.
- **Products_API**: Recurso backend NestJS `products-new` expuesto en `POST /telar/server/products-new` (upsert) y `GET /telar/server/products-new/store/:storeId`.
- **Product_Studio_Hook**: Hook `useProductStudio` que expone `createProduct(dto)`, `products`, `loadingProducts` y `selectShop(shop)` para refrescar el listado.
- **Loading_State**: Estado por producto que indica que la Duplicate_Action está en curso para ese Source_Product específico.
- **Copy_Prefix**: Prefijo literal "Copia de " que se antepone al `name` del Source_Product al construir el nombre del Duplicated_Product.
- **Draft_Status**: Valor `'draft'` del enum `ProductStatus` que representa un producto en borrador, no enviado a moderación.
- **Mobile_Viewport**: Ancho de ventana inferior al breakpoint `sm` de Tailwind (menos de 640px).
- **Desktop_Viewport**: Ancho de ventana igual o superior al breakpoint `sm` de Tailwind (640px o más).
- **Toast**: Notificación efímera renderizada por la librería `sonner`.

## Requirements

### Requirement 1: Visibilidad del botón Duplicar en la tarjeta

**User Story:** Como usuario del Product Studio, quiero ver un botón "Duplicar" en cada tarjeta del listado de productos, para poder duplicar rápidamente cualquier producto sin abrir su ficha.

#### Acceptance Criteria

1. THE Product_Studio SHALL renderizar un Duplicate_Button dentro de cada Product_Card del grid de productos.
2. THE Duplicate_Button SHALL usar el icono `Copy` de la librería `lucide-react`.
3. WHILE el viewport es Mobile_Viewport, THE Duplicate_Button SHALL mostrar únicamente el icono `Copy` sin texto acompañante.
4. WHILE el viewport es Desktop_Viewport, THE Duplicate_Button SHALL mostrar el icono `Copy` seguido de la etiqueta textual "Duplicar".
5. WHILE el viewport es Mobile_Viewport, THE Duplicate_Button SHALL ser visible de forma permanente en la Product_Card.
6. WHILE el viewport es Desktop_Viewport y el cursor no está sobre la Product_Card, THE Duplicate_Button SHALL estar oculto visualmente.
7. WHILE el viewport es Desktop_Viewport y el cursor está sobre la Product_Card, THE Duplicate_Button SHALL ser visible.
8. THE Duplicate_Button SHALL exponer un `aria-label` con valor "Duplicar producto" para lectores de pantalla en todo viewport.

### Requirement 2: Aislamiento del click respecto a la navegación de la tarjeta

**User Story:** Como usuario del Product Studio, quiero que al hacer click en "Duplicar" no se abra la ficha del producto, para que la duplicación ocurra sin cambio de vista.

#### Acceptance Criteria

1. WHEN el usuario hace click en el Duplicate_Button, THE Product_Studio SHALL detener la propagación del evento hacia la Product_Card contenedora.
2. WHEN el usuario hace click en el Duplicate_Button, THE Product_Studio SHALL prevenir la ejecución del handler que abre la ficha del Source_Product.
3. WHEN el usuario hace click en el Duplicate_Button, THE Product_Studio SHALL permanecer en la vista de listado sin navegar al detalle del producto.

### Requirement 3: Mapeo del producto original al DTO de creación

**User Story:** Como usuario del Product Studio, quiero que la copia conserve todos los datos artesanales, comerciales y logísticos del producto original, para no perder trabajo previo al iterar sobre un producto existente.

#### Acceptance Criteria

1. WHEN se dispara la Duplicate_Action sobre un Source_Product, THE Product_Studio SHALL construir un `CreateProductsNewDto` sin la propiedad `productId`.
2. WHEN se dispara la Duplicate_Action, THE Product_Studio SHALL asignar al campo `name` del DTO el valor del `name` del Source_Product antepuesto por el Copy_Prefix "Copia de ".
3. WHEN se dispara la Duplicate_Action, THE Product_Studio SHALL asignar al campo `status` del DTO el valor `'draft'` (Draft_Status).
4. WHEN se dispara la Duplicate_Action, THE Product_Studio SHALL asignar al campo `storeId` del DTO el `storeId` del Source_Product.
5. WHEN se dispara la Duplicate_Action, THE Product_Studio SHALL copiar los campos `categoryId`, `subcategoryId`, `shortDescription`, `history`, `careNotes` y `usageSuggestions` del Source_Product al DTO cuando estén presentes en el Source_Product.
6. WHEN se dispara la Duplicate_Action y el Source_Product tiene `artisanalIdentity`, THE Product_Studio SHALL copiar los campos `primaryCraftId`, `primaryTechniqueId`, `secondaryTechniqueId`, `curatorialCategoryId`, `pieceType`, `style`, `styles`, `isCollaboration`, `collaborationName`, `processType` y `estimatedElaborationTime` al DTO.
7. WHEN se dispara la Duplicate_Action y el Source_Product tiene `physicalSpecs`, THE Product_Studio SHALL copiar los campos `heightCm`, `widthCm`, `lengthOrDiameterCm` y `realWeightKg` al DTO.
8. WHEN se dispara la Duplicate_Action y el Source_Product tiene `logistics`, THE Product_Studio SHALL copiar los campos `packagingType`, `packHeightCm`, `packWidthCm`, `packLengthCm`, `packWeightKg`, `fragility`, `requiresAssembly` y `specialProtectionNotes` al DTO.
9. WHEN se dispara la Duplicate_Action y el Source_Product tiene `production`, THE Product_Studio SHALL copiar los campos `availabilityType`, `productionTimeDays`, `monthlyCapacity`, `requirementsToStart`, `processDescription`, `processEvidenceUrls` y `tools` al DTO.
10. WHEN se dispara la Duplicate_Action y el Source_Product tiene `media`, THE Product_Studio SHALL copiar cada entrada preservando `mediaUrl`, `mediaType`, `isPrimary` y `displayOrder`, y SHALL omitir los campos `id`, `productId`, `createdAt` y `updatedAt` de cada media.
11. WHEN se dispara la Duplicate_Action y el Source_Product tiene `materials`, THE Product_Studio SHALL copiar cada material preservando `materialId`, `isPrimary` y `materialOrigin`.
12. WHEN se dispara la Duplicate_Action y el Source_Product tiene `variants`, THE Product_Studio SHALL copiar cada variante preservando `variantName`, `optionValues`, `minStock`, `imageUrl`, `stockQuantity`, `basePriceMinor`, `currency`, `realWeightKg`, `dimHeightCm`, `dimWidthCm`, `dimLengthCm`, `packHeightCm`, `packWidthCm`, `packLengthCm`, `packWeightKg` e `isActive`, y SHALL omitir los campos `id` y `sku` de cada variante.
13. WHEN se dispara la Duplicate_Action, THE Product_Studio SHALL omitir del DTO cualquier campo de moderación del Source_Product (comentarios, historial, decisiones).
14. WHEN se dispara la Duplicate_Action, THE Product_Studio SHALL omitir del DTO los campos `id`, `createdAt`, `updatedAt`, `deletedAt` y `legacyProductId` del Source_Product.
15. WHEN se dispara la Duplicate_Action, THE Product_Studio SHALL omitir del DTO cualquier campo de `badges` (insignias) del Source_Product.

### Requirement 4: Envío al backend y creación del producto duplicado

**User Story:** Como usuario del Product Studio, quiero que al pulsar "Duplicar" se cree inmediatamente un producto nuevo en el backend, para no tener que rellenar el formulario de creación.

#### Acceptance Criteria

1. WHEN el usuario hace click en el Duplicate_Button de un Source_Product, THE Product_Studio SHALL invocar `POST /telar/server/products-new` con el `CreateProductsNewDto` construido según el Requirement 3.
2. WHEN el backend responde con éxito, THE Products_API SHALL devolver un Duplicated_Product con `id` nuevo, `slug` nuevo generado por el backend y `status` igual a `'draft'`.
3. WHEN la creación en backend resulta exitosa, THE Product_Studio SHALL refrescar el listado de productos de la tienda seleccionada de modo que el Duplicated_Product aparezca en el listado.
4. WHEN la creación en backend resulta exitosa, THE Product_Studio SHALL mostrar un Toast de tipo success con el mensaje "Producto duplicado".
5. WHEN la creación en backend resulta exitosa, THE Product_Studio SHALL permanecer en la vista de listado sin abrir el wizard ni la ficha del Duplicated_Product.
6. IF el backend responde con un error o la petición falla por cualquier motivo, THEN THE Product_Studio SHALL mostrar un Toast de tipo error con el mensaje "Error al duplicar producto" y SHALL dejar el listado en el estado previo a la Duplicate_Action.

### Requirement 5: Estado de carga por producto y prevención de doble duplicación

**User Story:** Como usuario del Product Studio, quiero recibir feedback visual y no poder duplicar dos veces el mismo producto por error mientras la duplicación está en curso.

#### Acceptance Criteria

1. WHILE la Duplicate_Action está en curso para un Source_Product, THE Duplicate_Button de ese Source_Product SHALL mostrar un indicador de carga (spinner) en lugar del icono `Copy`.
2. WHILE la Duplicate_Action está en curso para un Source_Product, THE Duplicate_Button de ese Source_Product SHALL estar deshabilitado.
3. WHILE la Duplicate_Action está en curso para un Source_Product, THE Product_Studio SHALL mantener habilitados los Duplicate_Button de los demás productos del listado.
4. IF el usuario hace click en un Duplicate_Button deshabilitado, THEN THE Product_Studio SHALL ignorar el click sin iniciar una nueva Duplicate_Action.
5. WHEN la Duplicate_Action termina (éxito o error), THE Duplicate_Button del Source_Product correspondiente SHALL volver al estado habilitado con el icono `Copy`.
