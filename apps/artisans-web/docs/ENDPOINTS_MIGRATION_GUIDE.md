# Guía de Migración de Endpoints - Legacy a Nueva Arquitectura

Esta guía documenta todos los componentes que usan los endpoints legacy de `artisan_shops` y `products`, para facilitar la migración a las nuevas tablas `shop.stores` y `shop.products_core`.

---

## 📦 PRODUCTOS - `products.actions.ts`

### Endpoints Actuales (Legacy)

| Función | Endpoint | Método | Descripción |
|---------|----------|--------|-------------|
| `getProductById` | `/products/:id` | GET | Obtener producto por ID |
| `getProductsByShopId` | `/products/shop/:shopId` | GET | Obtener productos de una tienda |
| `createProduct` | `/products` | POST | Crear nuevo producto |
| `updateProduct` | `/products/:id` | PATCH | Actualizar producto |
| `deleteProduct` | `/products/:id` | DELETE | Eliminar producto |
| `getProductsByUserId` | `/products/user/:userId` | GET | Productos de usuario (via tienda) |
| `getMarketplaceProductsByShopId` | `/products/marketplace/shop/:shopId` | GET | Productos aprobados para marketplace |
| `getApprovedProductsCount` | `/products/shop/:shopId/approved-count` | GET | Conteo de productos aprobados |

---

### 🔍 Uso por Componente - PRODUCTOS

#### **Hooks (8 archivos)**

**1. `hooks/useProducts.ts`** - Hook principal de productos
- ✅ `getProductsByShopId` - Cargar productos de una tienda
- ✅ `createProduct` - Crear producto
- ✅ `updateProduct` - Actualizar producto
- ✅ `deleteProduct` - Eliminar producto

**2. `hooks/useInventory.ts`** - Gestión de inventario
- ✅ `getProductsByShopId` - Cargar productos para inventario
- ✅ `getProductById` - Obtener producto específico
- ✅ `createProduct` - Crear producto
- ✅ `updateProduct` - Actualizar inventario/producto
- ✅ `deleteProduct` - Eliminar producto

**3. `hooks/useMasterCoordinator.ts`** - Coordinador maestro
- ✅ `getProductsByUserId` - Cargar productos del usuario

**4. `hooks/useAutoHeroGeneration.ts`** - Generación automática de hero
- ✅ `getProductsByUserId` - Obtener productos para generar hero

**5. `hooks/useShopPublish.ts`** - Publicación de tienda
- ✅ `getApprovedProductsCount` - Validar cantidad de productos aprobados

**6. `hooks/useFixedTasksManager.ts`** - Gestor de tareas
- ✅ `getProductsByUserId` - Verificar productos para tareas

**7. `hooks/useAutoTaskCompletion.ts`** - Completado automático de tareas
- ✅ `getProductsByUserId` - (Comentado) Verificar productos

**8. `hooks/useArtisanDetection.ts`** - Detección de artesano
- (No usa productos directamente)

---

#### **Componentes (7 archivos)**

**1. `components/shop/ProductEditForm.tsx`** - Editor de productos
- ✅ `getProductById` - Cargar producto a editar
- ✅ `updateProduct` - Guardar cambios del producto (3 usos)

**2. `components/shop/ai-upload/steps/Step5Review.tsx`** - Wizard AI Upload
- ✅ `createProduct` - Crear producto desde wizard AI
- ✅ `getProductsByShopId` - Verificar productos existentes
- ✅ `getProductById` - Cargar producto existente

**3. `components/shop/AIProductUpload.tsx`** - Upload AI de productos
- ✅ `createProduct` - Crear producto (función handleCreateProduct)

**4. `components/coordinator/NewMasterCoordinatorDashboard.tsx`** - Dashboard coordinador
- ✅ `getProductsByUserId` - Cargar productos del usuario

**5. `components/inventory/MasterInventoryView.tsx`** - Vista maestro inventario
- ✅ `deleteProduct` - Eliminar producto
- ✅ `duplicateProduct` - Duplicar producto (via useInventory)

