# Products New Resource

Resource de NestJS para gestionar productos con arquitectura **multicapa** (`shop.products_core` + capas especializadas).

## Arquitectura Multicapa

### ¿Por qué Multicapa?

El nuevo sistema de productos reemplaza la tabla monolítica `shop.products` (~30 columnas con JSONB) por una **estructura normalizada por capas** que separa responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                    products_core                            │
│              (Datos esenciales e inmutables)                │
└────────────┬────────────────────────────────────────────────┘
             │
   ┌─────────┼──────────┬──────────────┬────────────┐
   │         │          │              │            │
┌──▼───┐ ┌──▼───┐ ┌────▼────┐ ┌───────▼──┐ ┌──────▼─────┐
│Artes.│ │Físico│ │Logística│ │Producción│ │   Media    │
│Identi│ │Specs │ │         │ │          │ │ (imágenes) │
└──────┘ └──────┘ └─────────┘ └──────────┘ └────────────┘
   1:1      1:1        1:1         1:1          1:N

   ┌──────────────┬────────────────┬──────────────┐
   │              │                │              │
┌──▼────┐  ┌─────▼──────┐  ┌──────▼───────┐
│Badges │  │  Materials │  │   Variants   │
│(N:M)  │  │   (N:M)    │  │    (1:N)     │
└───────┘  └────────────┘  └──────────────┘
```

### Beneficios

✅ **Integridad Referencial**: Relaciones FK con taxonomías curadas (crafts, techniques, materials)
✅ **Consultas Eficientes**: Índices específicos por capa, sin escanear tabla monolítica
✅ **Flexibilidad**: Agregar nuevas capas sin modificar `products_core`
✅ **Precios Precisos**: Minor units (centavos) como BIGINT
✅ **Soft Delete**: Recuperación de datos con `deleted_at`

---

## ⚠️ Relación con Stores vs Artisan Shops

**IMPORTANTE**: Los productos en `products_core` están vinculados con `shop.artisan_shops` (tabla legacy), **NO** con la nueva tabla `shop.stores`.

### ¿Por qué?

- `shop.artisan_shops` es la tabla **legacy** que contiene todos los datos históricos de las tiendas artesanales
- `shop.stores` es la **nueva tabla** que eventualmente reemplazará a artisan_shops
- Durante la migración, los productos siguen apuntando a `artisan_shops` para mantener compatibilidad
- El campo `store_id` en `products_core` es un FK a `artisan_shops.id`

### Diagrama de Relaciones

```
┌──────────────────┐
│ artisan_shops    │  ← Tabla LEGACY (datos históricos)
│ (legacy)         │
└────────┬─────────┘
         │
         │ FK: store_id
         │
┌────────▼─────────┐
│ products_core    │
│                  │
└──────────────────┘

