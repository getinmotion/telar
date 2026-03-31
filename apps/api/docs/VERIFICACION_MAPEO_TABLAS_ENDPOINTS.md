# Verificación y Mapeo de Tablas para Endpoints - Telar.co

**Guía de Implementación de Endpoints de Productos Multicapa**

---

## 📋 Tabla de Contenidos

1. [Estado de Implementación de Tablas](#1-estado-de-implementación-de-tablas)
2. [Mapeo de Tablas por Módulo](#2-mapeo-de-tablas-por-módulo)
3. [Queries de Referencia](#3-queries-de-referencia)
4. [Estructura de Endpoints](#4-estructura-de-endpoints)
5. [Guía de Implementación por Módulo](#5-guía-de-implementación-por-módulo)
6. [Migraciones de Datos](#6-migraciones-de-datos)

---

## 1. Estado de Implementación de Tablas

### ✅ Tablas Completamente Implementadas

Estas tablas **YA EXISTEN** en la base de datos (verificadas en migraciones):

#### 🏛️ Schema: `taxonomy`

| Tabla | Estado | Migración | Descripción |
|-------|--------|-----------|-------------|
| `taxonomy.crafts` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Oficios artesanales con flujo de aprobación |
| `taxonomy.techniques` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Técnicas asociadas a oficios |
| `taxonomy.materials` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Catálogo de materiales (orgánicos, sostenibles) |
| `taxonomy.curatorial_categories` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Categorías curatoriales |
| `taxonomy.badges` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Insignias para tiendas y productos |
| `taxonomy.care_tags` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Etiquetas de cuidado |
| `taxonomy.categories` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Categorías de productos (árbol jerárquico) |

#### 🏪 Schema: `shop` - Tiendas

| Tabla | Estado | Migración | Descripción |
|-------|--------|-----------|-------------|
| `shop.stores` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Tiendas artesanales (reemplazo de artisan_shops) |
| `shop.store_artisanal_profiles` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Perfil artesanal de la tienda |
| `shop.store_contacts` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Información de contacto de tiendas |
| `shop.store_awards` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Premios y reconocimientos de tiendas |
| `shop.store_badges` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Badges asignados a tiendas |

#### 📦 Schema: `shop` - Productos Core

| Tabla | Estado | Migración | Descripción |
|-------|--------|-----------|-------------|
| `shop.products_core` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Núcleo del producto (nombre, descripción, status) |
| `shop.product_artisanal_identity` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Identidad artesanal (oficio, técnica, estilo) |
| `shop.product_materials_link` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Relación N:M con materiales |
| `shop.product_physical_specs` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Especificaciones físicas (dimensiones, peso) |
| `shop.product_logistics` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Información logística (empaque, fragilidad) |
| `shop.product_production` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Disponibilidad y tiempos de producción |
| `shop.product_media` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Imágenes y videos |
| `shop.product_care_tags` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Etiquetas de cuidado del producto |
| `shop.product_badges` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Badges asignados a productos |

#### 🔧 Schema: `shop` - Variantes y EAV

| Tabla | Estado | Migración | Descripción |
|-------|--------|-----------|-------------|
| `shop.product_variants` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` + `RefactorAttributeSystem` | SKUs con precio en minor units |
| `shop.attributes` | ✅ **EXISTE** | `RefactorAttributeSystem` | Catálogo global de atributos |
| `shop.attribute_options` | ✅ **EXISTE** | `RefactorAttributeSystem` | Opciones predefinidas de atributos |
| `shop.category_attribute_sets` | ✅ **EXISTE** | `RefactorAttributeSystem` | Configuración de atributos por categoría |
| `shop.product_attribute_values` | ✅ **EXISTE** | `RefactorAttributeSystem` | Valores de atributos a nivel producto |
| `shop.variant_attribute_values` | ✅ **EXISTE** | `RefactorAttributeSystem` | Valores de atributos a nivel variante |

#### 🔐 Schema: `digital_identity`

| Tabla | Estado | Migración | Descripción |
|-------|--------|-----------|-------------|
| `digital_identity.footprints` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Huellas digitales de productos |
| `digital_identity.metadata_versions` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Versiones de metadata |

#### 💳 Schema: `payments`

| Tabla | Estado | Migración | Notas |
|-------|--------|-----------|-------|
| `payments.product_prices` | ✅ **EXISTE** | `CreateMarketplaceTaxonomySchema` | Precios contextuales por tienda |

### ⚠️ Tablas Legacy (No Usar en Nuevos Endpoints)

Estas tablas existen pero **NO deben usarse** en nuevos endpoints:

| Tabla Legacy | Estado | Reemplazo | Notas |
|--------------|--------|-----------|-------|
| `shop.artisan_shops` | ⚠️ **LEGACY** | `shop.stores` | Mantener solo para migración |
| `shop.products` | ⚠️ **LEGACY** | `shop.products_core` + capas | Mantener solo para migración |
| `public.product_variants` (vieja) | ⚠️ **LEGACY** | `shop.product_variants` (nueva) | Migrada a shop schema |
| `public.product_moderation_history` | ⚠️ **LEGACY** | - | Usar `products_core.status` |

### ❌ Tablas Mencionadas Pero No Implementadas

Estas tablas se mencionan en la documentación pero **NO existen** en las migraciones:

| Tabla Mencionada | Estado | Acción Requerida |
|------------------|--------|------------------|
| `taxonomy.category_attributes` | ❌ **DEPRECADA** | Fue reemplazada por `shop.attributes` en RefactorAttributeSystem |
| `taxonomy.category_attribute_options` | ❌ **DEPRECADA** | Fue reemplazada por `shop.attribute_options` en RefactorAttributeSystem |

---

## 2. Mapeo de Tablas por Módulo

### 📦 Módulo: Productos

#### GET /products (Lista de productos)

**Tablas necesarias:**
```
┌─────────────────────┐
│ products_core       │ ← Base (nombre, descripción, status)
└──────────┬──────────┘
           │
           ├──► stores (tienda propietaria)
           ├──► categories (categoría del producto)
           ├──► product_artisanal_identity (oficio, técnica)
           ├──► product_physical_specs (dimensiones)
           ├──► product_media (imágenes - solo principal)
           └──► product_variants (precio mínimo, stock total)
```

**Query de referencia:**
```sql
SELECT
    pc.id,
    pc.name,
    pc.short_description,
    pc.status,
    -- Tienda
    s.id as store_id,
    s.name as store_name,
    s.slug as store_slug,
    -- Categoría
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    -- Identidad artesanal
    cr.name as craft_name,
    t.name as technique_name,
    -- Specs
    ps.height_cm,
    ps.width_cm,
    ps.real_weight_kg,
    -- Media principal
    (
        SELECT media_url
        FROM shop.product_media pm
        WHERE pm.product_id = pc.id AND pm.is_primary = true
        LIMIT 1
    ) as primary_image,
    -- Variantes (precio mínimo)
    (
        SELECT MIN(base_price_minor)
        FROM shop.product_variants pv
        WHERE pv.product_id = pc.id AND pv.is_active = true
    ) as min_price_minor,
    -- Stock total
    (
        SELECT COALESCE(SUM(stock_quantity), 0)
        FROM shop.product_variants pv
        WHERE pv.product_id = pc.id AND pv.is_active = true
    ) as total_stock
FROM shop.products_core pc
LEFT JOIN shop.stores s ON s.id = pc.store_id
LEFT JOIN taxonomy.categories c ON c.id = pc.category_id
LEFT JOIN shop.product_artisanal_identity pai ON pai.product_id = pc.id
LEFT JOIN taxonomy.crafts cr ON cr.id = pai.primary_craft_id
LEFT JOIN taxonomy.techniques t ON t.id = pai.primary_technique_id
LEFT JOIN shop.product_physical_specs ps ON ps.product_id = pc.id
WHERE pc.deleted_at IS NULL
  AND pc.status = 'approved'
ORDER BY pc.created_at DESC;
```

#### GET /products/:id (Detalle completo de producto)

**Tablas necesarias:**
```
products_core (base)
├── stores (1:1)
├── categories (1:1)
├── product_artisanal_identity (1:1)
│   ├── crafts
│   ├── techniques (primaria)
│   ├── techniques (secundaria)
│   └── curatorial_categories
├── product_materials_link (N:M)
│   └── materials
├── product_physical_specs (1:1)
├── product_logistics (1:1)
├── product_production (1:1)
├── product_media (1:N)
├── product_care_tags (N:M)
│   └── care_tags
├── product_badges (N:M)
│   └── badges
├── product_attribute_values (1:N) ← Atributos de producto
│   └── attributes
└── product_variants (1:N) ← Variantes con SKUs
    └── variant_attribute_values (1:N) ← Atributos de variante
        └── attributes
```

#### POST /products (Crear producto)

**Tablas a insertar (en orden de dependencia):**

1. `shop.products_core` ← Crear primero (genera product_id)
2. `shop.product_artisanal_identity` (product_id)
3. `shop.product_physical_specs` (product_id)
4. `shop.product_logistics` (product_id)
5. `shop.product_production` (product_id)
6. `shop.product_materials_link` (N registros)
7. `shop.product_media` (N registros)
8. `shop.product_care_tags` (N registros)
9. `shop.product_attribute_values` (N registros)
10. `shop.product_variants` (N registros) → genera variant_ids
11. `shop.variant_attribute_values` (N×M registros)

### 🏪 Módulo: Tiendas

#### GET /stores/:id

**Tablas necesarias:**
```
stores (base)
├── store_artisanal_profiles (1:1)
│   └── crafts (oficio principal)
├── store_contacts (1:1)
├── store_awards (1:N)
└── store_badges (N:M)
    └── badges
```

### 🎨 Módulo: Taxonomías

#### GET /taxonomy/crafts

**Tabla:** `taxonomy.crafts`
**Filtro:** `status = 'approved' AND is_active = true`

#### GET /taxonomy/crafts/:id/techniques

**Tablas:**
- `taxonomy.techniques` (WHERE craft_id = :id)
**Filtro:** `status = 'approved'`

#### GET /taxonomy/materials

**Tabla:** `taxonomy.materials`
**Filtro:** `status = 'approved'`

#### GET /taxonomy/badges

**Tabla:** `taxonomy.badges`
**Parámetros:** `?target_type=product` o `?target_type=shop`

### 🔧 Módulo: Atributos EAV

#### GET /categories/:id/attributes

**Query:**
```sql
SELECT
    a.id,
    a.code,
    a.name,
    a.ui_type,
    a.data_type,
    a.unit,
    cas.is_required,
    cas.is_variant_level,
    cas.display_order,
    -- Opciones (si es select/radio)
    COALESCE(
        json_agg(
            json_build_object(
                'id', ao.id,
                'value', ao.value,
                'display_order', ao.display_order
            )
            ORDER BY ao.display_order
        ) FILTER (WHERE ao.id IS NOT NULL),
        '[]'
    ) as options
FROM shop.category_attribute_sets cas
JOIN shop.attributes a ON a.id = cas.attribute_id
LEFT JOIN shop.attribute_options ao ON ao.attribute_id = a.id AND ao.is_active = true
WHERE cas.category_id = $1
GROUP BY a.id, cas.is_required, cas.is_variant_level, cas.display_order
ORDER BY cas.display_order;
```

---

## 3. Queries de Referencia

### 3.1 Query Completa de Producto para GET /products/:id

```sql
-- CTE para obtener datos base del producto
WITH product_base AS (
    SELECT
        pc.*,
        -- Store
        json_build_object(
            'id', s.id,
            'name', s.name,
            'slug', s.slug
        ) as store,
        -- Category
        json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug
        ) as category
    FROM shop.products_core pc
    LEFT JOIN shop.stores s ON s.id = pc.store_id
    LEFT JOIN taxonomy.categories c ON c.id = pc.category_id
    WHERE pc.id = $1 AND pc.deleted_at IS NULL
),
-- Identidad artesanal
artisanal_identity AS (
    SELECT
        pai.product_id,
        json_build_object(
            'primary_craft', json_build_object('id', cr.id, 'name', cr.name),
            'primary_technique', json_build_object('id', t1.id, 'name', t1.name),
            'secondary_technique', json_build_object('id', t2.id, 'name', t2.name),
            'curatorial_category', json_build_object('id', cc.id, 'name', cc.name),
            'piece_type', pai.piece_type,
            'style', pai.style,
            'process_type', pai.process_type,
            'is_collaboration', pai.is_collaboration,
            'estimated_elaboration_time', pai.estimated_elaboration_time
        ) as identity
    FROM shop.product_artisanal_identity pai
    LEFT JOIN taxonomy.crafts cr ON cr.id = pai.primary_craft_id
    LEFT JOIN taxonomy.techniques t1 ON t1.id = pai.primary_technique_id
    LEFT JOIN taxonomy.techniques t2 ON t2.id = pai.secondary_technique_id
    LEFT JOIN taxonomy.curatorial_categories cc ON cc.id = pai.curatorial_category_id
    WHERE pai.product_id = $1
),
-- Materiales
materials AS (
    SELECT
        pml.product_id,
        json_agg(
            json_build_object(
                'id', m.id,
                'name', m.name,
                'is_organic', m.is_organic,
                'is_sustainable', m.is_sustainable,
                'is_primary', pml.is_primary,
                'origin', pml.material_origin
            )
            ORDER BY pml.is_primary DESC, m.name
        ) as materials_list
    FROM shop.product_materials_link pml
    JOIN taxonomy.materials m ON m.id = pml.material_id
    WHERE pml.product_id = $1
    GROUP BY pml.product_id
),
-- Specs físicos
physical_specs AS (
    SELECT
        ps.product_id,
        json_build_object(
            'height_cm', ps.height_cm,
            'width_cm', ps.width_cm,
            'length_or_diameter_cm', ps.length_or_diameter_cm,
            'real_weight_kg', ps.real_weight_kg
        ) as specs
    FROM shop.product_physical_specs ps
    WHERE ps.product_id = $1
),
-- Logística
logistics AS (
    SELECT
        pl.product_id,
        json_build_object(
            'packaging_type', pl.packaging_type,
            'pack_height_cm', pl.pack_height_cm,
            'pack_width_cm', pl.pack_width_cm,
            'pack_length_cm', pl.pack_length_cm,
            'pack_weight_kg', pl.pack_weight_kg,
            'fragility', pl.fragility,
            'requires_assembly', pl.requires_assembly,
            'special_protection_notes', pl.special_protection_notes
        ) as logistics
    FROM shop.product_logistics pl
    WHERE pl.product_id = $1
),
-- Producción
production AS (
    SELECT
        pp.product_id,
        json_build_object(
            'availability_type', pp.availability_type,
            'production_time_days', pp.production_time_days,
            'monthly_capacity', pp.monthly_capacity,
            'requirements_to_start', pp.requirements_to_start
        ) as production
    FROM shop.product_production pp
    WHERE pp.product_id = $1
),
-- Media
media AS (
    SELECT
        pm.product_id,
        json_agg(
            json_build_object(
                'id', pm.id,
                'url', pm.media_url,
                'type', pm.media_type,
                'is_primary', pm.is_primary,
                'display_order', pm.display_order
            )
            ORDER BY pm.display_order, pm.created_at
        ) as media_list
    FROM shop.product_media pm
    WHERE pm.product_id = $1
    GROUP BY pm.product_id
),
-- Care Tags
care_tags AS (
    SELECT
        pct.product_id,
        json_agg(
            json_build_object(
                'id', ct.id,
                'name', ct.name,
                'icon_url', ct.icon_url
            )
        ) as care_tags_list
    FROM shop.product_care_tags pct
    JOIN taxonomy.care_tags ct ON ct.id = pct.care_tag_id
    WHERE pct.product_id = $1 AND ct.is_active = true
    GROUP BY pct.product_id
),
-- Badges
badges AS (
    SELECT
        pb.product_id,
        json_agg(
            json_build_object(
                'id', b.id,
                'code', b.code,
                'name', b.name,
                'description', b.description,
                'icon_url', b.icon_url,
                'awarded_at', pb.awarded_at
            )
        ) as badges_list
    FROM shop.product_badges pb
    JOIN taxonomy.badges b ON b.id = pb.badge_id
    WHERE pb.product_id = $1
    GROUP BY pb.product_id
),
-- Atributos de producto
product_attributes AS (
    SELECT
        pav.product_id,
        json_object_agg(
            a.code,
            pav.value
        ) as attributes
    FROM shop.product_attribute_values pav
    JOIN shop.attributes a ON a.id = pav.attribute_id
    WHERE pav.product_id = $1
    GROUP BY pav.product_id
),
-- Variantes con sus atributos
variants AS (
    SELECT
        pv.product_id,
        json_agg(
            json_build_object(
                'id', pv.id,
                'sku', pv.sku,
                'price', json_build_object(
                    'amount_minor', pv.base_price_minor,
                    'currency', pv.currency
                ),
                'stock_quantity', pv.stock_quantity,
                'attributes', (
                    SELECT json_object_agg(a.code, vav.value)
                    FROM shop.variant_attribute_values vav
                    JOIN shop.attributes a ON a.id = vav.attribute_id
                    WHERE vav.variant_id = pv.id
                ),
                'is_active', pv.is_active
            )
            ORDER BY pv.created_at
        ) as variants_list
    FROM shop.product_variants pv
    WHERE pv.product_id = $1 AND pv.deleted_at IS NULL
    GROUP BY pv.product_id
)
-- Query final: combinar todo
SELECT
    pb.id,
    pb.name,
    pb.short_description,
    pb.history,
    pb.care_notes,
    pb.status,
    pb.store,
    pb.category,
    ai.identity as artisanal_identity,
    m.materials_list as materials,
    ps.specs as physical_specs,
    l.logistics,
    p.production,
    med.media_list as media,
    ct.care_tags_list as care_tags,
    b.badges_list as badges,
    pa.attributes,
    v.variants_list as variants,
    pb.created_at,
    pb.updated_at
FROM product_base pb
LEFT JOIN artisanal_identity ai ON ai.product_id = pb.id
LEFT JOIN materials m ON m.product_id = pb.id
LEFT JOIN physical_specs ps ON ps.product_id = pb.id
LEFT JOIN logistics l ON l.product_id = pb.id
LEFT JOIN production p ON p.product_id = pb.id
LEFT JOIN media med ON med.product_id = pb.id
LEFT JOIN care_tags ct ON ct.product_id = pb.id
LEFT JOIN badges b ON b.product_id = pb.id
LEFT JOIN product_attributes pa ON pa.product_id = pb.id
LEFT JOIN variants v ON v.product_id = pb.id;
```

### 3.2 Query para Crear Producto Completo

```typescript
// 1. Crear producto core
const productCore = await queryRunner.query(`
    INSERT INTO shop.products_core (
        store_id,
        category_id,
        name,
        short_description,
        history,
        care_notes,
        status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'draft')
    RETURNING id
`, [storeId, categoryId, name, shortDesc, history, careNotes]);

const productId = productCore[0].id;

// 2. Crear identidad artesanal
await queryRunner.query(`
    INSERT INTO shop.product_artisanal_identity (
        product_id,
        primary_craft_id,
        primary_technique_id,
        secondary_technique_id,
        piece_type,
        style,
        process_type,
        is_collaboration
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
`, [productId, craftId, techId1, techId2, pieceType, style, processType, false]);

// 3. Crear specs físicos
await queryRunner.query(`
    INSERT INTO shop.product_physical_specs (
        product_id,
        height_cm,
        width_cm,
        length_or_diameter_cm,
        real_weight_kg
    ) VALUES ($1, $2, $3, $4, $5)
`, [productId, height, width, length, weight]);

// 4. Crear logística
await queryRunner.query(`
    INSERT INTO shop.product_logistics (
        product_id,
        packaging_type,
        fragility,
        requires_assembly
    ) VALUES ($1, $2, $3, $4)
`, [productId, packagingType, fragility, requiresAssembly]);

// 5. Crear producción
await queryRunner.query(`
    INSERT INTO shop.product_production (
        product_id,
        availability_type,
        production_time_days,
        monthly_capacity
    ) VALUES ($1, $2, $3, $4)
`, [productId, availabilityType, productionDays, capacity]);

// 6. Insertar materiales (N:M)
for (const material of materials) {
    await queryRunner.query(`
        INSERT INTO shop.product_materials_link (
            product_id,
            material_id,
            is_primary,
            material_origin
        ) VALUES ($1, $2, $3, $4)
    `, [productId, material.id, material.isPrimary, material.origin]);
}

// 7. Insertar media
for (const media of mediaList) {
    await queryRunner.query(`
        INSERT INTO shop.product_media (
            product_id,
            media_url,
            media_type,
            is_primary,
            display_order
        ) VALUES ($1, $2, $3, $4, $5)
    `, [productId, media.url, media.type, media.isPrimary, media.order]);
}

// 8. Insertar atributos de producto (NO variantes)
for (const attr of productAttributes) {
    await queryRunner.query(`
        INSERT INTO shop.product_attribute_values (
            product_id,
            attribute_id,
            value,
            stage
        ) VALUES ($1, $2, $3, 'draft')
    `, [productId, attr.attributeId, attr.value]);
}

// 9. Crear variantes
for (const variant of variants) {
    const variantResult = await queryRunner.query(`
        INSERT INTO shop.product_variants (
            product_id,
            sku,
            base_price_minor,
            currency,
            stock_quantity
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `, [productId, variant.sku, variant.priceMinor, 'COP', variant.stock]);

    const variantId = variantResult[0].id;

    // 10. Insertar atributos de variante
    for (const attr of variant.attributes) {
        await queryRunner.query(`
            INSERT INTO shop.variant_attribute_values (
                variant_id,
                attribute_id,
                value,
                stage
            ) VALUES ($1, $2, $3, 'draft')
        `, [variantId, attr.attributeId, attr.value]);
    }
}
```

---

## 4. Estructura de Endpoints

### 4.1 Endpoints de Productos

```typescript
// ============================================
// PRODUCTOS
// ============================================

/**
 * GET /api/products
 * Lista paginada de productos aprobados
 */
interface ProductListItem {
  id: string;
  name: string;
  short_description: string;
  status: 'draft' | 'pending_moderation' | 'approved' | 'rejected';

  store: {
    id: string;
    name: string;
    slug: string;
  };

  category: {
    id: string;
    name: string;
    slug: string;
  };

  craft_name: string;
  technique_name: string;

  primary_image: string; // URL

  price: {
    min_price_minor: number;
    currency: 'COP' | 'USD';
  };

  stock: {
    total_stock: number;
    in_stock: boolean;
  };

  created_at: string;
}

/**
 * GET /api/products/:id
 * Detalle completo de producto
 */
interface ProductDetail {
  id: string;
  name: string;
  short_description: string;
  history: string;
  care_notes: string;
  status: string;

  store: {
    id: string;
    name: string;
    slug: string;
  };

  category: {
    id: string;
    name: string;
    slug: string;
  };

  artisanal_identity: {
    primary_craft: { id: string; name: string };
    primary_technique: { id: string; name: string };
    secondary_technique?: { id: string; name: string };
    curatorial_category?: { id: string; name: string };
    piece_type: 'funcional' | 'decorativa' | 'mixta';
    style: 'tradicional' | 'contemporaneo' | 'fusion';
    process_type: 'manual' | 'mixto' | 'asistido';
    is_collaboration: boolean;
    estimated_elaboration_time?: string;
  };

  materials: Array<{
    id: string;
    name: string;
    is_organic: boolean;
    is_sustainable: boolean;
    is_primary: boolean;
    origin?: string;
  }>;

  physical_specs: {
    height_cm: number;
    width_cm: number;
    length_or_diameter_cm: number;
    real_weight_kg: number;
  };

  logistics: {
    packaging_type: string;
    pack_height_cm: number;
    pack_width_cm: number;
    pack_length_cm: number;
    pack_weight_kg: number;
    fragility: 'bajo' | 'medio' | 'alto';
    requires_assembly: boolean;
    special_protection_notes?: string;
  };

  production: {
    availability_type: 'en_stock' | 'bajo_pedido' | 'edicion_limitada';
    production_time_days?: number;
    monthly_capacity?: number;
    requirements_to_start?: string;
  };

  media: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    is_primary: boolean;
    display_order: number;
  }>;

  care_tags: Array<{
    id: string;
    name: string;
    icon_url: string;
  }>;

  badges: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
    icon_url: string;
    awarded_at: string;
  }>;

  attributes: Record<string, string>; // { tipo_tela: "Algodón", ... }

  variants: Array<{
    id: string;
    sku: string;
    price: {
      amount_minor: number;
      currency: string;
    };
    stock_quantity: number;
    attributes: Record<string, string>; // { talla: "M", color: "Rojo" }
    is_active: boolean;
  }>;

  created_at: string;
  updated_at: string;
}

/**
 * POST /api/products
 * Crear nuevo producto
 */
interface CreateProductRequest {
  store_id: string;
  category_id: string;

  // Core
  name: string;
  short_description: string;
  history?: string;
  care_notes?: string;

  // Identidad artesanal
  artisanal_identity: {
    primary_craft_id: string;
    primary_technique_id: string;
    secondary_technique_id?: string;
    curatorial_category_id?: string;
    piece_type: 'funcional' | 'decorativa' | 'mixta';
    style: 'tradicional' | 'contemporaneo' | 'fusion';
    process_type: 'manual' | 'mixto' | 'asistido';
    is_collaboration?: boolean;
    estimated_elaboration_time?: string;
  };

  // Materiales
  materials: Array<{
    material_id: string;
    is_primary: boolean;
    origin?: string;
  }>;

  // Specs físicos
  physical_specs: {
    height_cm?: number;
    width_cm?: number;
    length_or_diameter_cm?: number;
    real_weight_kg?: number;
  };

  // Logística
  logistics: {
    packaging_type?: string;
    pack_height_cm?: number;
    pack_width_cm?: number;
    pack_length_cm?: number;
    pack_weight_kg?: number;
    fragility?: 'bajo' | 'medio' | 'alto';
    requires_assembly?: boolean;
    special_protection_notes?: string;
  };

  // Producción
  production: {
    availability_type: 'en_stock' | 'bajo_pedido' | 'edicion_limitada';
    production_time_days?: number;
    monthly_capacity?: number;
    requirements_to_start?: string;
  };

  // Media
  media: Array<{
    url: string;
    type: 'image' | 'video';
    is_primary: boolean;
    display_order: number;
  }>;

  // Care tags
  care_tag_ids: string[];

  // Atributos de producto (NO variantes)
  attributes: Record<string, string>;

  // Variantes
  variants: Array<{
    sku: string;
    price_minor: number; // En centavos
    currency: 'COP' | 'USD';
    stock_quantity: number;
    attributes: Record<string, string>; // { talla: "M", color: "Rojo" }
  }>;
}

/**
 * PUT /api/products/:id
 * Actualizar producto existente
 */
interface UpdateProductRequest extends Partial<CreateProductRequest> {
  // Mismo esquema pero todos los campos opcionales
}

/**
 * DELETE /api/products/:id
 * Soft delete de producto
 */
// Response: 204 No Content
```

### 4.2 Endpoints de Taxonomías

```typescript
// ============================================
// TAXONOMÍAS
// ============================================

/**
 * GET /api/taxonomy/crafts
 * Listar oficios aprobados
 */
interface Craft {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * GET /api/taxonomy/crafts/:id/techniques
 * Listar técnicas de un oficio
 */
interface Technique {
  id: string;
  craft_id: string;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * POST /api/taxonomy/materials/suggest
 * Sugerir nuevo material (artesano)
 */
interface SuggestMaterialRequest {
  name: string;
  is_organic?: boolean;
  is_sustainable?: boolean;
}

/**
 * PATCH /api/taxonomy/materials/:id/approve
 * Aprobar material sugerido (admin)
 */
// Response: { id: string, status: 'approved' }

/**
 * GET /api/taxonomy/badges
 * Listar badges disponibles
 * Query params: ?target_type=product|shop
 */
interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon_url: string;
  target_type: 'shop' | 'product';
  assignment_type: 'curated' | 'automated';
  is_active: boolean;
}
```

### 4.3 Endpoints de Atributos EAV

```typescript
// ============================================
// ATRIBUTOS EAV
// ============================================

/**
 * GET /api/categories/:id/attributes
 * Obtener atributos configurados para una categoría
 */
interface CategoryAttribute {
  id: string;
  code: string;
  name: string;
  ui_type: 'text' | 'select' | 'color_picker' | 'number' | 'textarea';
  data_type: 'string' | 'number' | 'boolean';
  unit?: string;
  is_required: boolean;
  is_variant_level: boolean; // true = genera variantes, false = atributo de producto
  display_order: number;
  options?: Array<{
    id: string;
    value: string;
    display_order: number;
  }>;
}

/**
 * POST /api/products/:id/variants/generate
 * Generar variantes desde combinaciones de atributos
 */
interface GenerateVariantsRequest {
  combinations: Array<Record<string, string>>; // [{ talla: "M", color: "Rojo" }, ...]
  base_price_minor: number; // Precio base para todas las variantes
  stock_per_variant: number; // Stock inicial por variante
}
```

---

## 5. Guía de Implementación por Módulo

### 5.1 Módulo de Productos

**Archivo:** `src/resources/products/products.service.ts`

**Métodos requeridos:**

```typescript
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductCore)
    private productCoreRepo: Repository<ProductCore>,
    // ... otros repositorios
  ) {}

  /**
   * Listar productos (público)
   */
  async findAll(filters: ProductFilters): Promise<ProductListItem[]> {
    // JOIN con 6-8 tablas
    // Filtros: category_id, store_id, craft_id, status
    // Paginación
  }

  /**
   * Obtener detalle completo
   */
  async findOne(id: string): Promise<ProductDetail> {
    // JOIN con TODAS las 14+ tablas relacionadas
    // Usar la query completa de la sección 3.1
  }

  /**
   * Crear producto completo
   */
  async create(dto: CreateProductRequest): Promise<ProductDetail> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Crear products_core
      // 2-9. Crear todas las capas relacionadas
      // 10. Retornar producto completo
    });
  }

  /**
   * Actualizar producto
   */
  async update(id: string, dto: UpdateProductRequest): Promise<ProductDetail> {
    return this.dataSource.transaction(async (manager) => {
      // Actualizar solo las capas modificadas
    });
  }

  /**
   * Soft delete
   */
  async remove(id: string): Promise<void> {
    await this.productCoreRepo.update(id, {
      deleted_at: new Date(),
    });
  }
}
```

### 5.2 Módulo de Taxonomías

**Archivo:** `src/resources/taxonomy/taxonomy.service.ts`

**Métodos requeridos:**

```typescript
@Injectable()
export class TaxonomyService {
  // Oficios
  async findAllCrafts(): Promise<Craft[]> {
    return this.craftsRepo.find({
      where: { status: 'approved', is_active: true },
    });
  }

