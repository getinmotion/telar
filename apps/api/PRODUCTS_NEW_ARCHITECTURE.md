# Arquitectura Products-New - Nueva Tabla Multicapa

## 📋 Resumen Ejecutivo

El resource `products-new` implementa la nueva arquitectura multicapa para productos, separando la información en 9 tablas especializadas para mejor normalización y escalabilidad.

---

## 🗄️ ESTRUCTURA DE TABLAS

### Tabla Principal: `shop.products_core`

**Campos Core:**
```typescript
{
  id: string (UUID, PK)
  storeId: string (UUID, FK → shop.artisan_shops.id)  ⚠️ IMPORTANTE
  categoryId: string (UUID, nullable)
  legacyProductId: string (UUID, nullable) // Link a shop.products legacy
  name: string
  shortDescription: string
  history: string (nullable)
  careNotes: string (nullable)
  status: string (draft | published | archived)
  createdAt: timestamptz
  updatedAt: timestamptz
  deletedAt: timestamptz (soft delete)
}
```

### ⚠️ RELACIÓN CON TIENDAS - CRÍTICO

**`storeId` apunta a `shop.artisan_shops`, NO a `shop.stores`**

```typescript
@ManyToOne(() => ArtisanShop)
@JoinColumn({ name: 'store_id' })
artisanShop?: ArtisanShop;
```

**Comentario del Service (línea 88):**
> "@param storeId - ID del artisan_shop (no confundir con la nueva tabla stores)"

**Razón:**
- La tabla `shop.stores` aún no está migrada al frontend
- Por ahora, `products_core` usa la FK hacia `artisan_shops` (legacy)
- Cuando migren stores, se actualizará esta relación

---

## 📦 LAS 8 CAPAS ESPECIALIZADAS

### 1. **ProductArtisanalIdentity** (Identidad Artesanal)
```typescript
{
  productId: UUID (FK, PK)
  primaryCraftId: UUID
  primaryTechniqueId: UUID
  secondaryTechniqueId: UUID
  curatorialCategoryId: UUID
  pieceType: 'funcional' | 'decorativa' | 'mixta'
  style: 'tradicional' | 'contemporaneo' | 'fusion'
  isCollaboration: boolean
  processType: 'manual' | 'mixto' | 'asistido'
  estimatedElaborationTime: string
}
```

### 2. **ProductPhysicalSpecs** (Especificaciones Físicas)
```typescript
{
  productId: UUID (FK, PK)
  weight: number (gramos)
  dimensions: JSONB { length, width, height, unit }
  volume: number (cm³, nullable)
  color: string (nullable)
  finish: string (nullable)
}
```

### 3. **ProductLogistics** (Logística y Envío)
```typescript
{
  productId: UUID (FK, PK)
  availability: 'en_stock' | 'bajo_pedido' | 'edicion_limitada'
  leadTimeDays: number (nullable)
  fragilityLevel: 'bajo' | 'medio' | 'alto'
  needsSpecialPackaging: boolean
  shippingRestrictions: string (nullable)
}
```

### 4. **ProductProduction** (Producción)
```typescript
{
  productId: UUID (FK, PK)
  estimatedProductionDays: number (nullable)
  minimumOrder: number
  maximumOrder: number (nullable)
  customizationOptions: JSONB (nullable)
  isCustomizable: boolean
}
```

### 5. **ProductMedia** (Imágenes y Videos) - 1:N
```typescript
{
  id: UUID (PK)
  productId: UUID (FK)
  mediaType: 'image' | 'video'
  mediaUrl: string
  altText: string (nullable)
  displayOrder: number
  isPrimary: boolean
}
```

### 6. **ProductBadge** (Insignias/Certificaciones) - 1:N
```typescript
{
  id: UUID (PK)
  productId: UUID (FK)
  badgeType: string
  displayText: string (nullable)
  iconUrl: string (nullable)
  verificationUrl: string (nullable)
}
```

### 7. **ProductMaterialLink** (Materiales) - 1:N
```typescript
{
  id: UUID (PK)
  productId: UUID (FK)
  materialId: UUID
  isPrimary: boolean
  percentage: number (nullable)
}
```

