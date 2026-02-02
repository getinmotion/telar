# 📋 ANÁLISIS MIGRACIÓN: ARTISAN_SHOPS

**Fecha:** 2026-01-25  
**Archivos detectados:** 74 archivos  
**Referencias totales:** 193 menciones  

---

## ✅ **SERVICIOS CREADOS**

### **`src/services/artisanShops.actions.ts`**

Servicio centralizado con 6 funciones:

```typescript
// 1. GET - Obtener tienda por userId
const shop = await getArtisanShopByUserId(userId);

// 2. Verificar existencia
const exists = await hasArtisanShop(userId);

// 3. POST - Crear tienda
await createArtisanShop(payload);

// 4. PATCH - Actualizar tienda por shopId
await updateArtisanShop(shopId, payload);

// 5. Helper - Actualizar por userId
await updateArtisanShopByUserId(userId, payload);

// 6. UPSERT - Crear o actualizar
await upsertArtisanShop(userId, payload);
```

### **`src/types/artisanShop.types.ts`**

Tipos completos:
- `ArtisanShop` - Entidad principal (35+ campos)
- Enums: `PrivacyLevel`, `CreationStatus`, `PublishStatus`, `BankDataStatus`, `MarketplaceApprovalStatus`
- JSONB types: `ContactInfo`, `SocialLinks`, `SeoData`, `HeroConfig`, `AboutContent`, `ContactConfig`
- `CreateArtisanShopPayload`, `UpdateArtisanShopPayload`
- Respuestas de éxito y error

---

## 🎯 **ENDPOINTS NECESARIOS**

### **✅ Ya Implementados:**
- `GET /telar/server/artisan-shops/user/:userId` - Obtener por usuario
- `POST /telar/server/artisan-shops` - Crear tienda

### **⚠️ REQUERIDOS (detectados en código):**

#### **1. PATCH /telar/server/artisan-shops/:shopId** 🔴 CRÍTICO
**Uso:** Actualizar campos de la tienda
**Archivos que lo necesitan:**
- `src/context/MasterAgentContext.tsx` (UPDATE shop_name, description)
- `src/utils/syncBrandToShop.ts` (UPDATE logo_url, brand_claim, colors)
- Multiple wizards (Hero, About, Contact, Social Links)

**Request esperado:**
```typescript
{
  shopName?: string;
  description?: string;
  logoUrl?: string;
  brandClaim?: string;
  primaryColors?: string[];
  heroConfig?: object;
  aboutContent?: object;
  // ... otros campos opcionales
}
```

#### **2. DELETE /telar/server/artisan-shops/:shopId** 🟡 MEDIA
**Uso:** Eliminar tienda (usado en reset/debug)
**Archivos que lo necesitan:**
- `src/hooks/useDebugArtisanData.ts` (DELETE en función reset)

#### **3. GET /telar/server/artisan-shops (Lista/Admin)** 🟡 MEDIA
**Uso:** Obtener todas las tiendas (admin, estadísticas)
**Archivos que lo necesitan:**
- `src/hooks/useAdminStats.ts` (SELECT count, SELECT con filtros)
- `src/hooks/useAdminShops.ts`

**Query params sugeridos:**
- `?active=true` - Filtrar por activas
- `?marketplace_approval_status=pending` - Filtrar por estado
- `?count=true` - Solo obtener conteo

#### **4. GET /telar/server/artisan-shops/:shopId** 🟢 BAJA
**Uso:** Obtener tienda por ID (menos común, se usa más por userId)
**Consideración:** Útil cuando ya tienes el shopId

---

## 📊 **ARCHIVOS CRÍTICOS A MIGRAR**

### **🔴 Alta Prioridad (7 archivos):**

#### **1. `src/context/MasterAgentContext.tsx`**
- **5 operaciones:**
  - SELECT logo_url para módulo 'marca'
  - SELECT * para módulo 'tienda'
  - SELECT id para módulo 'inventario'
  - SELECT id, shop_name para verificación
  - UPDATE shop_name, description (EventBus)
- **Necesita:** GET + PATCH

#### **2. `src/utils/syncBrandToShop.ts`**
- **3 operaciones:**
  - SELECT para verificar tienda existente
  - INSERT para crear nueva tienda
  - UPDATE para sincronizar logo, colors, brand_claim
- **Necesita:** GET + POST + PATCH