  async findTechniquesByCraft(craftId: string): Promise<Technique[]> {
    return this.techniquesRepo.find({
      where: { craft_id: craftId, status: 'approved' },
    });
  }

  // Materiales
  async suggestMaterial(dto: SuggestMaterialRequest, userId: string) {
    return this.materialsRepo.save({
      ...dto,
      status: 'pending',
      suggested_by: userId,
    });
  }

  async approveMaterial(id: string) {
    return this.materialsRepo.update(id, { status: 'approved' });
  }

  // Badges
  async findBadges(targetType?: 'shop' | 'product') {
    const where: any = { is_active: true };
    if (targetType) where.target_type = targetType;
    return this.badgesRepo.find({ where });
  }
}
```

### 5.3 Módulo de Atributos EAV

**Archivo:** `src/resources/attributes/attributes.service.ts`

**Métodos requeridos:**

```typescript
@Injectable()
export class AttributesService {
  async findAttributesByCategory(categoryId: string): Promise<CategoryAttribute[]> {
    // Usar query de sección 2, Módulo EAV
    const query = `
      SELECT
        a.id, a.code, a.name, a.ui_type, a.data_type, a.unit,
        cas.is_required, cas.is_variant_level, cas.display_order,
        COALESCE(json_agg(...) FILTER (...), '[]') as options
      FROM shop.category_attribute_sets cas
      JOIN shop.attributes a ON a.id = cas.attribute_id
      LEFT JOIN shop.attribute_options ao ON ao.attribute_id = a.id
      WHERE cas.category_id = $1
      GROUP BY a.id, cas.*
      ORDER BY cas.display_order
    `;
    return this.dataSource.query(query, [categoryId]);
  }