**6. `components/inventory/DeleteProductDialog.tsx`** - Diálogo eliminar
- (Solo UI, usa deleteProduct pasado como prop)

**7. `components/modals/InventoryOrganizerModal.tsx`** - Organizador inventario
- ✅ `updateProduct` - Actualizar categoría/info producto

---

#### **Páginas (5 archivos)**

**1. `pages/PublicShopPageNew.tsx`** - Página pública de tienda
- ✅ `getProductsByShopId` - Cargar productos (preview con usuario)
- ✅ `getMarketplaceProductsByShopId` - Cargar productos públicos

**2. `pages/InventoryPage.tsx`** - Página de inventario
- ✅ `updateProduct` - Activar/desactivar productos
- ✅ `deleteProduct` - Eliminar producto
- (Usa funciones via useInventory)

**3. `pages/StockWizard.tsx`** - Wizard de stock
- ✅ `updateProduct` - Actualizar inventario

**4. `pages/PublicProductPage.tsx`** - Página pública producto
- (Usa productos pero los carga de otra forma, vía Supabase directamente)

---

#### **Context (2 archivos)**

**1. `context/MasterAgentContext.tsx`** - Contexto del agente maestro
- ✅ `getProductsByUserId` - Cargar conteo y productos (2 usos)

**2. `context/AuthContext.tsx`** - Contexto de autenticación
- (No usa productos directamente)

---

#### **Utilities (1 archivo)**

**1. `utils/systemIntegrityValidator.ts`** - Validador de integridad
- (No usa productos directamente en los snippets mostrados)

---

## 🏪 TIENDAS - `artisanShops.actions.ts`

### Endpoints Actuales (Legacy)

| Función | Endpoint | Método | Descripción |
|---------|----------|--------|-------------|
| `getPublishedArtisanShops` | `/artisan-shops?active=true&publishStatus=published` | GET | Tiendas publicadas (directorio) |
| `getArtisanShopById` | `/artisan-shops/:id` | GET | Obtener tienda por ID |
| `getArtisanShopByUserId` | `/artisan-shops/user/:userId` | GET | Tienda de un usuario |
| `getArtisanShopBySlug` | `/artisan-shops/slug/:slug` | GET | Tienda por slug |
| `isSlugAvailable` | `/artisan-shops/slug/:slug` | GET | Verificar disponibilidad slug |
| `hasArtisanShop` | `/artisan-shops/user/:userId` | GET | Verificar si usuario tiene tienda |
| `createArtisanShop` | `/artisan-shops` | POST | Crear tienda |
| `updateArtisanShop` | `/artisan-shops/:id` | PATCH | Actualizar tienda |
| `updateArtisanShopByUserId` | (Compuesta) | - | Obtener + actualizar |
| `upsertArtisanShop` | (Compuesta) | - | Crear o actualizar |

---

### 🔍 Uso por Componente - TIENDAS

#### **Hooks (8 archivos)**

**1. `hooks/useArtisanShop.ts`** - ⭐ Hook principal de tienda (MÁS USADO)
- ✅ `getArtisanShopByUserId` - Cargar tienda del usuario (3 usos)
- ✅ `createArtisanShop` - Crear nueva tienda
- ✅ `updateArtisanShop` - Actualizar tienda (4 usos)
- ✅ `isSlugAvailable` - Validar slug único

**2. `hooks/useMasterCoordinator.ts`** - Coordinador maestro
- ✅ `getArtisanShopByUserId` - Cargar tienda

**3. `hooks/useAutoHeroGeneration.ts`** - Generación auto de hero
- ✅ `getArtisanShopByUserId` - Obtener tienda para generar hero
- ✅ `updateArtisanShop` - Guardar hero generado

**4. `hooks/useShopPublish.ts`** - Publicación de tienda
- ✅ `getArtisanShopById` - Obtener tienda para validar
- ✅ `updateArtisanShop` - Publicar tienda

**5. `hooks/useFixedTasksManager.ts`** - Gestor de tareas
- ✅ `getArtisanShopByUserId` - Verificar tienda para tareas