### 8. **ProductVariant** (Variantes de Producto) - 1:N
```typescript
{
  id: UUID (PK)
  productId: UUID (FK)
  variantName: string
  sku: string
  basePriceMinor: string (BIGINT as string, en centavos)
  comparePriceMinor: string (nullable)
  stockQuantity: number
  lowStockThreshold: number (nullable)
  optionValues: JSONB (nullable) // {color: 'rojo', size: 'M'}
  isActive: boolean
}
```

---

## 🔌 ENDPOINTS DISPONIBLES

### Base Path: `/products-new`

| Endpoint | Método | Descripción | Relaciones Incluidas |
|----------|--------|-------------|---------------------|
| `POST /products-new` | POST | Crear producto completo | Todas (cascade) |
| `GET /products-new` | GET | Listar productos (con paginación opcional) | Todas |
| `GET /products-new/:id` | GET | Obtener producto por ID | Todas |
| `GET /products-new/store/:storeId` | GET | Productos de tienda (artisan_shop) | Todas |
| `GET /products-new/category/:categoryId` | GET | Productos por categoría | Todas |
| `GET /products-new/status/:status` | GET | Productos por status | Todas |
| `GET /products-new/legacy/:legacyId` | GET | Producto por legacy_product_id | Todas |
| `PATCH /products-new/:id` | PATCH | Actualizar producto | - |
| `PATCH /products-new/:id/status` | PATCH | Cambiar status | - |
| `DELETE /products-new/:id` | DELETE | Soft delete | - |

### Query Params (GET /products-new)
```typescript
{
  page?: string        // Número de página (default: 1)
  limit?: string       // Items por página (default: 20)
  storeId?: string     // Filtrar por tienda
  categoryId?: string  // Filtrar por categoría
  status?: string      // Filtrar por status
}
```

---

## 📊 RESPUESTA COMPLETA DEL API

Cuando se consulta un producto, el backend retorna:

```typescript
{
  // CORE
  id: "uuid",
  storeId: "uuid",  // ⚠️ ID de artisan_shops
  categoryId: "uuid" | null,
  legacyProductId: "uuid" | null,
  name: "string",
  shortDescription: "string",
  history: "string" | null,
  careNotes: "string" | null,
  status: "draft" | "published" | "archived",
  createdAt: "2026-03-26T...",
  updatedAt: "2026-03-26T...",
  deletedAt: null,

  // RELACIÓN CON TIENDA LEGACY
  artisanShop: {
    id: "uuid",
    userId: "uuid",
    shopName: "string",
    shopSlug: "string",
    description: "string",
    // ... todos los campos de artisan_shops
  },

  // CAPA: Identidad Artesanal (1:1)
  artisanalIdentity: {
    productId: "uuid",
    primaryCraftId: "uuid",
    primaryTechniqueId: "uuid",
    pieceType: "funcional",
    style: "tradicional",
    // ...
  },

  // CAPA: Especificaciones Físicas (1:1)
  physicalSpecs: {
    productId: "uuid",
    weight: 500,
    dimensions: { length: 20, width: 15, height: 10, unit: "cm" },
    color: "Azul marino",
    // ...
  },

  // CAPA: Logística (1:1)
  logistics: {
    productId: "uuid",
    availability: "en_stock",
    leadTimeDays: null,
    fragilityLevel: "medio",
    needsSpecialPackaging: false,
    // ...
  },

  // CAPA: Producción (1:1)
  production: {
    productId: "uuid",
    estimatedProductionDays: 7,
    minimumOrder: 1,
    maximumOrder: 100,
    isCustomizable: true,
    // ...
  },

  // CAPA: Media (1:N)
  media: [
    {
      id: "uuid",
      productId: "uuid",
      mediaType: "image",
      mediaUrl: "https://...",
      altText: "Vista frontal",
      displayOrder: 1,
      isPrimary: true
    },
    // ... más imágenes/videos
  ],

  // CAPA: Badges (1:N)
  badges: [
    {
      id: "uuid",
      productId: "uuid",
      badgeType: "eco_friendly",
      displayText: "Producto Ecológico",
      iconUrl: "https://...",
      verificationUrl: "https://..."
    },
    // ... más badges
  ],

  // CAPA: Materiales (1:N)
  materials: [
    {
      id: "uuid",
      productId: "uuid",
      materialId: "uuid",
      isPrimary: true,
      percentage: 80
    },
    // ... más materiales
  ],

  // CAPA: Variantes (1:N)
  variants: [
    {
      id: "uuid",
      productId: "uuid",
      variantName: "Talla M - Color Rojo",
      sku: "PROD-001-M-RED",
      basePriceMinor: "5000000",  // $50,000.00 en centavos
      comparePriceMinor: "6000000",
      stockQuantity: 15,
      lowStockThreshold: 5,
      optionValues: { size: "M", color: "rojo" },
      isActive: true
    },
    // ... más variantes
  ]
}
```