  async generateVariants(
    productId: string,
    dto: GenerateVariantsRequest
  ): Promise<ProductVariant[]> {
    // Para cada combinación:
    // 1. Crear variant con SKU generado
    // 2. Insertar variant_attribute_values
    return this.dataSource.transaction(async (manager) => {
      const variants = [];
      for (const combo of dto.combinations) {
        // Generar SKU: producto-slug + atributos
        const sku = this.generateSku(productId, combo);

        const variant = await manager.save(ProductVariant, {
          product_id: productId,
          sku,
          base_price_minor: dto.base_price_minor,
          stock_quantity: dto.stock_per_variant,
        });

        // Insertar atributos
        for (const [attrCode, attrValue] of Object.entries(combo)) {
          const attr = await this.findAttributeByCode(attrCode);
          await manager.save(VariantAttributeValue, {
            variant_id: variant.id,
            attribute_id: attr.id,
            value: attrValue,
          });
        }

        variants.push(variant);
      }
      return variants;
    });
  }
}
```

---

## 6. Migraciones de Datos

### 6.1 Estrategia de Migración de Productos Legacy

```typescript
/**
 * Migración: shop.products (legacy) → shop.products_core + capas
 */
async function migrateProductsToMultilayer() {
  const legacyProducts = await dataSource
    .getRepository('shop.products')
    .find();

  for (const legacy of legacyProducts) {
    await dataSource.transaction(async (manager) => {
      // 1. Crear products_core
      const productCore = await manager.save(ProductCore, {
        store_id: legacy.shop_id,
        category_id: legacy.category_id,
        name: legacy.name,
        short_description: legacy.short_description,
        history: legacy.description, // descripción larga → history
        care_notes: null, // nuevo campo
        status: mapLegacyStatus(legacy.active, legacy.moderation_status),
        legacy_product_id: legacy.id, // ← IMPORTANTE para tracking
      });

      // 2. Migrar identidad artesanal desde JSONB
      const craftId = await findOrCreateCraft(legacy.craft_type);
      const techniqueId = await findOrCreateTechnique(
        craftId,
        legacy.techniques?.[0]
      );

      await manager.save(ProductArtisanalIdentity, {
        product_id: productCore.id,
        primary_craft_id: craftId,
        primary_technique_id: techniqueId,
        piece_type: 'funcional', // default
        style: 'tradicional', // default
        process_type: 'manual', // default
      });

      // 3. Migrar specs desde JSONB dimensions + weight
      await manager.save(ProductPhysicalSpecs, {
        product_id: productCore.id,
        height_cm: legacy.dimensions?.height,
        width_cm: legacy.dimensions?.width,
        length_or_diameter_cm: legacy.dimensions?.length,
        real_weight_kg: legacy.weight,
      });

      // 4. Migrar logística (nuevo - valores por defecto)
      await manager.save(ProductLogistics, {
        product_id: productCore.id,
        fragility: 'medio',
        requires_assembly: false,
      });

      // 5. Migrar producción desde made_to_order + production_time
      await manager.save(ProductProduction, {
        product_id: productCore.id,
        availability_type: legacy.made_to_order ? 'bajo_pedido' : 'en_stock',
        production_time_days: legacy.production_time_hours
          ? Math.ceil(legacy.production_time_hours / 24)
          : null,
      });

      // 6. Migrar materiales desde JSONB materials[]
      if (legacy.materials && Array.isArray(legacy.materials)) {
        for (const [index, materialName] of legacy.materials.entries()) {
          const materialId = await findOrCreateMaterial(materialName);
          await manager.save(ProductMaterialsLink, {
            product_id: productCore.id,
            material_id: materialId,
            is_primary: index === 0,
          });
        }
      }

      // 7. Migrar media desde JSONB images[]
      if (legacy.images && Array.isArray(legacy.images)) {
        for (const [index, imageUrl] of legacy.images.entries()) {
          await manager.save(ProductMedia, {
            product_id: productCore.id,
            media_url: imageUrl,
            media_type: 'image',
            is_primary: index === 0,
            display_order: index,
          });
        }
      }

      // 8. Migrar variantes (si existen)
      // legacy.product_variants (tabla public.product_variants)
      const legacyVariants = await manager.find(LegacyProductVariant, {
        where: { product_id: legacy.id },
      });

      for (const legacyVar of legacyVariants) {
        const newVariant = await manager.save(ProductVariant, {
          product_id: productCore.id,
          sku: legacyVar.sku,
          base_price_minor: legacy.price * 100, // de float a minor units
          currency: 'COP',
          stock_quantity: legacyVar.stock || 0,
        });

        // Migrar option_values (JSONB) → variant_attribute_values
        // { color: "Rojo", talla: "M" }
        if (legacyVar.option_values) {
          for (const [attrCode, value] of Object.entries(legacyVar.option_values)) {
            const attr = await findOrCreateAttribute(attrCode);
            await manager.save(VariantAttributeValue, {
              variant_id: newVariant.id,
              attribute_id: attr.id,
              value: value as string,
            });
          }
        }
      }

      console.log(`✅ Migrated product: ${legacy.name} (${legacy.id})`);
    });
  }
}