**6. `hooks/useAutoTaskCompletion.ts`** - Auto completado tareas
- ✅ `getArtisanShopByUserId` - (Comentado) Verificar tienda

**7. `hooks/useBankData.ts`** - Datos bancarios
- ✅ `getArtisanShopByUserId` - Obtener tienda para banking

**8. `hooks/useArtisanDetection.ts`** - Detección de artesano
- ✅ `getArtisanShopByUserId` - Verificar si es artesano

**9. `hooks/useTaskReconciliation.ts`** - Reconciliación de tareas
- ✅ `getArtisanShopByUserId` - Verificar estado tienda

---

#### **Componentes (6 archivos)**

**1. `components/shop/ShopDashboard.tsx`** - Dashboard de tienda
- ✅ `updateArtisanShop` - Actualizar descripción y nombre (2 usos)

**2. `components/shop/wizards/HeroSliderWizard.tsx`** - Wizard Hero Slider
- ✅ `getArtisanShopById` - Cargar tienda
- ✅ `updateArtisanShop` - Guardar configuración hero

**3. `components/shop/wizards/ContactWizard.tsx`** - Wizard de contacto
- ✅ `getArtisanShopById` - Cargar tienda
- ✅ `updateArtisanShop` - Guardar info de contacto

**4. `components/shop/wizards/ArtisanProfileWizard.tsx`** - Wizard perfil artesano
- ✅ `updateArtisanShop` - Guardar perfil artesanal (2 usos)

**5. `components/shop/wizards/artisan-profile/ArtisanProfileDashboard.tsx`** - Dashboard perfil
- ✅ `updateArtisanShop` - Guardar cambios perfil

**6. `components/coordinator/NewMasterCoordinatorDashboard.tsx`** - Coordinador
- ✅ `getArtisanShopByUserId` - Cargar tienda

**7. `components/shop/ai-upload/steps/Step5Review.tsx`** - Review AI Upload
- ✅ `getArtisanShopByUserId` - Obtener tienda para crear producto

**8. `components/shop/ai-upload/AIProductUploadWizard.tsx`** - Wizard Upload AI
- (Usa tienda vía props)

---

#### **Páginas (11 archivos)**

**1. `pages/ShopDirectoryPage.tsx`** - ⭐ Directorio público
- ✅ `getPublishedArtisanShops` - Cargar todas las tiendas publicadas

**2. `pages/PublicShopPageNew.tsx`** - Página pública de tienda
- ✅ `getArtisanShopBySlug` - Cargar tienda por slug

**3. `pages/PublicProductPage.tsx`** - Página pública producto
- ✅ `getArtisanShopBySlug` - Cargar tienda dueña del producto

**4. `pages/PublicArtisanProfile.tsx`** - Perfil público artesano
- ✅ `getArtisanShopBySlug` - Cargar perfil por slug

**5. `pages/PublicShopContact.tsx`** - Contacto público
- ✅ `getArtisanShopBySlug` - Cargar info contacto por slug

**6. `pages/ProfilePage.tsx`** - Perfil del usuario
- ✅ `getArtisanShopByUserId` - Cargar tienda del usuario

**7. `pages/ShopConfigDashboard.tsx`** - Configuración de tienda
- ✅ `getArtisanShopByUserId` - Cargar tienda
- ✅ `updateArtisanShop` - Actualizar configuración (3 usos)

**8. `pages/BankDataPage.tsx`** - Datos bancarios
- ✅ `getArtisanShopByUserId` - Cargar tienda para validar

---

#### **Context (2 archivos)**

**1. `context/MasterAgentContext.tsx`** - ⭐ Contexto principal
- ✅ `getArtisanShopByUserId` - Cargar tienda (4 usos)
- ✅ `updateArtisanShop` - Actualizar tienda

---

#### **Utilities (3 archivos)**