---

## 💰 SISTEMA DE PRECIOS

### Unidades Menores (Minor Units)
- **Tipo**: `BIGINT` almacenado como `string` en TypeScript
- **Formato**: Centavos (1 peso = 100 centavos)
- **Ejemplo**:
  - `"5000000"` = 50,000.00 pesos
  - `"100000"` = 1,000.00 pesos
  - `"50000"` = 500.00 pesos

### Conversión:
```typescript
// String a número (para cálculos)
const priceInPesos = parseInt(basePriceMinor) / 100;

// Número a string (para guardar)
const basePriceMinor = (priceInPesos * 100).toString();
```

---

## 🔄 COMPATIBILIDAD CON LEGACY

### Campo `legacyProductId`
- **Propósito**: Enlazar con productos de `shop.products` (tabla legacy)
- **Uso**: Permite consultar productos usando el ID antiguo
- **Endpoint**: `GET /products-new/legacy/:legacyId`

### Relación con Tiendas
```
products_core.storeId → artisan_shops.id (ACTUAL)
                     ↓
                  (FUTURO: stores.id)
```

**Cuando se migre la tabla stores:**
1. Se actualizará la FK de `storeId` para apuntar a `shop.stores`
2. Se agregará un campo `legacy_shop_id` para mantener el link con artisan_shops
3. Los endpoints seguirán funcionando igual

---

## 📝 EJEMPLO DE CREACIÓN

### POST /products-new
```json
{
  "storeId": "uuid-de-artisan-shop",
  "categoryId": "uuid-categoria",
  "name": "Poncho Tradicional Wayuu",
  "shortDescription": "Poncho tejido a mano con técnicas ancestrales",
  "history": "Este poncho representa 300 años de tradición...",
  "careNotes": "Lavar a mano con agua fría",
  "status": "draft",

  "artisanalIdentity": {
    "primaryCraftId": "uuid-tejido",
    "primaryTechniqueId": "uuid-telar",
    "pieceType": "funcional",
    "style": "tradicional",
    "processType": "manual",
    "estimatedElaborationTime": "15 días"
  },

  "physicalSpecs": {
    "weight": 800,
    "dimensions": {
      "length": 150,
      "width": 120,
      "height": 2,
      "unit": "cm"
    },
    "color": "Multicolor"
  },

  "logistics": {
    "availability": "bajo_pedido",
    "leadTimeDays": 20,
    "fragilityLevel": "bajo",
    "needsSpecialPackaging": false
  },

  "production": {
    "estimatedProductionDays": 15,
    "minimumOrder": 1,
    "maximumOrder": 5,
    "isCustomizable": true,
    "customizationOptions": {
      "colors": ["rojo", "azul", "verde"],
      "sizes": ["S", "M", "L"]
    }
  },

  "media": [
    {
      "mediaType": "image",
      "mediaUrl": "https://storage.../poncho-1.jpg",
      "altText": "Vista frontal del poncho",
      "displayOrder": 1,
      "isPrimary": true
    },
    {
      "mediaType": "image",
      "mediaUrl": "https://storage.../poncho-2.jpg",
      "altText": "Detalle del tejido",
      "displayOrder": 2,
      "isPrimary": false
    }
  ],

  "badges": [
    {
      "badgeType": "eco_friendly",
      "displayText": "100% Algodón Orgánico",
      "iconUrl": "https://.../eco-icon.svg"
    },
    {
      "badgeType": "fair_trade",
      "displayText": "Comercio Justo Certificado",
      "verificationUrl": "https://fairtrade.org/..."
    }
  ],

  "materials": [
    {
      "materialId": "uuid-algodon",
      "isPrimary": true,
      "percentage": 100
    }
  ],

  "variants": [
    {
      "variantName": "Talla S - Multicolor",
      "sku": "PONCHO-WAY-S-MULTI",
      "basePriceMinor": "35000000",  // $350,000.00
      "comparePriceMinor": "40000000", // $400,000.00
      "stockQuantity": 3,
      "lowStockThreshold": 1,
      "optionValues": {
        "size": "S",
        "pattern": "multicolor"
      },
      "isActive": true
    },
    {
      "variantName": "Talla M - Multicolor",
      "sku": "PONCHO-WAY-M-MULTI",
      "basePriceMinor": "38000000",  // $380,000.00
      "stockQuantity": 5,
      "lowStockThreshold": 2,
      "optionValues": {
        "size": "M",
        "pattern": "multicolor"
      },
      "isActive": true
    }
  ]
}
```