/**
 * Helpers
 */
function mapLegacyStatus(active: boolean, moderationStatus?: string): string {
  if (!active) return 'draft';
  if (moderationStatus === 'approved') return 'approved';
  if (moderationStatus === 'pending') return 'pending_moderation';
  return 'draft';
}

async function findOrCreateCraft(craftName: string): Promise<string> {
  let craft = await dataSource.getRepository(Craft).findOne({
    where: { name: craftName },
  });
  if (!craft) {
    craft = await dataSource.getRepository(Craft).save({
      name: craftName,
      status: 'approved',
    });
  }
  return craft.id;
}

async function findOrCreateMaterial(materialName: string): Promise<string> {
  let material = await dataSource.getRepository(Material).findOne({
    where: { name: materialName },
  });
  if (!material) {
    material = await dataSource.getRepository(Material).save({
      name: materialName,
      status: 'approved',
    });
  }
  return material.id;
}

async function findOrCreateAttribute(code: string): Promise<Attribute> {
  let attr = await dataSource.getRepository(Attribute).findOne({
    where: { code },
  });
  if (!attr) {
    attr = await dataSource.getRepository(Attribute).save({
      code,
      name: code.charAt(0).toUpperCase() + code.slice(1),
      ui_type: 'text',
      data_type: 'string',
    });
  }
  return attr;
}
```

### 6.2 Script de Migración Completo

```bash
# Ejecutar migración de datos legacy
npm run migration:run