#### **3. `src/hooks/useFixedTasksManager.ts`**
- **1 operación:**
  - SELECT campos específicos (hero_config, logo_url, etc.)
- **Necesita:** GET

#### **4. `src/utils/systemIntegrityValidator.ts`**
- **1 operación:**
  - SELECT * para validación de integridad
- **Necesita:** GET

#### **5. `src/hooks/useDebugArtisanData.ts`**
- **1 operación:**
  - DELETE en función reset
- **Necesita:** DELETE

#### **6. `src/utils/dataRepair.ts`**
- **Operaciones:** SELECT para reparación de datos
- **Necesita:** GET + PATCH

#### **7. `src/hooks/useTaskReconciliation.ts`**
- **Operaciones:** SELECT para reconciliación
- **Necesita:** GET

---

### **🟡 Media Prioridad (15+ archivos):**

**Wizards de configuración:**
- `src/components/shop/wizards/HeroSliderWizard.tsx`
- `src/components/shop/wizards/AboutWizard.tsx`
- `src/components/shop/wizards/ContactWizard.tsx`
- `src/components/shop/wizards/SocialLinksWizard.tsx`
- `src/components/shop/wizards/ArtisanProfileWizard.tsx`

**Hooks de shop:**
- `src/hooks/useArtisanShop.ts` (8 referencias)
- `src/hooks/useAutoHeroGeneration.ts`
- `src/hooks/useProductPublish.ts`
- `src/hooks/useShopPublish.ts`

**Admin/Stats:**
- `src/hooks/useAdminShops.ts`
- `src/hooks/useAdminStats.ts` (5 referencias - count, filtros)

**Páginas públicas:**
- `src/pages/PublicShopPageNew.tsx`
- `src/pages/PublicShopAbout.tsx`
- `src/pages/PublicShopContact.tsx`

---

### **🟢 Baja Prioridad (50+ archivos):**

- Edge Functions (Supabase backend - 20 archivos)
- Componentes de UI (modals, cards, etc.)
- Páginas de moderación y admin
- Hooks de detección y clasificación
- Utilidades de búsqueda y SEO

---

## 📈 **ESTADÍSTICAS**

| Categoría | Archivos | % |
|-----------|----------|---|
| **Alta Prioridad** | 7 | 9% |
| **Media Prioridad** | 15 | 20% |
| **Baja Prioridad** | 52 | 70% |
| **TOTAL** | 74 | 100% |

### **Operaciones Detectadas:**

| Operación | Cantidad Estimada | Prioridad |
|-----------|------------------|-----------|
| **SELECT** | ~60 | 🔴 Alta |
| **UPDATE** | ~10 | 🔴 Alta |
| **INSERT** | ~5 | 🟡 Media |
| **DELETE** | ~2 | 🟡 Media |
| **COUNT** | ~5 | 🟡 Media |

---

## 🎯 **RECOMENDACIÓN DE ENDPOINTS A CREAR**

### **Fase 1 - CRÍTICOS (Implementar primero):**

1. **PATCH /telar/server/artisan-shops/:shopId** 🔴
   - Request: `UpdateArtisanShopPayload` (todos los campos opcionales)
   - Response: `ArtisanShop` actualizado
   - Usado en: 10+ archivos

2. **DELETE /telar/server/artisan-shops/:shopId** 🟡
   - Response: Success message
   - Usado en: Debug/Reset functions

### **Fase 2 - ADMIN/ESTADÍSTICAS (Opcional pero útil):**

3. **GET /telar/server/artisan-shops** 🟡
   - Query params: `?active=true&marketplace_approval_status=pending&count=true`
   - Response: Array de `ArtisanShop[]` o `{ count: number }`
   - Usado en: Admin panels, stats

4. **GET /telar/server/artisan-shops/:shopId** 🟢
   - Response: `ArtisanShop`
   - Útil para operaciones por ID directo

---

## 🔑 **MAPEO DE CAMPOS (snake_case → camelCase)**

**Principales campos a mapear:**