---

## 🎯 PUNTOS CLAVE PARA MIGRACIÓN

### 1. ⚠️ storeId vs artisan_shops
- **AHORA**: `storeId` = ID de `shop.artisan_shops`
- **FUTURO**: `storeId` = ID de `shop.stores`
- **Migración**: Se agregará `legacy_shop_id` cuando se migre

### 2. Cascading Saves
- Todas las relaciones tienen `cascade: true`
- Al crear/actualizar ProductCore, todas las capas se guardan automáticamente
- No necesitas guardar cada capa por separado

### 3. Soft Deletes
- Los productos NO se eliminan físicamente
- Se usa `deletedAt` para soft delete
- Todas las queries filtran por `deletedAt: IsNull()`

### 4. Relaciones Siempre Cargadas
- Todos los endpoints cargan TODAS las relaciones
- Incluye `artisanShop` (datos de la tienda)
- Respuesta completa del producto con todas sus capas

### 5. Precios en Minor Units
- SIEMPRE guardar como string
- SIEMPRE en centavos
- Conversión: `pesos * 100`

---

## 📋 CHECKLIST DE MIGRACIÓN

### Backend ✅
- [x] Entidades creadas (9 tablas)
- [x] DTOs completos con validaciones
- [x] Controller con todos los endpoints
- [x] Service con métodos CRUD
- [x] Relación con artisan_shops establecida
- [x] Campo legacy_product_id para compatibilidad

### Frontend ⏳ (Pendiente)
- [ ] Crear `products-new.actions.ts` en frontend
- [ ] Mapear ProductResponse → LegacyProduct
- [ ] Actualizar hooks (useInventory, useProducts)
- [ ] Migrar componentes gradualmente
- [ ] Testing de cada funcionalidad migrada

### Database ⏳ (Pendiente)
- [ ] Ejecutar migraciones en producción
- [ ] Poblar `legacy_product_id` desde shop.products
- [ ] Verificar integridad de FKs
- [ ] Plan de rollback listo

---

## 🚨 ADVERTENCIAS IMPORTANTES

1. **NO confundir `storeId` con tabla `stores`**
   - `storeId` apunta a `artisan_shops` (legacy)
   - La tabla `stores` no está en uso todavía

2. **Siempre incluir todas las relaciones**
   - El backend siempre carga todas las capas
   - No intentar hacer queries selectivas de capas

3. **Minor units son strings, no numbers**
   - TypeScript: `string`
   - Database: `BIGINT`
   - Nunca usar `number` para precios

4. **Soft deletes siempre activos**
   - Nunca usar `DELETE` real
   - Siempre verificar `deletedAt: IsNull()`

---

**Fecha**: 2026-03-26
**Versión**: 1.0
**Estado**: Tablas creadas, backend completo, frontend pendiente