┌──────────────────┐
│ stores           │  ← Tabla NUEVA (sistema multicapa)
│ (nueva)          │     Los productos aún NO apuntan aquí
└──────────────────┘
```

---

## Tablas Involucradas

### 1. Tabla Núcleo

#### `shop.products_core`
Contiene solo información **esencial e inmutable** del producto.

**Campos:**
- `id` - UUID del producto
- `store_id` - **ID del artisan_shop** (FK a `shop.artisan_shops`, tabla legacy - no confundir con `shop.stores`)
- `category_id` - Categoría (FK a `taxonomy.categories`)
- `legacy_product_id` - ID del producto en tabla legacy `shop.products`
- `name` - Nombre del producto
- `short_description` - Descripción corta
- `history` - Historia del producto
- `care_notes` - Notas de cuidado
- `status` - Estado: `'draft'`, `'published'`, `'archived'`
- `created_at`, `updated_at`, `deleted_at`

> ⚠️ **IMPORTANTE**: `store_id` apunta a `shop.artisan_shops` (tabla legacy), no a la nueva tabla `shop.stores`. Los productos están vinculados directamente con artisan_shops.

### 2. Capas Especializadas (1:1)

#### `shop.product_artisanal_identity`
Identidad artesanal del producto.
- `primary_craft_id` - Oficio principal (FK a `taxonomy.crafts`)
- `primary_technique_id` - Técnica principal (FK a `taxonomy.techniques`)
- `secondary_technique_id` - Técnica secundaria
- `curatorial_category_id` - Categoría curatorial
- `piece_type` - Tipo: `'funcional'`, `'decorativa'`, `'mixta'`
- `style` - Estilo: `'tradicional'`, `'contemporaneo'`, `'fusion'`
- `is_collaboration` - Si es colaboración
- `process_type` - Proceso: `'manual'`, `'mixto'`, `'asistido'`
- `estimated_elaboration_time` - Tiempo estimado

#### `shop.product_physical_specs`
Especificaciones físicas.
- `height_cm`, `width_cm`, `length_or_diameter_cm`, `real_weight_kg`

#### `shop.product_logistics`
Información logística.
- `packaging_type` - Tipo de empaque
- `pack_height_cm`, `pack_width_cm`, `pack_length_cm`, `pack_weight_kg`
- `fragility` - Fragilidad: `'bajo'`, `'medio'`, `'alto'`
- `requires_assembly` - Requiere ensamblaje
- `special_protection_notes` - Notas especiales

#### `shop.product_production`
Información de producción.
- `availability_type` - Disponibilidad: `'en_stock'`, `'bajo_pedido'`, `'edicion_limitada'`
- `production_time_days` - Tiempo de producción en días
- `monthly_capacity` - Capacidad mensual
- `requirements_to_start` - Requisitos para iniciar

### 3. Relaciones (1:N y N:M)

#### `shop.product_media` (1:N)
Imágenes y videos del producto.
- `media_url` - URL del recurso
- `media_type` - Tipo: `'image'`, `'video'`
- `is_primary` - Si es imagen principal
- `display_order` - Orden de visualización

#### `shop.product_badges` (N:M)
Badges asignados al producto.
- `badge_id` - FK a `taxonomy.badges`
- `awarded_at` - Fecha de asignación
- `awarded_by` - Quien lo asignó
- `valid_until` - Fecha de expiración

#### `shop.product_materials_link` (N:M)
Materiales del producto.
- `material_id` - FK a `taxonomy.materials`
- `is_primary` - Si es material primario
- `material_origin` - Origen geográfico

#### `shop.product_variants` (1:N)
Variantes del producto (SKUs).
- `sku` - SKU único
- `stock_quantity` - Stock disponible
- `base_price_minor` - Precio en centavos (BIGINT)
- `currency` - Moneda (ej: 'COP')
- Dimensiones propias (opcionales): `dim_height_cm`, `dim_width_cm`, etc.

---

## Endpoints Disponibles

### GET /products-new
Obtiene todos los productos con sus capas y relaciones.

**Query params opcionales:**
- `page` - Número de página (default: 1)
- `limit` - Registros por página (default: 20)
- `storeId` - Filtrar por tienda
- `categoryId` - Filtrar por categoría
- `status` - Filtrar por status

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid-producto",
      "storeId": "uuid-artisan-shop",
      "categoryId": "uuid-categoria",
      "legacyProductId": "uuid-producto-legacy",
      "name": "Mochila Wayuu",
      "shortDescription": "Mochila tejida a mano...",
      "status": "published",
      "artisanShop": {
        "id": "uuid-artisan-shop",
        "name": "Taller Wayuu",
        "artisan_fullname": "María López"
      },
      "artisanalIdentity": {
        "primaryCraftId": "uuid-craft",
        "primaryTechniqueId": "uuid-technique",
        "pieceType": "funcional",
        "style": "tradicional",
        "processType": "manual"
      },
      "physicalSpecs": {
        "heightCm": 30,
        "widthCm": 25,
        "realWeightKg": 0.5
      },
      "logistics": {
        "packagingType": "Caja de cartón",
        "fragility": "medio"
      },
      "production": {
        "availabilityType": "en_stock",
        "productionTimeDays": 15
      },
      "media": [
        {
          "mediaUrl": "https://...",
          "mediaType": "image",
          "isPrimary": true,
          "displayOrder": 0
        }
      ],
      "badges": [...],
      "materials": [
        {
          "materialId": "uuid-material",
          "isPrimary": true,
          "materialOrigin": "La Guajira"
        }
      ],
      "variants": [
        {
          "sku": "MOCHILA-WAYUU-001",
          "stockQuantity": 10,
          "basePriceMinor": 15000000,
          "currency": "COP"
        }
      ]
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### GET /products-new/:id
Obtiene un producto específico con todas sus capas y relaciones.

**Ejemplo:**
```bash
GET /products-new/550e8400-e29b-41d4-a716-446655440000
```

### GET /products-new/store/:storeId
Obtiene todos los productos de un artisan_shop específico.

> **Nota**: A pesar del nombre del endpoint `/store`, este parámetro espera el ID de un `artisan_shop` (tabla legacy), no de la nueva tabla `stores`.

**Ejemplo:**
```bash
GET /products-new/store/550e8400-e29b-41d4-a716-446655440000
```

### GET /products-new/category/:categoryId
Obtiene todos los productos de una categoría específica.

**Ejemplo:**
```bash
GET /products-new/category/550e8400-e29b-41d4-a716-446655440000
```

### GET /products-new/status/:status
Obtiene productos por status.

**Ejemplo:**
```bash
GET /products-new/status/published
```

### POST /products-new
Crea un nuevo producto.

**Body:**
```json
{
  "storeId": "uuid-tienda",
  "categoryId": "uuid-categoria",
  "name": "Nuevo Producto",
  "shortDescription": "Descripción...",
  "status": "draft"
}
```

### PATCH /products-new/:id
Actualiza un producto existente.

### PATCH /products-new/:id/status
Cambia el status de un producto.

**Body:**
```json
{
  "status": "published"
}
```

### DELETE /products-new/:id
Soft delete de un producto (marca `deleted_at`).

---

## Uso en el Código

### Inyectar el servicio

```typescript
import { ProductsNewService } from './resources/products-new/products-new.service';