| Base de Datos | TypeScript |
|---------------|------------|
| `user_id` | `userId` |
| `shop_name` | `shopName` |
| `shop_slug` | `shopSlug` |
| `logo_url` | `logoUrl` |
| `banner_url` | `bannerUrl` |
| `craft_type` | `craftType` |
| `contact_info` | `contactInfo` |
| `social_links` | `socialLinks` |
| `seo_data` | `seoData` |
| `privacy_level` | `privacyLevel` |
| `data_classification` | `dataClassification` |
| `public_profile` | `publicProfile` |
| `creation_status` | `creationStatus` |
| `creation_step` | `creationStep` |
| `primary_colors` | `primaryColors` |
| `secondary_colors` | `secondaryColors` |
| `brand_claim` | `brandClaim` |
| `hero_config` | `heroConfig` |
| `about_content` | `aboutContent` |
| `contact_config` | `contactConfig` |
| `active_theme_id` | `activeThemeId` |
| `publish_status` | `publishStatus` |
| `marketplace_approved` | `marketplaceApproved` |
| `marketplace_approved_at` | `marketplaceApprovedAt` |
| `marketplace_approved_by` | `marketplaceApprovedBy` |
| `id_contraparty` | `idContraparty` |
| `artisan_profile` | `artisanProfile` |
| `artisan_profile_completed` | `artisanProfileCompleted` |
| `bank_data_status` | `bankDataStatus` |
| `marketplace_approval_status` | `marketplaceApprovalStatus` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

---

## 📋 **PLAN DE MIGRACIÓN SUGERIDO**

### **Opción A: Migración Completa (Recomendado si tienes endpoints listos)**

1. ✅ Crear tipos y servicios (YA HECHO)
2. ⏳ Solicitar/crear endpoint PATCH (CRÍTICO)
3. ⏳ Solicitar/crear endpoint DELETE (si necesario)
4. 🔄 Migrar 7 archivos de alta prioridad (~15 operaciones)
5. 🔄 Migrar 15 archivos de media prioridad (~25 operaciones)
6. 🔄 Opcional: Migrar archivos de baja prioridad

### **Opción B: Migración Progresiva (Si endpoints no están listos)**

1. ✅ Crear tipos y servicios (YA HECHO)
2. 🔄 Migrar solo lecturas (SELECT) en archivos críticos (~10 archivos)
3. ⏸️ Esperar endpoints PATCH/DELETE
4. 🔄 Migrar escrituras cuando endpoints estén listos

---

## ⚠️ **ENDPOINTS FALTANTES DETECTADOS**

**Para completar la migración necesitas:**

1. **PATCH /telar/server/artisan-shops/:shopId** 🔴 URGENTE
   - Sin este endpoint no se pueden migrar las actualizaciones
   - Afecta 10+ archivos críticos

2. **DELETE /telar/server/artisan-shops/:shopId** 🟡 IMPORTANTE
   - Necesario para funciones de reset/debug
   - Afecta 2 archivos

3. **GET /telar/server/artisan-shops (lista)** 🟡 OPCIONAL
   - Para admin panels y estadísticas
   - Afecta 5 archivos de admin

---

## ✅ **ESTADO ACTUAL**

- ✅ Tipos TypeScript creados (35+ campos)
- ✅ Servicio con GET y POST creado
- ✅ Helper functions (hasShop, upsert) creadas
- ⏳ Falta endpoint PATCH para completar migración
- ⏳ Falta endpoint DELETE (opcional para debug)
- ⏳ Falta endpoint GET lista (opcional para admin)

---

## 🚀 **PRÓXIMOS PASOS**

### **INMEDIATO:**
1. **Solicitar endpoint PATCH** al backend:
   - `PATCH /telar/server/artisan-shops/:shopId`
   - Request: Partial de todos los campos
   - Response: Shop actualizado

2. **Opcional: Solicitar DELETE** (si planeas migrar debug tools):
   - `DELETE /telar/server/artisan-shops/:shopId`
   - Response: Success message

3. **Comenzar migración** de archivos críticos:
   - `MasterAgentContext.tsx` (5 operaciones)
   - `syncBrandToShop.ts` (3 operaciones)
   - `useFixedTasksManager.ts` (1 operación)

### **VALIDACIÓN:**
- Probar GET por userId
- Probar POST para crear tienda
- Probar PATCH cuando esté disponible
- Verificar mapeo de campos (snake_case → camelCase)

---

**Archivos críticos a migrar:** 7 (Alta prioridad)  
**Endpoints necesarios:** 2 (PATCH + DELETE)  
**Tiempo estimado:** 2-3 horas (con endpoints listos)