# Script personalizado para migración de productos
npm run migrate:products:legacy

# Verificar integridad
npm run verify:product:data
```

---

## 📝 Checklist de Implementación

### Fase 1: Preparación ✅

- [x] Verificar migraciones de TypeORM ejecutadas
- [x] Confirmar todas las tablas creadas en BD
- [x] Revisar relaciones FK funcionando
- [ ] Crear seeds de datos de prueba para taxonomías

### Fase 2: Entidades TypeORM

- [ ] Crear entidades para todas las tablas nuevas
- [ ] Configurar relaciones (OneToOne, OneToMany, ManyToMany)
- [ ] Validar decoradores y constraints
- [ ] Probar queries básicas

### Fase 3: Servicios y Repositorios

- [ ] Implementar `TaxonomyService`
- [ ] Implementar `ProductsService` (CRUD completo)
- [ ] Implementar `AttributesService`
- [ ] Implementar `VariantsService`

### Fase 4: Controladores y Endpoints

- [ ] `GET /api/taxonomy/crafts`
- [ ] `GET /api/taxonomy/crafts/:id/techniques`
- [ ] `GET /api/taxonomy/materials`
- [ ] `GET /api/taxonomy/badges`
- [ ] `GET /api/categories/:id/attributes`
- [ ] `GET /api/products` (lista)
- [ ] `GET /api/products/:id` (detalle)
- [ ] `POST /api/products` (crear)
- [ ] `PUT /api/products/:id` (actualizar)
- [ ] `DELETE /api/products/:id` (soft delete)
- [ ] `POST /api/products/:id/variants/generate`

### Fase 5: Migración de Datos

- [ ] Script de migración de productos legacy
- [ ] Script de migración de variantes legacy
- [ ] Verificación de integridad de datos
- [ ] Rollback plan

### Fase 6: Testing

- [ ] Unit tests de servicios
- [ ] Integration tests de endpoints
- [ ] E2E tests de flujos completos
- [ ] Performance tests de queries complejas

### Fase 7: Documentación

- [ ] Swagger/OpenAPI para todos los endpoints
- [ ] Ejemplos de requests/responses
- [ ] Guía de uso de EAV
- [ ] Changelog de cambios vs API anterior

---

## 🔗 Referencias

- **Documento principal:** [PRODUCTO_MULTICAPA_TAXONOMIA.md](./PRODUCTO_MULTICAPA_TAXONOMIA.md)
- **Migraciones:** `src/migrations/1772732492530-CreateMarketplaceTaxonomySchema.ts`
- **Refactor EAV:** `src/migrations/1772809621273-RefactorAttributeSystem.ts`
- **Entidades:** `src/resources/*/entities/`

---

**Documento creado:** 2026-03-23
**Última actualización:** 2026-03-23
**Versión:** 1.0
**Estado:** ✅ Listo para Implementación