**1. `utils/syncBrandToShop.ts`** - Sincronización de marca
- ✅ `getArtisanShopByUserId` - Obtener tienda existente
- ✅ `createArtisanShop` - Crear si no existe
- ✅ `updateArtisanShop` - Sincronizar cambios de marca

**2. `utils/validateBrandSync.ts`** - Validación de sincronización
- ✅ `getArtisanShopByUserId` - Validar estado de tienda

**3. `utils/systemIntegrityValidator.ts`** - Validador de integridad
- ✅ `getArtisanShopByUserId` - Validar integridad del sistema

---

## 📊 RESUMEN ESTADÍSTICO

### Productos (8 funciones)
- **Total archivos usando products**: 23 archivos
  - Hooks: 8
  - Componentes: 7
  - Páginas: 5
  - Context: 2
  - Utilities: 1

### Tiendas (10 funciones)
- **Total archivos usando artisan_shops**: 29 archivos
  - Hooks: 9
  - Componentes: 8
  - Páginas: 11
  - Context: 1
  - Utilities: 3

---

## 🎯 FUNCIONES MÁS USADAS

### Productos
1. **`getProductsByShopId`** - Usado en ~12 lugares (inventario, shop público)
2. **`updateProduct`** - Usado en ~15 lugares (edición, stock, estado)
3. **`getProductsByUserId`** - Usado en ~8 lugares (coordinador, tareas)
4. **`deleteProduct`** - Usado en ~6 lugares (inventario)
5. **`createProduct`** - Usado en ~5 lugares (wizard, AI upload)

### Tiendas
1. **`getArtisanShopByUserId`** - ⭐ Usado en ~25 lugares (la más común)
2. **`updateArtisanShop`** - Usado en ~20 lugares (configuración, wizards)
3. **`getArtisanShopBySlug`** - Usado en ~6 lugares (páginas públicas)
4. **`createArtisanShop`** - Usado en ~3 lugares (onboarding, sync)
5. **`getPublishedArtisanShops`** - Usado en 1 lugar (directorio)

---

## 🚀 PLAN DE MIGRACIÓN RECOMENDADO

### Fase 1: Preparación Backend
- ✅ Crear nuevos endpoints en `/products-new` y `/stores`
- ✅ Asegurar que retornan datos compatibles con tipos compartidos
- ✅ Implementar mapeo de legacy_id

### Fase 2: Migración de Servicios
1. Crear `products-new.actions.ts` con funciones mapeadas
2. Crear `stores.actions.ts` con funciones mapeadas
3. Mantener tipos compartidos en `@telar/shared-types`

### Fase 3: Migración por Módulo (Gradual)
1. **Empezar por lecturas (GET)** - Menos riesgo
   - `getArtisanShopByUserId` → Migrar primero (más usado)
   - `getProductsByShopId` → Segundo más crítico
2. **Luego actualizaciones (PATCH)**
3. **Finalmente creaciones (POST)** y eliminaciones (DELETE)

### Fase 4: Componentes Críticos Prioritarios
1. `hooks/useArtisanShop.ts` - Base de toda la app
2. `hooks/useInventory.ts` - Inventario crítico
3. `pages/ShopDirectoryPage.tsx` - Visibilidad pública
4. `context/MasterAgentContext.tsx` - Contexto global

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Mapeo de Datos
- **Products**: `shop_id` (legacy) → `storeId` (new) usando `legacy_product_id`
- **Shops**: `id` (legacy) → `legacyId` (new) en tabla stores
- **Campos snake_case** → **camelCase** en nueva arquitectura

### Backward Compatibility
- Mantener funciones de mapeo: `mapProductToLegacy`, `mapStoreToArtisanShop`
- Componentes reciben mismo tipo de datos (Product, ArtisanShop)
- Sin cambios en UI/UX durante migración

### Testing Strategy
- Unit tests para funciones de mapeo
- Integration tests para cada endpoint migrado
- E2E tests para flujos críticos (crear producto, publicar tienda)

---

**Generado**: 2026-03-25
**Versión**: 1.0
**Estado**: Legacy (Pre-migración a nueva arquitectura)