constructor(private readonly productsNewService: ProductsNewService) {}
```

### Obtener producto con todas las capas

```typescript
const product = await this.productsNewService.findOne(productId);

// Acceder a datos del núcleo
console.log(product.name);
console.log(product.status);

// Acceder a artisan shop (tabla legacy)
if (product.artisanShop) {
  console.log(`Tienda: ${product.artisanShop.name}`);
  console.log(`Artesano: ${product.artisanShop.artisan_fullname}`);
}

// Acceder a identidad artesanal
if (product.artisanalIdentity) {
  console.log(product.artisanalIdentity.primaryCraftId);
  console.log(product.artisanalIdentity.style);
}

// Acceder a especificaciones físicas
if (product.physicalSpecs) {
  console.log(product.physicalSpecs.heightCm);
  console.log(product.physicalSpecs.realWeightKg);
}

// Acceder a media (imágenes)
product.media?.forEach((media) => {
  if (media.isPrimary) {
    console.log(`Imagen principal: ${media.mediaUrl}`);
  }
});

// Acceder a variantes
product.variants?.forEach((variant) => {
  console.log(`SKU: ${variant.sku}`);
  console.log(`Precio: ${variant.basePriceMinor / 100} ${variant.currency}`);
  console.log(`Stock: ${variant.stockQuantity}`);
});
```

### Buscar por tienda

```typescript
const products = await this.productsNewService.findByStoreId(storeId);
console.log(`${products.length} productos encontrados`);
```

### Buscar con paginación y filtros

```typescript
const result = await this.productsNewService.findWithPagination(1, 20, {
  storeId: 'uuid-tienda',
  status: 'published',
});

console.log(`Página ${result.page} de ${result.totalPages}`);
console.log(`Total: ${result.total} productos`);
result.data.forEach((product) => {
  console.log(product.name);
});
```

---

## Estructura de Archivos

```
src/resources/products-new/
├── entities/
│   ├── product-core.entity.ts                    # Núcleo
│   ├── product-artisanal-identity.entity.ts      # Capa artesanal
│   ├── product-physical-specs.entity.ts          # Capa física
│   ├── product-logistics.entity.ts               # Capa logística
│   ├── product-production.entity.ts              # Capa producción
│   ├── product-media.entity.ts                   # Media (1:N)
│   ├── product-badge.entity.ts                   # Badges (N:M)
│   ├── product-material-link.entity.ts           # Materials (N:M)
│   ├── product-variant.entity.ts                 # Variantes (1:N)
│   └── index.ts                                  # Exports
├── dto/
│   ├── create-products-new.dto.ts                # DTO creación
│   └── update-products-new.dto.ts                # DTO actualización
├── products-new.controller.ts                    # Endpoints
├── products-new.service.ts                       # Lógica de negocio + JOINs
├── products-new.module.ts                        # Módulo con TypeORM entities
├── products-new.providers.ts                     # Providers (patrón stores)
└── README.md                                     # Este archivo
```

---

## Consideraciones de Performance

### Carga Eager vs. Lazy

Por defecto, el servicio carga **todas las relaciones** en cada consulta:

```typescript
relations: [
  'artisanShop',        // Tabla legacy shop.artisan_shops
  'artisanalIdentity',
  'physicalSpecs',
  'logistics',
  'production',
  'media',
  'badges',
  'materials',
  'variants',
]
```

**Optimización:** Si solo necesitas datos del núcleo:

```typescript
const product = await this.productCoreRepository.findOne({
  where: { id },
  // Sin relaciones
});
```

### Paginación

Para listados grandes, **siempre usa paginación**:

```typescript
// ❌ MAL: Cargar todos los productos
const products = await productsNewService.findAll();

// ✅ BIEN: Usar paginación
const result = await productsNewService.findWithPagination(1, 20);
```

---

## Migración desde shop.products (Legacy)

Para migrar productos del sistema antiguo (`shop.products`) al nuevo:

1. Crear registro en `products_core` con datos básicos
2. Crear capas especializadas según datos disponibles
3. Migrar imágenes JSONB → `product_media` (normalizada)
4. Migrar materials JSONB → `product_materials_link` (N:M)
5. Migrar techniques JSONB → FK en `product_artisanal_identity`
6. Migrar variantes → `product_variants` con precios en minor units

**Script de migración** (conceptual):

```typescript
const legacyProducts = await legacyRepository.find();

for (const legacy of legacyProducts) {
  // 1. Crear core
  const core = await productCoreRepository.save({
    storeId: legacy.shopId,           // ID de artisan_shops
    legacyProductId: legacy.id,        // Mantener referencia al producto legacy
    name: legacy.name,
    shortDescription: legacy.description,
    status: mapLegacyStatus(legacy.status),
  });

  // 2. Crear identidad artesanal si tiene craft
  if (legacy.craftType) {
    const craft = await findCraftByName(legacy.craftType);
    await artisanalIdentityRepository.save({
      productId: core.id,
      primaryCraftId: craft?.id,
    });
  }

  // 3. Migrar imágenes JSONB → tabla
  for (const imgUrl of legacy.images || []) {
    await productMediaRepository.save({
      productId: core.id,
      mediaUrl: imgUrl,
      mediaType: 'image',
      isPrimary: false,
    });
  }

  // 4. Crear variante por defecto
  await productVariantRepository.save({
    productId: core.id,
    sku: legacy.sku,
    stockQuantity: legacy.inventory || 0,
    basePriceMinor: legacy.price * 100, // Convertir a centavos
    currency: 'COP',
  });
}
```

---

## Testing

```bash
# Iniciar servidor de desarrollo
npm run start:dev

# Probar endpoints
curl http://localhost:3000/products-new
curl http://localhost:3000/products-new/550e8400-e29b-41d4-a716-446655440000
curl http://localhost:3000/products-new/store/550e8400-e29b-41d4-a716-446655440000
curl "http://localhost:3000/products-new?page=1&limit=20&status=published"
```

---

## Roadmap

- [ ] Implementar filtros avanzados (precio, materiales, técnicas)
- [ ] Agregar búsqueda full-text en nombre y descripción
- [ ] Crear endpoints para gestionar capas individuales
- [ ] Implementar validaciones en DTOs
- [ ] Agregar endpoints para variantes (CRUD independiente)
- [ ] Sistema EAV para atributos dinámicos (talla, color, etc.)
- [ ] Integrar con sistema de footprints (identidad digital)
